## Why

Guests currently leave the hero to reach an inline “Cómo funciona” section near the bottom of every public wishlist. The new interaction keeps that guidance available at the moment of intent by opening the three guest steps in a compact, dismissible bottom drawer shared by every template.

## What Changes

- **BREAKING (visual interaction):** replace the inline how-it-works page section and its hash navigation with a ShadCN/Vaul bottom drawer opened by the hero’s “Cómo funciona” control.
- Render the drawer through the shared hero CTA path so all nine public wishlist layouts receive the same trigger, content, accessibility behavior, and responsive composition.
- Preserve the `showHowItWorks` setting: when disabled, neither the trigger nor drawer content is rendered.
- Present the approved three-step Spanish guest guidance, a close control, drag handle, backdrop dismissal, Escape dismissal, swipe dismissal, and a full-width `Entendido` action.
- Keep the drawer inside the active public-theme scope so portalled content inherits the selected wishlist theme rather than the dashboard/root palette.
- Remove the obsolete inline how-it-works placement from the shared public body and the bespoke collage body.
- Add interaction, visibility, accessibility, theme-scope, and cross-layout regression coverage.

## Capabilities

### New Capabilities

<!-- none -->

### Modified Capabilities

- `public-wishlist-layout`: how-it-works changes from an ordered inline page section to an optional, theme-aware drawer opened from the shared hero CTA across all nine layouts.

## Non-Goals

- Changing gift purchase behavior or the purchase confirmation modal.
- Changing the marketing landing page’s separate “Cómo funciona” section.
- Adding owner-authored how-it-works copy or new wishlist configuration fields.
- Reworking hero geometry, theme palettes, fonts, or button-style presets.
- Translating the existing Spanish guidance as part of this change.

## Impact

- Shared UI: `src/components/shared/hero-ctas.tsx`, `src/components/shared/how-it-works.tsx`, `src/components/shared/public-wishlist-body.tsx`, and their tests/stories.
- Public layouts: the nine components in `src/components/layouts/public-wishlist/`, including the bespoke `collage-staggered` body.
- ShadCN primitive: `src/components/ui/drawer.tsx` may gain a reusable handle export and per-instance overlay styling while preserving its existing API.
- Specs: `openspec/specs/public-wishlist-layout/spec.md` changes section order, toggle behavior, render-mode behavior, and the shared how-it-works interaction contract.
- No API, database, Prisma, environment-variable, routing, or dependency changes; `vaul` and the ShadCN drawer wrapper already exist.
