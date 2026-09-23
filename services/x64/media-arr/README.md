# Media Server & Automation Suite (*arr Stack + Jellyfin)

Acest modul implementează platforma de divertisment și management multimedia a laboratorului, concepută conform bunelor practici **TRaSH Guides** (Hardlinks atomice, zero duplicare de spațiu I/O, izolare completă prin VPN killswitch).

## 1. Topologia Serviciilor

| Serviciu | Port LAN | Rol Funcțional | Rutare Rețea |
| :--- | :---: | :--- | :--- |
| **Gluetun** | - | Gateway VPN WireGuard + Firewall Killswitch | Tunel VPN extern |
| **qBittorrent** | `8085` | Client BitTorrent (WebUI securizat) | `network_mode: service:gluetun` |
| **Prowlarr** | `9696` | Indexer manager & proxy pentru trackere | Local LAN |
| **Sonarr** | `8989` | Management seriale TV & descărcare automată | Local LAN |
| **Radarr** | `7878` | Management colecție filme | Local LAN |
| **Bazarr** | `6767` | Descărcare automată de subtitrări (RO/EN) | Local LAN |
| **Jellyfin** | `8096` | Server streaming video cu HW Transcoding | Local LAN (`/dev/dri`) |
| **Jellyseerr** | `5055` | Interfață de căutare și cereri conținut | Local LAN |

## 2. Structura de Stocare și Hardlinks Atomice (TRaSH Guides)

Pentru a preveni copierea lentă între sisteme de fișiere și duplicarea consumului de disc pe ZFS:

```text
/data
├── torrents/
│   ├── movies/    <- Descărcări filme incomplete / complete
│   └── tv/        <- Descărcări seriale incomplete / complete
└── media/
    ├── movies/    <- Filme organizate prin hardlink (linkat direct la fișierul din torrents)
    └── tv/        <- Seriale organizate pe sezoane prin hardlink
```

Când Sonarr/Radarr importă un fișier descărcat de qBittorrent, pe același volum `/data` se creează un **hardlink instantaneu**, permițând continuarea seed-ului în torrent fără a ocupa spațiu dublu pe disc.

## 3. Securitate: VPN Killswitch Garantat (Gluetun)

* Containerul `qbittorrent` nu deține o interfață proprie de rețea (`network_mode: "service:gluetun"`).
* Dacă conexiunea VPN WireGuard/OpenVPN se întrerupe, regulile de `iptables` interne ale containerului `gluetun` blochează instant orice pachet exterior (nu există nicio posibilitate de leak către ISP).
* Accesul la WebUI (`http://<HOST_IP>:8085`) este permis exclusiv din rețelele locale specificate în `FIREWALL_OUTBOUND_SUBNETS`.

## 4. Pornire și Operare

```bash
cp .env.example .env
# Editați cheile WireGuard în .env
docker compose up -d
```
