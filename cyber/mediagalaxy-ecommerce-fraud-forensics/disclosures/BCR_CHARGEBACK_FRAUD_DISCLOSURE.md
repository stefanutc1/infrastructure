# BCR Chargeback Dispute & Fraud Incident Disclosure / Notificare Oficială Contestare Tranzacție BCR

Acest document conține declarația și scenariul complet de raportare (la persoana I), pregătit pentru apelul telefonic la suportul BCR sau prezentarea fizică la ghișeu, în vederea deschiderii procedurii de **chargeback (contestare tranzacție)** și înregistrării dosarului de fraudă informatică.

---

## 🇷🇴 Versiunea în Limba Română (Declarație la Persoana I)

**Către:** Banca Comercială Română (BCR) – Departamentul Carduri, Fraude și Relații Clienți  
**Subiect:** Notificare de fraudă informatică (phishing) și solicitare deschidere procedură de Chargeback  
**Canal:** Apel suport telefonic / Prezentare la sucursală  

---

### Scenariu / Declarație Directă (la persoana I):

> „Bună ziua, vă apelez pentru a raporta o **fraudă informatică (phishing / înșelăciune electronică)** și pentru a solicita în mod oficial **deschiderea unei proceduri de contestare a tranzacției (chargeback)** pentru recuperarea sumei retrase fraudulos.
> 
> Vă pun la dispoziție toate datele financiare și tehnice necesare deschiderii dosarului de investigație:

#### 1. Natura Incidentului și Modul de Operare:
- Este vorba despre un atac de tip **phishing prin social engineering și uzurpare de identitate de brand (impersonare Media Galaxy)**.
- Datele cardului au fost sustrase prin intermediul unui portal web clonă care folosea în mod ilegal sigla și identitatea vizuală a retailerului Media Galaxy, promovat prin reclame sponsorizate pe rețelele sociale (TikTok) cu oferte înșelătoare la produse de uz casnic.

#### 2. Detaliile Tranzacției Contestate:
- **Suma retrasă:** În jur de **21 EUR și câțiva cenți** (aproximativ **118 RON**).
- **Data și ora:** Tranzacția a fost procesată neautorizat în cursul zilei de 16 septembrie 2026.
- **Comerciantul raportat pe tranzacție:** Apare sub un descriptor suspect/neautorizat (de tip *„morvethemi london”*), fără nicio legătură cu entitatea oficială Media Galaxy / Altex România.

#### 3. Arhitectura Plății și Măsurile de Securitate Deja Luate:
- Fondurile au tranzitat un card asociat ecosistemului Revolut, care este alimentat direct din contul meu principal de la BCR.
- Vă informez că, pentru a preveni alte pagube sau tranzacții recurente neautorizate, **cardul compromis a fost deja șters și blocat permanent** din aplicație imediat după identificarea incidentului.

#### 4. Indicatori Tehnici de Compromis (IoC-uri pentru Dosarul Antifraudă):
Pentru ca departamentul dumneavoastră antifraudă să poată documenta atacul în rețeaua bancară:
- **Subdomeniul de phishing utilizat:** `mediagalaxy.voetbalshop-nlco.com` (găzduit pe o infrastructură compromisă).
- **Infrastructura de e-mail scam asociată:** Mesajul fals de confirmare a venit de la `noreply@email.worvixglobal.com` (domeniul `worvixglobal.com`), având setată adresa de răspuns suspectă `brekerfurught@outlook.com`.
- **Infrastructura backend centralizată:** Datele au fost rutate către `yiyangsaas.com` (ascuns în spatele unui proxy Cloudflare).

#### 5. Solicitarea Mea Oficială:
1. Înregistrarea imediată a cererii mele de **contestare a plății (chargeback)** pe motiv de fraudă comercială și tranzacție efectuată prin înșelăciune informatică / phishing.
2. Furnizarea unui **număr de înregistrare / număr de sesizare oficial** pentru acest dosar, pentru a putea monitoriza evoluția cazului și pentru a-l anexa la plângerea înaintată autorităților competente.
3. Notificarea departamentului de risc și monitorizare a tranzacțiilor pentru blocarea oricăror alte tentative de debitare provenite dinspre această rețea.”

---

## 🇬🇧 English Translation (First-Person Statement)

**To:** Banca Comercială Română (BCR) – Fraud Prevention, Cards & Dispute Department  
**Subject:** Cyber Fraud Notification (Phishing) & Formal Request to Open a Chargeback Dispute  
**Channel:** Phone Support Line / Branch Counter Submission  

---

### Statement Script / Direct First-Person Disclosure:

> "Hello, I am contacting you to report an incident of **cyber fraud (e-commerce phishing / brand impersonation)** and to formally request the opening of a **transaction dispute (chargeback procedure)** to recover the fraudulently debited funds.
> 
> Below are the comprehensive financial and technical forensic details required for your fraud investigation file:

#### 1. Nature of the Incident and Modus Operandi:
- This incident involves a **phishing and social engineering scheme through retail brand spoofing (unauthorized impersonation of Media Galaxy)**.
- Payment card details were captured via a fraudulent cloned storefront unlawfully displaying the Media Galaxy trademark and visual identity, propagated via sponsored advertisements on social media (TikTok) advertising fake steep discounts on household items.

#### 2. Details of the Disputed Transaction:
- **Debited Amount:** Approximately **€21 and several cents** (~**118 RON**).
- **Date & Time:** Processed without lawful merchant delivery on September 16, 2026.
- **Billing Descriptor:** Appears under a suspicious shell merchant entry (descriptor *'morvethemi london'*), having zero correlation with the genuine corporate entity of Media Galaxy / Altex Romania.

#### 3. Payment Architecture & Immediate Containment Actions:
- The payment routed through a card tied to the Revolut ecosystem, which is topped up directly from my primary BCR bank account.
- Please note that to prevent recurring debits or subsequent account compromise, **the compromised card was immediately deleted and permanently blocked** in the application right after discovering the unauthorized charge.

#### 4. Technical Indicators of Compromise (IoCs for the Antifraud Department):
To assist your bank's fraud investigations unit and network chargeback routing:
- **Phishing Lure Subdomain:** `mediagalaxy.voetbalshop-nlco.com` (running on hijacked/compromised infrastructure).
- **Scam Confirmation Email Relay:** The fraudulent receipt was delivered from `noreply@email.worvixglobal.com` (domain `worvixglobal.com`), with the suspicious reply-to inbox `brekerfurught@outlook.com`.
- **Centralized Backend Phishing C2:** Data was transmitted to `yiyangsaas.com` (proxied behind Cloudflare).

#### 5. My Formal Request:
1. Immediate registration of my **formal transaction dispute (chargeback request)** on the grounds of commercial fraud and cyber deception/phishing.
2. Issuance of an official **incident/claim registration tracking number** for this dispute, so that I can follow up on resolution progress and present it to law enforcement and regulatory authorities.
3. Escalation to your fraud risk team to flag and blacklist any recurring billing requests associated with this threat actor network."
