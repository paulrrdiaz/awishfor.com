## Why

Guests currently leave A Wish For immediately through product links, while the purchase path uses a separate dialog that mixes purchase confirmation with delivery information and duplicates its success feedback. A single, themed drawer flow can prepare guests before they visit a store, simplify purchase confirmation, and keep every state visually connected to the wishlist they are viewing.

## What Changes

- Replace direct `Ver producto` navigation with a ShadCN/Vaul bottom drawer that warns the guest they are leaving A Wish For, shows the wishlist delivery details when available, provides a copy action, and opens the product URL from an explicit `Ir a la tienda` action.
- Replace the responsive purchase modal/dialog with a ShadCN/Vaul bottom drawer at every viewport width.
- Simplify the guest purchase form to required name, optional email, optional message, and conditional quantity; remove phone collection from this public form without removing server or database compatibility for existing phone data.
- Add a small `Ver producto` helper in the purchase form when the gift has a product URL. It switches the same drawer to the product view and preserves entered form values; activating `Ir a la tienda` or the explicit return action restores that form.
- Remove delivery details from the purchase form. Keep the existing delivery postscript in every welcome-message variant unchanged.
- Replace the submitted form in place with the compact personalized success treatment, using a plain `Deshacer` action for the server-backed 60-second undo window and no visible countdown.
- Remove duplicate purchase-success toast feedback; keep loading, retry, undo failure, close, page refresh, filter preservation, and accessible drawer dismissal behavior.
- Ensure product, purchase, and success drawer views inherit the triggering wishlist's scoped theme, fonts, semantic colors, focus styles, and selected public button style.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `public-wishlist-page`: replace direct product departure and purchase modal behavior with one multi-view guest gift drawer, simplify fields, and align success/undo behavior with the 60-second server window.
- `wishlist-delivery-info`: move the purchase-form delivery block to the product-departure drawer while explicitly preserving the welcome-message delivery postscript.
- `public-theme-config`: require guest gift drawers and their actions to resolve styling from the triggering `.public-theme` instance and selected public button preset.

## Impact

- Primary UI: `src/components/shared/gift-card.tsx`, `src/components/features/wishlist/public-filters.tsx`, and `src/components/features/wishlist/purchase-gift-modal.tsx` (expected rename/refactor into a drawer-oriented component).
- Shared primitives/patterns: `src/components/ui/drawer.tsx` and the theme-scoped portal pattern in `src/components/shared/how-it-works.tsx`.
- Tests and stories: gift-card actions, drawer view transitions, form validation, product departure, theme containment, purchase success/undo, and existing filters/refresh behavior.
- Product docs/specs: guest journey, CTA behavior, purchase fields, success treatment, and delivery placement.
- No Prisma migration, new environment variable, new dependency, new tRPC procedure, or mutation-input change is required. The public purchase response adds the serialized undo expiry so the drawer can follow the server's exact window. `guestPhone` remains accepted by existing server contracts for compatibility but is no longer collected by the public guest form.
- `WishlistMessage` and its existing delivery postscript are out of scope and remain unchanged.
