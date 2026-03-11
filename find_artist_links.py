import json, re, subprocess, sys

artists = json.load(open("src/data/artists.json"))

def search_artist(name):
    """Search for artist profiles on major platforms"""
    # Clean name for search
    clean = re.sub(r'\|.*$', '', name).strip()
    clean = re.sub(r'&amp;', '&', clean)
    
    links = {}
    
    # Search with web_search equivalent (using curl to a search engine)
    query = f"{clean} site:open.spotify.com OR site:instagram.com OR site:soundcloud.com OR site:youtube.com musician dj"
    
    # Use Google search
    try:
        res = subprocess.run(
            ["curl", "-s", "--max-time", "5", "-A", "Mozilla/5.0",
             f"https://html.duckduckgo.com/html/?q={clean}+spotify+soundcloud+instagram+dj+musician"],
            capture_output=True, text=True
        )
        html = res.stdout
        
        # Extract platform URLs
        spotify = re.findall(r'https://open\.spotify\.com/artist/[a-zA-Z0-9]+', html)
        instagram = re.findall(r'https://(?:www\.)?instagram\.com/([a-zA-Z0-9_.]+)', html)
        soundcloud = re.findall(r'https://(?:www\.)?soundcloud\.com/([a-zA-Z0-9_-]+)', html)
        youtube = re.findall(r'https://(?:www\.)?youtube\.com/(?:channel|c|@)([a-zA-Z0-9_-]+)', html)
        
        if spotify: links['spotify'] = spotify[0]
        if instagram: 
            # Filter out generic instagram pages
            valid = [i for i in instagram if i not in ('p', 'explore', 'accounts', 'reel')]
            if valid: links['instagram'] = f"https://instagram.com/{valid[0]}"
        if soundcloud:
            valid = [s for s in soundcloud if s not in ('search', 'stream', 'discover')]
            if valid: links['soundcloud'] = f"https://soundcloud.com/{valid[0]}"
        if youtube:
            links['youtube'] = f"https://youtube.com/@{youtube[0]}"
    except:
        pass
    
    return links

for a in artists:
    name = a["name"]
    desc = a.get("description", "")
    
    # First check existing links from description
    existing = {}
    spotify_m = re.findall(r'https?://[^\s<"]*spotify\.com[^\s<"]*', desc)
    if spotify_m: existing['spotify'] = spotify_m[0]
    ig_m = re.findall(r'https?://[^\s<"]*instagram\.com/[^\s<"]+', desc)
    if ig_m: existing['instagram'] = ig_m[0]
    sc_m = re.findall(r'https?://[^\s<"]*soundcloud\.com/[^\s<"]+', desc)
    if sc_m: existing['soundcloud'] = sc_m[0]
    yt_m = re.findall(r'https?://[^\s<"]*(?:youtube\.com|youtu\.be)/[^\s<"]+', desc)
    if yt_m: existing['youtube'] = yt_m[0]
    web_m = re.findall(r'https?://(?!.*(?:spotify|youtube|youtu\.be|soundcloud|instagram|mygloven|amazon))[a-zA-Z0-9.-]+\.[a-z]{2,}[^\s<"]*', desc)
    if web_m: existing['web'] = web_m[0]
    
    # If missing links, search
    if len(existing) < 2:
        found = search_artist(name)
        for k, v in found.items():
            if k not in existing:
                existing[k] = v
    
    # Store links in the artist data
    a['links'] = existing
    status = "✅" if existing else "❌"
    print(f"{status} {name}: {list(existing.keys())}", file=sys.stderr)

with open("src/data/artists.json", "w") as f:
    json.dump(artists, f, ensure_ascii=False, indent=2)

# Also copy to public
with open("public/api/artists.json", "w") as f:
    json.dump(artists, f, ensure_ascii=False, indent=2)

print(f"\nDone. {sum(1 for a in artists if a.get('links'))} artists with links")
