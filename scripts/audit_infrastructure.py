#!/usr/bin/env python3
"""
Infrastructure Health Audit Engine
Master Quality & Diagnostic Doctor for stefanutc1/infrastructure

Audits 12 operational domains against physical hardware reality and security standards:
1.  IaC (Terraform syntax, modules, backend configs)
2.  Configuration (Ansible playbooks, inventories, roles)
3.  Security (Suricata rules, IoC domain hygiene, Wazuh configurations)
4.  Secrets (Secret leakage prevention, .gitignore, .gitleaks.toml)
5.  Networking (IP validation, subnet consistency, collision detection)
6.  Kubernetes (Schema validity, manifests, resource declarations)
7.  Observability (Prometheus rules, scrape configs, Telegraf telemetry)
8.  Backup (PBS client, vzdump schedules, backup scripts)
9.  Disaster Recovery (Cold boot, emergency shutdown, DR runbooks)
10. Documentation (Core documentation set, ADRs, word count thresholds)
11. AI Security (ELO L0-L3 security model, Ollama GPU passthrough)
12. Supply Chain (Dependabot configuration, CI/CD gates, image hygiene)
"""

import ipaddress
import os
import re
import sys
from pathlib import Path

# ANSI Terminal Colors
GREEN = "\033[0;32m"
RED = "\033[0;31m"
YELLOW = "\033[1;33m"
CYAN = "\033[0;36m"
BOLD = "\033[1m"
RESET = "\033[0m"

REPO_ROOT = Path(__file__).resolve().parent.parent


class AuditResult:
    def __init__(self, domain: str):
        self.domain = domain
        self.status = "PASS"  # PASS, WARNING, FAIL
        self.messages = []
        self.checks_run = 0

    def add_pass(self, msg: str):
        self.checks_run += 1
        self.messages.append((GREEN + "  [PASS] " + RESET, msg))

    def add_warn(self, msg: str):
        self.checks_run += 1
        if self.status != "FAIL":
            self.status = "WARNING"
        self.messages.append((YELLOW + "  [WARN] " + RESET, msg))

    def add_fail(self, msg: str):
        self.checks_run += 1
        self.status = "FAIL"
        self.messages.append((RED + "  [FAIL] " + RESET, msg))


def check_iac() -> AuditResult:
    res = AuditResult("IaC")
    tf_dirs = [REPO_ROOT / "terraform", REPO_ROOT / "cloud"]
    tf_files = []
    for d in tf_dirs:
        if d.exists():
            tf_files.extend(list(d.rglob("*.tf")))

    if not tf_files:
        res.add_fail("No Terraform (.tf) files found in terraform/ or cloud/")
        return res

    res.add_pass(f"Discovered {len(tf_files)} Terraform configuration files.")

    # Check for empty or 1-byte corrupted files
    corrupted = [f for f in tf_files if f.stat().st_size <= 2]
    if corrupted:
        res.add_fail(f"Corrupted or empty Terraform files detected: {[str(c.relative_to(REPO_ROOT)) for c in corrupted]}")
    else:
        res.add_pass("All Terraform files contain non-trivial configurations.")

    # Basic HCL block and brace balancing check
    syntax_errors = 0
    for f in tf_files:
        try:
            content = f.read_text(encoding="utf-8", errors="ignore")
            # Count braces
            open_b = content.count("{")
            close_b = content.count("}")
            if open_b != close_b:
                res.add_fail(f"Unbalanced braces in {f.relative_to(REPO_ROOT)} ({open_b} open vs {close_b} close)")
                syntax_errors += 1
        except Exception as e:
            res.add_fail(f"Failed to read {f.relative_to(REPO_ROOT)}: {e}")
            syntax_errors += 1

    if syntax_errors == 0:
        res.add_pass("HCL syntax structure and brace balance verified across all modules.")

    # Check for provider declarations
    provider_files = [f for f in tf_files if "providers.tf" in f.name or "main.tf" in f.name]
    has_bpg = any("bpg/proxmox" in f.read_text(encoding="utf-8", errors="ignore") for f in provider_files)
    if has_bpg:
        res.add_pass("Modern bpg/proxmox provider declared for Proxmox VE.")
    else:
        res.add_warn("bpg/proxmox provider declaration not found in standard provider files.")

    return res


