## 1. Shared Footer Body

- [x] 1.1 Extract the existing marketing logo/description, navigation columns, free-service callout, and copyright markup into a reusable shared footer-body component with explicit marketing and public-wishlist presentation variants.
- [x] 1.2 Convert marketing section destinations in the shared navigation data to root-qualified fragments while preserving `/create`, `/privacy`, `/terms`, and configured contact-email destinations.
- [x] 1.3 Refactor `MarketingFooter` to compose the newsletter band with the shared marketing footer body and verify its existing copy, responsive structure, and fixed marketing-theme styling remain unchanged.

## 2. Themed Public Wishlist Integration

- [x] 2.1 Extend `WishlistFooter` with an expanded shared-body presentation and a compact embedded-preview presentation, preserving the report-list mailto and visible support-email affordances in both.
- [x] 2.2 Style the expanded wishlist footer exclusively with scoped semantic public-theme surfaces, approved foreground pairs, borders, focus states, and resolved public fonts, without adding theme-specific IDs or variables.
- [x] 2.3 Add an explicit standalone-versus-embedded surface option to `PublicWishlistPage`, default it safely for embedded callers, append the correct footer variant once inside `PublicThemeProvider`, and omit all footer rendering in compact mode.
- [x] 2.4 Opt `/w/[slug]` and `/w/[slug]/[guestSlug]` into standalone rendering so published, personalized, and owner draft-preview routes receive the expanded footer.
- [x] 2.5 Remove layout-local footer composition from `PublicWishlistBody` and `collage-staggered` while preserving current thank-you ordering, welcome-message attribution edits, and collage full-width behavior.

## 3. Automated Coverage

- [x] 3.1 Update marketing footer tests to prove the newsletter remains on marketing pages, the reusable body remains present, and marketing-section links use root-qualified destinations.
- [x] 3.2 Add wishlist footer tests for expanded versus compact content, newsletter exclusion, legal/contact/report links, and semantic public-theme class usage.
- [x] 3.3 Extend public wishlist structural tests to cover centralized footer placement, all nine layouts, standalone owner/published/personalized routes, compact omission, and embedded-preview compact behavior.
- [x] 3.4 Update Storybook coverage so the expanded and compact wishlist footer presentations can be reviewed under the public theme decorator without real network activity.

## 4. Validation and Tracking

- [x] 4.1 Run `pnpm check` and resolve any Biome formatting, import-order, JSX-attribute, or Tailwind-class issues introduced by the change.
- [x] 4.2 Run `pnpm test` and resolve all footer, layout, route, and existing-suite regressions.
- [x] 4.3 Run `pnpm typecheck` and resolve all new prop, variant, and route-call-site type errors.
- [x] 4.4 Run `pnpm build` to verify the server/client component boundaries and production route compilation.
- [x] 4.5 Add or mark the corresponding themed-wishlist-footer follow-up item complete in `docs/TASKS.md` after implementation and required validation finish.
