The website's Ask Billy chat (trnblt.com) calls `POST /api/forms/billy`. On a
`429` it should wait as long as the `Retry-After` header says. But a browser
only lets a page on another site read that header when the server lists it
in `Access-Control-Expose-Headers`, and `formsCors` in server/forms.js
doesn't. So the website can't see it, and waits a fixed 60 seconds instead.

Please add `exposedHeaders: ["Retry-After"]` to the options `formsCors` gives
the website origins. That's the only change. Note it in docs/FORMS-API.md
under the Billy API's 429 row, and in the CHANGELOG. Don't test against the
live site.

Also, when you deploy, tell me the build number. The Billy API itself
(`/api/forms/billy`) isn't on the live app yet: live is 3.1.2071, and it came
after that. Until it is, the website's chat button hides itself on the first
question.
