output "vm_inventory" {
  description = "Machine-readable map of all provisioned Virtual Machines"
  value = {
    opnsense               = { vmid = module.vm_opnsense_200.vm_id, name = module.vm_opnsense_200.name, node = module.vm_opnsense_200.node }
    openstack              = { vmid = module.vm_openstack_201.vm_id, name = module.vm_openstack_201.name, node = module.vm_openstack_201.node }
    metasploitable2        = { vmid = module.vm_metasploitable2_202.vm_id, name = module.vm_metasploitable2_202.name, node = module.vm_metasploitable2_202.node }
    tpot_honeypot          = { vmid = module.vm_tpot_203.vm_id, name = module.vm_tpot_203.name, node = module.vm_tpot_203.node }
    securityonion          = { vmid = module.vm_securityonion_204.vm_id, name = module.vm_securityonion_204.name, node = module.vm_securityonion_204.node }
    remnux                 = { vmid = module.vm_remnux_205.vm_id, name = module.vm_remnux_205.name, node = module.vm_remnux_205.node }
    metasploitable_licenta = { vmid = module.vm_metasploitable_licenta_301.vm_id, name = module.vm_metasploitable_licenta_301.name, node = module.vm_metasploitable_licenta_301.node }
    kali_licenta           = { vmid = module.vm_kali_licenta_302.vm_id, name = module.vm_kali_licenta_302.name, node = module.vm_kali_licenta_302.node }
    ad2025                 = { vmid = module.vm_ad2025.vm_id, name = module.vm_ad2025.name, node = module.vm_ad2025.node }
    ad2022                 = { vmid = module.vm_ad2022.vm_id, name = module.vm_ad2022.name, node = module.vm_ad2022.node }
    ad2019                 = { vmid = module.vm_ad2019.vm_id, name = module.vm_ad2019.name, node = module.vm_ad2019.node }
    ad2016                 = { vmid = module.vm_ad2016.vm_id, name = module.vm_ad2016.name, node = module.vm_ad2016.node }
    ad2012                 = { vmid = module.vm_ad2012.vm_id, name = module.vm_ad2012.name, node = module.vm_ad2012.node }
    ad2008                 = { vmid = module.vm_ad2008.vm_id, name = module.vm_ad2008.name, node = module.vm_ad2008.node }
    adwin10                = { vmid = module.vm_adwin10.vm_id, name = module.vm_adwin10.name, node = module.vm_adwin10.node }
    adwin11                = { vmid = module.vm_adwin11.vm_id, name = module.vm_adwin11.name, node = module.vm_adwin11.node }
    adrhel                 = { vmid = module.vm_adrhel.vm_id, name = module.vm_adrhel.name, node = module.vm_adrhel.node }
  }
}

output "lxc_x64_summary" {
  description = "Summary of Node 1 x86_64 LXC containers (CT 100 to 107)"
  value = {
    homeassistant = { vmid = module.lxc_homeassistant.vm_id, ip = module.lxc_homeassistant.ip_address, node = module.lxc_homeassistant.node }
    n8n           = { vmid = module.lxc_n8n.vm_id, ip = module.lxc_n8n.ip_address, node = module.lxc_n8n.node }
    scrutiny      = { vmid = module.lxc_scrutiny.vm_id, ip = module.lxc_scrutiny.ip_address, node = module.lxc_scrutiny.node }
    ollama        = { vmid = module.lxc_ollama.vm_id, ip = module.lxc_ollama.ip_address, node = module.lxc_ollama.node }
    uptimekuma    = { vmid = module.lxc_uptimekuma.vm_id, ip = module.lxc_uptimekuma.ip_address, node = module.lxc_uptimekuma.node }
    monitoring    = { vmid = module.lxc_monitoring.vm_id, ip = module.lxc_monitoring.ip_address, node = module.lxc_monitoring.node }
    owasp         = { vmid = module.lxc_owasp.vm_id, ip = module.lxc_owasp.ip_address, node = module.lxc_owasp.node }
    wazuh         = { vmid = module.lxc_wazuh.vm_id, ip = module.lxc_wazuh.ip_address, node = module.lxc_wazuh.node }
  }
}


output "licenta_lab_summary" {
  description = "Summary of Bachelor Thesis (Lucrare de Licență) CyberLab Targets (VLAN 30 & vmbr1)"
  value = {
    metasploitable_licenta = { vmid = module.vm_metasploitable_licenta_301.vm_id, name = module.vm_metasploitable_licenta_301.name, node = module.vm_metasploitable_licenta_301.node }
    kali_linux_licenta     = { vmid = module.vm_kali_licenta_302.vm_id, name = module.vm_kali_licenta_302.name, node = module.vm_kali_licenta_302.node }
    owasp_licenta          = { vmid = module.lxc_juiceshop_licenta_303.vm_id, hostname = module.lxc_juiceshop_licenta_303.hostname, ip = module.lxc_juiceshop_licenta_303.ip_address, node = module.lxc_juiceshop_licenta_303.node }
  }
}

output "ad_lab_summary" {
  description = "Summary of Multi-Generation Active Directory Enterprise Lab (VM 400 - 410)"
  value = {
    ad2025  = { vmid = module.vm_ad2025.vm_id, name = module.vm_ad2025.name, node = module.vm_ad2025.node }
    ad2022  = { vmid = module.vm_ad2022.vm_id, name = module.vm_ad2022.name, node = module.vm_ad2022.node }
    ad2019  = { vmid = module.vm_ad2019.vm_id, name = module.vm_ad2019.name, node = module.vm_ad2019.node }
    ad2016  = { vmid = module.vm_ad2016.vm_id, name = module.vm_ad2016.name, node = module.vm_ad2016.node }
    ad2012  = { vmid = module.vm_ad2012.vm_id, name = module.vm_ad2012.name, node = module.vm_ad2012.node }
    ad2008  = { vmid = module.vm_ad2008.vm_id, name = module.vm_ad2008.name, node = module.vm_ad2008.node }
    ad2003  = { vmid = module.vm_ad2003.vm_id, name = module.vm_ad2003.name, node = module.vm_ad2003.node }
    adwin7  = { vmid = module.vm_adwin7.vm_id, name = module.vm_adwin7.name, node = module.vm_adwin7.node }
    adwin10 = { vmid = module.vm_adwin10.vm_id, name = module.vm_adwin10.name, node = module.vm_adwin10.node }
    adwin11 = { vmid = module.vm_adwin11.vm_id, name = module.vm_adwin11.name, node = module.vm_adwin11.node }
    adrhel  = { vmid = module.vm_adrhel.vm_id, name = module.vm_adrhel.name, node = module.vm_adrhel.node }
  }
}


