# ==============================================================================
# PROXMOX CORE LXC CONTAINERS (NODE 1 — Intel Core i3-10100F)
# ==============================================================================

module "lxc_immich" {
  source       = "../modules/proxmox_lxc"
  target_node  = var.primary_node
  vmid         = 100
  hostname     = "immich"
  ostemplate   = var.debian_template
  ostype       = "debian"
  cores        = 4
  memory       = 896
  disk_size    = "32G"
  ip_address   = "192.168.1.15/24"
  gateway      = var.gateway_ip
  nameserver   = var.nameserver_ip
  vlan_tag     = 20
  unprivileged = true
  tags         = ["photos", "ai", "facial-recognition", "media", "terraform", "node1"]
}

module "lxc_nextcloud" {
  source       = "../modules/proxmox_lxc"
  target_node  = var.primary_node
  vmid         = 101
  hostname     = "nextcloud"
  ostemplate   = var.debian_template
  ostype       = "debian"
  cores        = 2
  memory       = 512
  disk_size    = "20G"
  ip_address   = "192.168.1.8/24"
  gateway      = var.gateway_ip
  nameserver   = var.nameserver_ip
  vlan_tag     = 20
  unprivileged = true
  tags         = ["cloud", "storage", "webdav", "productivity", "terraform", "node1"]
}

module "lxc_homeassistant" {
  source       = "../modules/proxmox_lxc"
  target_node  = var.primary_node
  vmid         = 102
  hostname     = "homeassistant"
  ostemplate   = var.debian_template
  ostype       = "debian"
  cores        = 2
  memory       = 384
  disk_size    = "16G"
  ip_address   = "192.168.1.10/24"
  gateway      = var.gateway_ip
  nameserver   = var.nameserver_ip
  vlan_tag     = 20
  unprivileged = true
  tags         = ["automation", "iot", "smart-home", "zigbee", "terraform", "node1"]
}

module "lxc_n8n" {
  source       = "../modules/proxmox_lxc"
  target_node  = var.primary_node
  vmid         = 103
  hostname     = "n8n"
  ostemplate   = var.debian_template
  ostype       = "debian"
  cores        = 2
  memory       = 384
  disk_size    = "8G"
  ip_address   = "192.168.1.13/24"
  gateway      = var.gateway_ip
  nameserver   = var.nameserver_ip
  vlan_tag     = 20
  unprivileged = true
  tags         = ["automation", "workflows", "soar", "webhooks", "terraform", "node1"]
}

module "lxc_scrutiny" {
  source       = "../modules/proxmox_lxc"
  target_node  = var.primary_node
  vmid         = 104
  hostname     = "scrutiny"
  ostemplate   = var.debian_template
  ostype       = "debian"
  cores        = 1
  memory       = 128
  disk_size    = "4G"
  ip_address   = "192.168.1.14/24"
  gateway      = var.gateway_ip
  nameserver   = var.nameserver_ip
  vlan_tag     = 20
  unprivileged = true
  tags         = ["monitoring", "smart", "storage", "telemetry", "terraform", "node1"]
}

module "lxc_media_suite" {
  source       = "../modules/proxmox_lxc"
  target_node  = var.primary_node
  vmid         = 105
  hostname     = "jellyfin"
  ostemplate   = var.debian_template
  ostype       = "debian"
  cores        = 2
  memory       = 512
  disk_size    = "16G"
  ip_address   = "192.168.1.18/24"
  gateway      = var.gateway_ip
  nameserver   = var.nameserver_ip
  vlan_tag     = 20
  unprivileged = true
  tags         = ["media", "jellyfin", "streaming", "transcoding", "terraform", "node1"]
}

