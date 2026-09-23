# Enterprise Infrastructure & Hardware Fleet Inventory

## Executive Summary
This document provides the definitive, factual inventory of physical hardware, hypervisors, virtual machines, container fleets, edge compute, storage arrays, and network appliances comprising the `stefanutc1/infrastructure` platform. In strict observance of the **No Fake Enterprise** principle, all capacity ratings, memory figures, and workload operational states represent empirical engineering reality.

---

## 1. Physical Hardware Nodes

| Parameter | Node 1: Hypervisor (`pve_primary_x64`) | Node 2: Storage NAS (`omv_nas`) | Node 4: Edge Worker (`k8s_node_04`) |
| :--- | :--- | :--- | :--- |
| **System Model** | Custom Bare-Metal Workstation | ASUS X451MA Laptop Server | Custom Legacy Micro-Tower |
| **Primary Role** | Type-1 Hypervisor & Production Host | Central ZFS Storage & Backup Target | Lightweight Edge Kubernetes Node |
| **CPU Model** | Intel Core i3-10100F (Comet Lake) | Intel Celeron N2830 (Bay Trail) | AMD Athlon II X2 220 (Regor) |
| **CPU Architecture** | x86_64 (64-bit, AVX2, VT-x, AES-NI) | x86_64 (64-bit, VT-x, Low Power) | x86_64 (64-bit, AMD-V, Legacy) |
| **Cores / Threads** | 4 Cores / 8 Threads @ 3.60 GHz (4.3 Turbo) | 2 Cores / 2 Threads @ 2.16 GHz (2.41 Turbo)| 2 Cores / 2 Threads @ 2.80 GHz |
| **Dedicated GPU** | NVIDIA GeForce GTX 1050 Ti (4GB GDDR5) | Integrated Intel HD Graphics | NVIDIA GeForce GTS 250 (1GB GDDR3)|
| **System Memory** | 12 GB DDR4 (1x 8GB + 1x 4GB @ 2666 MHz) | 2 GB DDR3L (1333 MHz) | 4 GB DDR3 (1066 MHz) |
| **Primary Storage** | 512 GB NVMe PCIe M.2 SSD | 500 GB 2.5" SATA HDD (ZFS Pool) | 80 GB 3.5" SATA HDD (Ext4) |
| **Network NIC** | 1x Realtek RTL8111H Gigabit Ethernet | 1x Realtek Fast/Gigabit Ethernet | 1x Realtek Fast/Gigabit Ethernet |
| **Operating System** | Proxmox VE 9.2 (Debian 12 / Linux 6.8+) | OpenMediaVault 7 (Debian 12 / ZFS) | Debian 12 Minimal (Linux 6.1+) |
| **Static IPv4** | `192.168.1.132` | `192.168.1.135` | `192.168.1.18` |
| **Factual Status** | `DEPLOYED` (Active 24/7 Production) | `DEPLOYED` (Active 24/7 Production) | `DEPLOYED` (Active Edge Worker) |

---

## 2. Virtual Machine Fleet (KVM)

All virtual machines run under QEMU/KVM on Node 1 (`pve_primary_x64`).

