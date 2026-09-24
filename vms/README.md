# 🖥️ Proxmox VE Virtual Machines (KVM)

This directory contains declarative specifications, automated provisioning scripts, and infrastructure-as-code configurations for all **KVM Virtual Machines** deployed on the Proxmox VE hypervisor cluster.

---

## 📋 Virtual Machine Inventory Matrix

| VMID | Name | Operating System | vCPUs | RAM (Alloc/Max) | Boot Disk | Primary Network | Primary Protocol | Role / Function |
| :---: | :--- | :--- | :---: | :---: | :---: | :--- | :--- | :--- |
| **200** | `opnsense` | FreeBSD 14.x / OPNsense | 2 | 2048 MB | 16 GB SSD | `vmbr1` (LAN) & `vmbr0` (WAN) | WebGUI (`:8443`), SSH | Core Gateway, NAT, HAProxy, WireGuard |
| **201** | `windows-server` | Windows Server 2022 / 2025 | 2 | 3072 MB | 40 GB NVMe | `vmbr0` (Management) | RDP (`:3389`), WinRM (`:5985`) | Active Directory DS, DNS, Windows Management |
| **202** | `ubuntu-server` | Ubuntu Server 24.04 LTS | 2 | 2048 MB | 25 GB NVMe | `vmbr0` (Management) | SSH (`:22`), QEMU Guest Agent | Cloud-Init Microservices, Automation, Docker |

---

## 🔐 Access Standards & Secrets Policy

All virtual machine templates and automated provisioning scripts enforce zero-plaintext credential standards:

- **Primary Administrator User:** `<admin_user>` (Configured via SOPS / Cloud-Init)
- **Secret Management:** Vaultwarden & Encrypted Secrets Repository
- **Authorized SSH Keys:** `~/.ssh/id_ed25519.pub` (injected via Cloud-Init metadata)

---

## 📂 Subdirectories & Provisioning Modules

- **[`windows-server/`](./windows-server/)**: Automated unattended answer files (`autounattend.xml`), VirtIO SCSI drivers integration, and Proxmox `qm` hardware definitions.
- **[`ubuntu-server/`](./ubuntu-server/)**: Ubuntu 24.04 Noble Numbat Cloud-Init (`user-data`, `meta-data`), QEMU guest agent automation, and fast-clone provisioning scripts.
- **[`opnsense/`](./opnsense/)**: Core virtual firewall gateway routing rules, VLAN trunking, and high-availability configuration.
