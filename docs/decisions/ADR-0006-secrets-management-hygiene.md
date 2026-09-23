# ADR-0006: GitOps Zero-Plaintext Secret Hygiene & SOPS/Age Ingestion

## Status
**Accepted**

## Context
Deploying an enterprise secrets vault (such as HashiCorp Vault in high-availability mode or CyberArk) in a homelab environment introduces immense operational complexity:
- Vault consumes 500MB–1GB RAM and requires complex unseal key ceremonies (Shamir's secret sharing) upon every system reboot.
- If the unseal orchestration fails during an unattended cold-boot sequence, all downstream microservices fail to retrieve database passwords and crash.

Simultaneously, storing plaintext secrets (API tokens, private keys, database passwords, WireGuard pre-shared keys) within a public or shared Git repository presents severe security vulnerabilities and triggers secret leakage alerts.

## Decision
We enforce a **Zero-Plaintext GitOps Secrets Strategy** combining static pre-commit enforcement, encrypted declarative parameters, and runtime environment variable injection:

1. **Pre-Commit & CI Leak Prevention**:
   - Gitleaks (`.gitleaks.toml`) and TruffleHog run on every Git commit, pull request, and CI workflow run.
   - Any commit containing unencrypted private keys, cloud tokens, or hardcoded passwords fails the security gate.
2. **Encrypted Parameters via SOPS + Age**:
   - Declarative secrets committed to Git are encrypted using Mozilla SOPS with modern `age` public-key encryption.
   - Decryption keys reside outside Git in protected host filesystems (`/etc/homelab/age-key.txt`) with `chmod 0600`.
3. **Runtime Ingestion**:
   - Production Docker Compose services ingest credentials via environment variables (`${DB_PASSWORD}`) populated from local `.env` files that are strictly `.gitignore`d.
   - Example configuration templates (`.env.example`, `terraform.tfvars.example`) are provided with dummy placeholder values.

## Consequences

### Positive
- **Zero Memory Overhead**: Eliminates the persistent memory and CPU overhead of running a dedicated HashiCorp Vault daemon.
- **Unattended Cold-Boot Resilience**: Microservices start deterministically upon power restoration without requiring interactive unsealing.
- **Auditable Security**: Static scanning guarantees that no sensitive secrets ever enter repository commit history.

### Negative
- **Dynamic Secret Rotation Limitation**: Does not support automated short-lived dynamic credentials (e.g., automatically generating transient database users every hour).
- **Manual Age Key Distribution**: The `age` secret key must be securely backed up off-repo and manually placed on new bare-metal hosts during disaster recovery.
