<div align="center">

# Hardware Fleet & Host Virtualization Specification

</div>

<div align="center">

[![Fleet](https://img.shields.io/badge/Hardware-3%20Bare--Metal%20Nodes%20%2B%204%20ESP32-0f172a.svg?style=flat&logo=serverfault)](#)
[![Primary Node](https://img.shields.io/badge/Hypervisor-Intel%20i3--10100F%20(12GB%20DDR4)-blue.svg?style=flat&logo=intel)](#host-proxmox-node-1--primary-hypervisor)
[![Storage Node](https://img.shields.io/badge/Storage-ASUS%20X451MA%20(ZFS%20NAS)-059669.svg?style=flat&logo=asus)](#host-openmediavault-node-2--storage-nas)
[![Edge Worker](https://img.shields.io/badge/Worker-AMD%20Athlon%20II%20X2%20(4GB%20DDR3)-8b5cf6.svg?style=flat&logo=amd)](#host-k8s-node-04-node-4--kubernetes-worker-node)
[![Edge IoT](https://img.shields.io/badge/Edge%20Fleet-4%20ESP32%20Bare--Metal%20Nodes-e7352c.svg?style=flat&logo=espressif)](../esp32/README.md)
[![Author](https://img.shields.io/badge/Hardware%20Architect-Moan%C4%83%20%C8%98tef%C4%83nu%C8%9B--Cornel-blue.svg?style=flat&logo=github)](https://github.com/stefanutc1)
[![University](https://img.shields.io/badge/University-Universitatea%20din%20Craiova%20%C2%B7%20FEAA-0284c7.svg?style=flat&logo=academia)](https://feaa.ucv.ro)

</div>

---

<div align="center">

## Executive Summary

</div>

This document describes the physical host hardware, compute chassis, power delivery, thermal envelopes, and embedded microcontrollers underpinning the `stefanutc1/infrastructure` platform. It serves as the primary reference for hardware capacity budgeting, failure domain mapping, and bare-metal disaster recovery planning.

---

<div align="center">

## 1. Physical Compute Hosts

</div>

<div align="center">

### Host: `proxmox` (Node 1 — Primary Hypervisor `pve_primary_x64`)

</div>

<div align="center">

#### Hardware Specifications

</div>

| Component | Engineering Specification |
| :--- | :--- |
| **Chassis** | Custom ATX Bare-Metal Tower Chassis |
| **Processor (CPU)** | Intel Core i3-10100F (Comet Lake) — 4 Cores / 8 Threads @ 3.60 GHz (4.30 GHz Turbo, 6MB Cache) |
| **Dedicated GPU** | NVIDIA GeForce GTX 1050 Ti — 4 GB GDDR5 VRAM (PCIe Passthrough to CT 102) |
| **System Memory (RAM)** | 12 GB DDR4 (1x 8GB + 1x 4GB @ 2666 MHz, non-ECC) |
| **Primary Storage** | 512 GB PCIe 3.0 NVMe M.2 Solid State Drive (`local-lvm`) |
| **Network Interface** | 1x Realtek RTL8111H PCIe Gigabit Ethernet (RJ-45) |
| **Power Supply Unit (PSU)** | Coldex 350W Pure Sine Wave Active PFC Power Supply |

<div align="center">

#### Capacity Notes

</div>
- **Memory Ceiling**: 12 GB DDR4 RAM is strictly budgeted: ~9,280 MB allocated to always-on production LXCs (100–106b) and OPNsense (VM 200), leaving ~3,000 MB permanent headroom for host kernel page caching and ZFS ARC.
- **GPU Acceleration**: The GTX 1050 Ti is dedicated via IOMMU passthrough to Container 102 (`ollama`) for local LLM inference (CUDA 12.x).
- **Storage Tier**: The 512 GB NVMe SSD hosts all latency-sensitive root filesystems and active PostgreSQL transaction ledgers.

<div align="center">

#### Software & Operating System

</div>
- **Hypervisor**: Proxmox VE 9.2 (Debian 12 base / Linux 6.8+ pve kernel).
- **Virtualization Engine**: QEMU/KVM 8.x + LXC unprivileged containerization.
- **Security Agent**: Wazuh Agent 4.14 + Prometheus Node Exporter.
- **Static IPv4**: `192.168.1.132` (VLAN 10 Management).

---

<div align="center">

### Host: `openmediavault` (Node 2 — Storage NAS `omv_nas`)

</div>

<div align="center">

#### Hardware Specifications

</div>

| Component | Engineering Specification |
| :--- | :--- |
| **Physical Machine** | ASUS X451MA Low-Power Laptop Server |
| **Processor (CPU)** | Intel Celeron N2830 (Bay Trail) — 2 Cores / 2 Threads @ 2.16 GHz (2.41 GHz Burst, 7.5W TDP) |
| **Integrated Graphics** | Intel HD Graphics (Bay Trail) |
| **System Memory (RAM)** | 2 GB DDR3L-1333 MHz SO-DIMM |
| **Primary Storage** | 500 GB 2.5" SATA II Mechanical HDD (ZFS Single-Disk Pool `omv_tank`) |
| **Network Interface** | 1x Realtek RTL8101E 100M/Gigabit Ethernet |
| **Power Supply Unit (PSU)** | External 19V / 2.37A (45W) AC Adapter with integrated Li-Ion battery buffer |

<div align="center">

#### Capacity Notes

</div>
- **Memory Ceiling**: 2 GB RAM strictly limits this host to low-overhead file serving (NFSv4 / SMBv3) and ZFS storage operations. Heavy background microservices are intentionally barred from this node.
- **Role**: Secondary backup target for Proxmox vzdump archives and household file shares.
- **Static IPv4**: `192.168.1.135` (VLAN 10 Management / Storage).

---

<div align="center">

### Host: `k8s-node-04` (Node 4 — Edge Kubernetes Worker)

</div>

<div align="center">

#### Hardware Specifications

</div>

| Component | Engineering Specification |
| :--- | :--- |
| **Chassis** | Custom ATX Legacy Micro-Tower Chassis |
| **Processor (CPU)** | AMD Athlon II X2 220 (Regor / Socket AM3) — 2 Cores / 2 Threads @ 2.80 GHz (65W TDP) |
| **Dedicated Graphics** | NVIDIA GeForce GTS 250 — 1 GB GDDR3 (256-bit bus, legacy compute) |
| **System Memory (RAM)** | 4 GB DDR3-1066 MHz (2x 2GB Dual-Channel) |
| **Primary Storage** | 80 GB 3.5" SATA II 7200 RPM HDD |
| **Network Interface** | 1x Realtek Gigabit Ethernet PCI-e Adapter |
| **Power Supply Unit (PSU)** | Standard ATX 450W Power Supply Unit |

<div align="center">

#### Capacity Notes

</div>
- **Memory Ceiling**: 4 GB DDR3 RAM is tuned strictly for lightweight container runtimes (`containerd`) and `k3s-agent` background processing. Pod memory limits are enforced via Kubernetes resource quotas.
- **Role**: Asynchronous batch job processing, Woodpecker CI runners, and stateless worker queue offloading.
- **Static IPv4**: `192.168.1.18` (VLAN 30 CyberLab / Worker).

---

<div align="center">

## 2. Embedded Microcontroller Fleet (`esp32/`)

</div>

All microcontrollers are powered by dual-core 32-bit Xtensa LX6 processors clocked at 240 MHz with 520 KB SRAM and 4 MB onboard SPI flash memory. Connected to **VLAN 50 (Isolated IoT Sensors)**:

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              ESP32 EDGE TELEMETRY FLEET                                │
├──────────────────────────┬──────────────────────────┬──────────────────────────────────┤
│ NODE 01: footprint       │ NODE 02: irrigation      │ NODE 03: datacenter_env          │
│ R307/R504 Fingerprint    │ 4-Zone Relay Driver      │ Bosch BME280 I2C                 │
│ Dual PIR Motion Detect   │ Capacitive Soil Probes   │ Dual DS18B20 1-Wire Delta-T      │
│ Ultrasonic HC-SR04       │ Pulse Flow Meter         │ Noctua 25kHz PWM Fan Driver      │
│ 12V Solenoid Gate Relay  │ Safety Hardware Timer    │ Native Prometheus /metrics (:80) │
│ IP: 192.168.50.21        │ IP: 192.168.50.22        │ IP: 192.168.50.23                │
├──────────────────────────┴──────────────────────────┴──────────────────────────────────┤
│ NODE 04: power_monitor                                                                 │
│ 230V AC Optocoupler Zero-Latency Interrupt · 12V SLA Battery Divider ADC               │
│ INA219 DC Power Monitor · Emergency Proxmox VE API Shutdown Trigger (<11.4V)           │
│ IP: 192.168.50.24                                                                      │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

Detailed schematic documentation, GPIO pinouts, and source code reside in [`esp32/README.md`](../esp32/README.md).

---

<div align="center">

## 3. Adding a New Host

</div>

When a new compute node joins the infrastructure:
1. Duplicate the `### Host: <name>` section above with complete hardware specifications.
2. Update the physical capacity budget in [`INFRASTRUCTURE.md`](../INFRASTRUCTURE.md).
3. Create corresponding host variable declarations in `ansible/inventories/homelab/host_vars/<hostname>.yml`.
4. Register the node's MAC address and static IP in NetBox (`services/x64/netbox`) and OPNsense DHCP reservation tables.

---

<div align="center">

*Engineered with precision by **Moană Ștefănuț-Cornel** (`@stefanutc1`).*  
*Universitatea din Craiova · Facultatea de Economie și Administrarea Afacerilor (FEAA) · Informatică Economică (2024–2027).*

</div>
