# ==============================================================================
# BACHELOR THESIS LABORATORY INFRASTRUCTURE (LUCRARE DE LICENȚĂ)
# Dedicated CyberLab Environment · VLAN 30 & Isolated Bridge vmbr1
# Provider: bpg/proxmox (Proxmox VE REST API)
# Hardware: Intel Core i3-10100F (Node 1 x86_64)
# ==============================================================================

# VM 301: Metasploitable Linux Target (Penetration Testing & Detection Tuning)
module "vm_metasploitable_licenta_301" {
  source       = "./modules/proxmox_vm"
  target_node  = var.primary_node
  vmid         = 301
  name         = "metasploitable-licenta"
  description  = "Bachelor Thesis Lab (Lucrare de Licenta) - Metasploitable Linux Target (Penetration Testing, Red Teaming & Suricata/Wazuh Vulnerability Lab)"
  cores        = 2
  memory       = 2048
  balloon      = 1024
  disk_size    = 20
  storage_pool = "local-lvm"
  vlan_tag     = 40
  onboot       = false
  tags         = ["cyber", "licenta", "bachelor-thesis", "metasploit", "metasploitable", "pentest", "red-team", "terraform"]
}

# VM 302: Kali Linux Penetration Testing & Offensive Security Workstation
module "vm_kali_licenta_302" {
  source       = "./modules/proxmox_vm"
  target_node  = var.primary_node
  vmid         = 302
  name         = "kali-licenta"
  description  = "Bachelor Thesis Lab (Lucrare de Licenta) - Kali Linux Offensive Security & Red Team Pentest Workstation"
  cores        = 2
  memory       = 4096
  balloon      = 2048
  disk_size    = 30
  storage_pool = "local-lvm"
  bridge       = "vmbr1"
  vlan_tag     = 30
  onboot       = false
  tags         = ["cyber", "licenta", "bachelor-thesis", "kali", "pentest", "red-team", "terraform"]
}

# CT 303: OWASP Juice Shop Vulnerable Web Target (Alpine LXC + Docker Runtime)
module "lxc_juiceshop_licenta_303" {
  source       = "./modules/proxmox_lxc"
  target_node  = var.primary_node
  vmid         = 303
  hostname     = "owasp-licenta"
  ostemplate   = var.alpine_template
  ostype       = "alpine"
  cores        = 2
  memory       = 512
  swap         = 256
  disk_size    = "8G"
  storage_pool = "local-lvm"
  ip_address   = "192.168.30.103/24"
  gateway      = var.gateway_ip
  nameserver   = var.nameserver_ip
  bridge       = "vmbr1"
  vlan_tag     = 30
  nesting      = true
  onboot       = false
  tags         = ["cyber", "licenta", "bachelor-thesis", "owasp-juice-shop", "vulnerable-app", "terraform"]
}

# VM 310: Core-Banking System (Apache Fineract / Mifos X Double-Entry Ledger Engine)
module "vm_corebanking_licenta_310" {
  source       = "./modules/proxmox_vm"
  target_node  = var.primary_node
  vmid         = 310
  name         = "core-banking-licenta"
  description  = "Bachelor Thesis Lab (Lucrare de Licenta) - Core-Banking System (Apache Fineract / Mifos X Engine, Double-Entry Ledger, VLAN 20 Services)"
  cores        = 2
  memory       = 4096
  balloon      = 2048
  disk_size    = 40
  storage_pool = "local-lvm"
  bridge       = "vmbr1"
  vlan_tag     = 20
  onboot       = false
  tags         = ["cyber", "licenta", "bachelor-thesis", "core-banking", "fineract", "vlan20", "terraform"]
}

# VM 311: Financial Database Server (PostgreSQL Isolated Ledger DB & Wazuh HIDS/SIEM Audit)
module "vm_findb_licenta_311" {
  source       = "./modules/proxmox_vm"
  target_node  = var.primary_node
  vmid         = 311
  name         = "fin-db-licenta"
  description  = "Bachelor Thesis Lab (Lucrare de Licenta) - Financial Database Server (PostgreSQL Isolated Ledger DB & Wazuh HIDS/SIEM Audit)"
  cores        = 2
  memory       = 4096
  balloon      = 2048
  disk_size    = 50
  storage_pool = "local-lvm"
  bridge       = "vmbr1"
  vlan_tag     = 20
  onboot       = false
  tags         = ["cyber", "licenta", "bachelor-thesis", "database", "postgresql", "wazuh-audit", "vlan20", "terraform"]
}

# CT 312: Payment Gateway & Interbank Settlement Simulator (FastAPI + SWIFT/ISO 20022)
module "lxc_paymentgateway_licenta_312" {
  source       = "./modules/proxmox_lxc"
  target_node  = var.primary_node
  vmid         = 312
  hostname     = "payment-gateway-licenta"
  ostemplate   = var.alpine_template
  ostype       = "alpine"
  cores        = 1
  memory       = 1024
  swap         = 512
  disk_size    = "10G"
  storage_pool = "local-lvm"
  ip_address   = "192.168.20.52/24"
  gateway      = var.gateway_ip
  nameserver   = var.nameserver_ip
  bridge       = "vmbr1"
  vlan_tag     = 20
  nesting      = true
  onboot       = false
  tags         = ["cyber", "licenta", "bachelor-thesis", "payment-gateway", "swift", "iso20022", "fastapi", "terraform"]
}

# VM 313: Hardened Bastion Host / Jump-Box (SSH ed25519 & MFA, Central Audit)
module "vm_swift_jumpbox_licenta_313" {
  source       = "./modules/proxmox_vm"
  target_node  = var.primary_node
  vmid         = 313
  name         = "swift-jumpbox-licenta"
  description  = "Bachelor Thesis Lab (Lucrare de Licenta) - Hardened Bastion Host / Jump-Box (SSH ed25519 & MFA, Central Audit, Credential Isolation)"
  cores        = 2
  memory       = 2048
  balloon      = 1024
  disk_size    = 25
  storage_pool = "local-lvm"
  bridge       = "vmbr1"
  vlan_tag     = 10
  onboot       = false
  tags         = ["cyber", "licenta", "bachelor-thesis", "bastion", "jump-box", "ssh-mfa", "hardened", "terraform"]
}

