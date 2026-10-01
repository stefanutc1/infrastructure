# ESP32 Datacenter Rack Environment & Thermal Monitor

**Author**: Moană Ștefănuț-Cornel ([@stefanutc1](https://github.com/stefanutc1))  
**Platform**: ESP32-WROOM-32  
**Network Segment**: VLAN 50 (`192.168.50.0/24` — IoT & Physical Edge)  
**Scrape Endpoint**: `http://192.168.50.15/metrics` (Prometheus port 80)  
**MQTT Broker**: `192.168.20.10:1883` (VLAN 20 Home Assistant / Mosquitto)

---

## 1. Overview & Capabilities

The **Datacenter Rack Thermal Monitor** is an edge appliance monitoring physical environmental metrics for the server rack:
- **Precision Environmental Sensing**: Bosch BME280 sensor measuring ambient temperature (°C), relative humidity (%), and barometric pressure (hPa).
- **Cold-Aisle / Hot-Aisle Delta-T**: Dual Dallas DS18B20 digital probes placed at the rack front intake and rear exhaust to compute Delta-T efficiency.
- **Autonomous Noctua 4-Pin PWM Fan Control**: 25 kHz hardware PWM signal on `GPIO 18` dynamically regulating fan speed based on exhaust temperature curves, with tachometer feedback on `GPIO 19`.
- **Embedded Native Prometheus Exporter**: Lightweight embedded HTTP server directly exposing OpenMetrics format at `/metrics` for Prometheus scraping without intermediary gateways.
- **Visual Alerting**: Multi-color RGB LED (`GPIO 25/26/27`) providing immediate visual status (Green = Nominal, Amber = Elevated >28°C, Red = Critical >35°C).

---

## 2. Pinout Matrix

| ESP32 Pin | Peripheral Pin | Function | Notes |
| :--- | :--- | :--- | :--- |
| **`GPIO 21`** (SDA) | BME280 SDA | I2C Data Line | 3.3V Logic |
| **`GPIO 22`** (SCL) | BME280 SCL | I2C Clock Line | 3.3V Logic |
| **`GPIO 4`** | DS18B20 Data | 1-Wire Bus (Intake & Exhaust) | External 4.7kΩ pull-up to 3.3V |
| **`GPIO 18`** | Noctua PWM (Blue) | 25 kHz PWM Duty Control | 3.3V Logic Level |
| **`GPIO 19`** | Noctua Tach (Green) | Fan Speed RPM Interrupt | Internal Pull-Up, 2 pulses/rev |
| **`GPIO 25`** | RGB LED Red | Critical Alert Indicator | Current limiting resistor 220Ω |
| **`GPIO 26`** | RGB LED Green | Nominal State Indicator | Current limiting resistor 220Ω |
| **`GPIO 27`** | RGB LED Blue | Diagnostic Indicator | Current limiting resistor 220Ω |

---

## 3. Prometheus Scrape Configuration (`prometheus.yml`)

Add the following scrape job to Prometheus on Node 1 (`CT 104`):

```yaml
scrape_configs:
  - job_name: 'esp32_rack_thermal'
    scrape_interval: 15s
    static_configs:
      - targets: ['192.168.50.15:80']
        labels:
          environment: 'production'
          location: 'rack_node_1'
```
