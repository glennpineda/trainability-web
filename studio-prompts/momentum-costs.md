Change what Momentum takes off:

- **A missed studio reservation (a confirmed no-show): −2**, was −1.
- **7 days in a row without coming: −3**, was −2.

Gains stay as they are: +1 for a day checked in, +1 for each PT session.
Still 16 for the Flex Pass, still from 0 on the 1st, still never below 0.

**Where**
- `server/flex-pass.js`: `NO_SHOW_COST = 2`, `GAP_COST = 3`, and the comment
  at the top of the file (−1 and −2 there).
- Everywhere that says the numbers in words, so the app and Billy agree:
  the member's **How Momentum counts** (MemberParts.jsx), the kiosk,
  the Flex Pass shadow and its "close to it" maths if they use these
  costs, docs/RULES.md (for example "a no-show takes 1 off, and 7 days in a
  row without coming take 2 off"), the manuals and the CHANGELOG.
- A month already under way: work it out with the new costs from the next
  count on. Don't take away a Flex Pass somebody has already reached.

The website (trnblt.com/momentum, not yet published) already says −2 and −3.

Don't test against the live site or change live data. When it's live, tell
me the build number.
