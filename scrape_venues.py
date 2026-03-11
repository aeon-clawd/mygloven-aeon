import json, re, sys, time
import urllib.request

urls = open("all_urls.txt").read().strip().split("\n")
venues = []

for i, url in enumerate(urls):
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        html = urllib.request.urlopen(req, timeout=10).read().decode("utf-8", errors="ignore")
        
        # Extract JSON-LD
        for m in re.findall(r'<script[^>]*type="application/ld\+json"[^>]*>(.*?)</script>', html, re.DOTALL):
            try:
                d = json.loads(m)
                if d.get("@type") == "LocalBusiness":
                    d["source_url"] = url
                    d["slug"] = url.rstrip("/").split("/")[-1]
                    venues.append(d)
                    break
            except:
                pass
        
        if (i+1) % 20 == 0:
            print(f"Scraped {i+1}/{len(urls)}...", file=sys.stderr)
        time.sleep(0.1)
    except Exception as e:
        print(f"Error {url}: {e}", file=sys.stderr)

with open("venues.json", "w") as f:
    json.dump(venues, f, ensure_ascii=False, indent=2)

print(f"Total venues scraped: {len(venues)}")
