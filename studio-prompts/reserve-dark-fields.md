The studio reservation page (`/forms/reserve`, src/public/ReservePage.jsx)
is dark, but with `?theme=dark` its text boxes are still white: `FIELD`
(color #1B1238 on background #fff), used by "Email or mobile number" and the
code box. On the website (trnblt.com/reserve-a-studio) they're the only white
left on the page.

With `theme=dark`, draw those fields dark, matching the dark text boxes on the
other dark forms (contact, cancel): the dark field background, light text,
the muted placeholder, a visible border, and the same focus ring. Everything
else on the page, and the page without `theme=dark` (the kiosk's own look),
stays as it is. Check the code step and the "Send a new code" step too, and
that the height message to the website is unchanged.

Add it to the CHANGELOG.

Don't test against the live site or change live data. When it's live, tell
me the build number.
