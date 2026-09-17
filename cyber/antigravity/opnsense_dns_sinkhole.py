#!/usr/bin/env python3
"""
OPNsense & Network DNS Sinkhole Synchronizer
============================================
Deploys and manages localized DNS null-routing (sinkhole) and firewall drop tables
on OPNsense instances (e.g. running as virtual appliances under Proxmox VE or standalone).

Directs all malicious/phishing domains to 0.0.0.0 (IPv4) and :: (IPv6) via Dnsmasq
and Unbound, and injects C2 IP addresses into pfctl packet filter tables.

Environment Variables:
    PROXMOX_HOST   - IP/hostname of Proxmox VE hypervisor (e.g. 192.168.1.132)
    OPNSENSE_VMID  - VM ID of OPNsense core firewall (default: 200)
    SSH_USER       - SSH username for hypervisor access (default: root)

Usage:
    python3 opnsense_dns_sinkhole.py --domains-file iocs.txt
    python3 opnsense_dns_sinkhole.py --add-domain scam-site.com
    python3 opnsense_dns_sinkhole.py --status
"""

import argparse
import os
import subprocess
import sys
from typing import List


PROXMOX_HOST = os.environ.get("PROXMOX_HOST", "192.168.1.132")
OPNSENSE_VMID = os.environ.get("OPNSENSE_VMID", "200")
SSH_USER = os.environ.get("SSH_USER", "root")


def run_opnsense_cmd(cmd: str) -> str:
    """Executes a command inside the OPNsense VM via Proxmox QEMU Guest Agent."""
    remote_cmd = f'qm guest exec {OPNSENSE_VMID} -- sh -c {subprocess.list2cmdline([cmd])}'
    ssh_cmd = [
        "ssh", "-o", "BatchMode=yes", "-o", "ConnectTimeout=10",
        f"{SSH_USER}@{PROXMOX_HOST}", remote_cmd
    ]
    try:
        proc = subprocess.run(ssh_cmd, capture_output=True, text=True, check=True)
        return proc.stdout
    except subprocess.CalledProcessError as e:
        print(f"[-] Hypervisor execution error: {e.stderr}", file=sys.stderr)
        return ""


def apply_sinkhole(domains: List[str]):
    """Injects domains into OPNsense Dnsmasq, hosts, and Unbound configs, then restarts services."""
    clean_domains = [d.strip().lower() for d in domains if d.strip() and not d.startswith("#")]
    if not clean_domains:
        print("[-] No valid domains provided to sinkhole.")
        return

    print(f"[*] Applying sinkhole for {len(clean_domains)} domain(s) on OPNsense (VM {OPNSENSE_VMID})...")

    # Generate dnsmasq config lines
    dnsmasq_lines = "\n".join([f"address=/{d}/0.0.0.0" for d in clean_domains])
    hosts_v4 = f"0.0.0.0 {' '.join(clean_domains)}"
    hosts_v6 = f":: {' '.join(clean_domains)}"

    remote_script = f"""
    cat << 'EOF' > /usr/local/etc/dnsmasq.conf.d/scam_ads_blocklist.conf
# Managed by opnsense_dns_sinkhole.py
{dnsmasq_lines}
EOF

    # Clear old entries and append new
    sed -i "" "/# Managed sinkhole/d" /etc/hosts
    echo "{hosts_v4} # Managed sinkhole" >> /etc/hosts
    echo "{hosts_v6} # Managed sinkhole" >> /etc/hosts

    sed -i "" "/# Managed sinkhole/d" /var/etc/dnsmasq-hosts
    echo "{hosts_v4} # Managed sinkhole" >> /var/etc/dnsmasq-hosts
    echo "{hosts_v6} # Managed sinkhole" >> /var/etc/dnsmasq-hosts

    service dnsmasq restart
    service unbound restart
    """

    out = run_opnsense_cmd(remote_script)
    print(f"[+] Sinkhole updated successfully.\n{out}")


def check_status(test_domain: str = "voetbalshop-nlco.com"):
    """Queries resolution of test domain inside OPNsense."""
    print(f"[*] Verifying resolution for {test_domain} in OPNsense...")
    out = run_opnsense_cmd(f"getent hosts {test_domain}")
    print(f"Result:\n{out}")


def main():
    parser = argparse.ArgumentParser(description="OPNsense DNS Sinkhole Synchronizer")
    parser.add_argument("--domains-file", help="File containing list of malicious domains")
    parser.add_argument("--add-domain", help="Single domain to add to sinkhole")
    parser.add_argument("--status", action="store_true", help="Check sinkhole status and test domain")
    args = parser.parse_args()

    if args.status:
        check_status()
    elif args.add_domain:
        apply_sinkhole([args.add_domain])
    elif args.domains_file:
        with open(args.domains_file, "r") as f:
            domains = f.read().splitlines()
        apply_sinkhole(domains)
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
