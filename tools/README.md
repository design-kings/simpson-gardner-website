# tools

## build-from-mockup.py

One-time migration. It split the original single-file mockup
(`versions/mockup-v3-single-file.html`) into the four page files, pulled the embedded
photos into `assets/img/`, and rewired the navigation.

**Do not re-run it.** The site has been edited since it was generated, and re-running
would overwrite those edits with a fresh build from the old mockup. It is kept here to
document how the pages were produced.

## fetch-instagram.py

Pulls recent Instagram posts into `assets/feed/` so the home page can render a live,
scrollable feed. Run automatically once a day by
`.github/workflows/refresh-instagram.yml`; it commits only when the posts have changed.

Needs an `IG_TOKEN` repository secret: a long-lived Instagram access token for a Business
or Creator account. See `docs/instagram-feed.md` for how to get one.

To run it by hand:

    IG_TOKEN=... python3 tools/fetch-instagram.py

Exit code 78 means "no new posts, nothing to commit" and is not an error.
