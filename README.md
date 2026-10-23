# Trainability Website

The website for Trainability, a personal training gym and open gym in San Francisco with two locations, Mission and Potrero Hill. Slogan: **You belong here.**

It is a static site: HTML, CSS and a little JavaScript, assembled by a small Node script with no dependencies. It replaces the WordPress site at trnblt.com, whose content it started from.

## Structure

```
src/layout.html   Head, header and footer shared by every page
src/pages/        One file per page; name.html becomes /name/
src/site.json     Links and contact details used across pages
src/team.json     The team and opening hours, pulled from Studio (npm run team), don't edit by hand
styles.css        All styles (dark theme, magenta-to-cerulean gradient)
main.js           Menus, current page, footer year, embedded form height
assets/           Photos, video, the logo and wordmark the site uses
assets/team/      Team photos, pulled from Studio
brand/            Studio, Coach and other logos kept for reference (not uploaded)
scripts/          build, serve, fetch-team and build-number
deploy.sh         Builds, then uploads dist/ by FTPS
dist/             The built site (git-ignored)
```

## Working on it

```sh
npm run build    # build into dist/
npm run serve    # preview dist/ at http://localhost:8000
npm run team     # refresh the team and opening hours from Studio, then build
npm run app-shots # refresh the Studio and Coach screenshots from the apps' docs
```

Pages start with a settings comment (`title`, `description`). Inside pages and the layout, write links as `{{root}}team/` so they work from any folder, and use `{{phone}}`, `{{membershipUrl}}` and the other keys in `src/site.json`.

### The team comes from Studio

Names, titles, bios, photos and locations of trainers and staff come from Studio, never from this repo. `npm run team` reads Studio's public team list (`/api/forms/team`): everyone active, as trainers (anyone who trained a client in the past 90 days, or has the trainer role) and staff (everyone else). A person's locations are where they trained clients in those 90 days, or their default place. The team page shows Trainers, then Staff; a section with nobody in it is left out.

Potrero Hill's opening hours come from Studio too: `npm run team` saves the hours set on the location in Studio, and the build writes them into the footer, home, contact and Potrero Hill pages and the free day pass dialog (`{{potreroHours}}`, `{{potreroHoursBr}}`, `{{potreroHoursList}}`). Until Studio has hours for it, `potreroHours` in `src/site.json` is used (seven days, Sunday first, `[open, close]` in minutes past midnight, `null` for closed). Mission is by appointment only, so it shows no hours.

Until Studio has `/api/forms/team`, the script falls back to the trainers Studio's PT form offers and their public trainer pages, with no staff.

### Forms and links to Studio

- The personal training page embeds Studio's own inquiry form (`/forms/ptinquiry`); it sizes itself to fit.
- The reserve a studio page embeds Studio's website reserve page (`/forms/reserve?place=<Potrero Hill>`, `reserveForm` in `src/site.json`); members sign in with a code sent to their email or phone.
- Buying a membership still goes to GloFox (the CRM) until Studio's join page is switched on. Change `membershipUrl` in `src/site.json` then.

## Versioning

Versions work the way they do in Studio: `MAJOR.MINOR.BUILD` plus a code name for each minor version. The site started at **3.0 Ianthine**, build 1. The label shows in the footer, e.g. "3.0.1 · Ianthine".

- **Build** is the commit count since the minor began (`buildBase` in `package.json`). `npm run build-number` shows the next one; `npm run build-number -- --set` writes it into `package.json` and the footer of `index.html`. Run it before a deploy and commit the change.
- **A new minor** (3.1) is set by hand: change `version` to `3.1.0`, set `buildBase` to the current commit count (`git rev-list --count HEAD`), and give it a code name. Glenn chooses the name; never invent one.
- Add each release's changes to `CHANGELOG.md` under its heading, e.g. `## 3.0 Ianthine`.

## Deploying (FTP)

`./deploy.sh --check` logs in and lists the remote folder without uploading. `./deploy.sh` builds the site and uploads `dist/` over FTP/FTPS/SFTP using `curl`, all files over one connection. Upload goes to `FTP_REMOTE_DIR`, which is `/`: the FTP login opens in `public_html`, which trainability.org serves (and trnblt.com will). The folders beside the site there (`trnblt.com`, `website2`) are other sites; the deploy never deletes anything except stale files in `assets/team/`. It reads `FTP_HOST`, `FTP_USER`, `FTP_PASS`, `FTP_REMOTE_DIR`, `FTP_PROTOCOL` and `FTP_PORT` from a local `.env` file (copy `.env.example`; `.env` is git-ignored) or from environment variables.

When working in Claude Code on the web, set these as environment variables in the cloud environment settings rather than in a file — the container is temporary and `.env` is never committed.

FTPS uses TLS 1.2 on purpose: over TLS 1.3 this host (Pure-FTPd) aborts some uploads with `451 Error during read from data connection` and leaves an empty file behind.

## The Studio and Coach pages

`studio/` and `coach/` describe the two apps, so they should always match them:

- **Wording** comes from each app's "What this is" section, below the fold on its sign-in page.
- **Logos** come from each app's logo kit (`assets/logos/studio-lockup.svg`, `assets/logos/coach-horizontal.svg`; the full kits' SVGs are in `brand/`).
- **Screenshots** behind the heroes (`assets/apps/`) come from the apps' own manual screenshots: `npm run app-shots` (macOS) copies, crops and shrinks them. They show demo data only; check any new one for a real person's name, photo, email or phone before adding it to `SHOTS` in `scripts/app-shots.mjs`.

When Studio or Coach changes, update these pages with it.

