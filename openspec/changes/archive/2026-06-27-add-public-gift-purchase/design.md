## Context

Milestone 5 turns the public wishlist page into a working conversion surface. The public page (`src/app/w/[slug]/page.tsx`) already renders gifts via `GiftCard`, but the "Regalar" button is hard-disabled and there is no guest purchase path.

Current state of the purchase stack (after `add-owner-purchase-drawer` landed):
- `src/server/services/purchase.service.ts` exports `createPurchase` (generic: validates only `deletedAt: null` + remaining quantity, 15-minute undo expiry), `undoPurchase`, quantity/status helpers, and owner-scoped functions.
- `src/server/api/routers/purchase.ts` exists and is registered in `root.ts` as `purchase`, currently exposing only `protectedProcedure` owner procedures (`listForGift`, `createManual`, `delete`).
- `src/server/validators/purchase.schema.ts` already defines `createPurchaseSchema` (giftId, guestName, optional email/phone/message, quantity default 1) and `undoPurchaseSchema`.
- `PublicGiftViewModel` exposes `status` and `quantityNeeded` but not remaining quantity.
- Prisma: `Wishlist.status` (`WishlistStatus { draft, published, ... }`), `Gift.visibilityStatus` (`GiftVisibilityStatus { available, hidden }`), `Gift.deletedAt`.
- shadcn components present: `sheet`, `alert-dialog` — no `dialog`.

This change is scoped to tasks 5.1 (public mutation) and 5.2 (public modal) only.

## Goals / Non-Goals

**Goals:**
- A public `publicProcedure` mutation that lets a guest mark a gift purchased, gated by published-wishlist + visible + not-deleted + remaining-quantity checks.
- One-time raw undo token returned to the caller; only the hash persisted; 60-second public undo expiry.
- Expose remaining quantity on the public gift view model.
- A `PurchaseGiftModal` with required name, optional contact/message, conditional quantity selector, consent copy, and loading/error states, wired into `GiftCard`'s primary action; product link disabled for purchased gifts.

**Non-Goals:**
- Success/thank-you state and undo UI + `purchase.undoRecentPurchase` mutation (task 5.3).
- Rate limiting / Upstash Redis (later Milestone 5 task).
- Guest accounts, CAPTCHA, owner/email notifications.

## Decisions

### Add a dedicated public service function rather than reuse `createPurchase`
Add `markGiftPurchasedPublic(db, input)` to `purchase.service.ts`. It loads the gift **with its wishlist relation**, then rejects unless `wishlist.status === "published"`, `gift.visibilityStatus !== "hidden"`, and `gift.deletedAt === null`; reuses the existing remaining-quantity check and token-hash logic; and sets undo expiry to 60 seconds via a separate `PUBLIC_UNDO_TOKEN_EXPIRY_SECONDS = 60` constant.
- **Why not extend `createPurchase`:** `createPurchase`'s generic semantics (deleted-only check, 15-minute expiry) are relied on by other internal/owner paths. Public eligibility + the 60s window are public-specific; mixing them risks weakening owner flows. Token generation/hashing is the only shared piece and is already a private helper.
- **Alternative considered:** add an `options`/`mode` flag to `createPurchase`. Rejected — branchy validation in one function is harder to test and reason about than two named functions.

### Add the public mutation to the existing `purchaseRouter`
Add `markGiftPurchased: publicProcedure.input(createPurchaseSchema).mutation(...)` to `src/server/api/routers/purchase.ts`, calling `markGiftPurchasedPublic(ctx.db, input)` and returning `{ purchase summary, undoToken }`. No new router file or `root.ts` change is needed (the file already exists from `add-owner-purchase-drawer`).
- Reuse the existing `createPurchaseSchema` for input; the guest-name 2–80 length rule is enforced in the modal/schema layer (current schema min is 1 — tighten to 2–80 to match the spec's acceptance criteria).

### Expose `remainingQuantity` on `PublicGiftViewModel`
Add `remainingQuantity: number` to `PublicGiftViewModel` and compute it in its mapper (quantityNeeded − purchasedQuantity, floored at 0) using the same purchased-quantity source already used to derive `status`. The modal caps the quantity selector at this value; the server re-validates regardless.
- **Trade-off:** reveals exact remaining count for partial gifts (status already revealed "partial"). Acceptable and necessary for a correct selector max.

### Use a shadcn `dialog` for the modal
Add the shadcn `dialog` component and build `purchase-gift-modal.tsx` as a client component using tRPC React (`api.purchase.markGiftPurchased.useMutation`). `GiftCard` becomes/embeds a client island: the "Regalar" button opens the modal for the selected gift; the product link is rendered disabled when `status === "purchased"`.
- **Alternative considered:** reuse `sheet`. Rejected — a centered modal matches the "modal" requirement and the short form better than a side sheet.

### Form validation
Validate in the modal with the same field rules as the server (name 2–80, email/phone optional + validated, message ≤ 500, quantity 1..remaining). Surface field errors inline; show a submit-time error state from the mutation's `onError`.

## Risks / Trade-offs

- [Public mutation is unauthenticated and unthrottled in this change] → Server enforces all eligibility + quantity rules so it cannot corrupt data; abuse-volume protection (rate limiting) is a separate, already-planned Milestone 5 task. Note this explicitly so it isn't forgotten.
- [`GiftCard` currently renders inside server components] → Introducing a client modal requires making the interactive part a client component; keep the heavy card markup as-is and isolate the button/modal to minimize the client boundary.
- [Tightening `purchaseGuestNameSchema` min from 1 to 2] → Owner manual-purchase default name `Registrado por el creador` is well over 2 chars, so no owner regression; verify owner tests still pass.
- [Coordination with `add-owner-purchase-drawer`] → That change owns the router file and view-model/mapper additions; this change only appends a public procedure and a public view-model field. Apply after confirming the router/root state shown in Context.

## Open Questions

- None blocking. Success/undo UX and rate limiting are deferred to later tasks by design.
