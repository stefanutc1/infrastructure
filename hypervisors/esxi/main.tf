terraform {
  required_version = ">= 1.5.0"
  required_providers {
    esxi = {
      source  = "josenk/esxi"
      version = "~> 1.10.0"
    }
  }
}

provider "esxi" {
  esxi_hostname = var.esxi_host
  esxi_username = var.esxi_user
  esxi_password = var.esxi_password
}

resource "esxi_guest" "vm" {
  count              = 1
  guest_name         = "enterprise-esxi-vm-${count.index + 1}"
  disk_store         = "datastore1"
  power              = "on"
  memsize            = 2048
  numvcpus           = 2
  ovf_source         = ""
  network_interfaces {
    virtual_network = "VM Network"
  }
}
