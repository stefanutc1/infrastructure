/*
 * ==============================================================================
 * Footprint Presence Sensor & Biometric Gate Access Controller
 * Author: Moană Ștefănuț-Cornel (@stefanutc1)
 * Platform: ESP32 (Espressif IoT Development Framework / Arduino Core)
 *
 * Capabilities:
 * - Dual-layer presence detection: PIR motion + HC-SR04 ultrasonic distance
 * - Optical biometric fingerprint verification (Adafruit R307/R504 library)
 * - 12V Solenoid gate relay lock/unlock pulse with hardware safety timeout
 * - SSD1306 128x64 OLED user interface displaying IP, RSSI, and scan feedback
 * - MQTT telemetry publishing with Home Assistant MQTT discovery format
 * - Hardware Watchdog Timer (esp_task_wdt) for fail-safe 24/7 reliability
 * ==============================================================================
 */

#include <Arduino.h>
#include <WiFi.h>
#include <PubSubClient.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <Adafruit_Fingerprint.h>
#include <ArduinoJson.h>
#include <esp_task_wdt.h>
#include "config.h"

// Hardware Serial 2 for Fingerprint Sensor
HardwareSerial fpSerial(2);
Adafruit_Fingerprint finger = Adafruit_Fingerprint(&fpSerial);

// OLED Display instance
Adafruit_SSD1306 display(128, 64, &Wire, -1);

// Networking & MQTT
WiFiClient espClient;
PubSubClient mqttClient(espClient);

// Operational State Tracking
bool lastPresenceState = false;
unsigned long lastSensorPollTime = 0;
unsigned long lastMqttHeartbeatTime = 0;
const unsigned long SENSOR_POLL_INTERVAL_MS = 250;
const unsigned long HEARTBEAT_INTERVAL_MS = 30000;

void setupOled();
void setupFingerprint();
void connectWiFi();
void connectMQTT();
void publishHomeAssistantDiscovery();
void mqttCallback(char* topic, byte* message, unsigned int length);
long measureDistanceCm();
void triggerGateRelay(int authorizedId);
void playTone(int frequency, int durationMs);