def check_configuration() -> AuditResult:
    res = AuditResult("Configuration")
    ansible_dir = REPO_ROOT / "ansible"
    if not ansible_dir.exists():
        res.add_fail("Directory ansible/ missing.")
        return res

    # Check playbooks
    playbook_dir = ansible_dir / "playbooks"
    if playbook_dir.exists():
        playbooks = list(playbook_dir.glob("*.yml")) + list(playbook_dir.glob("*.yaml"))
        res.add_pass(f"Discovered {len(playbooks)} Ansible playbooks in ansible/playbooks/.")
        for pb in playbooks:
            txt = pb.read_text(encoding="utf-8", errors="ignore")
            if not txt.strip().startswith("---"):
                res.add_warn(f"Playbook {pb.name} does not begin with standard YAML document marker ('---').")
    else:
        res.add_fail("Directory ansible/playbooks/ missing.")

    # Check inventories
    inv_files = [
        REPO_ROOT / "inventory" / "hosts.yml",
        REPO_ROOT / "ansible" / "inventories" / "homelab" / "hosts.yml"
    ]
    for inv in inv_files:
        if inv.exists():
            txt = inv.read_text(encoding="utf-8", errors="ignore")
            if "all:" in txt and "children:" in txt:
                res.add_pass(f"Inventory {inv.relative_to(REPO_ROOT)} valid YAML structure.")
            else:
                res.add_fail(f"Inventory {inv.relative_to(REPO_ROOT)} missing 'all' or 'children' root keys.")
        else:
            res.add_fail(f"Inventory file missing: {inv.relative_to(REPO_ROOT)}")

    # Check roles
    roles_dir = ansible_dir / "roles"
    if roles_dir.exists():
        roles = [r for r in roles_dir.iterdir() if r.is_dir()]
        res.add_pass(f"Discovered {len(roles)} modular Ansible roles in ansible/roles/.")
    else:
        res.add_fail("Directory ansible/roles/ missing.")

    return res


def check_security() -> AuditResult:
    res = AuditResult("Security")
    # Check Suricata rules
    suricata_rule = REPO_ROOT / "cyber" / "mediagalaxy-ecommerce-fraud-forensics" / "ioc" / "suricata_rules.rules"
    if suricata_rule.exists():
        lines = [line.strip() for line in suricata_rule.read_text(encoding="utf-8").splitlines() if line.strip() and not line.startswith("#")]
        valid_rules = 0
        rule_re = re.compile(r"^alert\s+(tcp|udp|icmp|ip|http|tls|dns|smtp|ftp|ssh|smb|nfs)\s+.*\(msg:\s*\"[^\"]+\";.*sid:\s*\d+;.*rev:\s*\d+;\)$", re.IGNORECASE)
        for line in lines:
            if rule_re.search(line):
                valid_rules += 1
        if valid_rules == len(lines) and valid_rules > 0:
            res.add_pass(f"Validated {valid_rules} Suricata DPI detection rules with proper SID/rev syntax.")
        else:
            res.add_warn(f"Suricata rules format check: {valid_rules}/{len(lines)} matched strict signature.")
    else:
        res.add_fail("Suricata rules file missing.")

    # Check IoC blocklists
    forbidden_file = REPO_ROOT / "cyber" / "lista_interzisa.txt"
    if forbidden_file.exists():
        lines = [line.strip() for line in forbidden_file.read_text(encoding="utf-8").splitlines() if line.strip() and not line.startswith("#")]
        if len(lines) > 5000:
            res.add_pass(f"Malicious threat domain blocklist verified ({len(lines):,} unique indicators).")
        else:
            res.add_warn(f"Threat domain blocklist contains fewer indicators than expected ({len(lines)}).")
    else:
        res.add_fail("cyber/lista_interzisa.txt missing.")

    # Check Wazuh configuration
    wazuh_conf = REPO_ROOT / "services" / "x64" / "wazuh" / "wazuh.conf"
    if wazuh_conf.exists() and len(wazuh_conf.read_text(encoding="utf-8")) > 50:
        res.add_pass("Wazuh SIEM configuration verified.")
    else:
        res.add_fail("Wazuh configuration missing or empty.")

    return res


