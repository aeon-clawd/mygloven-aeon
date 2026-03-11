import json, re, subprocess

new_urls = open("/tmp/all_listings.txt").read().strip().split("\n")
existing = json.load(open("src/data/venues.json"))
existing_slugs = {v["slug"] for v in existing}

new_urls = [u for u in new_urls if u.strip() and u.rstrip("/").split("/")[-1] not in existing_slugs]

new_items = []
artists = []

for url in new_urls:
    try:
        res = subprocess.run(["curl", "-s", "--max-time", "8", url], capture_output=True, text=True)
        html = res.stdout
        for m in re.findall(r'<script[^>]*type="application/ld\+json"[^>]*>(.*?)</script>', html, re.DOTALL):
            try:
                d = json.loads(m)
                if isinstance(d, dict) and d.get("@type") == "LocalBusiness":
                    d["source_url"] = url
                    d["slug"] = url.rstrip("/").split("/")[-1]
                    # Classify: if no geo coordinates, likely an artist
                    geo = d.get("geo", {})
                    has_coords = geo.get("latitude") and geo.get("longitude")
                    if has_coords:
                        new_items.append(d)
                    else:
                        artists.append(d)
                    break
            except: pass
    except: pass

print(f"New venues (with coords): {len(new_items)}")
print(f"Artists (no coords): {len(artists)}")
for a in artists:
    print(f"  🎵 {a['name']}")

# Add new venues to existing
all_venues = existing + new_items
with open("src/data/venues.json", "w") as f:
    json.dump(all_venues, f, ensure_ascii=False, indent=2)

# Save artists separately
with open("src/data/artists.json", "w") as f:
    json.dump(artists, f, ensure_ascii=False, indent=2)

print(f"\nTotal venues now: {len(all_venues)}")
print(f"Total artists: {len(artists)}")
