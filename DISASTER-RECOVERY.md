# Disaster Recovery Plan, Runbooks & Business Continuity

## Executive Summary
This document establishes the comprehensive Disaster Recovery (DR) Plan, operational recovery objectives, scenario playbooks, and bare-metal reconstruction runbooks for the `stefanutc1/infrastructure` platform. It defines deterministic procedures to recover infrastructure services, network connectivity, and stateful databases in the event of catastrophic hardware failure, physical loss, or cyber intrusion.

> [!NOTE]
> **Factual DR Status: `WARNING / DECLARED`**
> In accordance with the **No Fake Enterprise** standard, the infrastructure health audit reports the Disaster Recovery domain as `WARNING`. While all backup snapshots, bare-metal rebuild scripts, and test restoration runbooks are fully implemented, offsite synchronization is an encrypted, decoupled cold archive rather than an automated, multi-region live active-active failover cluster.

---

## 1. Disaster Classification & Recovery Scenarios

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

## 2. Disaster Recovery Targets (RTO & RPO)

| Subsystem / Service | Recovery Point Objective (RPO) | Recovery Time Objective (RTO) | Primary Recovery Mechanism |
| :--- | :--- | :--- | :--- |
| **Perimeter Routing (OPNsense)** | < 1 Hour | < 15 Minutes | XML restore from Git / OMV NAS |
| **Home Automation (CT 100)** | < 6 Hours | < 30 Minutes | vzdump archive restore from OMV NAS |
| **Monitoring Stack (CT 104)** | < 24 Hours | < 45 Minutes | vzdump archive restore + Git dashboard re-sync |
| **PostgreSQL Financial Ledger** | < 1 Hour (during drills) | < 30 Minutes | Point-in-Time pg_dump restoration |
| **ZFS Storage Pool (Node 2)** | < 15 Minutes (Snapshots) | < 2 Hours | ZFS local snapshot rollback (`zfs rollback`) |
| **Complete Bare-Metal Node 1** | < 24 Hours | < 2 Hours | USB automated bootstrap + vzdump full restore |

---

## 3. Scenario Playbooks & Step-by-Step Runbooks

### Scenario A: Primary Hypervisor Hardware Failure (Node 1 Rebuild)

If the physical motherboard or CPU on Node 1 fails, follow this bare-metal reconstruction procedure:

#### Step 1: Hardware Replacement & Proxmox Installation (T+0:00 - T+0:30)
1. Procure replacement x86_64 host (minimum 4 cores, 12GB DDR4 RAM, NVMe M.2 slot).
2. Install Proxmox VE 9.2 via bootable USB flash drive.
3. Configure hostname `pve` and static management IP `192.168.1.132/24` with gateway `192.168.1.1`.

#### Step 2: Bootstrap Base Configuration & Network Bridges (T+0:30 - T+0:45)
1. Clone the infrastructure repository from Git:
   ```bash
   git clone https://github.com/stefanutc1/infrastructure.git /root/datacenter
   cd /root/datacenter
   ```
2. Execute the post-install bootstrap script:
   ```bash
   bash scripts/proxmox-post-install.sh
   bash scripts/pve-remove-nag.sh
   ```
3. Restore network bridges (`vmbr0`, `vmbr1`, `vmbr2`, `vmbr3`) in `/etc/network/interfaces` and reload:
   ```bash
   ifreload -a
   ```

#### Step 3: Mount Secondary Storage NAS (T+0:45 - T+1:00)
Connect Proxmox to OpenMediaVault NAS backup storage over Gigabit Ethernet:
```bash
pvesm add nfs nas-backup \
    --server 192.168.1.135 \
    --export /export/backup \
    --content backup,iso \
    --options vers=4.1
```

#### Step 4: Restore Core Virtual Machines & Containers (T+1:00 - T+1:45)
Restore in dependency order:
```bash
# 1. Restore OPNsense Firewall (VM 200):
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

#### Step 5: Verify System Integrity (T+1:45 - T+2:00)
```bash
bash scripts/healthcheck-fleet.sh
python3 scripts/audit_infrastructure.py
```

---

### Scenario C: Ransomware / Host Compromise Recovery

If malicious tampering is detected on any node:
1. **Network Severing**: Unplug physical ethernet cables immediately to isolate the cluster.
2. **Containment Inspection**: Use out-of-band console to inspect Wazuh FIM logs (`/var/ossec/logs/alerts/alerts.log`).
3. **Rollback to Known-Good State**:
   - For LXC containers: Destroy compromised container (`pct destroy <ctid> --purge`) and restore from pre-incident backup.
   - For ZFS pools: Revert to previous hourly snapshot (`zfs rollback omv_tank/share@zfs-auto-snap_hourly-2026-09-23-0100`).
4. **Credential Rotation**: Execute `scripts/wireguard_key_rotation.sh` and rotate all database passwords.

---

## 4. Disaster Recovery Testing & Validation Schedule

| Drill Name | Frequency | Target Objective | Execution Guide |
| :--- | :--- | :--- | :--- |
| **vzdump Sandbox Restore** | Monthly | Verify archive extraction without IP collision | [`docs/runbooks/vzdump_restore_drill.md`](file:///Users/s3nnnzzzatyeeee/stefannut_repos/datacenter/docs/runbooks/vzdump_restore_drill.md) |
| **Cold Boot Sequencing** | Quarterly | Verify automated dependency boot order | [`docs/runbooks/cold_boot_sequence.md`](file:///Users/s3nnnzzzatyeeee/stefannut_repos/datacenter/docs/runbooks/cold_boot_sequence.md) |
| **Simulated Network Partition**| Semi-Annual | Test OPNsense failover and local DNS caching | `scripts/chaos/chaos_runner.sh` |
| **Offsite Archive Integrity** | Semi-Annual | Decrypt and verify sample GPG/Age payload | Manual Audit |
