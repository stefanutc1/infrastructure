# Case Study: E-Commerce Brand Impersonation & Chinese SaaS Fraud Funnel (Media Galaxy Spoof via TikTok)
**Case Reference:** `SEC-2026-ECOM-005`  
**Classification:** `TLP:CLEAR`  
**Incident Date:** 16 September 2026  
**Primary Investigators:** `@stefanutc1`  
**Target Entity:** Media Galaxy (Altex România S.A.)  
**Financial Loss Impact:** ~21 EUR (~105 RON) via Revolut Virtual Card / BCR (Banca Comercială Română)  
**Status:** Incident Mitigated, Card Destroyed, Takedown In-Progress  

---

## 1. Context & Incident Overview

In September 2026, a targeted e-commerce fraud operation weaponized sponsored short-form video advertisements on TikTok to impersonate **Media Galaxy**, one of Romania's largest national consumer electronics retailers. Consumers were lured with unrealistic promotional pricing on high-demand tech items, routed through in-app mobile browsers into a fraudulent web property hosted at:
`https://mediagalaxy.voetbalshop-nlco.com`

Upon submitting card details, the victim was debited ~21 EUR under the obscure foreign descriptor **`morvethemi london`**. The phishing portal instantly became inaccessible, displaying a deceptive `"maintenance"` status screen. Follow-up automated emails containing fake order tokens (`[229942-177457]`) and password reset verification codes (`586571`) were dispatched from attacker-operated mail relays to maintain cover and attempt secondary account takeover.

---

## 2. Technical Findings & Forensics

1. **Subdomain Masking on Compromised Infrastructure:**  
   The attackers leveraged a secondary domain (`voetbalshop-nlco.com`) ostensibly created to clone a Dutch football sportswear portal (`voetbalshop.nl`). The subdomain `mediagalaxy` was established to spoof the genuine brand.
2. **Chinese Origin & Turnkey Phishing SaaS Codebase:**  
   Inspection of the rendered DOM revealed that the underlying application was configured with `<html lang="zh-CN">`. The CSS styling, DOM element names (`#module_login.module_login_default`), and JavaScript execution timers (`window._CEDDE_ET`) are characteristic of underground Chinese turnkey phishing software-as-a-service (SaaS) kits.
3. **Infrastructure Smoking Gun (`yiyangsaas.com`):**  
   Direct service enumeration of the Cloudflare-fronted reverse proxy IP (`104.16.145.247`) revealed an SSL certificate common name pointing directly to `cn: yiyangsaas.com`. WHOIS analysis confirmed `yiyangsaas.com` was registered through **eName Technology Co., Ltd.** based in Yunnan, China, operating continuously since September 2023.
4. **Email Delivery Architecture:**  
   - Dispatcher 1: `Customer Service <noreply@email.worvixglobal.com>` (registered at NameSilo in Feb 2025, using Zoho Mail MX servers).
   - Dispatcher 2: `mediagalaxy-ro <noreply@info.mailapp-fly.com>` (signed by DKIM on `mailapp-fly.com`).
   - Attacker Drop Inboxes: `MaryxBeckb96@gmail.com` and `brekerfurught@outlook.com`.
5. **Financial Flow:**  
   - Funding Source: BCR Current Account -> Revolut Virtual Card.
   - Merchant Descriptor: `morvethemi london` (Unregistered shell billing aggregator).
   - Amount: ~21 EUR.

---

## 3. Indicators of Compromise (IoCs)

| Indicator | Type | Threat Role | Action |
| :--- | :--- | :--- | :--- |
| `mediagalaxy.voetbalshop-nlco.com` | FQDN | Phishing Landing Subdomain | DNS Sinkhole (0.0.0.0) |
| `voetbalshop-nlco.com` | Domain | Base Infrastructure | OPNsense Blocklist |
| `yiyangsaas.com` | Domain | C2 & SaaS Management Backend | Global Egress Block |
| `worvixglobal.com` | Domain | Attacker Shell Front & Mail Domain | Mail Gateway Filter & Sinkhole |
| `email.worvixglobal.com` | FQDN | Phishing Order Dispatcher | Mail Reject |
| `info.mailapp-fly.com` | FQDN | Phishing Code Dispatcher | Mail Reject |
| `noreply@email.worvixglobal.com` | Email | Phishing Sender | Blacklist |
| `noreply@info.mailapp-fly.com` | Email | Phishing Sender | Blacklist |
| `MaryxBeckb96@gmail.com` | Email | Attacker Reply-To Drop | Abuse Escalation |
| `brekerfurught@outlook.com` | Email | Attacker Reply-To Drop | Abuse Escalation |
| `104.16.145.247` | IPv4 | Phishing Proxy (Cloudflare) | L3/L4 Firewall Drop |
| `104.21.14.99` | IPv4 | Phishing Proxy (Cloudflare) | L3/L4 Firewall Drop |
| `morvethemi london` | String | Fraudulent Card Descriptor | Bank Dispute / Chargeback |

---

## 4. Remediation & Incident Response Execution

1. **Virtual Card Elimination:** The victim immediately froze and terminated the compromised Revolut virtual card, issuing a fresh card number to eliminate recurring unauthorized authorizations.
2. **Chargeback Dispute:** A formal dispute was filed via Revolut under Visa/Mastercard Rule 4853 / Condition 13.1 (Merchant Fraud / Misrepresentation), requesting a complete clawback of the ~21 EUR fee.
3. **Perimeter Hardening on OPNsense (`192.168.1.1`):**
   - Ingested `domains.txt` into Unbound DNS Blocklists.
   - Deployed custom Suricata IDS rules (`sid:1000951-1000956`) on WAN and LAN interfaces.
   - Created Floating firewall reject rules for C2 proxy IPs.
4. **Takedown Submissions:** Abuse reports submitted to Cloudflare, NameSilo, eName Technology, Zoho Mail, Google, and the Romanian National Cyber Security Directorate (DNSC - `alerts@dnsc.ro`).