module "lxc_ollama" {
  source                 = "../modules/proxmox_lxc"
  target_node            = var.primary_node
  vmid                   = 106
  hostname               = "ollama"
  ostemplate             = var.debian_template
  ostype                 = "debian"
  cores                  = 4
  memory                 = 2048
  disk_size              = "16G"
  ip_address             = "192.168.1.110/24"
  gateway                = var.gateway_ip
  nameserver             = var.nameserver_ip
  vlan_tag               = 20
  unprivileged           = false
  passthrough_nvidia_gpu = true
  tags                   = ["ai", "llm", "cuda", "gtx1050ti", "local-ai", "terraform", "node1"]
}

module "lxc_openwebui" {
  source       = "../modules/proxmox_lxc"
  target_node  = var.primary_node
  vmid         = 107
  hostname     = "openwebui"
  ostemplate   = var.debian_template
  ostype       = "debian"
  cores        = 2
  memory       = 384
  disk_size    = "8G"
  ip_address   = "192.168.1.111/24"
  gateway      = var.gateway_ip
  nameserver   = var.nameserver_ip
  vlan_tag     = 20
  unprivileged = true
  tags         = ["ai", "chat-ui", "rag", "assistant", "terraform", "node1"]
}

module "lxc_whisper" {
  source       = "../modules/proxmox_lxc"
  target_node  = var.primary_node
  vmid         = 108
  hostname     = "whisper"
  ostemplate   = var.debian_template
  ostype       = "debian"
  cores        = 2
  memory       = 1024
  disk_size    = "8G"
  ip_address   = "192.168.1.112/24"
  gateway      = var.gateway_ip
  nameserver   = var.nameserver_ip
  vlan_tag     = 20
  unprivileged = true
  tags         = ["ai", "whisper", "stt", "speech-to-text", "terraform", "node1"]
}

module "lxc_flowise" {
  source       = "../modules/proxmox_lxc"
  target_node  = var.primary_node
  vmid         = 109
  hostname     = "flowise"
  ostemplate   = var.alpine_template
  ostype       = "alpine"
  cores        = 2
  memory       = 512
  disk_size    = "4G"
  ip_address   = "192.168.1.113/24"
  gateway      = var.gateway_ip
  nameserver   = var.nameserver_ip
  vlan_tag     = 20
  unprivileged = true
  tags         = ["ai", "agents", "langchain", "workflow-builder", "terraform", "node1"]
}

module "lxc_paperless_ai" {
  source       = "../modules/proxmox_lxc"
  target_node  = var.primary_node
  vmid         = 110
  hostname     = "paperless-ai"
  ostemplate   = var.alpine_template
  ostype       = "alpine"
  cores        = 1
  memory       = 64
  disk_size    = "1G"
  ip_address   = "192.168.1.114/24"
  gateway      = var.gateway_ip
  nameserver   = var.nameserver_ip
  vlan_tag     = 20
  unprivileged = true
  tags         = ["ai", "dms", "ocr", "deepseek", "terraform", "node1"]
}

module "lxc_codeserver" {
  source       = "../modules/proxmox_lxc"
  target_node  = var.primary_node
  vmid         = 111
  hostname     = "code-server"
  ostemplate   = var.alpine_template
  ostype       = "alpine"
  cores        = 2
  memory       = 512
  disk_size    = "4G"
  ip_address   = "192.168.1.115/24"
  gateway      = var.gateway_ip
  nameserver   = var.nameserver_ip
  vlan_tag     = 20
  unprivileged = true
  tags         = ["dev", "ide", "codeserver", "web-ide", "terraform", "node1"]
}

module "lxc_pbs" {
  source       = "../modules/proxmox_lxc"
  target_node  = var.primary_node
  vmid         = 112
  hostname     = "proxmox-backup-server"
  ostemplate   = var.alpine_template
  ostype       = "alpine"
  cores        = 2
  memory       = 512
  disk_size    = "4G"
  ip_address   = "192.168.1.116/24"
  gateway      = var.gateway_ip
  nameserver   = var.nameserver_ip
  vlan_tag     = 20
  unprivileged = true
  tags         = ["storage", "backup", "pbs", "deduplication", "terraform", "node1"]
}

