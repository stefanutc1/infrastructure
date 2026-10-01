# ==============================================================================
# Open Policy Agent (OPA) / Conftest Policy: Zero-Cost Cloud Guardrails
# Author: Moană Ștefănuț-Cornel (@stefanutc1)
# ==============================================================================

package cloud.cost

default allow = false

# Permitted Free-Tier Compute Instance Types
allowed_aws_instances = ["t2.micro", "t3.micro", "t4g.small"]
allowed_gcp_instances = ["e2-micro", "f1-micro"]
allowed_azure_instances = ["standard_b1s", "standard_b1ls"]

# Deny AWS NAT Gateways
deny[msg] {
    some resource in input.resource.aws_nat_gateway
    msg := sprintf("Zero-Cost Violation: aws_nat_gateway is prohibited. NAT Gateways cost ~$32.40/month. Use local homelab routing instead.", [])
}

# Deny AWS Application / Network Load Balancers
deny[msg] {
    some resource in input.resource.aws_lb
    msg := sprintf("Zero-Cost Violation: aws_lb is prohibited. Load balancers incur hourly charges. Use Caddy/Nginx ingress on Node 1.", [])
}

# Deny Non-Free AWS EC2 Instance Types
deny[msg] {
    some resource in input.resource.aws_instance
    instance_type := lower(resource.instance_type)
    not contains_element(allowed_aws_instances, instance_type)
    msg := sprintf("Zero-Cost Violation: aws_instance '%v' uses non-free tier instance_type '%v'. Only %v are allowed.", [resource, instance_type, allowed_aws_instances])
}

# Helper function
contains_element(list, elem) {
    list[_] = elem
}

allow {
    count(deny) == 0
}
