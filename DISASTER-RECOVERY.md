<div align="center">

# Enterprise Disaster Recovery Plan & Business Continuity Blueprint

</div>

<div align="center">

[![Disaster Recovery](https://img.shields.io/badge/DR-Business%20Continuity%20Plan-0f172a.svg?style=flat&logo=target)](#)
[![Scenarios](https://img.shields.io/badge/Playbooks-4%20Disaster%20Scenarios%20(A--D)-e11d48.svg?style=flat&logo=opsgenie)](#1-disaster-classification--recovery-scenarios)
[![RTO Target](https://img.shields.io/badge/Max%20RTO-%3C%202%20Hours%20(Bare--Metal)-0284c7.svg?style=flat&logo=speedtest)](#2-disaster-recovery-targets-rto--rpo)
[![Drills](https://img.shields.io/badge/Validation-Continuous%20Testing%20Schedule-10b981.svg?style=flat&logo=checkmarx)](#4-disaster-recovery-testing--validation-schedule)
[![Author](https://img.shields.io/badge/BCP%20Lead-Moan%C4%83%20%C8%98tef%C4%83nu%C8%9B--Cornel-blue.svg?style=flat&logo=github)](https://github.com/stefanutc1)
[![University](https://img.shields.io/badge/University-Universitatea%20din%20Craiova%20%C2%B7%20FEAA-0284c7.svg?style=flat&logo=academia)](https://feaa.ucv.ro)

</div>

---

<div align="center">

## Executive Summary

</div>

This document establishes the comprehensive Disaster Recovery (DR) Plan, operational recovery objectives, failure scenario playbooks, and bare-metal reconstruction runbooks for the `stefanutc1/infrastructure` platform.

It defines deterministic, repeatable procedures to recover infrastructure services, network routing, and stateful database ledgers in the event of catastrophic hardware failure, physical loss, or cyber compromise.

> [!NOTE]
> **Factual DR Operational Posture: `WARNING / DECLARED`**  
> In accordance with the **"No Fake Enterprise"** standard, the infrastructure health audit flags the Disaster Recovery domain as `WARNING`. While all backup snapshots, bare-metal rebuild scripts, and test restoration runbooks are fully implemented and verified, offsite synchronization utilizes an encrypted, decoupled cold archive rather than a multi-region active-active live failover cluster.

---

<div align="center">

## 1. Disaster Classification & Recovery Scenarios

</div>

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                               DISASTER CLASSIFICATION                                  │
├─────────────────────┬──────────────────────┬────────────────────┬──────────────────────┤
│ SCENARIO A:         │ SCENARIO B:          │ SCENARIO C:        │ SCENARIO D:          │
│ Hypervisor Hardware │ NAS Storage Failure  │ Ransomware / Cyber │ Total Physical Loss  │
│ Failure (Node 1)    │ (Node 2 ZFS Pool)    │ Intrusion          │ (Fire, Flood, Power) │
├─────────────────────┼──────────────────────┼────────────────────┼──────────────────────┤
│ Primary compute down│ Storage pool degraded│ Hosts compromised; │ All bare-metal nodes │
│ NVMe disks salvaged │ Compute intact       │ lateral infection  │ destroyed            │
│ Target RTO: 2 Hours │ Target RTO: 4 Hours  │ Target RTO: 6 Hours│ Target RTO: 24 Hours │
│ Target RPO: 1 Hour  │ Target RPO: 6 Hours  │ Target RPO: 0-24h  │ Target RPO: 24 Hours │
└─────────────────────┴──────────────────────┴────────────────────┴──────────────────────┘
```

---

<div align="center">

## 2. Disaster Recovery Targets (RTO & RPO)

</div>

| Subsystem / Service | Recovery Point Objective (RPO) | Recovery Time Objective (RTO) | Primary Recovery Mechanism |
| :--- | :--- | :--- | :--- |
| **Perimeter Routing (OPNsense)** | < 1 Hour | < 15 Minutes | XML configuration restore from Git / OMV NAS |
| **Home Automation (CT 100)** | < 6 Hours | < 30 Minutes | vzdump archive restore from OMV NAS |
| **Monitoring Stack (CT 104)** | < 24 Hours | < 45 Minutes | vzdump archive restore + Git dashboard re-sync |
| **PostgreSQL Financial Ledger** | < 1 Hour (during drills) | < 30 Minutes | Point-in-Time `pg_dump` restoration |
| **ZFS Storage Pool (Node 2)** | < 15 Minutes (Snapshots) | < 2 Hours | ZFS local snapshot rollback (`zfs rollback`) |
| **Complete Bare-Metal Node 1** | < 24 Hours | < 2 Hours | USB automated bootstrap + vzdump full restore |

---

<div align="center">

## 3. Scenario Playbooks & Step-by-Step Runbooks

</div>

<div align="center">

### Scenario A: Primary Hypervisor Hardware Failure (Node 1 Rebuild)

</div>

If the physical motherboard or CPU on Node 1 experiences catastrophic failure, follow this 5-stage reconstruction workflow:

<div align="center">

#### Step 1: Hardware Replacement & Proxmox Installation (T+0:00 - T+0:30)

</div>
1. Procure replacement x86_64 host (minimum 4 cores, 12 GB DDR4 RAM, PCIe NVMe M.2 slot).
2. Install Proxmox VE 9.2 via bootable USB installation media.
3. Configure hostname `pve` and static management IP `192.168.1.132/24` with default gateway `192.168.1.1`.

<div align="center">

#### Step 2: Bootstrap Base Configuration & Network Bridges (T+0:30 - T+0:45)

</div>
1. Clone the infrastructure repository from Git:
   ```bash
   git clone https://github.com/stefanutc1/infrastructure.git /root/datacenter
   cd /root/datacenter
   ```
2. Execute post-install bootstrap automation:
   ```bash
   bash scripts/proxmox-post-install.sh
   bash scripts/pve-remove-nag.sh
   ```
3. Restore virtual network bridges (`vmbr0`, `vmbr1`, `vmbr2`, `vmbr3`) in `/etc/network/interfaces` and reload:
   ```bash
   ifreload -a
   ```

<div align="center">

#### Step 3: Mount Secondary Storage NAS (T+0:45 - T+1:00)

</div>
Connect Proxmox to OpenMediaVault NAS backup storage over Gigabit Ethernet:
```bash
pvesm add nfs nas-backup \
    --server 192.168.1.135 \
    --export /export/backup \
    --content backup,iso \
    --options vers=4.1
```

<div align="center">

#### Step 4: Restore Core Virtual Machines & Containers (T+1:00 - T+1:45)

</div>
Restore workloads in strict dependency hierarchy:
```bash
# 1. Restore OPNsense Perimeter Firewall (VM 200):
qmrestore nas-backup:backup/vzdump-qemu-200-*.vma.zst 200 --storage local-lvm
qm start 200

# Verify network routing returns:
ping -c 2 1.1.1.1

# 2. Restore Home Assistant (CT 100):
pct restore 100 nas-backup:backup/vzdump-lxc-100-*.tar.zst --storage local-lvm
pct start 100

# 3. Restore Scrutiny (CT 101) & Uptime Kuma (CT 103):
pct restore 101 nas-backup:backup/vzdump-lxc-101-*.tar.zst --storage local-lvm
pct restore 103 nas-backup:backup/vzdump-lxc-103-*.tar.zst --storage local-lvm
pct start 101
pct start 103

# 4. Restore Monitoring Stack (CT 104) & Wazuh SIEM (CT 106):
pct restore 104 nas-backup:backup/vzdump-lxc-104-*.tar.zst --storage local-lvm
pct restore 106 nas-backup:backup/vzdump-lxc-106-*.tar.zst --storage local-lvm
pct start 104
pct start 106
```

<div align="center">

#### Step 5: Verify System Integrity & Health (T+1:45 - T+2:00)

</div>
```bash
bash scripts/healthcheck-fleet.sh
python3 scripts/audit_infrastructure.py
```

---

<div align="center">

### Scenario C: Ransomware / Host Compromise Recovery

</div>

If malicious tampering or an unauthorized intrusion is detected on any node:
1. **Network Severing**: Disconnect physical ethernet cables immediately to isolate the cluster.
2. **Containment Inspection**: Use the out-of-band console to inspect Wazuh FIM logs (`/var/ossec/logs/alerts/alerts.log`).
3. **Rollback to Known-Good State**:
   - For LXC containers: Destroy compromised container (`pct destroy <ctid> --purge`) and restore from pre-incident vzdump backup.
   - For ZFS pools: Revert to previous hourly snapshot (`zfs rollback omv_tank/share@zfs-auto-snap_hourly-...`).
4. **Credential Rotation**: Execute `scripts/wireguard_key_rotation.sh` and rotate all database passwords and API tokens.

---

<div align="center">

## 4. Disaster Recovery Testing & Validation Schedule

</div>

| Drill Name | Frequency | Target Objective | Execution Guide |
| :--- | :--- | :--- | :--- |
| **vzdump Sandbox Restore** | Monthly | Verify archive extraction without IP collision | [`docs/runbooks/vzdump_restore_drill.md`](docs/runbooks/vzdump_restore_drill.md) |
| **Cold Boot Sequencing** | Quarterly | Verify automated dependency boot order | [`docs/runbooks/cold_boot_sequence.md`](docs/runbooks/cold_boot_sequence.md) |
| **Simulated Network Partition**| Semi-Annual | Test OPNsense failover and local DNS caching | `scripts/chaos/chaos_runner.sh` |
| **Offsite Archive Integrity** | Semi-Annual | Decrypt and verify sample GPG/Age payload | Manual Audit |

---

<div align="center">

*Engineered with precision by **Moană Ștefănuț-Cornel** (`@stefanutc1`).*  
*Universitatea din Craiova · Facultatea de Economie și Administrarea Afacerilor (FEAA) · Informatică Economică (2024–2027).*

</div>
