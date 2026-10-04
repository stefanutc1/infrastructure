<div align="center">

# ESP32 Smart 4-Zone Weather-Aware Irrigation Controller

</div>

**Author**: Moană Ștefănuț-Cornel ([@stefanutc1](https://github.com/stefanutc1))  
**Platform**: ESP32-WROOM-32  
**Network Segment**: VLAN 50 (`192.168.50.0/24` — IoT & Physical Edge)  
**MQTT Broker**: `192.168.20.10:1883` (VLAN 20 Home Assistant / Mosquitto)

---

<div align="center">

## 1. Overview & Architecture

</div>

The **Smart Irrigation Controller** automates garden and lawn watering with fail-safe safety mechanisms:
- **4 Optically Isolated Zones**: Controls 12V / 24V AC/DC solenoid valves via an Active-LOW 4-channel relay module.
- **Fail-Safe Hardware Watchdog**: Includes `esp_task_wdt` and software hard limits (max 15 minutes continuous runtime) ensuring that a frozen MCU or broken connection cannot flood the property.
- **Capacitive Soil Moisture Probes**: ADC-calibrated corrosion-resistant probes (Zone 1 & Zone 2) prevent watering already saturated soil.
- **Weather-Aware Inhibit**: Listens to rain gauge interrupts (`GPIO 32`) and Home Assistant OpenWeatherMap precipitation flags on `homelab/irrigation/rain_inhibit`.
- **Flow Meter Leak Detection**: Measures water volume via a Hall-effect turbine sensor (`GPIO 33`), providing real-time liter metering and burst pipe protection.

---

<div align="center">

## 2. GPIO Pinout & Electrical Connections

</div>

| ESP32 Pin | Function | Peripheral Connection | Notes |
| :--- | :--- | :--- | :--- |
| **`GPIO 23`** | Zone 1 Valve Relay | Solenoid Valve 1 (Lawn Front) | Active LOW, Optocoupled |
| **`GPIO 22`** | Zone 2 Valve Relay | Solenoid Valve 2 (Lawn Back) | Active LOW, Optocoupled |
| **`GPIO 21`** | Zone 3 Valve Relay | Solenoid Valve 3 (Garden Beds)| Active LOW, Optocoupled |
| **`GPIO 19`** | Zone 4 Valve Relay | Solenoid Valve 4 (Greenhouse) | Active LOW, Optocoupled |
| **`GPIO 34`** (ADC1) | Analog Soil Moisture 1| Capacitive Probe v1.2 Zone 1 | 3.3V Analog Input |
| **`GPIO 35`** (ADC1) | Analog Soil Moisture 2| Capacitive Probe v1.2 Zone 2 | 3.3V Analog Input |
| **`GPIO 32`** | Digital Rain Sensor | Optical/Tipping Rain Gauge | Internal Pull-Up, Active LOW |
| **`GPIO 33`** | Water Flow Pulse IN | YF-S201 Hall Effect Sensor | External 10kΩ pull-up, ~450 pulses/L |

---

<div align="center">

## 3. MQTT Control Topics & Payloads

</div>

| Topic | Direction | Payload Example | Description |
| :--- | :--- | :--- | :--- |
| `homelab/irrigation/zone/1/set` | Subscriber | `"ON"` / `"OFF"` | Manually toggle Zone 1 valve |
| `homelab/irrigation/zone/2/set` | Subscriber | `"ON"` / `"OFF"` | Manually toggle Zone 2 valve |
| `homelab/irrigation/rain_inhibit` | Subscriber | `"ON"` / `"OFF"` | Home Assistant weather freeze command |
| `homelab/irrigation/zone/1/state` | Publisher | `"ON"` / `"OFF"` | Live operational confirmation |
| `homelab/irrigation/telemetry` | Publisher | JSON Object | Comprehensive periodic metrics |

<div align="center">

### Example Telemetry Payload

</div>
```json
{
  "device": "esp32-irrigation-controller",
  "uptime_sec": 3840,
  "wifi_rssi": -62,
  "rain_sensor_active": false,
  "rain_inhibit": false,
  "flow_pulses": 1820,
  "total_liters": 4.04,
  "soil_moisture": {
    "zone_1_pct": 58,
    "zone_2_pct": 64
  },
  "active_valves": {
    "zone_1": true,
    "zone_2": false,
    "zone_3": false,
    "zone_4": false
  }
}
```
