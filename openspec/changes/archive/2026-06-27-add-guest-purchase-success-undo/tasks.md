## 1. Undo Mutation (server)

- [x] 1.1 Add `undoRecentPurchase: publicProcedure.input(undoPurchaseSchema).mutation(...)` to `src/server/api/routers/purchase.ts`, calling the existing `undoPurchase` service with the public db cast and returning nothing meaningful (or `{ ok: true }`).
- [x] 1.2 Confirm `undoPurchase`'s db parameter type accepts the public db shape; adjust the cast helper (`asPublicPurchaseDb` / a `PurchaseDatabase` cast) rather than widening the service contract.
- [x] 1.3 Verify `markGiftPurchased`'s returned purchase summary exposes `id` (via `mapOwnerPurchaseRecord`) so the client can target undo; no change expected, just confirm.

## 2. Success & Undo UI (modal)

- [x] 2.1 In `src/components/features/wishlist/purchase-gift-modal.tsx`, store the created purchase `id` and raw `undoToken` from the `markGiftPurchased` success payload instead of closing immediately.
- [x] 2.2 Render a success phase replacing the form: thank-you confirmation copy, a `Deshacer` action, and a `Cerrar` action.
- [x] 2.3 Wire `Deshacer` to `api.purchase.undoRecentPurchase.useMutation` using the stored `{ purchaseId, undoToken }`, with loading and error states; on failure show the error and keep the purchase.
- [x] 2.4 Wire `Cerrar` to close the modal (and reset internal state) keeping the purchase; reset phase to `form` on reopen.

## 3. Public Page Refresh

- [x] 3.1 Call `useRouter().refresh()` (from `next/navigation`) in the modal after a successful purchase.
- [x] 3.2 Call `useRouter().refresh()` after a successful undo so gift status, remaining quantity, purchased grouping, CTA removal, and the progress summary update from fresh server props.
- [x] 3.3 Confirm the guest's active filter/sort selection in `PublicGiftFilters` is preserved across the refresh (client state survives `router.refresh()`); no code change expected, verify behavior.

## 4. Tests

- [x] 4.1 Add a focused router/service test for `undoRecentPurchase`: valid token within window deletes the purchase; expired/invalid token rejects and keeps it.
- [x] 4.2 Extend `src/components/features/wishlist/purchase-gift-modal.test.tsx` for the success state (copy + `Deshacer` + `Cerrar`), undo action invoking the mutation, and `Cerrar` closing without undo.

## 5. Verification

- [x] 5.1 Run `pnpm check` and fix reported issues.
- [x] 5.2 Run `pnpm test` and fix reported issues.
- [x] 5.3 Run `pnpm typecheck` and fix reported issues.
- [x] 5.4 Check off tasks 5.3 and 5.4 in `docs/TASKS.md` after implementation and validation complete.
