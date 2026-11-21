The website (trnblt.com) is getting a "How busy is it?" section on each
location page (/potrero-hill, /mission), the same thing Studio shows
beside start times and on Insights' Busy today. It needs a public read for
it, like the team list (`GET /api/forms/team`, server/website-team.js).

Add `GET /api/forms/busy`: public, no sign-in, read-only, answered for
trnblt.com in the browser the way `/api/forms/team` is (same CORS).

It answers levels only, never counts (Glenn, 10 Oct 2026: "level only
(quiet/steady/busy), never counts"): no head counts, no names, not the
capacity. For each place that isn't archived:

```json
{ "places": [ {
  "id": "plc047jcr287", "name": "Potrero Hill",
  "today": "2026-11-20", "hourNow": 14,
  "now": "steady",
  "days": [ { "date": "2026-11-20", "levels": ["quiet", "...24 of them"] } ]
} ] }
```

- `days`: today and the six days after it, on the place's own clock, each
  `levels[hour]` from `busyLevels` (server/attendance.js), the forecast held
  to what's already booked, so it matches what the app shows. `levels` is
  null for a day where `busyLevels` says nothing honest (no capacity set,
  too little history).
- `now`: the level for this minute from the actual count (the same count
  Attendance's `now` uses, `levelOf(count, capacity)`), so "right now" is
  what is, not what was expected. Null where there's no capacity.
- A place with no capacity set comes back with `now: null` and every day's
  `levels: null`, and the website shows nothing for it. (Today that's
  probably the Mission.)
- Keep it cheap: hold the whole answer for 5 minutes (as `busyLevels`
  keeps its own), so visitors never cause a forecast each.
- Hours the place is closed may be any level or null; the website shows
  only its open hours.

Add it to `docs/FORMS-API.md` and the CHANGELOG.

Don't test against the live site or change live data. When it's live, tell
me the build number, and which places have a capacity set.