module "lxc_pdm" {
  source       = "../modules/proxmox_lxc"
  target_node  = var.primary_node
  vmid         = 113
  hostname     = "proxmox-datacenter-manager"
  ostemplate   = var.alpine_template
  ostype       = "alpine"
  cores        = 2
  memory       = 512
  disk_size    = "4G"
  ip_address   = "192.168.1.117/24"
  gateway      = var.gateway_ip
  nameserver   = var.nameserver_ip
  vlan_tag     = 20
  unprivileged = true
  tags         = ["management", "pdm", "multi-cluster", "terraform", "node1"]
}

module "lxc_woodpecker_k0s" {
  source       = "../modules/proxmox_lxc"
  target_node  = var.primary_node
  vmid         = 114
  hostname     = "woodpecker-k0s"
  ostemplate   = var.alpine_template
  ostype       = "alpine"
  cores        = 2
  memory       = 512
  disk_size    = "8G"
  ip_address   = "192.168.1.118/24"
  gateway      = var.gateway_ip
  nameserver   = var.nameserver_ip
  vlan_tag     = 20
  unprivileged = true
  tags         = ["ci", "cd", "woodpecker", "k0s", "kubernetes", "alpine", "terraform", "node1"]
}

# ------------------------------------------------------------------------------
# CONSOLIDATED ON-DEMAND MICROSERVICES (NODE 1 — CT 116 TO CT 174, onboot: false)
# ------------------------------------------------------------------------------

module "lxc_actualbudget" {
  source       = "../modules/proxmox_lxc"
  target_node  = var.primary_node
  vmid         = 116
  hostname     = "actualbudget"
  ostemplate   = var.alpine_template
  ostype       = "alpine"
  cores        = 1
  memory       = 256
  disk_size    = "4G"
  ip_address   = "192.168.1.116/24"
  gateway      = var.gateway_ip
  nameserver   = var.nameserver_ip
  vlan_tag     = 20
  unprivileged = true
  onboot       = false
  tags         = ["finance", "budgeting", "terraform", "node1"]
}

module "lxc_changedetection" {
  source       = "../modules/proxmox_lxc"
  target_node  = var.primary_node
  vmid         = 118
  hostname     = "changedetection"
  ostemplate   = var.alpine_template
  ostype       = "alpine"
  cores        = 1
  memory       = 128
  disk_size    = "2G"
  ip_address   = "192.168.1.118/24"
  gateway      = var.gateway_ip
  nameserver   = var.nameserver_ip
  vlan_tag     = 20
  unprivileged = true
  onboot       = false
  tags         = ["monitoring", "web-watch", "alerts", "terraform", "node1"]
}

module "lxc_vaultwarden" {
  source       = "../modules/proxmox_lxc"
  target_node  = var.primary_node
  vmid         = 120
  hostname     = "vaultwarden"
  ostemplate   = var.alpine_template
  ostype       = "alpine"
  cores        = 1
  memory       = 128
  disk_size    = "2G"
  ip_address   = "192.168.1.120/24"
  gateway      = var.gateway_ip
  nameserver   = var.nameserver_ip
  vlan_tag     = 20
  unprivileged = true
  onboot       = false
  tags         = ["security", "passwords", "vault", "terraform", "node1"]
}

module "lxc_authelia" {
  source       = "../modules/proxmox_lxc"
  target_node  = var.primary_node
  vmid         = 122
  hostname     = "authelia"
  ostemplate   = var.alpine_template
  ostype       = "alpine"
  cores        = 1
  memory       = 128
  disk_size    = "2G"
  ip_address   = "192.168.1.122/24"
  gateway      = var.gateway_ip
  nameserver   = var.nameserver_ip
  vlan_tag     = 20
  unprivileged = true
  onboot       = false
  tags         = ["security", "sso", "2fa", "auth", "terraform", "node1"]
}

