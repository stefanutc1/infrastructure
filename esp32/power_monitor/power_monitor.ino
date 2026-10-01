/*
 * ==============================================================================
 * Datacenter Mains & UPS Battery Power Monitor
 * Author: Moană Ștefănuț-Cornel (@stefanutc1)
 * Platform: ESP32 (Arduino Core)
 *
 * Capabilities:
 * - Real-time AC mains presence detection via zero-latency optocoupler interrupt
 * - Instantaneous MQTT alert broadcasting when grid power is lost
 * - 12V Lead-Acid / LiFePO4 battery bank voltage tracking via calibrated ADC
 * - INA219 digital power sensor measuring DC voltage, current (A), and power (W)
 * - Automated emergency graceful shutdown trigger for Proxmox VE hypervisors
 * - Native Prometheus metrics endpoint at `/metrics`
 * ==============================================================================
 */

#include <Arduino.h>
#include <WiFi.h>
#include <WebServer.h>
#include <PubSubClient.h>
#include <Wire.h>
#include <Adafruit_INA219.h>
#include <ArduinoJson.h>
#include <esp_task_wdt.h>
#include "config.h"

Adafruit_INA219 ina219(INA219_I2C_ADDR);
WiFiClient espClient;
PubSubClient mqttClient(espClient);
WebServer server(HTTP_SERVER_PORT);

// State Tracking
volatile bool mainsPowerOk = true;
volatile bool mainsStateChanged = false;

void IRAM_ATTR mainsDetectIsr() {
  bool currentState = (digitalRead(MAINS_OPTO_DETECT_PIN) == HIGH);
  if (currentState != mainsPowerOk) {
    mainsPowerOk = currentState;
    mainsStateChanged = true;
  }
}

float batteryVoltage = 0.0;
float busVoltage_V = 0.0;
float current_mA = 0.0;
float power_mW = 0.0;

unsigned long lastSampleMillis = 0;
unsigned long lastMqttMillis = 0;

void setupPins();
void connectWiFi();
void connectMQTT();
void setupHttpMetrics();
float readBatteryVoltage();
void publishPowerAlert(bool powerLost);

void setup() {
  Serial.begin(115200);
  delay(100);
  Serial.println(F("\n================================================"));
  Serial.println(F("ESP32 Datacenter Power & UPS Monitor Starting"));
  Serial.println(F("Author: Moană Ștefănuț-Cornel (@stefanutc1)"));
  Serial.println(F("================================================"));

  setupPins();

  Wire.begin(INA219_SDA_PIN, INA219_SCL_PIN);
  if (!ina219.begin()) {
    Serial.println(F("[SENSOR] INA219 power chip not detected. Check I2C."));
  }

  connectWiFi();
  setupHttpMetrics();
  server.begin();

  mqttClient.setServer(MQTT_BROKER, MQTT_PORT);
  connectMQTT();

  esp_task_wdt_init(WDT_TIMEOUT_SECONDS, true);
  esp_task_wdt_add(NULL);
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
  server.handleClient();

  // Instantaneous Mains Alert Handling
  if (mainsStateChanged) {
    mainsStateChanged = false;
    Serial.printf("[POWER EVENT] AC Mains status changed! State: %s\n",
                  mainsPowerOk ? "ONLINE (RESTORED)" : "OFFLINE (GRID LOSS!)");
    publishPowerAlert(!mainsPowerOk);
  }

  unsigned long now = millis();

  // Every 1 second: Sample ADC & Power Chip
  if (now - lastSampleMillis >= 1000) {
    lastSampleMillis = now;

    batteryVoltage = readBatteryVoltage();
    busVoltage_V = ina219.getBusVoltage_V();
    current_mA = ina219.getCurrent_mA();
    power_mW = ina219.getPower_mW();

    // Critical Battery Depletion Check
    if (!mainsPowerOk && batteryVoltage < LOW_BATTERY_THRESHOLD_V && batteryVoltage > 5.0) {
      Serial.println(F("[EMERGENCY] Battery critically depleted! Broadcasting hypervisor shutdown."));
      mqttClient.publish(TOPIC_EMERGENCY_SHUTDOWN, "CRITICAL_BATTERY_SHUTDOWN_NOW", true);
    }
  }

  // Every 5 seconds: Publish Telemetry
  if (now - lastMqttMillis >= 5000) {
    lastMqttMillis = now;

    StaticJsonDocument<256> doc;
    doc["mains_online"] = mainsPowerOk;
    doc["battery_v"] = batteryVoltage;
    doc["load_v"] = busVoltage_V;
    doc["load_current_a"] = current_mA / 1000.0f;
    doc["load_power_w"] = power_mW / 1000.0f;
    doc["wifi_rssi"] = WiFi.RSSI();

    char buffer[256];
    serializeJson(doc, buffer);
    mqttClient.publish(TOPIC_POWER_TELEMETRY, buffer);
  }

  delay(20);
}

