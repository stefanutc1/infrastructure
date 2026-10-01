#ifndef FOOTPRINT_CONFIG_H
#define FOOTPRINT_CONFIG_H

// ==============================================================================
// Footprint & Biometric Gate Access Controller Configuration
// Author: Moană Ștefănuț-Cornel (@stefanutc1)
// Architecture: ESP32-WROOM-32 / NodeMCU-32S
// Network: VLAN 50 (IoT & Physical Edge)
// ==============================================================================

// WiFi Configuration
#define WIFI_SSID             "Datacenter-IoT"
#define WIFI_PASSWORD         "SecureIoTPassphrase"
#define WIFI_CONNECT_TIMEOUT  15000 // ms

// MQTT Broker Configuration
#define MQTT_BROKER           "192.168.20.10" // Home Assistant / Mosquitto on VLAN 20
#define MQTT_PORT             1883
#define MQTT_CLIENT_ID        "esp32-footprint-gate"
#define MQTT_USER             "homelab_iot"
#define MQTT_PASS             "HomelabMqttPassword2026"

// MQTT Topics
#define TOPIC_PRESENCE_STATE  "homelab/sensors/footprint/presence"
#define TOPIC_DISTANCE_RAW    "homelab/sensors/footprint/distance_cm"
#define TOPIC_ACCESS_EVENT    "homelab/access/gate/event"
#define TOPIC_GATE_COMMAND    "homelab/access/gate/set"
#define TOPIC_DEVICE_STATUS   "homelab/devices/footprint/status"

// Optical Fingerprint Sensor (UART2)
#define FINGERPRINT_RX_PIN    16 // Connect to Sensor TX (Green)
#define FINGERPRINT_TX_PIN    17 // Connect to Sensor RX (White)
#define FINGERPRINT_BAUD      57600

// Ultrasonic Distance Sensor (HC-SR04)
#define ULTRASONIC_TRIG_PIN   5
#define ULTRASONIC_ECHO_PIN   18
#define PRESENCE_THRESHOLD_CM 80 // Presence detected if distance < 80cm

// PIR Motion Sensor
#define PIR_SENSOR_PIN        19

// 12V Solenoid Gate Relay & Status Indicators
#define GATE_RELAY_PIN        23 // Active HIGH / Optocoupler relay
#define GATE_PULSE_MS         1500 // 1.5 seconds pulse to unlock
#define BUZZER_PIN            4  // Piezo buzzer
#define STATUS_LED_PIN        2  // Onboard blue LED

// OLED Display (SSD1306 128x64 I2C)
#define OLED_SDA_PIN          21
#define OLED_SCL_PIN          22
#define OLED_I2C_ADDR         0x3C

// Watchdog Timer
#define WDT_TIMEOUT_SECONDS   12

#endif // FOOTPRINT_CONFIG_H
