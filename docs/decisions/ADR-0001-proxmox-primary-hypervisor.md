# ADR-0001: Proxmox VE as Primary Bare-Metal Hypervisor vs. Pure Bare-Metal Kubernetes

## Status
**Accepted**

## Context
The primary physical compute node (`pve_primary_x64`) is an Intel Core i3-10100F (4 cores / 8 threads) with 12GB DDR4 RAM, a 512GB NVMe SSD, and a dedicated NVIDIA GeForce GTX 1050 Ti (4GB VRAM) PCIe GPU.

The platform requirements dictate hosting a heterogeneous collection of workloads:
1. Production microservices (Home Assistant, Prometheus, Scrutiny, Uptime Kuma, Nextcloud).
2. Advanced networking and security appliances (OPNsense FreeBSD firewall, Suricata IDS/IPS, WireGuard).
3. Cyber research labs requiring non-Linux operating systems or full kernel control (Windows Server 2008–2025 Active Directory domain controllers, Windows 7/10/11 clients, REMnux reverse engineering VM, Metasploitable targets).
4. GPU-accelerated local artificial intelligence inference (Ollama with NVIDIA CUDA passthrough).

If a bare-metal Kubernetes distribution (such as Talos Linux, Flatcar, or Ubuntu with Kubelet) were deployed directly onto the bare metal:
- Hosting FreeBSD appliances (OPNsense) would require experimental KubeVirt virtualization with severe network bridging overhead.
- Running multi-OS Active Directory domain controller forests with full Windows NT kernel emulation would be difficult to manage, snapshot, and backup.
- Passthrough of the PCIe GPU to container workloads under Kubernetes requires complex device plugins (NVIDIA GPU Operator) that demand substantial memory overhead.

## Decision
We select **Proxmox Virtual Environment (PVE) 9.2** as the bare-metal Type-1 hypervisor operating system on Node 1 (`pve_primary_x64`).

Key implementation aspects:
1. **Hybrid Density**: Proxmox natively supports Linux Containers (LXC) for lightweight Linux services sharing the host Linux 6.8+ kernel, alongside full QEMU/KVM Virtual Machines for non-Linux or kernel-isolated environments.
2. **PCIe IOMMU Passthrough**: Direct hardware passthrough of the NVIDIA GTX 1050 Ti to Container 102 (`ollama`) or specialized malware analysis VMs with minimal virtualization penalty.
3. **Software-Defined Networking**: Native Linux bridges (`vmbr0` through `vmbr4`) and 802.1q VLAN tagging providing line-rate inter-VM and inter-container transit.
4. **Native Backup Integration**: Integration with vzdump and Proxmox Backup Server (PBS) enabling incremental, deduplicated, chunk-based backups.

## Consequences

### Positive
- **Workload Flexibility**: Seamless execution of FreeBSD (OPNsense), Windows Server (AD Lab), and Debian/Alpine LXC containers on a single hardware host.
- **Resource Efficiency**: LXC containers boot in milliseconds and consume only active memory (no guest kernel overhead).
- **Snapshot & Rollback**: Instant ZFS/LVM-thin snapshots prior to cyber research drills or system upgrades.
- **Hardware Passthrough**: Stable, native IOMMU passthrough for the GTX 1050 Ti GPU without container operator bloat.

### Negative
- **Management Plane Overhead**: The Proxmox VE pve-cluster, corosync, and web GUI consume approximately 1GB of host RAM.
- **Orchestration Duality**: IaC requires managing both Proxmox resources (via `bpg/proxmox` Terraform provider) and in-container applications (via Ansible and Docker Compose) rather than a single unified Kubernetes API.
