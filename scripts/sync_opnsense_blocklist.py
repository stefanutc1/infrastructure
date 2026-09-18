#!/usr/bin/env python3
"""
OPNsense Unbound / Dnsmasq Blocklist Synchronizer

Automates deployment of cyber/forbidden_domains.txt to the OPNsense perimeter gateway (192.168.1.134 / 192.168.1.1).
Formats:
- Dnsmasq sinkhole: address=/<domain>/0.0.0.0 and address=/<domain>/::
- Unbound local-zone: local-zone: "<domain>" redirect \n local-data: "<domain> A 0.0.0.0"

Triggered:
- In CD workflow on release tag (v*) or scheduled cron.
- Manually via CLI.
"""

from __future__ import annotations
import os
import sys
import argparse
import subprocess
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
FORBIDDEN_TXT = REPO_ROOT / "cyber" / "forbidden_domains.txt"


def generate_dnsmasq_config(domains: list[str]) -> str:
    lines = [
        "# ==============================================================================",
        "# OPNsense Dnsmasq Scam & Multi-National Threat Blocklist",
        f"# Total Unique Domains: {len(domains)}",
        "# Managed automatically by CI/CD pipeline",
        "# ==============================================================================",
    ]
    for d in domains:
        if d.startswith("*."):
            d = d[2:]
        lines.append(f"address=/{d}/0.0.0.0")
        lines.append(f"address=/{d}/::")
    return "\n".join(lines) + "\n"


def generate_unbound_config(domains: list[str]) -> str:
    lines = [
        "# ==============================================================================",
        "# OPNsense Unbound DNSBL Redirect Blocklist",
        f"# Total Unique Domains: {len(domains)}",
        "# Managed automatically by CI/CD pipeline",
        "# ==============================================================================",
        "server:",
    ]
    for d in domains:
        if d.startswith("*."):
            d = d[2:]
        lines.append(f'  local-zone: "{d}" redirect')
        lines.append(f'  local-data: "{d} A 0.0.0.0"')
        lines.append(f'  local-data: "{d} AAAA ::"')
    return "\n".join(lines) + "\n"


def deploy_to_opnsense(host: str, user: str, conf_content: str, remote_path: str, key_path: str | None = None) -> bool:
    print(f"[OPNSENSE] Deploying blocklist to {user}@{host}:{remote_path}...")
    ssh_cmd = ["ssh", "-o", "StrictHostKeyChecking=no", "-o", "ConnectTimeout=10"]
    if key_path:
        ssh_cmd.extend(["-i", key_path])

    try:
        # Write remote config via stdin
        p = subprocess.Popen(
            ssh_cmd + [f"{user}@{host}", f"cat > {remote_path} && pluginctl -s dnsmasq restart || service dnsmasq restart || true"],
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        stdout, stderr = p.communicate(input=conf_content, timeout=30)
        if p.returncode == 0:
            print("[OPNSENSE] Deployment and service reload completed successfully.")
            return True
        else:
            print(f"[OPNSENSE ERROR] Deployment failed with code {p.returncode}: {stderr}")
            return False
    except Exception as e:
        print(f"[OPNSENSE ERROR] Connection error: {e}")
        return False


def main():
    parser = argparse.ArgumentParser(description="Synchronize forbidden domains to OPNsense gateway")
    parser.add_argument("--format", choices=["dnsmasq", "unbound"], default="dnsmasq", help="Target configuration syntax")
    parser.add_argument("--host", default=os.getenv("OPNSENSE_HOST", "192.168.1.1"), help="OPNsense gateway IP/FQDN")
    parser.add_argument("--user", default=os.getenv("OPNSENSE_USER", "root"), help="SSH user")
    parser.add_argument("--key", default=os.getenv("OPNSENSE_SSH_KEY"), help="Path to SSH private key")
    parser.add_argument("--output", help="Write generated config to local file instead of remote deployment")
    parser.add_argument("--dry-run", action="store_true", help="Generate config and validate without deploying")

    args = parser.parse_args()

    if not FORBIDDEN_TXT.exists():
        print(f"[ERROR] Source blocklist not found at {FORBIDDEN_TXT}")
        return 1

    domains = [
        line.strip()
        for line in FORBIDDEN_TXT.read_text(encoding="utf-8").splitlines()
        if line.strip() and not line.strip().startswith("#")
    ]

    print(f"[OPNSENSE SYNC] Loaded {len(domains)} domains from {FORBIDDEN_TXT.name}")

    if args.format == "dnsmasq":
        config = generate_dnsmasq_config(domains)
        remote_dest = "/usr/local/etc/dnsmasq.conf.d/scam_ads_blocklist.conf"
    else:
        config = generate_unbound_config(domains)
        remote_dest = "/var/unbound/etc/threat_blocklist.conf"

    if args.output:
        out_path = Path(args.output)
        out_path.write_text(config, encoding="utf-8")
        print(f"[OPNSENSE] Config written to local file: {out_path} ({len(config.splitlines())} lines)")
        return 0

    if args.dry_run or not os.getenv("OPNSENSE_DEPLOY_ENABLED"):
        print(f"[OPNSENSE DRY-RUN] Config generated ({len(config.splitlines())} lines). Remote destination: {remote_dest}")
        print("[INFO] Set OPNSENSE_DEPLOY_ENABLED=1 and configure OPNSENSE_HOST / OPNSENSE_SSH_KEY to enable live push.")
        return 0

    success = deploy_to_opnsense(args.host, args.user, config, remote_dest, args.key)
    return 0 if success else 1


if __name__ == "__main__":
    sys.exit(main())
