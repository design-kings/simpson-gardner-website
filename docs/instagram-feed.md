# Live Instagram feed

The home page shows a scrollable feed of recent Instagram posts. It does not use
Instagram's own embed, because that returns exactly six posts and cannot scroll.

## How it works

1. `.github/workflows/refresh-instagram.yml` runs once a day.
2. It calls `tools/fetch-instagram.py`, which asks Instagram for recent posts.
3. The script saves the post details to `assets/feed/instagram.json` and downloads a
   copy of each photo into `assets/feed/img/`, then commits both, but only when the
   posts have actually changed.
4. The page reads that JSON and renders the tiles.

Photos are copied into the repo on purpose. Instagram's image URLs expire after a
short time, so pointing at them directly would leave broken images within a day.

If `assets/feed/instagram.json` is missing or empty, the page quietly falls back to
Instagram's six-post embed. That is what it shows today. Nothing breaks while the
token is missing, expired, or being set up.

## What you need

An Instagram **Business** or **Creator** account. A personal account will not work.
A Facebook Page link is **not** required. That is only needed for the older
Facebook Login route, which we are not using.

## Setup

**1. Confirm the account type**

In the Instagram app: Settings → Account type and tools. If it offers "Switch to
professional account," it is still personal and needs switching. Free, reversible,
and it does not change how the profile looks to visitors.

**2. Create a Meta app**

Go to developers.facebook.com → My Apps → Create app. Pick the option for other or
business use. Then add the **Instagram** product and choose the setup path that uses
**Instagram login**, not Facebook login.

**3. Generate a token**

In the Instagram product settings, add the Simpson & Gardner Instagram account as a
tester or connected account, accept the invite from that account, then generate an
access token. You want the long-lived one, valid 60 days. It needs read access to the
account's own media, which Meta currently calls `instagram_business_basic`.

Meta rearranges this interface regularly. If the wording has moved, look for
"Instagram API setup with Instagram login" and the token generator inside it.

**4. Store the token in GitHub**

Repo → Settings → Secrets and variables → Actions → New repository secret.

    Name:   IG_TOKEN
    Secret: the token from step 3

Secrets are encrypted and are not visible to anyone afterward, including you. Paste
it here rather than into a chat, email or document.

**5. Run it**

Repo → Actions → "Refresh Instagram feed" → Run workflow. It should finish in under a
minute and commit the feed. Refresh the site and the panel becomes scrollable.

## Keeping the token alive

Instagram tokens last 60 days. Every daily run extends the token and prints how many
days remain, and the run warns loudly under ten days.

The refreshed token cannot be saved back automatically unless the workflow is allowed
to update its own secrets. Two options:

- **Manual, default.** Repeat steps 3 and 4 about every 50 days. Takes two minutes.
- **Automatic.** Add a second secret named `REPO_ADMIN_TOKEN`, a fine-grained personal
  access token scoped to this repo with **Secrets: write**. The workflow will then
  rotate `IG_TOKEN` itself and never expire. Costs nothing, but it is a second standing
  credential.

## When it breaks

Check Actions for a red run. The usual causes:

| Symptom | Cause |
|---|---|
| Feed reverts to the six-post embed | `instagram.json` missing, or the workflow has been failing |
| `OAuthException` in the log | Token expired or was revoked. Regenerate it. |
| "Instagram returned no media" | Account switched back to personal, or the app lost access |
| Photos load but are stale | Workflow is disabled, or the schedule was paused after 60 days of no repo activity |

GitHub disables scheduled workflows in repos with no activity for 60 days. If the feed
goes stale, check that the workflow is still enabled.

## Reusing this on other client sites

Nothing here is specific to Simpson & Gardner except the profile URL in
`tools/fetch-instagram.py` and the fallback URL in `index.html`. Copy
`tools/fetch-instagram.py`, the workflow file, the `.ig-*` CSS rules and the feed
block in `assets/site.js` into any other static client site, generate a token for that
client's account, and it works the same way.
