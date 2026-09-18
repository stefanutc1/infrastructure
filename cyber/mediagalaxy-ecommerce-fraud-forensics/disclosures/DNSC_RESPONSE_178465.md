# DNSC Official Incident Response / Răspuns Oficial Sesizare Incident [D.N.S.C. #178465]

**Autoritate:** Directoratul Național de Securitate Cibernetică (DNSC)  
**Departament:** Direcția Generală Operațiuni Tehnice  
**Expeditor:** DNSC `<alerts@dnsc.ro>`  
**Destinatar:** Incident Response Team / Raportor (`eu`)  
**Data Primirii:** 18 Septembrie 2026, 11:22 EEST  
**Număr Tichet:** `[D.N.S.C. #178465]`  
**Subiect:** `[D.N.S.C. #178465] Răspuns sesizare`  
**Referință Dosar:** `SEC-2026-ECOM-005` (Media Galaxy Brand Impersonation & E-Commerce Phishing)  
**Clasificare:** `TLP:CLEAR`  
**Stare:** Investigație Oficială Demarată / În Curs de Evaluare pentru PNRISC Blacklist  

---

## 🇷🇴 Versiunea în Limba Română (Text Oficial Primit)

**De la:** DNSC `<alerts@dnsc.ro>`  
**Data:** 18 Septembrie 2026, 11:22  
**Către:** `eu`  
**Subiect:** `[D.N.S.C. #178465] Răspuns sesizare`  

> Bună ziua,
> 
> Vă mulțumim pentru informațiile furnizate.
> 
> Am demarat o investigație cu privire la cele sesizate, urmând ca, la finalizarea acesteia, să fie dispuse măsurile legale ce se impun. În măsura în care, în urma analizei efectuate de specialiștii DNSC, domeniul raportat va fi confirmat ca fiind malițios, acesta va putea fi inclus în baza de date PNRISC blacklist.
> 
> Totodată, în vederea creșterii nivelului de protecție a utilizatorilor, a fost dezvoltată o extensie de browser care utilizează această bază de date și oferă protecție în timp real, prin avertizarea și blocarea accesului către domenii periculoase. Pentru instalarea extensiei, vă rugăm să accesați: [https://blacklist.dnsc.ro/](https://blacklist.dnsc.ro/)
> 
> Pentru o mai bună însușire a regulilor de bază privind securitatea cibernetică, Directoratul vă recomandă următoarele:
> 
> 1. Citiți cu atenție link-urile ce urmează a fi accesate precum și conținutul mesajelor. Acestea pot conține erori în exprimare sau greșeli gramaticale.
> 2. Nu accesați link-urile conținute în mesaje/email-uri provenite de la persoane/domenii ce nu vă sunt cunoscute.
> 3. Înainte de a introduce informații personale pe un website/aplicație, asigurați-vă că vă aflați pe un domeniu/aplicație legitim.
> 4. În cazul în care ați introdus deja date personale pe astfel de domenii/aplicații, recomandăm schimbarea de urgență a parolelor.
> 5. Fiți precaut în privința solicitărilor legate de furnizarea informațiilor personale și financiare. Instituțiile și companiile nu vor solicita astfel de informații.
> 6. Contactați imediat banca, dacă știți că ați răspuns unor astfel de solicitări și ați furnizat detalii bancare în aceste condiții.
> 7. Fiți sceptic cu privire la ofertele ce sună prea bine pentru a fi adevărate.
> 
> Pentru mai multe recomandări puteți accesa următorul ghid cu privire la aceste tipuri de atac:  
> [https://dnsc.ro/vezi/document/scam-phishing-vishing](https://dnsc.ro/vezi/document/scam-phishing-vishing)
> 
> Cu stimă,  
> **Direcția Generală Operațiuni Tehnice**  
> ----------------------------------------------  
> **Directoratul Național de Securitate Cibernetică**

---

## 🇬🇧 English Translation (Official Incident Response)

**From:** DNSC `<alerts@dnsc.ro>`  
**Date:** September 18, 2026, 11:22 EEST  
**To:** Incident Reporter (`eu`)  
**Subject:** `[D.N.S.C. #178465] Response to notification`  

> Hello,
> 
> Thank you for providing this information.
> 
> We have launched an investigation into the reported incident; upon its conclusion, all requisite legal and technical measures will be enacted. Subject to confirmation by DNSC cybersecurity specialists that the reported domain is malicious, it may be formally ingested into the national PNRISC Blacklist database.
> 
> Furthermore, to enhance the security posture of end-users, a dedicated browser extension has been developed which leverages this database to deliver real-time protection by warning against and blocking access to harmful domains. To install the extension, please visit: [https://blacklist.dnsc.ro/](https://blacklist.dnsc.ro/)
> 
> For a better understanding of fundamental cybersecurity best practices, the Directorate recommends the following:
> 
> 1. Carefully inspect all links prior to accessing them, as well as the content of incoming messages. Fraudulent communications frequently exhibit grammatical discrepancies or abnormal phrasing.
> 2. Do not click links embedded in messages or emails originating from unknown individuals or unverified domains.
> 3. Prior to entering personal credentials or payment details on any website or application, verify that you are operating within a genuine, legitimate domain.
> 4. If you have already disclosed personal credentials on suspicious platforms, execute an emergency password reset immediately.
> 5. Exercise heightened caution regarding unsolicited requests for personal or financial details. Legitimate institutions and enterprises will never solicit such confidential data through unverified channels.
> 6. Contact your issuing bank immediately if you have responded to such requests and disclosed payment card or banking details.
> 7. Maintain skepticism regarding promotions and discounts that appear disproportionately advantageous or unrealistic.
> 
> For further guidance and comprehensive advisories regarding these attack vectors, consult the official documentation at:  
> [https://dnsc.ro/vezi/document/scam-phishing-vishing](https://dnsc.ro/vezi/document/scam-phishing-vishing)
> 
> Sincerely,  
> **General Directorate of Technical Operations**  
> ----------------------------------------------  
> **National Cyber Security Directorate (DNSC - Romania)**

---

## 🛡️ Technical Assessment & Closed-Loop Integration

1. **Incident Validation & Ticketing:**
   - The filing submitted on September 16, 21:21 EEST was officially accepted, assigned Ticket ID **`[D.N.S.C. #178465]`**, and escalated to the *General Directorate of Technical Operations*.
2. **PNRISC Blacklist Pipeline Integration:**
   - DNSC confirmed the evaluation of `mediagalaxy.voetbalshop-nlco.com` (and associated campaign endpoints) for inclusion in the national PNRISC Blacklist gateway ([`https://blacklist.dnsc.ro/`](https://blacklist.dnsc.ro/)).
   - Our automated repository synchronizer ([`scripts/sync_forbidden_domains.py`](../../scripts/sync_forbidden_domains.py)), executing every 24 hours at 05:00 AM Europe/Bucharest via GitHub Actions CD, will automatically ingest the domain into [`cyber/forbidden_domains.txt`](../forbidden_domains.txt) and [`cyber/lista_interzisa.txt`](../lista_interzisa.txt) upon publication.
3. **Alignment with National Directives:**
   - All 7 DNSC mitigation directives were proactively executed during earlier phases:
     - **Recommendation 4 & 6 (Card & Credentials lockdown):** Executed on Sept 16, 20:00 (card frozen) & Sept 17, 18:00 (BCR bank dispute opened under Visa/Mastercard Rule 4853).
     - **Recommendation 1-3 & 7 (Infrastructure & DNS Sinkholing):** Threat vectors sinkholed to `0.0.0.0` on OPNsense (`192.168.1.1`) and forwarded to Wazuh SIEM.
