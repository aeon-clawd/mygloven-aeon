import json, re, subprocess, sys

urls = [u.strip() for u in open("/tmp/new_to_scrape.txt").readlines() if u.strip()]
new_venues = []
new_artists = []

for i, url in enumerate(urls):
    try:
        res = subprocess.run(["curl", "-s", "--max-time", "8", url], capture_output=True, text=True)
        html = res.stdout
        for m in re.findall(r'<script[^>]*type="application/ld\+json"[^>]*>(.*?)</script>', html, re.DOTALL):
            try:
                d = json.loads(m)
                if isinstance(d, dict) and d.get("@type") == "LocalBusiness":
                    d["source_url"] = url
                    d["slug"] = url.rstrip("/").split("/")[-1]
                    d["name"] = (d.get("name","")).replace("&amp;","&")
                    desc = d.get("description","")
                    d["description"] = desc.replace("&#039;","'").replace("&amp;","&").replace("&nbsp;"," ").replace("\r\n","\n")
                    
                    addr = d.get("address","")
                    if isinstance(addr, str):
                        parts = [p.strip() for p in addr.split(",")]
                        city = re.sub(r'^\d{4,5}\s*','',parts[-2]).strip().replace("&#039;","'") if len(parts)>=3 else (re.sub(r'^\d{4,5}\s*','',parts[0]).strip() if len(parts)>=2 else "")
                        country = parts[-1] if parts else ""
                        if country in ("Spain","España"): country = "España"
                        d["city"] = city
                        d["country"] = country
                    
                    geo = d.get("geo",{})
                    if geo.get("latitude") and geo.get("longitude"):
                        new_venues.append(d)
                    else:
                        new_artists.append(d)
                    break
            except: pass
    except: pass
    
    if (i+1) % 50 == 0:
        print(f"Progress: {i+1}/{len(urls)} (venues:{len(new_venues)} artists:{len(new_artists)})", file=sys.stderr)

# Merge with existing
existing_venues = json.load(open("src/data/venues.json"))
existing_artists = json.load(open("src/data/artists.json"))

all_venues = existing_venues + new_venues
all_artists = existing_artists + new_artists

with open("src/data/venues.json","w") as f:
    json.dump(all_venues, f, ensure_ascii=False, indent=2)
with open("src/data/artists.json","w") as f:
    json.dump(all_artists, f, ensure_ascii=False, indent=2)

print(f"New venues: {len(new_venues)}, New artists: {len(new_artists)}")
print(f"TOTAL venues: {len(all_venues)}, TOTAL artists: {len(all_artists)}")
