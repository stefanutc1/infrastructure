terraform {
  required_version = ">= 1.5.0"
}

variable "vm_name" {
  type    = string
  default = "bhyve-vm-01"
}

resource "local_file" "bhyve_rc" {
  filename = "${path.module}/configs/${var.vm_name}.conf"
  content  = <<EOF
# bhyve configuration for ${var.vm_name}
bhyve_fib="0"
bhyve_disk0="/dev/zvol/tank/vms/${var.vm_name}"
bhyve_iso="/tank/isos/debian.iso"
bhyve_memory="4G"
bhyve_cpus="2"
bhyve_network="tap0"
EOF
}

output "bhyve_config" {
  value = local_file.bhyve_rc.filename
}
