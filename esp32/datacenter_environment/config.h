#ifndef DATACENTER_ENV_CONFIG_H
#define DATACENTER_ENV_CONFIG_H

// ==============================================================================
// Datacenter Rack Environment & Thermal Monitor Configuration
// Author: Moană Ștefănuț-Cornel (@stefanutc1)
// Architecture: ESP32-WROOM-32
// Network: VLAN 50 (IoT & Physical Edge)
// ==============================================================================

#define WIFI_SSID               "Datacenter-IoT"
#define WIFI_PASSWORD           "SecureIoTPassphrase"
#define WIFI_CONNECT_TIMEOUT    15000 // ms

#define MQTT_BROKER             "192.168.20.10"
#define MQTT_PORT               1883
#define MQTT_CLIENT_ID          "esp32-rack-thermal-monitor"
#define MQTT_USER               "homelab_iot"
#define MQTT_PASS               "HomelabMqttPassword2026"

// MQTT Topics
#define TOPIC_RACK_TELEMETRY    "homelab/telemetry/rack/environment"
#define TOPIC_FAN_OVERRIDE      "homelab/cooling/fan/override"

// Pin Assignments
#define BME280_SDA_PIN          21
#define BME280_SCL_PIN          22
#define ONE_WIRE_BUS_PIN        4   // DS18B20 1-Wire data bus (Intake & Exhaust probes)

#define FAN_PWM_PIN             18  // 4-Pin 12V Noctua PWM control (25 kHz)
#define FAN_TACH_PIN            19  // Fan tachometer RPM pulse input

#define RGB_LED_RED_PIN         25
#define RGB_LED_GREEN_PIN       26
#define RGB_LED_BLUE_PIN        27

#define HTTP_SERVER_PORT        80  // Native Prometheus metrics exporter endpoint (/metrics)

#define WDT_TIMEOUT_SECONDS     15

#endif // DATACENTER_ENV_CONFIG_H
