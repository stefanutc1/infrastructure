# ==============================================================================
# HOMELAB INFRASTRUCTURE AS CODE — MASTER DECLARATION
# Provider: bpg/proxmox (Proxmox VE REST API)
# Hardware: Intel Core i3-10100F (Node 1 x86_64)
# ==============================================================================

# ------------------------------------------------------------------------------
# 1. NETWORK SEGMENT ABSTRACTIONS (VLAN DEFINITIONS)
# ------------------------------------------------------------------------------
module "vlan_10_mgmt" {
  source                  = "./modules/network_segment"
  vlan_id                 = 10
  name                    = "Management & Storage Subnet"
  cidr                    = "192.168.1.0/24"
  gateway                 = "192.168.1.1"
  default_firewall_policy = "PASS"
}

module "vlan_20_core" {
  source                  = "./modules/network_segment"
  vlan_id                 = 20
  name                    = "Core Microservices & Ingress"
  cidr                    = "192.168.20.0/24"
  gateway                 = "192.168.1.132"
  default_firewall_policy = "DROP"
}

module "vlan_30_cyber" {
  source                  = "./modules/network_segment"
  vlan_id                 = 30
  name                    = "CyberLab & Malware Sandboxes"
  cidr                    = "192.168.30.0/24"
  gateway                 = "192.168.1.132"
  default_firewall_policy = "DROP"
}

module "vlan_40_dmz" {
  source                  = "./modules/network_segment"
  vlan_id                 = 40
  name                    = "DMZ Deception & Honeypots"
  cidr                    = "192.168.40.0/24"
  gateway                 = "192.168.1.132"
  default_firewall_policy = "DROP"
}

module "vlan_50_iot" {
  source                  = "./modules/network_segment"
  vlan_id                 = 50
  name                    = "IoT & Physical Edge Sensors"
  cidr                    = "192.168.50.0/24"
  gateway                 = "192.168.1.132"
  default_firewall_policy = "DROP"
}

# ------------------------------------------------------------------------------
# 2. QEMU / KVM ENTERPRISE VIRTUAL MACHINES (DYNAMIC VIRTIO BALLOONING)
# ------------------------------------------------------------------------------
module "vm_opnsense_200" {
  source       = "./modules/proxmox_vm"
  target_node  = var.primary_node
  vmid         = 200
  name         = "opnsense"
  description  = "OPNsense Perimeter Stateful Firewall, Suricata IDS/IPS & WireGuard Kernel Rotator"
  cores        = 2
  memory       = 2048
  balloon      = 1024
  disk_size    = 16
  storage_pool = "local-lvm"
  vlan_tag     = 10
  tags         = ["firewall", "security", "opnsense", "suricata", "wireguard", "terraform"]
}

module "vm_openstack_201" {
  source       = "./modules/proxmox_vm"
  target_node  = var.primary_node
  vmid         = 201
  name         = "openstack"
  description  = "OpenStack Enterprise Private Cloud Controller & Compute (Nova, Neutron, Keystone, Glance, Horizon Dashboard)"
  cores        = 2
  memory       = 4096
  balloon      = 2048
  disk_size    = 32
  storage_pool = "local-lvm"
  vlan_tag     = 20
  tags         = ["openstack", "cloud", "iaas", "nova", "neutron", "horizon", "terraform"]
}

module "vm_metasploitable2_202" {
  source       = "./modules/proxmox_vm"
  target_node  = var.primary_node
  vmid         = 202
  name         = "metasploitable2"
  description  = "Metasploitable 2 (Intentionally Vulnerable Linux Target, Penetration Testing & IDS/IPS Tuning)"
  cores        = 1
  memory       = 512
  disk_size    = 8
  storage_pool = "local-lvm"
  vlan_tag     = 20
  tags         = ["cyber", "metasploit", "metasploitable2", "penetration-testing", "red-team", "terraform"]
}

module "vm_tpot_203" {
  source       = "./modules/proxmox_vm"
  target_node  = var.primary_node
  vmid         = 203
  name         = "tpot-honeypot"
  description  = "T-Pot Multi-Honeypot Decoy Platform (Cowrie, Dionaea, Honeytrap, Elastic, Kibana, Suricata)"
  cores        = 4
  memory       = 8192
  balloon      = 4096
  disk_size    = 60
  storage_pool = "local-lvm"
  vlan_tag     = 20
  tags         = ["cyber", "honeypot", "tpot", "threat-intel", "elastic", "suricata", "terraform"]
}

module "vm_securityonion_204" {
  source       = "./modules/proxmox_vm"
  target_node  = var.primary_node
  vmid         = 204
  name         = "securityonion"
  description  = "Security Onion / Wazuh SIEM Platform (Zeek, Suricata, Elastic, Kibana & HIDS Monitoring)"
  cores        = 4
  memory       = 8192
  balloon      = 4096
  disk_size    = 50
  storage_pool = "local-lvm"
  vlan_tag     = 30
  tags         = ["blue-team", "hids", "log-analysis", "security-onion", "siem", "wazuh", "terraform"]
}

module "vm_remnux_205" {
  source       = "./modules/proxmox_vm"
  target_node  = var.primary_node
  vmid         = 205
  name         = "remnux"
  description  = "REMnux Linux Toolkit (Malware Analysis, Reverse Engineering, Memory Forensics & DFIR)"
  cores        = 2
  memory       = 4096
  balloon      = 2048
  disk_size    = 40
  storage_pool = "local-lvm"
  vlan_tag     = 35
  tags         = ["cyber", "dfir", "malware-analysis", "remnux", "reverse-engineering", "terraform"]
}

# ------------------------------------------------------------------------------
# BACHELOR THESIS / FACULTY LABS (VM 300, 301, 302 & CT 303)
# Dedicated declarative configuration moved to terraform/licenta.tf
# ------------------------------------------------------------------------------




# Ingress Reverse Proxy runs natively on OPNsense Core (VM 200 - 192.168.1.134)



# ------------------------------------------------------------------------------
# 3. PROXMOX CORE LXC CONTAINERS (NODE 1 — Intel Core i3-10100F)
# Active Containers: 100 to 106
# ------------------------------------------------------------------------------

module "lxc_homeassistant" {
  source       = "./modules/proxmox_lxc"
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

module "lxc_scrutiny" {
  source       = "./modules/proxmox_lxc"
  target_node  = var.primary_node
  vmid         = 101
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
  source                 = "./modules/proxmox_lxc"
  target_node            = var.primary_node
  vmid                   = 102
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
  source       = "./modules/proxmox_lxc"
  target_node  = var.primary_node
  vmid         = 103
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
  source       = "./modules/proxmox_lxc"
  target_node  = var.primary_node
  vmid         = 104
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
  source       = "./modules/proxmox_lxc"
  target_node  = var.primary_node
  vmid         = 105
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
  source       = "./modules/proxmox_lxc"
  target_node  = var.primary_node
  vmid         = 106
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

# ------------------------------------------------------------------------------
# Enterprise Networking, Proxmox SDN, Dual-Firewall & Hybrid Cloud Tunnel
# ==============================================================================

module "proxmox_sdn" {
  source = "./modules/proxmox_sdn"
}

module "proxmox_firewall" {
  source = "./modules/proxmox_firewall"
}

module "hybrid_tunnel" {
  source = "./modules/hybrid_tunnel"
}



