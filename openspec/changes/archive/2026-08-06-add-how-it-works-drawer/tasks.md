## 1. Drawer Primitive Support

- [x] 1.1 Extend `src/components/ui/drawer.tsx` with a reusable `DrawerHandle` export and an optional per-instance overlay class while preserving current defaults and Vaul prop forwarding.
- [x] 1.2 Add focused drawer primitive coverage for the new handle and overlay customization hooks.

## 2. Shared How-It-Works Interaction

- [x] 2.1 Convert `src/components/shared/how-it-works.tsx` into a client-side `HowItWorksDrawer` using the ShadCN/Vaul drawer composition, exact approved three-step copy, accessible title/description, drag handle, close control, and full-width `Entendido` action.
- [x] 2.2 Resolve the nearest `.public-theme` element for Vaul’s `container` prop so drawer portal content inherits only the triggering wishlist’s scoped theme.
- [x] 2.3 Update `HeroCtas` to require `showHowItWorks`, render the drawer trigger as the secondary CTA only when enabled, preserve layout/on-photo class behavior, and keep the primary gift CTA’s scoped reduced-motion scrolling unchanged.
- [x] 2.4 Replace the existing how-it-works story with drawer states that demonstrate enabled, disabled, open, and contrasting-theme presentation.

## 3. Layout Integration

- [x] 3.1 Pass `wishlist.showHowItWorks` to `HeroCtas` from all nine public wishlist layout components.
- [x] 3.2 Remove the inline `HowItWorks` mount and `#como-funciona` target from `PublicWishlistBody`.
- [x] 3.3 Remove the duplicated inline `HowItWorks` mount from `collage-staggered-layout.tsx` while preserving its gifts, message, and footer order.
- [x] 3.4 Confirm full and preview modes expose the informational drawer when enabled and compact mode continues to omit hero CTAs and drawer content.

## 4. Automated Coverage

- [x] 4.1 Expand `hero-ctas`/how-it-works component tests to cover button semantics, enabled/disabled visibility, opening, exact step content, `Entendido` dismissal, and the existing scoped gift scroll behavior.
- [x] 4.2 Add a two-theme containment regression proving the opened drawer portal is contained by the triggering `.public-theme` instance and does not mutate global or sibling theme state.
- [x] 4.3 Add public-page/layout regression coverage proving all nine non-compact layouts expose the shared drawer when enabled, no inline how-it-works section remains, preview mode is informationally interactive, and compact mode omits it.

## 5. Validation and Documentation Sync

- [x] 5.1 Update relevant `docs/PRD.md` and `docs/TASKS.md` public-wishlist descriptions from an inline how-it-works section to the shared optional drawer interaction.
- [x] 5.2 Run the focused drawer, CTA, and public-layout test files and resolve regressions.
- [x] 5.3 Run `pnpm check` and resolve all Biome findings.
- [x] 5.4 Run `pnpm test` and resolve all test regressions.
- [x] 5.5 Run `pnpm typecheck` and resolve all TypeScript errors.
