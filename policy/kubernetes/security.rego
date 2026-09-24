package main

# ==============================================================================
# OPA / Conftest Policy: Kubernetes Zero-Trust Security Guardrails
# Blocks root execution, latest/untagged images, and unauthorized host mappings.
# ==============================================================================

# 1. Deny containers running as root
deny[msg] {
    container := get_containers[_]
    not is_non_root(container)
    msg := sprintf("Security Violation [CIS-K8S-5.2.6]: Container '%v' must set securityContext.runAsNonRoot: true and runAsUser to a non-zero UID.", [container.name])
}

is_non_root(container) {
    container.securityContext.runAsNonRoot == true
    container.securityContext.runAsUser > 0
}

# 2. Deny container images using :latest or untagged
deny[msg] {
    container := get_containers[_]
    image := container.image
    is_disallowed_tag(image)
    msg := sprintf("Security Violation [CIS-K8S-5.4.1]: Container '%v' specifies unpinned image '%v'. Explicit immutable version tags or sha256 digests required.", [container.name, image])
}

is_disallowed_tag(image) {
    endswith(image, ":latest")
}

is_disallowed_tag(image) {
    not contains(image, ":")
    not contains(image, "@sha256:")
}

# 3. Deny unauthorized hostPort mappings
deny[msg] {
    container := get_containers[_]
    port := container.ports[_]
    port.hostPort
    msg := sprintf("Security Violation [CIS-K8S-5.2.4]: Container '%v' binds hostPort '%v'. Host port mapping bypasses SDN/CNI ingress controls.", [container.name, port.hostPort])
}

# 4. Deny host namespace sharing (hostNetwork, hostPID, hostIPC)
deny[msg] {
    pod := get_pods[_]
    pod.spec.hostNetwork == true
    msg := sprintf("Security Violation [CIS-K8S-5.2.2]: Workload '%v' enables hostNetwork: true.", [input.metadata.name])
}

deny[msg] {
    pod := get_pods[_]
    pod.spec.hostPID == true
    msg := sprintf("Security Violation [CIS-K8S-5.2.3]: Workload '%v' enables hostPID: true.", [input.metadata.name])
}

deny[msg] {
    pod := get_pods[_]
    pod.spec.hostIPC == true
    msg := sprintf("Security Violation [CIS-K8S-5.2.5]: Workload '%v' enables hostIPC: true.", [input.metadata.name])
}

# ------------------------------------------------------------------------------
# Helpers: Extract Pod Spec and Containers across standard K8s workloads
# ------------------------------------------------------------------------------
get_pods[input] {
    input.kind == "Pod"
}

get_pods[input.spec.template] {
    valid_kinds := ["Deployment", "DaemonSet", "StatefulSet", "Job"]
    valid_kinds[_] == input.kind
}

get_pods[input.spec.jobTemplate.spec.template] {
    input.kind == "CronJob"
}

get_containers[c] {
    pod := get_pods[_]
    c := pod.spec.containers[_]
}

get_containers[c] {
    pod := get_pods[_]
    c := pod.spec.initContainers[_]
}
