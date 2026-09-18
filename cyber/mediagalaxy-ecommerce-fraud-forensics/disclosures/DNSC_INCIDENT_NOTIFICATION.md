# DNSC Official Incident Notification / Notificare Incident de Securitate Cibernetică

**Autoritate:** Directoratul Național de Securitate Cibernetică (DNSC)  
**Clasificare:** TLP:CLEAR  
**Tip Incident:** Phishing, Fraudă Electronică, Spoofing Retail  

---

## 🇷🇴 Versiunea în Limba Română (Original)

**Subiect:** Notificare Incident de Securitate Cibernetică / Phishing și Fraudă E-Commerce – Fals Media Galaxy  
**Prioritate:** Urgentă / Risc Ridicat  

Către Directoratul Național de Securitate Cibernetică (DNSC),

Prin prezenta, dorim să semnalăm o campanie activă de înșelăciune informatică (phishing și social engineering) care afectează consumatorii din România, folosind în mod fraudulos identitatea vizuală a retailerului Media Galaxy.

### Indicatori Tehnici Compleți ai Incidentului (IoC-uri):
Pentru protejarea utilizatorilor și blocarea infrastructurii atacatorilor, vă punem la dispoziție toate domeniile și subdomeniile identificate în campanie:
- **Subdomeniu principal de phishing / reclamă TikTok:** `mediagalaxy.voetbalshop-nlco.com` (găzduit pe o infrastructură olandeză compromisă).
- **Domeniu e-mail de confirmare scam:** `noreply@email.worvixglobal.com` (înregistrat în SUA pe 08.02.2025) cu adresa de răspuns suspectă `brekerfurught@outlook.com`.
- **Infrastructură backend / CDN centralizată:** `yiyangsaas.com` (ascuns în spatele Cloudflare, înregistrat la 12.09.2023).

### Impact și Mod de Operare:
Victimele sunt atrase prin prețuri false, introducând datele cardurilor bancare (procesate fraudulos prin debitări directe pe carduri de debit/credit bancare). Pagubele raportate per victimă se ridică la aproximativ 21 de euro, campania vizând colectarea frauduloasă de fonduri și date financiare.

Vă transmitem acești indicatori în vederea analizării și emiterii eventualelor avertismente publice specifice pentru protejarea utilizatorilor români în fața acestei rețele de scam.

Cu stimă,  
**Echipa de Analiză și Răspuns la Incidente**

---

## 🇬🇧 English Translation

**Subject:** Cybersecurity Incident Notification / Phishing and E-Commerce Fraud – Media Galaxy Brand Impersonation  
**Priority:** Urgent / High Risk  

To the National Cyber Security Directorate (DNSC - Romania),

We hereby report an active cyber deception and social engineering campaign targeting Romanian citizens, fraudulent using the visual and brand identity of major electronics retailer Media Galaxy.

### Technical Indicators of Compromise (IoCs):
To facilitate infrastructure takedown and protect internet users, we submit the following identified campaign assets:
- **Primary Phishing / Sponsored TikTok Landing Subdomain:** `mediagalaxy.voetbalshop-nlco.com` (hosted on hijacked/aged Dutch infrastructure).
- **Scam Order Confirmation Email Relay:** `noreply@email.worvixglobal.com` (registered in the US on 2025-02-08) with suspicious reply-to address `brekerfurught@outlook.com`.
- **Centralized Backend / CDN Infrastructure:** `yiyangsaas.com` (proxied behind Cloudflare, registered 2023-09-12).

### Impact and Threat Assessment:
Victims are lured with counterfeit pricing and enter sensitive debit/credit card credentials (processed directly against legitimate retail bank debit/credit cards). Direct losses average approximately €21 per victim. The infrastructure is configured for persistent recurring harvesting and account takeover lures.

We submit these findings for ingestion into national threat intelligence feeds and the issuance of public security advisories to safeguard consumers.

Respectfully,  
**Incident Analysis & Response Team**

---

## 📬 Official Resolution & Response / Rezoluție Oficială

- **Ticket ID:** `[D.N.S.C. #178465]`  
- **Received:** September 18, 2026, 11:22 EEST  
- **Authority:** Directoratul Național de Securitate Cibernetică (DNSC) – Direcția Generală Operațiuni Tehnice  
- **Status:** Investigation Opened / Domain under evaluation for the national PNRISC Blacklist ([`blacklist.dnsc.ro`](https://blacklist.dnsc.ro/)).  
- **Full Dossier (RO / EN):** See [`DNSC_RESPONSE_178465.md`](./DNSC_RESPONSE_178465.md).

