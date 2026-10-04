<div align="center">

# Kubernetes Hardware & Compute Worker Specification

</div>

<div align="center">

[![Worker](https://img.shields.io/badge/Kubernetes-Node%204%20Worker-0f172a.svg?style=flat&logo=kubernetes)](#)
[![CPU](https://img.shields.io/badge/CPU-AMD%20Athlon%20II%20X2%20220-blue.svg?style=flat&logo=amd)](#)
[![RAM](https://img.shields.io/badge/RAM-4GB%20DDR3%20(Tuned)-8b5cf6.svg?style=flat)](#)
[![Distribution](https://img.shields.io/badge/K8s-k3s%20%2F%20k0s%20Worker-10b981.svg?style=flat&logo=rancher)](#)

</div>

---

<div align="center">

## Executive Summary

</div>

This document describes the physical compute host dedicated to the Kubernetes cluster track (`k3s` / `k0s`). It details hardware limits, container runtime configurations, and resource quota constraints.

---

<div align="center">

## Host: `k8s-node-04` (Bare-Metal Kubernetes Worker)

</div>

<div align="center">

### Hardware Specifications

</div>

| Component | Engineering Specification |
| :--- | :--- |
| **Physical Chassis** | Custom ATX Compute Chassis |
| **Architecture** | x86_64 (`amd64`) |
| **Processor (CPU)** | AMD Athlon II X2 220 — 2 Cores / 2 Threads @ 2.80 GHz (Regor / AM3) |
| **Dedicated GPU** | NVIDIA GeForce GTS 250 — 1 GB GDDR3 (256-bit bus) |
| **System Memory (RAM)** | 4 GB DDR3-1066 MHz |
| **Storage Tier** | 80 GB 3.5" SATA II Mechanical HDD (7200 RPM) |
| **Power Supply** | Standard ATX 450W PSU |

<div align="center">

### Capacity & Tuning Notes

</div>
- **Memory Ceiling**: 4 GB DDR3 RAM is tuned strictly for lightweight container runtime execution (`containerd`) and `k3s-agent` background processing. Memory limits are enforced per-pod using resource requests and limits in Kubernetes manifests.
- **Compute Allocation**: The dual-core AMD Athlon II processor handles asynchronous batch jobs, CI/CD runners, and stateless microservices without burdening the primary hypervisor.
- **Storage Strategy**: The 80 GB SATA HDD serves as the OS root partition and ephemeral container image cache; persistent state is mounted remotely over NFSv4 from OpenMediaVault NAS (Node 2).

<div align="center">

### Software & Orchestration

</div>
- **Base Operating System**: Debian 12 Minimal / Alpine Linux Base.
- **Kubernetes Distribution**: `k3s` (Lightweight Kubernetes Worker Agent) / `k0s`.
- **Container Runtime**: `containerd` (CRI).
- **Networking**: Flannel CNI / Tailscale Mesh VPN node.
- **Static IPv4**: `192.168.1.18` (VLAN 30 CyberLab / Worker).
