#!/usr/bin/env python3
"""
OrgLab static site builder (zero dependencies).

  _src/partials/header.html, footer.html   shared chrome
  _src/pages/**/*.html                     page bodies with a front-matter block:

      ---
      title: Page title
      description: Meta description (150-160 chars)
      crumb: Breadcrumb label (optional)
      scripts: tools            (optional: loads data.js + tools.js)
      exit: 1                   (optional: enables exit-intent lead magnet)
      priority: 0.8             (optional: sitemap priority)
      noindex: 1                (optional)
      image: assets/img/og.png  (optional: social image)
      ---
      <main>...</main>

Run:  python3 build.py        -> writes static HTML to the repo root + sitemap.xml + data/search-index.json
Add a page: drop a new file in _src/pages/ and rebuild. Relative links ({{BASE}}) keep it working on
GitHub Pages project URLs (user.github.io/repo/) and on a custom domain.
"""
import json, re, html, datetime, pathlib

ROOT = pathlib.Path(__file__).parent
SRC = ROOT / "_src"
SITE_URL = "https://orglab.com"   # canonical domain (change if needed)
TODAY = datetime.date.today().isoformat()

HEADER = (SRC / "partials/header.html").read_text()
FOOTER = (SRC / "partials/footer.html").read_text()

HEAD = """<!doctype html>
<html lang="en" data-base="{{BASE}}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<meta name="description" content="{desc}">
{robots}<link rel="canonical" href="{canonical}">
<meta property="og:type" content="{ogtype}">
<meta property="og:site_name" content="OrgLab">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<meta property="og:url" content="{canonical}">
<meta property="og:image" content="{SITE}/{image}">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#0e3b2e">
<link rel="icon" href="{{BASE}}assets/img/favicon.svg" type="image/svg+xml">
<link rel="manifest" href="{{BASE}}manifest.webmanifest">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="{{BASE}}assets/css/style.css">
<script>try{{var t=localStorage.getItem("ol-theme");if(t)document.documentElement.dataset.theme=JSON.parse(t)}}catch(e){{}}</script>
<script type="application/ld+json">{ld}</script>
</head>
<body{bodyattr}>
"""

SCRIPTS = """<script src="{{BASE}}assets/js/config.js"></script>
<script src="{{BASE}}assets/js/main.js" defer></script>
"""
TOOL_SCRIPTS = """<script src="{{BASE}}assets/js/data.js" defer></script>
<script src="{{BASE}}assets/js/tools.js" defer></script>
"""

def parse(text):
    m = re.match(r"---\n(.*?)\n---\n", text, re.S)
    meta = {}
    if m:
        for line in m.group(1).splitlines():
            if ":" in line:
                k, v = line.split(":", 1)
                meta[k.strip()] = v.strip()
        text = text[m.end():]
    return meta, text

def strip_tags(s):
    s = re.sub(r"<(script|style)[^>]*>.*?</\1>", " ", s, flags=re.S)
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", s))).strip()

pages, index = [], []
for src in sorted((SRC / "pages").rglob("*.html")):
    rel = src.relative_to(SRC / "pages").as_posix()
    depth = rel.count("/")
    base = "../" * depth
    meta, body = parse(src.read_text())
    title = meta.get("title", "OrgLab")
    desc = meta.get("description", "")
    url_path = "" if rel == "index.html" else rel
    canonical = f"{SITE_URL}/{url_path}"
    ld = [{"@context": "https://schema.org", "@type": "Organization", "name": "OrgLab", "alternateName": "The Organic Lab",
           "url": SITE_URL, "logo": f"{SITE_URL}/assets/img/favicon.svg"}]
    if rel == "index.html":
        ld.append({"@context": "https://schema.org", "@type": "WebSite", "name": "OrgLab", "url": SITE_URL,
                   "potentialAction": {"@type": "SearchAction", "target": f"{SITE_URL}/?q={{search_term_string}}",
                                       "query-input": "required name=search_term_string"}})
    else:
        items = [{"@type": "ListItem", "position": 1, "name": "Home", "item": SITE_URL + "/"}]
        if "/" in rel:
            sec = rel.split("/")[0]
            items.append({"@type": "ListItem", "position": 2, "name": sec.capitalize(), "item": f"{SITE_URL}/{sec}/"})
        items.append({"@type": "ListItem", "position": len(items) + 1, "name": meta.get("crumb", title.split("|")[0].strip()), "item": canonical})
        ld.append({"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": items})
    bodyattr = " data-exit" if meta.get("exit") else ""
    head = HEAD.format(title=html.escape(title), desc=html.escape(desc), canonical=canonical, SITE=SITE_URL,
                       image=meta.get("image", "assets/img/og.png"),
                       ogtype="article" if rel.startswith("learn/") and rel != "learn/index.html" else "website",
                       robots='<meta name="robots" content="noindex">\n' if meta.get("noindex") else "",
                       ld=json.dumps(ld if len(ld) > 1 else ld[0], separators=(",", ":")), bodyattr=bodyattr)
    head = head.replace("{BASE}", "{{BASE}}")
    if rel == "404.html":  # 404 is served at any depth: set <base> so relative links resolve (github.io project path or custom domain)
        head = head.replace("<meta charset=\"utf-8\">", "<meta charset=\"utf-8\">\n<script>document.write('<base href=\"'+(location.hostname.endsWith('github.io')?'/orglab-com/':'/')+'\">')</script>")
    out = head + HEADER + body + FOOTER + SCRIPTS + (TOOL_SCRIPTS if "tools" in meta.get("scripts", "") else "") + "</body>\n</html>\n"
    out = out.replace("{{BASE}}", base).replace("{{TODAY}}", TODAY)
    dest = ROOT / rel
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_text(out)
    if not meta.get("noindex"):
        pages.append((url_path, meta.get("priority", "0.7")))
        text = strip_tags(body)
        index.append({"u": rel, "t": title.split("|")[0].strip(), "d": desc, "k": text[:600]})
    print("built", rel)

sm = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
for p, pr in pages:
    sm.append(f"  <url><loc>{SITE_URL}/{p}</loc><lastmod>{TODAY}</lastmod><priority>{pr}</priority></url>")
sm.append("</urlset>")
(ROOT / "sitemap.xml").write_text("\n".join(sm) + "\n")
(ROOT / "data").mkdir(exist_ok=True)
(ROOT / "data/search-index.json").write_text(json.dumps(index, ensure_ascii=False))
print(f"{len(pages)} pages, sitemap + search index written")
