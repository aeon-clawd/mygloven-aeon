import json, re, subprocess, os

urls = open("all_urls.txt").read().strip().split("\n")
venues = []

# Use xargs for parallel fetching, 10 at a time
for i in range(0, len(urls), 10):
    batch = urls[i:i+10]
    for url in batch:
        try:
            result = subprocess.run(["curl", "-s", "--max-time", "5", url], capture_output=True, text=True)
            html = result.stdout
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
        except:
            pass
    print(f"Done {min(i+10, len(urls))}/{len(urls)}")

with open("venues.json", "w") as f:
    json.dump(venues, f, ensure_ascii=False, indent=2)
print(f"Total: {len(venues)}")
