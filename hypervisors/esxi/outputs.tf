output "esxi_vm_ips" {
  value       = esxi_guest.vm[*].ip_address
  description = "IP addresses of deployed ESXi VMs"
}
