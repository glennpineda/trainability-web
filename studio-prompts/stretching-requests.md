Add **assisted stretching** booking requests to the contact form and
Concierge › Messages, so the front desk can hand each one to the right
stretch specialist.

**Where they come from.** The website's Assisted stretching page has a
**Book a session** dialog of its own (not the iframe). It POSTs straight to
`POST /api/forms/contact` from trainability.org (`credentials: "omit"`), the
same way the Cancel membership dialog does. Today it sends `topic: "other"`
with the answers written into `message`:

```
{ firstName, lastName, email, phone, topic: "other", openedAt, website,
  message: "Assisted stretching: booking request\nBest times: Morning, Evening\n\n<their note>" }
```

**1. A topic of its own: `stretch`**
- Accept `topic: "stretch"` ("Assisted stretching") through the API, and
  offer it in the form page's own topic picker too.
- For `stretch`: `phone` is required; `times` is required, a list of one or
  more of `morning`, `early-afternoon`, `late-afternoon`, `evening` (add them
  to `choices` as `stretchTimes`); `message` is optional.
- Answer `400 { error, code: "invalid_contact", field }` as for other fields.
- Messages gets a **Stretching** filter with its count, and the row shows the
  times they picked.
- The team's email is headed "Assisted stretching request", and the person
  gets a short receipt ("We've received your request for an assisted
  stretching session; we'll be in touch to find a time").
- Document it in `docs/FORMS-API.md` and MANUAL 9.16.

**2. Hand a message to somebody: Assign**
- On any message (most of all Stretching), an **Assign** button picks
  anybody on the team, offering first those who did assisted stretching
  sessions in the last 12 weeks (or however the app knows who stretches; ask
  me if it doesn't), then everyone else.
- Assigning emails them the message (who, how to reach them, the times, the
  note), with a line asking them to answer with **Reply all** so the person
  and the business both get it, the way an inquiry sent to a trainer works
  (9.15). A reply from them with Reply all ticks **Answered** in their name.
- The row and the open message show **Assigned to <name>** and when; it can
  be changed (the new person is emailed; the earlier one isn't told again).
- The assigned person can see the messages assigned to them (a short list on
  their own home, or wherever fits), even without the Concierge tab.

Add it to the MANUAL, the CHANGELOG and the permissions table. Don't test
against the live site or change live data. When it's live, tell me the build
number, so the website can switch its Book a session dialog to
`topic: "stretch"` and send `times`.
