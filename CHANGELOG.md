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
- **Google reviews on the location pages.** "What people say" above Find us
  on Mission and Potrero Hill: the Google rating, the number of reviews and up
  to five of them, loaded from Google's Places API on each visit.
- **Initials for now on the team page** while the photos are redone
  (`teamPhotos` in site.json); "Our team" (the trainers, with Fuad) and "Our
  staff".
- **A quieter first screen.** The home hero is the name and "You belong
  here." only, with a bouncing chevron that fades once you scroll; the intro
  and buttons sit just below it.
- **Pick your gym slideshows.** Each location card fades through four photos
  of its gym, each slowly zooming; still with reduced motion.
- **A note from Glenn.** The home page's "Not a big-box gym" section has a
  welcome from the owner, with his photo, his signature and a link to Our
  story.
- **Our story as a timeline.** The chapters branch left and right off one
  magenta-to-cerulean line, each with its year or label and an icon.
- **Contact form and Cancel membership.** The Contact page embeds Studio's
  contact form, which lands in Concierge › Messages, and a Cancel membership
  dialog posts straight to it. The business email is no longer shown anywhere
  on the site; the privacy page points to the form.
- **Fresh styles after every change.** Pages link to styles.css, main.js and
  hexes.js with a fingerprint of the file, so browsers never mix a new page
  with old styles.
- **Join online with Studio.** The membership page's Buy online buttons go to
  Studio's Join page (trainabilitystudio.com/forms/join) instead of Glofox.
- **Old links still work.** `/t2/bookstudio` forwards to Reserve a studio;
  more old addresses can be listed under `redirects` in src/site.json.
- **Found in search, shared well.** Each page has a canonical address and
  link-preview tags with a whole image address (previews in iMessage,
  WhatsApp and Slack show the gym). The build writes sitemap.xml and
  robots.txt, and the home and location pages carry the gyms' business
  details for Google (addresses, phone, Potrero Hill's hours from Studio).
- **A friendly "page not found".** src/pages/404.html, written as 404.shtml
  and 404.html, with links that start from the site's top.
- **A tidier footer.** Two rows of three: the slogan, Mission and Potrero
  Hill (their titles on the slogan's line), then the links grouped under Train
  with us, Members & apps and About us, in lighter titles. Privacy policy sits
  on the bottom line.
- **Full-width text and forms.** The contact and personal training forms sit
  below their text at the full width, and intros, section intros and
  paragraphs are no longer capped narrower than the page.
- **Our story, reordered and refocused.** "A home for orphan trainers" comes
  before "For Jon", and the apps chapter is now "Behind the scenes / More
  time for you", about what our clients get rather than the software. The
  last chapter is "Beyond 2026", its year kept current by the page.
- **Book assisted stretching.** The stretching page's Book a session buttons
  open a dialog (name, email, phone, best times of day, a note) that's sent
  to Concierge › Messages. It and Cancel membership share one request-dialog
  script, and their thank-yous point to the contact form, not the phone.
- **Terms and conditions.** Moved from trnblt.com/terms word for word, its
  contact lines pointing to the contact form and trainability.org; linked
  beside Privacy policy in the footer.
- **Pause and cancel in one step.** The membership page's links open the
  contact form set to a pause, or the Cancel membership dialog; the contact
  page passes ?topic= and ?place= to Studio's form and opens #cancel.
- **More old addresses forward:** /t1, /t2, /t2/stretching, /pt and /main/pt.
- **Search engine tune-up.** Titles name what and where (e.g. "Private
  Personal Training in the Mission, SF"), descriptions fit in results, the
  home heading names the business for search, gallery photos describe the
  place, and each page's first big picture is fetched first. A server rules
  file (htaccess → dist/.htaccess) sends http and www to
  https://trainability.org and lets browsers keep files, acting only on
  trainability.org addresses.
- **Why are you cancelling?** Cancel membership asks an optional reason,
  picked from Studio's list (choices.cancelReasons), with their own words for
  Other (live with Studio 3.1.1950). If Studio ever sends no list, a plain
  box asks for it in their own words instead.
- **Stretching requests by topic.** Book a session sends topic "stretch" with
  its times, so Messages lists it under Stretching for assigning.
- **Powered by Studio.** Member login ends with "Powered by" and the Studio
  logo and wordmark, linking to the Studio page.
- **Meet the team here.** Mission and Potrero Hill link to the team page
  filtered to that location.
- **trnblt.com is the address.** Every page, link preview and search listing
  names https://trnblt.com; trainability.org (and www, and http) forwards there.
- **Terms brought up to date** (effective 26 Oct 2026): texting as Studio
  sends it today (48 and 36 hours, HELP, sign-in codes, Refill by text, opt-in
  news), independent trainers, phone calls and the assistant, sign-in codes,
  a Memberships section (automatic renewal, 14 days' notice, no refunds, the
  $50 early fee, pauses), reservations and no-shows, refills, electronic
  signatures. The membership page's cancel line now says 14 days too.
  Checked against California law: the five-business-day right, every way to
  cancel (app, form, email, mail, in person), refunds for moving, disability,
  death and reduced facilities, 7-30 days' notice of a price change, the
  annual reminder, calls with the assistant transcribed (said so), and no
  release of gross negligence.
- **Membership policy of 26 Oct 2026.** 48 hours' notice before the next
  payment (Contact's card and Cancel membership dialog, the membership page,
  the Terms); a payment taken after a request that came in time is refunded.
  Five business days to change your mind, with a full refund; the $50 fee
  after only one billing cycle, with no fee for moving, disability or a
  reduced facility; pauses of 14 days to 2 months, twice a membership year;
  the Monthly plan renews monthly, its price locked for the first 12
  months, then changeable with 30 days' notice. Privacy
  policy: phone calls answered and transcribed by Billy.
- **Dispute resolution and arbitration** (Terms section 24): the same as
  section 11.2 of the Membership Agreement, (a) to (m), saying "you" for
  "Member"; section 23 points to 24(l).
- **Analytics with Umami** (cookie-free), on once site.json has the website
  ID, counting on trnblt.com only: free day pass, member login and code sent,
  call, directions, buy online, Put Studio on your phone, Meet the team here,
  cancel and stretching opened and sent, team filter, other sites visited,
  read to the end, not found, and Studio forms sent (once Studio says so).
  The privacy policy's cookies section says what it records.
- **IndexNow.** Each deploy tells Bing (and the other IndexNow engines)
  which pages changed (scripts/indexnow.mjs), with its key file at the
  site's top.
- **Ask Billy.** A chat button at the bottom right of every page opens a
  panel to ask the app's assistant (Studio's /api/forms/billy, no cookies):
  his greeting, typing indicator, links in his answers, the conversation
  kept for the visit with Start over, errors in his place (429 waits, 503
  hides the chat), full screen on phones. Umami counts opening it and
  questions asked, never what was asked.
  The privacy policy says where chat questions go (Studio, and Anthropic).
- **Put Studio on your phone.** trnblt.com/app forwards to Studio's
  install page (trainabilitystudio.com/install, Studio 3.1.2044), for emails;
  linked from the Studio page and the footer.
- **Services menu:** Open gym membership first, then Personal training.
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
