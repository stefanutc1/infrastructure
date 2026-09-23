# Platform Engineering & Contribution Guidelines

## 1. Core Engineering Principles

All contributions to `stefanutc1/infrastructure` must conform to the platform's core architectural tenets:

1. **No Fake Enterprise**: Never simulate artificial complexity. If a tool or architecture is not physically deployed and verified on real hardware, it must be documented as `DECLARED` or `PROPOSED`.
2. **Physical Resource Awareness**: Hardware resources are finite (12GB RAM hypervisor, 2GB RAM storage NAS, 4GB RAM edge worker). All new services must include CPU, RAM, and storage budgets.
3. **Infrastructure as Code (IaC)**: Any change to a hypervisor, container, virtual machine, or firewall rule must be declared in Terraform, Ansible, or Kubernetes manifests before deployment.
4. **Zero-Plaintext Policy**: Never commit plaintext secrets, private keys, or passwords. All commits are scanned via Gitleaks and TruffleHog.

---

## 2. Local Environment Setup & Prerequisites

To develop and validate changes locally:

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

## 3. Pre-Commit Validation & Local Quality Gates

Before opening a pull request, execute the full local validation suite:

```bash
# 1. Run Master Infrastructure Health Doctor
python3 scripts/audit_infrastructure.py

# 2. Run Threat Intelligence & IoC Hygiene Audit
python3 scripts/verify_ioc_hygiene.py
python3 scripts/verify_suricata_rules.py

# 3. Verify Currency & Domain Sync
python3 scripts/sync_currency_conversions.py --check
python3 scripts/sync_forbidden_domains.py --check

# 4. Verify Web Dashboard Build
cd web && npm run build && cd ..
```

---

## 4. Coding & Configuration Standards

### 4.1 Terraform (`terraform/`)
- Formatting: All `.tf` files must pass `terraform fmt -check -recursive`.
- Providers: Use modern `bpg/proxmox` provider syntax for Proxmox resources.
- State: All production state backends utilize S3-compatible remote locking (MinIO / PBS S3 API).

### 4.2 Ansible (`ansible/`)
- Inventory: Single source of truth is `inventory/hosts.yml` (synchronized with `ansible/inventories/homelab/hosts.yml`).
- Playbooks: All playbooks must pass `ansible-playbook --syntax-check`.
- Idempotency: Roles must be completely idempotent; running a playbook twice must yield `changed=0` on the second run.

### 4.3 Kubernetes (`kubernetes/`)
- Schema Validation: All manifests must conform to Kubernetes 1.28+ schemas via `kubeconform`.
- Resource Quotas: Pod deployments must specify explicit `resources.requests` and `resources.limits`.

---

## 5. Commit & Pull Request Workflow

1. **Branching**: Branch off `main` using descriptive prefixes (`feat/`, `fix/`, `docs/`, `sec/`).
2. **Conventional Commits**: Commit messages must follow Conventional Commits specification:
   - `feat(network): add transit link routing for vlan 30`
   - `fix(ansible): correct memory allocation for ollama container`
   - `docs(adr): record decision on storage tiering`
3. **Automated CI Gates**:
   Every pull request triggers the CI pipeline (`.github/workflows/ci.yml`). Merging requires all gates to pass:
   - Secrets Audit (Gitleaks, TruffleHog)
   - Code Quality & Lint (ShellCheck, YAML Lint, Markdown Lint)
   - Threat Intelligence Hygiene & Suricata Syntax
   - Infrastructure Health Doctor (`scripts/audit_infrastructure.py`)
   - Web Frontend Build (`npm run build`)
