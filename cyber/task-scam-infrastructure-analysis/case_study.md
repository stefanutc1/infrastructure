<div align="center">

# Case Study: Forensic Deconstruction of a Fraudulent Task Scam & Cryptocurrency Drainage Platform

</div>

**Author:** @stefanutc1 
**Date:** 17 April 2026 
**Classification:** TLP:CLEAR / Technical Cyber Threat Intelligence 
**Target Analyzed:** Forensic teardown of backend API exposure, client-side UI manipulation, and financial entrapment mechanisms in a global Task Scam / Pig Butchering platform.

---

<div align="center">

## 1. Executive Summary

</div>

This case study documents the comprehensive forensic reverse engineering of an active **Task Scam** platform (a hybrid Pig Butchering investment fraud operation). Fraud rings recruit victims via WhatsApp and Telegram under the pretext of flexible remote work evaluating products for major e-commerce platforms.

Through traffic interception (Burp Suite) and API endpoint analysis, this investigation exposed hard technical proof of premeditated financial theft:
- The `/api/v1/site/config` endpoint contained a **hardcoded withdrawal kill-switch** (`withdrawMethodBank: false`, `withdrawMethodRevolut: false`), confirming that all fiat withdrawal UI elements were non-functional cosmetic decoys.
- Strict geographic campaign locks targeting Romanian mobile numbers (`defaultCountryCode: "+40"`).
- Systemic backend security vulnerabilities, including unauthenticated configuration disclosure and SQL Injection surfaces.

---

<div align="center">

## 2. Infrastructure Architecture & Fraudulent Data Flow

</div>

```mermaid
flowchart TD
 Victim([" Victim User"])
 Admin([" Threat Actor Admin Panel"])

 subgraph FRONTEND["Frontend Presentation Layer"]
 UI["Vue.js Web Application
Simulated Task Engine & Fictitious Balances"]
 FEED["Fabricated Live News & Payout Feed
(Derived from /api/v1/site/config data)"]
 end

 subgraph BACKEND["Backend & API Layer"]
 API_CONFIG["/api/v1/site/config
Withdrawal Kill-Switch: false
Country Code Lock: +40"]
 API_AUTH["/api/v1/user/auth/*
SQL Injection Surface on invite_code & username"]
 DB[("Campaign Database & Ledger")]
 end

 subgraph TRAP["Financial Drain Trap"]
 DEPOSIT["USDT TRC-20 Deposit Requirement
Mandatory 'VIP Task Level Unlock'"]
 WALLET["Attacker Consolidation Wallet
(Laundering through Mixers/Bridges)"]
 BLOCK["Withdrawal Blocked Indefinitely
'Compliance Tax / Security Audit Fee Required'"]
 end

 Victim -->|"Registers with invite_code: 888888"| UI
 UI <--> API_CONFIG
 UI <--> API_AUTH
 API_AUTH <--> DB
 Admin -->|Manipulates task payouts & odds| DB
 UI -->|Displays fake accrued earnings| FEED
 FEED -->|Lured into funding account| DEPOSIT
 DEPOSIT --> WALLET
 Victim -.->|Attempts cash withdrawal| BLOCK
 BLOCK -->|Funds permanently expropriated| Admin
```

---

<div align="center">

## 3. Deep-Dive Technical Findings

</div>

<div align="center">

### 3.1 Backend Configuration Exposure (`/api/v1/site/config`)

</div>
Interrogating the unauthenticated site configuration endpoint revealed the operational parameters of the fraud campaign:

```json
{
 "code": 200,
 "data": {
 "siteName": "Global E-Commerce Task Hub",
 "defaultCountryCode": "+40",
 "withdrawMethodBank": false,
 "withdrawMethodRevolut": false,
 "minDepositUSDT": 50,
 "aiNewsFeed": [
 { "title": "Platform partners with top retailers", "date": "2026-08-01" }
 ]
 }
}
```

- **The Withdrawal Kill-Switch**: While the frontend renders payment options for bank transfer and Revolut, the backend explicitly sets their operational flags to `false`. Cryptocurrency (USDT TRC-20) remains the only active deposit rail.
- **Geographic Segmentation**: The `defaultCountryCode` parameter enforced `+40`, isolating Romanian targets.

<div align="center">

### 3.2 SQL Injection & Input Validation Analysis (`SQLI.md`)

</div>
The `invite_code` parameter (validated as `888888`) and the `username` field in `POST /api/v1/user/auth/login` exhibited clear indicators of improper backend sanitization. Time-based latency variations when injecting quote characters indicated raw string concatenation into database queries, allowing potential bypass of authentication tables.

---

<div align="center">

## 4. Indicators of Compromise (IOCs)

</div>

| Category | Indicator / Detail | Threat Description |
| :--- | :--- | :--- |
| **Malicious API Endpoints** | `/api/v1/site/config`, `/api/v1/user/auth/register`, `/api/v1/task/submit` | Exposed REST endpoints orchestrating the scam mechanics. |
| **Fraud Invite Codes** | `888888`, `VIP999` | Referral identifiers assigning victims to specific scam operators. |
| **Targeted Crypto Rails** | USDT (Tether) on TRON (TRC-20) network | Low-cost, irreversible cryptocurrency transaction layer. |
| **Technology Fingerprint** | Vue.js SPA, PHP/Laravel Backend, Cloudflare CDN (Detection-only) | Characteristic stack of commercial task scam kits. |

---

<div align="center">

## 5. MITRE ATT&CK Mapping

</div>

| Phase | Tactic | Technique ID | Technique Description |
| :--- | :--- | :--- | :--- |
| **Reconnaissance** | Reconnaissance | `T1592` | **Gather Victim Host/Identity Info**: Collecting target mobile and Telegram data. |
| **Initial Access** | Initial Access | `T1566` | **Phishing: User Execution**: Recruitment via unsolicited messaging apps. |
| **Defense Evasion** | Defense Evasion | `T1027` | **Obfuscated Files or Information**: Minified client bundles and disguised payloads. |
| **Impact** | Impact | `T1499` | **Financial Extortion / Resource Theft**: Permanent expropriation of deposited cryptocurrency. |

---

<div align="center">

## 6. Defensive Conclusions & Threat Advisory

</div>

1. **Scam Indicators**: Any remote job requiring upfront cryptocurrency deposits to unlock higher commissions or complete task quotas is fraudulent by design.
2. **Blockchain Tracing**: Track wallet transfer hops on TRONSCAN to identify consolidation exchanges and submit asset freezing requests to compliance desks.
3. **Abuse Takedown**: Issue immediate abuse notices to CDN providers and domain registrars hosting the API infrastructure.
