## Context

See `proposal.md` for motivation. The guest gift flow is split today:

- `GiftCard` renders product URLs as direct external anchors in several card-style branches and exposes one purchase callback.
- `PublicGiftFilters` owns the selected gift and mounts `PurchaseGiftModal`.
- `PurchaseGiftModal` uses the Radix dialog primitive, renders delivery details inside the form, collects an optional phone, shows a large success/footer treatment, runs an eight-second visible undo timer, and also emits a success toast.
- The public undo token expires server-side after 60 seconds, so the current eight-second UI window does not match the server contract.
- Public theme values are scoped to `.public-theme`; a portal mounted under `body` loses them. `HowItWorksDrawer` already solves this by giving the ShadCN/Vaul drawer the nearest `.public-theme` as its portal container.
- Delivery composition is already centralized and consumed by both the welcome-message postscript and purchase modal. This change must move only the latter use; every welcome-message variant remains unchanged.

User-supplied screenshots and the decisions recorded in `proposal.md` supersede the older purchase-modal presentation for this change. No Claude Design import is required.

## Goals / Non-Goals

**Goals:**

- One controlled, theme-aware guest gift drawer with product, purchase, and success views.
- One product-departure checkpoint before any external store navigation.
- Purchase form values survive a temporary switch to the product view.
- Purchase success and undo remain consistent with server state and the real token expiry.
- Every gift card style emits the same product and purchase actions.
- Focus, dismissal, scroll containment, reduced motion, and external-link safety remain testable.

**Non-Goals:**

- No change to `WishlistMessage`, its delivery postscript, or delivery settings.
- No Prisma schema/data migration and no change to stored historical phone values.
- No owner purchase-flow change, optimistic gift-state clone, realtime synchronization, rate limiting, or notification work.
- No new UI dependency; use the existing ShadCN `Drawer` wrapper backed by Vaul.
- No removal of `guestPhone` from shared validators, tRPC inputs, Prisma, owner view models, or owner UI.

## Decisions

### D1 — One drawer controller owns all guest gift views

Refactor the current selected-gift state in `PublicGiftFilters` into one drawer controller holding the selected gift, current view (`product`, `purchase`, or `success`), and whether product view was entered from the purchase form. Render one drawer instance, not separate/nested product and purchase drawers.

`GiftCard` will expose distinct typed product and purchase actions across all card styles. Product anchors become buttons that open the controller; only the drawer's `Ir a la tienda` remains an external anchor. Fully purchased/hidden and preview-mode behavior remains unchanged.

The purchase form state stays mounted in the drawer controller while the product view is shown. Returning from product view restores name, email, message, quantity, validation state, and scroll-independent values. Closing the drawer resets the selected gift and all transient state.

Alternative: two independent drawers. Rejected because switching from the purchase helper would nest modal interactions or discard form state, and theme/focus logic would be duplicated.

Alternative: keep direct product anchors for the purchase helper. Rejected because that bypasses the delivery checkpoint required for every `Ver producto` action.

### D2 — ShadCN/Vaul bottom drawer at every breakpoint

Replace `Dialog` usage with the existing components from `src/components/ui/drawer.tsx`. Use a bottom-attached surface at all widths, with full width on narrow screens and a centered constrained width on larger screens. Keep the existing `max-h-[92svh]` ceiling, safe-area bottom padding, a fixed header/handle, a scrollable form body, and a sticky action footer.

Product and success views allow the drawer to shrink to their content; the purchase view uses the height ceiling and internal scrolling. Drawer close control, Escape, backdrop click, swipe-down dismissal, focus trap, and trigger focus restoration come from the primitive and explicit accessible titles/descriptions.

Alternative: mobile drawer plus desktop dialog. Rejected by the product decision to use the ShadCN drawer consistently and by the existing how-it-works drawer precedent.

### D3 — Portal into the owning `.public-theme`

Resolve the nearest `.public-theme` from a stable element inside each `PublicGiftFilters` instance and pass it as the drawer root's `container`, matching `HowItWorksDrawer`. Keep the drawer closed until the container is known. This preserves scoped colors, heading/body fonts, ring/border tokens, and public button variables without writing theme values to `:root` or cloning inline styles.

This also makes Storybook pages with multiple differently themed previews deterministic: each filter/controller instance owns a portal container inside its own preview.

Alternative: portal to `body` and copy computed CSS variables onto drawer content. Rejected because it duplicates the theme-provider contract, can drift as tokens grow, and risks cross-preview leakage.

### D4 — Product view is the only new departure point

The product view contains:

- `Vas a salir de A Wish For` title and an accessible description.
- Delivery introduction and the existing composed delivery block/copy action only when an address exists.
- `Vuelve después y márcalo como comprado — así nadie más lo repite.` helper copy.
- Primary `Ir a la tienda` external anchor using `target="_blank"` and `rel="noopener noreferrer"`.
- `Cerrar` when opened from a card, or `Volver al formulario` when reached from the purchase helper.

No-address wishlists omit only the delivery introduction/block/copy action. The warning, reminder, store action, and close/return action remain. Product URLs remain available only for gifts that are neither fully purchased nor hidden.

Opening a new tab does not mutate or close the wishlist drawer. When product view was entered from the purchase helper, activating `Ir a la tienda` switches the original tab's same drawer back to the preserved purchase form. When product view was opened directly from a gift card, the product view remains open so the guest can explicitly close it.

