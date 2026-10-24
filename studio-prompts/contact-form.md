Build a public **contact form** that lands in Concierge, alongside the
personal training inquiry. The website (trainability.org) will embed it on
its Contact page in an iframe, the same way it embeds `/forms/ptinquiry` and
`/forms/reserve`.

**The form: `contact`, at `/forms/contact`**

- Same machinery as `ptinquiry` in `server/forms.js`: `GET /api/forms/contact`
  (business, places, topic choices), `POST /api/forms/contact`, `openedAt` and
  the hidden `website` field, the rate limit, and the "height" and "sent"
  messages to the page around it (`form: "contact"`). Add it to
  `docs/FORMS-API.md`.
- Fields:
  - first name, last name (required)
  - email (required)
  - phone (optional)
  - location: each place, or **Either** (optional)
  - topic (required): Membership, Personal training, Reserve a studio,
    Business opportunity, Other
  - message (required, up to 2,000 characters)
- `?topic=<value>` and `?place=<id>` in the link preselect those, so the
  website can link to it already set (like `/forms/reserve?place=`).
- Made for a phone, styled like the PT inquiry page. The thank-you says
  we'll get back to them by email.
- If the topic is Personal training, the thank-you can also offer a link to
  `/forms/ptinquiry`.

**Where it lands: a Messages tab on Concierge**

- A new **Messages** tab on Concierge, beside Inquiries, for the front desk,
  admins and masters (not trainers). Its number is the messages nobody has
  answered yet, added to the Concierge button's number.
- Lists: **Open**, **Answered**, **Archived**, **All**, each with a count. Each
  row shows when it came in, the name, topic, place, the first line of the
  message, and who answered it and when.
- Open one to see it all, with buttons to call, text or email them. The email
  button opens **Write an email** (5.3), and what was written is kept under
  **Written back**. Sending a reply marks it **Answered** in that person's
  name, like Followed up on an inquiry; an email that didn't go marks nothing.
  Also offer a manual **Answered** tick, **Notes** (business only),
  **Archive**, and **Delete** (admins and masters only, asks first).
- A row whose email or phone is already on the client list says so, and links
  to them.
- If the topic is Personal training, offer **Make it an inquiry**, which opens
  the person in Inquiries.

**Who is told**

- Sending it emails the **front desk (Staff accounts), admins and masters**:
  who sent it, how to reach them, the place, the topic and the message. Replies
  go straight to the person who wrote.
- Also send a push notification to those who have Concierge, the way new
  no-shows do, if that fits.

**Membership cancellation requests (topic `cancel`)**

The website's Contact page has a **Cancel membership** dialog of its own (not
the iframe). It POSTs straight to `POST /api/forms/contact` from
trainability.org (`credentials: "omit"`), with:
`{ firstName, lastName, email, phone, topic: "cancel", message: "", openedAt, website }`.

- Accept `topic: "cancel"` through the API, but don't offer it in the form
  page's own topic picker. For `cancel`, `phone` is required and `message` is
  optional. Answer `400 { error, field }` as for other fields; the website
  shows `error` beside the field.
- In Messages, show a cancellation with its own **Cancel membership** label
  and its own filter, and match it to the member by email or phone. Show their
  membership, next payment date, and whether the request came **at least 14
  days before** that date (the policy the dialog states: 14 days' notice before
  the next payment date; fees already charged aren't refunded if they ask
  after the next payment date). Make it one tap from there to the member's
  membership to cancel it. Where no member matches, say so.
- Email the person a short receipt ("We've received your request to cancel
  your membership; our front desk will confirm by email"), and send the front
  desk, admins and masters the same email as other messages, headed
  "Membership cancellation request".
- The Answered tick works the same way.

**Website access:** it's under `/api/forms/`, so the existing
`WEBSITE_ORIGINS` already covers it: the website embeds the form page, and
its cancellation dialog POSTs to `/api/forms/contact` from trainability.org.
Check that trainability.org and www.trainability.org are both in
`WEBSITE_ORIGINS`.

Add it to the MANUAL (Concierge and a section next to 9.15), the
CHANGELOG, and the permissions table. Don't test against the live site or
change live data. When it's live, tell me the build number, so the website
can switch its Contact page on.
