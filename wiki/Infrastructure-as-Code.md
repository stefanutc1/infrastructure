# Infrastructure as Code (IaC)

## Proxmox VM Terraform Module

The homelab uses a modular Terraform engine at `terraform/modules/proxmox_vm/` to provision declarative Ubuntu cloud-init instances:

```hcl
module "k3s_worker" {
  source       = "./modules/proxmox_vm"
  vm_name      = "k3s-worker-01"
  target_node  = "pve"
  vm_cores     = 4
  vm_memory    = 8192
  vm_disk_size = "50G"
  network_bridge = "vmbr0"
  vlan_tag     = 30
}
```

### Module Inputs
- `vm_name` (string): Hostname of the target virtual machine.
- `target_node` (string): Proxmox VE hypervisor node name (e.g. `pve`).
- `vm_cores` (number): Allocated vCPUs.
- `vm_memory` (number): Allocated RAM in megabytes.
- `vm_disk_size` (string): Root disk allocation (e.g. `50G`, `100G`).
- `network_bridge` (string): Virtual switch interface (`vmbr0`).
- `vlan_tag` (number): 802.1Q VLAN isolation tag.

---

## Multi-Hypervisor Support

IaC definitions exist under `hypervisors/` for heterogeneous testing:
- **`hypervisors/proxmox/`** — Primary hypervisor for production LXC/VM instances.
- **`hypervisors/xen/`** — Xen Hypervisor domain definitions.
- **`hypervisors/esxi/`** — VMware ESXi vSphere Terraform provider.
- **`hypervisors/hyperv/`** — Windows Hyper-V generation 2 VMs.
- **`hypervisors/bhyve/`** — FreeBSD lightweight hypervisor provider.
