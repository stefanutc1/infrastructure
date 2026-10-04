<div align="center">

# Ubuntu Server 24.04 LTS Cloud-Init Virtual Machine (VM 202)

</div>

<div align="center">

[![VM](https://img.shields.io/badge/Virtual%20Machine-Ubuntu%20Server%2024.04%20LTS-e95420.svg?style=flat&logo=ubuntu)](https://ubuntu.com)
[![VMID](https://img.shields.io/badge/VMID-202-blue.svg?style=flat)](#)
[![Cloud-Init](https://img.shields.io/badge/Provisioning-Automated%20Cloud--Init-10b981.svg?style=flat&logo=canonical)](#)
[![Agent](https://img.shields.io/badge/Guest%20Agent-QEMU%20Agent%20Active-8b5cf6.svg?style=flat)](#)

</div>

---

<div align="center">

## Executive Summary

</div>

Declarative hardware specifications, cloud-init provisioning metadata, and deployment automation for Ubuntu Server 24.04 LTS (Noble Numbat) on Proxmox VE (Node 1).

---

<div align="center">

## 1. Hardware Specifications

</div>

- **Proxmox VMID**: `202`
- **Hostname**: `ubuntu-server-2404`
- **vCPU Allocation**: 2 Cores (`cpu: host`, NUMA enabled)
- **Memory Allocation**: 2,048 MB (VirtIO Dynamic Ballooning: 1,024 MB – 2,048 MB)
- **SCSI Controller**: `virtio-scsi-single` (SSD emulation enabled, `discard=on`)
- **Primary Disk**: `local-lvm:vm-202-disk-0`, Size: 25 GB NVMe
- **Cloud-Init Storage**: `ide2` (`local-lvm:vm-202-cloudinit`)
- **Network Interface**: `virtio,bridge=vmbr1,tag=10,firewall=1`
- **Guest Integration**: QEMU Guest Agent enabled (`qemu-guest-agent`)

---

<div align="center">

## 2. Access & Authentication

</div>

- **Primary User**: `<admin_user>`
- **Authentication**: Ed25519 SSH Key (`~/.ssh/id_ed25519.pub`)
- **Static IPv4**: `192.168.1.202/24` (VLAN 10, Gateway: `192.168.1.134`, DNS: `192.168.1.134`)
- **Local FQDN**: `ubuntu.lan` / `ubuntuserver.lan`
- **SSH Port**: `22/TCP`

---

<div align="center">

## 3. Automated Provisioning Runbook

</div>

Execute [`provision-vm.sh`](./provision-vm.sh) directly on the Proxmox VE hypervisor host:

```bash
chmod +x provision-vm.sh
./provision-vm.sh
```
