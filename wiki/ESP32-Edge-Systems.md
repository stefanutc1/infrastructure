# ESP32 Edge Systems

## 1. Automated Irrigation Controller (`esp32/irrigation/`)

Microcontroller firmware for weather-aware, scheduled valve actuation.

### Source Files & Responsibilities
- `main.cpp` — Main polling loop, sensor sampling, and WiFi watchdog.
- `control.cpp` — Solenoid valve actuation via digital relay pins with fail-safe automatic shutoff.
- `ore.cpp` — Real-time clock (RTC) schedule engine.
- `vreme.cpp` — Soil moisture and weather telemetry integration; inhibits watering if recent precipitation exceeded threshold.
- `logger.cpp` / `logger.h` — Serial and network syslog logging abstraction.

### Hardware Mapping (`config.yaml`)
```yaml
pins:
  relay_valve_zone1: 23
  relay_valve_zone2: 22
  soil_moisture_analog: 34
  rain_sensor_digital: 35
```

---

## 2. Footprint Presence Sensor (`esp32/footprint/`)

Presence and occupancy detection node for room-level automation.

- `sensor.cpp` — Dual PIR + Ultrasonic distance sensor sampling with noise filtering.
- `gate.cpp` — Physical gate / relay actuation.
- MQTT event dispatch to Home Assistant on topic `homelab/sensors/footprint/state`.
