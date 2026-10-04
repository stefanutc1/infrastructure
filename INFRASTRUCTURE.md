<div align="center">

# Enterprise Infrastructure & Hardware Fleet Inventory

</div>

<div align="center">

[![Inventory](https://img.shields.io/badge/Fleet-Enterprise%20Hardware%20Inventory-0f172a.svg?style=flat&logo=serverfault)](#)
[![Bare-Metal](https://img.shields.io/badge/Compute-3%20Physical%20Nodes%20%2B%204%20ESP32%20Nodes-2563eb.svg?style=flat&logo=intel)](#1-physical-hardware-fleet)
[![Memory](https://img.shields.io/badge/RAM%20Capacity-12GB%20DDR4%20(75.5%25%20Governed)-8b5cf6.svg?style=flat&logo=databricks)](#4-physical-capacity-budget--memory-footprint-analysis)
[![Edge IoT](https://img.shields.io/badge/Edge%20Fleet-4%20Bare--Metal%20ESP32%20Nodes-e7352c.svg?style=flat&logo=espressif)](esp32/README.md)
[![Storage](https://img.shields.io/badge/Storage-NVMe%20LVM--thin%20%2B%20ZFS%20NAS-059669.svg?style=flat&logo=zfs)](#4-physical-capacity-budget--memory-footprint-analysis)
[![Author](https://img.shields.io/badge/Architect-Moan%C4%83%20%C8%98tef%C4%83nu%C8%9B--Cornel-blue.svg?style=flat&logo=github)](https://github.com/stefanutc1)
[![University](https://img.shields.io/badge/University-Universitatea%20din%20Craiova%20%C2%B7%20FEAA-0284c7.svg?style=flat&logo=academia)](https://feaa.ucv.ro)

</div>

---

<div align="center">

## Executive Summary

</div>

This document provides the definitive, factual inventory of physical compute nodes, embedded microcontrollers, hypervisors, virtual machines, container fleets, storage arrays, and network appliances comprising the `stefanutc1/infrastructure` platform.

In strict observance of the **"No Fake Enterprise"** standard, all capacity ratings, memory figures, and operational states represent empirical engineering reality. Idle and on-demand lab environments are explicitly differentiated from 24/7 always-on production services.

---

<div align="center">

## 1. Physical Hardware Fleet

</div>

```text
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│                                   PHYSICAL HARDWARE FLEET                                │
├────────────────────────────────┬────────────────────────────┬────────────────────────────┤
│  NODE 1: pve_primary_x64       │  NODE 2: omv_nas           │  NODE 4: k8s_node_04       │
│  Intel Core i3-10100F (4C/8T)  │  ASUS X451MA (Celeron N2830│  AMD Athlon II X2 220 (2C) │
│  GTX 1050 Ti (4GB VRAM)        │  2GB DDR3 RAM              │  NVIDIA GTS 250 / 4GB RAM  │
│  12GB DDR4 RAM / 512GB NVMe    │  500GB ZFS Pool (omv_tank) │  80GB HDD / Single NIC     │
│  Proxmox VE 9.2 Type-1 Hyperv. │  OpenMediaVault 7 (NFS/SMB)│  k3s / k0s Edge Worker     │
│  IP: 192.168.1.132             │  IP: 192.168.1.135         │  IP: 192.168.1.18          │
└────────────────────────────────┴────────────────────────────┴────────────────────────────┘
```

| Parameter | Node 1: Hypervisor (`pve_primary_x64`) | Node 2: Storage NAS (`omv_nas`) | Node 4: Edge Worker (`k8s_node_04`) |
| :--- | :--- | :--- | :--- |
| **System Model** | Custom Bare-Metal Workstation | ASUS X451MA Laptop Server | Custom Legacy Micro-Tower |
| **Primary Role** | Type-1 Hypervisor & Production Host | Central ZFS Storage & Backup Target | Lightweight Edge Kubernetes Node |
| **CPU Model** | Intel Core i3-10100F (Comet Lake) | Intel Celeron N2830 (Bay Trail) | AMD Athlon II X2 220 (Regor) |
| **CPU Architecture** | x86_64 (64-bit, AVX2, VT-x, AES-NI) | x86_64 (64-bit, VT-x, Low Power) | x86_64 (64-bit, AMD-V, Legacy) |
| **Cores / Threads** | 4 Cores / 8 Threads @ 3.60 GHz (4.30 GHz Turbo) | 2 Cores / 2 Threads @ 2.16 GHz (2.41 GHz Burst) | 2 Cores / 2 Threads @ 2.80 GHz |
| **Dedicated GPU** | NVIDIA GeForce GTX 1050 Ti (4GB GDDR5) | Integrated Intel HD Graphics | NVIDIA GeForce GTS 250 (1GB GDDR3) |
| **System Memory** | 12 GB DDR4 (1x 8GB + 1x 4GB @ 2666 MHz) | 2 GB DDR3L (1333 MHz) | 4 GB DDR3 (1066 MHz) |
| **Primary Storage** | 512 GB NVMe PCIe M.2 SSD (`local-lvm`) | 500 GB 2.5" SATA HDD (ZFS Pool `omv_tank`) | 80 GB 3.5" SATA HDD (Ext4) |
| **Network NIC** | 1x Realtek RTL8111H Gigabit Ethernet | 1x Realtek Fast/Gigabit Ethernet | 1x Realtek Fast/Gigabit Ethernet |
| **Operating System** | Proxmox VE 9.2 (Debian 12 / Linux 6.8+ pve) | OpenMediaVault 7 (Debian 12 / ZFS) | Debian 12 Minimal (Linux 6.1+) |
| **Static IPv4** | `192.168.1.132` (VLAN 10) | `192.168.1.135` (VLAN 10) | `192.168.1.18` (VLAN 30) |
| **Operational State** | `DEPLOYED` (Active 24/7 Production) | `DEPLOYED` (Active 24/7 Production) | `DEPLOYED` (Active Edge Worker) |

---

<div align="center">

## 2. ESP32 Edge Sensor & Microcontroller Fleet (`esp32/`)

</div>

All edge microcontrollers connect to **VLAN 50 (Isolated IoT Sensors)** and execute custom bare-metal C++ firmware with Hardware Watchdog Timers (WDT) and automated reconnect loops. Complete pinout diagrams and source code reside in [`esp32/`](esp32/README.md).

| Node ID | Module / Role | Microcontroller Hardware | Primary Sensors & Peripherals | Telemetry Protocol & Port | Static IPv4 & VLAN | Operational State |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **ESP32-EDGE-01** | [`footprint`](esp32/footprint/README.md)<br>Perimeter Access & Presence | ESP32-WROOM-32D<br>(Dual-Core 240MHz, 4MB Flash) | • Optical Fingerprint Scanner (UART2 R307/R504)<br>• Dual PIR Motion Sensors (HC-SR501)<br>• HC-SR04 Ultrasonic Distance Sensor<br>• 12V Solenoid Gate Relay<br>• SSD1306 128x64 I2C OLED Display | MQTT (JSON Topics)<br>Home Assistant Discovery | `192.168.50.21`<br>(VLAN 50 IoT) | `DEPLOYED`<br>(Production) |
| **ESP32-EDGE-02** | [`irrigation`](esp32/irrigation/README.md)<br>Weather-Aware Irrigation | ESP32-WROOM-32D<br>(Dual-Core 240MHz, 4MB Flash) | • 4-Zone Optocoupler Relays (Active-LOW)<br>• Analog Capacitive Soil Moisture Probes<br>• Digital Rain Sensor with Inhibit Interlock<br>• Pulse Flow Meter (YF-S201 Interrupt)<br>• 15-Minute Hardware Safety Timer | MQTT (Zone Telemetry)<br>NTP Time Sync | `192.168.50.22`<br>(VLAN 50 IoT) | `DEPLOYED`<br>(Production) |
| **ESP32-EDGE-03** | [`datacenter_environment`](esp32/datacenter_environment/README.md)<br>Rack Telemetry & Fan Control | ESP32-WROOM-32D<br>(Dual-Core 240MHz, 4MB Flash) | • Bosch BME280 I2C (Temp/Humidity/Pressure)<br>• Dual DS18B20 1-Wire Intake/Exhaust Delta-T<br>• Noctua 25kHz PWM Fan Driver (Timer 0)<br>• Fan Tachometer RPM Interrupt Sensor<br>• Status RGB LED | Prometheus HTTP `/metrics` (:80)<br>MQTT Status Stream | `192.168.50.23`<br>(VLAN 50 IoT) | `DEPLOYED`<br>(Production) |
| **ESP32-EDGE-04** | [`power_monitor`](esp32/power_monitor/README.md)<br>Mains Failover & Battery Watch | ESP32-WROOM-32D<br>(Dual-Core 240MHz, 4MB Flash) | • 230V AC Optocoupler Zero-Latency Interrupt<br>• 12V SLA Battery Voltage Divider ADC<br>• INA219 High-Side DC Voltage/Current I2C<br>• Buzzer Audible Alarm<br>• Emergency Proxmox Shutdown Trigger (<11.4V) | Prometheus HTTP `/metrics` (:80)<br>MQTT Emergency Webhook | `192.168.50.24`<br>(VLAN 50 IoT) | `DEPLOYED`<br>(Production) |

---

<div align="center">

## 3. Virtual Machine Fleet (KVM)

</div>

All virtual machines execute under QEMU/KVM on Node 1 (`pve_primary_x64`).

| VMID | Name | Operating System | vCPU | Max RAM | Balloon RAM | Disk Size | Storage Pool | VLAN & Static IP | Operational State | Research Scope / Purpose |
| :---: | :--- | :--- | :---: | :---: | :---: | :---: | :--- | :--- | :---: | :--- |
| **200** | `opnsense-firewall` | FreeBSD 14 / OPNsense 24.x | 2 | 2,048 MB | 1,024 MB | 16 GB | `local-lvm` | VLAN 10 (`192.168.1.134`) | `DEPLOYED` | Core perimeter gateway, NAT, Suricata DPI, DoT Unbound DNS |
| **201** | `openstack` | Ubuntu 24.04 / Kolla OpenStack | 2 | 4,096 MB | 2,048 MB | 32 GB | `local-lvm` | VLAN 20 (`192.168.1.201`) | `DECLARED` | Private cloud orchestration and API testing |
| **202** | `metasploitable2` | Metasploitable 2 Linux Target | 1 | 512 MB | 512 MB | 8 GB | `local-lvm` | VLAN 20 (`192.168.1.202`) | `DECLARED` | Network penetration testing and vulnerability verification |
| **203** | `tpot-honeypot` | Debian 12 / T-Pot 24.04 Multi-Decoy | 4 | 8,192 MB | 4,096 MB | 60 GB | `local-lvm` | VLAN 40 (`192.168.1.203`) | `DECLARED` | Cyber deception platform and threat actor capture |
| **204** | `securityonion` | Security Onion 3.2 / Wazuh SIEM | 4 | 8,192 MB | 4,096 MB | 50 GB | `local-lvm` | VLAN 10 (`192.168.1.204`) | `DECLARED` | Network security monitoring, Zeek, and full packet capture |
| **205** | `remnux` | REMnux v7 / Ubuntu Malware DFIR | 2 | 4,096 MB | 2,048 MB | 40 GB | `local-lvm` | VLAN 30 (`192.168.1.205`) | `DECLARED` | Reverse engineering and malware behavioral analysis |
| **301** | `metasploitable-licenta` | Metasploitable Linux Target | 2 | 2,048 MB | 1,024 MB | 20 GB | `local-lvm` | VLAN 30 (`192.168.1.211`) | `DECLARED` | Bachelor's Thesis target for automated exploit pipelines |
| **302** | `kali-licenta` | Kali Linux Rolling Pentest Node | 2 | 4,096 MB | 2,048 MB | 30 GB | `local-lvm` | VLAN 30 (`192.168.30.102`) | `DECLARED` | Dedicated offensive testing and red team operator workstation |
| **310** | `core-banking` | Debian 12 / Apache Fineract | 2 | 4,096 MB | 2,048 MB | 40 GB | `local-lvm` | VLAN 20 (`192.168.20.50`) | `DECLARED` | Bachelor's Thesis enterprise core-banking platform |
| **311** | `banking-db` | Debian 12 / PostgreSQL 16 Ledger | 2 | 4,096 MB | 2,048 MB | 50 GB | `local-lvm` | VLAN 20 (`192.168.20.51`) | `DECLARED` | Financial transaction ledger, pgAudit, SCRAM-SHA-256 |
| **313** | `swift-jumpbox` | Hardened Linux Bastion Host | 2 | 2,048 MB | 1,024 MB | 25 GB | `local-lvm` | VLAN 10 (`192.168.10.50`) | `DECLARED` | SWIFT CSP privileged access bastion and MFA jumpbox |
| **400** | `ad2025` | Windows Server 2025 Datacenter | 6 | 8,192 MB | 4,096 MB | 256 GB | `local-lvm` | VLAN 10 (`192.168.1.225`) | `DECLARED` | Primary Active Directory forest root & Kerberos DC |
| **401** | `ad2022` | Windows Server 2022 Datacenter | 2 | 4,096 MB | 2,048 MB | 60 GB | `local-lvm` | VLAN 10 (`192.168.1.222`) | `DECLARED` | Replica Domain Controller and cross-forest trust partner |
| **402** | `ad2019` | Windows Server 2019 Standard | 2 | 2,048 MB | 1,024 MB | 128 GB | `local-lvm` | VLAN 10 (`192.168.1.219`) | `DECLARED` | Legacy schema compatibility and migration testing |
| **403** | `ad2016` | Windows Server 2016 Standard | 2 | 3,072 MB | 2,048 MB | 50 GB | `local-lvm` | VLAN 10 (`192.168.1.216`) | `DECLARED` | Functional level migration and Kerberos hardening lab |
| **404** | `ad2012` | Windows Server 2012 R2 Standard | 2 | 2,048 MB | 1,024 MB | 40 GB | `local-lvm` | VLAN 10 (`192.168.1.212`) | `DECLARED` | Deprecated protocol testing (NTLMv1, SMBv1 teardown) |
| **405** | `ad2008` | Windows Server 2008 R2 SP1 Standard | 2 | 2,048 MB | 1,024 MB | 40 GB | `local-lvm` | VLAN 10 (`192.168.1.208`) | `DECLARED` | Legacy cryptographic regression testing |
| **406** | `adwin10` | Windows 10 Enterprise Client | 2 | 3,072 MB | 2,048 MB | 50 GB | `local-lvm` | VLAN 10 (`192.168.1.217`) | `DECLARED` | Member workstation for AppLocker and GPO testing |
| **407** | `adwin11` | Windows 11 Enterprise Client | 2 | 4,096 MB | 2,048 MB | 60 GB | `local-lvm` | VLAN 10 (`192.168.1.218`) | `DECLARED` | Modern Windows client with TPM 2.0 and Credential Guard |
| **408** | `adwin7` | Windows 7 Ultimate SP1 Client | 2 | 2,048 MB | 1,024 MB | 50 GB | `local-lvm` | VLAN 10 (`192.168.1.207`) | `DECLARED` | Legacy client testing for pass-the-hash and NetBIOS attacks |
| **409** | `adrhel` | RHEL 9.8 Enterprise Domain Node | 2 | 2,048 MB | 1,024 MB | 50 GB | `local-lvm` | VLAN 10 (`192.168.1.228`) | `DECLARED` | SSSD / Realmd cross-platform Kerberos domain join |
| **410** | `ad2003` | Windows Server 2003 R2 Enterprise | 2 | 2,048 MB | 1,024 MB | 40 GB | `local-lvm` | VLAN 10 (`192.168.1.209`) | `DECLARED` | Historical schema emulation and archived forensic research |

---

<div align="center">

## 4. LXC Container Fleet

</div>

All containers execute on Node 1 (`pve_primary_x64`), sharing the host Linux 6.8+ kernel with unprivileged user namespace mapping.

| CTID | Hostname | Role / Service | OS Template | Allocated RAM | Root Disk | Unprivileged? | Network & Static IP | Operational State |
| :---: | :--- | :--- | :--- | :---: | :---: | :---: | :--- | :---: |
| **100** | `homeassistant` | Smart Home & Zigbee Automation | Debian 12 | 384 MB | 16 GB | Yes | VLAN 20 (`192.168.1.10`) | `DEPLOYED` |
| **101** | `scrutiny` | S.M.A.R.T. Drive Health Daemon | Debian 12 | 128 MB | 4 GB | Yes | VLAN 20 (`192.168.1.108`) | `DEPLOYED` |
| **102** | `ollama` | Local GPU AI Inference Runtime | Debian 12 | 2,048 MB | 16 GB | No (GPU Passthrough) | VLAN 20 (`192.168.1.110`) | `DEPLOYED` |
| **103** | `uptimekuma` | Synthetic Service Health Probing | Debian 12 | 128 MB | 2 GB | Yes | VLAN 20 (`192.168.1.119`) | `DEPLOYED` |
| **104** | `monitoring` | Prometheus & Grafana Telemetry | Debian 12 | 1,024 MB | 20 GB | Yes | VLAN 20 (`192.168.1.121`) | `DEPLOYED` |
| **105** | `media-suite` | Media Streaming (Jellyfin / *arr) | Debian 12 | 896 MB | 50 GB | Yes | VLAN 20 (`192.168.1.21`) | `DEPLOYED` |
| **106** | `wazuh` | Wazuh SIEM / HIDS Server 4.14 | Debian 12 | 1,536 MB | 30 GB | Yes | VLAN 10 (`192.168.1.240`) | `DEPLOYED` |
| **101b** | `nextcloud` | File Synchronization & WebDAV | Debian 12 | 512 MB | 20 GB | Yes | VLAN 20 (`192.168.1.8`) | `DEPLOYED` |
| **100b** | `immich` | Machine-Learning Photo Backup | Debian 12 | 896 MB | 40 GB | Yes | VLAN 20 (`192.168.1.15`) | `DEPLOYED` |
| **161** | `minio` | S3-Compatible Object Storage API | Alpine 3.19 | 256 MB | 10 GB | Yes | VLAN 20 (`192.168.1.161`) | `DEPLOYED` |
| **175** | `owasp-core` | Pentest Target (Juice Shop / DVWA) | Alpine 3.19 | 512 MB | 8 GB | Yes | VLAN 30 (`192.168.1.175`) | `DECLARED` |
| **303** | `owasp-licenta` | Bachelor Thesis Web Application Target | Alpine 3.19 | 512 MB | 8 GB | Yes | VLAN 30 (`192.168.30.103`) | `DECLARED` |
| **312** | `payment-gw` | Bachelor Thesis Payment Gateway API | Debian 12 | 512 MB | 10 GB | Yes | VLAN 20 (`192.168.20.52`) | `DECLARED` |

---

<div align="center">

## 5. Physical Capacity Budget & Memory Footprint Analysis

</div>

<div align="center">

### 5.1 Node 1 (`pve_primary_x64` — 12,288 MB Total Physical DDR4 RAM)

</div>

```text
Total Physical RAM: 12,288 MB (100.0%)
┌─────────────────────────────────────────────────────────────┬──────────────┐
│ Always-On Production Workloads (Active 24/7): ~9,280 MB    │ Headroom     │
│ (75.5% Physical Capacity)                                   │ ~3,008 MB    │
│                                                             │ (24.5% Free) │
└─────────────────────────────────────────────────────────────┴──────────────┘
  ├─ Proxmox VE Host OS & Kernel Cache: 1,500 MB
  ├─ VM 200 (OPNsense Firewall & Suricata DPI): 1,536 MB (Balloon 1024-2048 MB)
  ├─ CT 102 (Ollama AI Inference Runtime): 2,048 MB (GPU handles model weights)
  ├─ CT 106 (Wazuh SIEM / HIDS Server): 1,536 MB
  ├─ CT 104 (Prometheus & Grafana Observability): 1,024 MB
  ├─ CT 105 (Media Suite / Jellyfin): 896 MB
  ├─ CT 100b (Immich Photos): 896 MB
  ├─ CT 101b (Nextcloud Collaboration Hub): 512 MB
  ├─ CT 100 (Home Assistant Core): 384 MB
  ├─ CT 161 (MinIO S3 Object Gateway): 256 MB
  ├─ CT 101 (Scrutiny Drive Health): 128 MB
  ├─ CT 103 (Uptime Kuma Synthetic Availability): 128 MB
  └─ Ingress & Telemetry Proxies: 128 MB
```

<div align="center">

### 5.2 On-Demand Lab Memory Governance Policy

</div>
Because total declared RAM across academic research workloads (Active Directory Forest: 35 GB, Bachelor Thesis Banking Lab: 14 GB, Security Onion + T-Pot: 16 GB) exceeds the physical 12 GB RAM ceiling:
1. **Default State**: All research virtual machines are configured with `onboot: 0` (default state: `STOPPED`).
2. **Pre-Flight Memory Verification**: Startup automation scripts (`scripts/licenta-lab-start.sh`, `scripts/ad-lab-start.sh`) verify that free physical host RAM is at least **2,500 MB** before issuing boot commands.
3. **Concurrency Cap**: A maximum of **2 lab VMs** may run concurrently.
4. **Dynamic VirtIO Ballooning**: Ballooning drivers reclaim idle operating system cache pages back to the hypervisor pool in real time.

---

<div align="center">

*Engineered with precision by **Moană Ștefănuț-Cornel** (`@stefanutc1`).*  
*Universitatea din Craiova · Facultatea de Economie și Administrarea Afacerilor (FEAA) · Informatică Economică (2024–2027).*

</div>
