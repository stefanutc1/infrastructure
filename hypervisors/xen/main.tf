terraform {
  required_version = ">= 1.5.0"
  # Note: Xen provider community support or generic local/ssh execution can be used.
}

variable "vm_name" {
  type    = string
  default = "xen-guest-01"
}

resource "local_file" "xen_config" {
  filename = "${path.module}/config/${var.vm_name}.cfg"
  content  = <<EOF
name = "${var.vm_name}"
memory = 2048
vcpus = 2
disk = [ 'phy:/dev/vg0/${var.vm_name},xvda,w' ]
vif = [ 'bridge=xenbr0' ]
bootloader = 'pygrub'
EOF
}

output "config_path" {
  value = local_file.xen_config.filename
}
