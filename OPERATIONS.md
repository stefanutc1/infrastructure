# Operations, Runbooks & Platform Maintenance Manual

## Executive Summary
This document establishes standard operating procedures (SOPs), maintenance cadence, emergency protocols, and diagnostic runbooks for the `stefanutc1/infrastructure` platform. It provides actionable operational workflows for Systems Administrators, Site Reliability Engineers (SREs), and Platform Engineers.

---

## 1. Day-2 Operational Cadence

| Frequency | Task / Procedure | Automation Script / Tool | Expected Duration |
| :--- | :--- | :--- | :--- |
| **Continuous (Real-Time)** | Endpoint Availability & Latency Monitoring | Uptime Kuma (CT 103) & Prometheus (CT 104) | Automated (<15s scrape) |
| **Daily (02:00 UTC)** | vzdump Container & VM Snapshots to OMV NAS | Proxmox vzdump Engine & PBS Client | ~25 minutes |
| **Daily (00:00 Europe/Bucharest)** | Threat Intelligence & Currency Sync | GitHub Actions CD & Python Sync Scripts | ~3 minutes |
| **Weekly (Sundays 03:00 UTC)** | Operating System Package Updates (Debian/PVE) | `ansible/playbooks/maintenance.yml` | ~15 minutes |
| **Weekly (Sundays 04:00 UTC)** | ZFS Storage Pool Scrub & Health Audit | OpenMediaVault ZFS Engine (`zpool scrub`) | ~45 minutes |
| **Monthly** | Backup Restoration Verification Drill | `docs/runbooks/vzdump_restore_drill.md` | ~20 minutes |
| **Quarterly** | WireGuard VPN & TLS Root Key Rotation | `scripts/wireguard_key_rotation.sh` | ~30 minutes |

---

## 2. Core Operational Runbooks

### 2.1 Deterministic Cold Boot Sequence
Restores full datacenter operations from a cold, unpowered state in dependency-ordered stages:
- **Runbook**: [`docs/runbooks/cold_boot_sequence.md`](file:///Users/s3nnnzzzatyeeee/stefannut_repos/datacenter/docs/runbooks/cold_boot_sequence.md)
- **Automated Script**: `scripts/cold-boot-sequence.sh` (or `scripts/cold-boot-sequence.ps1`)
- **Key Verification Gate**: Confirm OPNsense (VM 200) is running and resolving DNS before booting downstream LXCs.

### 2.2 Emergency Controlled Shutdown
Gracefully terminates active databases, containers, and hypervisors during power loss or thermal alarms:
- **Runbook**: [`docs/runbooks/emergency_shutdown.md`](file:///Users/s3nnnzzzatyeeee/stefannut_repos/datacenter/docs/runbooks/emergency_shutdown.md)
- **Automated Script**: `scripts/emergency-shutdown.sh` (or `scripts/emergency-shutdown.ps1`)
- **Safety Guarantee**: Flushes ZFS transaction groups and syncs NVMe journal pages to prevent filesystem corruption.

### 2.3 Proxmox vzdump Restore Verification
Validates that backup archives are valid and bootable without causing production network conflicts:
- **Runbook**: [`docs/runbooks/vzdump_restore_drill.md`](file:///Users/s3nnnzzzatyeeee/stefannut_repos/datacenter/docs/runbooks/vzdump_restore_drill.md)
- **Script**: `scripts/disaster-recovery/dr_vzdump_restore.sh`
- **Method**: Restores backup to a temporary ID (900-series) on an isolated bridge (`vmbr3`), verifies process tables, and purges test artifacts.

---

## 3. Routine Health Audits & Diagnostics

### 3.1 Automated Infrastructure Health Doctor
Execute the master automated health validation script:
```bash
python3 scripts/audit_infrastructure.py
```
This diagnostic engine inspects 12 operational domains (IaC, Ansible, Security, Secrets, Networking, Kubernetes, Observability, Backup, Disaster Recovery, Documentation, AI Governance, Supply Chain) and prints an executive summary table.

### 3.2 Hypervisor & Container Fleet Healthcheck
To check live hypervisor telemetry and container statuses from the Proxmox console:
```bash
bash scripts/healthcheck-fleet.sh
```

### 3.3 Network Connectivity & Bridge Diagnostics
```bash
# Verify inter-firewall transit responsiveness:
ping -c 2 10.10.20.1

# Verify DNS resolution via Unbound DoT:
dig @192.168.1.134 immich.lan +short

# Verify WireGuard tunnel status:
wg show wg-cloud0
```

---

## 4. Maintenance & Rolling Updates

### 4.1 Applying Operating System Updates
To perform safe, rolling updates across the container fleet using Ansible:
```bash
cd ansible
ansible-playbook -i inventories/homelab/hosts.yml playbooks/maintenance.yml
```

### 4.2 Proxmox VE Kernel Upgrades
1. Place the node in maintenance mode: stop non-critical on-demand research VMs.
2. Upgrade Proxmox packages:
   ```bash
   apt-get update && apt-get dist-upgrade -y
   ```
3. Reboot host if kernel was updated (`pve-kernel-*`).
4. Execute `docs/runbooks/cold_boot_sequence.md` to verify all services return to operational status.

---

## 5. Storage Maintenance & Space Management

### 5.1 Local NVMe (`local-lvm`) Disk Space
If root filesystem usage on Node 1 exceeds 80%:
```bash
# Clean up downloaded package caches:
apt-get clean
# Clean up temporary vzdump cache:
rm -rf /var/tmp/vzdump*
# Trim LVM-thin pool:
fstrim -av
```

### 5.2 OpenMediaVault ZFS Pool Scrub
Initiate monthly data scrub to verify block checksums:
```bash
ssh root@192.168.1.135 "zpool scrub omv_tank"
# Check scrub progress:
ssh root@192.168.1.135 "zpool status omv_tank"
```

---

## 6. Incident Response & On-Call Playbooks

### Alert: CPU Core Temperature Exceeds 80°C
1. Identify offending process via `htop` or `top`.
2. If caused by local Ollama AI GPU inference, verify fan curves and thermal throttle.
3. If temperature continues rising past 85°C, initiate `docs/runbooks/emergency_shutdown.md`.

### Alert: Uptime Kuma Endpoint Unreachable (HTTP 502/504)
1. Check if backend container is running: `pct status <ctid>`.
2. Inspect container systemd logs: `pct exec <ctid> -- journalctl -xeu <service> --no-pager -n 50`.
3. Check Caddy reverse proxy upstream logs: `docker logs caddy --tail 50`.
