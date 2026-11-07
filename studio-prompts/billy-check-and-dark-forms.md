Two changes for the website (trnblt.com). Do both.

## 1. Billy's chat: the human check

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

## 2. Dark forms for the website's frames

Let the public forms be shown dark, for the website. trnblt.com is always
dark, and the forms it puts in a frame are light today, so they stand out as
white boxes.

**Which**: every page the website frames:
- contact `/forms/contact`
- the training inquiry `/forms/ptinquiry`
- the studio reservation `/forms/reserve` (all its steps, signed in or not)
- cancelling a membership `/forms/cancel` (the code, the member's own cancel
  and its offers to stay)

**How**: a `theme=dark` in the address (`/forms/contact?theme=dark`,
`/forms/reserve?place=…&theme=dark`) draws the page in the app's dark look,
whatever the visitor's own setting. Without it, the page is as today.
- Keep it on every step and every address the page moves to inside the frame
  (after a code, after sending, "send a new code", going back), so a dark
  page never turns light half way.
- The Turnstile box dark too (`theme: "dark"`), and the "No form here" page.
- Behind the form, the page's own background, so the frame never shows white
  around it; the website draws the frame on #16161F (its card colour), so
  that or the app's own dark ground both sit well.
- The height messages to the website stay as they are, and stay right in dark.
- Studio's own links to these forms (in the app, emails, texts) don't change.

Add `theme=dark` to `docs/FORMS-API.md` (where it says how to frame a form)
and the CHANGELOG.

The website already asks for it: its frames' addresses carry `theme=dark`
from now on, which does nothing until this is live.

Don't test against the live site or change live data. When both are live, tell
me the build number.
