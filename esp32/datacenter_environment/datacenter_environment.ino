/*
 * ==============================================================================
 * Datacenter Rack Environment & Thermal Monitor
 * Author: Moană Ștefănuț-Cornel (@stefanutc1)
 * Platform: ESP32 (Arduino Core)
 *
 * Capabilities:
 * - BME280 precision ambient temperature, relative humidity, and atmospheric pressure
 * - Dual DS18B20 digital probes monitoring cold-aisle intake and hot-aisle exhaust
 * - Delta-T computation (Exhaust - Intake) triggering autonomous Noctua 4-pin PWM curve
 * - Embedded HTTP server serving a native Prometheus `/metrics` scrape endpoint
 * - MQTT telemetry stream with Home Assistant auto-discovery
 * - RGB status indicator LED (Green: <27°C, Amber: 28-34°C, Red: >35°C critical)
 * ==============================================================================
 */

#include <Arduino.h>
#include <WiFi.h>
#include <WebServer.h>
#include <PubSubClient.h>
#include <Wire.h>
#include <Adafruit_Sensor.h>
#include <Adafruit_BME280.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include <ArduinoJson.h>
#include <esp_task_wdt.h>
#include "config.h"

Adafruit_BME280 bme;
OneWire oneWire(ONE_WIRE_BUS_PIN);
DallasTemperature dsSensors(&oneWire);

WiFiClient espClient;
PubSubClient mqttClient(espClient);
WebServer server(HTTP_SERVER_PORT);

// Tachometer Interrupt
volatile unsigned long tachPulses = 0;
void IRAM_ATTR tachCounter() {
  tachPulses++;
}

float ambientTemp = 0.0;
float ambientHumidity = 0.0;
float ambientPressure = 0.0;
float intakeTemp = 0.0;
float exhaustTemp = 0.0;
float deltaT = 0.0;
int currentFanPwmPercent = 35;
int currentFanRpm = 0;

unsigned long lastTachSampleTime = 0;
unsigned long lastMqttPubTime = 0;

void setupPins();
void connectWiFi();
void connectMQTT();
void setupSensors();
void setupHttpMetrics();
void computeFanPwmCurve();
void updateRgbStatus();

void setup() {
  Serial.begin(115200);
  delay(100);
  Serial.println(F("\n================================================"));
  Serial.println(F("ESP32 Datacenter Thermal Monitor Starting"));
  Serial.println(F("Author: Moană Ștefănuț-Cornel (@stefanutc1)"));
  Serial.println(F("================================================"));

  setupPins();
  setupSensors();
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

  unsigned long now = millis();

  // Every 2 seconds: Sample Sensors & Compute Fan Curve
  if (now - lastTachSampleTime >= 2000) {
    // Compute RPM: 2 pulses per revolution
    unsigned long pulses = tachPulses;
    tachPulses = 0;
    currentFanRpm = (pulses * 60) / (2 * 2);
    lastTachSampleTime = now;

    // Read BME280
    ambientTemp = bme.readTemperature();
    ambientHumidity = bme.readHumidity();
    ambientPressure = bme.readPressure() / 100.0F;

    // Read DS18B20 Probes
    dsSensors.requestTemperatures();
    intakeTemp = dsSensors.getTempCByIndex(0);
    exhaustTemp = dsSensors.getTempCByIndex(1);
    deltaT = exhaustTemp - intakeTemp;

    computeFanPwmCurve();
    updateRgbStatus();
  }

  // Every 10 seconds: Publish MQTT Telemetry
  if (now - lastMqttPubTime >= 10000) {
    lastMqttPubTime = now;

    StaticJsonDocument<384> doc;
    doc["device"] = MQTT_CLIENT_ID;
    doc["ambient_temp_c"] = ambientTemp;
    doc["humidity_pct"] = ambientHumidity;
    doc["pressure_hpa"] = ambientPressure;
    doc["intake_temp_c"] = intakeTemp;
    doc["exhaust_temp_c"] = exhaustTemp;
    doc["delta_t_c"] = deltaT;
    doc["fan_pwm_pct"] = currentFanPwmPercent;
    doc["fan_rpm"] = currentFanRpm;
    doc["rssi"] = WiFi.RSSI();

    char buffer[384];
    serializeJson(doc, buffer);
    mqttClient.publish(TOPIC_RACK_TELEMETRY, buffer);
  }

  delay(20);
}

