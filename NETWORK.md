# Enterprise Network Architecture & Zero Trust Segmentation

<div align="center">

[![Network](https://img.shields.io/badge/Network-Enterprise%20Zero--Trust%20Architecture-0f172a.svg?style=flat&logo=cisco)](#)
[![Firewall](https://img.shields.io/badge/Firewall-OPNsense%20Dual--Perimeter-f26522.svg?style=flat&logo=opnsense)](https://opnsense.org)
[![VLANs](https://img.shields.io/badge/Segmentation-802.1Q%20Micro--Segmentation-0052cc.svg?style=flat&logo=wireshark)](#2-8021q-vlan-segmentation-matrix)
[![IoT Containment](https://img.shields.io/badge/IoT%20Isolation-VLAN%2050%20Air--Gapped%20WAN-e7352c.svg?style=flat&logo=espressif)](esp32/README.md)
[![DNS Security](https://img.shields.io/badge/DNS-Unbound%20DoT%20%2B%20DNSC%20Sinkhole-10b981.svg?style=flat&logo=cloudflare)](#5-domain-name-resolution-dns-architecture)
[![Author](https://img.shields.io/badge/Network%20Architect-Moan%C4%83%20%C8%98tef%C4%83nu%C8%9B--Cornel-blue.svg?style=flat&logo=github)](https://github.com/stefanutc1)
[![University](https://img.shields.io/badge/University-Universitatea%20din%20Craiova%20%C2%B7%20FEAA-0284c7.svg?style=flat&logo=academia)](https://feaa.ucv.ro)

</div>

---

## Executive Summary

This document defines the comprehensive network topology, software-defined virtual bridge interfaces, inter-firewall transit architecture, 802.1Q VLAN micro-segmentation, Zero-Trust access control rules, VPN overlays, and DNS resolution infrastructure governing the `stefanutc1/infrastructure` platform.

The network architecture is built on the principle of **Default-DROP**: no packet is routed between segments without an explicit, stateful firewall pass rule.

---

## 1. Network Topology & Virtual Bridges

The primary hypervisor (Node 1) implements four software-defined virtual bridges managed by Proxmox VE and FreeBSD VirtIO drivers:

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              PROXMOX VE HYPERVISOR (NODE 1)                            │
│                                                                                        │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐       │
│  │    vmbr0     │     │    vmbr1     │     │    vmbr2     │     │    vmbr3     │       │
│  │   WAN Edge   │     │  LAN Trunk   │     │ Transit Link │     │ Isolated DMZ │       │
│  │  192.168.1.0 │     │   VLAN-Aware │     │ 10.10.20.0/30│     │  No Gateway  │       │
│  └──────┬───────┘     └──────┬───────┘     └──────┬───────┘     └──────┬───────┘       │
└─────────┼────────────────────┼────────────────────┼────────────────────┼───────────────┘
          │                    │                    │                    │
          ▼                    ▼                    ▼                    ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        OPNSENSE CORE PERIMETER FIREWALL (VM 200)                       │
│                                                                                        │
│  Interface vtnet0     Interface vtnet1     Interface vtnet2     Interface vtnet3       │
│  (WAN / Uplink)       (VLAN Trunk Parent)  (Transit Interconnect)(DMZ Honeypot Decoys) │
│  IP: 192.168.1.134    Sub-Interfaces 10-50 IP: 10.10.20.1/30    Isolated Bridge        │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### Bridge Interface Specifications
1. **`vmbr0` (Physical Ingress / WAN Uplink)**:
   - Physical Port: Realtek RTL8111H gigabit interface (`enp3s0`).
   - Network Subnet: `192.168.1.0/24`, Default Gateway: `192.168.1.1` (ISP Fiber Router).
   - Proxmox Host Static IP: `192.168.1.132/24`.
   - OPNsense WAN Static IP: `192.168.1.134/24`.
2. **`vmbr1` (Internal VLAN-Aware Trunk)**:
   - Configuration: `vlan-aware 1`.
   - Distributes tagged layer-2 frames across VLANs 10, 20, 30, 40, and 50 for all virtual machines and LXC containers.
3. **`vmbr2` (Inter-Firewall Point-to-Point Transit Bus)**:
   - Dedicated Point-to-Point Subnet: `10.10.20.0/30` (Netmask `255.255.255.252`).
   - OPNsense Transit Interface: `10.10.20.1`.
   - Proxmox VE Host Transit Interface: `10.10.20.2`.
   - Architectural Purpose: Delivers line-rate packet inspection, direct API metric scraping, and bypasses physical switch ports for inter-firewall communication.
4. **`vmbr3` (Isolated Deception DMZ)**:
   - Configuration: Pure virtual software bridge with zero physical NIC bindings and no upstream default gateway.
   - Architectural Purpose: Quarantines high-interaction malware detonation sandboxes (REMnux VM 205) and multi-decoy honeypots (T-Pot VM 203) without risk of packet leakage to production networks.

---

## 2. 802.1Q VLAN Segmentation Matrix

| VLAN ID | Subnet CIDR | Gateway IP | Segment Name | Traffic Classification & Workloads | Default Ingress Policy |
| :---: | :--- | :--- | :--- | :--- | :--- |
| **VLAN 10** | `192.168.1.0/24` | `192.168.1.1` / `134` | **Management & Storage** | Hypervisor consoles, IPMI, OPNsense WebGUI, NAS NFS/SMB storage, Wazuh SIEM. | **DROP** (mTLS & Sudoers Only) |
| **VLAN 20** | `192.168.20.0/24`| `192.168.20.1` | **Core Production** | Home Assistant, Nextcloud, Immich, Scrutiny, Ollama AI, Prometheus monitoring. | **DROP** (Explicit Whitelist Only) |
| **VLAN 30** | `192.168.30.0/24`| `192.168.30.1` | **CyberLab & Sandboxes** | Kali Linux pentest workstation, Metasploitable targets, Bachelor Thesis Core-Banking lab. | **DROP** (Strict Inter-VLAN Block) |
| **VLAN 40** | `192.168.40.0/24`| `192.168.40.1` | **DMZ & Honeypots** | T-Pot multi-honeypot decoy platform, public-facing reverse proxy honeypots. | **DROP** (Zero Lateral Movement) |
| **VLAN 50** | `192.168.50.0/24`| `192.168.50.1` | **Isolated IoT Sensors** | Bare-metal ESP32 microcontrollers (`192.168.50.21` to `.24`), smart plugs, Zigbee bridges. | **DROP** (No WAN Access, HA State Track Only) |

### ESP32 Edge Device Static Allocation (VLAN 50)
- **`192.168.50.21`**: `ESP32-EDGE-01` (`footprint` — optical fingerprint scanner, dual PIR, gate solenoid, OLED).
- **`192.168.50.22`**: `ESP32-EDGE-02` (`irrigation` — 4-zone optocoupler relays, capacitive moisture probes, pulse flow meter).
- **`192.168.50.23`**: `ESP32-EDGE-03` (`datacenter_environment` — BME280, dual DS18B20 1-Wire Delta-T, Noctua PWM driver, Prometheus `/metrics`).
- **`192.168.50.24`**: `ESP32-EDGE-04` (`power_monitor` — 230V AC optocoupler mains interrupt, 12V battery ADC, emergency shutdown trigger).

---

## 3. Zero Trust Firewall Policies & Rule Matrix

All traffic transiting between network segments is evaluated under the **Default-DROP Posture**.

```text
               ┌────────────────────────────────────────────────────────┐
               │              STATEFUL FIREWALL RULESET                 │
               ├────────────────────────────────────────────────────────┤
               │ Source        Target          Protocol  Action         │
               │ ────────────────────────────────────────────────────── │
               │ Any           WAN             ICMP/DNS  PASS (via DoT) │
               │ VLAN 10       All VLANs       Any       PASS (Admin)   │
               │ VLAN 20       VLAN 10 (NAS)   NFS/SMB   PASS (Backups) │
               │ VLAN 20       VLAN 10 (Prom)  9100/TCP  PASS (Metrics) │
               │ VLAN 30       VLAN 10 / 20    ANY       DROP & LOG     │
               │ VLAN 40       Internal LAN    ANY       DROP & LOG     │
               │ VLAN 50       WAN (Internet)  ANY       DROP & LOG     │
               │ VLAN 20 (HA)  VLAN 50 (IoT)   TCP/UDP   PASS (Stateful)│
               │ Any           Any             ANY       DEFAULT DROP   │
               └────────────────────────────────────────────────────────┘
```

### Specific Segment Protections
1. **VLAN 30 (CyberLab Quarantine)**:
   - Research workloads (Kali Linux VM 302, Metasploitable VM 301, Bachelor's Thesis banking testbeds) cannot initiate connections to VLAN 10 (Hypervisor Management) or VLAN 20 (Core Household Services).
   - Any attempt to scan or probe `192.168.1.0/24` triggers a Suricata alert (`SID 1000003`) and an automated Wazuh active-response firewall drop.
2. **VLAN 50 (IoT Containment)**:
   - Microcontrollers on VLAN 50 are strictly barred from outbound Internet transit.
   - Firmware phone-home attempts and unauthorized DNS queries are sinkholed by Unbound.
   - Home Assistant (VLAN 20) communicates with IoT devices across the firewall boundary using stateful connection tracking.

---

## 4. VPN Remote Access & Hybrid Cloud Tunnels

### 4.1 WireGuard Site-to-Site Gateway (`wg-cloud0`)
- **Protocol**: WireGuard (ChaCha20-Poly1305, Curve25519).
- **Listening Port**: `51820/UDP`.
- **Tunnel Subnet**: `10.88.0.0/24` (Gateway: `10.88.0.1`).
- **Cryptographic Key Rotation**: Automated via `scripts/wireguard_key_rotation.sh` every 90 days.
- **Allowed IPs**: Restricted to authorized administrative bastion IPs and hybrid cloud VPC CIDRs (AWS/Azure/GCP).

### 4.2 Tailscale Zero-Trust Mesh Router
- **Role**: Secure, NAT-traversing administrative access for mobile devices and out-of-band diagnostics.
- **Authentication**: Modern OIDC multi-factor authentication.
- **Access Control (ACLs)**: Enforces least-privilege tags (`tag:admin` can reach Proxmox console; `tag:media` can only reach Jellyfin on port 8096).

---

## 5. Domain Name Resolution (DNS) Architecture

### 5.1 Unbound Recursive Resolver (OPNsense)
- **Local Namespace**: Authoritative for `*.lan` and `*.stefanut.lan`.
- **Upstream Forwarding**: Encrypted DNS-over-TLS (DoT) upstream to Quad9 (`9.9.9.9:853` and `149.112.112.112:853`) with TLS hostname verification (`dns.quad9.net`).
- **DNSSEC Validation**: Enforced; unsigned or tampered DNS records are rejected.

### 5.2 Threat Intelligence Sinkholing (RPZ / Blacklists)
- Automated synchronization via `scripts/sync_opnsense_blocklist.py` and `scripts/sync_forbidden_domains.py`.
- Ingests:
  1. Romanian National Cyber Security Directorate (**DNSC**) fraud blocklist (`cyber/mediagalaxy-ecommerce-fraud-forensics/dnsc_blacklist.json`).
  2. CERT-EU / URLhaus malicious domain feed.
  3. Five Eyes CSIRT coalition indicators (ThreatFox).
- Malicious domains are sinkholed to `0.0.0.0` (NXDOMAIN response).

---

<div align="center">

*Engineered with precision by **Moană Ștefănuț-Cornel** (`@stefanutc1`).*  
*Universitatea din Craiova · Facultatea de Economie și Administrarea Afacerilor (FEAA) · Informatică Economică (2024–2027).*

</div>
