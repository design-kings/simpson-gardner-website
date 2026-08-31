# Simpson & Gardner Website

Client website for Simpson & Gardner Custom Home Builders, Decatur TX.
Built and managed by Design Kings, LLC.

**Live:** https://design-kings.github.io/simpson-gardner-website/

## Structure

Four real pages sharing one stylesheet and one script.

| File | Page |
|------|------|
| `index.html` | Home |
| `about.html` | About |
| `portfolio.html` | Portfolio |
| `contact.html` | Contact |
| `assets/site.css` | All styling for every page |
| `assets/site.js` | Portfolio filters and the photo lightbox |
| `assets/img/` | Every photo on the site, 34 files |
| `versions/` | Earlier drafts. Kept for reference, not published. |
| `tools/` | The script that generated these pages from the original mockup |
| `docs/brand.md` | Client brand notes |

## How to change the site

Everything can be done from github.com in a browser. No software needed.

**Edit text on a page**

1. Click the page file, for example `about.html`
2. Click the pencil icon at the top right
3. Make your change
4. Scroll down, write a short note describing what you changed
5. Click "Commit changes"

The live site updates within about a minute.

**Change something that appears on every page**

Navigation, colors, fonts and spacing live in `assets/site.css`. Edit it once and every
page picks it up. The navigation markup itself is repeated in each page file, so adding a
new nav item means editing all four.

**Add a photo**

Upload it to `assets/img/`, then reference it from a page as
`assets/img/your-file-name.jpg`. Keep photos under about 400 KB each.

**Undo something**

Click "Commits" at the top of the file list, find the change, open it and click "Revert".
Every version of every file is recoverable, including deleted ones.

## Cache busting

`assets/site.css` and `assets/site.js` are linked with a `?v=` number in every page.

**Bump that number whenever you change the stylesheet or the script.** Browsers cache both
files aggressively, so without a new number a returning visitor keeps seeing the old design
even though the new one is deployed. Change `?v=2` to `?v=3` in all four page files, in the
same commit as the CSS or JS change.

Editing page content does not need a bump. Only CSS and JS do.

## Commit notes

Write for a person reading it in six months, not for the machine.

Good: `Updated services copy per Aug 30 client call`
Good: `Swapped hero photo for the new exterior shot`
Not useful: `update`, `changes`, `asdf`

## Publishing

Served by GitHub Pages from the `main` branch, root folder. Settings live under
Settings then Pages.

The repo is public, which is what makes Pages hosting free. Making it private requires a
paid plan and automatically unpublishes the site until Pages is re-enabled. Nothing here is
sensitive: it is the same HTML and CSS any visitor can already read in their browser.

Anything carrying vendor net costs, margins or pricing logic belongs in a separate private
repo, never this one.

## Do not commit

Native design files (`.ai`, `.psd`, `.indd`), print-ready PDFs and raw photo libraries.
Git cannot show meaningful differences between versions of those and they bloat the repo.
Those stay in Google Drive and Creative Cloud.

## History

The site began as a single 6.7 MB mockup file with all four pages stacked vertically and
photos embedded directly in the HTML. `tools/build-from-mockup.py` split it into real pages,
pulled the photos out into `assets/img/`, and rewired the navigation. The original is kept at
`versions/mockup-v3-single-file.html`.

---

Design Kings, LLC | Denton, TX | hello@design-kings.com
