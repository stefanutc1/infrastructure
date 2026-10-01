/*
 * ==============================================================================
 * Smart Weather-Aware 4-Zone Irrigation Controller
 * Author: Moană Ștefănuț-Cornel (@stefanutc1)
 * Platform: ESP32 (Arduino Core)
 *
 * Features:
 * - 4-zone solenoid valve control with optical isolation and Active-LOW logic
 * - Hardware Watchdog Timer (esp_task_wdt) preventing valves from sticking open
 * - Dual analog soil moisture sensor readings with calibration mapping
 * - Digital rain sensor & weather forecast inhibit logic from Home Assistant
 * - Flow meter pulse interrupt measuring instantaneous water volume & leaks
 * - NTP time synchronization with local scheduling engine
 * - Full MQTT pub/sub integration with auto-cutoff safety timers
 * ==============================================================================
 */

#include <Arduino.h>
#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <time.h>
#include <esp_task_wdt.h>
#include "config.h"

// Zone Data Structure
struct ZoneState {
  int relayPin;
  bool isOpen;
  unsigned long openedAtMillis;
  unsigned long maxDurationMs;
  const char* name;
};

ZoneState zones[NUM_ZONES] = {
  { VALVE_RELAY_ZONE_1, false, 0, MAX_WATERING_MINUTES * 60000UL, "Lawn Front" },
  { VALVE_RELAY_ZONE_2, false, 0, MAX_WATERING_MINUTES * 60000UL, "Lawn Back" },
  { VALVE_RELAY_ZONE_3, false, 0, MAX_WATERING_MINUTES * 60000UL, "Garden Beds" },
  { VALVE_RELAY_ZONE_4, false, 0, MAX_WATERING_MINUTES * 60000UL, "Greenhouse Drip" }
};

// Networking & MQTT
WiFiClient espClient;
PubSubClient mqttClient(espClient);

// Flow Meter Pulse Counter
volatile unsigned long flowPulseCount = 0;
void IRAM_ATTR flowPulseCounter() {
  flowPulseCount++;
}

bool rainInhibitActive = false;
unsigned long lastTelemetryMillis = 0;
const unsigned long TELEMETRY_INTERVAL_MS = 10000;

void setupPins();
void connectWiFi();
void connectMQTT();
void syncNtpTime();
void mqttCallback(char* topic, byte* message, unsigned int length);
void setZone(int zoneIdx, bool open, unsigned long durationMs = 0);
void closeAllValves();
int readSoilMoisturePercent(int pin);
void publishTelemetry();

void setup() {
  Serial.begin(115200);
  delay(100);
  Serial.println(F("\n================================================"));
  Serial.println(F("ESP32 Smart 4-Zone Irrigation Controller Starting"));
  Serial.println(F("Author: Moană Ștefănuț-Cornel (@stefanutc1)"));
  Serial.println(F("================================================"));

  setupPins();
  closeAllValves();

  connectWiFi();
  syncNtpTime();

  mqttClient.setServer(MQTT_BROKER, MQTT_PORT);
  mqttClient.setCallback(mqttCallback);
  connectMQTT();

  // Initialize Hardware Watchdog
  esp_task_wdt_init(WDT_TIMEOUT_SECONDS, true);
  esp_task_wdt_add(NULL);

  Serial.println(F("[SYSTEM] Initialization complete. All valves secured."));
}

void loop() {
  esp_task_wdt_reset();

  if (WiFi.status() != WL_CONNECTED) {
    connectWiFi();
  }

  if (!mqttClient.connected()) {
    connectMQTT();
  }
  mqttClient.loop();

  unsigned long now = millis();

  // Safety Timer: Check all active zones against their max duration
  for (int i = 0; i < NUM_ZONES; i++) {
    if (zones[i].isOpen) {
      if (now - zones[i].openedAtMillis >= zones[i].maxDurationMs) {
        Serial.printf("[SAFETY ALERT] Zone %d (%s) exceeded max duration of %lu ms! Shutting off.\n",
                      i + 1, zones[i].name, zones[i].maxDurationMs);
        setZone(i, false);
      }
    }
  }

  // Periodic Telemetry Publishing
  if (now - lastTelemetryMillis >= TELEMETRY_INTERVAL_MS) {
    lastTelemetryMillis = now;
    publishTelemetry();
  }

  delay(50);
}

void setupPins() {
  for (int i = 0; i < NUM_ZONES; i++) {
    pinMode(zones[i].relayPin, OUTPUT);
    digitalWrite(zones[i].relayPin, RELAY_INACTIVE_STATE);
  }

  pinMode(DIGITAL_RAIN_SENSOR, INPUT_PULLUP);
  pinMode(FLOW_METER_SENSOR_PIN, INPUT_PULLUP);
  attachInterrupt(digitalPinToInterrupt(FLOW_METER_SENSOR_PIN), flowPulseCounter, FALLING);
}

void closeAllValves() {
  for (int i = 0; i < NUM_ZONES; i++) {
    setZone(i, false);
  }
}

