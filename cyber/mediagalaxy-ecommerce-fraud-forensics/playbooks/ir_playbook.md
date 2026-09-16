# Incident Response Playbook: E-Commerce Fraud & Financial Chargebacks
**Standard Operating Procedure (SOP):** IR-SOP-ECOM-004  
**Target Threat Category:** E-Commerce Brand Spoofing / Social Media Ad Phishing / Unauthorized Financial Transaction  
**Incident Reference:** `SEC-2026-ECOM-005` (Media Galaxy / TikTok Campaign)  
**Classification:** `TLP:CLEAR`

---

## 1. Workflow Architecture & Lifecycle

```mermaid
flowchart TD
    A[Alert / Victim Identification] --> B[Immediate Containment: Card Freeze]
    B --> C[Evidence Preservation & Header Extraction]
    C --> D[Bank Dispute & Chargeback Filing]
    D --> E[Perimeter Immunization OPNsense/DNS]
    E --> F[Abuse Reporting & Registrar Takedown]
    F --> G[Post-Incident Review & Threat Intel Sharing]
```

---

## 2. Phase 1: Identification & Immediate Triage

1. **Victim Interview & Timeline Reconstruction:**
   - Exact timestamp of link traversal from TikTok ad.
   - Exact amount charged: `~21 EUR` (or equivalent in RON on Revolut).
   - Funding flow: **BCR (Banca Comercială Română)** account -> **Revolut Virtual Card** -> Merchant transaction.
   - Information disclosed: Full Name (`[REDACTED]`), Email address, Shipping address, Card Number (PAN), Expiration Date, CVV, and SMS/OTP verification code.
2. **Determine Compromise Scope:**
   - Since the virtual card was single-use/disposable or virtual multi-use, identify whether persistent recurring tokens or subscription pre-authorizations were registered.

---

## 3. Phase 2: Containment & Financial Lockdown

1. **Terminate the Virtual Card on Revolut App:**
   - Open **Revolut App -> Cards**.
   - Select the affected card -> Tap **Freeze**.
   - Immediately tap **Settings -> Terminate Card / Delete**.
   - Regenerate a new disposable virtual card with a fresh 16-digit PAN.
2. **Review BCR Funding Source:**
   - Verify BCR George mobile banking app to ensure no direct unauthorized Open Banking / AISP tokens were authorized.
   - Confirm the transaction originated strictly from Revolut card payment rails, leaving BCR main credentials intact.
3. **Change Victim Email Password & Enable Passkeys / Hardware MFA:**
   - Because the attacker sent phishing lures attempting password resets (`Screenshot 2026-09-16 at 20.47.47.png`, code `586571`), revoke all active sessions on the victim's Google/Gmail account.
   - Enable FIDO2 / Passkey or Google Authenticator.

---

## 4. Phase 3: Financial Remediation & Chargeback Guide

### Visa & Mastercard Chargeback Rules
Under **Visa Dispute Condition 13.1 (Merchandise/Services Not Received)** and **Mastercard Reason Code 4853 (Recurring Transaction / No Delivery / Fraud)**:
- Cardholders are entitled to a full chargeback when merchandise was ordered from a merchant that fails to deliver or represents an impersonated business.
- Since the merchant descriptor displayed on the statement (`morvethemi london`) does not represent a legitimate retail business and the site disappeared into "maintenance" (`v***L The website is under maintenance`), the transaction qualifies under fraud.

### Revolut Chargeback Filing Procedure
1. In the **Revolut app**, navigate to **Transactions**.
2. Tap the unauthorized / fraudulent charge (`~21 EUR` to `morvethemi london` or related entity).
3. Scroll down and select **Report an issue / Get help**.
4. Choose **"Fraud or scam"** -> **"I bought something online and it was a scam / I did not receive the item"**.
5. When prompted for proof, attach:
   - Screenshot of the fake confirmation email showing fake order ID `[229942-177457]`.
   - Screenshot of the landing page displaying maintenance (`Screenshot 2026-09-16 at 20.30.18.png`).
   - Screenshot showing the reply-to address was a personal Gmail account (`MaryxBeckb96@gmail.com`).
