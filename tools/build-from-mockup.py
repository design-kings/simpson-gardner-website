import re, os, base64, hashlib, sys

ROOT = os.environ.get('SG_ROOT') or os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC  = os.path.join(ROOT, 'versions', 'mockup-v3-single-file.html')
IMG  = os.path.join(ROOT, 'assets', 'img')
os.makedirs(IMG, exist_ok=True)

s = open(SRC, encoding='utf-8').read()

# ---------- 1. extract CSS ----------
m = re.search(r'<style>(.*?)</style>', s, re.S)
css = m.group(1).strip()
s = s[:m.start()] + '<!--STYLE-->' + s[m.end():]

# ---------- 2. extract JS ----------
m = re.search(r'<script>(.*?)</script>', s, re.S)
js = m.group(1).strip()
s = s[:m.start()] + '<!--SCRIPT-->' + s[m.end():]

# ---------- 3. extract lightbox markup (shared, needed by the JS on every page) ----------
m = re.search(r'<div class="lb" id="lb".*?\n</div>\n', s, re.S)
lightbox = m.group(0).strip()
s = s[:m.start()] + s[m.end():]

# ---------- 4. externalise images ----------
seen = {}
def to_file(match):
    uri = match.group(0)
    if uri in seen:
        return seen[uri]
    mime, b64 = re.match(r'data:image/([a-z]+);base64,(.+)', uri, re.S).groups()
    raw = base64.b64decode(b64)
    ext = 'jpg' if mime == 'jpeg' else mime
    name = 'img-%s.%s' % (hashlib.sha1(raw).hexdigest()[:10], ext)
    path = os.path.join(IMG, name)
    if not os.path.exists(path):
        open(path, 'wb').write(raw)
    rel = 'assets/img/' + name
    seen[uri] = rel
    return rel

n_before = len(re.findall(r'data:image/[a-z]+;base64,', s))
s = re.sub(r'data:image/[a-z]+;base64,[A-Za-z0-9+/=]+', to_file, s)
print('image refs replaced: %d  |  unique files written: %d' % (n_before, len(set(seen.values()))))

# ---------- 5. split body into the four page blocks ----------
body = s.split('<body>', 1)[1].split('</body>', 1)[0]
parts = re.split(r'<!-- PAGE \d+: [A-Z]+ -->', body)
blocks = [p for p in parts[1:]]
assert len(blocks) == 4, 'expected 4 page blocks, got %d' % len(blocks)

# drop the mockup divider bar from each block
blocks = [re.sub(r'<div id="[^"]*" class="page-divider">.*?</div>\s*', '', b, flags=re.S).strip()
          for b in blocks]

# ---------- 6. page metadata ----------
PAGES = [
    ('index.html',     'home',      'Simpson &amp; Gardner | Custom Home Builders in Decatur &amp; North Texas',
     'Custom home builders serving Decatur, Wise County, Bridgeport, Fort Worth and Denton. Guaranteed pricing, daily oversight and a builder warranty.'),
    ('about.html',     'about',     'About | Simpson &amp; Gardner Custom Home Builders',
     'Building custom homes across North Texas since 2004. Meet Joey Gardner and see our four-step process from consultation to handover.'),
    ('portfolio.html', 'portfolio', 'Portfolio | Simpson &amp; Gardner Custom Home Builders',
     'Browse custom homes built across Decatur, Wise County, Bridgeport, Fort Worth and Denton, in Modern Farmhouse, Texas Ranch and French Country styles.'),
    ('contact.html',   'contact',   'Contact | Simpson &amp; Gardner Custom Home Builders',
     'Tell us about your build. Call 817-723-9146 or send a message and we will be in touch within one business day.'),
]

LINKS = {'#home': 'index.html', '#about': 'about.html',
         '#portfolio': 'portfolio.html', '#contact-page': 'contact.html'}

def rewrite_links(html, slug):
    for anchor, target in LINKS.items():
        html = html.replace('href="%s"' % anchor, 'href="%s"' % target)
    # cross-page anchors: project detail sections live on portfolio, #follow lives on home
    if slug != 'portfolio':
        html = re.sub(r'href="#(project-[^"]+)"', r'href="portfolio.html#\1"', html)
    if slug != 'home':
        html = html.replace('href="#follow"', 'href="index.html#follow"')
    # mark the current page in the nav
    html = html.replace('<a href="%s">' % LINKS['#' + ('contact-page' if slug == 'contact' else slug)],
                        '<a href="%s" class="active" aria-current="page">' % LINKS['#' + ('contact-page' if slug == 'contact' else slug)], 1)
    return html

# ---------- 7. shared CSS additions / removals ----------
for dead in [
  '.page-divider{background:var(--cream);padding:20px 60px;border-top:3px solid var(--gold);}',
  ".page-divider span{font-family:'Jost',sans-serif;font-size:10px;font-weight:500;letter-spacing:0.2em;text-transform:uppercase;color:var(--gold);}",
  '.page-divider{padding:16px 24px;}',
]:
    css = css.replace(dead, '')
css += "\n/* current page indicator */\n.nav-links a.active{color:var(--charcoal);border-bottom:1px solid var(--gold);padding-bottom:2px;}\n"

open(os.path.join(ROOT, 'assets', 'site.css'), 'w', encoding='utf-8').write(css + '\n')
open(os.path.join(ROOT, 'assets', 'site.js'),  'w', encoding='utf-8').write(js + '\n')

FONTS = ('<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:'
         'ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Jost:wght@300;400;500'
         '&display=swap" rel="stylesheet">')

TPL = '''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{title}</title>
<meta name="description" content="{desc}">
{fonts}
<link rel="stylesheet" href="assets/site.css">
</head>
<body>

{content}

{lightbox}
<script src="assets/site.js"></script>
</body>
</html>
'''

for (fname, slug, title, desc), block in zip(PAGES, blocks):
    html = TPL.format(title=title, desc=desc, fonts=FONTS,
                      content=rewrite_links(block, slug),
                      lightbox=rewrite_links(lightbox, slug))
    open(os.path.join(ROOT, fname), 'w', encoding='utf-8').write(html)
    print('%-15s %8.1f KB' % (fname, len(html.encode()) / 1024))

print('site.css %.1f KB | site.js %.1f KB' % (len(css.encode())/1024, len(js.encode())/1024))
