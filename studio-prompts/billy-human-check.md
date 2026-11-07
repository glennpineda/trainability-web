Add the human check (Cloudflare Turnstile) to Billy's chat on the website,
`POST /api/forms/billy`, to cut spam and bots running up his answers. It
was left out at first because a box before every question would spoil the
chat, so this asks once per conversation, not once per question.

**How it works**
- Same keys as the forms (`TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`). With
  either missing, Billy works exactly as today.
- The first question of a conversation carries `turnstileToken`. Check it
  with `humanCheck` (same rules: our hostnames only, let through if
  Cloudflare can't be reached).
- A passed check answers as usual and adds `humanPass`, a signed pass like
  `humanPass` for the reservation's Send a new code (signed with the secret,
  nothing kept), with its own subject ("billy" and the sender's IP) and good
  for **30 minutes**.
- Later questions carry `humanPass` instead of a token. A good pass is let
  through without asking Cloudflare, and every answer gives a fresh pass, so
  a conversation that keeps going never has to tick again.
- Neither a good token nor a good pass: **400** with `HUMAN_ERROR`
  (`code: "turnstile_failed"`, `field: "turnstile"`) and no answer.
- Order: the question's own checks (`conversationOf`), not configured (503),
  the rate limit (429), then the human check, then the answer.
- `WEBSITE_ORIGINS` and CORS don't change. Billy inside the apps (members,
  trainers) isn't touched; this is only the website's route.

**The website** (trnblt.com) is ready for this: when the chat opens it draws
the box in Cloudflare's "only when needed" mode (most people never see it),
takes the site key from `GET /api/forms/contact`'s `turnstileSiteKey`, sends
`turnstileToken` until it has a pass, then `humanPass`, and on a 400 for
`turnstile` asks the visitor to tick the box and send again.

Add it to `docs/FORMS-API.md` (Billy's section and the human check) and the
CHANGELOG.

Don't test against the live site or change live data. When it's live, tell
me the build number.
