# Hardware

This document describes the physical host(s) underpinning this homelab's services layer — specs, virtualization approach, and how the available resources map to running workloads. It exists so that capacity questions ("can this host take one more service?") and recovery questions ("what am I rebuilding, exactly?") have a single place to be answered.

This file describes hardware and host-level virtualization only. Service definitions live under `/services`; deployment automation lives in the Ansible inventory. Network topology (VLANs, firewall, routing) is out of scope here and is tracked in the `opnsense` service folder.

---

## Host: `proxmox` (Node 1 — Primary Hypervisor)

### Hardware

| Component | Spec |
| --- | --- |
| CPU | Intel Core i3-10100F — 4 cores / 8 threads @ 4.30 GHz |
| GPU | NVIDIA GeForce GTX 1050 Ti — 4 GB VRAM |
| RAM | 12 GB DDR4-2133 (12,288 MB) |
| Storage | 512 GB SSD |
| PSU | Coldex 350W Pure Sine Wave |

**Capacity notes:**

* 12 GB of RAM provides expanded headroom on this host, allowing concurrent operation of enterprise VMs alongside Wazuh 4.14 SIEM/XDR (CT 107) and GPU-accelerated ML workloads (Ollama CT 103) with active VirtIO ballooning and ZRAM swap compression.
* The GTX 1050 Ti's 4 GB VRAM provides hardware acceleration for local AI inference (Ollama CT 103) and compute workloads.
* 512 GB SSD is the single storage tier — there is currently no separate fast/slow tier, so backup jobs and VM/container disk growth all draw from the same pool.

### Software & Infrastructure

| Layer | Detail |
| --- | --- |
| Hypervisor OS | Proxmox VE 9.2 (Debian 13 Trixie base) |
| Kernel | Linux 7.0 version pve |
| Security Operations | Wazuh Manager 4.14 SIEM / XDR (LXC 107: Ports 1514, 1515, 55000) |
| Networking | Tailscale (mesh VPN) |
| Virtualization | LXC containers & QEMU VMs |

### Usage Profile

This host currently serves three primary virtualization tiers:

1. **Perimeter Firewall & Core Cloud Infrastructure (VM 200–201)**:
   - **VM 200**: OPNsense perimeter firewall, Zenarmor L7, CrowdSec IPS, and Unbound DNS.
   - **VM 201**: OpenStack 2024.1 Caracal IaaS compute (Nova), SDN (Neutron), and Horizon Web Dashboard.
2. **Cyber Security Lab & Bachelor Thesis CyberLab (VM 300–304 & CT 117)**:
   - **VM 300**: Kali Linux Rolling offensive security and red teaming workstation on isolated bridge `vmbr1` (VLAN 30).
   - **VM 301**: Metasploitable 2 intentionally vulnerable Linux target for penetration testing and detection calibration.
   - **VM 302**: T-Pot 24.04 multi-honeypot threat intelligence decoy platform (Cowrie, Dionaea, Honeytrap, Elastic, Kibana, Suricata).
   - **VM 303**: Windows Malware Analysis Sandbox (Windows 10 Enterprise x64 on isolated bridge `vmbr3`).
   - **VM 304**: REMnux v7 Noble malware analysis, memory forensics (Volatility), and Ghidra reverse engineering.
   - **CT 117**: OWASP Juice Shop vulnerable web application container.
3. **Active Directory Enterprise Lab (VM 400–405)**:
   - **VM 400**: Windows Server 2022 Standard Primary Domain Controller & DNS/DHCP infrastructure.
   - **VM 401**: Windows Server 2016 Standard Domain Controller & Cross-Forest Trust.
   - **VM 402**: Windows Server 2012 R2 Standard Legacy Functional Level Domain Controller.
   - **VM 403**: Windows 10 Enterprise Domain Member Client Workstation (GPO Target).
   - **VM 404**: Windows 7 Ultimate SP1 Legacy Client Workstation (NTLMv2 / SMBv1 Testing).
   - **VM 405**: Red Hat Enterprise Linux 9.8 Enterprise Domain Workload (SSSD, Realmd, Kerberos Keytab).

