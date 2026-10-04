<div align="center">

# Enterprise Platform Operations & Maintenance Manual

</div>

<div align="center">

[![Operations](https://img.shields.io/badge/SRE-Day--2%20Operations%20Manual-0f172a.svg?style=flat&logo=ansible)](#)
[![Health Doctor](https://img.shields.io/badge/Diagnostics-Automated%20Doctor%20(12%20Domains)-10b981.svg?style=flat&logo=python)](#31-automated-infrastructure-health-doctor)
[![Runbooks](https://img.shields.io/badge/Runbooks-Cold%20Boot%20%26%20Emergency%20Shutdown-0284c7.svg?style=flat&logo=gnubash)](#2-core-operational-runbooks)
[![Edge Resiliency](https://img.shields.io/badge/Hardware%20Triggers-ESP32%20Power%20Failover-e7352c.svg?style=flat&logo=espressif)](esp32/power_monitor/README.md)
[![Zero-Cost](https://img.shields.io/badge/Cloud%20Audit-Zero--Cost%20Static%20Verification-8b5cf6.svg?style=flat&logo=terraform)](scripts/verify_zero_cloud_cost.py)
[![Author](https://img.shields.io/badge/Operations%20Lead-Moan%C4%83%20%C8%98tef%C4%83nu%C8%9B--Cornel-blue.svg?style=flat&logo=github)](https://github.com/stefanutc1)
[![University](https://img.shields.io/badge/University-Universitatea%20din%20Craiova%20%C2%B7%20FEAA-0284c7.svg?style=flat&logo=academia)](https://feaa.ucv.ro)

</div>

---

<div align="center">

## Executive Summary

</div>

This document establishes standard operating procedures (SOPs), maintenance schedules, emergency failover protocols, hardware-triggered telemetry responses, and diagnostic runbooks for the `stefanutc1/infrastructure` platform.

It equips Systems Administrators, Site Reliability Engineers (SREs), and Platform Engineers with deterministic workflows for both day-to-day operations and disaster scenarios.

---

<div align="center">

## 1. Day-2 Operational Cadence

</div>

| Frequency | Task / Procedure | Automation Script / Tool | Expected Duration |
| :--- | :--- | :--- | :--- |
| **Continuous (Real-Time)** | Endpoint Availability & Latency Monitoring | Uptime Kuma (CT 103) & Prometheus (CT 104) | Automated (<15s scrape) |
| **Continuous (Real-Time)** | Edge Telemetry, Rack Thermals & Grid Watch | ESP32 Nodes 01–04 (`esp32/`) & Home Assistant | Sub-second edge interrupts |
| **Daily (02:00 UTC)** | vzdump Container & VM Snapshots to OMV NAS | Proxmox vzdump Engine & PBS Client | ~25 minutes |
| **Daily (00:00 Europe/Bucharest)** | Threat Intelligence & Currency Sync | GitHub Actions CD & Python Sync Scripts | ~3 minutes |
| **Weekly (Sundays 03:00 UTC)** | Operating System Package Updates (Debian/PVE) | `ansible/playbooks/maintenance.yml` | ~15 minutes |
| **Weekly (Sundays 04:00 UTC)** | ZFS Storage Pool Scrub & Health Audit | OpenMediaVault ZFS Engine (`zpool scrub`) | ~45 minutes |
| **Monthly** | Backup Restoration Verification Drill | `docs/runbooks/vzdump_restore_drill.md` | ~20 minutes |
| **Quarterly** | WireGuard VPN & TLS Root Key Rotation | `scripts/wireguard_key_rotation.sh` | ~30 minutes |

---

<div align="center">

## 2. Core Operational Runbooks

</div>

<div align="center">

### 2.1 Deterministic Cold Boot Sequence

</div>
Restores full datacenter operations from a cold, unpowered state in strict dependency-ordered stages:
- **Runbook**: [`docs/runbooks/cold_boot_sequence.md`](docs/runbooks/cold_boot_sequence.md)
- **Automated Script**: `scripts/cold-boot-sequence.sh` (or `scripts/cold-boot-sequence.ps1`)
- **Key Verification Gate**: Confirm OPNsense (VM 200) is running and resolving DNS before booting downstream LXC containers.

<div align="center">

### 2.2 Emergency Controlled Shutdown

</div>
Gracefully terminates active databases, containers, and hypervisors during power loss or thermal alarms:
- **Runbook**: [`docs/runbooks/emergency_shutdown.md`](docs/runbooks/emergency_shutdown.md)
- **Automated Script**: `scripts/emergency-shutdown.sh` (or `scripts/emergency-shutdown.ps1`)
- **Safety Guarantee**: Flushes ZFS transaction groups and syncs NVMe journal pages to prevent filesystem corruption.

<div align="center">

### 2.3 Hardware-Triggered Emergency Shutdown (ESP32 Power Monitor)

</div>
- **Node**: `ESP32-EDGE-04` (`esp32/power_monitor/`)
- **Mechanism**: The 230V AC optocoupler detects grid drop instantly. If power remains lost and the 12V SLA battery bank discharges below **11.4V (critical cut-off threshold)**:
  1. ESP32 sounds the onboard emergency buzzer.
  2. Issues an authenticated emergency webhook to Proxmox VE host API (`POST /api2/json/nodes/pve/status -d command=shutdown`).
  3. Proxmox automatically initiates `scripts/emergency-shutdown.sh`, safely powering down VMs, flushing databases, and unmounting NFS before battery cutoff.

<div align="center">

### 2.4 Datacenter Thermal Regulation (ESP32 Environment Node)

</div>
- **Node**: `ESP32-EDGE-03` (`esp32/datacenter_environment/`)
- **Mechanism**: Continuously samples BME280 ambient temperature and dual DS18B20 1-Wire intake/exhaust probes:
  - If delta-T ($\Delta T = T_{\text{exhaust}} - T_{\text{intake}}$) exceeds $8.0^\circ\text{C}$ or exhaust exceeds $38.0^\circ\text{C}$, the 25kHz PWM driver spins Noctua cooling fans to 100% duty cycle.
  - If ambient temperature exceeds $45.0^\circ\text{C}$ despite fan cooling, an alert is dispatched to Prometheus Alertmanager and Uptime Kuma.

<div align="center">

### 2.5 Proxmox vzdump Restore Verification Drill

</div>
Validates that backup archives are valid and bootable without causing production network conflicts:
- **Runbook**: [`docs/runbooks/vzdump_restore_drill.md`](docs/runbooks/vzdump_restore_drill.md)
- **Script**: `scripts/disaster-recovery/dr_vzdump_restore.sh`
- **Method**: Restores backup to a temporary ID (900-series) on an isolated bridge (`vmbr3`), verifies process tables, and purges test artifacts.

---

<div align="center">

## 3. Routine Health Audits & Diagnostics

</div>

<div align="center">

### 3.1 Automated Infrastructure Health Doctor

</div>
Execute the master automated health validation script:
```bash
python3 scripts/audit_infrastructure.py
```
This diagnostic engine inspects 12 operational domains (IaC, Ansible, Security, Secrets, Networking, Kubernetes, Observability, Backup, Disaster Recovery, Documentation, AI Governance, Supply Chain) and outputs an executive validation report.

<div align="center">

### 3.2 ESP32 Edge Firmware Verification

</div>
Verify compile integrity and configuration consistency across all 4 edge microcontroller sketches:
```bash
python3 scripts/verify_esp32_firmware.py
```

<div align="center">

### 3.3 Zero-Cost Cloud Static Verification

</div>
Verify that all cloud Terraform configurations conform strictly to $0.00 / free-tier rules:
```bash
python3 scripts/verify_zero_cloud_cost.py
```

<div align="center">

### 3.4 Hypervisor & Container Fleet Healthcheck

</div>
To check live hypervisor telemetry and container statuses from the Proxmox console:
```bash
bash scripts/healthcheck-fleet.sh
```

<div align="center">

### 3.5 Network Connectivity & Transit Diagnostics

</div>
```bash
# Verify inter-firewall transit bus responsiveness:
ping -c 2 10.10.20.1

# Verify DNS resolution via Unbound DoT:
dig @192.168.1.134 immich.lan +short

# Verify WireGuard tunnel status:
wg show wg-cloud0
```

---

<div align="center">

## 4. Maintenance & Rolling Updates

</div>

<div align="center">

### 4.1 Applying Operating System Updates

</div>
To perform safe, rolling updates across the container fleet using Ansible:
```bash
cd ansible
ansible-playbook -i inventories/homelab/hosts.yml playbooks/maintenance.yml
```

<div align="center">

### 4.2 Proxmox VE Kernel Upgrades

</div>
1. Place the node in maintenance mode: stop non-critical on-demand research VMs.
2. Upgrade Proxmox packages:
   ```bash
   apt-get update && apt-get dist-upgrade -y
   ```
3. Reboot host if kernel was updated (`pve-kernel-*`).
4. Execute `docs/runbooks/cold_boot_sequence.md` to verify all services return to operational status.

---

<div align="center">

## 5. Storage Maintenance & Space Management

</div>

<div align="center">

### 5.1 Local NVMe (`local-lvm`) Disk Space

</div>
If root filesystem usage on Node 1 exceeds 80%:
```bash
# Clean up downloaded package caches:
apt-get clean
# Clean up temporary vzdump cache:
rm -rf /var/tmp/vzdump*
# Trim LVM-thin pool:
fstrim -av
```

<div align="center">

### 5.2 OpenMediaVault ZFS Pool Scrub

</div>
Initiate monthly data scrub to verify block checksums:
```bash
ssh root@192.168.1.135 "zpool scrub omv_tank"
# Check scrub progress:
ssh root@192.168.1.135 "zpool status omv_tank"
```

---

<div align="center">

## 6. Incident Response & On-Call Playbooks

</div>

<div align="center">

### Alert: CPU Core Temperature Exceeds 80°C

</div>
1. Identify offending process via `htop` or `top`.
2. If caused by local Ollama AI GPU inference, verify fan curves and thermal throttle.
3. If temperature continues rising past 85°C, initiate `docs/runbooks/emergency_shutdown.md`.

<div align="center">

### Alert: Uptime Kuma Endpoint Unreachable (HTTP 502/504)

</div>
1. Check if backend container is running: `pct status <ctid>`.
2. Inspect container systemd logs: `pct exec <ctid> -- journalctl -xeu <service> --no-pager -n 50`.
3. Check Caddy reverse proxy upstream logs: `docker logs caddy --tail 50`.

---

<div align="center">

*Engineered with precision by **Moană Ștefănuț-Cornel** (`@stefanutc1`).*  
*Universitatea din Craiova · Facultatea de Economie și Administrarea Afacerilor (FEAA) · Informatică Economică (2024–2027).*

</div>
