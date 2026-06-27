## Why

The public wishlist page renders gifts and a "Regalar" button, but the button is disabled: guests have no way to actually mark a gift as purchased. This is the core conversion action of the product (Milestone 5). Owners can already manage purchases internally, but without the public action a published wishlist cannot receive a single gift, so the public page has no purpose yet.

## What Changes

- Add a public, unauthenticated tRPC mutation `purchase.markGiftPurchased` that lets a guest mark a gift as purchased.
- Enforce public-eligibility on the server: the gift must belong to a published wishlist, must not be hidden, and must not be soft-deleted, in addition to the existing remaining-quantity check.
- Generate a one-time raw undo token, persist only its hash, and set the public undo expiry to 60 seconds (returned to the caller once).
- Expose `remainingQuantity` on the public gift view model so the client can cap the quantity selector.
- Add a `PurchaseGiftModal` collecting required guest name, optional email/phone/message, an optional quantity selector (shown when remaining > 1), and consent copy with loading/error states.
- Wire the modal to the "Regalar" button on `gift-card.tsx` (enabling the previously disabled action) and disable the product link for purchased gifts.

Non-goals (explicitly out of scope here):
- Success/thank-you state and the undo UI/mutation (`purchase.undoRecentPurchase`) — that is task 5.3.
- Rate limiting / Upstash Redis — that is a later Milestone 5 task.
- Guest account creation, CAPTCHA, or email notifications.

## Capabilities

### New Capabilities
- None.

### Modified Capabilities
- `purchase-management`: add a public guest purchase action requirement — a purchase initiated by a guest SHALL be accepted only when the target gift belongs to a published wishlist and is neither hidden nor soft-deleted, and the public undo token SHALL expire after 60 seconds.
- `public-wishlist-page`: add a guest purchase modal entry point on the gift card, including required/optional fields, consent copy, conditional quantity selector, loading/error states, and disabling the product link for purchased gifts.
- `wishlist-view-models`: the public gift view model SHALL expose the gift's remaining quantity.

## Impact

- Server services: `src/server/services/purchase.service.ts` (new public-eligibility validation path + 60s public undo expiry).
- tRPC API: new `src/server/api/routers/purchase.ts` with a `publicProcedure` mutation, registered in `src/server/api/root.ts`. (Coordinates with the in-flight `add-owner-purchase-drawer` change, which also introduces this router file — the router must host both public and owner procedures.)
- Validation: `src/server/validators/purchase.schema.ts` already defines `createPurchaseSchema`; reused/extended as needed.
- View models: `src/server/mappers/view-models.ts` + its mapper to add `remainingQuantity`.
- UI: new `src/components/features/wishlist/purchase-gift-modal.tsx`; edits to `src/components/features/wishlist/gift-card.tsx`. Requires a shadcn `dialog` component (only `sheet`/`alert-dialog` exist today).
- Tests: focused service/router tests for public eligibility, quantity limits, and token-once behavior.