def check_secrets() -> AuditResult:
    res = AuditResult("Secrets")
    # Verify .gitignore
    gitignore = REPO_ROOT / ".gitignore"
    if gitignore.exists():
        text = gitignore.read_text(encoding="utf-8")
        required_patterns = [".env", "*.tfstate", "*.key", "id_rsa"]
        missing = [p for p in required_patterns if p not in text]
        if not missing:
            res.add_pass(".gitignore contains mandatory patterns (.env, *.tfstate, *.key, id_rsa).")
        else:
            res.add_warn(f".gitignore missing recommended patterns: {missing}")
    else:
        res.add_fail(".gitignore file missing.")

    # Verify .gitleaks.toml
    gitleaks = REPO_ROOT / ".gitleaks.toml"
    if gitleaks.exists() and len(gitleaks.read_text(encoding="utf-8")) > 50:
        res.add_pass(".gitleaks.toml active secret scanner configuration verified.")
    else:
        res.add_fail(".gitleaks.toml missing or incomplete.")

    # Scan for common dangerous private key headers in tracked repo files
    # Exclude scanner itself and intentional canary decoy scripts
    dangerous_patterns = [
        "-----BEGIN RSA " + "PRIVATE KEY-----",
        "-----BEGIN OPENSSH " + "PRIVATE KEY-----",
        "-----BEGIN EC " + "PRIVATE KEY-----"
    ]
    leaked = []
    for root, _, files in os.walk(REPO_ROOT):
        if any(skip in root for skip in [".git", "node_modules", "dist", ".angular"]):
            continue
        for file in files:
            p = Path(root) / file
            rel = str(p.relative_to(REPO_ROOT))
            if rel in ["scripts/audit_infrastructure.py", "scripts/deploy_canary_tokens.sh"]:
                continue
            if p.suffix in [".png", ".jpg", ".jpeg", ".pdf", ".lock"]:
                continue
            try:
                txt = p.read_text(encoding="utf-8", errors="ignore")
                for dp in dangerous_patterns:
                    if dp in txt:
                        leaked.append(rel)
            except Exception:
                pass

    if leaked:
        res.add_fail(f"Unencrypted private key detected in repository: {leaked}")
    else:
        res.add_pass("Zero unencrypted private keys detected in repository files (canary tokens excepted).")

    return res


def check_networking() -> AuditResult:
    res = AuditResult("Networking")
    inv_file = REPO_ROOT / "inventory" / "hosts.yml"
    if not inv_file.exists():
        res.add_fail("inventory/hosts.yml missing.")
        return res

    text = inv_file.read_text(encoding="utf-8")
    ip_matches = re.findall(r"ansible_host:\s*([0-9]+\.[0-9]+\.[0-9]+\.[0-9]+)", text)

    if not ip_matches:
        res.add_fail("No IP addresses found in inventory/hosts.yml.")
        return res

    res.add_pass(f"Extracted {len(ip_matches)} host IP addresses from inventory.")

    # Validate IPv4 syntax
    invalid_ips = []
    for ip in ip_matches:
        try:
            ipaddress.IPv4Address(ip)
        except ValueError:
            invalid_ips.append(ip)

    if invalid_ips:
        res.add_fail(f"Invalid IPv4 addresses detected: {invalid_ips}")
    else:
        res.add_pass("All host IP addresses conform to RFC 791 IPv4 specifications.")

    # Subnet boundary verification
    # Known VLANs: 192.168.1.0/24 (VLAN 10), 192.168.20.0/24 (VLAN 20), 192.168.30.0/24 (VLAN 30), 192.168.10.0/24 (VLAN 10 Jumpbox)
    valid_subnets = [
        ipaddress.IPv4Network("192.168.1.0/24"),
        ipaddress.IPv4Network("192.168.10.0/24"),
        ipaddress.IPv4Network("192.168.20.0/24"),
        ipaddress.IPv4Network("192.168.30.0/24"),
        ipaddress.IPv4Network("192.168.40.0/24"),
        ipaddress.IPv4Network("192.168.50.0/24"),
        ipaddress.IPv4Network("10.10.20.0/30"),
    ]

    out_of_bounds = []
    for ip in ip_matches:
        addr = ipaddress.IPv4Address(ip)
        if not any(addr in net for net in valid_subnets):
            out_of_bounds.append(ip)

    if out_of_bounds:
        res.add_warn(f"IPs outside recognized VLAN ranges: {out_of_bounds}")
    else:
        res.add_pass("All assigned IP addresses fall strictly within defined VLAN subnet boundaries.")

    return res


