<div align="center">

# Platform Engineering & Contribution Guidelines

</div>

<div align="center">

[![Engineering](https://img.shields.io/badge/Engineering-Platform%20Contribution%20Standards-0f172a.svg?style=flat&logo=git)](#)
[![Code Quality](https://img.shields.io/badge/CI%20Gates-Lint%20%7C%20Security%20%7C%20Audit-10b981.svg?style=flat&logo=githubactions)](.github/workflows/ci.yml)
[![Zero-Cost](https://img.shields.io/badge/Cloud%20Policy-%240.00%20Strict%20Free--Tier-059669.svg?style=flat&logo=terraform)](policy/cloud/zero_cost_policy.rego)
[![Edge IoT](https://img.shields.io/badge/Firmware-ESP32%20Bare--Metal%20C%2B%2B-e7352c.svg?style=flat&logo=espressif)](esp32/README.md)
[![Author](https://img.shields.io/badge/Principal%20Maintainer-Moan%C4%83%20%C8%98tef%C4%83nu%C8%9B--Cornel-blue.svg?style=flat&logo=github)](https://github.com/stefanutc1)
[![University](https://img.shields.io/badge/University-Universitatea%20din%20Craiova%20%C2%B7%20FEAA-0284c7.svg?style=flat&logo=academia)](https://feaa.ucv.ro)

</div>

---

<div align="center">

## 1. Core Engineering Principles

</div>

All contributions to the `stefanutc1/infrastructure` platform must strictly conform to these engineering principles:

1. **"No Fake Enterprise"**: Never simulate artificial complexity. If a tool or architecture is not physically deployed and verified on real hardware, it must be documented as `DECLARED` or `PROPOSED`.
2. **Physical Resource Awareness**: Hardware resources are strictly bounded (12 GB RAM hypervisor, 2 GB RAM storage NAS, 4 GB RAM edge worker). All proposed services must include explicit CPU, RAM, and storage budgets.
3. **Infrastructure as Code (IaC)**: Any modification to a hypervisor, container, virtual machine, or firewall rule must be declared in Terraform, Ansible, or Kubernetes manifests before execution.
4. **Zero-Plaintext Policy**: Never commit plaintext secrets, private keys, or passwords. All commits are continuously scanned via Gitleaks and TruffleHog.
5. **Zero-Cost Cloud Guardrails**: Multi-cloud staging resources in AWS, GCP, and Azure must operate strictly within verified free-tier limits ($0.00 monthly cost). Paid NAT gateways, provisioned IOPS, and paid load balancers are strictly prohibited.
6. **English Documentation Standard**: All technical documentation, runbooks, architecture decision records, and commit messages across the repository must be authored in professional English.

---

<div align="center">

## 2. Local Environment Setup & Prerequisites

</div>

To develop, validate, and test changes locally:

```bash
# 1. Clone repository
git clone https://github.com/stefanutc1/infrastructure.git
cd infrastructure

# 2. Install Python validation dependencies
python3 -m pip install -r requirements-dev.txt

# 3. Setup pre-commit hooks
pre-commit install
```

---

<div align="center">

## 3. Pre-Commit Validation & Local Quality Gates

</div>

Before opening a pull request or pushing to `main`, execute the complete local verification suite:

```bash
# 1. Run Master Infrastructure Health Doctor
python3 scripts/audit_infrastructure.py

# 2. Verify ESP32 Edge Firmware Sketches & Configs
python3 scripts/verify_esp32_firmware.py

# 3. Verify Zero-Cost Cloud Static Compliance
python3 scripts/verify_zero_cloud_cost.py

# 4. Verify Threat Intelligence & Suricata Rule Syntax
python3 scripts/verify_ioc_hygiene.py
python3 scripts/verify_suricata_rules.py

# 5. Verify Currency & Forbidden Domain Sync
python3 scripts/sync_currency_conversions.py --check
python3 scripts/sync_forbidden_domains.py --check

# 6. Verify Web Dashboard Build
cd web && npm run build && cd ..
```

---

<div align="center">

## 4. Coding & Configuration Standards

</div>

<div align="center">

### 4.1 Terraform (`terraform/` & `cloud/`)

</div>
- Formatting: All `.tf` files must pass `terraform fmt -check -recursive`.
- Providers: Use modern `bpg/proxmox` provider syntax for Proxmox resources.
- Cost Guardrails: Any cloud instance must be whitelisted in `scripts/verify_zero_cloud_cost.py`.
- State: Production state backends utilize S3-compatible remote locking (MinIO / PBS S3 API).

<div align="center">

### 4.2 Ansible (`ansible/`)

</div>
- Inventory: Single source of truth is `inventory/hosts.yml` (synchronized with `ansible/inventories/homelab/hosts.yml`).
- Playbooks: All playbooks must pass `ansible-playbook --syntax-check`.
- Idempotency: Roles must be completely idempotent; running a playbook twice must yield `changed=0` on the second run.

<div align="center">

### 4.3 ESP32 Edge Firmware (`esp32/`)

</div>
- Language: Bare-metal C++ using the Arduino ESP32 Core.
- Safety: Every project sketch must implement a Hardware Watchdog Timer (WDT) and non-blocking sensor sampling.
- Configuration: Wi-Fi credentials, MQTT topics, and GPIO pinouts must be encapsulated cleanly in a dedicated `config.h`.

<div align="center">

### 4.4 Kubernetes (`kubernetes/`)

</div>
- Schema Validation: All manifests must conform to Kubernetes 1.28+ schemas via `kubeconform`.
- Resource Quotas: Pod deployments must specify explicit `resources.requests` and `resources.limits`.

---

<div align="center">

## 5. Commit & Pull Request Workflow

</div>

1. **Branching**: Branch off `main` using descriptive prefixes (`feat/`, `fix/`, `docs/`, `sec/`, `esp32/`).
2. **Conventional Commits**: Commit messages must follow the Conventional Commits specification:
   - `feat(esp32): add prometheus metrics exporter to power monitor`
   - `fix(cloud): enforce t3.micro free tier instance in aws prod`
   - `docs(adr): document zero-cost cloud architecture decision`
3. **Automated CI Gates**:
   Every pull request triggers the CI pipeline (`.github/workflows/ci.yml`). Merging requires all gates to pass:
   - Secrets Audit (Gitleaks, TruffleHog)
   - Code Quality & Lint (ShellCheck, YAML Lint, Markdown Lint)
   - ESP32 Firmware Static Audit (`scripts/verify_esp32_firmware.py`)
   - Cloud Zero-Cost Guardrails (`scripts/verify_zero_cloud_cost.py` & OPA Conftest)
   - Threat Intelligence Hygiene & Suricata Syntax
   - Infrastructure Health Doctor (`scripts/audit_infrastructure.py`)
   - Web Frontend Build (`npm run build`)

---

<div align="center">

*Engineered with precision by **Moană Ștefănuț-Cornel** (`@stefanutc1`).*  
*Universitatea din Craiova · Facultatea de Economie și Administrarea Afacerilor (FEAA) · Informatică Economică (2024–2027).*

</div>
