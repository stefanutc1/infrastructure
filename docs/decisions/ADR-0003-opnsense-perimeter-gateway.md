# ADR-0003: Virtualized OPNsense Dual-Perimeter Gateway with Bridge Transit

## Status
**Accepted**

## Context
A robust enterprise and research infrastructure requires enterprise-grade network perimeter security, including:
1. Deep Packet Inspection (DPI) and Network Intrusion Detection/Prevention (NIDS/IPS) via Suricata.
2. IP reputation filtering and automated brute-force threat remediation via CrowdSec.
3. Secure remote site-to-site and client VPN access via WireGuard and Tailscale.
4. Authoritative internal split-horizon DNS resolution with upstream DNS-over-TLS (DoT) encryption via Unbound.
5. Strict 802.1q VLAN micro-segmentation separating production workloads from research malware sandboxes and IoT devices.

Acquiring a dedicated physical enterprise firewall appliance (such as Netgate, FortiGate, or Sophos) would require additional hardware cost, power consumption, and physical cabling. Conversely, running firewall rules solely via host iptables/nftables lacks a unified telemetry interface, stateful DPI, and web management plane.

## Decision
We deploy **OPNsense as a Virtual Machine (VM 200)** directly on Proxmox VE Node 1, integrated into a **Dual-Perimeter Network Transit Architecture**.

Key architecture components:
1. **Virtual Bridge Topology**:
   - `vmbr0` (WAN): Bound to the physical NIC interface connected to the ISP gateway (192.168.1.1).
   - `vmbr1` (LAN Trunk): Internal 802.1q trunk bridge distributing tagged traffic to VLAN 10 (Management), VLAN 20 (Core), VLAN 30 (Cyber), VLAN 40 (DMZ), and VLAN 50 (IoT).
   - `vmbr2` (Transit Link): Isolated point-to-point interconnect (`10.10.20.0/30`) bridging the Proxmox VE host firewall to OPNsense, enabling mutual inspection and failover telemetry.
   - `vmbr3` (DMZ Deception): Isolated bridge for honeypot and decoy workloads.
2. **Resource Allocation**: VM 200 is configured with 2 vCPUs, 2,048MB maximum RAM with dynamic VirtIO memory ballooning down to 1,024MB during idle conditions.
3. **Defense-in-Depth Layering**: Traffic entering the physical host must pass both the Proxmox VE host firewall (L2/L3 ebtables/iptables filter) and the OPNsense stateful packet filter before reaching any internal container or VM.

## Consequences

### Positive
- **Enterprise Security Capabilities**: Full Suricata DPI, CrowdSec blocklists, Unbound DNS-over-TLS, and WireGuard tunnels without purchasing physical appliances.
- **Micro-Segmentation**: Dynamic policy enforcement preventing lateral movement from compromised research VMs (VLAN 30) into management or production subnets.
- **Port Mirroring & Telemetry**: Native NetFlow / IPFIX export to the monitoring stack and Security Onion SIEM.

### Negative
- **Single Point of Failure (Hypervisor Dependency)**: If Node 1 reboots, the entire network routing and DNS plane goes down until VM 200 boots. (Mitigated via cold-boot sequencing scripts assigning boot order 1 to VM 200).
- **FreeBSD VirtIO Tuning**: Requires careful tuning of VirtIO hardware checksum offloading in OPNsense to prevent packet drop issues.
