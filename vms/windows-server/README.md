<div align="center">

# Windows Server 2022 / 2025 KVM Virtual Machine (VM 201)

</div>

<div align="center">

[![VM](https://img.shields.io/badge/Virtual%20Machine-Windows%20Server%20Datacenter-0078d4.svg?style=flat&logo=windows)](https://www.microsoft.com/windows-server)
[![VMID](https://img.shields.io/badge/VMID-201-blue.svg?style=flat)](#)
[![Unattended](https://img.shields.io/badge/Setup-Automated%20autounattend.xml-10b981.svg?style=flat)](#)
[![Drivers](https://img.shields.io/badge/Drivers-VirtIO%20SCSI%20%2B%20Net-8b5cf6.svg?style=flat)](#)

</div>

---

<div align="center">

## Executive Summary

</div>

Declarative hardware specifications, unattended installation answer files (`autounattend.xml`), and automation scripts for Windows Server on Proxmox VE (Node 1).

---

<div align="center">

## 1. Hardware Specifications

</div>

- **Proxmox VMID**: `201`
- **Hostname**: `windows-server-2022`
- **Machine Type**: `q35`
- **Firmware / BIOS**: `OVMF (UEFI)` with 4M EFI Disk
- **vCPU Allocation**: 2 Cores (`cpu: host`, NUMA enabled)
- **Memory Allocation**: 3,072 MB (VirtIO Dynamic Ballooning: 2,048 MB – 3,072 MB)
- **SCSI Controller**: `virtio-scsi-single` (SSD emulation enabled, `discard=on`)
- **Primary Disk**: `local-lvm:vm-201-disk-0`, Size: 40 GB NVMe
- **Network Interface**: `virtio,bridge=vmbr1,tag=10,firewall=1`
- **Guest Integration**: QEMU Guest Agent enabled (`qemu-guest-agent`)

---

<div align="center">

## 2. Access & Authentication

</div>

- **Built-in Administrator**: `Administrator` (Password managed via Vaultwarden / LAPS)
- **Primary Operator**: `<admin_user>` (Provisioned via `autounattend.xml`)
- **RDP Port**: `3389/TCP`
- **WinRM Ports**: `5985/TCP` (HTTP) / `5986/TCP` (HTTPS)
- **Local FQDN**: `winserver.lan` / `windows.lan` (`192.168.1.201`)

---

<div align="center">

## 3. Automated Provisioning Runbook

</div>

Execute [`provision-vm.sh`](./provision-vm.sh) directly on the Proxmox VE hypervisor host:

```bash
chmod +x provision-vm.sh
./provision-vm.sh
```
