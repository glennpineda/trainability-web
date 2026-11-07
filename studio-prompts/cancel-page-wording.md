The cancel page (`/forms/cancel`, src/public/CancelPage.jsx) opens with
"To cancel or pause, first confirm it's you: we'll send a code." The website
(trnblt.com) shows this page in its "Cancel membership" dialog, and there
the line reads as if pausing were on offer to anyone. It isn't: on this page
"Pause instead" only appears as an offer to stay, after someone picks a
reason to cancel (`PAUSE_INSTEAD`), and the website never advertises those
offers. A member's ordinary pause lives in the member portal.

Change the line to: "To cancel, first confirm it's you: we'll send a code."

Nothing else changes: "Pause instead" and the stay discount still appear
after a reason, exactly as today, and the code, dark theme and the height
and "sent" messages to the website stay as they are. Check the other
wording before the code (the email and text steps, "Send a new code") for
any other mention of pausing, and change it the same way.

Add it to the CHANGELOG.

Don't test against the live site or change live data. When it's live, tell
me the build number.