void setupPins() {
  pinMode(MAINS_OPTO_DETECT_PIN, INPUT_PULLUP);
  mainsPowerOk = (digitalRead(MAINS_OPTO_DETECT_PIN) == HIGH);
  attachInterrupt(digitalPinToInterrupt(MAINS_OPTO_DETECT_PIN), mainsDetectIsr, CHANGE);

  pinMode(SHUNT_TRIP_RELAY_PIN, OUTPUT);
  digitalWrite(SHUNT_TRIP_RELAY_PIN, LOW);

  pinMode(BUZZER_ALARM_PIN, OUTPUT);
  digitalWrite(BUZZER_ALARM_PIN, LOW);
}

float readBatteryVoltage() {
  int raw = analogRead(UPS_BATTERY_ADC_PIN);
  float pinVoltage = (raw / 4095.0f) * 3.3f;
  return pinVoltage * BATTERY_VOLTAGE_DIVIDER_RATIO;
}

void publishPowerAlert(bool powerLost) {
  if (powerLost) {
    digitalWrite(BUZZER_ALARM_PIN, HIGH);
    mqttClient.publish(TOPIC_POWER_ALERT, "GRID_POWER_LOST", true);
  } else {
    digitalWrite(BUZZER_ALARM_PIN, LOW);
    mqttClient.publish(TOPIC_POWER_ALERT, "GRID_POWER_RESTORED", true);
  }
}

void setupHttpMetrics() {
  server.on("/metrics", HTTP_GET, []() {
    String m = "";
    m += "# HELP datacenter_mains_status 1 if AC grid is present, 0 if on battery\n";
    m += "# TYPE datacenter_mains_status gauge\n";
    m += "datacenter_mains_status " + String(mainsPowerOk ? 1 : 0) + "\n\n";

    m += "# HELP datacenter_ups_battery_volts Measured DC battery bank voltage\n";
    m += "# TYPE datacenter_ups_battery_volts gauge\n";
    m += "datacenter_ups_battery_volts " + String(batteryVoltage, 2) + "\n\n";

    m += "# HELP datacenter_load_power_watts Active DC power drawn by load\n";
    m += "# TYPE datacenter_load_power_watts gauge\n";
    m += "datacenter_load_power_watts " + String(power_mW / 1000.0f, 2) + "\n\n";

    m += "# HELP datacenter_load_current_amperes DC load current\n";
    m += "# TYPE datacenter_load_current_amperes gauge\n";
    m += "datacenter_load_current_amperes " + String(current_mA / 1000.0f, 3) + "\n";

    server.send(200, "text/plain; version=0.0.4", m);
  });
}

void connectWiFi() {
  if (WiFi.status() == WL_CONNECTED) return;
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  unsigned long start = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - start < WIFI_CONNECT_TIMEOUT) {
    delay(500);
  }
}

void connectMQTT() {
  while (!mqttClient.connected() && WiFi.status() == WL_CONNECTED) {
    if (mqttClient.connect(MQTT_CLIENT_ID, MQTT_USER, MQTT_PASS)) {
      Serial.println(F("[MQTT] Power monitor connected."));
    } else {
      delay(5000);
    }
  }
}
