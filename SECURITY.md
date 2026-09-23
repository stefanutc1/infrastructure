# Enterprise Security Policy, Threat Model & Defense Baseline

## Executive Summary
This document establishes the comprehensive cybersecurity posture, threat models, hardening benchmarks, cryptographic policies, and detection-and-response procedures for the `stefanutc1/infrastructure` platform. Built on the tenets of **Defense-in-Depth**, **Least Privilege**, and **Zero Trust Architecture**, the platform protects production assets while safely facilitating offensive cyber research and malware analysis.

---

## 1. STRIDE Threat Model & Attack Surface Analysis

| Threat Category (STRIDE) | Potential Attack Vector | Platform Mitigations & Technical Controls |
| :--- | :--- | :--- |
| **Spoofing Identity** | Unauthorized operator access via stolen SSH or WebGUI credentials. | Mandatory ed25519 SSH keys; password auth disabled; Caddy mTLS client certificate authentication for administrative portals. |
| **Tampering with Data** | Modification of financial ledger database or DNS poison attacks. | PostgreSQL SSL/SCRAM-SHA-256; DNSSEC validation on Unbound DNS; ZFS cryptographic checksumming. |
| **Repudiation** | An operator or compromised service denies executing destructive commands. | Centralized Wazuh SIEM audit logging; immutable syslog forwarding; Git signed commits (`commitlint`). |
| **Information Disclosure** | Leakage of API tokens, private keys, or passwords committed to Git. | Pre-commit hooks (`.pre-commit-config.yaml`); automated Gitleaks & TruffleHog CI scanning; SOPS/age encrypted parameter storage. |
| **Denial of Service (DoS)** | SYN floods, brute-force floods, or malicious bandwidth saturation. | TCP SYN Cookies enabled; CrowdSec firewall bouncers; Suricata rate-limiting; OPNsense state tracking. |
| **Elevation of Privilege** | Container escape from untrusted LXC or web application exploit. | Default unprivileged LXC containers (`UID 100000+`); AppArmor profiles; restrictive sudoers (`Defaults env_reset`). |

---

## 2. Hardening Benchmarks & System Compliance

### 2.1 Linux Operating System Hardening
All physical hypervisors, virtual machines, and container runtimes conform to the **CIS Linux Benchmark Level 1 Server Baseline** (see [`docs/security/cis_hardening_baseline.md`](file:///Users/s3nnnzzzatyeeee/stefannut_repos/datacenter/docs/security/cis_hardening_baseline.md)):
- Reverse Path Filtering (`rp_filter = 1`) enforced to eliminate IP spoofing.
- ICMP redirects and source-routed packets unconditionally dropped.
- Address Space Layout Randomization (ASLR) enforced at maximum entropy (`kernel.randomize_va_space = 2`).
- Kernel `dmesg` restrictions active (`kernel.dmesg_restrict = 1`).
- Filesystem permission auditing: `/etc/shadow` restricted to `0600`, `/etc/sudoers` to `0440`.

### 2.2 Proxmox VE Hypervisor Hardening
- Commercial enterprise repository nag disabled via clean automation (`scripts/pve-remove-nag.sh`).
- Proxmox cluster communication restricted to dedicated management interfaces (`192.168.1.132`).
- Web management interface (port 8006) wrapped behind Caddy reverse proxy with client mTLS verification.

---

## 3. Cryptographic Baseline & PKI Standards

1. **Symmetric Cryptography**: AES-256-GCM and ChaCha20-Poly1305 only. Legacy 3DES, DES, and RC4 algorithms are blacklisted across all services.
2. **Asymmetric Cryptography**:
   - SSH Keys: OpenSSH `ed25519` keys only; RSA keys <3072 bits rejected.
   - TLS Certificates: ECDSA (secp256r1 / secp384r1) and RSA 4096-bit for offline Root CA.
3. **Transport Encryption**: TLS 1.3 enforced by default; TLS 1.0, 1.1, and unencrypted HTTP strictly prohibited on external ingress.
4. **Internal PKI**: Smallstep `step-ca` manages short-lived leaf certificates with automated renewal via ACME protocol.

---

## 4. Secrets Management & Repository Hygiene

The repository enforces a **Zero-Plaintext Policy**:
- **Scanning Gates**: Gitleaks and TruffleHog scan every pull request and push in the CI matrix (`.github/workflows/ci.yml`).
- **Storage Standards**:
  - Production passwords, tokens, and private keys reside in local environment files (`.env`) excluded via `.gitignore`.
  - Shared repository secrets use Mozilla SOPS with `age` public-key encryption.
- **Immediate Revocation**: Any key or token detected in repository commit history must be considered instantly compromised and revoked within 60 minutes.

---

## 5. Detection & Incident Response Infrastructure

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

1. **Wazuh HIDS Server (CT 106)**:
   - Collects real-time security events, file integrity changes (FIM), and CIS benchmark audit results across all Linux and Windows nodes.
   - Automated Active Response: Repeated SSH brute-force attempts trigger an automated host-level drop rule via iptables.
2. **Suricata Network IDS/IPS (VM 200)**:
   - Deep packet inspection operating inline on the OPNsense perimeter firewall.
   - Active rulesets inspect internal transit and external uplinks for command-and-control (C2) beaconing, SQL injection, and banking malware signatures.
3. **CrowdSec Threat Intelligence**:
   - Ingests consensus threat intelligence from the CrowdSec security community.
   - Bouncers installed on OPNsense proactively block known malicious scanners and residential proxy IP addresses.

---

## 6. Vulnerability & Supply Chain Management

1. **Static Analysis Security Testing (SAST)**:
   - Trivy scans infrastructure filesystem configs, Dockerfiles, and Terraform modules for known CVEs.
   - Checkov verifies Terraform modules against CIS and cloud security posture benchmarks.
2. **Automated Dependency Updates**:
   - Dependabot actively audits npm, Python, GitHub Actions, and Docker dependencies on a weekly schedule (`.github/dependabot.yml`).
   - Dependabot pull requests require 100% CI check passes prior to merging.

---

## 7. Responsible Vulnerability Disclosure

If you discover a potential security vulnerability within this infrastructure codebase, please report it via private disclosure:
- Email: `security@stefanut.lan` / GitHub Security Advisory.
- Please include reproduction steps, affected commit SHA, and remediation suggestions.
- Do not publicly disclose vulnerabilities until a verified patch has been merged.
