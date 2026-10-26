The website (trnblt.com) now counts visits and key actions with Umami, a
cookie-free analytics tool. It can't see inside Studio's embedded forms, so it
doesn't know when one is sent. Please have each embedded form tell the page
it's in, the same way it already reports its height.

**What to send**
- When one of these forms is sent successfully, it posts one message to its
  parent page. Send it only after the server has said the submission
  succeeded, never on a failed or invalid one:
  - the contact form (`/forms/contact`): website frame name `contact`;
  - the personal training inquiry (`/forms/ptinquiry`): frame name
    `ptinquiry`;
  - the studio reservation form: frame name `reserve`.
- The message:
  ```js
  parent.postMessage(
    { source: "trainability-form", type: "sent", form: "<frame name>", topic: "<code, contact form only>" },
    "<the parent's origin>"
  )
  ```
  - `source` and `form` are the same values as in the existing `height`
    message.
  - `topic` is the contact form's topic code (`pause`, `cancel`, `stretch`,
    `other`, and so on). Leave it out for the other forms.
- Nothing personal goes in it: no name, email, phone, message text, reason,
  or ids.

**Where it may go**
- Post only to these parent origins:
  - `https://trnblt.com`
  - `https://www.trnblt.com`
  - `https://trainability.org`
  - `https://www.trainability.org`
- Work out the parent's origin (`location.ancestorOrigins` where the browser
  has it, otherwise `document.referrer`) and send only if it's in that list.
  Never post with `"*"`.
- When the form isn't in a frame (opened on its own), send nothing.

**Also**
- Don't change anything else about the forms. The website already listens for
  `type: "sent"` and checks that the message comes from
  `https://trainabilitystudio.com`.
- Add it to `docs/FORMS-API.md`, under the embed and height message, and to
  the CHANGELOG.
- Don't test against the live site or change live data. When it's live, tell
  me the build number.
