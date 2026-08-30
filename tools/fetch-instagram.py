#!/usr/bin/env python3
"""Pull recent Instagram posts into assets/feed/ so the site can render a live,
scrollable feed without a third-party widget.

Uses "Instagram API with Instagram Login" (graph.instagram.com), which needs an
Instagram Business or Creator account. No Facebook Page link required.

Env:
  IG_TOKEN   long-lived Instagram access token (required)
  IG_LIMIT   how many posts to keep (default 24)

Writes:
  assets/feed/instagram.json   post metadata the page renders from
  assets/feed/img/<id>.jpg     a local copy of each image, so the feed never
                               breaks when Instagram's CDN URLs expire

Exit codes:
  0 changed / wrote new data      1 error      78 no change, nothing to commit
"""
import json, os, sys, urllib.request, urllib.parse, urllib.error

ROOT   = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FEED   = os.path.join(ROOT, 'assets', 'feed')
IMGDIR = os.path.join(FEED, 'img')
JSONF  = os.path.join(FEED, 'instagram.json')
LIMIT  = int(os.environ.get('IG_LIMIT', '24'))
TOKEN  = os.environ.get('IG_TOKEN', '').strip()

def die(msg):
    print('ERROR: ' + msg, file=sys.stderr)
    sys.exit(1)

def get(url):
    try:
        with urllib.request.urlopen(url, timeout=30) as r:
            return json.load(r)
    except urllib.error.HTTPError as e:
        die('%s -> %s %s' % (url.split('?')[0], e.code, e.read()[:400].decode('utf-8', 'replace')))

if not TOKEN:
    die('IG_TOKEN is not set. Add it as a repository secret.')

os.makedirs(IMGDIR, exist_ok=True)

# --- keep the token alive; long-lived tokens last 60 days and can be extended ---
ref = get('https://graph.instagram.com/refresh_access_token?' + urllib.parse.urlencode({
    'grant_type': 'ig_refresh_token', 'access_token': TOKEN}))
days = int(ref.get('expires_in', 0)) // 86400
print('token valid for another %d days' % days)
if days < 10:
    print('::warning::Instagram token expires in %d days. Rotate it soon.' % days)
# expose the refreshed token so the workflow can persist it if configured to
if os.environ.get('GITHUB_OUTPUT') and ref.get('access_token'):
    with open(os.environ['GITHUB_OUTPUT'], 'a') as fh:
        fh.write('refreshed_token=%s\n' % ref['access_token'])
        fh.write('days_left=%d\n' % days)

# --- fetch recent media ---
fields = 'id,caption,media_type,media_url,permalink,thumbnail_url,timestamp'
data = get('https://graph.instagram.com/me/media?' + urllib.parse.urlencode({
    'fields': fields, 'limit': LIMIT, 'access_token': TOKEN}))
items = [m for m in data.get('data', []) if m.get('media_type') in
         ('IMAGE', 'CAROUSEL_ALBUM', 'VIDEO')][:LIMIT]
if not items:
    die('Instagram returned no media.')

posts = []
for m in items:
    src = m.get('thumbnail_url') if m.get('media_type') == 'VIDEO' else m.get('media_url')
    if not src:
        continue
    cap = (m.get('caption') or '').strip().replace('\n', ' ')
    posts.append({
        'id':        m['id'],
        'permalink': m['permalink'],
        'caption':   cap[:180],
        'type':      m['media_type'],
        'timestamp': m.get('timestamp', ''),
        'img':       'assets/feed/img/%s.jpg' % m['id'],
        '_src':      src,
    })

# --- skip everything if the post set has not changed ---
old_ids = []
if os.path.exists(JSONF):
    try:
        old_ids = [p['id'] for p in json.load(open(JSONF))['posts']]
    except Exception:
        pass
if old_ids == [p['id'] for p in posts] and all(
        os.path.exists(os.path.join(ROOT, p['img'])) for p in posts):
    print('no new posts, nothing to do')
    sys.exit(78)

# --- download images locally so expiring CDN links never break the feed ---
for p in posts:
    dest = os.path.join(ROOT, p['img'])
    if os.path.exists(dest):
        continue
    try:
        with urllib.request.urlopen(p['_src'], timeout=60) as r, open(dest, 'wb') as fh:
            fh.write(r.read())
        print('downloaded %s' % os.path.basename(dest))
    except Exception as e:
        print('::warning::could not download %s (%s)' % (p['id'], e))
        p['img'] = None

posts = [p for p in posts if p['img']]
for p in posts:
    p.pop('_src', None)

# --- prune images that are no longer in the feed ---
keep = {os.path.basename(p['img']) for p in posts}
for f in os.listdir(IMGDIR):
    if f not in keep:
        os.remove(os.path.join(IMGDIR, f))
        print('pruned %s' % f)

json.dump({'updated': __import__('datetime').datetime.utcnow().isoformat() + 'Z',
           'profile': 'https://www.instagram.com/simpsonandgardner/',
           'posts': posts}, open(JSONF, 'w'), indent=1)
print('wrote %d posts' % len(posts))
