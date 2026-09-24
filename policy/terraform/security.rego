package main

# ==============================================================================
# OPA / Conftest Policy: Terraform Infrastructure Security Guardrails
# Validates unprivileged Proxmox containers, encrypted storage, and network isolation.
# ==============================================================================

# 1. Deny privileged Proxmox LXC containers (unprivileged must be true)
deny[msg] {
    container := input.resource.proxmox_virtual_environment_container[_]
    container.unprivileged == false
    msg := sprintf("Security Violation: Proxmox LXC container must be unprivileged (unprivileged = true) to prevent kernel privilege escalation.", [])
}

# 2. Deny Docker containers running with host network mode
deny[msg] {
    docker_container := input.resource.docker_container[_]
    docker_container.network_mode == "host"
    msg := sprintf("Security Violation: Docker container '%v' must not use host network mode.", [docker_container.name])
}

# 3. Deny S3 / MinIO buckets without server-side encryption
deny[msg] {
    s3_bucket := input.resource.aws_s3_bucket[_]
    not s3_bucket.server_side_encryption_configuration
    msg := sprintf("Security Violation: S3 bucket must have server-side encryption enabled.", [])
}