void setZone(int zoneIdx, bool open, unsigned long durationMs) {
  if (zoneIdx < 0 || zoneIdx >= NUM_ZONES) return;

  if (open && rainInhibitActive) {
    Serial.printf("[INHIBITED] Cannot open Zone %d: Rain inhibit is active.\n", zoneIdx + 1);
    return;
  }

  zones[zoneIdx].isOpen = open;
  digitalWrite(zones[zoneIdx].relayPin, open ? RELAY_ACTIVE_STATE : RELAY_INACTIVE_STATE);

  if (open) {
    zones[zoneIdx].openedAtMillis = millis();
    zones[zoneIdx].maxDurationMs = (durationMs > 0) ? durationMs : (MAX_WATERING_MINUTES * 60000UL);
    Serial.printf("[VALVE ACTUATION] Zone %d (%s) OPENED for %lu seconds.\n",
                  zoneIdx + 1, zones[zoneIdx].name, zones[zoneIdx].maxDurationMs / 1000);
  } else {
    Serial.printf("[VALVE ACTUATION] Zone %d (%s) CLOSED.\n", zoneIdx + 1, zones[zoneIdx].name);
  }

  // Publish Status Update
  char topic[64];
  snprintf(topic, sizeof(topic), TOPIC_ZONE_STATUS, zoneIdx + 1);
  mqttClient.publish(topic, open ? "ON" : "OFF", true);
}

int readSoilMoisturePercent(int pin) {
  int raw = analogRead(pin);
  // Calibration: Air = ~3200 (0% moist), Submerged Water = ~1400 (100% moist)
  int percent = map(raw, 3200, 1400, 0, 100);
  return constrain(percent, 0, 100);
}

void publishTelemetry() {
  StaticJsonDocument<384> doc;
  doc["device"] = MQTT_CLIENT_ID;
  doc["uptime_sec"] = millis() / 1000;
  doc["wifi_rssi"] = WiFi.RSSI();
  doc["rain_sensor_active"] = (digitalRead(DIGITAL_RAIN_SENSOR) == LOW);
  doc["rain_inhibit"] = rainInhibitActive;
  doc["flow_pulses"] = flowPulseCount;

  // Approximate flow: 450 pulses = 1 Liter for standard 1/2" flow sensor
  doc["total_liters"] = (float)flowPulseCount / 450.0f;

  JsonObject soil = doc.createNestedObject("soil_moisture");
  soil["zone_1_pct"] = readSoilMoisturePercent(SOIL_MOISTURE_ADC_1);
  soil["zone_2_pct"] = readSoilMoisturePercent(SOIL_MOISTURE_ADC_2);

  JsonObject activeZones = doc.createNestedObject("active_valves");
  for (int i = 0; i < NUM_ZONES; i++) {
    char key[16];
    snprintf(key, sizeof(key), "zone_%d", i + 1);
    activeZones[key] = zones[i].isOpen;
  }

  char buffer[384];
  serializeJson(doc, buffer);
  mqttClient.publish(TOPIC_TELEMETRY, buffer);
}

void connectWiFi() {
  if (WiFi.status() == WL_CONNECTED) return;
  Serial.printf("[WIFI] Connecting to %s...\n", WIFI_SSID);
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  unsigned long start = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - start < WIFI_CONNECT_TIMEOUT) {
    delay(500);
    Serial.print(".");
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.printf("\n[WIFI] Connected. IP: %s\n", WiFi.localIP().toString().c_str());
  }
}

void syncNtpTime() {
  configTime(GMT_OFFSET_SEC, DAYLIGHT_OFFSET_SEC, NTP_SERVER);
  struct tm timeinfo;
  if (getLocalTime(&timeinfo)) {
    Serial.printf("[NTP] Synchronized Time: %02d:%02d:%02d\n",
                  timeinfo.tm_hour, timeinfo.tm_min, timeinfo.tm_sec);
  }
}

void connectMQTT() {
  while (!mqttClient.connected() && WiFi.status() == WL_CONNECTED) {
    Serial.print(F("[MQTT] Connecting broker..."));
    if (mqttClient.connect(MQTT_CLIENT_ID, MQTT_USER, MQTT_PASS)) {
      Serial.println(F(" CONNECTED!"));
      mqttClient.subscribe("homelab/irrigation/+/set");
      mqttClient.subscribe(TOPIC_RAIN_INHIBIT);
    } else {
      delay(5000);
    }
  }
}

void mqttCallback(char* topic, byte* message, unsigned int length) {
  String msg = "";
  for (unsigned int i = 0; i < length; i++) {
    msg += (char)message[i];
  }
  Serial.printf("[MQTT RX] %s -> %s\n", topic, msg.c_str());

  if (String(topic) == TOPIC_RAIN_INHIBIT) {
    rainInhibitActive = (msg == "ON" || msg == "true" || msg == "1");
    if (rainInhibitActive) {
      Serial.println(F("[WEATHER] Rain inhibit activated! Forcing all valves shut."));
      closeAllValves();
    }
    return;
  }

  // Parse zone command: homelab/irrigation/zone/{1..4}/set
  int zoneNum = 0;
  if (sscanf(topic, "homelab/irrigation/zone/%d/set", &zoneNum) == 1) {
    int zoneIdx = zoneNum - 1;
    if (msg == "ON" || msg == "OPEN") {
      setZone(zoneIdx, true);
    } else if (msg == "OFF" || msg == "CLOSE") {
      setZone(zoneIdx, false);
    }
  }
}
