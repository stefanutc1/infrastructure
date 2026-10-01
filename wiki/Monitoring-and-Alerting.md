# Monitoring & Alerting

## 1. Prometheus Telemetry Architecture

Prometheus (CT 104) scrapes metrics across physical hosts, virtual machines, container endpoints, and embedded ESP32 edge nodes every 15 seconds.

### Exporter Targets
- **Node Exporter**: Scraping port `9100/TCP` across all physical hosts (Node 1, Node 2, Node 4).
- **cAdvisor**: Container runtime resource utilization across all LXC microservices.
- **ESP32 Datacenter Environment**: Embedded HTTP exporter scraping port `80/TCP` (`http://192.168.50.23/metrics`) for ambient temperature, humidity, pressure, DS18B20 delta-T, and fan RPM.
- **ESP32 Power Monitor**: Embedded HTTP exporter scraping port `80/TCP` (`http://192.168.50.24/metrics`) for mains voltage status, battery voltage, and current draw.

---

## 2. Alert Rules (`services/prometheus/rules/homelab-alerts.yml`)

```yaml
groups:
  - name: homelab-node-alerts
    rules:
      - alert: HostHighCpuLoad
        expr: 100 - (avg by(instance) (rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100) > 85
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High CPU load detected on {{ $labels.instance }}"
          description: "CPU utilization has exceeded 85% for more than 5 minutes."

      - alert: HostOutOfMemory
        expr: (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes) * 100 < 10
        for: 3m
        labels:
          severity: critical
        annotations:
          summary: "Host out of memory on {{ $labels.instance }}"
          description: "Available physical memory is below 10% for more than 3 minutes."

      - alert: DatacenterRackOverheat
        expr: esp32_exhaust_temp_celsius > 40.0
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "Rack exhaust temperature critical on {{ $labels.instance }}"
          description: "Exhaust temperature has exceeded 40°C. Noctua fans spun to 100%."
```

---

## 3. Alertmanager Notification Routing

Alerts are routed to notification channels via webhooks:
- `warning` severity -> `#homelab-alerts` channel.
- `critical` severity -> `#homelab-urgent` channel with urgent operator mentions.
