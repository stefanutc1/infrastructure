# Architecture Decision Records (ADRs)

This directory documents the foundational architectural and design decisions governing the `stefanutc1/infrastructure` platform. Each record outlines the architectural context, decision taken, status, alternatives considered, and operational consequences.

## Governance & Process

1. **Immutability**: Once an ADR is accepted, it reflects an architectural consensus. If a decision changes, a new ADR must supersede it.
2. **Resource Awareness**: Every architectural decision must account for the physical hardware reality of the homelab fleet (12GB RAM hypervisor, 2GB NAS, 4GB edge compute node).
3. **No Fake Enterprise / Anti-Cargo-Culting**: Decisions prioritize lightweight, highly integrated solutions over bloated enterprise suites that degrade reliability.

## ADR Index

| ADR ID | Title | Status | Date | Primary Driver |
| :--- | :--- | :--- | :--- | :--- |
| [**ADR-0001**](file:///Users/s3nnnzzzatyeeee/stefannut_repos/datacenter/docs/decisions/ADR-0001-proxmox-primary-hypervisor.md) | Proxmox VE as Primary Bare-Metal Hypervisor vs. Pure Bare-Metal Kubernetes | **Accepted** | 2026-09-20 | Virtualization Density & Mixed OS Support |
| [**ADR-0002**](file:///Users/s3nnnzzzatyeeee/stefannut_repos/datacenter/docs/decisions/ADR-0002-lxc-container-density.md) | LXC Unprivileged Container Density for Core Microservices | **Accepted** | 2026-09-20 | RAM Optimization (<100MB per microservice) |
| [**ADR-0003**](file:///Users/s3nnnzzzatyeeee/stefannut_repos/datacenter/docs/decisions/ADR-0003-opnsense-perimeter-gateway.md) | Virtualized OPNsense Dual-Perimeter Gateway with Bridge Transit | **Accepted** | 2026-09-21 | Deep Packet Inspection (Suricata) & Zero Trust Routing |
| [**ADR-0004**](file:///Users/s3nnnzzzatyeeee/stefannut_repos/datacenter/docs/decisions/ADR-0004-storage-tiering-local-zfs.md) | Two-Tier Storage Architecture: Local NVMe `local-lvm` & Remote ZFS NAS | **Accepted** | 2026-09-21 | Low-Latency I/O vs. Fault-Tolerant Bulk Capacity |
| [**ADR-0005**](file:///Users/s3nnnzzzatyeeee/stefannut_repos/datacenter/docs/decisions/ADR-0005-identity-access-strategy.md) | Ingress mTLS / OAuth2-Proxy & On-Demand Active Directory Research Lab | **Accepted** | 2026-09-22 | Zero-Bloat Identity vs. Academic Research Depth |
| [**ADR-0006**](file:///Users/s3nnnzzzatyeeee/stefannut_repos/datacenter/docs/decisions/ADR-0006-secrets-management-hygiene.md) | GitOps Zero-Plaintext Secret Hygiene & SOPS/Age Ingestion | **Accepted** | 2026-09-22 | Leak Prevention without Heavyweight Vault Cluster |
| [**ADR-0007**](file:///Users/s3nnnzzzatyeeee/stefannut_repos/datacenter/docs/decisions/ADR-0007-edge-kubernetes-k3s-k0s.md) | Single-Node Lightweight Kubernetes (k3s/k0s) on Legacy Hardware | **Accepted** | 2026-09-22 | Edge Workload Isolation on AMD Athlon II Node |
| [**ADR-0008**](file:///Users/s3nnnzzzatyeeee/stefannut_repos/datacenter/docs/decisions/ADR-0008-elo-ai-routing-security-gatekeeper.md) | ELO Multi-Tier Cascade Routing & L0–L3 Tool Execution Gatekeeper | **Accepted** | 2026-09-23 | Local GPU Inference (GTX 1050 Ti) & Non-Destructive AI Governance |
