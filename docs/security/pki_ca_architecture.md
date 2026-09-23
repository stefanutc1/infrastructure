# Security Specification: Public Key Infrastructure (PKI) & Internal CA

## Objective
Establish an automated, secure internal Public Key Infrastructure (PKI) to enforce cryptographic transport security (TLS 1.3) and Mutual TLS (mTLS) authentication across all internal services, APIs, and administrative endpoints within the `.lan` and `stefanut.lan` namespaces.

---

## 1. PKI Hierarchy

```text
               ┌───────────────────────────────┐
               │    Offline Root CA (4096 RSA) │
               │     Validity: 10 Years        │
               └───────────────┬───────────────┘
                               │ (Issues Intermediate Certificate)
                               ▼
               ┌───────────────────────────────┐
               │  Step-CA Intermediate CA      │
               │  (ECDSA P-384 / ED25519)      │
               │      Validity: 2 Years        │
               └───────────────┬───────────────┘
                               │
         ┌─────────────────────┼─────────────────────┐
         ▼                     ▼                     ▼
┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐
│ Server Endpoints│   │ Client mTLS     │   │ WireGuard VPN   │
│  (Caddy, PVE)   │   │ Certificates    │   │ Peers & Tunnels │
│  Validity: 90d  │   │  Validity: 30d  │   │ Static Rotated  │
└─────────────────┘   └─────────────────┘   └─────────────────┘
```

---

## 2. Certificate Authority Engine (Step-CA)
- **Engine**: Smallstep `step-ca` deployed in an unprivileged container or standalone daemon.
- **Root CA Storage**: The Root CA private key is kept offline, encrypted with AES-256-GCM.
- **Intermediate CA**: Runs online, signing short-lived end-entity certificates.
- **Protocol Support**:
  - ACME (RFC 8555) for automated internal certificate issuance to Caddy and Proxmox.
  - SCEP (Simple Certificate Enrollment Protocol) for client device enrollment.

---

## 3. Mutual TLS (mTLS) Ingress Gateway
Internal administrative endpoints require both server authentication and client certificate presentation:

```text
Operator Client Browser ──[Client Cert Presentation]──> Caddy Reverse Proxy
                                                               │
                                                 (Validates Client Cert against CA)
                                                               │
                                              ┌────────────────┼────────────────┐
                                              ▼                ▼                ▼
                                         Proxmox API      OPNsense GUI      Wazuh SIEM
                                        (Port 8006)      (Port 8443)      (Port 55000)
```

### Caddyfile mTLS Configuration (`services/caddy-mtls/Caddyfile`)
```caddy
pve.lan:8443 {
    tls {
        ca_root /etc/ssl/certs/internal_root_ca.crt
        client_auth {
            mode require_and_verify
            trusted_ca_cert_file /etc/ssl/certs/internal_intermediate_ca.crt
        }
    }
    reverse_proxy https://192.168.1.132:8006 {
        transport http {
            tls_insecure_skip_verify
        }
    }
}
```

---

## 4. Key Rotation & Expiration Policies
| Certificate Type | Key Algorithm | Expiration | Automated Renewal |
| :--- | :--- | :--- | :--- |
| **Offline Root CA** | RSA 4096 | 10 Years | Manual Air-Gapped Ceremony |
| **Intermediate CA** | ECDSA P-384 | 2 Years | Semi-Automated (Annual) |
| **Server Certificates** | ECDSA P-256 | 90 Days | ACME Automated (Day 60) |
| **Client mTLS Certs** | ED25519 / P-256 | 30 Days | Step CLI Automated Renewal |
| **WireGuard Keys** | Curve25519 | 90 Days | Scripted (`wireguard_key_rotation.sh`) |

---

## 5. Revocation & Incident Response
- **CRL (Certificate Revocation List)**: Published and updated every 24 hours at `http://ca.lan/crl.pem`.
- **Compromise Procedure**: Immediate revocation of compromised leaf certificate using `step ca revoke <serial-number>` followed by reloading Caddy reverse proxy daemon.
