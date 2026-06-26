## Why

The public wishlist page renders gifts and lets guests filter/sort them, but gives no at-a-glance sense of how much is still buyable or how far the list has been fulfilled. Guests (and the host sharing the link) want a quick summary like `8 disponibles · 7 de 16 unidades compradas` so they can see remaining need without scanning every card.

## What Changes

- Add an aggregate progress summary to the public wishlist view model, computed in the public mapper from visible gifts only: available gift count, purchased units, and total units.
- Add a `ProgressSummary` presentational component that renders the summary in the `8 disponibles · 7 de 16 unidades compradas` format.
- Handle the zero-state safely (empty wishlist, zero purchases, zero total units) without dividing by zero or showing misleading copy.
- Ensure hidden and soft-deleted gifts are excluded from progress, and partial purchases are counted as purchased units (capped at each gift's needed quantity).
- Wire the progress summary into the public wishlist page in `full` render mode.
- Non-goals: animated/visual progress bars, per-category progress breakdowns, currency/amount-based progress (this is quantity-based only), and dashboard/owner-facing progress (covered by Milestone 6).

## Capabilities

### New Capabilities
- `public-wishlist-progress`: a guest-facing quantity-based progress summary on the public wishlist page — available gift count plus purchased-of-total units, in a localized text format, with a safe zero-state.

### Modified Capabilities
- `wishlist-view-models`: the public wishlist view model gains a derived aggregate progress summary (available gift count, purchased units, total units) computed from visible gifts.

## Impact

- New: `src/components/features/wishlist/progress-summary.tsx` (+ test for the aggregate computation).
- Modified: `src/server/mappers/public-wishlist.mapper.ts` (compute progress aggregate), `src/server/mappers/view-models.ts` (add progress type to `PublicWishlistViewModel`).
- Wiring: public wishlist page shell renders `ProgressSummary` in `full` mode only.
- Consumes existing `getPurchasedQuantityFromLoaded`, `isGiftVisible`, and `deriveGiftPublicStatus`; no schema, env, API, or new dependency changes.
- Depends on Task 2.4 (public layout components) being in place.
