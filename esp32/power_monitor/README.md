# ESP32 Datacenter Mains & UPS Battery Power Monitor

**Author**: Moană Ștefănuț-Cornel ([@stefanutc1](https://github.com/stefanutc1))  
**Platform**: ESP32-WROOM-32  
**Network Segment**: VLAN 50 (`192.168.50.0/24` — IoT & Physical Edge)  
**Scrape Endpoint**: `http://192.168.50.16/metrics` (Prometheus port 80)  
**MQTT Broker**: `192.168.20.10:1883` (VLAN 20 Home Assistant / Mosquitto)

---

## 1. Overview & Capabilities

The **Datacenter Power & UPS Monitor** is an edge safety telemetry appliance designed to prevent catastrophic data loss during power outages:
- **Instantaneous Grid Failure Detection**: Optocoupler-isolated 230V AC mains sensing (`GPIO 23`) firing an immediate hardware interrupt when utility power drops.
- **High-Priority MQTT Outage Broadcast**: Publishes retain alert on `homelab/power/alert/mains_cut`, allowing Home Assistant and Proxmox VE agents to initiate immediate non-essential container shedding.
- **Battery Depletion & Automated Hypervisor Shutdown**: Monitored 12V Lead-Acid / LiFePO4 battery bank voltage via calibrated ADC divider (`GPIO 36`). If battery falls below 11.4V, the unit broadcasts `homelab/power/emergency_shutdown` to trigger graceful vzdump snapshotting and host power-down.
- **INA219 Digital Power Meter**: Tracks real-time DC voltage, load current (A), and power dissipation (W) over I2C (`GPIO 21/22`).
- **Prometheus Metric Export**: Serves OpenMetrics natively at `/metrics`.

---

## 2. Pinout Matrix & Schematic Connections

| ESP32 Pin | Peripheral Connection | Function | Safety / Isolation |
| :--- | :--- | :--- | :--- |
| **`GPIO 23`** | AC Optocoupler OUT | Mains 230V AC Detection | 5,000V RMS Galvanic Isolation |
| **`GPIO 36`** (ADC1) | Battery Voltage Divider | 12V Battery Bank Telemetry | R1=51kΩ, R2=10kΩ (Ratio: 6.06:1) |
| **`GPIO 18`** | Shunt Trip Relay | Non-Critical Load Shedding | 10A Optocoupled Relay |
| **`GPIO 4`** | Piezo Alarm Buzzer | Acoustic Power Loss Alarm | Active Piezo Buzzer |
| **`GPIO 21`** (SDA) | INA219 SDA | I2C Power Data | 3.3V Logic Level |
| **`GPIO 22`** (SCL) | INA219 SCL | I2C Power Clock | 3.3V Logic Level |

---

## 3. High-Voltage Electrical Safety Notice

> [!WARNING]
> AC mains monitoring interfaces with 230V utility electricity. Ensure the AC optocoupler module is enclosed in a certified DIN-rail flame-retardant housing with minimum 8mm creepage distance. Never touch live wiring during installation.
