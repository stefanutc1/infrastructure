# Services Catalog

Complete breakdown of foundational and production services hosted across the infrastructure:

| Category | Service Name | Internal Port | Ingress Domain | Host / Node | Lifecycle State |
| :--- | :--- | :---: | :--- | :--- | :---: |
| **Ingress & Perimeter** | OPNsense Firewall | `8443`, `53` | `gateway.lan` | VM 200 (Node 1) | `DEPLOYED` |
| **Ingress & Security** | Caddy Reverse Proxy | `80`, `443` | `proxy.lan` | Node 1 (Host) | `DEPLOYED` |
| **Identity & IAM** | Keycloak Enterprise SSO | `8484` | `auth.lan` | Node 1 (Docker) | `DECLARED` |
| **Identity & Directory**| Active Directory DC | `389`, `636`, `88` | `ad2025.lan` | VM 400 (Node 1) | `DEPLOYED` |
| **Observability** | Prometheus TSDB | `9090` | `prometheus.lan` | CT 104 (Node 1) | `DEPLOYED` |
| **Observability** | Grafana Dashboards | `3000` | `grafana.lan` | CT 104 (Node 1) | `DEPLOYED` |
| **Observability** | Uptime Kuma | `3001` | `status.lan` | CT 103 (Node 1) | `DEPLOYED` |
| **Observability** | Scrutiny S.M.A.R.T. | `8080` | `disks.lan` | CT 101 (Node 1) | `DEPLOYED` |
| **Security & SIEM** | Wazuh Manager 4.14 | `1514`, `55000` | `wazuh.lan` | CT 106 (Node 1) | `DEPLOYED` |
| **Storage & Object** | MinIO S3 API | `9000`, `9001` | `s3.lan` | CT 161 (Node 1) | `DEPLOYED` |
| **Storage & NAS** | OpenMediaVault ZFS | `80`, `445` | `nas.lan` | Node 2 (Bare-Metal) | `DEPLOYED` |
| **Storage & Backup** | Proxmox Backup Server | `8007` | `pbs.lan` | Node 1 / 2 | `DEPLOYED` |
| **Media & Streaming** | Jellyfin Media Server | `8096` | `media.lan` | Node 1 (Docker) | `DECLARED` |
| **Media Automation** | Gluetun VPN Killswitch | `8085` | `vpn.lan` | Node 1 (Docker) | `DECLARED` |
| **Media Automation** | Sonarr / Radarr / Prowlarr | `8989`, `7878`, `9696` | `arr.lan` | Node 1 (Docker) | `DECLARED` |
| **Media Automation** | Immich Photo & Video | `2283` | `photos.lan` | Node 1 (Docker) | `DECLARED` |
| **Home Automation** | Home Assistant Core | `8123` | `home.lan` | CT 100 (Node 1) | `DEPLOYED` |
| **AI Platform** | Ollama GPU Inference | `11434` | `ai.lan` | CT 102 (Node 1) | `DEPLOYED` |
| **Operations & SSoT** | NetBox DCIM / IPAM | `8000` | `netbox.lan` | Node 1 (Docker) | `DECLARED` |
| **Edge IoT: Access** | ESP32 Footprint Sensor | `1883` (MQTT) | `esp32-footprint.lan` | ESP32-EDGE-01 | `DEPLOYED` |
| **Edge IoT: Irrigation**| ESP32 Irrigation Controller | `1883` (MQTT) | `esp32-irrigation.lan` | ESP32-EDGE-02 | `DEPLOYED` |
| **Edge IoT: Environment**| ESP32 Datacenter Telemetry | `80` (`/metrics`) | `esp32-env.lan` | ESP32-EDGE-03 | `DEPLOYED` |
| **Edge IoT: Power** | ESP32 Grid & Battery Watch | `80` (`/metrics`) | `esp32-power.lan` | ESP32-EDGE-04 | `DEPLOYED` |
