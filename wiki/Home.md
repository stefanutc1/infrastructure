# Homelab Infrastructure Wiki

Welcome to the **Homelab Knowledge Base**. This wiki contains the complete architectural blueprints, configuration standards, operations runbooks, and disaster recovery procedures for the entire homelab environment.

```mermaid
flowchart TB
    Internet([" WAN / Internet"])

    subgraph PVE["Proxmox VE Hypervisor Host"]
        direction TB

        subgraph CORE["Layer 1: Core Networking & Security"]
            OPN["OPNsense Firewall / Router
VLANs & NAT"]
            DNS["Pi-hole DNS Engine
Ad & Tracker Blocking"]
            VPN["NetBird Mesh VPN
WireGuard Zero-Trust"]
        end

        subgraph INGRESS["Layer 2: Ingress & Authentication"]
            NPM["OPNsense Nginx Ingress
SSL Termination (:80/:443)"]
            AUTH["Authelia SSO Provider
MFA & Forward Auth"]
        end

        subgraph PLATFORM["Layer 3: Core Application Stacks"]
            STORAGE["Storage & Media
Immich · Nextcloud · AList · FileBrowser"]
            OPS["Operations & Automation
n8n · Gitea · Woodpecker CI · Vaultwarden"]
            DASH["Dashboards
Homepage · Homarr · IT-Tools"]
        end

        subgraph OBS["Layer 4: Observability & Monitoring"]
            PROM["Prometheus + Alertmanager
Metrics & Discord Routing"]
            GRAF["Grafana
Telemetry Dashboards"]
            HEALTH["Health Checkers
Uptime Kuma · Scrutiny SMART"]
        end

        subgraph K8S["Layer 5: Container Orchestration"]
            K3S["k3s Kubernetes Cluster
FluxCD GitOps Reconciliation"]
        end
    end

    subgraph EDGE["Layer 6: Edge & Embedded Nodes (ESP32)"]
        IRR["Irrigation Controller
Weather-Aware Solenoids"]
        PIR["Footprint Presence Sensor
MQTT to Home Assistant"]
    end

    Internet --> OPN
    OPN --> NPM
    NPM --> AUTH
    AUTH --> PLATFORM
    OPN --> DNS
    OPN --> VPN
    OBS --> PLATFORM
    K8S --> PLATFORM
    EDGE -.->|"Telemetry / MQTT"| PLATFORM
```

---

## Table of Contents

1. **[[Architecture & Networking|Architecture-and-Networking]]** — VLAN topology, subnet allocations, firewall rules, and reverse proxy routing.
2. **[[Services Catalog|Services-Catalog]]** — Complete inventory of 30+ containerized services, exposed ports, and volume layouts.
3. **[[Infrastructure as Code|Infrastructure-as-Code]]** — Terraform Proxmox VM modules and multi-hypervisor IaC (Xen, ESXi, Hyper-V, bhyve).
4. **[[Kubernetes & GitOps|Kubernetes-and-GitOps]]** — k3s cluster configuration, Ansible bootstrap, and continuous FluxCD sync.
5. **[[Monitoring & Alerting|Monitoring-and-Alerting]]** — Prometheus metrics scraping, node-level alert triggers, and Discord webhook routing.
6. **[[ESP32 Edge Systems|ESP32-Edge-Systems]]** — Embedded C++ firmware for automated garden irrigation and physical occupancy tracking.
7. **[[Runbooks & Disaster Recovery|Runbooks-and-Disaster-Recovery]]** — Operational runbooks, cold start sequences, and automated backup procedures.