### D5 — Public purchase form shrinks; server compatibility stays

Keep required name, optional email, optional message, conditional quantity, exact consent copy, existing client validation, and server-side validation. Remove phone label/input/state/error handling from the public form and omit `guestPhone` from this mutation call. Do not narrow `createPurchaseSchema` or delete any database/model field because owner and historical records still support phone data.

Show a low-emphasis `Ver producto` helper only when the selected gift has a product URL. Activating it changes the drawer view without submitting or resetting the form.

Remove the delivery block from every purchase phase. Reuse the existing composed `delivery` prop in the product view instead; do not change how the layouts compose/thread that value until a later refactor proves it unnecessary.

### D6 — Success replaces the form; one 60-second undo source

On purchase success:

1. Retain purchase id and raw undo token in drawer-local state.
2. Switch the same drawer to the compact success view.
3. Call `router.refresh()` so server-derived status, grouping, quantities, and progress update behind the drawer while `PublicGiftFilters` state survives.
4. Do not emit the current Sonner purchase-success toast.

The success view uses the agreed `ÉXITO` eyebrow, personalized headline, supporting copy, plain `Deshacer` link, and drawer close affordance. Existing success-check/surface motion may remain after adapting it to the drawer; the undo countdown ring and visible countdown text are removed.

The public purchase mutation response will add a serialized `undoExpiresAt` value sourced from the created purchase. The client computes remaining availability against that timestamp and removes `Deshacer` at expiry without rendering a countdown. This avoids duplicating `60` in client code and avoids extending the visible action beyond server validity because of request latency. No mutation input or new procedure changes.

Undo success refreshes the RSC data and closes/reset the drawer. Undo failure stays inline in success view and keeps the purchase. Keep the selected gift snapshot until drawer close even if refresh moves the gift out of the active filter.

Alternative: start a client-only 60-second timer when the response arrives. Rejected because network latency would make the visible window outlive the server token.

Alternative: retain the toast as backup feedback. Rejected because it duplicates the success drawer and creates two undo controls with potentially different lifetimes.

### D7 — Preserve delivery and mutation data flow

Keep the existing server-to-layout-to-`PublicGiftFilters` delivery prop path and the shared composition/copy components. Only its guest-action consumer moves from purchase form to product view. `WishlistMessage` continues receiving and rendering the same composed value in all variants.

No DB migration is needed. The only API output adjustment is the additive serialized undo expiry described in D6.

### D8 — Validation and coverage follow behavior boundaries

Update unit/component tests for all card styles, both drawer entry points, no-address product view, form-to-product-to-form preservation, no phone/delivery in purchase view, field/quantity validation, loading/retry, exact success copy, no duplicate toast, expiry hiding, undo success/failure, focus return, dismissal methods where testable, and theme portal containment with two previews.

Update Storybook coverage from `PurchaseGiftModal` to the drawer views and phases without real mutations. Run Biome, Vitest, TypeScript, and production build checks during apply.

## Data Flow

```text
GiftCard action
    │
    ├─ product ───────────────┐
    │                         ▼
    └─ purchase ─────▶ PublicGiftFilters controller
                               │ selected gift + view + origin
                               ▼
                         GuestGiftDrawer
                         ├─ product ─▶ external store tab
                         │              └─ form origin: purchase view
                         ├─ purchase ─▶ markGiftPurchased
                         │                   │
                         │                   ├─ router.refresh()
                         │                   └─ success + token + expiry
                         └─ success ─▶ undoRecentPurchase
                                             │
                                             └─ router.refresh() + close

Composed delivery ─────▶ Welcome postscript (unchanged)
                  └────▶ Product drawer only
```

## Risks / Trade-offs

- [RSC refresh can remove or regroup the selected gift behind the open success drawer] → retain a drawer-local gift snapshot until dismissal; refreshed list remains source of truth after close.
- [Every card style currently implements product/purchase controls differently] → define typed action callbacks once, update every branch, and cover each style in focused tests.
- [Theme-scoped portal is unavailable on the first client render] → keep drawer closed until its owning `.public-theme` container resolves, following the existing how-it-works pattern.
- [A long form can exceed short mobile viewports] → scroll only the body and keep header/footer reachable within the 92svh cap and safe area.
- [External store page can be unavailable or block a new tab] → use a real external anchor activated directly by the guest; A Wish For does not proxy or validate store availability at click time.
- [Removing public phone collection changes newly created record completeness] → accepted product simplification; retain optional server/database field for owner-created and historical records.
- [Sixty-second undo link can expire between pointer-down and mutation validation] → server remains authoritative; show the returned inline expiry error and keep the purchase.

## Migration Plan

1. Add the additive `undoExpiresAt` field to the public purchase mutation response and its router tests.
2. Build the shared drawer controller/views while retaining existing mutation behavior.
3. Route every eligible `GiftCard` product and purchase action through the controller.
4. Remove the old dialog rendering, public phone field, purchase delivery block, countdown ring/timer, and success toast.
5. Update stories/tests and verify all layouts through shared `PublicGiftFilters` call sites.
6. Update `docs/PRD.md` and `docs/TASKS.md` entries that still describe the modal, phone field, eight-second countdown, and success toast.

Rollback restores the previous dialog and direct anchors. No stored data needs rollback; the additive response field can remain harmlessly or be removed with the UI revert.
