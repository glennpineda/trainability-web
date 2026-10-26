Add a public **"Put Studio on your phone"** page at
**`https://trainabilitystudio.com/install`**. Glenn will email its link to
members and clients so they can put Studio 3 on their home screen. Write it for
the least tech-savvy person we have: someone who has never heard the words
"home screen", "browser" or "web app".

**Why this page is on Studio and not on the website.** Add to Home Screen saves
the page you are on. On trainability.org it would save the gym's website.
Here, the person installs the real Studio 3 straight from the page with the
instructions on it.

**1. The page**
- **Public:** no sign-in, and it fetches nothing about anybody. Give it the
  same look as the other public pages (the sign-in screen, `/moved`).
- **Built from what Studio already has:** `useInstall()` in
  `src/lib/install.js`, and the iPhone steps and icons in
  `src/components/InstallApp.jsx`. Reuse these; don't write a second copy.
- **Plain words, big type, big tap targets.** One idea per sentence. Name what
  they will actually see, for example "a square with an arrow pointing up".
  Don't use "PWA", "browser", "manifest" or "install prompt".
- **At the top:** "Put Studio on your phone". Under it: "It takes about a
  minute. It's free, and there's nothing to download from the App Store."
  Then the Studio 3 icon with "This is the icon you'll get."

**2. What the page shows, decided by `useInstall()`**
- **Android** (`how === "prompt"`): one large **Install Studio 3** button
  that opens the phone's own "Install app?" box, then "Tap **Install**". If
  the button doesn't work, show the manual steps under it: tap **⋮** (three
  dots, top right), then **Add to home screen** or **Install app**, then
  **Install**. On Samsung Internet: tap **☰**, **Add page to**, then
  **Home screen**.
- **iPhone or iPad** (`how === "ios"`): the steps, numbered, each with its
  picture, written as if they are reading on the same phone they'll tap.
  1. Tap the **Share** button (the square with an arrow pointing up). Say
     where it is. On iOS 26, Safari may hide it behind the **•••** button at
     the bottom: if so, tap **•••** first, then **Share**. Check what current
     Safari actually shows on an iPhone and on an iPad, and word the step to
     match.
  2. Scroll down and tap **Add to Home Screen**. If it isn't in the list,
     tap **View More** or **More** first.
  3. If you see **Open as Web App**, leave it switched on. Tap **Add**.
- **Opened inside another app** (`how === null`, but on a phone): this is
  the likely case, because people tap the link in Mail, Gmail or Outlook.
  Detect it as best you can. Lead with a clear first step: "First, open this
  page in Safari" (or "in Chrome" on Android). Explain how to do that in
  Gmail, Outlook and Instagram (for example, the **•••** menu, then **Open in
  Safari**). Add a **Copy link** button, with "then paste it into Safari", for
  when that doesn't work.
- **Already running from the home screen:** "You're all set: Studio 3 is on
  your phone." Then a button to sign in, or to their portal if they are
  already signed in.
- **On a computer:** "Open this page on your phone." Show the address in
  large type, and a QR code if you have a way to make one without a new
  service. Below that, a short "If you'd like it on this computer too" with
  the install line where the browser supports it.
- **Always:** a small "Not your phone? Show the steps for iPhone / Android"
  switch, so someone can follow along for a relative.

**3. The icon must open the app, not this page**
On an iPhone the icon opens the page it was added from, which here is
`/install`. When `/install` is opened from the home screen (standalone
display mode), go straight to sign-in, or to the portal if they're already
signed in. Do the same on Android if Chrome uses this page's address.

**4. After it's on the phone**
A short "What next" section:
1. Find the **Studio 3** icon on your home screen. It may be on the last page
   of your apps.
2. Tap it and sign in with your email. We send you a 6-digit code; there's no
   password.
3. On an iPhone, turn on notifications in **Settings** inside Studio, so
   reminders reach you. Link to wherever the notifications switch lives.

**5. Trouble?**
A few one-line answers:
- "I don't see Add to Home Screen": open it in Safari first.
- "I can't find the icon": swipe left to the last page, or search for
  "Studio 3".
- "I added it twice": press and hold one, then tap **Remove App**.

Close with: "Still stuck? Call (415) 800-1425 or send us a message at
trainability.org/contact." Don't show any email address.

**6. Also**
- The sign-in screen's install strip and the Settings **Install the app** line
  get a "Show me how" link to `/install`.
- Add it to MANUAL-CLIENT 1.6, MANUAL-TRAINER 8.11 and the CHANGELOG.
- Don't test against the live site or change live data.
- When it's live, tell me the build number and the final address. The website
  will then link to it from its Studio page and footer, and forward the short
  address `trainability.org/app` to it for Glenn's email.
