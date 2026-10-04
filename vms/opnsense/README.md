<div align="center">

# OPNsense Core Perimeter Gateway & Firewall (VM 200)

</div>

<div align="center">

[![Firewall](https://img.shields.io/badge/Security-OPNsense%2024.x%20Gateway-f26522.svg?style=flat&logo=opnsense)](https://opnsense.org)
[![VMID](https://img.shields.io/badge/VMID-200-blue.svg?style=flat)](#)
[![OS](https://img.shields.io/badge/OS-FreeBSD%2014%20(VirtIO)-red.svg?style=flat&logo=freebsd)](#)
[![Memory](https://img.shields.io/badge/RAM-2048MB%20(Balloon%201024MB)-8b5cf6.svg?style=flat)](#)

</div>

---

<div align="center">

## Executive Summary

</div>

Declarative hardware specifications, bridge assignments, and provisioning parameters for the primary **OPNsense Core Virtual Firewall** deployed on Proxmox VE (Node 1).

---

<div align="center">

## 1. Hardware Specifications

</div>

- **Proxmox VMID**: `200`
- **Hostname**: `opnsense-firewall`
- **vCPU Allocation**: 2 Cores (`cpu: host`)
- **Memory Allocation**: 2,048 MB (VirtIO Dynamic Ballooning down to 1,024 MB)
- **Primary Boot Disk**: `local-lvm:vm-200-disk-0`, Size: 16 GB SSD (`discard=on,ssd=1`)
- **Virtual Interfaces**:
  - `vtnet0` (`vmbr0`): Physical WAN uplink (`192.168.1.134/24`)
  - `vtnet1` (`vmbr1`): 802.1Q VLAN Trunk parent (Sub-interfaces: VLAN 10, 20, 30, 40, 50)
  - `vtnet2` (`vmbr2`): Host Transit Point-to-Point Link (`10.10.20.1/30`)
  - `vtnet3` (`vmbr3`): Isolated Deception DMZ bridge (No Gateway)
- **Administrative Interface**: WebGUI on port `8443/TCP` (Protected by MFA and client certificates).
