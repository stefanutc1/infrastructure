# Service Catalog & Portfolio Specification

## Executive Summary
This document defines the formal Service Catalog for the `stefanutc1/infrastructure` platform. It records both the active foundational services (OPNsense, Proxmox VE, Active Directory, Wazuh, Prometheus, Grafana, Loki, Ollama, Home Assistant, Scrutiny) and the curated **Enterprise / Research Homelab 2.0 Stack** (Core, Identity, DevSecOps, SOC/DFIR, AI, and the Media & Personal Cloud automation suite).

Each entry documents its functional role, deployment model, network location, port allocation, authentication protocol, operational criticality (P1–P4), and factual lifecycle state (`DEPLOYED`, `DECLARED`, or `ROADMAP`).

---

## Service Portfolio Overview

```text
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                HOMELAB 2.0 SERVICE TIERS & PILONI                                │
├───────────────────────────────┬───────────────────────────────┬──────────────────────────────────┤
│ PILON 1: INGRESS & IDENTITY   │ PILON 2: CLOUD-NATIVE & CI/CD │ PILON 3: OBSERVABILITY & SOC     │
│ - OPNsense Perimeter Firewall │ - Harbor OCI Registry         │ - Prometheus TSDB & Alertmanager │
│ - Caddy Reverse Proxy & mTLS  │ - Argo CD GitOps Controller   │ - Grafana Central Telemetry      │
│ - Smallstep step-ca (ACME)    │ - MetalLB Bare-Metal LB       │ - Vector & Loki Log Pipeline     │
│ - Active Directory Domain Svc │ - Kyverno Policy-as-Code      │ - Tempo Distributed Tracing      │
│ - Keycloak Enterprise IAM     │ - Longhorn Distributed Storage│ - Wazuh Manager 4.14 (SIEM/HIDS) │
│ - HashiCorp Vault / OpenBao   │ - Woodpecker CI Runner        │ - Suricata DPI & CrowdSec        │
│ - NetBox DCIM & IPAM (SoT)    │ - Backstage Developer Portal  │ - Zeek Network Security Monitor  │
│                               │ - Syft, Grype & Cosign        │ - Velociraptor Endpoint Hunting  │
│                               │ - Dependency-Track & SonarQube│ - TheHive + Cortex SOAR & MISP   │
├───────────────────────────────┴───────────────────────────────┴──────────────────────────────────┤
│ PILON 4: AI PLATFORM, RESEARCH & DFIR LAB                                                        │
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│ - Ollama GPU AI Runtime (CT 102 · GTX 1050 Ti Passthrough)                                      │
│ - LiteLLM Unified Model Gateway & Load Balancer                                                  │
│ - Qdrant Vector Database (Dedicated semantic embeddings & RAG)                                   │
│ - Langfuse LLM Observability & Tracing                                                           │
│ - Open WebUI Local AI Studio & Assistant Workspace                                               │
│ - JupyterHub Multi-User Research Environment                                                     │
│ - CAPEv2 Automated Malware Detonation Sandbox (Isolated VLAN 66 Quarantine)                       │
│ - REMnux / FLARE-VM Forensic Workstations                                                        │
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│ PILON 5: MEDIA, STORAGE & PERSONAL CLOUD AUTOMATION (*arr Suite + Immich)                        │
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│ - OpenMediaVault ZFS Central NAS & MinIO S3 Object Storage API                                   │
│ - Proxmox Backup Server (PBS) Deduplicated Snapshot Engine                                       │
│ - Jellyfin Media Streaming with Intel QuickSync Hardware Transcoding                             │
│ - Gluetun VPN Gateway with Automatic Killswitch (zero ISP leaks)                                 │
│ - qBittorrent-nox (routed exclusively via Gluetun VPN tunnel)                                    │
│ - Sonarr (TV Series) & Radarr (Movies) with TRaSH Guides Atomic Hardlinks                         │
│ - Prowlarr Indexer Proxy & Bazarr Subtitles Automation                                           │
│ - Jellyseerr Modern Content Discovery & Request Management                                       │
│ - Immich Photo/Video Backup Suite with Machine Learning CLIP Search & pgvector                   │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 1. Complete Service Catalog

### 1.1. Foundational Core, Identity & Storage
| # | Service Name | Purpose | Deployment Model | Host Node | Network / VLAN | Port | Auth Method | Criticality | Factual Status |
| :- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **1** | **OPNsense Firewall** | Perimeter routing, NAT, stateful packet filter, Suricata DPI | KVM VM 200 | Node 1 | VLAN 10 (`192.168.1.134`) | `8443/TCP`, `53/UDP` | Password + TOTP | **P1 (Critical)** | `DEPLOYED` |
| **2** | **Caddy Reverse Proxy** | TLS termination, mutual TLS (mTLS), automated Let's Encrypt / step-ca | Docker / Host | Node 1 | VLAN 10 (`192.168.1.132`) | `80/TCP`, `443/TCP` | mTLS / OIDC | **P1 (Critical)** | `DEPLOYED` |
| **3** | **Unbound DNS Resolver**| Recursive DNS with DNS-over-TLS (Quad9) & split-horizon `.lan` | Bare-Metal | VM 200 | VLAN 10 (`192.168.1.134`) | `53/UDP`, `53/TCP` | None (Local Subnets) | **P1 (Critical)** | `DEPLOYED` |
| **4** | **Step-CA PKI** | Internal Certificate Authority, ACME provider & automated mTLS | Docker / LXC | Node 1 | VLAN 20 (`192.168.1.132`) | `9000/TCP` | mTLS / Admin Provisioner | **P1 (Critical)** | `DECLARED` |
| **5** | **Active Directory DC** | Windows Server domain controller forest (Kerberos / LDAP authentication)| KVM VM 400 | Node 1 | VLAN 10 (`192.168.1.130`) | `88/TCP`, `389/TCP`, `636` | Kerberos / NTLMv2 | **P1 (Critical)** | `DEPLOYED` |
| **6** | **Keycloak IAM** | Enterprise SSO, OIDC, SAML gateway federated over Active Directory | Docker Container | Node 1 | VLAN 20 (`192.168.1.132`) | `8484/TCP` | AD LDAP / Web Admin | **P1 (Critical)** | `DECLARED` |
| **7** | **NetBox** | DCIM, IPAM, and Single Source of Truth for Terraform & Ansible | Docker Compose | Node 1 | VLAN 20 (`192.168.1.132`) | `8000/TCP` | Local / Keycloak OIDC | **P1 (Critical)** | `DECLARED` |
| **8** | **HashiCorp Vault / OpenBao** | Centralized secrets management, dynamic credentials & encryption as a service | Docker Container | Node 1 | VLAN 20 (`192.168.1.132`) | `8200/TCP` | Token / AppRole / OIDC | **P1 (Critical)** | `ROADMAP` |
| **9** | **OpenMediaVault NAS** | Central ZFS pool storage manager, NFS/SMB protocol exporter | Bare-Metal OS | Node 2 | VLAN 10 (`192.168.1.135`) | `80/TCP`, `445/TCP` | Local OMV Admin | **P1 (Critical)** | `DEPLOYED` |
| **10**| **MinIO S3 Storage** | High-performance S3-compatible object storage for backups, logs, ML models | LXC CT 161 | Node 1 | VLAN 20 (`192.168.1.161`) | `9000/TCP`, `9001/TCP` | S3 Access Key / Secret | **P2 (High)** | `DEPLOYED` |
| **11**| **Proxmox Backup Server**| Deduplicated, client-side encrypted backup target for VM/LXC snapshots | Dedicated Service| Node 1 / 2 | VLAN 10 (`192.168.1.132`) | `8007/TCP` | TLS Fingerprint / API | **P1 (Critical)** | `DEPLOYED` |

### 1.2. Media & Personal Cloud Automation (*arr Suite + Immich)
| # | Service Name | Purpose | Deployment Model | Host Node | Network / VLAN | Port | Storage Mapping | Criticality | Factual Status |
| :- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **12**| **Gluetun VPN Gateway** | Dedicated WireGuard tunnel with automated iptables killswitch | Docker Container | Node 1 | VLAN 20 (`192.168.1.132`) | `8085/TCP`, `6881` | Config volume | **P2 (High)** | `DECLARED` |
| **13**| **qBittorrent-nox** | Automated torrent downloader hard-locked through Gluetun VPN | Docker (service:gluetun)| Node 1 | Routed via Gluetun | `8085/TCP` (WebUI) | `/data/torrents` | **P2 (High)** | `DECLARED` |
| **14**| **Prowlarr** | Indexer manager & proxy synchronizer for Sonarr/Radarr | Docker Container | Node 1 | VLAN 20 (`192.168.1.132`) | `9696/TCP` | Config volume | **P2 (High)** | `DECLARED` |
| **15**| **Sonarr** | TV series monitoring, episode grabber & automatic file renamer | Docker Container | Node 1 | VLAN 20 (`192.168.1.132`) | `8989/TCP` | `/data` (Atomic Hardlinks) | **P2 (High)** | `DECLARED` |
| **16**| **Radarr** | Movie collection manager, quality profiler & automated downloader | Docker Container | Node 1 | VLAN 20 (`192.168.1.132`) | `7878/TCP` | `/data` (Atomic Hardlinks) | **P2 (High)** | `DECLARED` |
| **17**| **Bazarr** | Subtitle management engine (automatic RO/EN subtitle fetching) | Docker Container | Node 1 | VLAN 20 (`192.168.1.132`) | `6767/TCP` | `/data/media` | **P3 (Normal)** | `DECLARED` |
| **18**| **Jellyfin** | High-performance media streaming server with Intel QSV transcoding | Docker Container | Node 1 | VLAN 20 (`192.168.1.132`) | `8096/TCP` | `/data/media`, `/dev/dri` | **P2 (High)** | `DECLARED` |
| **19**| **Jellyseerr** | Clean request & discovery web interface for media users | Docker Container | Node 1 | VLAN 20 (`192.168.1.132`) | `5055/TCP` | Config volume | **P3 (Normal)** | `DECLARED` |
| **20**| **Immich Server** | Self-hosted Google Photos alternative with mobile auto-sync | Docker Container | Node 1 | VLAN 20 (`192.168.1.132`) | `2283/TCP` | `/data/photos` | **P2 (High)** | `DECLARED` |
| **21**| **Immich ML Engine** | Neural engine for facial recognition and semantic CLIP text search | Docker Container | Node 1 | VLAN 20 (`192.168.1.132`) | Internal API | Model cache volume | **P2 (High)** | `DECLARED` |

### 1.3. Cloud-Native, DevSecOps & Platform Engineering
| # | Service Name | Purpose | Deployment Model | Host Node | Network / VLAN | Port | Auth Method | Criticality | Factual Status |
| :- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **22**| **Harbor Registry** | Enterprise OCI container & Helm registry with Trivy vulnerability scanning| Kubernetes / Compose | Node 1 / 4 | VLAN 30 (`192.168.1.18`) | `8088/TCP`, `8444` | Keycloak OIDC / RBAC | **P2 (High)** | `ROADMAP` |
| **23**| **Argo CD** | Declarative GitOps continuous delivery controller for Kubernetes | Kubernetes Pod | Node 4 | VLAN 30 (`192.168.1.18`) | `8081/TCP` | Keycloak OIDC | **P2 (High)** | `ROADMAP` |
| **24**| **MetalLB** | Bare-metal load-balancer controller routing virtual IPs in LAN | Kubernetes DaemonSet| Node 4 | VLAN 30 | ARP / BGP | Kubeconfig | **P2 (High)** | `ROADMAP` |
| **25**| **Kyverno** | Kubernetes admission policy-as-code engine enforcing security standards | Kubernetes Pod | Node 4 | VLAN 30 | Webhook Hook | K8s API | **P2 (High)** | `ROADMAP` |
| **26**| **Longhorn** | Cloud-native distributed block storage for persistent pod volumes | Kubernetes DaemonSet| Node 4 | VLAN 30 | `9500/TCP` | Basic / OIDC | **P2 (High)** | `ROADMAP` |
| **27**| **Woodpecker CI** | Cloud-native lightweight container pipeline runner | Kubernetes Pod | Node 4 | VLAN 30 (`192.168.1.18`) | `8000/TCP` | GitHub Webhook / Token | **P3 (Normal)** | `DEPLOYED` |
| **28**| **Backstage** | Internal Developer Portal, service catalog & architecture explorer | Kubernetes Pod | Node 4 | VLAN 30 | `7007/TCP` | Keycloak OIDC | **P3 (Normal)** | `ROADMAP` |

### 1.4. Security Operations Center (SOC), DFIR & Malware Lab
| # | Service Name | Purpose | Deployment Model | Host Node | Network / VLAN | Port | Auth Method | Criticality | Factual Status |
| :- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **29**| **Wazuh Manager 4.14** | Host intrusion detection, file integrity monitoring & compliance audits | LXC CT 106 | Node 1 | VLAN 10 (`192.168.1.240`) | `1514/TCP`, `55000` | Wazuh Agent Token / API| **P1 (Critical)** | `DEPLOYED` |
| **30**| **Suricata NIDS/IPS** | Real-time deep packet inspection and signature threat detection | FreeBSD Daemon | VM 200 | Bridge `vmbr0`, `vmbr1` | Kernel Hook | None (Passive/Drop) | **P1 (Critical)** | `DEPLOYED` |
| **31**| **Zeek (Bro) NSM** | Detailed protocol parsing, file extraction, SSL/DNS behavioral analysis| Container / LXC | Node 1 | TAP / Mirror Port | Internal Pipe | System User | **P2 (High)** | `ROADMAP` |
| **32**| **Velociraptor** | Advanced endpoint DFIR, live digital forensics and VQL-based hunting | Container / LXC | Node 1 | VLAN 20 | `8889/TCP` | mTLS / Web GUI | **P2 (High)** | `ROADMAP` |
| **33**| **TheHive + Cortex** | Security Incident Response Platform (SIRP) with automated analyzers | Docker Compose | Node 1 | VLAN 20 | `9000/TCP`, `9001` | Keycloak OIDC / API Key| **P2 (High)** | `ROADMAP` |
| **34**| **MISP / OpenCTI** | Threat intelligence sharing platform & STIX 2.1 indicator correlation | Docker Compose | Node 1 | VLAN 20 | `8082/TCP` | API Key / OIDC | **P2 (High)** | `ROADMAP` |
| **35**| **Greenbone / OpenVAS** | Comprehensive vulnerability management & authenticated network scanner | Docker Compose | Node 1 | VLAN 20 | `9392/TCP` | Local User / 2FA | **P3 (Normal)** | `ROADMAP` |
| **36**| **CAPEv2 Sandbox** | Automated malware execution, unpacking and behavioral reporting | KVM VM / Bridge | Node 1 | VLAN 66 (Quarantine) | `8000/TCP` | Admin Password | **P4 (Lab)** | `ROADMAP` |
| **37**| **REMnux / FLARE-VM** | Specialized digital forensics & reverse engineering workstations | KVM VMs | Node 1 | VLAN 66 (Quarantine) | `22/TCP`, `3389` | Operator Password | **P4 (Lab)** | `DEPLOYED` |

### 1.5. Artificial Intelligence & ELO Research Platform
| # | Service Name | Purpose | Deployment Model | Host Node | Network / VLAN | Port | Auth Method | Criticality | Factual Status |
| :- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **38**| **Ollama GPU AI** | GPU-accelerated local LLM inference (CUDA 12.x on GTX 1050 Ti) | LXC CT 102 | Node 1 | VLAN 20 (`192.168.1.110`) | `11434/TCP` | Internal / Caddy | **P2 (High)** | `DEPLOYED` |
| **39**| **LiteLLM Proxy** | Unified AI gateway: rate-limiting, load-balancing, provider abstraction | Docker Container | Node 1 | VLAN 20 (`192.168.1.110`) | `4000/TCP` | Virtual Master Keys | **P2 (High)** | `ROADMAP` |
| **40**| **Qdrant Vector DB** | Dedicated vector search engine for persistent ELO long-term memory & RAG | Docker Container | Node 1 | VLAN 20 (`192.168.1.110`) | `6333/TCP` | API Key | **P2 (High)** | `ROADMAP` |
| **41**| **Langfuse** | LLM observability: prompt versioning, token usage, latency & eval metrics| Docker Compose | Node 1 | VLAN 20 (`192.168.1.110`) | `3100/TCP` | Keycloak OIDC | **P3 (Normal)** | `ROADMAP` |
| **42**| **Open WebUI** | Feature-rich AI workspace with multi-model chat, documents & tools | Docker Container | Node 1 | VLAN 20 (`192.168.1.110`) | `3000/TCP` | Keycloak OIDC | **P3 (Normal)** | `ROADMAP` |
| **43**| **JupyterHub** | Multi-user Python data science and machine learning research platform | Docker / K8s Pod | Node 1 / 4 | VLAN 20 | `8000/TCP` | Keycloak OIDC | **P3 (Normal)** | `ROADMAP` |

---

## 2. Port Allocation & Collision Prevention Table

The following static port assignments guarantee that no two services contend for identical sockets:

```text
PORT RANGE    SERVICE / DAEMON              HOST NODE       VLAN
──────────────────────────────────────────────────────────────────
22/TCP        OpenSSH Management Daemon     All Nodes       VLAN 10
53/UDP/TCP    Unbound Recursive DNS         VM 200          VLAN 10
80/TCP        Caddy HTTP Redirect Ingress   Node 1          VLAN 10
443/TCP       Caddy HTTPS / mTLS Ingress    Node 1          VLAN 10
2283/TCP      Immich Photo & Video Server   Node 1 (Docker) VLAN 20
3000/TCP      Grafana Central Dashboard     CT 104          VLAN 20
3001/TCP      Uptime Kuma Health Prober     CT 103          VLAN 20
4000/TCP      LiteLLM Unified AI Gateway    Node 1 (Docker) VLAN 20
5055/TCP      Jellyseerr Media Requests     Node 1 (Docker) VLAN 20
5432/TCP      PostgreSQL Database Cluster   VM 311 / Docker VLAN 20
6333/TCP      Qdrant Vector Engine          Node 1 (Docker) VLAN 20
6443/TCP      Kubernetes API Server         Node 4          VLAN 10
6767/TCP      Bazarr Subtitle Automation    Node 1 (Docker) VLAN 20
7007/TCP      Backstage Developer Portal    Node 4 (K8s)    VLAN 30
7878/TCP      Radarr Movie Manager          Node 1 (Docker) VLAN 20
8000/TCP      NetBox DCIM / IPAM Web GUI    Node 1 (Docker) VLAN 20
8006/TCP      Proxmox VE Management GUI     Node 1          VLAN 10
8007/TCP      Proxmox Backup Server (PBS)   Node 1 / 2      VLAN 10
8080/TCP      Scrutiny SMART Web Interface  CT 101          VLAN 20
8081/TCP      Argo CD GitOps Web Console    Node 4 (K8s)    VLAN 30
8085/TCP      qBittorrent WebUI (Gluetun)   Node 1 (Docker) VLAN 20
8088/TCP      Harbor OCI Registry Ingress   Node 1 (Docker) VLAN 30
8096/TCP      Jellyfin Media Streaming      Node 1 (Docker) VLAN 20
8123/TCP      Home Assistant Core WebGUI    CT 100          VLAN 20
8200/TCP      HashiCorp Vault Secrets API   Node 1 (Docker) VLAN 20
8443/TCP      OPNsense Native Web Portal    VM 200          VLAN 10
8484/TCP      Keycloak Enterprise IAM       Node 1 (Docker) VLAN 20
8889/TCP      Velociraptor DFIR Server      Node 1 (Docker) VLAN 20
8989/TCP      Sonarr TV Series Manager      Node 1 (Docker) VLAN 20
9000/TCP      TheHive Incident Management   Node 1 (Docker) VLAN 20
9001/TCP      MinIO Web Console             CT 161          VLAN 20
9090/TCP      Prometheus TSDB Metrics       CT 104          VLAN 20
9100/TCP      Prometheus Node Exporter      All Hosts       VLAN 10
9392/TCP      Greenbone / OpenVAS Scanner   Node 1 (Docker) VLAN 20
9696/TCP      Prowlarr Indexer Proxy        Node 1 (Docker) VLAN 20
11434/TCP     Ollama Local GPU Inference    CT 102          VLAN 20
51820/UDP     WireGuard Remote VPN Gateway  VM 200          WAN / VLAN 10
55000/TCP     Wazuh Manager REST API        CT 106          VLAN 10
```