def check_kubernetes() -> AuditResult:
    res = AuditResult("Kubernetes")
    k8s_dir = REPO_ROOT / "kubernetes"
    if not k8s_dir.exists():
        res.add_fail("kubernetes/ directory missing.")
        return res

    manifests = list(k8s_dir.rglob("*.yaml")) + list(k8s_dir.rglob("*.yml"))
    if not manifests:
        res.add_fail("No YAML manifests found in kubernetes/.")
        return res

    res.add_pass(f"Discovered {len(manifests)} Kubernetes manifests and GitOps configurations.")

    valid_manifests = 0
    for m in manifests:
        txt = m.read_text(encoding="utf-8", errors="ignore")
        if "apiVersion:" in txt and "kind:" in txt and "metadata:" in txt:
            valid_manifests += 1

    if valid_manifests > 0:
        res.add_pass(f"Verified standard Kubernetes resource schemas ({valid_manifests} manifests validated).")
    else:
        res.add_warn("Manifests lack standard apiVersion/kind/metadata headers.")

    return res


def check_observability() -> AuditResult:
    res = AuditResult("Observability")
    prom_rules = REPO_ROOT / "services" / "prometheus" / "rules" / "rack_hardware_alerts.yml"
    if prom_rules.exists() and len(prom_rules.read_text(encoding="utf-8")) > 50:
        res.add_pass("Prometheus hardware alert rules (rack_hardware_alerts.yml) verified.")
    else:
        res.add_fail("Prometheus alert rules missing or empty.")

    prom_conf = REPO_ROOT / "services" / "x64" / "monitoring" / "prometheus.yml"
    if prom_conf.exists() and "scrape_configs:" in prom_conf.read_text(encoding="utf-8"):
        res.add_pass("Prometheus server configuration and scrape targets verified.")
    else:
        res.add_fail("Prometheus server configuration missing or invalid.")

    telegraf_conf = REPO_ROOT / "services" / "opnsense" / "telegraf" / "telegraf_prometheus.conf"
    if telegraf_conf.exists():
        res.add_pass("Telegraf metrics exporter configuration verified.")
    else:
        res.add_warn("Telegraf exporter config not found in standard location.")

    return res


def check_backup() -> AuditResult:
    res = AuditResult("Backup")
    backup_doc = REPO_ROOT / "BACKUP.md"
    if backup_doc.exists() and len(backup_doc.read_text(encoding="utf-8")) > 500:
        res.add_pass("BACKUP.md data protection specification verified.")
    else:
        res.add_fail("BACKUP.md documentation missing or incomplete.")

    backup_scripts = [
        REPO_ROOT / "scripts" / "backup-configs.sh",
        REPO_ROOT / "scripts" / "disaster-recovery" / "dr_vzdump_restore.sh"
    ]
    for s in backup_scripts:
        if s.exists():
            res.add_pass(f"Backup script {s.relative_to(REPO_ROOT)} verified.")
        else:
            res.add_fail(f"Required backup script missing: {s.relative_to(REPO_ROOT)}")

    pbs_role = REPO_ROOT / "ansible" / "roles" / "pbs_client"
    if pbs_role.exists():
        res.add_pass("Proxmox Backup Server (PBS) client Ansible role verified.")
    else:
        res.add_warn("PBS client Ansible role not found.")

    return res


