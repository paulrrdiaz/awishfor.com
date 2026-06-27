## Context

The public wishlist page is a React Server Component (`src/app/w/[slug]/page.tsx`) that fetches a `PublicWishlistViewModel` via `getPublicWishlistBySlug` and passes it as props down through layout components → `PublicGiftFilters` (client, holds filter/sort state) → `GiftGrid`/`GiftList` → `GiftCard` (client). Gift status, per-gift quantity progress, the purchased grouping, and the progress summary are all **derived from these server props** — there is no client-side tRPC query for gifts.

The guest purchase path (5.2) is already in place: `purchase.markGiftPurchased` (public mutation) returns `{ purchase, undoToken }`, and `PurchaseGiftModal` submits it but currently just closes on success. On the server, `undoPurchase` already implements full token-hash + expiry validation and deletes the purchase, and `undoPurchaseSchema` is already defined. What is missing is (a) the public router procedure that exposes `undoPurchase`, (b) the modal success/undo UI, and (c) the page refresh trigger.

## Goals / Non-Goals

**Goals:**
- Confirm purchases with a reassuring success state and a 60-second undo affordance.
- Reuse the existing `undoPurchase` service and `undoPurchaseSchema` — only add the public router procedure.
- Keep gift status, progress, grouping, and CTA in sync after purchase/undo without a manual reload, preserving the guest's filter/sort selection.

**Non-Goals:**
- Rate limiting (task 5.5), realtime cross-guest updates, and any owner-side changes.
- Optimistic client-side mutation of the view model (we re-fetch from the server instead).

## Decisions

### Refresh via `router.refresh()` over optimistic local state
The public page is an RSC; the source of truth for gift status/progress lives server-side. After a successful purchase or undo, the modal calls `useRouter().refresh()` (from `next/navigation`), which re-runs the server component and streams fresh props down the tree. React preserves client component state across a refresh, so `PublicGiftFilters`' `useState` filter/sort selection survives — satisfying the "filters survive the refresh" scenario for free.

- **Alternative considered:** optimistically patch the gift in client state. Rejected — it would duplicate the server's status/remaining derivation in the client, risk drift, and the data already flows cleanly from one server source.
- **Trade-off:** `router.refresh()` re-fetches the whole page payload (one extra round trip). Acceptable for a low-frequency, deliberate guest action.

### Undo targets the purchase id + raw token, held only in modal state
`markGiftPurchased` returns the created purchase and the raw undo token once. The modal stores both in component state for the lifetime of the success view and passes them to `undoRecentPurchase`. The mapped purchase summary must expose `id` (it does via `mapOwnerPurchaseRecord`); the undo mutation input is `{ purchaseId, undoToken }` per the existing `undoPurchaseSchema`. The raw token never leaves the client session — consistent with the single-session, non-cross-device non-goal.

### Success state is a third modal mode, not a separate component
The modal already has form + submitting states. Add a `phase` notion (`form` → `success` → `undone`/`error`) inside `PurchaseGiftModal` rather than a new component, keeping the dialog and its open/close wiring in one place. `Deshacer` drives the undo mutation (loading/error states), `Cerrar` closes. The 60-second window is enforced server-side (token expiry); the UI does not need a countdown to be correct, though `Deshacer` may be hidden/disabled once undo is no longer expected to succeed.

### Router procedure is a thin wrapper
`undoRecentPurchase: publicProcedure.input(undoPurchaseSchema).mutation(...)` calls the existing `undoPurchase(asPublicPurchaseDb(ctx), input)`. No new service logic. Note `undoPurchase` currently takes `PurchaseDatabase`; `PublicPurchaseDatabase` is structurally compatible for the `purchase` delegate, so reuse the existing public-db cast helper or pass a `PurchaseDatabase` cast.

## Risks / Trade-offs

- [Refresh races a fast undo] → Both purchase-success and undo trigger `router.refresh()`; if a guest undoes immediately the second refresh reflects the deletion. The final refresh wins; transient intermediate state is acceptable.
- [Token expiry between success view and `Deshacer` click] → Server rejects expired undo and the modal surfaces an error; the purchase correctly remains. Covered by the "undo failure surfaced safely" scenario.
- [`undoPurchase` db type] → Verify the existing service signature accepts the public db shape; adjust the cast helper rather than widening the service contract.
