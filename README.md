# Simpson & Gardner Website

Client website project for Simpson & Gardner. Managed by Design Kings, LLC.

## What is in here

| File | What it is |
|------|-----------|
| `index.html` | The live site. Whatever is in this file is what visitors see. |
| `versions/` | Earlier mockups, kept for reference. Not published. |
| `assets/` | Images, fonts and anything the site loads separately. |
| `docs/brand.md` | Client brand notes: colors, type, voice. |

## How to change the site

You do not need any software installed. Everything can be done from github.com in a browser.

**To edit a page**

1. Click the file name, for example `index.html`
2. Click the pencil icon at the top right
3. Make your change
4. Scroll down, type a short note in the "Commit changes" box saying what you changed
5. Click "Commit changes"

The live site updates within about a minute.

**To upload a new file**

1. From the repo home page, click "Add file" then "Upload files"
2. Drag the file in, or pick it from your device
3. Add a short note and click "Commit changes"

Web upload handles files up to 25 MB, which covers full HTML mockups with embedded images.

**To undo something**

1. Click "Commits" at the top of the file list
2. Find the change you want to reverse
3. Open it and click "Revert"

Nothing is ever really lost. Every version of every file is recoverable.

## Commit notes

Write the note for a person reading it in six months, not for the machine.

Good: `Updated services copy per Aug 30 client call`
Good: `Swapped hero photo for the new exterior shot`
Not useful: `update`, `changes`, `asdf`

## Publishing

The live URL is served by GitHub Pages from the `main` branch. Settings for it live under
Settings then Pages in this repo.

Note on visibility: GitHub Pages will only publish from a **private** repo on a paid plan.
On the free plan the repo has to be **public** for the site to go live. Client site code is
normally fine to have public, since it is the same HTML and CSS anyone can already view in
their browser on the live site. Keep anything with vendor net costs, margins or pricing logic
in a separate private repo.

## Do not commit

Native design files (`.ai`, `.psd`, `.indd`), print-ready PDFs, and raw photo libraries.
Git cannot show meaningful differences between versions of those, and they make the repo
slow to work with. Those stay in Google Drive and Creative Cloud.

---

Design Kings, LLC | Denton, TX | hello@design-kings.com
