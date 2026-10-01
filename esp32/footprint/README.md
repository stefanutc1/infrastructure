# ESP32 Footprint Presence & Biometric Gate Access Controller

**Author**: Moană Ștefănuț-Cornel ([@stefanutc1](https://github.com/stefanutc1))  
**Platform**: ESP32-WROOM-32 / NodeMCU-32S  
**Network Segment**: VLAN 50 (`192.168.50.0/24` — IoT & Physical Edge)  
**MQTT Broker**: `192.168.20.10:1883` (VLAN 20 Home Assistant / Mosquitto)

---

## 1. Overview & Capabilities

The **Footprint Gate Access Controller** is an edge microcontroller node providing dual-layer room presence tracking and physical biometric security:
- **Dual-Layer Presence Detection**: Combines a digital PIR motion sensor (`GPIO 19`) with an ultrasonic distance sensor (`HC-SR04` on `GPIO 5/18`) to filter out false positives.
- **Biometric Optical Scanner**: High-speed UART2 communication (`GPIO 16/17`) with an Adafruit-compatible optical fingerprint module (R307/R504) storing up to 1,000 enrolled templates.
- **12V Solenoid Gate Relay**: Hardware optocoupler-isolated relay (`GPIO 23`) firing a precise 1,500ms unlocking pulse with an automatic safety cut-off.
- **SSD1306 128x64 OLED**: Real-time display of door status, scan feedback, Wi-Fi RSSI, and IP address.
- **Home Assistant Auto-Discovery**: Automatically provisions entity sensors on MQTT without manual YAML configuration.

---

## 2. Hardware Wiring & Pinout Matrix

| ESP32 Pin | Peripheral Pin | Function | Electrical Characteristic |
| :--- | :--- | :--- | :--- |
| **`GPIO 16`** (RX2) | Fingerprint TX (Green) | UART2 Data Receive | 3.3V Logic |
| **`GPIO 17`** (TX2) | Fingerprint RX (White) | UART2 Data Transmit | 3.3V Logic |
| **`GPIO 5`** | HC-SR04 Trig | Ultrasonic Trigger Pulse | 3.3V Output (10µs pulse) |
| **`GPIO 18`** | HC-SR04 Echo | Ultrasonic Return Pulse | 5V to 3.3V Voltage Divider (1kΩ / 2kΩ) |
| **`GPIO 19`** | PIR Sensor Out | Digital Motion State | Active HIGH (3.3V) |
| **`GPIO 23`** | Relay IN | Solenoid Lock Actuation | Active HIGH (Optocoupler input) |
| **`GPIO 4`** | Piezo Buzzer (+) | Acoustic Feedback | PWM Square Wave |
| **`GPIO 21`** (SDA) | SSD1306 OLED SDA | I2C Bus Data | 3.3V I2C (4.7kΩ pull-up) |
| **`GPIO 22`** (SCL) | SSD1306 OLED SCL | I2C Bus Clock | 3.3V I2C (4.7kΩ pull-up) |
| **`VIN / 5V`** | 5V Power Bus | System Power | 5V DC 2A Regulated Adapter |
| **`GND`** | Ground Bus | Common Reference | Common Ground across all sensors |

---

## 3. MQTT Topics & Message Payloads

### 3.1 Presence State (`homelab/sensors/footprint/presence`)
```json
{
  "presence": true,
  "distance_cm": 42,
  "pir": 1,
  "timestamp": 1284920
}
```

### 3.2 Access Event (`homelab/access/gate/event`)
```json
{
  "status": "GRANTED",
  "user_id": 1,
  "timestamp": 1285010
}
```

### 3.3 Remote Unlock Command (`homelab/access/gate/set`)
Send payload `"UNLOCK"` or `"OPEN"` to trigger gate actuation remotely from Home Assistant or authorized automation scripts.

---

## 4. Software Dependencies & Flashing

Install the following libraries via the Arduino IDE Library Manager or PlatformIO:
- `Adafruit GFX Library`
- `Adafruit SSD1306`
- `Adafruit Fingerprint Sensor Library`
- `PubSubClient` (Nick O'Leary)
- `ArduinoJson` (v6 or v7)

### Flashing Command (esptool)
```bash
arduino-cli compile --fqbn esp32:esp32:esp32 footprint.ino
arduino-cli upload -p /dev/ttyUSB0 --fqbn esp32:esp32:esp32 footprint.ino
```