| VMID | Name | Operating System | vCPU | Max RAM | Balloon RAM | Disk Size | Storage Pool | VLAN & IP | Factual Operational State |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **200** | `opnsense-firewall` | FreeBSD 14 / OPNsense 24.x | 2 | 2,048 MB | 1,024 MB | 16 GB | `local-lvm` | VLAN 10 (`192.168.1.134`) | `DEPLOYED` (Always-On) |
| **201** | `openstack` | Ubuntu 24.04 / Kolla OpenStack | 2 | 4,096 MB | 2,048 MB | 32 GB | `local-lvm` | VLAN 20 (`192.168.1.201`) | `DECLARED` (On-Demand Lab) |
| **202** | `metasploitable2` | Metasploitable 2 Linux Target | 1 | 512 MB | 512 MB | 8 GB | `local-lvm` | VLAN 20 (`192.168.1.202`) | `DECLARED` (On-Demand Lab) |
| **203** | `tpot-honeypot` | Debian 12 / T-Pot 24.04 Multi-Decoy | 4 | 8,192 MB | 4,096 MB | 60 GB | `local-lvm` | VLAN 40 (`192.168.1.203`) | `DECLARED` (On-Demand Lab) |
| **204** | `securityonion` | Security Onion 3.2 / Wazuh SIEM | 4 | 8,192 MB | 4,096 MB | 50 GB | `local-lvm` | VLAN 10 (`192.168.1.204`) | `DECLARED` (On-Demand Lab) |
| **205** | `remnux` | REMnux v7 / Ubuntu Malware DFIR | 2 | 4,096 MB | 2,048 MB | 40 GB | `local-lvm` | VLAN 30 (`192.168.1.205`) | `DECLARED` (On-Demand Lab) |
| **301** | `metasploitable-licenta` | Metasploitable Linux Target | 2 | 2,048 MB | 1,024 MB | 20 GB | `local-lvm` | VLAN 30 (`192.168.1.211`) | `DECLARED` (On-Demand Lab) |
| **302** | `kali-licenta` | Kali Linux Rolling Pentest Node | 2 | 4,096 MB | 2,048 MB | 30 GB | `local-lvm` | VLAN 30 (`192.168.30.102`) | `DECLARED` (On-Demand Lab) |
| **310** | `core-banking` | Debian 12 / Apache Fineract | 2 | 4,096 MB | 2,048 MB | 40 GB | `local-lvm` | VLAN 20 (`192.168.20.50`) | `DECLARED` (On-Demand Lab) |
| **311** | `banking-db` | Debian 12 / PostgreSQL 16 Ledger | 2 | 4,096 MB | 2,048 MB | 50 GB | `local-lvm` | VLAN 20 (`192.168.20.51`) | `DECLARED` (On-Demand Lab) |
| **313** | `swift-jumpbox` | Hardened Linux Bastion Host | 2 | 2,048 MB | 1,024 MB | 25 GB | `local-lvm` | VLAN 10 (`192.168.10.50`) | `DECLARED` (On-Demand Lab) |
| **400** | `ad2025` | Windows Server 2025 Datacenter | 6 | 8,192 MB | 4,096 MB | 256 GB | `local-lvm` | VLAN 10 (`192.168.1.225`) | `DECLARED` (On-Demand Lab) |
| **401** | `ad2022` | Windows Server 2022 Datacenter | 2 | 4,096 MB | 2,048 MB | 60 GB | `local-lvm` | VLAN 10 (`192.168.1.222`) | `DECLARED` (On-Demand Lab) |
| **402** | `ad2019` | Windows Server 2019 Standard | 2 | 2,048 MB | 1,024 MB | 128 GB | `local-lvm` | VLAN 10 (`192.168.1.219`) | `DECLARED` (On-Demand Lab) |
| **403** | `ad2016` | Windows Server 2016 Standard | 2 | 3,072 MB | 2,048 MB | 50 GB | `local-lvm` | VLAN 10 (`192.168.1.216`) | `DECLARED` (On-Demand Lab) |
| **404** | `ad2012` | Windows Server 2012 R2 Standard | 2 | 2,048 MB | 1,024 MB | 40 GB | `local-lvm` | VLAN 10 (`192.168.1.212`) | `DECLARED` (On-Demand Lab) |
| **405** | `ad2008` | Windows Server 2008 R2 SP1 Standard| 2 | 2,048 MB | 1,024 MB | 40 GB | `local-lvm` | VLAN 10 (`192.168.1.208`) | `DECLARED` (On-Demand Lab) |
| **406** | `adwin10` | Windows 10 Enterprise Client | 2 | 3,072 MB | 2,048 MB | 50 GB | `local-lvm` | VLAN 10 (`192.168.1.217`) | `DECLARED` (On-Demand Lab) |
| **407** | `adwin11` | Windows 11 Enterprise Client | 2 | 4,096 MB | 2,048 MB | 60 GB | `local-lvm` | VLAN 10 (`192.168.1.218`) | `DECLARED` (On-Demand Lab) |
| **408** | `adwin7` | Windows 7 Ultimate SP1 Client | 2 | 2,048 MB | 1,024 MB | 50 GB | `local-lvm` | VLAN 10 (`192.168.1.207`) | `DECLARED` (On-Demand Lab) |
| **409** | `adrhel` | RHEL 9.8 Enterprise Domain Workload| 2 | 2,048 MB | 1,024 MB | 50 GB | `local-lvm` | VLAN 10 (`192.168.1.228`) | `DECLARED` (On-Demand Lab) |
| **410** | `ad2003` | Windows Server 2003 R2 Enterprise | 2 | 2,048 MB | 1,024 MB | 40 GB | `local-lvm` | VLAN 10 (`192.168.1.209`) | `DECLARED` (On-Demand Lab) |

---

## 3. LXC Container Fleet

All containers execute on Node 1 (`pve_primary_x64`) sharing the Proxmox Linux kernel.

