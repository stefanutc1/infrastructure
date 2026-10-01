# Enterprise Platform Architecture & Hybrid Cloud Blueprint

<div align="center">

[![Infrastructure](https://img.shields.io/badge/Architecture-Enterprise%20Hybrid%20Datacenter-0f172a.svg?style=flat&logo=serverfault)](#)
[![Hypervisor](https://img.shields.io/badge/Hypervisor-Proxmox%20VE%209.2%20Type--1-e44d26.svg?style=flat&logo=proxmox)](https://www.proxmox.com)
[![Network](https://img.shields.io/badge/Firewall-OPNsense%20Dual--Perimeter-f26522.svg?style=flat&logo=opnsense)](https://opnsense.org)
[![Zero-Trust](https://img.shields.io/badge/Network-802.1Q%20Zero--Trust%20VLANs-0052cc.svg?style=flat&logo=cisco)](#network-architecture)
[![SIEM](https://img.shields.io/badge/SIEM%2FXDR-Wazuh%204.14-00a4e4.svg?style=flat&logo=wazuh)](https://wazuh.com)
[![Edge IoT](https://img.shields.io/badge/Edge%20Fleet-ESP32%20Bare--Metal%20C%2B%2B-e7352c.svg?style=flat&logo=espressif)](esp32/README.md)
[![Cloud Cost](https://img.shields.io/badge/Cloud%20Policy-%240.00%20Strict%20Free--Tier-10b981.svg?style=flat&logo=terraform)](policy/cloud/zero_cost_policy.rego)
[![Author](https://img.shields.io/badge/Author-Moan%C4%83%20%C8%98tef%C4%83nu%C8%9B--Cornel-blue.svg?style=flat&logo=github)](https://github.com/stefanutc1)
[![University](https://img.shields.io/badge/University-Universitatea%20din%20Craiova%20%C2%B7%20FEAA-0284c7.svg?style=flat&logo=academia)](https://feaa.ucv.ro)

</div>

---

## Executive Summary

The `stefanutc1/infrastructure` platform serves as the central hybrid datacenter, private cloud, and offensive/defensive cybersecurity laboratory engineered by **Moană Ștefănuț-Cornel** (`@stefanutc1`). Designed on the tenets of **Software-Defined Infrastructure (IaC)**, **Zero-Trust Network Segmentation (802.1Q)**, **Empirical Resource Grounding ("No Fake Enterprise")**, and **Preventative Zero-Cost Cloud Guardrails**, this infrastructure unifies:

1. **24/7 Production Services**: Household automation, media streaming with Intel QSV/NVENC hardware transcoding, federated identity, and automated disaster-resilient backups.
2. **Academic Research Testbeds**: Multi-generation Active Directory domain forests (Windows Server 2008 R2 through 2025), a full-scale Core-Banking simulation (Apache Fineract, PostgreSQL ledger, SWIFT jumpbox) supporting Bachelor's Thesis research at **Universitatea din Craiova (FEAA — Informatică Economică, 2024–2027)**, and published competitive CTF writeups (100% solve rate on InvataCyber.ro CTF).
3. **Edge Microcontroller Fleet**: Four bare-metal ESP32 microcontrollers executing custom C++ firmware for physical perimeter access control, weather-aware 4-zone irrigation, datacenter rack environmental telemetry (BME280, dual DS18B20 1-Wire, Noctua 25kHz PWM fan control), and 230V mains/battery power monitoring with emergency Proxmox shutdown triggers.
4. **Zero-Cost Preventative Cloud Architecture**: Declarative multi-cloud Terraform modules (AWS, GCP, Azure) subjected to automated OPA/Conftest policy-as-code and static analyzer guardrails in CI/CD, guaranteeing strictly **$0.00 / free-tier operation** with zero accidental cloud billing.

```text
Physical Hardware ──> Type-1 Proxmox VE ──> OPNsense Firewall ──> Zero-Trust VLANs ──> GitOps IaC ──> Telemetry & Edge IoT
```

---

## 1. High-Level Architectural Blueprints

### 1.1 Physical, Edge & Logical Topology

```mermaid
flowchart TB
    WAN["WAN / Internet Uplink<br/>ISP Fiber Optical Gateway"]

    subgraph PERIMETER["Dual-Perimeter Network Security Layer"]
        OPN["OPNsense Core Firewall (VM 200)<br/>VirtIO vtnet0 (WAN) · vtnet1 (LAN Trunk)<br/>vtnet2 (Transit 10.10.20.0/30) · vtnet3 (DMZ)<br/>Suricata DPI · CrowdSec Bouncers · Unbound DNS over TLS"]
        VMBR0["vmbr0 (WAN Ingress)"]
        VMBR1["vmbr1 (802.1Q VLAN Trunk)"]
        VMBR2["vmbr2 (Host Transit Link)"]
        VMBR3["vmbr3 (Isolated Deception Bridge)"]
    end

    subgraph BARE_METAL["Physical Compute & Storage Fleet"]
        NODE1["Node 1: pve_primary_x64<br/>Intel Core i3-10100F (4C/8T @ 4.3GHz)<br/>12 GB DDR4 RAM · 512 GB NVMe SSD<br/>NVIDIA GeForce GTX 1050 Ti (4GB VRAM)<br/>Proxmox VE 9.2 (Linux 6.8+ pve)"]
        NODE2["Node 2: omv_nas<br/>Intel Celeron N2830 (2C/2T)<br/>2 GB DDR3L RAM · 500 GB ZFS Pool<br/>OpenMediaVault 7 (NFSv4 / SMBv3)"]
        NODE4["Node 4: k8s_node_04<br/>AMD Athlon II X2 220 (2C/2T @ 2.8GHz)<br/>4 GB DDR3 RAM · 80 GB SATA HDD<br/>k3s / k0s Lightweight Worker Agent"]
    end

    subgraph EDGE_FLEET["ESP32 Edge Microcontroller Fleet (VLAN 50 IoT)"]
        EDGE1["ESP32-EDGE-01: footprint<br/>UART2 Optical Fingerprint Scanner (R307/R504)<br/>Dual PIR Motion + Ultrasonic HC-SR04<br/>12V Solenoid Gate Relay · SSD1306 OLED"]
        EDGE2["ESP32-EDGE-02: irrigation<br/>4-Zone Opto-Isolated Active-LOW Relays<br/>Analog Capacitive Moisture Probes<br/>Pulse Flow Meter (YF-S201) · Rain Inhibit"]
        EDGE3["ESP32-EDGE-03: datacenter_env<br/>BME280 I2C (Temp/Humidity/Pressure)<br/>Dual DS18B20 1-Wire Intake/Exhaust Delta-T<br/>Noctua 25kHz PWM Fan Driver · Prometheus /metrics"]
        EDGE4["ESP32-EDGE-04: power_monitor<br/>230V AC Optocoupler Zero-Latency Interrupt<br/>12V SLA Battery Divider ADC · INA219 DC Monitor<br/>Emergency Proxmox Shutdown Trigger (<11.4V)"]
    end

    subgraph WORKLOAD_TIERS["Workload Execution Tiers (Node 1)"]
        subgraph ALWAYS_ON["Always-On Production Microservices (~9.2 GB RAM)"]
            CT100["CT 100: Home Assistant Core (384 MB)"]
            CT101["CT 101: Scrutiny S.M.A.R.T. Daemon (128 MB)"]
            CT102["CT 102: Ollama GPU AI Runtime (2,048 MB)"]
            CT103["CT 103: Uptime Kuma Prober (128 MB)"]
            CT104["CT 104: Prometheus & Grafana (1,024 MB)"]
            CT105["CT 105: Media Suite & Jellyfin (896 MB)"]
            CT106["CT 106: Wazuh SIEM / HIDS Server (1,536 MB)"]
            CT100B["CT 100b: Immich Photo Server (896 MB)"]
            CT101B["CT 101b: Nextcloud Collaboration Hub (512 MB)"]
            CT161["CT 161: MinIO S3 Object Storage (256 MB)"]
        end

        subgraph ON_DEMAND["On-Demand Academic & Research Labs (Spin-Up Lifecycle)"]
            LAB_AD["Active Directory Enterprise Forest (VMs 400–410)<br/>Win Server 2008 R2, 2012 R2, 2016, 2019, 2022, 2025<br/>Win 10/11 & RHEL 9.8 Domain Workloads"]
            LAB_BANK["Bachelor's Thesis Banking Security Lab (VMs 310–313)<br/>Apache Fineract Core-Banking · PostgreSQL Ledger<br/>SWIFT Privileged Bastion · Payment Gateway API"]
            LAB_CYBER["Offensive Security & Malware Range<br/>Kali Linux (VM 302) · Metasploitable 2 (VM 301)<br/>OWASP Juice Shop (CT 303) · REMnux DFIR (VM 205)<br/>T-Pot 24 Multi-Decoy Honeypot (VM 203)"]
        end
    end

    WAN --> VMBR0 --> OPN
    OPN --> VMBR1
    OPN <-->|Transit 10.10.20.0/30| VMBR2 <--> NODE1
    OPN --> VMBR3
    VMBR1 --> NODE1 & NODE2 & NODE4
    VMBR1 -.->|VLAN 50 IoT| EDGE_FLEET
    EDGE_FLEET -.->|MQTT & Prometheus Telemetry| ALWAYS_ON
    NODE1 --> WORKLOAD_TIERS
```

---

## 2. Core Architectural Principles

### 2.1 Empirical Reality & "No Fake Enterprise"
Every architectural component, compute specification, and workload documented in this repository observes strict empirical reality:
1. **`DEPLOYED`**: Workloads actively executing on physical bare-metal hardware, validated by live network endpoints, process IDs, and healthcheck probes.
2. **`DECLARED`**: Production-ready code and configurations declared in Terraform (`terraform/`), Ansible (`ansible/`), or Proxmox `.conf` templates, awaiting on-demand execution.
3. **`PROPOSED`**: Target blueprints and architectural roadmaps clearly marked as non-deployed concepts.
4. **`DEFERRED`**: Technologies intentionally evaluated and rejected or postponed due to hardware resource constraints (e.g., dual-CPU requirements, enterprise SANs).

### 2.2 Strict Physical Memory Governance
Node 1 possesses exactly 12,288 MB (12 GB) of physical DDR4 RAM:
- The **Always-On Runtime Tier** consumes approximately **9,280 MB (~75% capacity)**, guaranteeing ~3,000 MB of permanent headroom for host kernel caching, ZFS ARC, and transient operational bursts.
- **On-Demand Research Labs** (Active Directory: 35 GB total declared, Bachelor's Thesis: 14 GB total declared, Security Onion: 8 GB) are strictly governed by automated startup gates (`scripts/licenta-lab-start.sh`, `scripts/ad-lab-start.sh`). Only 1 to 2 isolated lab nodes can be booted simultaneously, leveraging VirtIO memory ballooning to release inactive pages.

### 2.3 Preventative Zero-Cost Cloud Guardrails
All hybrid cloud assets (AWS, GCP, Azure) are codified under a strict **$0.00 / Free-Tier Only policy**:
- Whitelisted free-tier compute instances only: `t2.micro`, `t3.micro`, `t4g.small` (AWS), `e2-micro` (GCP), `Standard_B1s` (Azure).
- Strictly forbidden: NAT Gateways, paid Application Load Balancers, provisioned IOPS (`io1`, `io2`), and billable managed services.
- Continuous automated static policy enforcement via `scripts/verify_zero_cloud_cost.py` and Open Policy Agent (OPA) / Conftest (`policy/cloud/zero_cost_policy.rego`) integrated directly into GitHub Actions CI/CD.

---

## 3. Subsystem Architecture Specifications

### 3.1 Network & Dual-Perimeter Security
- **Perimeter Firewall**: FreeBSD-based OPNsense deployed in KVM VM 200 with VirtIO network acceleration.
- **Point-to-Point Host Transit Bus**: `vmbr2` assigns `10.10.20.1/30` (OPNsense) and `10.10.20.2/30` (Proxmox VE host), enabling line-rate inter-firewall telemetry and packet inspection without transiting physical switch ports.
- **802.1Q Segmentation**: Strict layer-2 microsegmentation across VLAN 10 (Management), VLAN 20 (Core Production), VLAN 30 (CyberLab Quarantine), VLAN 40 (Deception DMZ), and VLAN 50 (IoT Microcontrollers).
- **Intrusion Detection**: Inline Suricata deep packet inspection on LAN and WAN interfaces with custom financial fraud and lateral movement detection rules.
- **Threat Reputation**: CrowdSec firewall bouncers automatically inject malicious scanning IPs into OPNsense pf tables.
- **Encrypted DNS**: Unbound resolves recursive queries using DNS-over-TLS (DoT) upstream to Quad9 (`9.9.9.9`), enforcing local authoritative resolution for `.lan` and sinkholing malicious domains from the Romanian National Cyber Security Directorate (DNSC) blocklist.

### 3.2 Compute & Virtualization Density
- **Proxmox VE 9.2**: Type-1 bare-metal hypervisor running on the Linux 6.8+ kernel with unprivileged LXC containerization and KVM hardware virtualization.
- **LXC Container Density**: Production microservices execute in unprivileged user namespaces (`UID 100000+`), cutting RAM footprint by >80% compared to traditional virtual machines.
- **Dynamic VirtIO Memory Ballooning**: KVM guest drivers automatically return idle memory pages to the host hypervisor during low-load intervals.

### 3.3 Disaggregated Storage & 3-2-1 Data Protection
- **Tier 1 (High-IOPS Local NVMe)**: Internal 512 GB PCIe NVMe SSD formatted as LVM-thin (`local-lvm`) hosting container root filesystems, PostgreSQL ledgers, and active VM virtual disks.
- **Tier 2 (Capacity & Backup Storage Pool)**: Remote 500 GB ZFS pool (`omv_tank`) hosted on Node 2 (`omv_nas`) exported over gigabit Ethernet via NFSv4 for Proxmox vzdump archives and SMBv3 for network storage.
- **Tier 3 (Offsite Cold Sync)**: Automated client-side encrypted backup snapshots synced to air-gapped offsite object storage using Mozilla SOPS and `age` encryption.

### 3.4 Identity, Ingress & Access Management
- **Administrative Ingress**: Mutual TLS (mTLS) enforced by Caddy reverse proxy; administrative endpoints require valid client certificates issued by the internal Certificate Authority (Smallstep Step-CA).
- **Enterprise Federation**: Keycloak IAM bridges Active Directory LDAP directory services and modern OpenID Connect (OIDC) / SAML 2.0 Single Sign-On across internal web applications.
- **Active Directory Research Range**: Multi-generation Windows Server domain forest (VMs 400 to 410) dedicated to academic Kerberos, BloodHound graph modeling, and lateral movement research.

### 3.5 Artificial Intelligence Architecture (ELO Subsystem)
- **Local GPU Acceleration**: NVIDIA GeForce GTX 1050 Ti (4GB GDDR5) passed through via PCIe IOMMU to Container 102 (`ollama`) for private, local LLM inference.
- **Multi-Tier Cascade Routing**: Inbound inference requests evaluate: Primary Cloud Frontier Model -> Secondary Cloud Fallback -> Local Ollama GPU -> Deterministic Static Fallback.
- **L0–L3 Tool Gatekeeper**: Strict authorization boundaries requiring out-of-band operator multi-factor authentication (MFA) before privileged or destructive system actions can be executed.

### 3.6 Edge Microcontroller Fleet (`esp32/`)
- **Bare-Metal C++ Firmware**: Production-grade ESP32 firmware equipped with Hardware Watchdog Timers (WDT), automated Wi-Fi reconnect backoff, and MQTT telemetry integration.
- **Physical Security & Access (`esp32/footprint/`)**: R307/R504 optical fingerprint sensor, dual HC-SR501 PIR sensors, HC-SR04 ultrasonic distance measurement, 12V solenoid gate relay, and SSD1306 OLED display.
- **Precision Irrigation (`esp32/irrigation/`)**: 4-zone optically isolated active-LOW relay driver, capacitive analog soil moisture probes, rain sensor inhibit logic, and YF-S201 pulse flow meter interrupt counter.
- **Datacenter Rack Telemetry (`esp32/datacenter_environment/`)**: BME280 I2C sensor (temp/humidity/pressure), dual DS18B20 1-Wire sensors calculating rack intake/exhaust delta-T, Noctua 25kHz PWM fan control with tachometer RPM feedback, and an embedded Prometheus HTTP `/metrics` exporter.
- **Power Telemetry & Grid Resiliency (`esp32/power_monitor/`)**: 230V AC optocoupler zero-latency mains interrupt, 12V SLA battery divider ADC, INA219 digital power sensor, and automated emergency Proxmox shutdown triggers when battery drops below 11.4V.

---

## 4. Architecture Decision Records (ADRs)

Key architectural trade-offs and design decisions are formally cataloged in [`docs/decisions/`](docs/decisions/):

- [**ADR-0001**](docs/decisions/ADR-0001-proxmox-primary-hypervisor.md): Proxmox VE as Primary Bare-Metal Hypervisor vs. Pure Bare-Metal Kubernetes
- [**ADR-0002**](docs/decisions/ADR-0002-lxc-container-density.md): LXC Unprivileged Container Density for Core Microservices
- [**ADR-0003**](docs/decisions/ADR-0003-opnsense-perimeter-gateway.md): Virtualized OPNsense Dual-Perimeter Gateway with Bridge Transit
- [**ADR-0004**](docs/decisions/ADR-0004-storage-tiering-local-zfs.md): Two-Tier Storage Architecture: Local NVMe `local-lvm` & Remote ZFS NAS
- [**ADR-0005**](docs/decisions/ADR-0005-identity-access-strategy.md): Ingress mTLS / OAuth2-Proxy & On-Demand Active Directory Research Lab
- [**ADR-0006**](docs/decisions/ADR-0006-secrets-management-hygiene.md): GitOps Zero-Plaintext Secret Hygiene & SOPS/Age Ingestion
- [**ADR-0007**](docs/decisions/ADR-0007-edge-kubernetes-k3s-k0s.md): Single-Node Lightweight Kubernetes (k3s/k0s) on Legacy Hardware
- [**ADR-0008**](docs/decisions/ADR-0008-elo-ai-routing-security-gatekeeper.md): ELO Multi-Tier Cascade Routing & L0–L3 Tool Execution Gatekeeper

---

## 5. Master Platform Documentation Map

| Document | Primary Focus | Target Engineering Role |
| :--- | :--- | :--- |
| [`INFRASTRUCTURE.md`](INFRASTRUCTURE.md) | Physical nodes, hardware specs, VM/LXC allocation, capacity budget, ESP32 fleet | Systems & Platform Engineers |
| [`SERVICES.md`](SERVICES.md) | 43-service catalog, ports, protocols, auth, backup, criticality, lifecycle | Application & Operations Teams |
| [`NETWORK.md`](NETWORK.md) | VLAN matrix, routing, bridges, firewall policies, WireGuard VPN, DNS sinkholing | Network & Security Engineers |
| [`SECURITY.md`](SECURITY.md) | STRIDE threat model, CIS benchmarks, PKI, secrets, Wazuh, Suricata, zero-cost policy | SecOps & Compliance Auditors |
| [`OPERATIONS.md`](OPERATIONS.md) | Day-2 runbooks, cold boot sequencing, emergency shutdown, updates, ESP32 triggers | SRE & Operations Engineers |
| [`BACKUP.md`](BACKUP.md) | 3-2-1 backup strategy, PBS client, ZFS snapshots, RPO/RTO matrix, restore drills | Backup & Storage Administrators |
| [`DISASTER-RECOVERY.md`](DISASTER-RECOVERY.md) | Business continuity plan, disaster classification, bare-metal rebuild runbooks | Incident Commanders & SREs |
| [`CONTRIBUTING.md`](CONTRIBUTING.md) | Contribution standards, IaC formatting, Git workflow, testing, CI validation gates | Software & DevOps Engineers |
| [`esp32/README.md`](esp32/README.md) | ESP32 edge firmware suite, pinouts, MQTT schemas, Prometheus endpoints, safety specs | Embedded Systems Engineers |

---

<div align="center">

*Engineered with precision by **Moană Ștefănuț-Cornel** (`@stefanutc1`).*  
*Universitatea din Craiova · Facultatea de Economie și Administrarea Afacerilor (FEAA) · Informatică Economică (2024–2027).*

</div>
