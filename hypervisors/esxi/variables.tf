variable "esxi_host" {
  type        = string
  description = "ESXi Host IP or FQDN"
  default     = "192.168.1.100"
}

variable "esxi_user" {
  type        = string
  description = "ESXi username"
  default     = "root"
}

variable "esxi_password" {
  type        = string
  description = "ESXi password"
  sensitive   = true
}
