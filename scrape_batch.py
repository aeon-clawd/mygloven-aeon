import json, re, subprocess, os, sys

urls = open("all_urls.txt").read().strip().split("\n")
venues = []

if os.path.exists("venues.json"):
    with open("venues.json", "r") as f:
        venues = json.load(f)
    processed = {v["source_url"] for v in venues}
else:
    processed = set()

to_process = [u for u in urls if u not in processed]
print(f"To process: {len(to_process)}")

for i in range(0, len(to_process), 5):
    batch = to_process[i:i+5]
    for url in batch:
        try:
            res = subprocess.run(["curl", "-s", "--max-time", "10", url], capture_output=True, text=True)
            html = res.stdout
            found_ld = False
            for m in re.findall(r'<script[^>]*type="application/ld\+json"[^>]*>(.*?)</script>', html, re.DOTALL):
                try:
                    d = json.loads(m)
                    if isinstance(d, dict) and d.get("@type") == "LocalBusiness":
                        d["source_url"] = url
                        d["slug"] = url.rstrip("/").split("/")[-1]
                        venues.append(d)
                        found_ld = True
                        break
                except: pass
        except: pass
    
    # Save every batch
    with open("venues.json", "w") as f:
        json.dump(venues, f, ensure_ascii=False, indent=2)
    
    print(f"Progress: {min(i+5, len(to_process))}/{len(to_process)}", file=sys.stderr)

print(f"Total venues: {len(venues)}")
