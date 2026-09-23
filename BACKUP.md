# Enterprise Backup Strategy & Data Protection Architecture

## Executive Summary
This document establishes the comprehensive data protection, backup scheduling, snapshot retention, cryptographic verification, and disaster preparedness framework for the `stefanutc1/infrastructure` platform. In strict adherence to the industry **3-2-1 Backup Rule**, all critical production state, configurations, and database ledgers are protected against hardware failure, operator error, and cyber incidents.

---

## 1. The 3-2-1 Backup Topology

```text
                               PRIMARY DATA SOURCE
                     Proxmox VE Node 1 (NVMe local-lvm)
                     High-IOPS Containers, VMs & Databases
                                       │
                   ┌───────────────────┴───────────────────┐
                   ▼                                       ▼
         COPY 1: LOCAL RUNTIME                   COPY 2: SECONDARY MEDIA
         ZFS / LVM-thin Local Snapshots          OpenMediaVault NAS (Node 2)
         Frequency: Hourly (RPO 1h)              Media: ZFS SATA Pool (omv_tank)
         Retention: 24 Hours                     Export: NFSv4 / SMBv3 / S3
         Storage: Internal NVMe SSD              Protocol: vzdump / PBS Chunks
                                                 Retention: 7 Daily, 4 Weekly
                                                           │
                                                           ▼
                                                 COPY 3: OFFSITE COLD ARCHIVE
                                                 Encrypted Cloud / Cold Storage
                                                 Encryption: AES-256-GCM / Age
                                                 Schedule: Weekly Sync
                                                 Air-Gapped Against Ransomware
```

1. **3 Copies of Data**: Primary runtime copy + local secondary copy on NAS + tertiary offsite encrypted archive.
2. **2 Different Storage Media**: Fast NVMe Solid State Drive on Node 1 + Fault-Tolerant ZFS Mechanical SATA Drive on Node 2.
3. **1 Offsite Geographically Separated Copy**: Encrypted backup payload mirrored to remote cloud object storage (MinIO / S3 Glacier / Backblaze B2).

---

## 2. Backup Engines & Technologies

### 2.1 Proxmox Backup Server (PBS) Client Integration
- Proxmox VE Node 1 integrates natively with the Proxmox Backup Server client (`proxmox-backup-client`).
- **Chunk-Based Deduplication**: Backups are broken down into deduplicated, content-addressed chunks, reducing storage bandwidth and disk consumption by >70%.
- **Client-Side Encryption**: Backup archives are encrypted before transmission using AES-GCM-256 keys managed via `age`.

### 2.2 Proxmox vzdump Engine
- Generates snapshot-consistent (`mode: snapshot`) backups of running LXC containers and KVM virtual machines without requiring service downtime.
- In-memory state and disk blocks are copied transactionally to the NFS share on Node 2 (`nas-backup`).

### 2.3 OpenMediaVault ZFS Snapshots (`omv_tank`)
- Operating system snapshots on Node 2 automated via `sanoid` / `cron`:
  - Frequent: Every 15 minutes (retain 4).
  - Hourly: Every hour (retain 24).
  - Daily: At 00:00 (retain 30).
  - Monthly: On 1st of month (retain 3).

---

## 3. Recovery Objectives Matrix (RPO & RTO)

| Service Tier | Representative Services | Target RPO (Max Data Loss) | Target RTO (Max Downtime) | Backup Frequency | Retention Period |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Tier 1: Core Ingress & Network** | OPNsense (VM 200), Unbound, Caddy | **1 Hour** | **15 Minutes** | Hourly Git sync + Daily XML | 30 Days (Git History) |
| **Tier 2: Production Services** | Home Assistant (CT 100), Scrutiny, Nextcloud | **6 Hours** | **30 Minutes** | Daily vzdump (02:00 UTC) | 7 Daily, 4 Weekly, 3 Monthly |
| **Tier 3: Observability & SIEM** | Prometheus (CT 104), Wazuh (CT 106) | **24 Hours** | **1 Hour** | Daily TSDB / config export | 7 Days |
| **Tier 4: Research & Thesis** | Apache Fineract (VM 310), DB (VM 311) | **1 Hour** (during drills) | **1 Hour** | Pre-drill snapshot + pg_dump | 14 Days |
| **Tier 5: Ephemeral Labs** | Metasploitable, Kali, AD Forest | **N/A** (Golden Image) | **4 Hours** | Declarative IaC rebuild | Git Commit History |

---

## 4. Backup Schedules & Retention Rules

All scheduled backups execute during the off-peak maintenance window between **01:00 UTC and 03:00 UTC**:

```text
TIME (UTC)   TARGET WORKLOAD              ENGINE    DESTINATION STORAGE
─────────────────────────────────────────────────────────────────────────────
01:00        PostgreSQL Financial DB      pg_dump   Local NVMe & NFS Export
01:30        OPNsense XML Configuration   API Export OMV NAS Encrypted Share
02:00        CT 100 (Home Assistant)     vzdump    NFS `nas-backup` on Node 2
02:15        CT 101 (Scrutiny) & CT 103   vzdump    NFS `nas-backup` on Node 2
02:30        CT 104 (Prometheus) & CT 106 vzdump    NFS `nas-backup` on Node 2
03:00        ZFS Pool Scrub / Trim        zpool     Node 2 (`omv_tank`)
```

### Retention Pruning Formula (Proxmox VE)
```text
--keep-last 7 --keep-daily 7 --keep-weekly 4 --keep-monthly 3 --keep-yearly 1
```

---

## 5. Backup Integrity & Verification Automation

1. **Automated Checksum Verification**: Every backup archive generated by vzdump has its SHA-256 digest recorded in the backup catalog.
2. **Periodic Test Restore Drills**:
   - Monthly execution of [`docs/runbooks/vzdump_restore_drill.md`](file:///Users/s3nnnzzzatyeeee/stefannut_repos/datacenter/docs/runbooks/vzdump_restore_drill.md).
   - Automated restoration script `scripts/disaster-recovery/dr_vzdump_restore.sh` tests container bootability in an isolated VLAN.
3. **Health Audit Gate**: The automated doctor (`scripts/audit_infrastructure.py`) inspects backup declarations and flags missing retention policies or missing backup scripts as an operational failure.
