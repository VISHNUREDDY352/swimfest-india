import urllib.request, json
r = urllib.request.urlopen('http://localhost:5000/api/swimmers')
data = json.loads(r.read())
for s in data:
    print(f"{s['swimmer_id']} | {s['full_name']} | Mobile: {s['parent_mobile']}")
