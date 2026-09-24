# 🐧 Ubuntu Server 24.04 LTS Cloud-Init VM (VM 202)

Declarative hardware specification and cloud-init automated provisioning for Ubuntu Server 24.04 LTS Noble Numbat on Proxmox VE.

---

## ⚙️ Hardware Specifications

- **VMID:** `202`
- **Name:** `ubuntu-server-2404`
- **vCPUs:** `2 Cores` (`type=host`, NUMA enabled)
- **Memory:** `2048 MB` (Ballooning: 1024 MB - 2048 MB)
- **SCSI Controller:** `virtio-scsi-single` (SSD emulation enabled, `discard=on`)
- **Primary Disk:** `local-lvm:vm-202-disk-0`, Size: `25 GB`
- **Cloud-Init Storage:** `ide2` (`local-lvm:vm-202-cloudinit`)
- **Network Interface:** `virtio,bridge=vmbr0,firewall=1`
- **Guest Agent:** Enabled (`qemu-guest-agent`)

---

## 🔑 Access & Authentication

- **Primary User:** `<admin_user>`
- **Authentication:** SSH Key-Based (`~/.ssh/id_ed25519.pub`) & Vaultwarden Secrets
- **Static IP:** `192.168.1.202/24` (Gateway: `192.168.1.1`, DNS: `192.168.1.4`)
- **Local Domain:** `ubuntu.lan` / `ubuntuserver.lan`
- **SSH Port:** `22`

---

## 🚀 Automated Provisioning Script

Run [`provision-vm.sh`](./provision-vm.sh) directly on the Proxmox VE hypervisor:

\`\`\`bash
chmod +x provision-vm.sh
./provision-vm.sh
\`\`\`
