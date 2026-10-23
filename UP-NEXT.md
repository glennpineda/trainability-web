# Up next

What's queued for the website, newest asks first. Done items come off the
list and go in CHANGELOG.md.

## To build

- **Contact form answered by Concierge in Studio.** A contact form on the
  website whose messages land in Studio, where Concierge can answer them.
  Needs a Studio side (a public `/api/forms/...` form, like the PT inquiry,
  that Concierge picks up) and the website side (the form on the contact page,
  embedded or posting to it).

## Waiting on Studio or Coach

- **Coach page wording.** src/pages/coach.html is a draft from Coach's manual;
  replace it with the "What this is" section from Coach's sign-in page once
  that's live at trainabilitycoach.com.
- **Studio 3.1.1846 to go live.** It's merged (opening hours, holiday hours,
  By appointment only, the website sign-in link) but trainabilitystudio.com
  still runs 3.1.1831. Once it's live: run `npm run team`, check Potrero
  Hill's hours, deploy; check a holiday shows in the bar; try Member login
  end to end. The website side of all of it is built.

## Open questions

- Staff with no location in Studio: give them a default place, or show them
  under every location in the team filter?
- Fade the edges of the alternating section bands?
- "Meet the team here" links on the location pages?
- A better landscape hero video, and newer Mission photos.
- Confirm Mission's "sanitized every hour" and current prices.
- Should Mark Mian appear on the team page?
- Staff photos and bios in Studio.

## Next deploy

- Nothing queued.