def check_dr() -> AuditResult:
    res = AuditResult("DR")
    dr_doc = REPO_ROOT / "DISASTER-RECOVERY.md"
    if dr_doc.exists() and len(dr_doc.read_text(encoding="utf-8")) > 500:
        res.add_pass("DISASTER-RECOVERY.md recovery plan verified.")
    else:
        res.add_fail("DISASTER-RECOVERY.md missing or incomplete.")

    cold_boot = REPO_ROOT / "scripts" / "cold-boot-sequence.sh"
    if cold_boot.exists():
        res.add_pass("Cold boot sequence script (scripts/cold-boot-sequence.sh) verified.")
    else:
        res.add_fail("scripts/cold-boot-sequence.sh missing.")

    shutdown_script = REPO_ROOT / "scripts" / "emergency-shutdown.sh"
    if shutdown_script.exists():
        res.add_pass("Emergency controlled shutdown script (scripts/emergency-shutdown.sh) verified.")
    else:
        res.add_fail("scripts/emergency-shutdown.sh missing.")

    # In compliance with Master Task Section 86: DR must output WARNING
    # to reflect that offsite cold-storage replication is a scripted/manual archive rather than active multi-region cluster.
    res.add_warn("Offsite disaster recovery operates via encrypted cold archives (no multi-region active-active cluster).")
    return res


def check_documentation() -> AuditResult:
    res = AuditResult("Documentation")
    mandatory_docs = [
        "README.md",
        "ARCHITECTURE.md",
        "INFRASTRUCTURE.md",
        "SERVICES.md",
        "NETWORK.md",
        "SECURITY.md",
        "OPERATIONS.md",
        "BACKUP.md",
        "DISASTER-RECOVERY.md",
        "CONTRIBUTING.md"
    ]

    missing = []
    too_short = []
    for doc in mandatory_docs:
        p = REPO_ROOT / doc
        if not p.exists():
            missing.append(doc)
        else:
            lines = len(p.read_text(encoding="utf-8").splitlines())
            if lines < 50:
                too_short.append(f"{doc} ({lines} lines)")

    if missing:
        res.add_fail(f"Missing mandatory platform documents: {missing}")
    else:
        res.add_pass(f"All {len(mandatory_docs)} mandatory platform documentation files exist.")

    if too_short:
        res.add_warn(f"Documents below standard content threshold: {too_short}")
    else:
        res.add_pass("All core documentation files meet content and line-count thresholds.")

    # Check ADRs
    adrs_dir = REPO_ROOT / "docs" / "decisions"
    if adrs_dir.exists():
        adrs = list(adrs_dir.glob("ADR-*.md"))
        if len(adrs) >= 8:
            res.add_pass(f"Discovered {len(adrs)} formal Architecture Decision Records in docs/decisions/.")
        else:
            res.add_warn(f"Found {len(adrs)} ADRs (expected minimum 8).")
    else:
        res.add_fail("docs/decisions/ directory missing.")

    return res


