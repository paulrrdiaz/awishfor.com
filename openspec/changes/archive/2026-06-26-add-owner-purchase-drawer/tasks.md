## 1. Server Purchase Management

- [x] 1.1 Add owner purchase input schemas to `src/server/validators/purchase.schema.ts` for list-by-gift, manual create, and delete-by-purchase-id.
- [x] 1.2 Add a dashboard-safe purchase record view model and mapper for owner-visible purchase details.
- [x] 1.3 Implement `listOwnerGiftPurchases(db, { ownerId, giftId })` in `purchase.service.ts`, verifying the gift is active and owned before returning ordered purchase records.
- [x] 1.4 Implement `createOwnerManualPurchase(db, { ownerId, giftId, ...input })`, defaulting missing guest name to `Registrado por el creador` and rejecting quantities above remaining.
- [x] 1.5 Implement `deleteOwnerPurchase(db, { ownerId, purchaseId })`, verifying ownership through the purchase's gift wishlist before deleting the record.
- [x] 1.6 Add focused purchase service tests for owner listing, default manual name, remaining-quantity rejection, non-owner rejection, and delete restoring remaining quantity.

## 2. tRPC API

- [x] 2.1 Add `src/server/api/routers/purchase.ts` with protected `listForGift`, `createManual`, and `delete` procedures deriving local owner ID from Clerk.
- [x] 2.2 Register `purchaseRouter` in `src/server/api/root.ts`.
- [x] 2.3 Add router-level tests or service-backed caller tests for unauthenticated rejection and owner authorization behavior where the existing test setup supports it.

## 3. Dashboard Drawer UI

- [x] 3.1 Create `src/components/features/dashboard/purchases/` components for the gift purchase drawer, purchase record list, manual purchase form, and delete confirmation.
- [x] 3.2 Wire a `Compras`/purchase-management action into `GiftRowActions` so each dashboard gift can open the drawer.
- [x] 3.3 Fetch purchase records only while the drawer is open and render guest name, optional email/phone/message, quantity, and timestamp.
- [x] 3.4 Submit manual purchases from the drawer, show `Compra agregada` with `Deshacer`, invalidate drawer data, and refresh dashboard aggregate progress.
- [x] 3.5 Delete purchases from the drawer only after confirmation, then invalidate drawer data and refresh dashboard aggregate progress.
- [x] 3.6 Add focused component tests where practical for manual purchase validation, delete confirmation, empty-state rendering, and undo action wiring.

## 4. Verification

- [x] 4.1 Run `pnpm check` and fix reported issues.
- [x] 4.2 Run `pnpm test` and fix reported issues.
- [x] 4.3 Run `pnpm typecheck` and fix reported issues.
- [x] 4.4 Update the Milestone 4.7 checklist in `docs/TASKS.md` after implementation and validation complete.