module "lxc_gatus" {
  source       = "../modules/proxmox_lxc"
  target_node  = var.primary_node
  vmid         = 124
  hostname     = "gatus"
  ostemplate   = var.alpine_template
  ostype       = "alpine"
  cores        = 1
  memory       = 128
  disk_size    = "1G"
  ip_address   = "192.168.1.124/24"
  gateway      = var.gateway_ip
  nameserver   = var.nameserver_ip
  vlan_tag     = 20
  unprivileged = true
  onboot       = false
  tags         = ["monitoring", "status", "healthcheck", "terraform", "node1"]
}

module "lxc_linkding" {
  source       = "../modules/proxmox_lxc"
  target_node  = var.primary_node
  vmid         = 126
  hostname     = "linkding"
  ostemplate   = var.alpine_template
  ostype       = "alpine"
  cores        = 1
  memory       = 128
  disk_size    = "1G"
  ip_address   = "192.168.1.126/24"
  gateway      = var.gateway_ip
  nameserver   = var.nameserver_ip
  vlan_tag     = 20
  unprivileged = true
  onboot       = false
  tags         = ["bookmarks", "search", "indexing", "terraform", "node1"]
}

module "lxc_beszel" {
  source       = "../modules/proxmox_lxc"
  target_node  = var.primary_node
  vmid         = 128
  hostname     = "beszel"
  ostemplate   = var.alpine_template
  ostype       = "alpine"
  cores        = 1
  memory       = 128
  disk_size    = "1G"
  ip_address   = "192.168.1.128/24"
  gateway      = var.gateway_ip
  nameserver   = var.nameserver_ip
  vlan_tag     = 20
  unprivileged = true
  onboot       = false
  tags         = ["monitoring", "metrics", "telemetry", "terraform", "node1"]
}

module "lxc_homepage" {
  source       = "../modules/proxmox_lxc"
  target_node  = var.primary_node
  vmid         = 130
  hostname     = "homepage"
  ostemplate   = var.alpine_template
  ostype       = "alpine"
  cores        = 1
  memory       = 128
  disk_size    = "1G"
  ip_address   = "192.168.1.130/24"
  gateway      = var.gateway_ip
  nameserver   = var.nameserver_ip
  vlan_tag     = 20
  unprivileged = true
  onboot       = false
  tags         = ["dashboard", "portal", "homelab", "terraform", "node1"]
}

module "lxc_memos" {
  source       = "../modules/proxmox_lxc"
  target_node  = var.primary_node
  vmid         = 132
  hostname     = "memos"
  ostemplate   = var.alpine_template
  ostype       = "alpine"
  cores        = 1
  memory       = 128
  disk_size    = "1G"
  ip_address   = "192.168.1.132/24"
  gateway      = var.gateway_ip
  nameserver   = var.nameserver_ip
  vlan_tag     = 20
  unprivileged = true
  onboot       = false
  tags         = ["notes", "microblog", "markdown", "terraform", "node1"]
}

module "lxc_syncthing" {
  source       = "../modules/proxmox_lxc"
  target_node  = var.primary_node
  vmid         = 134
  hostname     = "syncthing"
  ostemplate   = var.alpine_template
  ostype       = "alpine"
  cores        = 1
  memory       = 128
  disk_size    = "2G"
  ip_address   = "192.168.1.134/24"
  gateway      = var.gateway_ip
  nameserver   = var.nameserver_ip
  vlan_tag     = 20
  unprivileged = true
  onboot       = false
  tags         = ["storage", "sync", "replication", "terraform", "node1"]
}

module "lxc_vikunja" {
  source       = "../modules/proxmox_lxc"
  target_node  = var.primary_node
  vmid         = 136
  hostname     = "vikunja"
  ostemplate   = var.alpine_template
  ostype       = "alpine"
  cores        = 1
  memory       = 128
  disk_size    = "2G"
  ip_address   = "192.168.1.136/24"
  gateway      = var.gateway_ip
  nameserver   = var.nameserver_ip
  vlan_tag     = 20
  unprivileged = true
  onboot       = false
  tags         = ["productivity", "kanban", "tasks", "terraform", "node1"]
}

