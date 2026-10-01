#ifndef IRRIGATION_CONFIG_H
#define IRRIGATION_CONFIG_H

// ==============================================================================
// Smart 4-Zone Weather-Aware Irrigation Controller
// Author: Moană Ștefănuț-Cornel (@stefanutc1)
// Architecture: ESP32-WROOM-32
// Network: VLAN 50 (IoT & Physical Edge)
// ==============================================================================

// WiFi Configuration
#define WIFI_SSID               "Datacenter-IoT"
#define WIFI_PASSWORD           "SecureIoTPassphrase"
#define WIFI_CONNECT_TIMEOUT    15000 // ms

// MQTT Broker Configuration
#define MQTT_BROKER             "192.168.20.10"
#define MQTT_PORT               1883
#define MQTT_CLIENT_ID          "esp32-irrigation-controller"
#define MQTT_USER               "homelab_iot"
#define MQTT_PASS               "HomelabMqttPassword2026"

// MQTT Topics
#define TOPIC_ZONE_COMMAND      "homelab/irrigation/zone/+/set"
#define TOPIC_ZONE_STATUS       "homelab/irrigation/zone/%d/state"
#define TOPIC_TELEMETRY         "homelab/irrigation/telemetry"
#define TOPIC_RAIN_INHIBIT      "homelab/irrigation/rain_inhibit"

// Zone Solenoid Relays (Active LOW for standard optocoupled 4-relay board)
#define NUM_ZONES               4
#define VALVE_RELAY_ZONE_1      23 // Lawn Front
#define VALVE_RELAY_ZONE_2      22 // Lawn Back
#define VALVE_RELAY_ZONE_3      21 // Garden Beds
#define VALVE_RELAY_ZONE_4      19 // Drip Line Greenhouse
#define RELAY_ACTIVE_STATE      LOW
#define RELAY_INACTIVE_STATE    HIGH

// Safety Constraints
#define MAX_WATERING_MINUTES    15    // Hard fail-safe: automatically cuts off if open > 15m
#define DRY_RUN_DEFAULT         false // If true, only log without pulling GPIOs

// Sensors
#define SOIL_MOISTURE_ADC_1     34 // ADC1_CH6 (Analog Soil Moisture Zone 1)
#define SOIL_MOISTURE_ADC_2     35 // ADC1_CH7 (Analog Soil Moisture Zone 2)
#define DIGITAL_RAIN_SENSOR     32 // Active LOW when rain detected
#define FLOW_METER_SENSOR_PIN   33 // Pulse counter for hall-effect water flow meter

// Watchdog Timer
#define WDT_TIMEOUT_SECONDS     15

// NTP Time Configuration
#define NTP_SERVER              "pool.ntp.org"
#define GMT_OFFSET_SEC          7200  // UTC+2 (Eastern European Time)
#define DAYLIGHT_OFFSET_SEC     3600  // Summer time +1h

#endif // IRRIGATION_CONFIG_H
