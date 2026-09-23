# Enterprise Network Architecture & Zero Trust Segmentation

## Executive Summary
This document defines the comprehensive network architecture, virtual bridge topologies, inter-firewall transit links, 802.1q VLAN micro-segmentation, Zero Trust access policies, VPN overlays, and DNS resolution infrastructure for the `stefanutc1/infrastructure` platform.

---

## 1. Network Topology & Virtual Bridges

The primary hypervisor (Node 1) implements four software-defined virtual bridges managed by Proxmox VE and FreeBSD VirtIO:

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
1. **`vmbr0` (Physical Ingress / WAN)**:
   - Physical Port: Realtek RTL8111H gigabit port (`enp3s0`).
   - Network: `192.168.1.0/24`, Gateway: `192.168.1.1` (ISP Router).
   - Proxmox Host Static IP: `192.168.1.132/24`.
   - OPNsense WAN Static IP: `192.168.1.134/24`.
2. **`vmbr1` (Internal VLAN-Aware Trunk)**:
   - Configuration: `vlan-aware 1`.
   - Serves as the trunk bridge for all internal virtual machines and LXC containers. Tagged sub-interfaces distribute traffic across VLANs 10, 20, 30, 40, and 50.
3. **`vmbr2` (Inter-Firewall Point-to-Point Transit Bus)**:
   - Dedicated transit subnet: `10.10.20.0/30` (Netmask `255.255.255.252`).
   - OPNsense Transit Interface: `10.10.20.1`.
   - Proxmox VE Host Transit Interface: `10.10.20.2`.
   - Purpose: Enables low-latency stateful inspection, direct API metric scraping, and bypasses physical switch ports for inter-firewall communication.
4. **`vmbr3` (Isolated Deception DMZ)**:
   - Configuration: Standalone bridge with zero physical NIC bindings and no upstream routing.
   - Purpose: Hosts high-interaction malware analysis sandboxes (REMnux VM 205) and T-Pot honeypots without risk of packet leakage to production networks.

---

## 2. 802.1q VLAN Segmentation Matrix

| VLAN ID | Subnet CIDR | Gateway IP | Segment Name | Traffic Classification & Purpose | Default Ingress Policy |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **VLAN 10** | `192.168.1.0/24` | `192.168.1.1` / `134` | **Management & Storage** | Hypervisor consoles, IPMI, OPNsense WebGUI, NAS NFS/SMB storage, Wazuh SIEM. | **DROP** (mTLS & Sudoers Only) |
| **VLAN 20** | `192.168.20.0/24`| `192.168.20.1` | **Core Production** | Home Assistant, Nextcloud, Immich, Scrutiny, Ollama AI, Prometheus monitoring. | **DROP** (Explicit Whitelist Only)|
| **VLAN 30** | `192.168.30.0/24`| `192.168.30.1` | **CyberLab & Sandboxes**| Kali Linux pentest workstation, Metasploitable targets, Bachelor thesis testbeds. | **DROP** (Strict Inter-VLAN Block) |
| **VLAN 40** | `192.168.40.0/24`| `192.168.40.1` | **DMZ & Honeypots** | T-Pot multi-honeypot decoy platform, public-facing reverse proxy honeypots. | **DROP** (Zero Lateral Movement) |
| **VLAN 50** | `192.168.50.0/24`| `192.168.50.1` | **Isolated IoT Sensors**| Smart plugs, ESPHome microcontrollers, Zigbee bridges, IP cameras. | **DROP** (No Internet, HA Poll Only) |

---

## 3. Zero Trust Firewall Policies & Rule Matrix

All traffic transiting between network segments is evaluated under the **Default-DROP Posture**. No inter-VLAN traffic is permitted unless explicitly matched by a stateful pass rule.

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
   - Research VMs (Kali Linux VM 302, Metasploitable VM 301) are prohibited from establishing connections to VLAN 10 (Hypervisor Management) or VLAN 20 (Household Services).
   - Any attempt to probe `192.168.1.0/24` triggers a Suricata high-severity alert (`SID 1000003`) and initiates an automated Wazuh active-response firewall block.
2. **VLAN 50 (IoT Containment)**:
   - IoT devices are blocked from initiating outbound connections to the Internet.
   - Firmware phone-home attempts and cloud telemetry are sinkholed by Unbound DNS.
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
- Malicious domains are resolved to `0.0.0.0` (NXDOMAIN sinkhole).
