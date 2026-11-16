The gift card page (`/forms/giftcard`) offers every place that isn't archived:
`pageInfo` in server/gift-cards.js lists them all (today Mission and Potrero
Hill). Offer a gift card only at a place that has membership plans: the
places where somebody can join, the same test the join page uses
(server/join-page.js, the places whose `plans` aren't empty). Today that's
Potrero Hill only; the Mission is by appointment and has none.

- `pageInfo`: list only those places, and pick the asked-for `place` only if
  it's one of them, else the first of them.
- `startWeb`: refuse a `placeId` that isn't one of them, with the same "Pick
  where it is for." answer as a missing one, so the page can't be sent
  around it.
- With only one such place, the page shows it as plain text ("For
  Trainability Potrero Hill") instead of a choice; with two or more, the
  choice as today.
- With none, the page says gift cards aren't sold online right now and to buy
  one at the front desk, like the switch being off, and `startWeb` refuses.
- When a place gets membership plans later, it appears on the page by itself.
- The front desk's own gift cards (desk-cart.js, shop.js) don't change, and
  neither do cards already sold for any place, or claiming one.

The website frames this page at trnblt.com/gift-cards with `?theme=dark`;
nothing there needs to change.

Add it to `docs/FORMS-API.md` (the gift card form) and the CHANGELOG.

Don't test against the live site or change live data. When it's live, tell
me the build number.