void setup() {
  Serial.begin(115200);
  delay(100);
  Serial.println(F("\n================================================"));
  Serial.println(F("ESP32 Footprint & Gate Access Controller Starting"));
  Serial.println(F("Author: Moană Ștefănuț-Cornel (@stefanutc1)"));
  Serial.println(F("================================================"));

  // Initialize GPIO Pins
  pinMode(GATE_RELAY_PIN, OUTPUT);
  digitalWrite(GATE_RELAY_PIN, LOW); // Fail-safe: locked

  pinMode(BUZZER_PIN, OUTPUT);
  digitalWrite(BUZZER_PIN, LOW);

  pinMode(STATUS_LED_PIN, OUTPUT);
  digitalWrite(STATUS_LED_PIN, LOW);

  pinMode(ULTRASONIC_TRIG_PIN, OUTPUT);
  pinMode(ULTRASONIC_ECHO_PIN, INPUT);
  digitalWrite(ULTRASONIC_TRIG_PIN, LOW);

  pinMode(PIR_SENSOR_PIN, INPUT);

  // Initialize OLED Display
  setupOled();

  // Initialize Biometric Scanner
  setupFingerprint();

  // Connect to Network
  connectWiFi();

  // Configure MQTT
  mqttClient.setServer(MQTT_BROKER, MQTT_PORT);
  mqttClient.setCallback(mqttCallback);
  connectMQTT();
  publishHomeAssistantDiscovery();

  // Initialize Hardware Watchdog
  esp_task_wdt_init(WDT_TIMEOUT_SECONDS, true);
  esp_task_wdt_add(NULL);

  playTone(2000, 150);
  Serial.println(F("[SYSTEM] Initialization Complete. Entering loop."));
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

  unsigned long currentMillis = millis();

  // Periodic Sensor Polling (PIR + Ultrasonic)
  if (currentMillis - lastSensorPollTime >= SENSOR_POLL_INTERVAL_MS) {
    lastSensorPollTime = currentMillis;

    int pirState = digitalRead(PIR_SENSOR_PIN);
    long distanceCm = measureDistanceCm();

    bool currentPresence = (pirState == HIGH) || (distanceCm > 0 && distanceCm < PRESENCE_THRESHOLD_CM);

    if (currentPresence != lastPresenceState) {
      lastPresenceState = currentPresence;
      Serial.printf("[SENSOR] Presence state changed: %s (Dist: %ld cm, PIR: %d)\n",
                    currentPresence ? "OCCUPIED" : "CLEAR", distanceCm, pirState);

      // Publish Presence via MQTT
      StaticJsonDocument<128> doc;
      doc["presence"] = currentPresence;
      doc["distance_cm"] = distanceCm;
      doc["pir"] = pirState;
      doc["timestamp"] = currentMillis;

      char buffer[128];
      serializeJson(doc, buffer);
      mqttClient.publish(TOPIC_PRESENCE_STATE, buffer, true);

      // Update OLED
      display.clearDisplay();
      display.setCursor(0, 0);
      display.println(F("Footprint Sensor"));
      display.drawLine(0, 10, 128, 10, SSD1306_WHITE);
      display.setCursor(0, 16);
      display.printf("Status: %s\n", currentPresence ? "OCCUPIED" : "CLEAR");
      display.printf("Distance: %ld cm\n", distanceCm);
      display.printf("WiFi RSSI: %d dBm\n", WiFi.RSSI());
      display.display();
    }
  }

  // Poll Biometric Fingerprint Sensor
  uint8_t p = finger.getImage();
  if (p == FINGERPRINT_OK) {
    p = finger.image2Tz();
    if (p == FINGERPRINT_OK) {
      p = finger.fastSearch();
      if (p == FINGERPRINT_OK) {
        Serial.printf("[ACCESS GRANTED] Finger ID #%d found! Confidence: %d\n",
                      finger.fingerID, finger.confidence);
        triggerGateRelay(finger.fingerID);
      } else {
        Serial.println(F("[ACCESS DENIED] Fingerprint not recognized."));
        playTone(500, 400);

        StaticJsonDocument<128> doc;
        doc["status"] = "DENIED";
        doc["reason"] = "UNKNOWN_FINGERPRINT";
        char buffer[128];
        serializeJson(doc, buffer);
        mqttClient.publish(TOPIC_ACCESS_EVENT, buffer);
      }
    }
  }

  // Periodic Telemetry Heartbeat
  if (currentMillis - lastMqttHeartbeatTime >= HEARTBEAT_INTERVAL_MS) {
    lastMqttHeartbeatTime = currentMillis;

    StaticJsonDocument<256> doc;
    doc["device"] = MQTT_CLIENT_ID;
    doc["ip"] = WiFi.localIP().toString();
    doc["rssi"] = WiFi.RSSI();
    doc["uptime_sec"] = currentMillis / 1000;
    doc["free_heap"] = ESP.getFreeHeap();
    doc["fingerprints_stored"] = finger.capacity;

    char buffer[256];
    serializeJson(doc, buffer);
    mqttClient.publish(TOPIC_DEVICE_STATUS, buffer, true);
  }

  delay(20);
}

