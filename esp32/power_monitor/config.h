#ifndef POWER_MONITOR_CONFIG_H
#define POWER_MONITOR_CONFIG_H

// ==============================================================================
// Datacenter Mains & UPS Battery Power Monitor Configuration
// Author: Moană Ștefănuț-Cornel (@stefanutc1)
// Architecture: ESP32-WROOM-32
// Network: VLAN 50 (IoT & Physical Edge)
// ==============================================================================

#define WIFI_SSID               "Datacenter-IoT"
#define WIFI_PASSWORD           "SecureIoTPassphrase"
#define WIFI_CONNECT_TIMEOUT    15000 // ms

#define MQTT_BROKER             "192.168.20.10"
#define MQTT_PORT               1883
#define MQTT_CLIENT_ID          "esp32-power-ups-monitor"
#define MQTT_USER               "homelab_iot"
#define MQTT_PASS               "HomelabMqttPassword2026"

// MQTT Topics
#define TOPIC_POWER_TELEMETRY   "homelab/power/telemetry"
#define TOPIC_POWER_ALERT       "homelab/power/alert/mains_cut"
#define TOPIC_EMERGENCY_SHUTDOWN "homelab/power/emergency_shutdown"

// Pin Definitions
#define MAINS_OPTO_DETECT_PIN   23  // Optocoupler input: HIGH when 230V AC present, LOW on cut
#define UPS_BATTERY_ADC_PIN     36  // ADC1_CH0 (VP) through voltage divider (0-20V range)
#define SHUNT_TRIP_RELAY_PIN    18  // Emergency cutoff relay to isolate non-critical loads
#define BUZZER_ALARM_PIN        4   // High-decibel piezo alert

// INA219 Current & Voltage Sensor (I2C)
#define INA219_SDA_PIN          21
#define INA219_SCL_PIN          22
#define INA219_I2C_ADDR         0x40

#define HTTP_SERVER_PORT        80
#define WDT_TIMEOUT_SECONDS     12

// Calibration Factors
#define BATTERY_VOLTAGE_DIVIDER_RATIO 6.06f // (R1=51k, R2=10k)
#define LOW_BATTERY_THRESHOLD_V       11.4f // Trigger shutdown if battery < 11.4V

#endif // POWER_MONITOR_CONFIG_H
