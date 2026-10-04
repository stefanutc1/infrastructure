<div align="center">

# Media Automation & Entertainment Suite (*arr Stack + Jellyfin)

</div>

<div align="center">

[![Service](https://img.shields.io/badge/Service-Media%20Automation%20Suite-0f172a.svg?style=flat&logo=plex)](#)
[![Standards](https://img.shields.io/badge/Architecture-TRaSH%20Guides%20Atomic%20Hardlinks-059669.svg?style=flat&logo=files)](#2-storage-layout--trash-guides-atomic-hardlinks)
[![Security](https://img.shields.io/badge/VPN%20Killswitch-Gluetun%20WireGuard%20(Zero--Leak)-e11d48.svg?style=flat&logo=wireguard)](#3-security-architecture-gluetun-vpn-killswitch)
[![Hardware](https://img.shields.io/badge/Transcoding-Intel%20QSV%20%2F%20NVENC-0284c7.svg?style=flat&logo=intel)](#)

</div>

---

<div align="center">

## Executive Summary

</div>

This module deploys the automated media management, indexing, and streaming ecosystem for the homelab. Engineered in strict compliance with **TRaSH Guides** standards, the architecture guarantees atomic filesystem hardlinks (zero redundant disk I/O) and network isolation via a hardware-locked VPN killswitch.

---

<div align="center">

## 1. Service Portfolio & Topology

</div>

| Service | LAN Port | Functional Role | Network Routing Mode |
| :--- | :---: | :--- | :--- |
| **Gluetun** | `8085` (Exposed) | Dedicated WireGuard VPN Gateway + Iptables Killswitch | External VPN Tunnel |
| **qBittorrent-nox**| Routed via Gluetun | Automated BitTorrent client with secure WebUI | `network_mode: service:gluetun` |
| **Prowlarr** | `9696` | Indexer management & proxy synchronizer | Local LAN |
| **Sonarr** | `8989` | TV series monitoring, episode grabber & auto-renamer | Local LAN |
| **Radarr** | `7878` | Movie collection tracking & automated downloader | Local LAN |
| **Bazarr** | `6767` | Subtitle automation engine (RO/EN subtitles) | Local LAN |
| **Jellyfin** | `8096` | Media streaming server with Intel QSV transcoding | Local LAN (`/dev/dri`) |
| **Jellyseerr** | `5055` | Content discovery & request portal | Local LAN |

---

<div align="center">

## 2. Storage Layout & TRaSH Guides Atomic Hardlinks

</div>

To prevent sluggish cross-filesystem file copies and eliminate duplicate disk consumption on ZFS storage:

```text
/data
├── torrents/
│   ├── movies/    <- Active and seeding movie torrents
│   └── tv/        <- Active and seeding TV series torrents
└── media/
    ├── movies/    <- Curated movie library organized via atomic hardlinks
    └── tv/        <- Curated TV library organized by season via atomic hardlinks
```

When Sonarr or Radarr imports a downloaded file from qBittorrent, an **instantaneous filesystem hardlink** is created within the shared `/data` volume. This allows torrent seeding to continue uninterrupted without consuming additional disk space.

---

<div align="center">

## 3. Security Architecture: Gluetun VPN Killswitch

</div>

1. **Zero-Leak Networking**: The `qbittorrent` container has no dedicated virtual ethernet adapter; it attaches directly to `network_mode: "service:gluetun"`.
2. **Deterministic Killswitch**: If the WireGuard tunnel drops, Gluetun's internal `iptables` drop rules immediately block all outbound non-tunnel traffic, preventing any ISP-visible traffic leaks.
3. **WebUI Isolation**: Access to `http://<HOST_IP>:8085` is restricted strictly to local RFC 1918 subnets defined in `FIREWALL_OUTBOUND_SUBNETS`.

---

<div align="center">

## 4. Deployment & Operation Runbook

</div>

```bash
# 1. Prepare environment file
cp .env.example .env

# 2. Configure WireGuard credentials and VPN provider keys
# WIREGUARD_PRIVATE_KEY=<your_wg_private_key>
# WIREGUARD_ADDRESSES=<your_wg_tunnel_ip>

# 3. Boot container stack
docker compose up -d

# 4. Verify VPN tunnel status and public IP
docker exec -it gluetun wget -qO- https://ipinfo.io/ip
```
