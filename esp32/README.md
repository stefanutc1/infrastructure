# ESP32 Edge Systems & Physical Telemetry Suite

**Platform Architect**: Moană Ștefănuț-Cornel ([@stefanutc1](https://github.com/stefanutc1))  
**Academic Affiliation**: Universitatea din Craiova · FEAA — Informatică Economică (2024 – 2027)  
**Engineering Experience**: Hands-on Software & Systems Engineering since 2015  
**Network Segment**: VLAN 50 (`192.168.50.0/24` — Isolated IoT & Hardware Edge)  
**Central Telemetry Broker**: Mosquitto / Home Assistant (`192.168.20.10:1883`)

---

## 1. Overview & Edge Architecture

The `esp32/` directory houses the complete bare-metal firmware suite powering edge sensing, environmental control, biometric physical security, and datacenter hardware safety. Each project is engineered as an autonomous, fail-safe edge node:

```mermaid
flowchart TB
    subgraph VLAN50["Isolated Physical Edge & IoT Network (VLAN 50: 192.168.50.0/24)"]
        direction LR
        NODE_GATE["<b>1. Footprint & Gate Node</b><br/>ESP32 · R307 Biometrics<br/>PIR + Ultrasonic · 12V Solenoid<br/>IP: 192.168.50.14"]
        NODE_IRR["<b>2. Smart Irrigation Node</b><br/>ESP32 · 4-Zone Solenoids<br/>Soil Moisture · Flow Meter<br/>IP: 192.168.50.12"]
        NODE_ENV["<b>3. Rack Thermal Monitor</b><br/>ESP32 · BME280 + Dual DS18B20<br/>Noctua 25kHz PWM Fan Control<br/>IP: 192.168.50.15 (:80/metrics)"]
        NODE_PWR["<b>4. Power & UPS Safety Node</b><br/>ESP32 · 230V Opto Mains<br/>12V Battery ADC · INA219 Meter<br/>IP: 192.168.50.16 (:80/metrics)"]
    end

    subgraph CORE_SERVICES["Core Infrastructure (VLAN 20: 192.168.20.0/24)"]
        HASS["Home Assistant Core (CT 100)<br/>MQTT Auto-Discovery & Automation"]
        PROM["Prometheus TSDB (CT 104)<br/>Direct HTTP /metrics Scrapes"]
        PVE["Proxmox VE 9.2 (Node 1)<br/>Graceful UPS Powerdown Agent"]
    end

    NODE_GATE ==>|"MQTT: homelab/access/gate"| HASS
    NODE_IRR ==>|"MQTT: homelab/irrigation"| HASS
    NODE_ENV ==>|"MQTT Telemetry"| HASS
    NODE_ENV ==>|"HTTP GET /metrics (15s)"| PROM
    NODE_PWR ==>|"HTTP GET /metrics (15s)"| PROM
    NODE_PWR ==>|"Zero-Latency MQTT Alert"| PVE
```

---

## 2. Project Directory Structure

```text
esp32/
├── README.md                           # Master suite documentation
├── hardware_telemetry_daemon.py        # Python host-side serial/MQTT ingestion bridge
├── firmware/
│   └── i2c_bus_recovery.c              # Bare-metal I2C 9-clock register recovery driver
├── footprint/                          # Biometric physical gate & room presence controller
│   ├── footprint.ino                   # Production Arduino C++ sketch
│   ├── config.h                        # GPIO pinouts, MQTT topics & thresholds
│   ├── sensor.cpp / sensor.h           # Biometric optical fingerprint sensor drivers
│   ├── gate.cpp / gate.h               # 12V solenoid relay control with safety watchdog
│   └── README.md                       # Electrical wiring & Home Assistant configuration
├── irrigation/                         # Smart weather-aware 4-zone irrigation controller
│   ├── irrigation.ino                  # Production Arduino C++ sketch
│   ├── config.h                        # Relay pins, ADC moisture calibration & safety limits
│   ├── valve.cpp / control.cpp         # Valve actuation & fail-safe automatic shutoff
│   ├── ore.cpp / vreme.cpp             # RTC scheduler & soil moisture logic
│   ├── config.yaml / sector_1.yaml     # Declarative zone mapping specifications
│   └── README.md                       # Plumbing safety, flow meter wiring & topics
├── datacenter_environment/             # Server rack thermal & environmental controller
│   ├── datacenter_environment.ino      # Production Arduino C++ sketch
│   ├── config.h                        # BME280, DS18B20 1-Wire & 25kHz PWM fan pinouts
│   └── README.md                       # Prometheus scrape config & Noctua fan curve
└── power_monitor/                      # Datacenter mains AC & UPS battery safety monitor
    ├── power_monitor.ino               # Production Arduino C++ sketch
    ├── config.h                        # Optocoupler interrupt, INA219 I2C & battery divider
    └── README.md                       # High-voltage safety guidelines & emergency shutdown
```

---

## 3. Engineering Safety Standards Across All Firmware

1. **Hardware Watchdog Timers (`esp_task_wdt`)**: Every sketch initializes the hardware watchdog timer (`12–15 seconds`). If an event loop freezes or an I2C transaction stalls, the microcontroller automatically reboots into a known safe state.
2. **Fail-Safe Solenoid Relay States**:
   - Gate solenoid relay defaults to **LOCKED** (`LOW`).
   - Irrigation valves default to **CLOSED** (`HIGH` on Active-LOW optocoupled relay boards).
   - Maximum watering duration is hard-coded to **15 minutes** in software, preventing flooding even if network connection drops while a valve is open.
3. **Network Isolation**: All ESP32 devices reside strictly in **VLAN 50 (IoT & Physical Edge)**. Inter-VLAN routing is governed by OPNsense stateful packet filtering (`pf`), blocking direct access to Management (VLAN 10) or WAN.
4. **Native Prometheus Support**: Environment and Power nodes serve standard OpenMetrics format directly on HTTP port 80, eliminating the need for third-party serial polling bridges.