module "lxc_yourspotify" {
  source       = "../modules/proxmox_lxc"
  target_node  = var.primary_node
  vmid         = 138
  hostname     = "yourspotify"
  ostemplate   = var.alpine_template
  ostype       = "alpine"
  cores        = 1
  memory       = 128
  disk_size    = "2G"
  ip_address   = "192.168.1.138/24"
  gateway      = var.gateway_ip
  nameserver   = var.nameserver_ip
  vlan_tag     = 20
  unprivileged = true
  onboot       = false
  tags         = ["analytics", "music", "spotify", "terraform", "node1"]
}

module "lxc_opengist" {
  source       = "../modules/proxmox_lxc"
  target_node  = var.primary_node
  vmid         = 140
  hostname     = "opengist"
  ostemplate   = var.alpine_template
  ostype       = "alpine"
  cores        = 1
  memory       = 128
  disk_size    = "2G"
  ip_address   = "192.168.1.140/24"
  gateway      = var.gateway_ip
  nameserver   = var.nameserver_ip
  vlan_tag     = 20
  unprivileged = true
  onboot       = false
  tags         = ["pastebin", "git", "snippets", "terraform", "node1"]
}

module "lxc_whoogle" {
  source       = "../modules/proxmox_lxc"
  target_node  = var.primary_node
  vmid         = 142
  hostname     = "whoogle"
  ostemplate   = var.alpine_template
  ostype       = "alpine"
  cores        = 1
  memory       = 128
  disk_size    = "1G"
  ip_address   = "192.168.1.142/24"
  gateway      = var.gateway_ip
  nameserver   = var.nameserver_ip
  vlan_tag     = 20
  unprivileged = true
  onboot       = false
  tags         = ["search", "privacy", "proxy", "terraform", "node1"]
}

module "lxc_pingvin_share" {
  source       = "../modules/proxmox_lxc"
  target_node  = var.primary_node
  vmid         = 144
  hostname     = "pingvin-share"
  ostemplate   = var.alpine_template
  ostype       = "alpine"
  cores        = 1
  memory       = 128
  disk_size    = "2G"
  ip_address   = "192.168.1.144/24"
  gateway      = var.gateway_ip
  nameserver   = var.nameserver_ip
  vlan_tag     = 20
  unprivileged = true
  onboot       = false
  tags         = ["file-share", "privacy", "upload", "terraform", "node1"]
}

module "lxc_excalidraw" {
  source       = "../modules/proxmox_lxc"
  target_node  = var.primary_node
  vmid         = 146
  hostname     = "excalidraw"
  ostemplate   = var.alpine_template
  ostype       = "alpine"
  cores        = 1
  memory       = 128
  disk_size    = "1G"
  ip_address   = "192.168.1.146/24"
  gateway      = var.gateway_ip
  nameserver   = var.nameserver_ip
  vlan_tag     = 20
  unprivileged = true
  onboot       = false
  tags         = ["diagrams", "whiteboard", "sketch", "terraform", "node1"]
}

module "lxc_transmission" {
  source       = "../modules/proxmox_lxc"
  target_node  = var.primary_node
  vmid         = 148
  hostname     = "transmission"
  ostemplate   = var.alpine_template
  ostype       = "alpine"
  cores        = 1
  memory       = 256
  disk_size    = "4G"
  ip_address   = "192.168.1.148/24"
  gateway      = var.gateway_ip
  nameserver   = var.nameserver_ip
  vlan_tag     = 20
  unprivileged = true
  onboot       = false
  tags         = ["media", "bittorrent", "downloads", "terraform", "node1"]
}

module "lxc_stirling_pdf" {
  source       = "../modules/proxmox_lxc"
  target_node  = var.primary_node
  vmid         = 150
  hostname     = "stirling-pdf"
  ostemplate   = var.alpine_template
  ostype       = "alpine"
  cores        = 1
  memory       = 256
  disk_size    = "2G"
  ip_address   = "192.168.1.150/24"
  gateway      = var.gateway_ip
  nameserver   = var.nameserver_ip
  vlan_tag     = 20
  unprivileged = true
  onboot       = false
  tags         = ["documents", "pdf", "tools", "terraform", "node1"]
}

