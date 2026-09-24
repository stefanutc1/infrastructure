# Services Catalog

Complete breakdown of all services hosted across Docker Compose stacks:

| Category | Service Name | Internal Port | Ingress Domain | Volume Mounts |
| :--- | :--- | :--- | :--- | :--- |
| **Ingress / Auth** | `nginx-proxy-manager` | `80`, `443`, `81` | `npm.homelab.local` | `/data`, `/etc/letsencrypt` |
| **Ingress / Auth** | `authelia` | `9091` | `auth.homelab.local` | `/config` |
| **Networking** | `adguard-home` | `53`, `3000` | `dns.homelab.local` | Native on OPNsense (`192.168.1.134:3000`) |
| **Networking** | `netbird` | `33073` | Direct Mesh | `/var/lib/netbird` |
| **Observability** | `prometheus` | `9090` | `prometheus.homelab.local` | `/etc/prometheus`, `/prometheus` |
| **Observability** | `alertmanager` | `9093` | `alerts.homelab.local` | `/etc/alertmanager`, `/data` |
| **Observability** | `grafana` | `3000` | `grafana.homelab.local` | `/var/lib/grafana` |
| **Observability** | `uptime-kuma` | `3001` | `status.homelab.local` | `/app/data` |
| **Observability** | `scrutiny` | `8080` | `disks.homelab.local` | `/opt/scrutiny/config`, `/run/udev` |
| **Storage / Media** | `immich` | `2283` | `photos.homelab.local` | `/usr/src/app/upload`, `/var/lib/postgresql` |
| **Storage / Media** | `nextcloud` | `80` | `cloud.homelab.local` | `/var/www/html` |
| **Storage / Media** | `alist` | `5244` | `files.homelab.local` | `/opt/alist/data` |
| **Storage / Media** | `filebrowser` | `8082` | `browser.homelab.local` | `/srv`, `/database` |
| **Automation** | `homeassistant` | `8123` | `home.homelab.local` | `/config` |
| **Automation** | `frigate` | `5000`, `8554` | `nvr.homelab.local` | `/config`, `/media/frigate` |
| **Automation** | `n8n` | `5678` | `n8n.homelab.local` | `/home/node/.n8n` |
| **Development** | `gitea` | `3001`, `2222` | `git.homelab.local` | `/data` |
| **Development** | `woodpecker-ci` | `8000` | `ci.homelab.local` | `/var/lib/woodpecker` |
| **Productivity** | `vaultwarden` | `80` | `vault.homelab.local` | `/data` |
| **Productivity** | `trillium-notes` | `8080` | `notes.homelab.local` | `/root/trilium-data` |
| **Productivity** | `actualbudget` | `5006` | `budget.homelab.local` | `/data` |
| **Utilities** | `it-tools` | `80` | `tools.homelab.local` | Stateless |
| **Utilities** | `changedetection` | `5000` | `changes.homelab.local` | `/datastore` |
