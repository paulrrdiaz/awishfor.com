## Why

Guests can now mark a gift as purchased (task 5.2), but the purchase is final from their point of view: the modal closes instantly with no confirmation, no way to correct a mistake, and the public page keeps showing stale gift status and progress until a full reload. Tasks 5.3 and 5.4 close this gap — a reassuring success state with a brief undo window, plus an immediate refresh so the page reflects the new reality.

## What Changes

- Replace the modal's "close immediately on success" behavior with a success/thank-you state showing confirmation copy plus a `Deshacer` action (available during the 60-second window) and a `Cerrar` action.
- Add a public `purchase.undoRecentPurchase` tRPC mutation wrapping the existing `undoPurchase` service (token-hash + expiry validation already implemented), deleting only the just-created purchase on a valid token.
- After a successful purchase and after a successful undo, refresh the server-rendered public wishlist data so gift status, quantity progress, and the progress summary update in place.
- Move fully-purchased gifts into the purchased group and remove their purchase CTA as a result of the refresh (already derived from server props; gated by the refresh trigger).

Non-goals (explicitly out of scope here):
- Rate limiting on the undo endpoint and other public mutations — that is task 5.5.
- Realtime updates between different guests / across devices or browsers — undo is single-session only.
- Any change to owner-side purchase management or the owner undo toast (task 4.7, already shipped).

## Capabilities

### New Capabilities
- None.

### Modified Capabilities
- `purchase-management`: add a public guest undo requirement — a guest SHALL be able to undo a just-created purchase within 60 seconds by presenting the one-time raw undo token; the server SHALL accept the undo only when the token hash matches and the undo window has not expired, deleting only that purchase, and SHALL fail safely otherwise.
- `public-wishlist-page`: the guest purchase modal SHALL show a success state with confirmation copy, a `Deshacer` action active during the undo window, and a `Cerrar` action; after a successful purchase or undo the public page data SHALL refresh so gift status, per-gift quantity progress, the purchased grouping, CTA removal, and the progress summary reflect the change without a manual reload.

## Impact

- Server: `undoPurchase` already exists in `src/server/services/purchase.service.ts`; no service change expected beyond reuse.
- tRPC API: add `undoRecentPurchase: publicProcedure.input(undoPurchaseSchema)` to `src/server/api/routers/purchase.ts` (`undoPurchaseSchema` already defined in `src/server/validators/purchase.schema.ts`).
- UI: `src/components/features/wishlist/purchase-gift-modal.tsx` (success/undo state, undo mutation wiring, `router.refresh()` on purchase + undo). The mapped purchase summary returned by `markGiftPurchased` must expose the purchase `id` so undo can target it.
- Public page refresh relies on the existing RSC data flow (`src/app/w/[slug]/page.tsx` → layouts → `PublicGiftFilters` → `GiftCard`); client filter state is preserved across `router.refresh()`.
- Tests: extend `src/components/features/wishlist/purchase-gift-modal.test.tsx` for success state, undo action, and `Cerrar`; add a focused router/service test for the undo mutation path.
