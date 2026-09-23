# ADR-0004: Two-Tier Storage Architecture: Local NVMe `local-lvm` & Remote ZFS NAS

## Status
**Accepted**

## Context
Data workloads in the homelab exhibit divergent performance and retention characteristics:
1. **High-IOPS Workloads**: Operating system root filesystems, PostgreSQL databases (Core Banking DB, Immich DB), Docker overlay filesystems, and Prometheus TSDB require low latency and high random IOPS.
2. **Bulk Storage & Archive**: Media libraries, raw packet capture dumps, ISO installation images, and daily backup snapshots (vzdump) require multi-hundred gigabyte capacity, parity fault tolerance, and data integrity guarantees.

Physical Node 1 is equipped with a fast 512GB NVMe SSD, but lacks drive bays for multi-disk RAID arrays.
Physical Node 2 (`omv_nas`) is an ASUS X451MA laptop server with an Intel Celeron N2830, 2GB RAM, and a 500GB storage drive running OpenMediaVault (OMV) with ZFS capabilities.

## Decision
We implement a **Two-Tier Disaggregated Storage Model**:

1. **Tier 1 (High-IOPS Local Storage - Node 1)**:
   - Backed by the internal 512GB NVMe SSD formatted as `local-lvm` (LVM-thin).
   - Dedicated exclusively to active virtual machine disks, container rootfs partitions, and database runtime volumes.
   - Leverages TRIM/discard support to prevent write amplification.
2. **Tier 2 (Capacity & Backup Storage - Node 2 / OMV NAS)**:
   - Backed by OpenMediaVault with a ZFS storage pool (`omv_tank`).
   - Exported across dedicated gigabit network links via NFSv4 (for Proxmox backup storage) and SMBv3 (for multi-client file sharing).
   - Serves as the primary target for Proxmox vzdump container snapshots, ISO distribution, and S3 object storage (MinIO CT 161).
   - Automated ZFS scrubs and SMART telemetry monitored via Scrutiny (CT 101).

## Consequences

### Positive
- **Optimal Performance**: Zero database latency degradation; container boots occur at NVMe line speed (>2,000 MB/s read).
- **Physical Fault Isolation**: Primary compute failures do not endanger backup archives residing on the independent NAS hardware.
- **Data Integrity**: ZFS block-level checksumming on Node 2 protects archival data against silent bit rot.

### Negative
- **Network Bandwidth Bottleneck**: Backups and restores over the 1Gbps Ethernet link are capped at ~115 MB/s transfer speed.
- **Node 2 Memory Constraints**: ZFS ARC (Adaptive Replacement Cache) on Node 2 must be strictly capped (`zfs_arc_max = 512MB`) to prevent starvation of the 2GB system memory.
