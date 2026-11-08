The website's Terms and Privacy Policy (trnblt.com/terms, trnblt.com/privacy)
were checked against Studio's code and brought up to date (effective
7 November 2026). A few things Studio does need to change to match them, and
Studio's own texting pages need the same update. Glenn decided each one.

**1. Refill automatically needs the client's own yes.** Today a trainer or
manager can switch it on for a client (server/refills.js, around
`tellAutoOnFor`), and the client's card is charged without asking whenever
their sessions run out; the client is only told afterwards. From now on, a
trainer or manager may only *offer* it. It turns on once the client accepts,
by a tap in their member portal or by a text reply, and nothing is charged
automatically before then. Keep when and how they accepted, the way other
consents are kept. Clients who have it on today without having accepted it
themselves: list them for Glenn before anything changes for them; don't
switch anyone off silently. Refill by text (the BUY question) is unchanged,
since each purchase is its own yes.

**2. Auto-renewal consent at the desk comes from the member.** Today, at the
front desk, staff tick "<first> agrees that … renews … until they cancel"
(src/desk/DeskMembership.jsx `renews`, server/own-memberships.js
`renewWords`). The membership agreement (2.3) says the member gives this
consent by ticking a separate box themselves. Put that box on the member's
own signing screen (kiosk, desk tablet or the emailed agreement link), as a
separate tick beside signing, in the "I agree that …" words the kiosk and
join page use. The desk's Pay waits until the member has ticked it. Keep the
words, the time and where it was ticked, as today. Online and kiosk joining
don't change. A crm-handover's yes is unchanged.

**3. Studio's texting pages match the code and the website.** Rewrite the
public texting page (public/sms/index.html, the one HELP replies link to)
and the SMS Terms and Privacy Policy draft (docs/Trainability SMS Terms and
Privacy Policy (app blanks).html), so Glenn can publish a new SMS Terms
version in the app:
- STOP stops every text to that number (no STOPALL needed); START, then Y
  within 30 minutes, turns them back on.
- Remove the FCC Reassigned Numbers Database line; nothing does that check.
- Replies are read: a free-text reply goes to the trainer or the team (by
  email or Chat), and Y, N, BUY, R and C act on it.
- Texts are account and service messages only; news and offers are email
  only. Drop "Twilio only": numbers go to the text provider and to the
  membership system (Glofox) as part of an account.
- Quiet hours (9 PM to 8 AM, the place's clock) apply to reminders and other
  messages scheduled ahead; a message about something that just happened (a
  booking, a cancellation, a payment, a sign-in code) may be sent any time.
- Ages: under 18 only with a parent or guardian who signs for them, and
  nothing collected directly from children under 13 (not "18 and older").
- No email address anywhere: the contact form at trnblt.com/contact and the
  front desk at (415) 594-6019 instead. Remove info@trainabilitystudio.com
  and company@trainabilitystrength.com. Fill in the support phone number the
  draft still leaves blank.
- Keep the Cloudflare Turnstile sentence, and add Billy's chat on the website
  to its examples.
Where the website's Terms already say something (message list, consent,
frequency, the email fallback, Billy on the phone), use the same facts.

**4. The cancellation fee wording.** It is charged when the member cancels
(account credit first, then the card) since 29 Oct 2026, but Membership
Agreement 3.11 still says "on the day the membership ends". Update 3.11 in
the agreement docs and in the house document, to match: "charged when you
cancel, from your account credit first and then your payment method on file.
If the charge does not go through, your cancellation still stands and the fee
remains owed." Glenn publishes the new agreement version.

**5. Accepted-terms date.** The website's Terms changed on 7 November 2026.
Set `business_terms_date` (server/site-terms.js) to 2026-11-07, so people are
asked to accept the new version.

Not changing: the "Pause instead" offer on cancel stays as it is, and the
yearly anniversary email keeps its switch (Glenn turns it on).

Add it all to the CHANGELOG. Don't test against the live site or change live
data. When it's live, tell me the build number, and the list from item 1.
