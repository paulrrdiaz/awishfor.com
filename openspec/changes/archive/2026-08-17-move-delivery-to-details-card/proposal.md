## Why

A guest who wants to ship a gift to the host's home has to read past the welcome message to find the address: the delivery details render today as a `P.D. —` postscript glued to the bottom of the host's personal message card. That card is emotional copy — a quote in italics with a signature — and a street address plus a copy button reads as a graft on it. Shipping information is a practical event fact, so it belongs with the other practical event facts (`FECHA`, `LUGAR`, `DRESSCODE`), where a guest already looks for logistics.

## What Changes

- Add a delivery card to the event-details card set on the public wishlist, with the mono uppercase eyebrow `ENVÍO A DOMICILIO`, the line `Si prefieres enviarlo a casa` above the details, the existing emoji delivery rows (👤 name / 📍 address / 📱 phone), and a copy action for the whole composed line.
- The delivery card renders as a **sibling** of `EventDetails`, not as a fourth entry in its grid — so it still renders on a wishlist that has a delivery address but no date, location, or dress code.
- Place it on **all nine public layouts**: at the bottom of the single-column left panel in `arch-trio`, and as a full-width row directly beneath the details band everywhere else — including `split-image-right`, which inlines its own two-column `Fecha`/`Lugar` band instead of using the shared `EventDetails`.
- **BREAKING (presentation):** remove the delivery postscript from the welcome message card on every welcome variant, including the exact copy `P.D. — si prefieres enviarlo a casa:`. `WishlistMessage` no longer accepts a `delivery` prop.
- Extend the shared `CopyButton` with a link/text treatment (small underlined `COPIAR`) so the new card can use it without duplicating the label-change-and-revert confirmation behavior. The existing outline+icon treatment stays the default for the purchase drawer.

Non-goals:

- The delivery block inside the purchase drawer is unchanged — same placement, same `DeliveryItems` presentation, same copy action.
- No change to how a host edits delivery fields, to validation, or to the composed-line format.
- No new welcome message variant, and no change to which variants a host can select.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `wishlist-delivery-info`: the requirement placing the delivery presentation inside the welcome message card is replaced by one placing it in a dedicated card alongside the event-details cards, with new exact copy and a rule that the card renders independently of whether any event details exist.

## Impact

Public wishlist rendering only — no schema, API, env, or config changes.

- New component: `src/components/shared/delivery-card.tsx`
- Modified: `src/components/shared/wishlist-message.tsx` (delete `DeliveryPostscript`, drop `delivery` from `Props`/`VariantProps`), `src/components/shared/copy-button.tsx` (add link treatment)
- Modified call sites — four in total, covering all nine layouts: `src/components/shared/public-wishlist-body.tsx` (6 layouts), `src/components/layouts/public-wishlist/collage-staggered-layout.tsx`, `src/components/layouts/public-wishlist/arch-trio-layout.tsx`, `src/components/layouts/public-wishlist/split-image-right-layout.tsx`
- Unchanged consumers: `src/components/shared/delivery-items.tsx`, `src/components/features/wishlist/guest-gift-drawer.tsx`, `src/lib/format/delivery.ts`
- Tests/stories to update: `wishlist-message.test.tsx`, `wishlist-message.stories.tsx`, `event-details.test.tsx`, plus a new `delivery-card.test.tsx`
- Preview path `src/lib/wishlist/draft-to-preview.ts` carries delivery fields and must keep working
- Visual check: `arch-trio-layout.tsx` wraps its two columns in `sm:items-center`, so a taller left panel shifts the vertical alignment of both columns
