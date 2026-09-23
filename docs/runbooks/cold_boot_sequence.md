# Runbook: Deterministic Cold Boot Sequence

## Objective
Restore full datacenter operations from a total cold power-off state in a deterministic, dependency-ordered sequence, ensuring all core networking, DNS, and storage mounts are fully established before downstream microservices boot.

## Boot Order Stages

```text
STAGE 0: Physical Hardware & Power Distribution
  ↓
STAGE 1: Network Ingress & DNS Routing (OPNsense VM 200)
  ↓
STAGE 2: Storage Infrastructure (OpenMediaVault NAS & NFS Mounts)
  ↓
STAGE 3: Core Telemetry & Identity Ingress (Caddy, Uptime Kuma)
  ↓
STAGE 4: Production Microservices & Storage Apps (Home Assistant, Nextcloud, Immich)
  ↓
STAGE 5: Observability & Security SIEM (Prometheus, Grafana, Wazuh)
  ↓
STAGE 6: AI Inference & Edge Nodes (Ollama GPU, k8s_node_04)
  ↓
STAGE 7: On-Demand Research Labs (Optional - Manual Trigger)
```

## Step-by-Step Procedure

### Stage 0: Physical Initialization
1. Power on physical network switches and the ISP modem. Wait 60 seconds for fiber/cable link synchronization.
2. Power on Physical Node 2 (`omv_nas`). Wait for BIOS boot and ZFS pool import.
3. Power on Physical Node 1 (`pve_primary_x64`).
4. Power on Physical Node 4 (`k8s_node_04`).

### Stage 1: Network Ingress & Perimeter Firewall (T+0:00 - T+2:00)
Proxmox VE boots and automatically initializes network bridges `vmbr0` through `vmbr3`.
Proxmox starts VM 200 (`opnsense-firewall`) via boot order 1:
```bash
# Verify OPNsense is operational from Proxmox console:
qm status 200
# Expected: status: running

# Verify WAN and LAN ping:
ping -c 2 1.1.1.1
ping -c 2 192.168.1.134
```
*Verification Gate*: Unbound DNS must respond on `192.168.1.134:53`.

### Stage 2: Storage Availability (T+2:00 - T+3:30)
Verify that OpenMediaVault NAS is reachable and exports NFS/SMB shares:
```bash
# Verify NAS ping:
ping -c 2 192.168.1.135

# Verify NFS storage mount on Proxmox:
pvesm status | grep -E "nfs|backup"
# Expected: active
```

### Stage 3: Core Ingress & Telemetry (T+3:30 - T+4:30)
Proxmox boots Container 103 (`uptimekuma`):
```bash
pct start 103 2>/dev/null || true
pct status 103
```
*Verification Gate*: Access `http://192.168.1.119:3001` or confirm HTTP 200.

### Stage 4: Production Microservices (T+4:30 - T+6:00)
Start core household automation and storage services:
```bash
# Start Home Assistant:
pct start 100
# Start Scrutiny disk health monitor:
pct start 101
# Start Nextcloud Hub:
pct start 101 2>/dev/null || true
# Start Media Suite (Jellyfin):
pct start 105
```

### Stage 5: Observability & Security Monitoring (T+6:00 - T+7:30)
```bash
# Start Prometheus & Grafana:
pct start 104
# Start Wazuh HIDS Server:
pct start 106
```
*Verification Gate*: Confirm Prometheus targets are green at `http://192.168.1.121:9090/targets`.

### Stage 6: AI Inference & Edge Kubernetes (T+7:30 - T+9:00)
```bash
# Start Ollama GPU Inference:
pct start 102
# Verify NVIDIA GPU passthrough inside Container 102:
pct exec 102 -- nvidia-smi

# Check k3s/k0s status on Node 4:
ssh root@192.168.1.18 "kubectl get nodes"
```

### Stage 7: Automated Fleet Health Audit
Run the automated validation script:
```bash
bash scripts/healthcheck-fleet.sh
python3 scripts/audit_infrastructure.py
```
*Success Criteria*: All 12 domain checks report `PASS` (with DR reported as `WARNING` or `PASS`).
