# Changelog

What changed on the website from one release to the next. The version and
build are in the footer of every page, e.g. "3.0.1 · Ianthine".

## 3.0 Ianthine

3.0 opened on 23 October 2026 at build 3.0.1.

- **The gym's website.** Rebuilt from the WordPress site at trnblt.com: home,
  Mission, Potrero Hill, personal training, open gym membership, reserve
  a studio, assisted stretching, nutrition guidance, our team, contact and the
  privacy policy (word for word). Built around the slogan, You belong here.
- **The team from Studio.** Trainers and staff, with names, titles, bios,
  photos and locations, come from Studio's public team list (`npm run team`).
  Trainers are anyone who trained a client in the past 90 days; locations are
  where they trained, else their default place.
- **Fuad on the team page and the nutrition page.** Fuad Al Qudsi of FuadFit,
  who isn't in Studio, is a website-only card with the staff
  (src/partners.json). The nutrition page has his headshot and a food photo,
  both from fuadfit.com, used with his OK.
- **Filter the team by location.** All locations, Mission or Potrero Hill,
  from Studio's places; the choice is in the address (team/?location=mission).
- **Studio's PT inquiry form** is embedded on the personal training page.
- **Reserve a studio with Studio.** The reserve a studio page embeds Studio's
  website reserve page for Potrero Hill, in place of GloFox's booking page.
- **Free day pass dialog.** The Free day pass buttons open a dialog instead
  of leaving the page: what a day pass is, that it's usually $30 and the first
  is free, Potrero Hill's opening hours, its address (opening the phone's
  maps app) above a map, and that there's no booking: come in and the front
  desk sets you up.
- **Opening hours from Studio.** Potrero Hill's hours across the site come
  from the location's hours in Studio (`npm run team`), with the site's own
  as a fallback.
- **Member login.** A Member login link in the header and footer opens a
  panel that asks for the member's email and whether to email or text the
  code, then hands over to Studio's member portal to finish signing in.
- **Apps.** An Apps menu with pages for Trainability Studio (the member
  portal) and Trainability Coach (the coaching app for trainers), using the
  "What this is" content from each app's sign-in page.
- **The whole menu fits on tablets.** From 768px wide up, every menu item
  stays on one line, set smaller on tablets and small laptops (the wordmark
  gives way to the mark below 920px); phones get the ☰ menu.
- **App screenshots on the Studio and Coach pages.** Each hero has three of
  the app's screens, tilted and floating on a slow magenta and cerulean glow
  (still when the device asks for less motion), from the apps' own
  screenshots (`npm run app-shots`). Coach's logo is the new side-by-side one
  from its kit.
- **Holiday hours from Studio.** Read live in the browser from Studio's team
  list: a bar under the header in the 14 days before, a note next to Potrero
  Hill's hours, and "Today we're closed" in the day pass dialog.
- **Versioning.** The site carries a version, build and code name, the same
  way Studio does.
- **Magenta and cerulean.** The brand colours are magenta (`#c44e9b`, from
  the Trainability and Studio logos) and cerulean (`#007ba7`, from Coach's).
  Buttons, the header's edge, the featured card, step numbers and highlighted
  words use a gradient between the two. Behind white text (buttons, step
  numbers) the magenta is deepened to `#b8448f` so the text stays readable.
- **Dark, like a gym.** The site is dark throughout: near-black backgrounds,
  big condensed uppercase headlines (Barlow Condensed), and the brand colours
  glowing against them.
- **Floating hexagons.** Studio's drifting hexagons, in shades of magenta and
  cerulean, behind every page; the heroes sit on top. Still for people who
  turn motion down, gone for those who ask for more contrast.
- **The real logos.** The Trainability mark and the TRAINABILITY® wordmark
  (from Studio's lettering) are in the header and footer; the mark is also
  the favicon. `assets/logos/` also holds the Studio and Coach logos.