long measureDistanceCm() {
  digitalWrite(ULTRASONIC_TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(ULTRASONIC_TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(ULTRASONIC_TRIG_PIN, LOW);

  long duration = pulseIn(ULTRASONIC_ECHO_PIN, HIGH, 30000); // 30ms timeout (~5m max)
  if (duration == 0) return -1;
  return duration * 0.034 / 2;
}

void triggerGateRelay(int authorizedId) {
  playTone(2500, 100);
  delay(100);
  playTone(3000, 150);

  // Update display
  display.clearDisplay();
  display.setCursor(0, 10);
  display.println(F("ACCESS GRANTED"));
  display.printf("Welcome, User #%d\n", authorizedId);
  display.println(F("Gate Unlocked..."));
  display.display();

  // Publish Event
  StaticJsonDocument<128> doc;
  doc["status"] = "GRANTED";
  doc["user_id"] = authorizedId;
  doc["timestamp"] = millis();
  char buffer[128];
  serializeJson(doc, buffer);
  mqttClient.publish(TOPIC_ACCESS_EVENT, buffer);

  // Actuate 12V Solenoid Gate Relay
  digitalWrite(GATE_RELAY_PIN, HIGH);
  digitalWrite(STATUS_LED_PIN, HIGH);
  delay(GATE_PULSE_MS);
  digitalWrite(GATE_RELAY_PIN, LOW);
  digitalWrite(STATUS_LED_PIN, LOW);

  display.clearDisplay();
  display.setCursor(0, 20);
  display.println(F("Gate Locked."));
  display.display();
}

void playTone(int frequency, int durationMs) {
  ledcAttachPin(BUZZER_PIN, 0);
  ledcWriteTone(0, frequency);
  delay(durationMs);
  ledcWriteTone(0, 0);
  ledcDetachPin(BUZZER_PIN);
}

void setupOled() {
  Wire.begin(OLED_SDA_PIN, OLED_SCL_PIN);
  if (!display.begin(SSD1306_SWITCHCAPVCC, OLED_I2C_ADDR)) {
    Serial.println(F("[OLED] SSD1306 allocation failed. Continuing headless."));
    return;
  }
  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(0, 10);
  display.println(F("Footprint Gate"));
  display.println(F("Booting firmware..."));
  display.display();
}

void setupFingerprint() {
  fpSerial.begin(FINGERPRINT_BAUD, SERIAL_8N1, FINGERPRINT_RX_PIN, FINGERPRINT_TX_PIN);
  finger.begin(FINGERPRINT_BAUD);

  if (finger.verifyPassword()) {
    Serial.println(F("[FINGERPRINT] Optical sensor authenticated successfully."));
    finger.getParameters();
    Serial.printf("[FINGERPRINT] Capacity: %d templates.\n", finger.capacity);
  } else {
    Serial.println(F("[FINGERPRINT] Optical sensor NOT found. Verify wiring."));
  }
}

void connectWiFi() {
  if (WiFi.status() == WL_CONNECTED) return;

  Serial.printf("[WIFI] Connecting to SSID: %s\n", WIFI_SSID);
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  unsigned long start = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - start < WIFI_CONNECT_TIMEOUT) {
    delay(500);
    Serial.print(".");
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.printf("\n[WIFI] Connected! Assigned IP: %s\n", WiFi.localIP().toString().c_str());
  } else {
    Serial.println(F("\n[WIFI] Connection failed. Will retry."));
  }
}

void connectMQTT() {
  while (!mqttClient.connected() && WiFi.status() == WL_CONNECTED) {
    Serial.print(F("[MQTT] Attempting connection to broker..."));
    if (mqttClient.connect(MQTT_CLIENT_ID, MQTT_USER, MQTT_PASS)) {
      Serial.println(F(" CONNECTED!"));
      mqttClient.subscribe(TOPIC_GATE_COMMAND);
    } else {
      Serial.printf(" FAILED, rc=%d. Retrying in 5 seconds...\n", mqttClient.state());
      delay(5000);
    }
  }
}

void mqttCallback(char* topic, byte* message, unsigned int length) {
  String msg = "";
  for (unsigned int i = 0; i < length; i++) {
    msg += (char)message[i];
  }
  Serial.printf("[MQTT RX] Topic: %s | Payload: %s\n", topic, msg.c_str());

  if (String(topic) == TOPIC_GATE_COMMAND) {
    if (msg == "UNLOCK" || msg == "OPEN") {
      triggerGateRelay(999); // Remote API Unlock ID
    }
  }
}

void publishHomeAssistantDiscovery() {
  // Discovery for Binary Sensor: Presence
  const char* discTopic = "homeassistant/binary_sensor/footprint_presence/config";
  StaticJsonDocument<384> doc;
  doc["name"] = "Room Presence";
  doc["state_topic"] = TOPIC_PRESENCE_STATE;
  doc["value_template"] = "{{ value_json.presence }}";
  doc["payload_on"] = "true";
  doc["payload_off"] = "false";
  doc["device_class"] = "occupancy";
  doc["unique_id"] = "esp32_footprint_presence";

  JsonObject dev = doc.createNestedObject("device");
  dev["identifiers"][0] = "esp32_footprint_controller";
  dev["name"] = "ESP32 Footprint & Gate Access";
  dev["model"] = "ESP32-WROOM-32";
  dev["manufacturer"] = "Homelab Hardware Lab (@stefanutc1)";

  char buffer[384];
  serializeJson(doc, buffer);
  mqttClient.publish(discTopic, buffer, true);
}