---

## Host: `openmediavault` (Node 2 — Storage NAS)

### Hardware

| Component | Spec |
| --- | --- |
| Physical Machine | ASUS X451MA Laptop |
| CPU | Intel Celeron N2830 — 2 cores / 2 threads @ 2.16 GHz (burst up to 2.41 GHz) |
| GPU | Intel HD Graphics (Bay Trail) |
| RAM | 2 GB DDR3 |
| Storage | 500 GB HDD |

**Capacity notes:**

* 2 GB of RAM is a tight constraint, restricting this host strictly to lightweight storage and file-sharing tasks without heavy background applications or memory-intensive services.
* The Intel Celeron N2830 processor and single 500 GB HDD are optimized for low-power, centralized file storage and secondary backups rather than high-throughput or concurrent multi-user processing.

### Software & Infrastructure

| Layer | Detail |
| --- | --- |
| OS | OpenMediaVault (OMV) |
| File Sharing / Services | SMB / NFS |

### Usage Profile

This host serves as the dedicated network-attached storage (NAS) and secondary backup destination:

1. **Centralized Storage & File Sharing** — Providing local network file shares (SMB/NFS) for household devices and workflows.
2. **Secondary Backup Destination** — Acting as an off-host repository for homelab data backups, separating storage from the main Proxmox execution environment.

---

## Host: `k8s-node-04` (Node 4 — Kubernetes Worker Node)

### Hardware

| Component | Spec |
| --- | --- |
| Physical Machine | Custom ATX Compute Chassis |
| Architecture | x86_64 (`amd64`) |
| CPU | AMD Athlon II X2 220 — 2 Cores / 2 Threads @ 2.80 GHz (Regor / AM3) |
| GPU | NVIDIA GeForce GTS 250 — 1 GB GDDR3 (55nm / 256-bit bus) |
| RAM | 4 GB DDR3 |
| Storage | 80 GB HDD (SATA II / 7200 RPM) |
| PSU | ATX Power Supply Unit |

**Capacity notes:**

* **Memory Ceiling**: 4 GB DDR3 RAM is tuned strictly for lightweight container runtime execution (`containerd`) and `k3s-agent` background processing. Memory limits are enforced per-pod using resource requests and limits in Kubernetes manifests.
* **Compute Allocation**: The dual-core AMD Athlon II X2 220 processor handles asynchronous batch processing, CI/CD runner jobs, and stateless microservices without choking the primary hypervisor.
* **Storage Footprint**: The 80 GB SATA HDD serves as the local OS root partition and ephemeral container image cache, with persistent state stored remotely over NFS on OpenMediaVault NAS (Node 2).

### Software & Infrastructure

| Layer | Detail |
| --- | --- |
| Operating System | Alpine Linux / Debian Base |
| Kubernetes Distribution | k3s (Lightweight Kubernetes Worker Agent) |
| Container Runtime | containerd (CRI) |
| Networking | Flannel CNI / Kube-VIP / Tailscale mesh VPN node |
| Node Role | Kubernetes Worker / General Compute Node |

### Usage Profile

This host serves as the dedicated bare-metal Kubernetes worker node:

1. **Kubernetes Cluster Worker (`k3s-agent`)** — Scheduling lightweight containerized microservices, scheduled batch jobs, and background workers.
2. **Stateless Compute Offloading** — Offloading non-critical application workloads and worker queues from the primary Proxmox hypervisor.
3. **Multi-Node Cluster Resilience** — Providing physical node diversity across the homelab cluster topology.

---

## Adding a New Host

When a new host joins the homelab, duplicate the `## Host: <name>` section above rather than merging specs into one table — each host gets its own hardware, software, and usage profile block. This keeps per-host capacity reasoning legible as the infrastructure grows, and each section should stay traceable to its corresponding `host_vars/<hostname>.yml` entry in the Ansible inventory (configured via Ansible inventory and Terraform).