void setupPins() {
  pinMode(FAN_PWM_PIN, OUTPUT);
  // Configure 25kHz PWM on LEDC channel 0 (8-bit resolution: 0-255)
  ledcSetup(0, 25000, 8);
  ledcAttachPin(FAN_PWM_PIN, 0);
  ledcWrite(0, 85); // 33% baseline speed

  pinMode(FAN_TACH_PIN, INPUT_PULLUP);
  attachInterrupt(digitalPinToInterrupt(FAN_TACH_PIN), tachCounter, FALLING);

  pinMode(RGB_LED_RED_PIN, OUTPUT);
  pinMode(RGB_LED_GREEN_PIN, OUTPUT);
  pinMode(RGB_LED_BLUE_PIN, OUTPUT);
}

void setupSensors() {
  Wire.begin(BME280_SDA_PIN, BME280_SCL_PIN);
  if (!bme.begin(0x76, &Wire)) {
    Serial.println(F("[SENSOR] BME280 initialization failed. Check wiring."));
  }
  dsSensors.begin();
}

void computeFanPwmCurve() {
  // If exhaust > 35°C or delta-T > 8°C, ramp fan to 100%
  if (exhaustTemp >= 35.0 || deltaT >= 8.0) {
    currentFanPwmPercent = 100;
  } else if (exhaustTemp >= 30.0) {
    currentFanPwmPercent = 70;
  } else if (exhaustTemp >= 26.0) {
    currentFanPwmPercent = 45;
  } else {
    currentFanPwmPercent = 25; // Silent baseline
  }

  int dutyCycle = map(currentFanPwmPercent, 0, 100, 0, 255);
  ledcWrite(0, dutyCycle);
}

void updateRgbStatus() {
  if (exhaustTemp >= 35.0) {
    // Red: Critical
    digitalWrite(RGB_LED_RED_PIN, HIGH);
    digitalWrite(RGB_LED_GREEN_PIN, LOW);
    digitalWrite(RGB_LED_BLUE_PIN, LOW);
  } else if (exhaustTemp >= 28.0) {
    // Amber: Elevated
    digitalWrite(RGB_LED_RED_PIN, HIGH);
    digitalWrite(RGB_LED_GREEN_PIN, HIGH);
    digitalWrite(RGB_LED_BLUE_PIN, LOW);
  } else {
    // Green: Nominal
    digitalWrite(RGB_LED_RED_PIN, LOW);
    digitalWrite(RGB_LED_GREEN_PIN, HIGH);
    digitalWrite(RGB_LED_BLUE_PIN, LOW);
  }
}

void setupHttpMetrics() {
  server.on("/metrics", HTTP_GET, []() {
    String m = "";
    m += "# HELP rack_ambient_temperature_celsius Ambient room temperature\n";
    m += "# TYPE rack_ambient_temperature_celsius gauge\n";
    m += "rack_ambient_temperature_celsius " + String(ambientTemp, 2) + "\n\n";

    m += "# HELP rack_humidity_percent Relative humidity in rack\n";
    m += "# TYPE rack_humidity_percent gauge\n";
    m += "rack_humidity_percent " + String(ambientHumidity, 2) + "\n\n";

    m += "# HELP rack_intake_temperature_celsius Cold-aisle intake probe\n";
    m += "# TYPE rack_intake_temperature_celsius gauge\n";
    m += "rack_intake_temperature_celsius " + String(intakeTemp, 2) + "\n\n";

    m += "# HELP rack_exhaust_temperature_celsius Hot-aisle exhaust probe\n";
    m += "# TYPE rack_exhaust_temperature_celsius gauge\n";
    m += "rack_exhaust_temperature_celsius " + String(exhaustTemp, 2) + "\n\n";

    m += "# HELP rack_delta_t_celsius Exhaust minus intake temperature\n";
    m += "# TYPE rack_delta_t_celsius gauge\n";
    m += "rack_delta_t_celsius " + String(deltaT, 2) + "\n\n";

    m += "# HELP rack_cooling_fan_rpm Measured tachometer fan RPM\n";
    m += "# TYPE rack_cooling_fan_rpm gauge\n";
    m += "rack_cooling_fan_rpm " + String(currentFanRpm) + "\n\n";

    m += "# HELP rack_cooling_fan_pwm_percent Fan speed duty cycle\n";
    m += "# TYPE rack_cooling_fan_pwm_percent gauge\n";
    m += "rack_cooling_fan_pwm_percent " + String(currentFanPwmPercent) + "\n";

    server.send(200, "text/plain; version=0.0.4", m);
  });

  server.on("/", HTTP_GET, []() {
    server.send(200, "text/html", "<h2>ESP32 Datacenter Thermal Monitor</h2><p><a href='/metrics'>/metrics</a></p>");
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
      mqttClient.subscribe(TOPIC_FAN_OVERRIDE);
    } else {
      delay(5000);
    }
  }
}
