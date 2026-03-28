import urllib.request
import urllib.parse
import json

url = 'https://api.gumroad.com/v2/licenses/verify'
data = urllib.parse.urlencode({
    'product_permalink': 'ipizlr',
    'license_key': '6E5CC330-E91C4A44-8A06ECB7-4EB36202'
}).encode('utf-8')

try:
    req = urllib.request.Request(url, data=data)
    with urllib.request.urlopen(req) as response:
        result = response.read()
        print(json.loads(result.decode('utf-8')))
except urllib.error.HTTPError as e:
    err_msg = e.read().decode('utf-8')
    print("HTTP Error:", e.code)
    print(err_msg)
