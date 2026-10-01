# Keycloak Enterprise Identity & Access Management (IAM)

<div align="center">

[![Service](https://img.shields.io/badge/Service-Keycloak%20IAM%20Enterprise-0f172a.svg?style=flat&logo=keycloak)](#)
[![Port](https://img.shields.io/badge/Port-8484%2FTCP-blue.svg?style=flat)](#)
[![Protocol](https://img.shields.io/badge/Protocols-OIDC%20%7C%20OAuth%202.0%20%7C%20SAML-10b981.svg?style=flat&logo=openid)](#)
[![Federation](https://img.shields.io/badge/User%20Federation-Active%20Directory%20LDAP-0078d4.svg?style=flat&logo=windows)](#)

</div>

---

## Executive Summary

Keycloak provides enterprise identity federation, Single Sign-On (SSO), and role-based access control (RBAC) across the homelab infrastructure. It bridges legacy directory services in **Active Directory Domain Services (AD DS)** with modern web applications through **OpenID Connect (OIDC)**, **OAuth 2.0**, and **SAML 2.0** profiles.

---

## 1. Architectural Topology & Federation Pipeline

```mermaid
flowchart LR
    subgraph AD_FOREST["Active Directory Forest (VM 400)"]
        DC["Windows Server 2025 DC<br/>ad2025.lan (192.168.1.130)<br/>LDAP :389 / LDAPS :636"]
    end

    subgraph IAM_TIER["Identity & Access Management"]
        KC["Keycloak IAM Server<br/>Port 8484/TCP<br/>Quarkus Runtime"]
        DB["PostgreSQL 16 DB<br/>Relational Realm Store"]
    end

    subgraph APP_TIER["Consuming Internal Applications"]
        APP1["Harbor OCI Registry"]
        APP2["Argo CD GitOps"]
        APP3["Grafana Observability"]
        APP4["Nextcloud Hub"]
        APP5["NetBox DCIM/IPAM"]
    end

    DC <-->|"LDAP User Federation (Read-Only / Kerberos)"| KC
    KC <--> DB
    KC -->|"OIDC Tokens / JWT Bearer"| APP1 & APP2 & APP3 & APP4 & APP5
```

---

## 2. Active Directory Domain Services (AD DS) Integration

To federate users and security groups from the Windows Server Domain Controller:

1. Access the Keycloak administration console at `http://<HOST_IP>:8484`.
2. Navigate to **User Federation** -> **Add LDAP provider**.
3. Configure the following connection parameters:
   - **Console Vendor**: Active Directory
   - **Connection URL**: `ldap://192.168.1.130:389` (or `ldaps://192.168.1.130:636`)
   - **Users DN**: `CN=Users,DC=infrastructure,DC=lan`
   - **Bind DN**: `CN=Administrator,CN=Users,DC=infrastructure,DC=lan`
   - **Edit Mode**: `READ_ONLY` (or `UNSYNCED` for test writebacks)
   - **Periodic Changed Users Sync**: Enabled (interval: 300s)

All domain users and security groups automatically populate Keycloak realms, enabling unified credentials and multi-factor authentication (TOTP/WebAuthn) for downstream services.

---

## 3. Deployment Runbook

```bash
# 1. Prepare environment variables
cp .env.example .env

# 2. Configure administrative credentials and database secrets
# KEYCLOAK_ADMIN=<admin_username>
# KEYCLOAK_ADMIN_PASSWORD=<secure_password>

# 3. Start container stack
docker compose up -d

# 4. Verify endpoint health
curl -s http://127.0.0.1:8484/health/ready
```
