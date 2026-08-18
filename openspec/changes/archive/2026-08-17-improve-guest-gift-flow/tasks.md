## 1. Undo Contract Alignment

- [x] 1.1 Add serialized `undoExpiresAt` to the `purchase.markGiftPurchased` response without changing mutation input or owner purchase view models
- [x] 1.2 Extend purchase router tests to prove the public response returns the created purchase's exact undo expiry

## 2. Shared Gift Action Wiring

- [x] 2.1 Replace `GiftCard`'s single purchase callback with typed product and purchase actions across card, tilted, collage, collage-row, row, and minimal styles
- [x] 2.2 Replace every eligible direct product anchor with a product-drawer trigger while keeping purchased, hidden, and preview actions unavailable
- [x] 2.3 Update `GiftCard` tests for both action types, every relevant card branch, accessible names, and disabled purchased behavior

## 3. Guest Gift Drawer Controller

- [x] 3.1 Replace `PurchaseGiftModal` with a `GuestGiftDrawer` built from the existing ShadCN/Vaul drawer primitives and migrate its stories/tests to the new component name
- [x] 3.2 Add one `PublicGiftFilters` controller for selected gift, product/purchase/success view, entry origin, and full transient-state reset on dismissal
- [x] 3.3 Resolve the owning `.public-theme` container before opening and portal the drawer into that instance, matching the existing how-it-works pattern
- [x] 3.4 Implement full-width mobile and constrained centered desktop bottom-drawer layout with handle, accessible title/description, safe-area padding, scrollable body, and sticky actions

## 4. Product Departure View

- [x] 4.1 Implement `Vas a salir de A Wish For`, conditional delivery introduction/block/copy action, return-and-mark reminder, and explicit close/return affordance
- [x] 4.2 Implement `Ir a la tienda` as a safe new-tab external anchor that returns a form-origin product view to the preserved purchase form while leaving a direct card-origin product view open
- [x] 4.3 Add the purchase-form `Ver producto` helper, switch the same drawer to product view, and restore every entered form value and quantity on return
- [x] 4.4 Cover product view with tests for card entry, form entry, form-state preservation after the store action, direct-entry behavior, delivery present/absent, external-link attributes, and focus return

## 5. Purchase Form View

- [x] 5.1 Move required name, optional email, optional message, conditional quantity, consent, loading, retry, and inline validation into the purchase drawer view
- [x] 5.2 Remove public phone field/state/errors and omit `guestPhone` from the guest mutation call while leaving shared server, Prisma, owner, and historical support intact
- [x] 5.3 Remove delivery UI from every purchase phase without changing `WishlistMessage` or any welcome-message delivery postscript
- [x] 5.4 Update purchase-form tests for simplified fields, exact consent copy, quantity boundaries, loading/error retry, no delivery, no phone, dismissal, and mutation payload

## 6. Success and Undo View

- [x] 6.1 Replace the submitted form in the same drawer with the `ÉXITO` eyebrow, personalized `¡Gracias, {nombre}! Tu regalo quedó marcado.` headline, supporting copy, close affordance, and success-check treatment
- [x] 6.2 Remove the Sonner purchase-success toast, eight-second countdown text/ring, and undo-expired footer message
- [x] 6.3 Drive plain `Deshacer` availability from returned `undoExpiresAt`, hide it at server expiry without a visible countdown, and retain inline undo errors
- [x] 6.4 Preserve `router.refresh()` after purchase and undo, keep the selected gift snapshot while success is open, and close/reset after successful undo
- [x] 6.5 Update success/undo tests for exact copy, single feedback surface, 60-second expiry, no countdown, purchase refresh, undo refresh/close, and safe failure

## 7. Theme and Story Coverage

- [x] 7.1 Add two-preview containment tests proving each product, purchase, and success drawer inherits only its triggering `.public-theme`
- [x] 7.2 Verify drawer buttons consume `.public-btn` variables for every public button-style preset and retain keyboard focus treatment
- [x] 7.3 Update Storybook stories to cover product with/without delivery, purchase form/loading/error, success with undo, success after expiry, and undo error without real network calls
- [x] 7.4 Keep existing welcome-message delivery tests green as regression proof that its postscript is untouched

## 8. Documentation and Validation

- [x] 8.1 Update `docs/PRD.md` guest journey, CTA behavior, purchase fields, success/undo, and component naming to match the drawer contract
- [x] 8.2 Update corresponding `docs/TASKS.md` milestone items after implementation tasks pass, removing obsolete modal/countdown/toast wording
- [x] 8.3 Run `pnpm check`, `pnpm test`, `pnpm typecheck`, and `pnpm build`; report any failure before marking related tasks complete
- [x] 8.4 Run `openspec validate improve-guest-gift-flow --strict` and confirm the applied change remains valid
