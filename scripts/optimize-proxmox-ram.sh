#!/usr/bin/env bash
# ==============================================================================
# Proxmox VE Ultra-Lean Memory & RAM Optimization Engine ("La Sânge")
# Targets: Alpine Linux base containers, KSM deduplication, sysctl kernel tuning,
# TTY getty cleanup, and razor-sharp per-container RAM caps.
# ==============================================================================

set -euo pipefail

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

log " [PROXMOX RAM OPTIMIZATION] Starting Aggressive Memory Tuning..."

# 1. Host Kernel Memory Parameter Optimization
log " [1/5] Configuring Host Sysctl (swappiness=10, vfs cache pressure, dirty ratios)..."
cat << "SYSCTL" > /etc/sysctl.d/99-homelab-memory.conf
vm.swappiness = 10
vm.vfs_cache_pressure = 50
vm.dirty_background_ratio = 5
vm.dirty_ratio = 10
SYSCTL
sysctl -p /etc/sysctl.d/99-homelab-memory.conf

# 2. Enable & Tune Kernel Samepage Merging (KSM) for Shared Alpine Linux Memory Pages
log " [2/5] Enabling and Tuning Kernel Samepage Merging (KSM)..."
echo 1 > /sys/kernel/mm/ksm/run || true
echo 1000 > /sys/kernel/mm/ksm/pages_to_scan || true
echo 50 > /sys/kernel/mm/ksm/sleep_millisecs || true
systemctl enable --now ksm 2>/dev/null || true
systemctl enable --now ksmtuned 2>/dev/null || true

# 3. Disable Unused TTY Gettys inside all Alpine Containers
log " [3/5] Disabling unused TTY gettys in Alpine container inittabs..."
for ctid in $(pct list | awk "NR>1 {print \$1}"); do
    if pct status "$ctid" 2>/dev/null | grep -q "status: running"; then
        pct exec "$ctid" -- sh -c "
            if [-f /etc/inittab]; then
                sed -i 's/^tty/#tty/g' /etc/inittab 2>/dev/null || true
                kill -HUP 1 2>/dev/null || true
            fi
        " || true
    fi
done

# 4. Apply Memory Allocations (RAM:SWAP in MB)
log " [4/5] Applying container RAM limits..."
declare -A MEM_MAP=(
    [100]="384:128"   # Home Assistant Core
    [101]="128:64"    # Scrutiny S.M.A.R.T.
    [102]="2048:1024" # Ollama GPU LLM
    [103]="128:64"    # Uptime Kuma
    [104]="256:128"   # Monitoring Stack (Prometheus/Grafana)
    [105]="512:256"   # OWASP Pentest Lab
    [106]="6144:2048" # Wazuh SIEM / XDR Manager
)

for ctid in "${!MEM_MAP[@]}"; do
    val="${MEM_MAP[$ctid]}"
    mem="${val%%:*}"
    swap="${val##*:}"
    
    if [-f "/etc/pve/lxc/${ctid}.conf"]; then
        pct set "$ctid" -memory "$mem" -swap "$swap" 2>/dev/null || {
            sed -i "s/^memory:.*/memory: $mem/" "/etc/pve/lxc/${ctid}.conf"
            sed -i "s/^swap:.*/swap: $swap/" "/etc/pve/lxc/${ctid}.conf"
        }
        printf "    LXC %-3s -> Memory: %4s MB | Swap: %4s MB\n" "$ctid" "$mem" "$swap"
    fi
done

# 5. Drop Host Caches and Reclaim Inactive Memory
log " [5/5] Dropping host page cache & flushing memory..."
sync
echo 3 > /proc/sys/vm/drop_caches

log " [COMPLETE] Proxmox RAM Optimization Finished Successfully!"
