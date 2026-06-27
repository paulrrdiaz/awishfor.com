## 1. Validation & View Model

- [x] 1.1 Tighten `purchaseGuestNameSchema` in `src/server/validators/purchase.schema.ts` to require 2–80 characters to match the public guest-name acceptance criteria.
- [x] 1.2 Add `remainingQuantity: number` to `PublicGiftViewModel` in `src/server/mappers/view-models.ts`.
- [x] 1.3 Compute and populate `remainingQuantity` (quantityNeeded − purchasedQuantity, floored at 0) in the public gift mapper, reusing the purchased-quantity source already used for `status`.

## 2. Server Purchase Mutation

- [x] 2.1 Add `PUBLIC_UNDO_TOKEN_EXPIRY_SECONDS = 60` and `markGiftPurchasedPublic(db, input)` to `src/server/services/purchase.service.ts`, loading the gift with its wishlist relation.
- [x] 2.2 Reject the purchase unless `wishlist.status === "published"`, `gift.visibilityStatus !== "hidden"`, and `gift.deletedAt === null`; reuse the existing remaining-quantity check.
- [x] 2.3 Create the purchase, hash a one-time raw undo token, set undo expiry to 60 seconds, and return the purchase summary plus the raw undo token once.
- [x] 2.4 Add `markGiftPurchased: publicProcedure.input(createPurchaseSchema).mutation(...)` to `src/server/api/routers/purchase.ts`, calling `markGiftPurchasedPublic` and returning `{ purchase summary, undoToken }`.
- [x] 2.5 Add focused service tests for: published+visible gift succeeds, draft/archived wishlist rejected, hidden gift rejected, soft-deleted gift rejected, over-remaining quantity rejected, and 60-second expiry set.

## 3. Public Purchase Modal UI

- [x] 3.1 Add the shadcn `dialog` component to `src/components/ui/`.
- [x] 3.2 Create `src/components/features/wishlist/purchase-gift-modal.tsx` (client) with required name (2–80), optional email/phone/message (validated, message ≤ 500), consent copy, and `api.purchase.markGiftPurchased.useMutation` wiring with loading/error states.
- [x] 3.3 Show a quantity selector only when `gift.remainingQuantity > 1`, constrained to 1..remainingQuantity; otherwise submit quantity 1.
- [x] 3.4 Wire the modal into `src/components/features/wishlist/gift-card.tsx`: enable the previously disabled "Regalar" action to open the modal for that gift, and render the product link disabled when `status === "purchased"`.
- [x] 3.5 Add focused component tests where practical for name validation, optional-field validation, conditional quantity selector, and consent copy presence.

## 4. Verification

- [x] 4.1 Run `pnpm check` and fix reported issues.
- [x] 4.2 Run `pnpm test` and fix reported issues.
- [x] 4.3 Run `pnpm typecheck` and fix reported issues.
- [x] 4.4 Check off tasks 5.1 and 5.2 in `docs/TASKS.md` after implementation and validation complete.
