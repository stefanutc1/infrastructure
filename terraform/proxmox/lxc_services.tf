# ==============================================================================
# PROXMOX CORE LXC CONTAINERS (NODE 1 — Intel Core i3-10100F)
# Active Containers: 100 to 107
# ==============================================================================

module "lxc_homeassistant" {
  source       = "../modules/proxmox_lxc"
  target_node  = var.primary_node
  vmid         = 100
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
  vmid         = 101
  hostname     = "n8n"
  ostemplate   = var.debian_template
  ostype       = "debian"
  cores        = 2
  memory       = 384
  disk_size    = "8G"
  ip_address   = "192.168.1.107/24"
  gateway      = var.gateway_ip
  nameserver   = var.nameserver_ip
  vlan_tag     = 20
  unprivileged = true
  tags         = ["automation", "workflows", "soar", "webhooks", "terraform", "node1"]
}

module "lxc_scrutiny" {
  source       = "../modules/proxmox_lxc"
  target_node  = var.primary_node
  vmid         = 102
  hostname     = "scrutiny"
  ostemplate   = var.debian_template
  ostype       = "debian"
  cores        = 1
  memory       = 128
  disk_size    = "4G"
  ip_address   = "192.168.1.108/24"
  gateway      = var.gateway_ip
  nameserver   = var.nameserver_ip
  vlan_tag     = 20
  unprivileged = true
  tags         = ["monitoring", "smart", "storage", "telemetry", "terraform", "node1"]
}

module "lxc_ollama" {
  source                 = "../modules/proxmox_lxc"
  target_node            = var.primary_node
  vmid                   = 103
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

module "lxc_uptimekuma" {
  source       = "../modules/proxmox_lxc"
  target_node  = var.primary_node
  vmid         = 104
  hostname     = "uptimekuma"
  ostemplate   = var.alpine_template
  ostype       = "alpine"
  cores        = 1
  memory       = 128
  disk_size    = "2G"
  ip_address   = "192.168.1.119/24"
  gateway      = var.gateway_ip
  nameserver   = var.nameserver_ip
  vlan_tag     = 20
  unprivileged = true
  tags         = ["monitoring", "uptime", "status", "terraform", "node1"]
}

module "lxc_monitoring" {
  source       = "../modules/proxmox_lxc"
  target_node  = var.primary_node
  vmid         = 105
  hostname     = "monitoring"
  ostemplate   = var.alpine_template
  ostype       = "alpine"
  cores        = 1
  memory       = 256
  disk_size    = "4G"
  ip_address   = "192.168.1.121/24"
  gateway      = var.gateway_ip
  nameserver   = var.nameserver_ip
  vlan_tag     = 20
  unprivileged = true
  tags         = ["monitoring", "prometheus", "grafana", "terraform", "node1"]
}

module "lxc_owasp" {
  source       = "../modules/proxmox_lxc"
  target_node  = var.primary_node
  vmid         = 106
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
  tags         = ["cyber", "owasp", "pentest", "security", "terraform", "node1"]
}

module "lxc_wazuh" {
  source       = "../modules/proxmox_lxc"
  target_node  = var.primary_node
  vmid         = 107
  hostname     = "wazuh"
  ostemplate   = var.debian_template
  ostype       = "ubuntu"
  cores        = 4
  memory       = 6144
  disk_size    = "35G"
  ip_address   = "192.168.1.240/24"
  gateway      = var.gateway_ip
  nameserver   = var.nameserver_ip
  vlan_tag     = 20
  unprivileged = true
  tags         = ["cyber", "siem", "xdr", "wazuh", "terraform", "node1"]
}