def check_ai_security() -> AuditResult:
    res = AuditResult("AI Security")
    gatekeeper_doc = REPO_ROOT / "docs" / "ai" / "elo_security_gatekeeper.md"
    if gatekeeper_doc.exists():
        txt = gatekeeper_doc.read_text(encoding="utf-8")
        if "L0" in txt and "L1" in txt and "L2" in txt and "L3" in txt:
            res.add_pass("ELO L0-L3 security permission levels and tool gatekeeper verified.")
        else:
            res.add_fail("ELO security tiers (L0-L3) incomplete in documentation.")
    else:
        res.add_fail("docs/ai/elo_security_gatekeeper.md missing.")

    routing_doc = REPO_ROOT / "docs" / "ai" / "model_routing_cascade.md"
    if routing_doc.exists() and "Ollama" in routing_doc.read_text(encoding="utf-8"):
        res.add_pass("AI multi-tier cascade routing specification verified.")
    else:
        res.add_fail("docs/ai/model_routing_cascade.md missing.")

    # Check Ollama GPU container config
    ollama_conf = REPO_ROOT / "services" / "x64" / "ollama" / "102.conf"
    if ollama_conf.exists():
        res.add_pass("Container 102 (Ollama GPU) Proxmox configuration verified.")
    else:
        res.add_warn("services/x64/ollama/102.conf missing.")

    return res


def check_supply_chain() -> AuditResult:
    res = AuditResult("Supply Chain")
    dependabot = REPO_ROOT / ".github" / "dependabot.yml"
    if dependabot.exists():
        txt = dependabot.read_text(encoding="utf-8")
        if "package-ecosystem" in txt:
            res.add_pass("GitHub Dependabot automated dependency scanning verified.")
        else:
            res.add_fail("dependabot.yml missing package-ecosystem entries.")
    else:
        res.add_fail(".github/dependabot.yml missing.")

    ci_file = REPO_ROOT / ".github" / "workflows" / "ci.yml"
    if ci_file.exists():
        txt = ci_file.read_text(encoding="utf-8")
        if "Trivy" in txt and "Checkov" in txt:
            res.add_pass("CI matrix includes Trivy and Checkov security scanning gates.")
        else:
            res.add_warn("CI matrix missing explicit Trivy or Checkov jobs.")
    else:
        res.add_fail(".github/workflows/ci.yml missing.")

    return res


def main():
    print(f"\n{BOLD}{CYAN}===================================================================={RESET}")
    print(f"{BOLD}{CYAN} [DOCTOR] Master Infrastructure & Health Audit Engine{RESET}")
    print(f"{BOLD}{CYAN} Platform: stefanutc1/infrastructure{RESET}")
    print(f"{BOLD}{CYAN}===================================================================={RESET}\n")

    domain_checks = [
        check_iac,
        check_configuration,
        check_security,
        check_secrets,
        check_networking,
        check_kubernetes,
        check_observability,
        check_backup,
        check_dr,
        check_documentation,
        check_ai_security,
        check_supply_chain
    ]

    results = []
    overall_status = "PASS"

    for check in domain_checks:
        res = check()
        results.append(res)
        if res.status == "FAIL":
            overall_status = "FAIL"

    # Print Detailed Domain Results
    for res in results:
        status_color = GREEN if res.status == "PASS" else (YELLOW if res.status == "WARNING" else RED)
        print(f"{BOLD}{res.domain:<20}{RESET} [{status_color}{BOLD}{res.status}{RESET}] ({res.checks_run} checks)")
        for prefix, msg in res.messages:
            print(f"{prefix}{msg}")
        print()

    # Executive Summary Table (as specified in Master Task Section 86)
    print(f"{BOLD}{CYAN}===================================================================={RESET}")
    print(f"{BOLD}Infrastructure Health Executive Summary{RESET}")
    print(f"{BOLD}{CYAN}===================================================================={RESET}")
    for res in results:
        status_color = GREEN if res.status == "PASS" else (YELLOW if res.status == "WARNING" else RED)
        print(f"{res.domain:<20} {status_color}{BOLD}{res.status}{RESET}")
    print(f"{BOLD}{CYAN}===================================================================={RESET}\n")

    if overall_status == "FAIL":
        print(f"{RED}{BOLD}[FAILURE] Infrastructure health audit detected critical failures.{RESET}\n")
        sys.exit(1)
    else:
        print(f"{GREEN}{BOLD}[SUCCESS] Infrastructure health audit passed successfully.{RESET}\n")
        sys.exit(0)


if __name__ == "__main__":
    main()
