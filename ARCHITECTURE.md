# Enterprise & Research Homelab Platform Architecture

## Executive Architecture Summary
The `stefanutc1/infrastructure` platform is a production-grade, university-caliber hybrid datacenter and research laboratory. Designed on the principles of **Software-Defined Infrastructure**, **Zero Trust Segmentation**, **Factual Resource Grounding**, and **Strict Lifecycle Segregation**, the platform provides resilient day-2 operations for household automation and observability, alongside isolated, reproducible testbeds for academic cybersecurity, digital forensics, and AI platform engineering.

```text
Designed ──> Declared as Code ──> Validated ──> Deployed ──> Observed ──> Secured ──> Backed Up ──> Recoverable ──> Documented
```

---

## 1. High-Level Architectural Blueprints

### 1.1 Physical & Logical Topology

```text
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│                                   PHYSICAL HARDWARE FLEET                                │
├────────────────────────────────┬────────────────────────────┬────────────────────────────┤
│  NODE 1: pve_primary_x64       │  NODE 2: omv_nas           │  NODE 4: k8s_node_04       │
│  Intel Core i3-10100F (4C/8T)  │  ASUS X451MA (Celeron N2830│  AMD Athlon II X2 220 (2C) │
│  GTX 1050 Ti (4GB VRAM)        │  2GB DDR3 RAM              │  NVIDIA GTS 250 / 4GB RAM  │
│  12GB DDR4 RAM / 512GB NVMe    │  500GB ZFS Pool (omv_tank) │  80GB HDD / Single NIC     │
│  Proxmox VE 9.2 Type-1 Hyperv. │  OpenMediaVault 7 (NFS/SMB)│  k3s / k0s Edge Worker     │
│  IP: 192.168.1.132             │  IP: 192.168.1.135         │  IP: 192.168.1.18          │
└────────────────┬───────────────┴─────────────┬──────────────┴─────────────┬──────────────┘
                 │                             │                            │
                 ▼                             ▼                            ▼
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│                                DUAL-PERIMETER NETWORK BUS                                │
├──────────────────────────────────────────────────────────────────────────────────────────┤
│  Perimeter Firewall: OPNsense (VM 200 · 192.168.1.134)                                    │
│  Virtual Bridges: vmbr0 (WAN), vmbr1 (LAN Trunk), vmbr2 (Transit 10.10.20.0/30), vmbr3   │
│  VLAN 10: Management (192.168.1.0/24)        VLAN 20: Core Microservices (192.168.20.0/24)│
│  VLAN 30: CyberLab & Sandboxes (192.168.30.0) VLAN 40: DMZ & Honeypots (192.168.40.0/24) │
│  VLAN 50: Isolated IoT Sensors (192.168.50.0/24)                                         │
└────────────────┬─────────────────────────────────────────────────────────────────────────┘
                 │
                 ├──────────────────────────────┬──────────────────────────────┐
                 ▼                              ▼                              ▼
┌──────────────────────────────┐┌──────────────────────────────┐┌──────────────────────────────┐
│ ALWAYS-ON RUNTIME TIER       ││ ON-DEMAND RESEARCH LABS      ││ STORAGE & DATA PROTECTION    │
│ (~9.2GB RAM Allocated)       ││ (Declared IaC / Spin-Up Only)││ (Disaggregated 3-2-1 Backups)│
├──────────────────────────────┤├──────────────────────────────┤├──────────────────────────────┤
│ CT 100: Home Assistant (384M)││ VMs 400-410: Active Directory││ Proxmox NVMe local-lvm:      │
│ CT 101: Scrutiny SMART (128M)││  Forest Lab (2008-2025)      ││  High-IOPS DBs & Rootfs      │
│ CT 102: Ollama GPU (2,048M)  ││ VMs 310-313: Bachelor Thesis ││ Node 2 ZFS Pool (NFS/SMB):   │
│ CT 103: Uptime Kuma (128M)   ││  Core-Banking Lab (Fineract) ││  vzdump backup archives      │
│ CT 104: Prom & Grafana (1024)││ VM 203: T-Pot Honeypot (8GB) ││  Proxmox Backup Server (PBS) │
│ CT 105: Media Suite (896M)   ││ VM 204: Security Onion (8GB) ││  MinIO S3 Object Storage     │
│ CT 106: Wazuh HIDS (1,536M)  ││ VM 205: REMnux Reverse Eng.  ││ Automated ZFS Snapshots      │
│ VM 200: OPNsense (1-2GB)     ││ VM 302: Kali Pentest Node    ││ Offsite Encrypted Cold Sync  │
└──────────────────────────────┘└──────────────────────────────┘└──────────────────────────────┘
```

---

## 2. Core Architectural Principles

