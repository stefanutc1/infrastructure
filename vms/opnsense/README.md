# 🛡️ OPNsense Core Gateway & Firewall VM (VM 200)

Declarative hardware specification and provisioning script for OPNsense virtual router and firewall on Proxmox VE.

---

## ⚙️ Hardware Specifications

- **VMID:** `200`
- **Name:** `opnsense`
- **vCPUs:** `2 Cores` (`type=host`)
- **Memory:** `2048 MB`
- **Boot Disk:** `local-lvm:vm-200-disk-0`, Size: `16 GB`
- **Network Interface 0 (WAN):** `virtio,bridge=vmbr0`
- **Network Interface 1 (LAN):** `virtio,bridge=vmbr1`
- **Authentication:** WebGUI (`root` with Vaultwarden managed secret)
