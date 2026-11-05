Add a human check to the public forms, to cut spam: **Cloudflare
Turnstile**, the "Verify you are human" box. Most people only see a tick;
a puzzle shows only when Cloudflare is unsure. It sets no advertising
cookies and doesn't track people across sites.

The quiet checks in `server/forms.js` (the unseen `website` field, the
`openedAt` timing, the rate limit) stay as they are. Turnstile is checked
after them, in the same one place, so every public form gets it at once.

**Keys** (the widget is made in Cloudflare; I'll put them on the host)
- `TURNSTILE_SITE_KEY`: public, sent to pages.
- `TURNSTILE_SECRET_KEY`: secret, server only. Never sent to a page or logged.
- If either is missing, forms work exactly as today, with no check (so
  nothing breaks before the keys are on the host, or in development).

**On the server** (`submitForm`)
- Each POST to `/api/forms/<id>` carries `turnstileToken`.
- Verify it with Cloudflare's siteverify
  (`https://challenges.cloudflare.com/turnstile/v0/siteverify`, with the
  secret, the token and the sender's IP), and accept it only when it
  succeeds and its `hostname` is one of ours: `trnblt.com`, `www.trnblt.com`,
  `trainabilitystudio.com`.
- No token, or one that fails: answer **400**
  `{ error: "Please tick “Verify you are human” and send it again.", field: "turnstile" }`.
  Unlike the quiet checks this one is said out loud, because a real person
  can fail it (a timed-out token) and needs to know to try again.
- If Cloudflare can't be reached, let the submission through and log it, so
  an outage on their side never loses a real inquiry.
- A sender the form trusts (`trusted`, a signed-in member on their own
  page) isn't asked.

**In the forms**
- `GET /api/forms/<id>` (`describeForm`) adds `turnstileSiteKey` when the
  check is on, so the website can draw the box with the same key.
- Studio's own embedded forms (contact `/forms/contact`, the training
  inquiry `/forms/ptinquiry`, the studio reservation) show the box just
  above their Send button, in the dark theme on dark, the light on light,
  and send its token. After a 400 for `turnstile`, reset the box.
- The embedded forms' height message should still be right with the box
  in it (and when a puzzle opens).

**Not these**
- The Billy chat (`/api/forms/billy`): it stays as it is; its rate limit
  covers it, and a box before every question would spoil it.
- Sign-in and the member portal.

**Also**
- `WEBSITE_ORIGINS` and CORS don't change.
- Content Security Policy, if Studio sets one: allow
  `https://challenges.cloudflare.com` for scripts and frames.
- Add it to `docs/FORMS-API.md` and the CHANGELOG, and say in the privacy
  wording that forms use Cloudflare Turnstile.

The website (trnblt.com) has two forms of its own that post here, cancel a
membership and book stretching. They already show the box (with the site key from `GET /api/forms/contact`)
and send `turnstileToken` with the rest, from `trnblt.com`, so they need
nothing more from Studio than the check above.

Don't test against the live site or change live data. When it's live, tell
me the build number.