### 2.1 No Fake Enterprise & Truthful State Taxonomy
Every artifact, workload, and documentation entry strictly observes four factual lifecycle states:
1. **`DEPLOYED`**: Workloads actively running on bare-metal hardware, validated by live network endpoints, process tables, and healthcheck probes.
2. **`DECLARED`**: Production-ready code and configurations declared in Terraform (`terraform/`), Ansible (`ansible/`), or Proxmox `.conf` files, awaiting on-demand execution.
3. **`PROPOSED`**: Architectural designs, target blueprints, and roadmap enhancements clearly marked as non-deployed concepts.
4. **`DEFERRED`**: Technologies intentionally evaluated and rejected or postponed due to hardware resource constraints (e.g., Athlon II CPU limits, single-GPU passthrough).

### 2.2 Physical Resource Budgeting
With exactly 12GB of physical DDR4 RAM on Node 1:
- The **Always-On Runtime** consumes ~9,280 MB (~75% capacity), leaving ~3GB headroom for disk caching, host kernel tasks, and transient bursts.
- **On-Demand Research Labs** (e.g. Active Directory 35GB total declared RAM, Bachelor's thesis 14GB total declared RAM) are explicitly restricted from running simultaneously. Research drills boot 1 to 2 isolated nodes at a time under automated memory governance.

---

## 3. Subsystem Architectures

### 3.1 Network & Dual-Perimeter Architecture
- **Perimeter Firewall**: OPNsense running in KVM VM 200 with VirtIO network interfaces.
- **Point-to-Point Transit Bus**: `vmbr2` assigns `10.10.20.1/30` (OPNsense) and `10.10.20.2/30` (Proxmox VE host), enabling line-rate inter-firewall telemetry and packet inspection.
- **Deep Packet Inspection (DPI)**: Suricata inspects LAN and WAN transit interfaces with custom rulesets targeting banking fraud and network scans.
- **Threat Reputation**: CrowdSec firewall bouncers automatically inject malicious IP addresses into OPNsense pf tables.
- **Encrypted DNS**: Unbound resolves recursive queries using DNS-over-TLS (DoT) upstream to Quad9 (`9.9.9.9`), with local authoritative resolution for `.lan` and `stefanut.lan`.

### 3.2 Compute & Virtualization Density
- **Proxmox VE 9.2**: Hypervisor operating system providing unified management for QEMU/KVM and LXC.
- **LXC Containerization**: Microservices share the host Linux 6.8+ kernel with unprivileged user namespace mapping (`UID 100000+`), reducing RAM consumption by >80% compared to VM-based isolation.
- **Dynamic VirtIO Memory Ballooning**: KVM virtual machines dynamically release idle RAM to the host kernel during low utilization periods.

### 3.3 Storage Tiering
- **Tier 1 (High-IOPS NVMe)**: Internal 512GB NVMe SSD formatted as LVM-thin (`local-lvm`) hosting database storage volumes, container root filesystems, and VM boot images.
- **Tier 2 (Capacity & Backup Pool)**: Remote 500GB ZFS pool on OpenMediaVault NAS (`omv_nas`) exported over gigabit Ethernet via NFSv4 for Proxmox vzdump archives and SMBv3 for file storage.

### 3.4 Identity & Ingress Security
- **Administrative Ingress**: Mutual TLS (mTLS) enforced by Caddy reverse proxy; administrative endpoints require presentation of valid client certificates issued by the internal Certificate Authority (Step-CA).
- **Web SSO**: Lightweight OAuth2-Proxy / Authelia blueprint for consumer microservices.
- **Active Directory Research Range**: Isolated Windows Server domain controller fleet (VMs 400 to 410) dedicated to academic Kerberos, BloodHound, and lateral movement research drills.

### 3.5 Observability & Telemetry Pipeline
- **Metrics Scraping**: Prometheus collects time-series metrics from Node Exporter, Telegraf, and cAdvisor every 15 seconds.
- **Visualization**: Grafana provides unified telemetry dashboards for hardware thermals, storage wear, network bandwidth, and container status.
- **Synthetic Monitoring**: Uptime Kuma monitors HTTP/TCP endpoint health with sub-minute probing and webhook alerts.
- **Host Intrusion Detection (HIDS)**: Wazuh agents stream security events to Wazuh Manager (CT 106) for real-time compliance auditing and threat detection.

### 3.6 Artificial Intelligence Architecture (ELO Subsystem)
- **Local GPU Acceleration**: NVIDIA GeForce GTX 1050 Ti passed through via PCIe IOMMU to Container 102 (`ollama`) for private, local LLM inference.
- **Multi-Tier Cascade Routing**: Inbound requests evaluate: Primary Cloud Frontier Model -> Secondary Cloud Fallback -> Local Ollama GPU -> Deterministic Static Fallback.
- **L0–L3 Tool Gatekeeper**: Strict authorization boundaries requiring out-of-band operator MFA confirmation before privileged or destructive system actions can be executed.

---

## 4. Architecture Decision Records (ADRs)

Key architectural trade-offs and decisions are formally recorded in [`docs/decisions/`](file:///Users/s3nnnzzzatyeeee/stefannut_repos/datacenter/docs/decisions/):

- [**ADR-0001**](file:///Users/s3nnnzzzatyeeee/stefannut_repos/datacenter/docs/decisions/ADR-0001-proxmox-primary-hypervisor.md): Proxmox VE as Primary Bare-Metal Hypervisor vs. Pure Bare-Metal Kubernetes
- [**ADR-0002**](file:///Users/s3nnnzzzatyeeee/stefannut_repos/datacenter/docs/decisions/ADR-0002-lxc-container-density.md): LXC Unprivileged Container Density for Core Microservices
- [**ADR-0003**](file:///Users/s3nnnzzzatyeeee/stefannut_repos/datacenter/docs/decisions/ADR-0003-opnsense-perimeter-gateway.md): Virtualized OPNsense Dual-Perimeter Gateway with Bridge Transit
- [**ADR-0004**](file:///Users/s3nnnzzzatyeeee/stefannut_repos/datacenter/docs/decisions/ADR-0004-storage-tiering-local-zfs.md): Two-Tier Storage Architecture: Local NVMe `local-lvm` & Remote ZFS NAS
- [**ADR-0005**](file:///Users/s3nnnzzzatyeeee/stefannut_repos/datacenter/docs/decisions/ADR-0005-identity-access-strategy.md): Ingress mTLS / OAuth2-Proxy & On-Demand Active Directory Research Lab
- [**ADR-0006**](file:///Users/s3nnnzzzatyeeee/stefannut_repos/datacenter/docs/decisions/ADR-0006-secrets-management-hygiene.md): GitOps Zero-Plaintext Secret Hygiene & SOPS/Age Ingestion
- [**ADR-0007**](file:///Users/s3nnnzzzatyeeee/stefannut_repos/datacenter/docs/decisions/ADR-0007-edge-kubernetes-k3s-k0s.md): Single-Node Lightweight Kubernetes (k3s/k0s) on Legacy Hardware
- [**ADR-0008**](file:///Users/s3nnnzzzatyeeee/stefannut_repos/datacenter/docs/decisions/ADR-0008-elo-ai-routing-security-gatekeeper.md): ELO Multi-Tier Cascade Routing & L0–L3 Tool Execution Gatekeeper

---

## 5. Master Documentation Map

| Document | Primary Focus | Target Audience |
| :--- | :--- | :--- |
| [`INFRASTRUCTURE.md`](file:///Users/s3nnnzzzatyeeee/stefannut_repos/datacenter/INFRASTRUCTURE.md) | Physical nodes, hardware specs, VM/LXC allocation, capacity budget | Platform & Systems Engineers |
| [`SERVICES.md`](file:///Users/s3nnnzzzatyeeee/stefannut_repos/datacenter/SERVICES.md) | 33-service catalog, ports, protocols, auth, backup, criticality | Application & Operations Teams |
| [`NETWORK.md`](file:///Users/s3nnnzzzatyeeee/stefannut_repos/datacenter/NETWORK.md) | VLAN matrix, routing, bridges, firewall policies, WireGuard VPN | Network & Security Engineers |
| [`SECURITY.md`](file:///Users/s3nnnzzzatyeeee/stefannut_repos/datacenter/SECURITY.md) | Threat modeling, CIS benchmarks, PKI, secrets, Wazuh, Suricata | SecOps & Compliance Auditors |
| [`OPERATIONS.md`](file:///Users/s3nnnzzzatyeeee/stefannut_repos/datacenter/OPERATIONS.md) | Day-2 runbooks, cold boot sequencing, emergency shutdown, updates | SRE & Operations Engineers |
| [`BACKUP.md`](file:///Users/s3nnnzzzatyeeee/stefannut_repos/datacenter/BACKUP.md) | 3-2-1 backup strategy, PBS client, ZFS snapshots, RPO/RTO | Backup & Recovery Administrators |
| [`DISASTER-RECOVERY.md`](file:///Users/s3nnnzzzatyeeee/stefannut_repos/datacenter/DISASTER-RECOVERY.md) | DR plan, bare-metal recovery runbooks, test restore drills | Incident Commanders & SREs |
| [`CONTRIBUTING.md`](file:///Users/s3nnnzzzatyeeee/stefannut_repos/datacenter/CONTRIBUTING.md) | Contribution standards, IaC formatting, Git workflow, testing | Developers & Contributors |
