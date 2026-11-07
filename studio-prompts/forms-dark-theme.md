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

Don't test against the live site or change live data. When it's live, tell
me the build number.
