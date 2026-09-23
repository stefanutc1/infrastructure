# Enterprise Homelab Domain Model (16 Functional Domains)

The `stefanutc1/infrastructure` platform is architected around 16 decoupled, highly cohesive functional domains. Each domain specifies its operational boundaries, lifecycle state, primary controllers, and cross-domain interfaces.

---

## Domain Overview Matrix

| Domain ID | Domain Name | Core Technologies | Primary Host / Node | Factual Status | Security Tier |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **01-network** | Network & Routing | OPNsense, Unbound, Suricata, WireGuard | VM 200 / vmbr0-3 | `DEPLOYED` | Tier 1 (Critical) |
| **02-identity** | Identity & Access | Caddy mTLS, OAuth2-Proxy, Samba AD | CT Ingress / VMs 400-410 | `DEPLOYED` (mTLS) / `DECLARED` (AD) | Tier 1 (Critical) |
| **03-compute** | Compute & Virtualization | Proxmox VE 9.2, KVM, LXC | Node 1, Node 4 | `DEPLOYED` | Tier 1 (Critical) |
| **04-storage** | Storage & Persistence | LVM-thin NVMe, ZFS on Linux, NFS/SMB | Node 1, Node 2 (OMV) | `DEPLOYED` | Tier 1 (Critical) |
| **05-platform** | Host Platform OS | Debian 12 / Proxmox, NixOS config | Node 1, Node 2, Node 4 | `DEPLOYED` | Tier 1 (Critical) |
| **06-kubernetes** | Edge Container Platform | k3s / k0s, Flannel/Cilium, GitOps | Node 4 (`k8s_node_04`) | `DEPLOYED` | Tier 2 (Standard) |
| **07-services** | Production Microservices | Home Assistant, Nextcloud, Immich, Jellyfin | Node 1 LXCs (CT 100-106) | `DEPLOYED` | Tier 2 (Standard) |
| **08-observability** | Observability & Telemetry | Prometheus, Grafana, Vector, Loki, Telegraf | CT 104, CT 103 | `DEPLOYED` | Tier 2 (Standard) |
| **09-security** | Defense & SIEM | Wazuh Manager, CrowdSec, CIS Hardening | CT 106, VM 200 | `DEPLOYED` | Tier 1 (Critical) |
| **10-dfir** | Digital Forensics (DFIR) | Chainsaw, REMnux, Packet Captures | VM 205, `cyber/` | `DEPLOYED` | Tier 3 (Isolated Lab) |
| **11-ai** | AI & ELO Control Plane | Ollama, GTX 1050 Ti, ELO Gatekeeper | CT 102 (`ollama`) | `DEPLOYED` | Tier 2 (Standard) |
| **12-iot** | IoT & Smart Sensors | Zigbee2MQTT, ESPHome, Home Assistant | CT 100, VLAN 50 | `DEPLOYED` | Tier 4 (Isolated IoT) |
| **13-backup** | Data Protection | PBS Client, vzdump, ZFS Snapshots | Node 1 -> Node 2 | `DEPLOYED` | Tier 1 (Critical) |
| **14-disaster-recovery** | Business Continuity | Cold Boot Scripts, DR Runbooks | Node 1, Node 2 | `DECLARED` / `PASS` | Tier 1 (Critical) |
| **15-automation** | IaC & Configuration | Terraform (`bpg/proxmox`), Ansible, CI/CD | GitHub Actions, Local CLI | `DEPLOYED` | Tier 1 (Critical) |
| **16-research** | Academic Security Lab | Apache Fineract, Metasploitable, Kali | VMs 310-313, 301-303 | `DECLARED` (On-Demand) | Tier 3 (Isolated Lab) |

---

## Domain Architecture Details

### 01. Network Domain
- **Ingress & Egress**: Managed by OPNsense (VM 200). Stateful inspection, NAT translation, and DoT DNS forwarding to Quad9 (`9.9.9.9`).
- **Transit Bus**: Point-to-point interconnect `10.10.20.0/30` on `vmbr2` linking OPNsense directly to the Proxmox hypervisor.
- **VLAN Segmentation**:
  - VLAN 10 (`192.168.1.0/24`): Management & Hypervisor Admin.
  - VLAN 20 (`192.168.20.0/24`): Core Production Microservices.
  - VLAN 30 (`192.168.30.0/24`): Cybersecurity Research & Pentest Sandboxes.
  - VLAN 40 (`192.168.40.0/24`): Deception, Honeypots & DMZ.
  - VLAN 50 (`192.168.50.0/24`): IoT Devices & Untrusted Sensors.

### 02. Identity Domain
- **Runtime Web Ingress**: Mutual TLS (mTLS) with client certificates issued by Step-CA. OAuth2-Proxy provides web SSO.
- **Academic Research Directory**: Multi-version Windows Server Active Directory forest (2008 R2 to 2025) running in an on-demand research range for Kerberos testing and BloodHound graph analysis.

