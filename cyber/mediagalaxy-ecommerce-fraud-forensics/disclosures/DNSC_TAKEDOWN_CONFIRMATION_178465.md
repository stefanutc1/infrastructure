# DNSC Official Takedown & Closure Confirmation / Confirmare Oficială Dezafectare și Închidere Incident [D.N.S.C. #178465]

**Autoritate:** Directoratul Național de Securitate Cibernetică (DNSC)  
**Sistem:** Platforma Națională de Raportare a Incidentelor de Securitate Cibernetică (PNRISC)  
**Expeditor:** DNSC `<alerts@dnsc.ro>` / `<notificari@pnrisc.dnsc.ro>`  
**Destinatar:** Raportor Incident / Incident Response Team (`eu`)  
**Data Primirii:** 21 Septembrie 2026, 06:29 EEST  
**Număr Tichet:** `[D.N.S.C. #178465]`  
**Referință Dosar:** `SEC-2026-ECOM-005` (Media Galaxy Brand Impersonation & E-Commerce Phishing)  
**Domeniu Țintă Neutralizat:** `voetbalshop-nlco[.]com` (inclusiv subdomeniul malițios `mediagalaxy.voetbalshop-nlco[.]com`)  
**Clasificare:** `TLP:CLEAR`  
**Stare Finală:** **REZOLVAT / DEZAFECTAT (TAKEDOWN CONFIRMED)** — Domeniul nu mai este funcțional; sesizarea este oficial închisă.

---

## 1. Versiunea în Limba Română (Text Oficial Primit)

**De la:** DNSC  
**Data:** 21 Septembrie 2026, 06:29 EEST  
**Către:** `eu`  
**Subiect:** `[D.N.S.C. #178465] Notificare finalizare demersuri / Închidere sesizare`  

> Bună ziua,
> 
> Vă aducem la cunoștință faptul că în urma demersurilor efectuate, domeniul `[voetbalshop-nlco[.]com]` nu mai este funcțional.
> 
> Sesizarea dumneavoastră va fi închisă.
> 
> Pentru a raporta un nou incident, vă rugăm să completați formularul PNRISC: [https://pnrisc.dnsc.ro/](https://pnrisc.dnsc.ro/).
> 
> Întrucât dorim să îmbunătățim permanent serviciile oferite, iar opinia dumneavoastră contează, vă invităm să completați următorul formular: [https://feedback.pnrisc.dnsc.ro/178465+fb5ae35feb97f0a9e484d7e0608bee1b0840936cfa3d9c8c](https://feedback.pnrisc.dnsc.ro/178465+fb5ae35feb97f0a9e484d7e0608bee1b0840936cfa3d9c8c)
> 
> Cu stimă,  
> **Directoratul Național de Securitate Cibernetică (DNSC)**

---

## 2. English Translation (Official Incident Closure Notice)

**From:** National Cyber Security Directorate (DNSC - Romania)  
**Date:** September 21, 2026, 06:29 EEST  
**To:** Incident Reporter (`eu`)  
**Subject:** `[D.N.S.C. #178465] Resolution Notification / Case Closure`  

> Hello,
> 
> Please be advised that following the interventions and technical remediation measures undertaken, the domain `[voetbalshop-nlco[.]com]` is no longer functional.
> 
> Your incident notification will now be closed.
> 
> To report a new incident, please submit the PNRISC incident form: [https://pnrisc.dnsc.ro/](https://pnrisc.dnsc.ro/).
> 
> In our ongoing commitment to continuously enhance our public services and response efficiency, your feedback is highly appreciated. We invite you to complete the following assessment form: [https://feedback.pnrisc.dnsc.ro/178465+fb5ae35feb97f0a9e484d7e0608bee1b0840936cfa3d9c8c](https://feedback.pnrisc.dnsc.ro/178465+fb5ae35feb97f0a9e484d7e0608bee1b0840936cfa3d9c8c)
> 
> Sincerely,  
> **National Cyber Security Directorate (DNSC - Romania)**

---

## 3. Evaluare Tehnică & Cronologia Neutralizării (Technical Assessment)

### 3.1. Cronologia Incidentului `SEC-2026-ECOM-005`
1. **16 Septembrie 2026, 19:42 EEST:** Detectarea campaniei active de phishing și clonare vizuală Media Galaxy pe `mediagalaxy.voetbalshop-nlco.com`.
2. **16 Septembrie 2026, 21:21 EEST:** Trimiterea sesizării oficiale de securitate cibernetică către DNSC prin portalul PNRISC ([`DNSC_INCIDENT_NOTIFICATION.md`](./DNSC_INCIDENT_NOTIFICATION.md)).
3. **18 Septembrie 2026, 11:22 EEST:** Recepționarea primului răspuns oficial `[D.N.S.C. #178465]`, confirmând deschiderea anchetei de către *Direcția Generală Operațiuni Tehnice* ([`DNSC_RESPONSE_178465.md`](./DNSC_RESPONSE_178465.md)).
4. **18 Septembrie 2026, 20:00 EEST:** Includerea oficială a subdomeniilor campaniei în baza națională **PNRISC Blacklist** (`https://blacklist.dnsc.ro/`).
5. **21 Septembrie 2026, 06:29 EEST:** **Confirmarea finală de dezafectare (Takedown)** — domeniul apex `voetbalshop-nlco.com` a fost complet suspendat / dezafectat la nivel de registru/hosting, iar sesizarea `#178465` a fost marcată ca **REZOLVATĂ**.

### 3.2. Impact Operativ
* **Dezafectare la Nivel de Rădăcină (Apex Takedown):** Suspendarea domeniului `voetbalshop-nlco.com` neutralizează instantaneu întreaga flotă de subdomenii malițioase folosite în campanii paralele de fraudă e-commerce:
  * `mediagalaxy.voetbalshop-nlco.com` (Campania investigată în prezentul dosar)
  * `dm.voetbalshop-nlco.com` (Impersonare lanț drogherii DM)
  * `gonser.voetbalshop-nlco.com` (Impersonare retail elvețian Gonser)
* **Validare Închidere Buclă SOC:** Dosarul tehnic `SEC-2026-ECOM-005` atinge stadiul de **Remediere Completă (Full Remediation & Takedown Verified)**.
