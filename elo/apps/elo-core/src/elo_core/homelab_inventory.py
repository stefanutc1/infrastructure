from __future__ import annotations
from typing import List, Dict, Any

# Complete Homelab Services & Infrastructure Inventory (Exact IPs and Ports)
HOMELAB_SERVICES: List[Dict[str, Any]] = [
    # --- 4 Pinned Favorites ---
    {
        "id": "home-assistant-core",
        "name": "Home Assistant Core",
        "category": "Smart Home & IoT",
        "ip": "192.168.1.10",
        "port": 8123,
        "domain": "ha.lan",
        "status": "online",
        "is_pinned": True,
        "tags": ["Smart Home", "Automations", "IoT", "Zigbee", "ESP32"],
        "description": "Central open-source home automation platform integrating ESP32 nodes, Zigbee sensors, Shelly relays, and custom security scripts."
    },
    {
        "id": "immich-photos",
        "name": "Immich Photos & Video",
        "category": "Storage & Cloud",
        "ip": "192.168.1.15",
        "port": 2283,
        "domain": "immich.lan",
        "status": "online",
        "is_pinned": True,
        "tags": ["Photos", "Backup", "AI Facial Recognition", "CLIP Search"],
        "description": "High-performance self-hosted backup and gallery solution for photos and videos featuring AI facial clustering and CLIP search."
    },
    {
        "id": "vaultwarden-vault",
        "name": "Vaultwarden Password Vault",
        "category": "Security & Identity",
        "ip": "192.168.1.16",
        "port": 8080,
        "domain": "vaultwarden.lan",
        "status": "online",
        "is_pinned": True,
        "tags": ["Bitwarden", "Passwords", "2FA / TOTP", "Zero-Knowledge"],
        "description": "Lightweight Rust implementation of Bitwarden backend providing zero-knowledge encrypted credential storage and TOTP authenticator."
    },
    {
        "id": "grafana-telemetry",
        "name": "Grafana Telemetry & Dashboards",
        "category": "Observability & Metrics",
        "ip": "192.168.1.11",
        "port": 3000,
        "domain": "grafana.lan",
        "status": "online",
        "is_pinned": True,
        "tags": ["Metrics", "Dashboards", "Prometheus", "Loki"],
        "description": "Central visualization and analytics platform aggregating Prometheus hardware metrics, Loki logs, and Proxmox node health."
    },

    # --- All Services Catalog (28 Services) ---
    {
        "id": "nginx-ingress",
        "name": "OPNsense Nginx Ingress Reverse Proxy",
        "category": "Networking & DNS",
        "ip": "192.168.1.134",
        "port": 80,
        "domain": "opnsense.homelab.local",
        "status": "online",
        "is_pinned": False,
        "tags": ["Reverse Proxy", "SSL / TLS 1.3", "OPNsense", "WebSockets"],
        "description": "High-performance enterprise Nginx reverse proxy running directly on OPNsense Core with automated wildcard SSL/TLS termination and WebSocket acceleration."
    },
    {
        "id": "pi-hole",
        "name": "Pi-hole DNS Sinkhole & Adblock",
        "category": "Networking & DNS",
        "ip": "192.168.1.4",
        "port": 8080,
        "domain": "pihole.lan",
        "status": "online",
        "is_pinned": False,
        "tags": ["DNS", "Adblock", "FTL Engine", "Wildcards"],
        "description": "Network-wide DNS sinkhole, tracker blocker, and local authoritative DNS server resolving *.lan domains to Nginx Proxy Manager."
    },
    {
        "id": "nextcloud-hub",
        "name": "Nextcloud Hub",
        "category": "Storage & Cloud",
        "ip": "192.168.1.8",
        "port": 80,
        "domain": "nextcloud.lan",
        "status": "online",
        "is_pinned": False,
        "tags": ["Storage", "WebDAV", "Office", "Collaboration"],
        "description": "Enterprise-grade private cloud platform featuring file sync, calendar/contacts sharing, collaborative document editing, and WebDAV endpoints."
    },
    {
        "id": "prometheus-tsdb",
        "name": "Prometheus TSDB Engine",
        "category": "Observability & Metrics",
        "ip": "192.168.1.11",
        "port": 9090,
        "domain": "prometheus.lan",
        "status": "online",
        "is_pinned": False,
        "tags": ["Time Series", "Metrics", "Scraping", "Alerts"],
        "description": "High-efficiency time-series metric collector scraping node-exporter, Proxmox hypervisor telemetry, and container runtime statistics."
    },
    {
        "id": "grafana-loki",
        "name": "Grafana Loki Log Engine",
        "category": "Observability & Metrics",
        "ip": "192.168.1.11",
        "port": 3100,
        "domain": "loki.lan",
        "status": "online",
        "is_pinned": False,
        "tags": ["Logs", "Promtail", "LogQL", "Aggregation"],
        "description": "Horizontally-scalable log aggregation system indexing metadata labels to ingest syslog and Docker container logs with minimal overhead."
    },
    {
        "id": "uptime-kuma",
        "name": "Uptime Kuma Status Monitor",
        "category": "Observability & Metrics",
        "ip": "192.168.1.7",
        "port": 3001,
        "domain": "uptime.lan",
        "status": "online",
        "is_pinned": False,
        "tags": ["Uptime", "Ping", "Status Page", "Monitoring"],
        "description": "Self-hosted monitoring tool tracking HTTP status, TCP ports, DNS latency, and SSL certificate validity with public status badges."
    },
    {
        "id": "n8n-automation",
        "name": "n8n Workflow Automation",
        "category": "Automation & Workflow",
        "ip": "192.168.1.13",
        "port": 5678,
        "domain": "n8n.lan",
        "status": "online",
        "is_pinned": False,
        "tags": ["No-Code", "Automation", "Webhooks", "Integrations"],
        "description": "Fair-code workflow automation platform connecting 400+ third-party APIs, local scripts, MQTT brokers, and webhooks with low-code visual nodes."
    },
    {
        "id": "gitea-git-forge",
        "name": "Gitea Git Forge & Actions",
        "category": "CI/CD & Git",
        "ip": "192.168.1.17",
        "port": 3000,
        "domain": "gitea.lan",
        "status": "online",
        "is_pinned": False,
        "tags": ["Git", "Repositories", "Code Review", "Actions"],
        "description": "Lightweight self-hosted Git version control forge supporting pull requests, issue tracking, and mirror synchronization with GitHub."
    },
    {
        "id": "woodpecker-ci",
        "name": "Woodpecker CI/CD Engine",
        "category": "CI/CD & Git",
        "ip": "192.168.1.14",
        "port": 8000,
        "domain": "woodpecker.lan",
        "status": "online",
        "is_pinned": False,
        "tags": ["CI/CD", "Pipelines", "Docker in Docker", "Builds"],
        "description": "Community-driven container-native continuous integration engine executing automated test suites, linting, and Docker container builds."
    },
    {
        "id": "authelia-sso",
        "name": "Authelia 2FA & SSO Portal",
        "category": "Security & Identity",
        "ip": "192.168.1.20",
        "port": 9091,
        "domain": "authelia.lan",
        "status": "online",
        "is_pinned": False,
        "tags": ["SSO", "2FA", "OpenID Connect", "FIDO2"],
        "description": "Open-source authentication server providing Single Sign-On (SSO) and multi-factor authentication (TOTP, WebAuthn/FIDO2) for reverse proxy ingress."
    },
    {
        "id": "crowdsec-cyber-defense",
        "name": "CrowdSec Cyber Defense & LAPI",
        "category": "Security & Identity",
        "ip": "192.168.1.9",
        "port": 8080,
        "domain": "crowdsec.lan",
        "status": "online",
        "is_pinned": False,
        "tags": ["IPS / IDS", "Firewall", "Threat Intelligence", "Bouncer"],
        "description": "Crowd-sourced behavioral intrusion prevention system parsing reverse proxy and SSH logs to detect and neutralize brute-force attacks."
    },
    {
        "id": "jellyfin-media",
        "name": "Jellyfin Media Server",
        "category": "Media & Streaming",
        "ip": "192.168.1.21",
        "port": 8096,
        "domain": "jellyfin.lan",
        "status": "online",
        "is_pinned": False,
        "tags": ["Media Server", "Streaming", "Movies", "Transcoding"],
        "description": "Free and open-source media streaming server with multi-user profiles, metadata scraping, and hardware transcoding."
    },
    {
        "id": "radarr-movies",
        "name": "Radarr Movie Automation",
        "category": "Media & Streaming",
        "ip": "192.168.1.21",
        "port": 7878,
        "domain": "radarr.lan",
        "status": "online",
        "is_pinned": False,
        "tags": ["Movies", "Servarr", "Automated Downloads"],
        "description": "Automated movie collection manager that monitors RSS feeds for new films, upgrades quality, and integrates with download clients."
    },
    {
        "id": "sonarr-tv",
        "name": "Sonarr TV Series Automation",
        "category": "Media & Streaming",
        "ip": "192.168.1.21",
        "port": 8989,
        "domain": "sonarr.lan",
        "status": "online",
        "is_pinned": False,
        "tags": ["TV Shows", "Servarr", "Episodes"],
        "description": "Smart PVR for TV series newsgroup and BitTorrent users, automating episode tracking, downloading, and library renaming."
    },
    {
        "id": "prowlarr-indexers",
        "name": "Prowlarr Indexer Proxy",
        "category": "Media & Streaming",
        "ip": "192.168.1.21",
        "port": 9696,
        "domain": "prowlarr.lan",
        "status": "online",
        "is_pinned": False,
        "tags": ["Indexers", "Torrents", "Usenet", "Sync"],
        "description": "Centralized indexer manager that integrates directly with Radarr and Sonarr to sync 500+ Torrent and Usenet indexers seamlessly."
    },
    {
        "id": "bazarr-subtitles",
        "name": "Bazarr Subtitle Synchronizer",
        "category": "Media & Streaming",
        "ip": "192.168.1.21",
        "port": 6767,
        "domain": "bazarr.lan",
        "status": "online",
        "is_pinned": False,
        "tags": ["Subtitles", "Sync", "Multilingual"],
        "description": "Companion application to Sonarr and Radarr that automates the search, download, and audio-synchronization of subtitles in multiple languages."
    },
    {
        "id": "qbittorrent-client",
        "name": "qBittorrent Web Client",
        "category": "Media & Streaming",
        "ip": "192.168.1.21",
        "port": 8080,
        "domain": "qbittorrent.lan",
        "status": "online",
        "is_pinned": False,
        "tags": ["Torrents", "Downloads", "P2P", "Client"],
        "description": "Lightweight, high-performance BitTorrent client with feature-rich WebUI, speed scheduling, and granular category tagging."
    },
    {
        "id": "actual-budget",
        "name": "Actual Budget",
        "category": "Productivity & Notes",
        "ip": "192.168.1.22",
        "port": 5006,
        "domain": "actualbudget.lan",
        "status": "online",
        "is_pinned": False,
        "tags": ["Finance", "Budgeting", "Zero-Based", "Privacy"],
        "description": "Privacy-focused zero-based envelope budgeting application with encrypted client-side synchronization and automated bank statement parsing."
    },
    {
        "id": "changedetection-io",
        "name": "ChangeDetection.io Monitor",
        "category": "Automation & Workflow",
        "ip": "192.168.1.24",
        "port": 5000,
        "domain": "changedetection.lan",
        "status": "online",
        "is_pinned": False,
        "tags": ["Web Monitor", "Diff Tracker", "Restock Alerts"],
        "description": "Automated website change detection and notification tool monitoring price updates, restock alerts, API changes, and DOM element mutations."
    },
    {
        "id": "trilium-notes",
        "name": "Trilium Personal Knowledge Base",
        "category": "Productivity & Notes",
        "ip": "192.168.1.19",
        "port": 8080,
        "domain": "trilium.lan",
        "status": "online",
        "is_pinned": False,
        "tags": ["Notes", "Knowledge Base", "Markdown", "Hierarchy"],
        "description": "Hierarchical note-taking application designed for building extensive personal knowledge bases with rich text, code snippets, and mind maps."
    },
    {
        "id": "scrutiny-smart",
        "name": "Scrutiny S.M.A.R.T. Drive Health",
        "category": "Observability & Metrics",
        "ip": "192.168.1.18",
        "port": 8080,
        "domain": "scrutiny.lan",
        "status": "online",
        "is_pinned": False,
        "tags": ["S.M.A.R.T.", "Storage Health", "SSD Wear", "Disks"],
        "description": "Hard drive health dashboard tracking S.M.A.R.T. metrics, temperature trends, and failure probabilities across SSD and HDD storage devices."
    },
    {
        "id": "it-tools",
        "name": "IT-Tools Handy Utilities",
        "category": "Productivity & Notes",
        "ip": "192.168.1.12",
        "port": 80,
        "domain": "it-tools.lan",
        "status": "online",
        "is_pinned": False,
        "tags": ["Dev Tools", "Cheatsheets", "Converters", "Utilities"],
        "description": "Collection of handy online tools for developers and system administrators including JWT decoders, UUID generators, subnet calculators, and hashers."
    },
    {
        "id": "opnsense-gateway",
        "name": "OPNsense Core Gateway & Firewall",
        "category": "Virtual Machines (VMs)",
        "ip": "192.168.1.132",
        "port": 8443,
        "domain": "opnsense.lan",
        "status": "online",
        "is_pinned": False,
        "tags": ["OPNsense", "VM 200", "Firewall", "Router"],
        "description": "Enterprise virtual router and stateful firewall appliance providing layer-3 routing, inter-VLAN isolation, HAProxy reverse proxy, and WireGuard VPN."
    },
    {
        "id": "windows-server-2025",
        "name": "Windows Server 2025 Datacenter",
        "category": "Virtual Machines (VMs)",
        "ip": "192.168.1.132",
        "port": 3389,
        "domain": "winserver.lan",
        "status": "online",
        "is_pinned": False,
        "tags": ["Windows Server 2025", "VM 201", "Active Directory", "KVM", "RDP"],
        "description": "Dedicated Windows Server 2025 datacenter virtual machine configured with OVMF UEFI, TPM 2.0, VirtIO drivers, 4GB RAM, and 120GB NVMe storage."
    }
]

