# ADR-0005: Ingress mTLS / OAuth2-Proxy & On-Demand Active Directory Research Lab

## Status
**Accepted**

## Context
Enterprise identity architectures frequently employ heavy identity providers (IdPs) such as Keycloak, Authentik, or FreeIPA.
Keycloak, running on Quarkus/JVM, requires a continuous baseline of 1.5GB to 2.5GB of RAM to maintain its JVM heap, database connection pool, and identity caches.
Authentik similarly requires multiple containers (server, worker, redis, postgresql) demanding 1GB+ RAM.

On Node 1 with 12GB total RAM, dedicating 2GB RAM 24/7 to a continuous enterprise IdP would starve memory-intensive core services like Ollama AI (2GB) and Wazuh SIEM (1.5GB).

Simultaneously, the laboratory must support in-depth academic cybersecurity research involving enterprise directory attacks:
- Kerberoasting, AS-REP roasting, DCSync, Pass-the-Hash, Silver/Golden Ticket attacks.
- BloodHound graph visualization of Active Directory attack paths.
- Active Directory cross-version domain migration scenarios spanning Windows Server 2008 R2 through Windows Server 2025.

## Decision
We decouple **Production Ingress Authentication** from the **Active Directory Cybersecurity Research Laboratory**:

1. **Production Runtime Authentication**:
   - **Mutual TLS (mTLS)** via Caddy reverse proxy for high-security administrative endpoints (`/admin`, Proxmox PVE API, OPNsense WebGUI).
   - Lightweight **OAuth2-Proxy / Authelia** blueprint for services requiring web-based single sign-on (consuming <100MB RAM).
   - SSH authentication enforced strictly via ed25519 public keys with root password authentication disabled.
2. **On-Demand Active Directory Research Lab**:
   - The multi-VM Windows Server forest (VMs 400 to 410) is declared in Terraform (`ad_lab.tf`) and Ansible, but configured in an **On-Demand Spin-Up State** (`state: declared-on-demand`).
   - VMs are booted selectively in pairs (e.g., VM 401 AD2022 + VM 406 Win10 Client) during dedicated offensive/defensive research drills, consuming RAM only when actively engaged in study.

## Consequences

### Positive
- **RAM Preservation**: Reclaims >2GB RAM during normal 24/7 operations for production workloads and AI inference.
- **Deep Research Capability**: Preserves full access to genuine multi-tier Windows Server Active Directory forests for academic penetration testing and digital forensics.
- **Attack Surface Minimization**: Production management endpoints are not exposed to complex web-based IdP vulnerability surfaces (e.g., SAML/OIDC implementation flaws).

### Negative
- **Lack of Unified Central Directory for Homelab**: Homelab microservices use local authentication credentials rather than a centralized LDAP directory during normal operations.
- **Manual Lab Spin-Up**: Research sessions require running `scripts/ad-lab-start.sh` rather than having the domain controllers persistently reachable.
