Billy (website chat and phone) told somebody: "We're closed at Potrero
Hill on Thanksgiving (Thursday, Nov. 26). Mission is open as usual, 5 AM to
10 PM that day." The Mission is by appointment only (Places › Opening
hours, `by_appointment`), so it isn't "open" those hours: nobody can walk
in. Its hours are only there for the calendar.

`places_and_hours` (server/assistant/phone.js) never sees that setting:
`look.places` (server/index.js, the website chat's agent and the phone's)
passes the week and the special days but not `byAppointment`, although
locations.js has it and hours.js already skips a by-appointment place for
"closing soon" and `openWords`.

By appointment only should win over the hours, wherever Billy gives them:

- `look.places`, in both places it's built: pass `byAppointment`.
- `places_and_hours`: for such a place, instead of `hours`, give
  `byAppointment: true` and a line like "By appointment only: book a session
  with a trainer". Don't list its weekly hours as opening hours, and never
  say it's "open" at a time or "open as usual".
- Its special days still count: a day it's closed (Thanksgiving) means no
  appointments that day, and Billy may say so. A special day with hours at
  such a place is still by appointment only.
- Add to `SPECIAL_DAYS_SAY` and the tool's description: a by-appointment
  place is never described as open for walk-ins, on a holiday or any day.
- Check Billy's other answers that state a place's hours or "open now" (the
  phone's and website's greeting, `busy_now`, `studio_free`, the team's
  `placeDay`) for the same thing, and make them say by appointment only too.

The website (trnblt.com) already shows the Mission as by appointment; nothing
there needs to change.

Add it to the CHANGELOG, and to MANUAL.md where Billy's answers about hours
are described.

Don't test against the live site or change live data, and don't send test
questions to the live Billy. When it's live, tell me the build number.