6. Submit the dispute statement:

#### Dispute Narrative Template (English):
```text
I am requesting an immediate chargeback under Visa/Mastercard Fraud Condition 13.1 / Code 4853 for the transaction of [AMOUNT] EUR processed on 16 September 2026 under the merchant descriptor "morvethemi london". 

The transaction was initiated following a fraudulent sponsored advertisement on TikTok impersonating the legitimate Romanian electronics retailer "Media Galaxy". The payment was captured through a deceptive web portal (mediagalaxy.voetbalshop-nlco.com) backed by a Chinese fraudulent SaaS infrastructure (yiyangsaas.com). 

Immediately after payment, the vendor failed to provide any valid merchant tracking, the website went offline displaying "under maintenance", and follow-up emails originated from disposable phishing domains (worvixglobal.com, info.mailapp-fly.com) using an unrelated Gmail address (MaryxBeckb96@gmail.com). The merchant descriptor is fabricated and does not correspond to any registered business entity. Evidence screenshots including email headers and WHOIS records are attached.
```

#### Dispute Narrative Template (Romanian):
```text
Solicit refuz la plată (chargeback) conform reglementărilor Visa/Mastercard pentru tranzacția în valoare de [SUMA] EUR din data de 16 Septembrie 2026 către comerciantul fraudulos înregistrat cu descrierea "morvethemi london".

Tranzacția a fost efectuată în urma accesării unei reclame sponsorizate pe TikTok care clona identitatea vizuală a retailerului oficial Media Galaxy. Pagina de plată a funcționat pe domeniul compromis mediagalaxy.voetbalshop-nlco.com, asociat unei infrastructuri de tip C2/SaaS din China (yiyangsaas.com). 

Imediat după procesarea plății, site-ul a fost oprit (afișând mesaj de mentenanță), iar confirmările de comandă au sosit de pe adrese false (noreply@email.worvixglobal.com, Reply-To: MaryxBeckb96@gmail.com), fără nicio dovadă de livrare a vreunui bun. Comerciantul nu există în mod legal. Anexez capturile de ecran cu antetele mesajelor și investigația tehnică a infrastructurii.
```

---

## 5. Phase 4: Eradication & Takedown Notifications

Send standardized abuse reports to the relevant infrastructure providers:

| Provider | Target IoC | Contact Email / Form | Action Requested |
| :--- | :--- | :--- | :--- |
| **Cloudflare** | `104.16.145.247`, `voetbalshop-nlco.com`, `yiyangsaas.com` | `abuse@cloudflare.com` / `https://abuse.cloudflare.com/` | Terminate reverse proxy & expose origin IP |
| **NameSilo** | `worvixglobal.com` | `abuse@namesilo.com` | Domain suspension (phishing) |
| **eName Technology** | `yiyangsaas.com` | `abuse@ename.com` | Domain suspension & abuse investigation |
| **Zoho Mail** | `mx.zoho.com` (for `worvixglobal.com`) | `abuse@zohocorp.com` | Disable fraudulent mail tenant |
| **Google Abuse** | `MaryxBeckb96@gmail.com` | `https://support.google.com/mail/contact/abuse` | Account suspension for fraud relay |
| **Microsoft Abuse** | `brekerfurught@outlook.com` | `abuse@outlook.com` | Account suspension for phishing |
| **DNSC (CERT-RO)** | Entire Campaign | `alerts@dnsc.ro` | National phishing alert & ISP sinkholing in Romania |
| **Altex / Media Galaxy Legal** | Brand Impersonation | `juridic@mediagalaxy.ro` | Brand protection & legal escalation |

---

## 6. Phase 5: Post-Incident Hardening & Lessons Learned

1. Enforce strict virtual card discipline:
   - For all social media / ad-driven purchases, utilize single-use disposable virtual cards with custom spend limits.
2. Maintain OPNsense Unbound DNS sinkhole blocks (`domains.txt`).
3. Deploy Suricata custom detection rules on gateway interfaces.
4. Report ad sponsor identity directly to TikTok Ad Quality & Safety team.
