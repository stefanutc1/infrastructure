resource "hyperv_virtual_switch" "homelab_switch" {
  name       = "hlextswitch"
  switch_type = "External" 
  notes      = "Managed by Terraform for Hyper-V Homelab"
}

resource "hyperv_vhd" "vm_disk" {
  path           = "C:\\ProgramData\\Microsoft\\Windows\\Hyper-V\\Virtual Hard Disks\\homelab_node.vhdx"
  vhd_type       = "Dynamic"
  size           = 21474836480 
}

resource "hyperv_vm_instance" "vm" {
  name                 = "opnsense"
  generation           = 2
  processor_count      = 2
  memory_startup_bytes = 4294967296 # 4 GB RAM
  
  hard_disk_device {
    path   = hyperv_vhd.vm_disk.path
    controller_type = "Scsi"
    controller_number = 0
    controller_location = 0
  }

  network_device {
    switch_name = hyperv_virtual_switch.homelab_switch.name
    name        = "eth0"
  }

  integration_services = {
    GuestServiceInterface = true
    Heartbeat             = true
    KeyIntegration        = true
    Shutdown              = true
    TimeSynchronization   = true
  }
}
