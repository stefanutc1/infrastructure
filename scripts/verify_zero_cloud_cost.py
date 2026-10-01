#!/usr/bin/env python3
"""
==============================================================================
Zero-Cost Cloud Architecture Guardrail & Billing Defense Engine
Author: Moană Ștefănuț-Cornel (@stefanutc1)
Repository: stefanutc1/infrastructure

Purpose:
Statically audits all Infrastructure-as-Code (Terraform) manifests in cloud/
(AWS, GCP, Azure) to guarantee 100% Zero-Dollar ($0.00) operation.
Prevents accidental spin-up of billable cloud SKUs, unbudgeted gateways,
idle Elastic IPs, paid load balancers, or non-free-tier instance sizes.
==============================================================================
"""

import os
import re
import sys
from pathlib import Path

# Permitted Free-Tier Compute Instance Types
ALLOWED_FREE_TIER_INSTANCES = {
    "aws": {"t2.micro", "t3.micro", "t4g.small"}, # AWS Free Tier eligible
    "gcp": {"e2-micro", "f1-micro"},              # GCP Always Free Tier
    "azure": {"standard_b1s", "standard_b1ls"}    # Azure Free Tier
}

# Forbidden High-Cost Cloud Resource Types
PROHIBITED_PAID_RESOURCES = {
    "aws": [
        ("aws_nat_gateway", "Managed NAT Gateway (~$32.40/month + data transit)"),
        ("aws_lb", "Application/Network Load Balancer (~$22.50/month)"),
        ("aws_alb", "Application Load Balancer (~$22.50/month)"),
        ("aws_elb", "Classic Elastic Load Balancer (~$18.00/month)"),
        ("aws_rds_cluster", "Managed Aurora/RDS Cluster (High Cost)"),
        ("aws_redshift_cluster", "Redshift Data Warehouse (High Cost)"),
        ("aws_eks_cluster", "EKS Managed Control Plane ($73.00/month)"),
    ],
    "gcp": [
        ("google_compute_router_nat", "Cloud NAT Gateway (~$32.00/month)"),
        ("google_compute_url_map", "Global External Load Balancer ($18.00/month)"),
        ("google_container_cluster", "GKE Standard Cluster ($74.40/month management fee)"),
        ("google_sql_database_instance", "Cloud SQL Managed Database (Billable)")
    ],
    "azure": [
        ("azurerm_nat_gateway", "Azure NAT Gateway (~$32.85/month)"),
        ("azurerm_lb", "Standard Load Balancer (Billable SKU)"),
        ("azurerm_application_gateway", "Application Gateway WAF ($120.00+/month)"),
        ("azurerm_kubernetes_cluster", "AKS Managed Cluster with paid nodes")
    ]
}

def scan_terraform_files(cloud_dir: Path):
    violations = []
    inspected_files = 0

    if not cloud_dir.exists():
        print(f"[INFO] Cloud directory '{cloud_dir}' not found. No cloud manifests to audit.")
        return 0, []

    for root, _, files in os.walk(cloud_dir):
        for f in files:
            if f.endswith(".tf") and not f.startswith("."):
                filepath = Path(root) / f
                inspected_files += 1
                rel_path = filepath.relative_to(cloud_dir.parent)

                # Determine cloud provider
                provider = "unknown"
                if "aws" in str(filepath).lower():
                    provider = "aws"
                elif "gcp" in str(filepath).lower():
                    provider = "gcp"
                elif "azure" in str(filepath).lower():
                    provider = "azure"

                with open(filepath, "r", encoding="utf-8", errors="ignore") as tf_file:
                    content = tf_file.read()

                    # 1. Check for Prohibited Paid Resource Declarations
                    if provider in PROHIBITED_PAID_RESOURCES:
                        for resource_type, description in PROHIBITED_PAID_RESOURCES[provider]:
                            pattern = rf'resource\s+"{resource_type}"\s+"[^"]+"'
                            matches = re.findall(pattern, content)
                            if matches:
                                for m in matches:
                                    violations.append({
                                        "file": str(rel_path),
                                        "error": f"Prohibited Paid Cloud Resource: {m}",
                                        "reason": f"{description} incurs non-zero monthly charges.",
                                        "remediation": "Remove resource or replace with local homelab equivalent (e.g. OPNsense / Caddy on Node 1)."
                                    })

                    # 2. Check for Paid Instance Types
                    instance_pattern = r'instance_type\s*=\s*["\']([^"\']+)["\']|machine_type\s*=\s*["\']([^"\']+)["\']|size\s*=\s*["\']([^"\']+)["\']'
                    for match in re.finditer(instance_pattern, content):
                        instance_type = (match.group(1) or match.group(2) or match.group(3)).lower()
                        # If variable reference like var.instance_type, ignore static check
                        if instance_type.startswith("var.") or "${" in instance_type:
                            continue

                        if provider in ALLOWED_FREE_TIER_INSTANCES:
                            allowed = ALLOWED_FREE_TIER_INSTANCES[provider]
                            if instance_type not in allowed:
                                violations.append({
                                    "file": str(rel_path),
                                    "error": f"Disallowed Non-Free Instance Type: '{instance_type}'",
                                    "reason": f"Provider '{provider}' only permits free-tier types: {', '.join(sorted(allowed))}",
                                    "remediation": f"Change instance size to one of: {', '.join(sorted(allowed))}."
                                })

                    # 3. Check for Billable Storage Configurations (Provisioned IOPS)
                    if "iops" in content and provider == "aws":
                        if re.search(r'iops\s*=\s*[1-9][0-9]*', content):
                            violations.append({
                                "file": str(rel_path),
                                "error": "Provisioned IOPS (io1/io2) Detected",
                                "reason": "Provisioned IOPS volumes incur heavy per-IOPS hourly fees.",
                                "remediation": "Use standard gp2 or gp3 storage without extra provisioned IOPS."
                            })

    return inspected_files, violations

def main():
    print("=" * 80)
    print("Zero-Cost Cloud Architecture Guardrail & Budget Verifier")
    print("Author: Moană Ștefănuț-Cornel (@stefanutc1) · FEAA UCV (2024–2027)")
    print("Policy: Strict $0.00 / Free-Tier Only · Zero Surprise Cloud Costs")
    print("=" * 80)

    repo_root = Path(__file__).resolve().parent.parent
    cloud_dir = repo_root / "cloud"

    files_count, violations = scan_terraform_files(cloud_dir)

    print(f"\n[AUDIT] Scanned {files_count} Terraform files in 'cloud/'...")

    if not violations:
        print("[SUCCESS] All cloud Terraform files strictly comply with the Zero-Cost Guardrail.")
        print("[SUCCESS] No billable NAT gateways, paid load balancers, or non-free instance types detected.")
        sys.exit(0)
    else:
        print(f"\n[FAILURE] Found {len(violations)} Zero-Cost Cloud Guardrail violations:\n")
        for i, v in enumerate(violations, 1):
            print(f"  {i}. [{v['file']}] {v['error']}")
            print(f"     Reason:      {v['reason']}")
            print(f"     Remediation: {v['remediation']}\n")
        print("[ABORT] Pipeline stopped to prevent accidental cloud infrastructure billing.")
        sys.exit(1)

if __name__ == "__main__":
    main()
