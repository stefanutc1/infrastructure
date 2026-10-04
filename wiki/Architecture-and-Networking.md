<div align="center">

# Architecture & Networking

</div>

<div align="center">

## 1. Subnetting & 802.1Q VLAN Topology

</div>

The network is segmented into isolated VLANs managed by the OPNsense core perimeter firewall (VM 200):

| VLAN ID | Subnet CIDR | Gateway IP | Segment Name | Workloads & Traffic Classification | Default Ingress Policy |
| :---: | :--- | :--- | :--- | :--- | :--- |
| **VLAN 10** | `192.168.1.0/24` | `192.168.1.1` / `134` | **Management & Storage** | Hypervisor consoles, IPMI, OPNsense WebGUI, NAS NFS/SMB storage, Wazuh SIEM. | **DROP** (mTLS & Sudoers Only) |
| **VLAN 20** | `192.168.20.0/24`| `192.168.20.1` | **Core Production** | Home Assistant, Nextcloud, Immich, Scrutiny, Ollama AI, Prometheus monitoring. | **DROP** (Explicit Whitelist Only) |
| **VLAN 30** | `192.168.30.0/24`| `192.168.30.1` | **CyberLab & Sandboxes** | Kali Linux pentest workstation, Metasploitable targets, Bachelor Thesis Core-Banking lab. | **DROP** (Strict Inter-VLAN Block) |
| **VLAN 40** | `192.168.40.0/24`| `192.168.40.1` | **DMZ & Honeypots** | T-Pot multi-honeypot decoy platform, public-facing reverse proxy honeypots. | **DROP** (Zero Lateral Movement) |
| **VLAN 50** | `192.168.50.0/24`| `192.168.50.1` | **Isolated IoT Sensors** | Bare-metal ESP32 microcontrollers (`192.168.50.21` to `.24`), smart plugs, Zigbee bridges. | **DROP** (No WAN Access, HA State Track Only) |

---

<div align="center">

## 2. Software-Defined Virtual Bridges

</div>

The primary hypervisor (Node 1) implements four virtual bridges:
- **`vmbr0` (WAN Ingress / Physical Uplink)**: Bound to physical interface `enp3s0` (`192.168.1.0/24`).
- **`vmbr1` (VLAN-Aware Trunk Bridge)**: Trunk parent with `vlan-aware 1` distributing 802.1Q tagged frames across all containers and VMs.
- **`vmbr2` (Point-to-Point Host Transit Bus)**: Low-latency `10.10.20.0/30` interconnect linking OPNsense (`10.10.20.1`) and Proxmox VE (`10.10.20.2`).
- **`vmbr3` (Isolated Deception Bridge)**: Standalone virtual switch with zero physical NIC attachments for malware detonation and honeypots.

---

<div align="center">

## 3. Reverse Proxy & Ingress Authentication Flow

</div>

All external and internal HTTP traffic is routed through Caddy / OPNsense Reverse Proxy and authenticated via mutual TLS (mTLS) or Keycloak SSO:

1. Client initiates TLS handshake to `https://service.lan`.
2. Reverse proxy validates client certificate against internal Certificate Authority (Smallstep Step-CA).
3. If valid, request is forwarded to backend container across internal VLANs with encrypted headers (`X-Forwarded-User`, `X-Forwarded-Email`).
4. Unauthorized requests lacking valid certificates or session cookies are rejected immediately with HTTP 403 Forbidden.
