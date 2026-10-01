# Proxmox VE Virtual Machine Fleet (KVM)

<div align="center">

[![Virtualization](https://img.shields.io/badge/Virtualization-QEMU%20%2F%20KVM%20Hypervisor-0f172a.svg?style=flat&logo=proxmox)](https://www.proxmox.com)
[![Host Node](https://img.shields.io/badge/Host-Node%201%20(pve__primary__x64)-blue.svg?style=flat)](#)
[![Disk Provisioning](https://img.shields.io/badge/Storage-NVMe%20local--lvm%20(TRIM%20Discard)-059669.svg?style=flat&logo=speedtest)](#)
[![Memory Optimization](https://img.shields.io/badge/Memory-VirtIO%20Dynamic%20Ballooning-8b5cf6.svg?style=flat)](#)

</div>

---

## Executive Summary

This directory contains declarative hardware specifications, cloud-init configurations, automated unattended answer files, and provisioning scripts for all **KVM Virtual Machines** deployed on the primary Proxmox VE hypervisor host (`pve_primary_x64`).

---

## 1. Virtual Machine Inventory Matrix

| VMID | Hostname | Operating System | vCPUs | RAM (Alloc / Balloon) | Boot Disk | Network Bridge | Primary Protocols | Operational Role |
| :---: | :--- | :--- | :---: | :---: | :---: | :--- | :--- | :--- |
| **200** | `opnsense` | FreeBSD 14.x / OPNsense 24.x | 2 | 2,048 MB / 1,024 MB | 16 GB SSD | `vmbr0` (WAN), `vmbr1` (LAN) | WebGUI (`:8443`), SSH (`:22`) | Core Gateway, NAT, Suricata DPI, WireGuard |
| **201** | `windows-server` | Windows Server 2022 / 2025 | 2 | 3,072 MB / 2,048 MB | 40 GB NVMe | `vmbr1` (VLAN 10) | RDP (`:3389`), WinRM (`:5985`) | Active Directory DS, Kerberos DC, GPO Management |
| **202** | `ubuntu-server` | Ubuntu Server 24.04 LTS | 2 | 2,048 MB / 1,024 MB | 25 GB NVMe | `vmbr1` (VLAN 10) | SSH (`:22`), QEMU Guest Agent | Cloud-Init Microservices, Automation, Docker |

---

## 2. Access Standards & Secrets Management

All virtual machine templates and automated provisioning scripts enforce zero-plaintext credential hygiene:
- **Primary Administrative Account**: Configured via SOPS / Cloud-Init metadata or LAPS.
- **SSH Key Authentication**: Ed25519 public keys (`~/.ssh/id_ed25519.pub`) injected at boot; password authentication disabled.
- **Secrets Store**: Secrets and tokens managed via Vaultwarden and HashiCorp Vault.

---

## 3. Subdirectories & Provisioning Modules

- **[`opnsense/`](./opnsense/)**: Core perimeter gateway firewall rules, VLAN trunking, and high-availability configuration.
- **[`ubuntu-server/`](./ubuntu-server/)**: Ubuntu 24.04 Noble Numbat Cloud-Init (`user-data`, `meta-data`), QEMU guest agent automation, and fast-clone provisioning scripts.
- **[`windows-server/`](./windows-server/)**: Automated unattended answer files (`autounattend.xml`), VirtIO SCSI driver integration, and Proxmox `qm` hardware definitions.
