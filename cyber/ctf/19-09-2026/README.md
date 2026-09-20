# CTF Write-Ups & Automation Tooling

Directorul `cyber/ctf` centralizează writeup-urile tehnice și scripturile de exploatare dezvoltate pentru provocările din cadrul platformei InvataCyber.ro.

* **Raport Tehnic Complet (Centralizat):** [`WRITEUP.md`](WRITEUP.md)

---

## 1. Index Write-Ups

| Provocare | Categorie | Vulnerabilitate | Vector de Atac & Impact | Documentație |
| :--- | :--- | :--- | :--- | :--- |
| **The Blog** | Web / Client-Side | Stored XSS | Formular contact nesanitizat $\rightarrow$ Exfiltrare date din contextul editorului | [`writeup_01_the_blog_xss.md`](writeup_01_the_blog_xss.md) |
| **Portal InvataCyber.ro** | Web / Database | Blind Boolean SQLi | Cookie `TrackingId` $\rightarrow$ SQLite inference $\rightarrow$ Preluare consolă `/console` | [`writeup_02_portal_lockdown_sqli.md`](writeup_02_portal_lockdown_sqli.md) |
| **Redacția CMS** | Web / Server-Side | Broken Access Control & SSTI | Panou editor neautentificat $\rightarrow$ Jinja2 SSTI $\rightarrow$ RCE `/flag.txt` | [`writeup_03_cms_editor_ssti.md`](writeup_03_cms_editor_ssti.md) |


---

## 2. Structura Scripturilor de Exploatare

### Provocarea 1: The Blog (Stored XSS)
* [`payload.js`](payload.js): Script JavaScript asincron pentru interogarea `/admin` și exfiltrarea conținutului către webhook extern.
* [`solver.py`](solver.py): Script de automatizare HTTP POST pentru injectarea payload-ului XSS în formularul de contact.

### Provocarea 2: Portal InvataCyber.ro (Blind SQLi)
* [`sql_solve.py`](sql_solve.py): Verificator rapid al condițiilor True/False pe cookie-ul `TrackingId`.
* [`extract_creds.py`](extract_creds.py): PoC de validare pentru evaluarea expresiilor SQL booleene.
* [`flag.py`](flag.py): Testarea existenței tabelelor de sistem SQLite (`sqlite_master`).
* [`dump_sqlite.py`](dump_sqlite.py): Enumerarea tabelelor din baza de date SQLite caracter cu caracter.
* [`dump_schema.py`](dump_schema.py): Extragerea definiției DDL a tabelei de tracking.
* [`dump_all_schema.py`](dump_all_schema.py): Extragerea schemei complete a bazei de date.
* [`dump_users.py`](dump_users.py): Extragerea credențialelor de acces (`username`, `password`) din tabela `users`.
* [`solver_portal.py`](solver_portal.py): Scaner pentru identificarea consolei administrative ascunse (`/console`, `/login-admin`).

### Provocarea 3: Redacția CMS (SSTI to RCE)
* [`blog_flag.py`](blog_flag.py): Script de exploatare automată a panoului de editor fără SSO și execuție de comenzi prin Jinja2 SSTI (`cat /flag.txt`).

---

## 3. Utilizare Rapidă

Pentru rularea scripturilor de exploatare este necesară instalarea dependențelor minime din `requirements.txt`:

```bash
pip install -r requirements.txt
```
