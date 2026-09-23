# Infrastructure Takedown & Incident Remediation Record

**Case File Reference:** `SEC-2026-VISH-002`  
**Classification:** `TLP:CLEAR`  
**Incident Type:** Phishing Infrastructure Takedown & Domain Null-Routing  
**Investigation Date:** 10 August 2026  
**Primary Analyst:** `@stefanutc1`  
**Operational Status:** **REMEDIATED / CLOSED**

---

## 1. Executive Summary

This document records the operational lifecycle, registrar escalations, and technical verification steps taken to disrupt and dismantle the malicious infrastructure identified during the **10 August 2026** Revolut impersonation campaign.

Prompt identification of the hosting upstream provider, DNS registrar, and URL shortener APIs enabled a swift response, successfully severing the credential exfiltration pipeline within 4.5 hours of initial detection.

```mermaid
timeline
    title Takedown Chronology & Escalation Milestones
    10:25 UTC : Initial Threat Ingress : Phishing URL extracted from SMS smishing lure
    10:40 UTC : Domain Enumeration : WHOIS lookup, DNS A records, and ASN identification
    11:05 UTC : Abuse Report Filed : High-priority abuse reports submitted to Registrar & Host
    11:30 UTC : DNS Sinkhole Deployed : Host domain null-routed (0.0.0.0) in local Unbound DNS
    12:15 UTC : Upstream Null-Routing : Registrar suspends malicious domain name delegation
    14:45 UTC : Post-Remediation Verification : Worldwide DNS resolution returns NXDOMAIN / Refused
```

---

## 2. Infrastructure Inventory & Threat Attribution

| Indicator | Technical Role | Hosting Provider / ASN | Registrar / DNS Authority | Status |
| :--- | :--- | :--- | :--- | :--- |
| **`rev-verify-app[.]xyz`** | Phishing Web Landing Node | AS20473 (The Constant Company / Vultr) | Namecheap Inc. | **Suspended / Revoked** |
| **`185.220.101.45`** | Asterisk SIP PBX & C2 | AS208294 (Host Europe GmbH) | Dedicated VPS Provider | **IP Blocked & Reported** |
| **`bit.ly/3XXXXXX`** | URL Shortener Redirection | Bitly Enterprise Cloud | Bitly Trust & Safety | **Link Disabled (Warning Page)** |
| **`+40749XXXXXX`** | Spoofed Originating CLI | Domestic Romanian Mobile Allocation | National Telecommunications Authority | **Logged & Flagged** |

---

## 3. Escalation Actions & Multi-Party Coordination

### 3.1. Registrar Abuse Submission (Namecheap Abuse Desk)
- **Ticket Reference:** `NC-ABUSE-2026-0810-772`
- **Submission Evidence:** Raw DOM source code containing cloned Revolut trademarks, exfiltration JavaScript payloads targeting `/api/v2/card/relay`, and live HTTP request headers.
- **Action Taken:** The registrar placed a `clientHold` / `serverHold` status on the `.xyz` domain, dropping DNS authority.

### 3.2. Bitly Link Disablement
- A malicious redirect report was submitted via the Bitly abuse reporting API. The URL shortener service disabled the shortlink within 35 minutes, routing subsequent visitors to an automated Bitly malicious activity advisory screen.

### 3.3. National CSIRT Notification (DNSC Romania)
- An incident briefing containing the spoofed telephony range, phishing FQDN, and associated IP addresses was submitted to the **National Cyber Security Directorate (DNSC)** for regional distribution across Romanian telecom and banking threat feeds.

---

## 4. Verification & Validation Protocol

Following confirmed mitigation from upstream authorities, recursive DNS resolution tests were executed from the isolated research VM and independent external probes:

```bash
# Querying authoritative nameservers for phishing domain
dig @8.8.8.8 rev-verify-app.xyz A +short

# Output:
# (Null response - Domain delegation suspended, status: NXDOMAIN)

# Verifying HTTP response code via curl
curl -I https://rev-verify-app.xyz/ --connect-timeout 5

# Output:
# curl: (6) Could not resolve host: rev-verify-app.xyz
```

---

## 5. Strategic Lessons & Homelab Takeaways

1. **Shortened TTL Vulnerability:** Threat actors frequently leverage free or low-cost TLDs with ultra-short TTLs to rapidly evade blacklists. Automated perimeter sinkholing in Unbound DNS (`0.0.0.0`) provides immediate local protection before global registrars act.
2. **Telemetry Preservation:** Freezing local DOM captures and network HAR files before triggering abuse reports ensures evidence integrity for law enforcement and banking fraud investigations.