| CTID | Hostname | Role / Service | OS Template | Allocated RAM | Root Disk | Unprivileged? | Network & IP | Factual Operational State |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **100** | `homeassistant` | Smart Home & Zigbee Hub | Debian 12 | 384 MB | 16 GB | Yes | VLAN 20 (`192.168.1.10`) | `DEPLOYED` (Always-On) |
| **101** | `scrutiny` | SMART Disk Health Daemon | Debian 12 | 128 MB | 4 GB | Yes | VLAN 20 (`192.168.1.108`)| `DEPLOYED` (Always-On) |
| **102** | `ollama` | Local GPU AI Inference | Debian 12 | 2,048 MB | 16 GB | No (GPU) | VLAN 20 (`192.168.1.110`)| `DEPLOYED` (Always-On) |
| **103** | `uptimekuma` | Service Health & Probing | Debian 12 | 128 MB | 2 GB | Yes | VLAN 20 (`192.168.1.119`)| `DEPLOYED` (Always-On) |
| **104** | `monitoring` | Prometheus & Grafana Stack | Debian 12 | 1,024 MB | 20 GB | Yes | VLAN 20 (`192.168.1.121`)| `DEPLOYED` (Always-On) |
| **105** | `media-suite` | Media Streaming (Jellyfin) | Debian 12 | 896 MB | 50 GB | Yes | VLAN 20 (`192.168.1.21`) | `DEPLOYED` (Always-On) |
| **106** | `wazuh` | Wazuh SIEM / HIDS Server | Debian 12 | 1,536 MB | 30 GB | Yes | VLAN 10 (`192.168.1.240`)| `DEPLOYED` (Always-On) |
| **101b**| `nextcloud` | File Sync & Collaboration | Debian 12 | 512 MB | 20 GB | Yes | VLAN 20 (`192.168.1.8`) | `DEPLOYED` (Always-On) |
| **100b**| `immich` | Photo & Media Backup | Debian 12 | 896 MB | 40 GB | Yes | VLAN 20 (`192.168.1.15`) | `DEPLOYED` (Always-On) |
| **161** | `minio` | S3-Compatible Object Storage| Alpine 3.19 | 256 MB | 10 GB | Yes | VLAN 20 (`192.168.1.161`)| `DEPLOYED` (Always-On) |
| **175** | `owasp-core` | Pentest Target (Juice Shop)| Alpine 3.19 | 512 MB | 8 GB | Yes | VLAN 30 (`192.168.1.175`)| `DECLARED` (On-Demand Lab) |
| **303** | `owasp-licenta`| Bachelor Thesis Web Target | Alpine 3.19 | 512 MB | 8 GB | Yes | VLAN 30 (`192.168.30.103`)| `DECLARED` (On-Demand Lab) |
| **312** | `payment-gw` | Bachelor Thesis Payment API| Debian 12 | 512 MB | 10 GB | Yes | VLAN 20 (`192.168.20.52`)| `DECLARED` (On-Demand Lab) |

---

## 4. Physical Capacity Budget & Memory Footprint Analysis

### 4.1 Node 1 (`pve_primary_x64` — 12,288 MB Total DDR4 RAM)

```text
Total Physical RAM: 12,288 MB (100.0%)
┌─────────────────────────────────────────────────────────────┬──────────────┐
│ Always-On Production Workloads (Active 24/7): ~9,280 MB    │ Headroom     │
│ (75.5% Physical Capacity)                                   │ ~3,008 MB    │
│                                                             │ (24.5% Free) │
└─────────────────────────────────────────────────────────────┴──────────────┘
  ├─ Proxmox VE Host OS & Kernel Cache: 1,500 MB
  ├─ VM 200 (OPNsense Firewall & Suricata DPI): 1,536 MB (balloon 1024-2048)
  ├─ CT 102 (Ollama AI Inference Runtime): 2,048 MB (GPU handles weights)
  ├─ CT 106 (Wazuh HIDS Server): 1,536 MB
  ├─ CT 104 (Prometheus & Grafana Observability): 1,024 MB
  ├─ CT 105 (Media Suite / Jellyfin): 896 MB
  ├─ CT 100b (Immich Photos): 896 MB
  ├─ CT 101b (Nextcloud Hub): 512 MB
  ├─ CT 100 (Home Assistant Core): 384 MB
  ├─ CT 161 (MinIO S3 Gateway): 256 MB
  ├─ CT 101 (Scrutiny Disk Health): 128 MB
  ├─ CT 103 (Uptime Kuma Availability): 128 MB
  └─ Ingress & Telemetry Proxies: 128 MB
```

### 4.2 On-Demand Lab Isolation Strategy
Because total declared RAM across on-demand workloads (AD Forest: 35GB, Bachelor Thesis: 14GB, Security Onion + T-Pot: 16GB) exceeds physical RAM:
1. All research VMs start with default state `STOPPED`.
2. Interactive scripts (`scripts/licenta-lab-start.sh`, `scripts/ad-lab-start.sh`) verify that free physical host memory is at least **2,500 MB** before booting any lab VM.
3. Maximum 2 lab VMs may run concurrently.