# Physical & Virtual Cluster Nodes
HOMELAB_NODES: List[Dict[str, Any]] = [
    {
        "id": "apple-m1-compute",
        "name": "Apple M1 Node (Local Host)",
        "role": "Local Host • ARM64 Compute & ELO Core Runtime",
        "ip": "192.168.1.133 (MacBook-Air.local)",
        "is_local_host": True,
        "status": "ONLINE",
        "workloads": "ELO Core Daemon, Local ML Accelerators, Metal MPS"
    },
    {
        "id": "pve-node-1",
        "name": "Proxmox VE Hypervisor",
        "role": "Core Hypervisor & Virtualization",
        "ip": "192.168.1.132",
        "probe_ports": [8006, 22, 9100],
        "is_local_host": False,
        "status": "probe",
        "workloads": "LXC Containers, VM 200 (OPNsense), VM 201 (Windows Server 2025 Datacenter)"
    },
    {
        "id": "openmediavault-nas",
        "name": "OpenMediaVault NAS",
        "role": "Storage & ZFS Backup Pools",
        "ip": "192.168.1.135",
        "probe_ports": [80, 445, 22, 9100],
        "is_local_host": False,
        "status": "probe",
        "workloads": "ZFS Pools, NFS / SMB Shares, BorgBackup"
    }
]
