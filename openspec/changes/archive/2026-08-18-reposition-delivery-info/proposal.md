## Why

The Claude Design exploration for the public wishlist page (`PublicWishlistPages.dc.html`) settled on delivery info as a standalone "Envíos a domicilio" bar placed after the gift list, not the small card sitting beside the event details today. Reading it before the gift list — before a guest has even seen what's being asked for — is the wrong moment for it; it belongs once the guest already knows what they might send. Today's placement is also duplicated by hand across four files with no shared enforcement, so a fifth layout could silently get it wrong.

## What Changes

- Reposition delivery info to render immediately after the gift list on every public wishlist layout, replacing today's placement beside the event-details cards.
- Restyle delivery info from the small itemized card (pictogram-per-field list, text-link copy action) to a full-width bar: icon badge, "Envíos a domicilio" eyebrow, the composed delivery line in one bold line, and an outline copy button.
- Show delivery info in every render mode, including `compact`, whenever the wishlist has a delivery address — **BREAKING** (behavior change): compact-mode layouts currently never show delivery info; they will start showing it.
- Introduce a `GiftSection` component that composes the existing `GiftListBand` with the new delivery presentation as its own trailing child, so "always after the gift list" is structural rather than a convention every layout has to remember.
- Introduce a `DeliveryBar` component for the new presentation, built from existing pieces (`composeDelivery().line`, `CopyButton`'s existing `treatment="button"` mode) rather than new formatting or clipboard logic.
- Remove the now-dead `grouped` joined-card treatment from `EventDetails` and the ArchTrio-only styling that paired it with the old `DeliveryCard`.
- Delete `DeliveryCard`, `delivery-card.stories.tsx`, and `delivery-card.test.tsx` once no layout renders it; update `event-details.test.tsx` and `public-wishlist-layout-rendering.test.tsx` to match.
- Out of scope: the product departure drawer's delivery block (`DeliveryItems`, used by `guest-gift-drawer.tsx`) is unaffected — it keeps its itemized pictogram presentation and is a separate surface from the top-level page component being repositioned here.

## Capabilities

### New Capabilities

(none — this reshapes existing delivery-info behavior rather than introducing a new capability)

### Modified Capabilities

- `wishlist-delivery-info`: the "Delivery card in the event-details card set" requirement (delivery reads as a peer of the event-detail cards) is replaced by delivery rendering after the gift list on every layout and render mode; the "Delivery card placement adapts to the layout" requirement's per-layout branching (single-column panel vs. horizontal band) is replaced by one placement rule; the "Delivery details keep their itemized presentation" requirement is scoped to remain true for the product departure drawer only, since the top-level page presentation moves to a single composed line instead of per-field pictogram rows.

## Impact

- **Code (new)**: `src/components/shared/gift-section.tsx`, `src/components/shared/delivery-bar.tsx`
- **Code (modified)**: `src/components/shared/public-wishlist-body.tsx`, `src/components/layouts/public-wishlist/arch-trio-layout.tsx`, `src/components/layouts/public-wishlist/split-image-right-layout.tsx`, `src/components/layouts/public-wishlist/collage-staggered-layout.tsx`, `src/components/shared/event-details.tsx`
- **Code (deleted)**: `src/components/shared/delivery-card.tsx`, `src/components/shared/delivery-card.stories.tsx`, `src/components/shared/delivery-card.test.tsx`
- **Tests (updated)**: `src/components/shared/event-details.test.tsx`, `src/components/layouts/public-wishlist/public-wishlist-layout-rendering.test.tsx`
- **Unchanged**: `composeDelivery()`, `CopyButton`, `DeliveryItems` (still used by the guest gift drawer), the `delivery` prop threaded into `PublicGiftFilters` for the drawer's copy-address affordance, Prisma schema, no env/config/schema/API changes.
