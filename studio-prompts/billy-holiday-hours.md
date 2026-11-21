Billy's chat on the website (`/api/forms/billy`, server/assistant/web.js)
is told "Opening hours, holiday hours and addresses: `places_and_hours`",
but `places_and_hours` (server/assistant/phone.js, `handlers.places_and_hours`)
only gives each place's weekly hours. The `look.places` it reads
(server/index.js, the website chat's agent and the phone's) passes
`week: await hoursFor(p.id)` and no special days. So when somebody asks
"Are you open on Thanksgiving?" or "What are your hours on Christmas Eve?",
Billy answers from the usual week, even when the day is closed or keeps
other hours in Places › Hours (hours.js, `specialHours`).

Make Billy see the holiday and special hours, on the website chat and on
the phone (both use the same tool):

- `look.places`, in both places it's built: add each place's special days
  from today through the next 60 days on the place's own clock, from
  `specialHours(p.id, today, …)`, the same days the website's team list
  sends as `specialHours` (website-team.js).
- `places_and_hours`: add them to each place as `specialDays`, each as a
  spoken date (`spokenDay`), its label if it has one ("Thanksgiving"), and
  "closed" or "<open> to <close>" in the same words as `hours`. Say which
  date is today, so "tomorrow" and "this Thursday" can be worked out.
- Its description and `say`: a special day takes the place of that
  weekday's usual hours. When somebody asks about a date, a holiday or
  "this week", check `specialDays` first and give that day's hours; when
  the usual hours are given, mention a special day coming up in the next
  14 days in one short line (as the website's holiday bar does).
- A place with none: `specialDays` is left out, and nothing changes in
  what Billy says.

Nothing about who may ask changes: these are public, as on the website.

Add it to the CHANGELOG, and to MANUAL.md where Billy's answers on the
website and the phone are described.

Don't test against the live site or change live data, and don't send
test questions to the live Billy. When it's live, tell me the build number.
