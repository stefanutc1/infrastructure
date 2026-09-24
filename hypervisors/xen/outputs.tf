output "xen_vm_config_file" {
  value       = local_file.xen_config.filename
  description = "Path to generated Xen configuration file"
}
