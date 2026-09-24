# 🪟 Windows Server 2022 / 2025 KVM Virtual Machine (VM 201)

Declarative hardware specification and unattended installation configuration for Windows Server on Proxmox VE.

---

## ⚙️ Hardware Specifications

- **VMID:** `201`
- **Name:** `windows-server-2022`
- **Machine Type:** `q35`
- **BIOS:** `OVMF (UEFI)` with 4M EFI Disk
- **vCPUs:** `2 Cores` (`type=host`, NUMA enabled)
- **Memory:** `3072 MB` (Ballooning: 2048 MB - 3072 MB)
- **SCSI Controller:** `virtio-scsi-single` (SSD emulation enabled, `discard=on`)
- **Primary Disk:** `local-lvm:vm-201-disk-0`, Size: `40 GB`
- **Network Interface:** `virtio,bridge=vmbr0,firewall=1`
- **Guest Agent:** Enabled (`qemu-guest-agent`)

---

## 🔑 Access & Authentication

- **Administrator:** `Administrator` (Password managed via Vaultwarden / LAPS)
- **Primary User:** `<admin_user>` (Provisioned via `autounattend.xml`)
- **RDP Port:** `3389`
- **WinRM Port:** `5985` (HTTP) / `5986` (HTTPS)
- **Local Domain:** `winserver.lan` / `windows.lan` (`192.168.1.201`)

---

## 🚀 Automated Provisioning Script

Run [`provision-vm.sh`](./provision-vm.sh) directly on the Proxmox VE hypervisor:

\`\`\`bash
chmod +x provision-vm.sh
./provision-vm.sh
\`\`\`
