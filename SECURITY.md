<div align="center">

# Enterprise Security Policy, Threat Model & Defense Baseline

</div>

<div align="center">

[![Security](https://img.shields.io/badge/Security-Defense--in--Depth%20Baseline-0f172a.svg?style=flat&logo=target)](#)
[![Compliance](https://img.shields.io/badge/CIS%20Benchmark-Level%201%20Server%20Hardened-10b981.svg?style=flat&logo=linux)](docs/security/cis_hardening_baseline.md)
[![SIEM](https://img.shields.io/badge/SIEM%2FXDR-Wazuh%204.14%20Manager-00a4e4.svg?style=flat&logo=wazuh)](https://wazuh.com)
[![NIDS](https://img.shields.io/badge/NIDS%2FIPS-Suricata%20Inline%20DPI-ea580c.svg?style=flat&logo=wireshark)](#5-detection--incident-response-infrastructure)
[![Zero-Plaintext](https://img.shields.io/badge/Secrets-Zero--Plaintext%20(Gitleaks%2FTruffleHog)-6366f1.svg?style=flat&logo=1password)](#4-secrets-management--repository-hygiene)
[![Cloud Policy](https://img.shields.io/badge/Cloud%20Security-%240.00%20Zero--Cost%20Guardrails-059669.svg?style=flat&logo=terraform)](policy/cloud/zero_cost_policy.rego)
[![Author](https://img.shields.io/badge/Security%20Lead-Moan%C4%83%20%C8%98tef%C4%83nu%C8%9B--Cornel-blue.svg?style=flat&logo=github)](https://github.com/stefanutc1)
[![University](https://img.shields.io/badge/University-Universitatea%20din%20Craiova%20%C2%B7%20FEAA-0284c7.svg?style=flat&logo=academia)](https://feaa.ucv.ro)

</div>

---

<div align="center">

## Executive Summary

</div>

This document establishes the comprehensive cybersecurity posture, threat models, hardening benchmarks, cryptographic baselines, detection-and-response procedures, and cloud cost guardrails governing the `stefanutc1/infrastructure` platform.

Built on the principles of **Defense-in-Depth**, **Least Privilege**, and **Zero Trust Architecture**, the platform protects 24/7 household services while providing isolated, hardened proving grounds for academic cybersecurity research, digital forensics, and penetration testing.

---

<div align="center">

## 1. STRIDE Threat Model & Attack Surface Analysis

</div>

| Threat Category (STRIDE) | Potential Attack Vector | Platform Mitigations & Technical Controls |
| :--- | :--- | :--- |
| **Spoofing Identity** | Unauthorized operator access via compromised SSH or WebGUI credentials. | Mandatory `ed25519` SSH keys; password auth disabled globally; Caddy mTLS client certificate authentication for administrative portals. |
| **Tampering with Data** | Modification of financial ledger database or DNS poisoning attacks. | PostgreSQL SSL/SCRAM-SHA-256; DNSSEC validation on Unbound DNS; ZFS cryptographic block checksumming. |
| **Repudiation** | Operator or compromised workload denies executing destructive commands. | Centralized Wazuh SIEM audit logging; immutable syslog forwarding; GPG/commitlint signed Git commits. |
| **Information Disclosure** | Leakage of API tokens, private keys, or passwords committed to Git. | Pre-commit hooks (`.pre-commit-config.yaml`); automated Gitleaks & TruffleHog CI scanning; Mozilla SOPS with `age` public-key encryption. |
| **Denial of Service (DoS)** | SYN floods, brute-force floods, or malicious bandwidth saturation. | TCP SYN Cookies enabled; CrowdSec firewall bouncers; Suricata rate-limiting; OPNsense stateful connection limits. |
| **Elevation of Privilege** | Container escape from untrusted LXC or web application exploit. | Default unprivileged LXC containers (`UID 100000+`); AppArmor profiles; restrictive sudoers (`Defaults env_reset`). |

---

<div align="center">

## 2. Hardening Benchmarks & System Compliance

</div>

<div align="center">

### 2.1 Linux Operating System Hardening

</div>
All physical hypervisors, virtual machines, and container runtimes conform to the **CIS Linux Benchmark Level 1 Server Baseline** (see [`docs/security/cis_hardening_baseline.md`](docs/security/cis_hardening_baseline.md)):
- Reverse Path Filtering (`rp_filter = 1`) enforced to eliminate IP spoofing.
- ICMP redirects and source-routed packets unconditionally dropped.
- Address Space Layout Randomization (ASLR) enforced at maximum entropy (`kernel.randomize_va_space = 2`).
- Kernel `dmesg` restrictions active (`kernel.dmesg_restrict = 1`).
- Filesystem permission auditing: `/etc/shadow` restricted to `0600`, `/etc/sudoers` to `0440`.

<div align="center">

### 2.2 Proxmox VE Hypervisor Hardening

</div>
- Commercial enterprise repository nag disabled via clean automation (`scripts/pve-remove-nag.sh`).
- Proxmox cluster communication restricted to dedicated management interfaces (`192.168.1.132`).
- Web management interface (port 8006) wrapped behind Caddy reverse proxy with client mTLS verification.

---

<div align="center">

## 3. Cryptographic Baseline & PKI Standards

</div>

1. **Symmetric Cryptography**: AES-256-GCM and ChaCha20-Poly1305 only. Legacy 3DES, DES, and RC4 algorithms are blacklisted across all services.
2. **Asymmetric Cryptography**:
   - SSH Keys: OpenSSH `ed25519` keys only; RSA keys <3072 bits rejected.
   - TLS Certificates: ECDSA (secp256r1 / secp384r1) and RSA 4096-bit for offline Root CA.
3. **Transport Encryption**: TLS 1.3 enforced by default; TLS 1.0, 1.1, and unencrypted HTTP strictly prohibited on external ingress.
4. **Internal PKI**: Smallstep `step-ca` manages short-lived leaf certificates with automated renewal via ACME protocol.

---

<div align="center">

## 4. Secrets Management & Repository Hygiene

</div>

The repository enforces a **Zero-Plaintext Policy**:
- **Automated CI Gates**: Gitleaks and TruffleHog scan every pull request and push in the CI matrix (`.github/workflows/ci.yml`).
- **Storage Standards**:
  - Production passwords, tokens, and private keys reside in local environment files (`.env`) excluded via `.gitignore`.
  - Shared repository secrets use Mozilla SOPS with `age` public-key encryption.
- **Immediate Revocation**: Any key or token detected in repository commit history must be considered instantly compromised and revoked within 60 minutes.

---

<div align="center">

## 5. Detection & Incident Response Infrastructure

</div>

```text
       Security Events (Host Logs, Syslog, Network Packets, Auth Failures)
                                     │
                 ┌───────────────────┴───────────────────┐
                 ▼                                       ▼
       Wazuh HIDS Agents                       Suricata NIDS Engine
     (File Integrity, Sudo, Auth)           (DPI, Snort/Suricata Rules)
                 │                                       │
                 ▼                                       ▼
       Wazuh SIEM Manager (CT 106)              OPNsense Alert Log
                 │                                       │
                 └───────────────────┬───────────────────┘
                                     │
                                     ▼
                          CrowdSec Remediation
                                     │
                 ┌───────────────────┴───────────────────┐
                 ▼                                       ▼
      OPNsense Packet Drop                  Uptime Kuma & ntfy Alert
```

1. **Wazuh HIDS / SIEM Server (CT 106)**:
   - Collects real-time security events, file integrity changes (FIM), and CIS benchmark audit results across all Linux and Windows nodes.
   - Automated Active Response: Repeated SSH brute-force attempts trigger an automated host-level drop rule via iptables.
2. **Suricata Network IDS/IPS (VM 200)**:
   - Deep packet inspection operating inline on the OPNsense perimeter firewall.
   - Active rulesets inspect internal transit and external uplinks for command-and-control (C2) beaconing, SQL injection, and banking malware signatures.
3. **CrowdSec Threat Intelligence**:
   - Ingests consensus threat intelligence from the CrowdSec security community.
   - Bouncers installed on OPNsense proactively block known malicious scanners and residential proxy IP addresses.

---

<div align="center">

## 6. Preventative Zero-Cost Cloud Security Policy

</div>

To prevent unexpected billing liabilities and resource sprawl when staging hybrid cloud architectures:
1. **Free-Tier Static Whitelist**: Terraform configurations in `cloud/aws`, `cloud/gcp`, and `cloud/azure` are restricted to zero-cost instance tiers (`t2.micro`, `t3.micro`, `t4g.small`, `e2-micro`, `Standard_B1s`).
2. **Billable Resource Ban**: NAT Gateways, paid ALBs, provisioned IOPS (`io1`, `io2`), and unattached elastic IPs are strictly prohibited.
3. **Automated CI Enforcement**:
   - Python static analyzer: `python3 scripts/verify_zero_cloud_cost.py` (exit code 0 required).
   - Policy-as-Code: Open Policy Agent (OPA) / Conftest executing [`policy/cloud/zero_cost_policy.rego`](policy/cloud/zero_cost_policy.rego).
4. **Cloud Storage Hygiene**: S3 / GCS buckets must enforce `block_public_acls = true`, `block_public_policy = true`, and default server-side encryption (AES-256).

---

<div align="center">

## 7. Vulnerability & Supply Chain Management

</div>

1. **Static Analysis Security Testing (SAST)**:
   - Trivy scans infrastructure filesystem configs, Dockerfiles, and Terraform modules for known CVEs.
   - Checkov verifies Terraform modules against CIS and cloud security posture benchmarks.
2. **Automated Dependency Updates**:
   - Dependabot actively audits npm, Python, GitHub Actions, and Docker dependencies on a weekly schedule (`.github/dependabot.yml`).
   - Dependabot pull requests require 100% CI check passes prior to merging.

---

<div align="center">

## 8. Responsible Vulnerability Disclosure

</div>

If you discover a potential security vulnerability within this infrastructure codebase, please report it via private disclosure:
- Email: `security@stefanut.lan` / GitHub Security Advisory.
- Please include reproduction steps, affected commit SHA, and remediation suggestions.
- Do not publicly disclose vulnerabilities until a verified patch has been merged.

---

<div align="center">

*Engineered with precision by **Moană Ștefănuț-Cornel** (`@stefanutc1`).*  
*Universitatea din Craiova · Facultatea de Economie și Administrarea Afacerilor (FEAA) · Informatică Economică (2024–2027).*

</div>
