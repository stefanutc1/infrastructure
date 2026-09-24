output "config_file" {
  value       = local_file.bhyve_rc.filename
  description = "Generated bhyve configuration file"
}