### 03. Compute Domain
- **Hypervisor**: Proxmox VE 9.2 running Linux 6.8+ kernel on Intel Core i3-10100F.
- **Containerization**: Unprivileged LXC containers with shared host page cache for production microservices.
- **Virtualization**: Hardware-accelerated KVM virtual machines with VirtIO memory ballooning for non-Linux workloads.

### 04. Storage Domain
- **Tier 1 (High-IOPS)**: 512GB NVMe SSD formatted as LVM-thin (`local-lvm`) hosting container root filesystems and active VM disks.
- **Tier 2 (Capacity & Archive)**: 500GB ZFS storage pool on OpenMediaVault NAS (`omv_nas`) providing NFS/SMB shares and backup targets.

### 05. Platform Domain
- **Declarative Host Specifications**: `configuration.nix` provides a reproducible, auditable reference blueprint for the host OS configuration (`homelab-max`).
- **Kernel Tuning**: ZRAM swap (3.8GB compressed lz4), sysctl TCP BBR congestion control, and file descriptor limits optimized for high container density.

### 06. Kubernetes Domain
- **Edge Deployment**: Lightweight single-node k3s/k0s cluster running on Node 4 (AMD Athlon II X2 220, 4GB RAM).
- **Storage & Networking**: SQLite/Kine backend, Flannel/Cilium CNI, and host-local volume provisioner.
- **Workloads**: Woodpecker CI build runners, edge container experiments, and GitOps sync via Flux.

### 07. Services Domain
- **Production Catalog**: 33 declared and deployed services including Home Assistant, Scrutiny, Nextcloud, Immich, Uptime Kuma, and Jellyfin.
- **Port Governance**: Non-conflicting static port assignments registered in `SERVICES.md`.

### 08. Observability Domain
- **Metrics Collection**: Prometheus scrapes Node Exporter, Telegraf, and cAdvisor endpoints every 15 seconds.
- **Dashboards**: Grafana displays system health, thermal telemetry, network throughput, and disk SMART wear.
- **Alerting**: Alertmanager routes critical thresholds (disk capacity >85%, CPU temp >75°C) to Uptime Kuma and ntfy webhooks.

### 09. Security Domain
- **Host Hardening**: CIS Linux Benchmark Level 1 compliance, root SSH password disabled, ed25519 key authentication only.
- **Host Intrusion Detection**: Wazuh HIDS agents deployed across Linux and Windows nodes reporting to Wazuh Manager (CT 106).
- **Network Intrusion Prevention**: Suricata running inline on OPNsense inspecting WAN/LAN transit with custom rulesets.

### 10. Digital Forensics (DFIR) Domain
- **Forensic Repositories**: In-depth incident dossiers and evidence archives located in `cyber/` (Media Galaxy e-commerce fraud, Steam OpenID phishing, Revolut vishing, Task scam infrastructure).
- **Analysis Sandbox**: Isolated REMnux VM (VM 205) and Kali Linux workstation (VM 302) with no lateral access to production subnets.

### 11. AI Domain (ELO Subsystem)
- **Local GPU Inference**: Ollama running in Container 102 with NVIDIA GeForce GTX 1050 Ti PCIe passthrough (CUDA 12.x).
- **Multi-Tier Cascade**: Cloud Primary (Gemini/Claude) -> Cloud Fallback -> Local Ollama GPU -> Deterministic Fallback.
- **Security Gatekeeper**: L0–L3 authorization boundaries preventing destructive tool execution.

### 12. IoT Domain
- **Network Isolation**: All smart home sensors, IP cameras, and smart plugs confined to VLAN 50.
- **Firewall Policy**: Default DROP; zero outbound internet access permitted. Home Assistant (VLAN 20) initiates state polling across the firewall boundary.

### 13. Backup Domain
- **3-2-1 Strategy**: 3 copies of data, 2 different media types (local NVMe + remote ZFS), 1 offsite encrypted archive.
- **Proxmox Backup Server (PBS)**: Deduplicated chunk-level backups with SHA-256 verification and fast snapshot rollback.

### 14. Disaster Recovery Domain
- **Recovery Time Objective (RTO)**: P1 Core Services < 30 minutes; P2 Production < 2 hours; P3 Research < 8 hours.
- **Recovery Point Objective (RPO)**: Databases < 6 hours; Containers < 24 hours; Static configurations < 1 hour.
- **Runbooks**: Automated cold boot sequencing and emergency shutdown scripts.

### 15. Automation Domain
- **IaC Engine**: Terraform managing Proxmox VMs, LXCs, and software-defined networks (`terraform/`).
- **Configuration Management**: Ansible playbooks and modular roles automating package installation, user provisioning, and service hardening (`ansible/`).
- **CI/CD Pipeline**: GitHub Actions running linting, secret audits, container scans, and the infrastructure health doctor.

### 16. Research Domain
- **Academic Focus**: Bachelor's thesis research in financial infrastructure security (`licenta/`).
- **Architecture**: Simulated core-banking system (Apache Fineract VM 310), PostgreSQL financial ledger (VM 311), payment gateway (VM 312), and SWIFT jumpbox (VM 313) subjected to offensive security drills from Kali Linux (VM 302).
