# ADR-0002: LXC Unprivileged Container Density for Core Microservices

## Status
**Accepted**

## Context
Physical Node 1 (`pve_primary_x64`) possesses exactly 12GB of physical DDR4 RAM. The platform requires executing over 15 distinct functional microservices:
- Home automation (Home Assistant Core, Zigbee2MQTT).
- Storage and disk health telemetry (Scrutiny, smartd).
- System observability (Prometheus, Grafana, Node Exporter, Telegraf).
- Service availability monitoring (Uptime Kuma, Gatus).
- Security telemetry & HIDS (Wazuh manager and agent).
- Web application & media hosting (Nextcloud Hub, Immich, Jellyfin media suite).
- Local artificial intelligence (Ollama LLM runtime).

If each microservice were packaged inside an independent KVM virtual machine, each VM would require its own Linux kernel, systemd init process, virtualized virtio devices, and a baseline allocation of at least 1,024MB to 2,048MB of RAM. Running 15 VMs would require 24GB to 32GB of RAM, immediately exhausting physical capacity and triggering OOM kernel panics.

## Decision
We mandate **Unprivileged Linux Containers (LXC)** as the default compute deployment model for all standard Linux services on Node 1.

Key constraints & implementation rules:
1. **Unprivileged User Namespaces**: LXCs run with unprivileged user mapping (`root` inside the container maps to unprivileged UID 100000+ on the host), neutralizing container escape vulnerabilities.
2. **Lean Memory Ceilings**:
   - High-density monitoring services (Scrutiny CT 101, Uptime Kuma CT 103): capped at 96MB–128MB RAM.
   - Automation services (Home Assistant CT 100): capped at 384MB RAM.
   - Observability stack (Prometheus & Grafana CT 104): capped at 1,024MB RAM.
   - AI runtime (Ollama CT 102): allocated 2,048MB RAM with GPU VRAM handling the model context.
3. **Shared Host Kernel**: All LXCs leverage the underlying Proxmox Linux 6.8+ kernel, eliminating redundant kernel page tables and memory caching duplication.
4. **ZRAM Swap Augmentation**: Host system utilizes 3.8GB zram compressed RAM swap (lz4 algorithm) to absorb memory bursts safely without physical disk swapping.

## Consequences

### Positive
- **Dramatic Density**: 15+ microservices run simultaneously within an aggregate memory footprint under 7GB RAM.
- **Instantaneous Lifecycle**: Sub-second boot and reboot times for container updates.
- **Near-Zero I/O Overhead**: Container storage operations pass directly to the host NVMe filesystem without guest virtualization layers.

### Negative
- **Privilege Separation Caveats**: Unprivileged containers cannot mount certain kernel filesystems (NFS mounts require host bind-mounts; Docker-in-LXC requires explicit nesting flags).
- **Kernel Sharing Constraint**: All LXC services share the host kernel version; services requiring custom kernel modules or non-Linux operating systems must utilize KVM VMs.
