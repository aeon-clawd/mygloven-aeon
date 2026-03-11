import subprocess, re
terms = ["sala", "club", "espacio", "bar", "teatro", "garage", "village", "urban", "festival", "arena", "music", "live", "beach", "hotel", "sky", "rooftop", "palace", "palau", "matadero", "disco", "lounge", "pub", "cafe", "market", "gallery", "inn", "ocean", "atlantic", "casino", "temple", "mansion", "house", "republic", "tribe", "shake", "magma", "maravillas", "marginal", "miscelanea", "mercantic", "muelle", "pappenheim", "pedro", "boite", "brooklyn", "imaginario", "cccb", "ohla", "expo", "elhixir", "anden", "akuarela", "almanac", "andana", "art", "azoka", "b12", "back", "bahia", "bilbaina", "blkswn", "central", "graca", "hotclube", "k-urban", "la-sonora", "las-dalias", "las-rocas", "le-club", "lega", "lucy", "more", "new-one", "portobello", "silk", "sueno", "super", "tapefeed", "tennessee", "times", "torviscas", "trebor", "tribeca", "zambra"]
urls = set()
for term in terms:
    res = subprocess.run(["curl", "-s", f"https://beta.mygloven.com/?s={term}&post_type=job_listing"], capture_output=True, text=True)
    found = re.findall(r'href="(https://beta.mygloven.com/listing/[^/"]+/)', res.stdout)
    urls.update(found)
with open("all_urls.txt", "w") as f:
    f.write("\n".join(sorted(list(urls))))
print(f"Found {len(urls)} URLs")
