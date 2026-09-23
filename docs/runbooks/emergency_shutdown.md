# Runbook: Emergency Controlled Shutdown Protocol

## Trigger Conditions
This runbook must be executed immediately when:
1. **Prolonged Power Outage**: UPS battery runtime drops below 20% or 5 minutes remaining.
2. **Thermal Emergency**: Hypervisor CPU core temperatures exceed 85°C continuously for >60 seconds.
3. **Severe Hardware Malfunction**: Uncorrectable disk I/O errors or electrical fault warnings.
4. **Physical Facility Evacuation**: Severe weather, flood, or facility maintenance requiring de-energizing.

## Shutdown Sequence (Inverse Dependency Order)

```text
PHASE 1: Stop On-Demand Research Labs & Heavy VMs (AD, Banking, Sandboxes)
  ↓
PHASE 2: Stop Local AI Inference & GPU Container (Ollama CT 102)
  ↓
PHASE 3: Flush Database Caches & Stop Production LXCs (Nextcloud, Home Assistant)
  ↓
PHASE 4: Stop Observability & Security Daemons (Prometheus, Wazuh)
  ↓
PHASE 5: Stop Edge Kubernetes Node (Node 4)
  ↓
PHASE 6: Sync Filesystems & Unmount Remote Storage (Node 2 NFS)
  ↓
PHASE 7: Stop Perimeter Firewall (OPNsense VM 200)
  ↓
PHASE 8: Sync & Halt Storage Node (Node 2 / OMV ZFS Pool Export)
  ↓
PHASE 9: Graceful Poweroff of Primary Hypervisor (Node 1)
```

## Step-by-Step Procedure

### 1. Automated Execution
If SSH access to Proxmox Node 1 is available, run the master emergency shutdown script:
```bash
bash scripts/emergency-shutdown.sh
```

### 2. Manual Execution Steps (If Automated Script Fails)

#### Phase 1: Terminate All Virtual Machines
```bash
# Gracefully shutdown non-firewall VMs first:
for vmid in 201 202 203 204 205 301 302 310 311 312 313 400 401 402 403 404 405 406 407 408 409 410; do
    if qm status "$vmid" 2>/dev/null | grep -q "status: running"; then
        echo "Shutting down VM $vmid..."
        qm shutdown "$vmid" --timeout 30 || qm stop "$vmid"
    fi
done
```

#### Phase 2: Terminate All LXC Containers
```bash
# Gracefully stop all active LXCs:
for ctid in $(pct list 2>/dev/null | awk 'NR>1 {print $1}'); do
    echo "Stopping LXC $ctid..."
    pct shutdown "$ctid" --timeout 20 || pct stop "$ctid"
done
```

#### Phase 3: Stop Edge Kubernetes (Node 4)
```bash
ssh -o ConnectTimeout=5 root@192.168.1.18 "systemctl stop k3s 2>/dev/null || systemctl stop k0s 2>/dev/null; sync; poweroff" || true
```

#### Phase 4: Stop Perimeter Firewall (VM 200)
```bash
qm shutdown 200 --timeout 45 || qm stop 200
```

#### Phase 5: Flush ZFS & Unmount Storage on Node 2 (NAS)
```bash
ssh -o ConnectTimeout=5 root@192.168.1.135 "sync; zpool export -a 2>/dev/null || true; poweroff" || true
```

#### Phase 6: Sync NVMe & Power Off Primary Hypervisor
```bash
sync
sync
systemctl poweroff
```

## Post-Incident Recovery Checklist
- [ ] Inspect thermal sensors and fan intakes for physical obstructions.
- [ ] Verify AC utility power stability before re-energizing.
- [ ] Inspect UPS battery charge status (>80% recommended before boot).
- [ ] Execute `docs/runbooks/cold_boot_sequence.md`.
