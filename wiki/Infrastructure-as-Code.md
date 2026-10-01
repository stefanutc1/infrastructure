# Infrastructure as Code (IaC)

## 1. Proxmox VE Terraform Architecture

The platform uses a modular Terraform engine at `terraform/` and `terraform/modules/` to provision declarative Ubuntu cloud-init instances and container workloads:

```hcl
module "k3s_worker" {
  source         = "./modules/proxmox_vm"
  vm_name        = "k3s-worker-01"
  target_node    = "pve"
  vm_cores       = 2
  vm_memory      = 4096
  vm_disk_size   = "30G"
  network_bridge = "vmbr1"
  vlan_tag       = 30
}
```

### Module Inputs
- `vm_name` (string): Hostname of the target virtual machine.
- `target_node` (string): Proxmox VE hypervisor node name (e.g. `pve`).
- `vm_cores` (number): Allocated vCPUs.
- `vm_memory` (number): Allocated RAM in megabytes.
- `vm_disk_size` (string): Root disk allocation (e.g. `30G`, `50G`).
- `network_bridge` (string): Virtual switch interface (`vmbr1`).
- `vlan_tag` (number): 802.1Q VLAN isolation tag.

---

## 2. Multi-Cloud Staging & Zero-Cost Guardrails

Hybrid cloud modules exist under `cloud/` for cloud-burst testing and disaster recovery staging:
- **`cloud/aws/`** — AWS EC2 free-tier instances (`t2.micro`, `t3.micro`, `t4g.small`), VPC peering, and S3 cold storage.
- **`cloud/gcp/`** — Google Cloud Platform `e2-micro` instances and Cloud Storage buckets.
- **`cloud/azure/`** — Microsoft Azure `Standard_B1s` instances and resource groups.

### Automated Zero-Cost Policy Enforcement
All cloud Terraform code is subjected to automated pre-commit and CI verification:
1. `scripts/verify_zero_cloud_cost.py`: Static scanner enforcing zero billable services.
2. `policy/cloud/zero_cost_policy.rego`: Open Policy Agent (OPA) / Conftest guardrails forbidding NAT gateways, paid load balancers, and provisioned IOPS.
