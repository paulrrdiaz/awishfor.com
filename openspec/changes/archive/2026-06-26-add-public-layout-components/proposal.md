## Why

Public route `/w/[slug]` resolves a wishlist and theme/layout/font/button config, but only renders a bare title block. Guests need a full, mobile-first wishlist page — hero, countdown, gift list, how-it-works, footer — and the same components must drive landing-page previews and owner draft previews.

## What Changes

- Add `PublicWishlistPage` shell that resolves theme/layout/font/button presets, applies scoped CSS variables, and renders sections in the required order.
- Add three layout variants selected by `layoutId`: `GridWishlistLayout`, `EditorialWishlistLayout`, `MinimalWishlistLayout`.
- Add shared section components: `WishlistHero`, `Countdown`, `GiftCard`, `GiftGrid`/`GiftList`, `HowItWorks`, `WishlistFooter`.
- Support three render modes — `full | preview | compact` — controlling preview banner, action availability, and section trimming for landing previews.
- Add a countdown formatting helper (`Faltan N días` / `Falta 1 día` / `Es hoy` / closed message).
- Rewrite `/w/[slug]/page.tsx` to render `PublicWishlistPage` for published and owner-preview results.
- Non-goals: gift filters/sorting (Task 2.5), purchase modal + actions (later task), advanced animations, demo/landing page wiring beyond compact-mode support.

## Capabilities

### New Capabilities
- `public-wishlist-layout`: shared public wishlist page shell, layout variants, section components, and render modes (`full`/`preview`/`compact`) covering required section order and mobile-first rendering.

### Modified Capabilities
<!-- None: public-wishlist-page resolution contract unchanged; this consumes it. -->

## Impact

- New: `src/components/layouts/public-wishlist/*`, `src/components/features/wishlist/*`.
- New: countdown helper in `src/lib/format/*`.
- Modified: `src/app/w/[slug]/page.tsx` renders the new shell.
- Consumes existing config presets (`src/config/public-*.ts`) and `PublicWishlistViewModel` (`src/server/mappers/view-models.ts`); no schema, env, or API changes.