module "lxc_tubearchivist" {
  source       = "../modules/proxmox_lxc"
  target_node  = var.primary_node
  vmid         = 152
  hostname     = "tubearchivist"
  ostemplate   = var.alpine_template
  ostype       = "alpine"
  cores        = 1
  memory       = 256
  disk_size    = "4G"
  ip_address   = "192.168.1.152/24"
  gateway      = var.gateway_ip
  nameserver   = var.nameserver_ip
  vlan_tag     = 20
  unprivileged = true
  onboot       = false
  tags         = ["media", "youtube", "archive", "terraform", "node1"]
}

module "lxc_cyberchef" {
  source       = "../modules/proxmox_lxc"
  target_node  = var.primary_node
  vmid         = 154
  hostname     = "cyberchef"
  ostemplate   = var.alpine_template
  ostype       = "alpine"
  cores        = 1
  memory       = 128
  disk_size    = "1G"
  ip_address   = "192.168.1.154/24"
  gateway      = var.gateway_ip
  nameserver   = var.nameserver_ip
  vlan_tag     = 20
  unprivileged = true
  onboot       = false
  tags         = ["cyber", "tools", "crypto", "forensics", "terraform", "node1"]
}

module "lxc_romm" {
  source       = "../modules/proxmox_lxc"
  target_node  = var.primary_node
  vmid         = 156
  hostname     = "romm"
  ostemplate   = var.alpine_template
  ostype       = "alpine"
  cores        = 1
  memory       = 256
  disk_size    = "4G"
  ip_address   = "192.168.1.156/24"
  gateway      = var.gateway_ip
  nameserver   = var.nameserver_ip
  vlan_tag     = 20
  unprivileged = true
  onboot       = false
  tags         = ["gaming", "retro", "roms", "metadata", "terraform", "node1"]
}

module "lxc_paperless_ngx" {
  source       = "../modules/proxmox_lxc"
  target_node  = var.primary_node
  vmid         = 158
  hostname     = "paperless-ngx"
  ostemplate   = var.alpine_template
  ostype       = "alpine"
  cores        = 1
  memory       = 256
  disk_size    = "4G"
  ip_address   = "192.168.1.158/24"
  gateway      = var.gateway_ip
  nameserver   = var.nameserver_ip
  vlan_tag     = 20
  unprivileged = true
  onboot       = false
  tags         = ["documents", "dms", "ocr", "search", "terraform", "node1"]
}

module "lxc_meilisearch" {
  source       = "../modules/proxmox_lxc"
  target_node  = var.primary_node
  vmid         = 160
  hostname     = "meilisearch"
  ostemplate   = var.alpine_template
  ostype       = "alpine"
  cores        = 1
  memory       = 128
  disk_size    = "2G"
  ip_address   = "192.168.1.160/24"
  gateway      = var.gateway_ip
  nameserver   = var.nameserver_ip
  vlan_tag     = 20
  unprivileged = true
  onboot       = false
  tags         = ["search", "indexing", "fast-search", "terraform", "node1"]
}

module "lxc_searxng" {
  source       = "../modules/proxmox_lxc"
  target_node  = var.primary_node
  vmid         = 162
  hostname     = "searxng"
  ostemplate   = var.alpine_template
  ostype       = "alpine"
  cores        = 1
  memory       = 128
  disk_size    = "1G"
  ip_address   = "192.168.1.162/24"
  gateway      = var.gateway_ip
  nameserver   = var.nameserver_ip
  vlan_tag     = 20
  unprivileged = true
  onboot       = false
  tags         = ["search", "metasearch", "privacy", "terraform", "node1"]
}

