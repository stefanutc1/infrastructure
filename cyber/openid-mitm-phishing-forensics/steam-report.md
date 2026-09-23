# Valve Security Incident Disclosure: BitM Steam OpenID Credential Phishing

**Case File Reference:** `SEC-2025-AITM-004`  
**Classification:** `TLP:CLEAR`  
**Target Authority:** Valve Corporation Security & Abuse Team (`security@valvesoftware.com` / HackerOne)  
**Submission Date:** 22 November 2025  
**Primary Analyst:** `@stefanutc1`  
**Category:** Account Takeover, Browser-in-the-Middle (BitM), Unauthorized Family View Persistence & Web API Key Abuse

---

## 1. Executive Disclosure Overview

To the Valve Corporation Security Team,

This report details an active, sophisticated Adversary-in-the-Middle (AiTM) campaign weaponizing simulated Browser-in-the-Middle (BitM) authentication windows to harvest Steam credentials, bypass Steam Guard two-factor authentication, and establish persistent backdoors via the Steam Web API and Family View PIN locks.

Testing was strictly confined to an isolated, air-gapped laboratory environment utilizing synthetic, throwaway accounts registered exclusively for forensic telemetry collection.

```mermaid
flowchart LR
    VALVE_SEC["Valve Security & Abuse"] <--|"Formal Incident Telemetry Package"| DISCLOSURE["Security Disclosure Filing"]
    DISCLOSURE --> IOCS["Malicious Domain: cs2-tournament-bracket[.]top<br/>C2 IP: 194.38.20.182"]
    DISCLOSURE --> EXPLOIT["Exploitation Mechanism:<br/>BitM In-DOM Window + OpenID Relay"]
    DISCLOSURE --> REC["Remediation Proposals:<br/>Family View Grace Period & In-App Web API Alerts"]
```

---

## 2. Technical Evidence & Infrastructure Indicators

### 2.1. Phishing & Reverse-Proxy Indicators
- **Primary Phishing FQDN:** `cs2-tournament-bracket[.]top`
- **Hosting Provider & ASN:** AS202425 (IP Volume Inc.)
- **Origin IP Address:** `194.38.20.182`
- **SSL Certificate Fingerprint:** `SHA256: 4e82b7d81a9...` (Issued by Let's Encrypt Authority X3)
- **Ingress Relay URI:** `POST https://cs2-tournament-bracket.top/api/v2/auth/steam_callback`

### 2.2. Threat Actor Modus Operandi
1. **In-Page DOM Emulation:** The phishing page injects an in-DOM draggable window styled to replicate Google Chrome running on Windows 11, complete with a faux address bar displaying `https://steamcommunity.com/openid/login`.
2. **Synchronous Session Extraction:** Attacker infrastructure acts as an automated proxy, capturing `steamLoginSecure` and `sessionid` cookies.
3. **Immediate Account Lockdown:** Within 15 seconds of token acquisition, automated scripts call Steam's internal parental control endpoints (`/parental/ajaxsetparental`) to bind an unauthorized 4-digit PIN, effectively locking the genuine user out of changing passwords or recovering their account.
4. **Trade Offer Hijacking via Web API:** The script provisions a rogue API key at `steamcommunity.com/dev/registerkey` to monitor and intercept high-value CS2 weapon skins and items.

---

## 3. Recommended Platform Countermeasures

To mitigate the systemic abuse of Steam OpenID and post-exploitation mechanisms, we submit the following platform-level security enhancements for Valve's engineering review:

### 3.1. Out-of-Band Notification for New Family View Locks
- **Current Behavior:** Family View can be established silently using an existing authenticated web session without triggering a re-authentication challenge or email confirmation.
- **Proposed Enhancement:** Require an email confirmation link or a 12-hour cooling-off grace period before newly configured Family View PINs become active, preventing attackers from immediately locking out victims.

### 3.2. Mandatory Steam Mobile Push for API Key Registration
- Whenever a Steam Web API Key is registered at `/dev/registerkey`, trigger a high-priority push notification and biometric confirmation prompt via the Steam Mobile App.

### 3.3. OpenID Single Sign-On Context Binding
- Legitimate OpenID authentication flows should never require manual username/password entry if the user already has an active, authenticated session in the client or browser. The Steam community login should clearly alert users if an external site attempts to solicit raw login credentials directly.

---

## 4. Submission & Resolution Tracking

- **Date Submitted:** 22 November 2025
- **Status:** Acknowledged by Security Triage; domain suspended by upstream registrar; threat indicators incorporated into global gaming blocklists.
