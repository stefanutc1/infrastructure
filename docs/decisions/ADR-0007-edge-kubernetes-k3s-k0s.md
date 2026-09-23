# ADR-0007: Single-Node Lightweight Kubernetes (k3s/k0s) on Legacy Hardware

## Status
**Accepted**

## Context
Physical Node 4 (`k8s_node_04` / `kubernetes_node`) is legacy x86_64 bare-metal hardware:
- CPU: AMD Athlon II X2 220 (2 cores / 2 threads, 2.8 GHz, lacking modern AVX instructions).
- GPU: NVIDIA GeForce GTS 250 (legacy Tesla architecture).
- RAM: 4GB DDR3.
- Disk: 80GB Mechanical HDD.

Deploying a standard upstream Kubernetes distribution (such as kubeadm, OpenShift, or multi-node RKE2) on this node is technically infeasible:
- The upstream `etcd` consensus engine alone requires significant disk I/O write IOPS that exceed the capabilities of an aging mechanical 80GB HDD, causing leader election timeouts.
- A full upstream control plane (kube-apiserver, kube-controller-manager, kube-scheduler, kubelet) consumes 2GB–3GB RAM, leaving less than 1GB for any application workloads.

However, the infrastructure platform requires edge Kubernetes capabilities to support:
- Cloud-native GitOps testing with Flux / ArgoCD.
- Containerized batch pipelines and Woodpecker CI agents.
- Cilium eBPF network policy validation.

## Decision
We deploy **k3s (or k0s)** in a single-node, optimized edge configuration on Node 4:

1. **Lightweight Datastore**:
   - Replaces `etcd` with SQLite (or Kine virtual etcd layer), reducing disk I/O pressure and memory overhead by >75%.
2. **Disabled Unused Components**:
   - Disables built-in Traefik ingress controller, servicelb, and local-storage provider where external alternatives or minimal footprints are preferred (`--disable traefik,servicelb`).
3. **Flannel / Cilium Lightweight CNI**:
   - Uses host-local IPAM and lightweight VXLAN/eBPF routing suited for dual-core CPU performance.
4. **ZRAM Swap Configuration**:
   - Enforces a 1.5GB ZRAM swap pool on the node to prevent OOM termination of the kubelet during container image pulls.

## Consequences

### Positive
- **Functional Edge Cluster**: Enables real Kubernetes API interactions, CRDs, and GitOps deployments on legacy 4GB RAM hardware.
- **Minimal Idle Overhead**: Idle k3s daemon consumes approximately 400MB–600MB of RAM.
- **Disaster Isolation**: Faults or crashes on the legacy edge node cannot disrupt the primary Proxmox hypervisor hosting production workloads.

### Negative
- **No High Availability**: As a single-node cluster, node maintenance requires scheduled downtime for edge workloads.
- **Compute Constraints**: Workloads scheduled on Node 4 must be lightweight (e.g., Woodpecker runners, DNS testing, ephemeral cron containers) and avoid AVX-dependent binaries.