module "lxc_rustdesk" {
  source       = "../modules/proxmox_lxc"
  target_node  = var.primary_node
  vmid         = 164
  hostname     = "rustdesk"
  ostemplate   = var.alpine_template
  ostype       = "alpine"
  cores        = 1
  memory       = 128
  disk_size    = "1G"
  ip_address   = "192.168.1.164/24"
  gateway      = var.gateway_ip
  nameserver   = var.nameserver_ip
  vlan_tag     = 20
  unprivileged = true
  onboot       = false
  tags         = ["remote-desktop", "relay", "remote-access", "terraform", "node1"]
}

module "lxc_wg_easy" {
  source       = "../modules/proxmox_lxc"
  target_node  = var.primary_node
  vmid         = 166
  hostname     = "wg-easy"
  ostemplate   = var.alpine_template
  ostype       = "alpine"
  cores        = 1
  memory       = 128
  disk_size    = "1G"
  ip_address   = "192.168.1.166/24"
  gateway      = var.gateway_ip
  nameserver   = var.nameserver_ip
  vlan_tag     = 20
  unprivileged = true
  onboot       = false
  tags         = ["vpn", "wireguard", "gui", "network", "terraform", "node1"]
}

module "lxc_dozzle" {
  source       = "../modules/proxmox_lxc"
  target_node  = var.primary_node
  vmid         = 168
  hostname     = "dozzle"
  ostemplate   = var.alpine_template
  ostype       = "alpine"
  cores        = 1
  memory       = 128
  disk_size    = "1G"
  ip_address   = "192.168.1.168/24"
  gateway      = var.gateway_ip
  nameserver   = var.nameserver_ip
  vlan_tag     = 20
  unprivileged = true
  onboot       = false
  tags         = ["logging", "containers", "realtime", "terraform", "node1"]
}

module "lxc_hedgedoc" {
  source       = "../modules/proxmox_lxc"
  target_node  = var.primary_node
  vmid         = 170
  hostname     = "hedgedoc"
  ostemplate   = var.alpine_template
  ostype       = "alpine"
  cores        = 1
  memory       = 128
  disk_size    = "2G"
  ip_address   = "192.168.1.170/24"
  gateway      = var.gateway_ip
  nameserver   = var.nameserver_ip
  vlan_tag     = 20
  unprivileged = true
  onboot       = false
  tags         = ["collaboration", "markdown", "notes", "terraform", "node1"]
}

module "lxc_gotify" {
  source       = "../modules/proxmox_lxc"
  target_node  = var.primary_node
  vmid         = 172
  hostname     = "gotify"
  ostemplate   = var.alpine_template
  ostype       = "alpine"
  cores        = 1
  memory       = 128
  disk_size    = "1G"
  ip_address   = "192.168.1.172/24"
  gateway      = var.gateway_ip
  nameserver   = var.nameserver_ip
  vlan_tag     = 20
  unprivileged = true
  onboot       = false
  tags         = ["notifications", "push", "websockets", "terraform", "node1"]
}

module "lxc_grocy" {
  source       = "../modules/proxmox_lxc"
  target_node  = var.primary_node
  vmid         = 174
  hostname     = "grocy"
  ostemplate   = var.alpine_template
  ostype       = "alpine"
  cores        = 1
  memory       = 128
  disk_size    = "2G"
  ip_address   = "192.168.1.174/24"
  gateway      = var.gateway_ip
  nameserver   = var.nameserver_ip
  vlan_tag     = 20
  unprivileged = true
  onboot       = false
  tags         = ["inventory", "groceries", "erp", "pantry", "terraform", "node1"]
}

module "lxc_owasp" {
  source       = "../modules/proxmox_lxc"
  target_node  = var.primary_node
  vmid         = 175
  hostname     = "owasp"
  ostemplate   = var.alpine_template
  ostype       = "alpine"
  cores        = 2
  memory       = 512
  disk_size    = "8G"
  ip_address   = "192.168.1.175/24"
  gateway      = var.gateway_ip
  nameserver   = var.nameserver_ip
  vlan_tag     = 20
  unprivileged = true
  onboot       = false
  tags         = ["cyber", "docker", "juice-shop", "owasp", "security", "web", "terraform", "node1"]
}


