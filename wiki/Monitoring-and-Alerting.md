# Monitoring & Alerting

## Prometheus Telemetry Architecture

Prometheus scrapes metrics across physical hosts, virtual machines, and container endpoints using `node_exporter` and cAdvisor.

### Alert Rules (`services/prometheus/rules/homelab-alerts.yml`)

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
```

## Alertmanager Notification Routing

Alerts are routed to a Discord webhook through `alertmanager-discord`:
- `warning` severity $	o$ `#homelab-alerts` channel.
- `critical` severity $	o$ `#homelab-urgent` channel with `@here` alert mentions.
