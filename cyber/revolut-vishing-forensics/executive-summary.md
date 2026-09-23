# Executive Intelligence Briefing: Revolut Vishing & Credential Relay

**Case File Reference:** `SEC-2026-VISH-002`  
**Classification:** `TLP:CLEAR`  
**Incident Type:** Social Engineering, Voice Phishing (Vishing) & Real-Time Credential Relay  
**Investigation Date:** 10 August 2026  
**Primary Analyst:** `@stefanutc1`  
**Target Entity:** FinTech Consumers (Revolut Bank UAB) · Romanian Market

<div align="center">

[![Threat Level](https://img.shields.io/badge/Threat%20Level-HIGH-orange.svg?style=flat&logo=alert)](#)
[![MITRE ATT&CK](https://img.shields.io/badge/MITRE-T1566.004%20%7C%20T1556%20%7C%20T1056.001-blue.svg?style=flat&logo=target)](#)
[![Remediation Status](https://img.shields.io/badge/Status-Mitigated%20%26%20Takedown%20Closed-brightgreen.svg?style=flat&logo=checkmarx)](#)

</div>

---

## 1. Incident Overview & Impact Assessment

On **10 August 2026**, a coordinated Voice Phishing (Vishing) campaign targeted mobile banking consumers across Romania. Threat actors executed automated outbound telephone calls utilizing VoIP Caller ID spoofing within the Romanian mobile allocation space (`0749-XXX-XXX`). 

Impersonating official Revolut Anti-Fraud personnel, the attackers manufactured synthetic panic by claiming the user's account had been compromised by a pending high-value international transaction or negative balance liquidation. Targets were coerced into accessing disposable web phishing portals designed to harvest full card telemetry (Primary Account Numbers, CVVs, expiration dates) and intercept real-time One-Time Passwords (OTP) and 3D Secure verification codes.

### Key Executive Metrics
| Dimension | Value | Operational Context |
| :--- | :--- | :--- |
| **Ingress Channel** | Voice Call (VoIP SIP Trunk) | Spoofed Romanian mobile CLI (`0749-XXX-XXX`) |
| **Secondary Channel** | SMS / URL Shorteners | Shortened redirection chains masking disposable domains (`.tk`, `.xyz`) |
| **Harvested Assets** | Card PAN, CVV, Exp, SMS OTP | Real-time relay into attacker-automated banking API sessions |
| **Potential Loss** | Uncapped Account Balance | Prevented via rapid call termination and app security triage |
| **National Escalation** | DNSC & Revolut Fraud Operations | Telephony and infrastructure IoCs submitted for regional blacklisting |

---

## 2. High-Level Attack Timeline

```mermaid
timeline
    title Incident Lifecycle: SEC-2026-VISH-002 (10 August 2026)
    10:15 UTC : Threat Ingress : Outbound spoofed call received from +40749-XXX-XXX
    10:18 UTC : Social Engineering : Attacker pretexts as Revolut Fraud Staff claiming urgent unauthorized charges
    10:22 UTC : Delivery Vector : SMS received containing shortened link to cloned payment landing portal
    10:25 UTC : Technical Triage : Sandboxed browser inspection of landing page; DOM cloning & SSL cert verified
    10:35 UTC : Defensive Severance : Call terminated; native Revolut in-app support contacted; cards frozen
    11:00 UTC : Takedown & Telemetry : IoCs compiled; abuse reports filed with registrar and DNSC
    14:30 UTC : Remediation Complete : Registrar null-routes phishing domain; Revolut security validates account safety
```

---

## 3. Threat Actor Profile & Capabilities

- **Telephony Ingress:** Access to commercial SIP trunking providers with permissive Caller ID header injection (`P-Asserted-Identity`), enabling spoofed domestic mobile prefixes.
- **Dynamic Web Engineering:** Utilization of automated web scraping frameworks to deploy pixel-perfect clones of Revolut's web authentication and card management interfaces.
- **Real-Time Token Harvesting:** Deployment of reverse-proxy C2 architectures capable of maintaining active user sessions and requesting two-factor verification codes synchronously while the victim is engaged on the voice call.

---

## 4. Remediation & Strategic Defense

1. **Zero-Trust Communication Policy:** Financial institutions never contact customers via voice to request payment card CVVs, SMS one-time passwords, or in-app biometric approvals.
2. **Homelab Perimeter Defense:** All identified domains and IP addresses were immediately appended to [`cyber/forbidden_domains.txt`](../forbidden_domains.txt) and sinkholed on the OPNsense perimeter router (`192.168.1.134`).
3. **Cross-Reference Documentation:**
   - Full technical breakdown: [`technical-analysis.md`](technical-analysis.md)
   - Formal banking incident disclosure: [`revolut-report.md`](revolut-report.md)
   - Revolut security response log: [`revolut-response.md`](revolut-response.md)
   - Domain takedown record: [`takedown.md`](takedown.md)
