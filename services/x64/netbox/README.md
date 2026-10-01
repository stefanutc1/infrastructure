# NetBox — Source of Truth for DCIM & IPAM

<div align="center">

[![Service](https://img.shields.io/badge/Service-NetBox%20DCIM%2FIPAM-0f172a.svg?style=flat&logo=netbox)](#)
[![Port](https://img.shields.io/badge/Port-8000%2FTCP-blue.svg?style=flat)](#)
[![Integration](https://img.shields.io/badge/Integrations-Ansible%20%7C%20Terraform-10b981.svg?style=flat&logo=ansible)](#)
[![Single Source of Truth](https://img.shields.io/badge/Architecture-Single%20Source%20of%20Truth-6366f1.svg?style=flat&logo=database)](#)

</div>

---

## Executive Summary

NetBox functions as the centralized **Single Source of Truth (SSoT)** for the entire homelab and private cloud infrastructure:
- **IPAM (IP Address Management)**: Authoritative tracking of all 802.1Q VLANs, VRFs, subnets, and static/DHCP IP assignments.
- **DCIM (Data Center Infrastructure Management)**: Inventory of physical server chassis, hardware racks, Proxmox hypervisor nodes, KVM virtual machines, and LXC containers.
- **Infrastructure as Code Integration**: Dynamic inventory plugin integration with Ansible (`netbox.netbox.nb_inventory`) and resource state management via Terraform (`netbox-community/netbox`).

---

## 1. Architectural Topology & Synchronization

```mermaid
flowchart LR
    NetBox["NetBox SSoT<br/>PostgreSQL 16 + Redis<br/>Port 8000/TCP"]
    
    subgraph AUTOMATION["Infrastructure Automation Engines"]
        Ansible["Ansible Automation<br/>Dynamic Inventory Plugin"]
        Terraform["Terraform Engine<br/>State Reconciliation"]
        Prometheus["Prometheus SD<br/>Service Discovery Targets"]
    end

    NetBox -->|"Dynamic Inventory Feed"| Ansible
    NetBox -->|"IP/VLAN Schema Alignment"| Terraform
    NetBox -->|"Exporter Endpoint Targets"| Prometheus
```

---

## 2. Deployment Runbook

```bash
# 1. Prepare configuration
cp .env.example .env

# 2. Configure administrative credentials and generate SECRET_KEY
# python3 -c 'import secrets; print(secrets.token_hex(50))'

# 3. Launch stack
docker compose up -d

# 4. Verify endpoint responsiveness
curl -s http://127.0.0.1:8000/api/status/ | jq .
```

The WebUI is accessible locally at `http://<HOST_IP>:8000` or through Caddy reverse proxy at `https://netbox.lan` with client mTLS enforcement.
