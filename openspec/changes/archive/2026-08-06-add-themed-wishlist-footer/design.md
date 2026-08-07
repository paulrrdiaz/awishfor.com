## Context

`MarketingFooter` currently owns both the newsletter band and the full brand/navigation/legal body. Its presentation depends on `.marketing-theme`, `--m*` variables, and fixed green values. Public wishlists instead resolve one of seven presets in `PublicWishlistPage` and scope semantic variables through `PublicThemeProvider`.

Eight public layouts end through `PublicWishlistBody`, while `collage-staggered` renders its own compact `WishlistFooter`. The footer is therefore duplicated at layout level. In addition, `mode="preview"` is used by both the standalone owner draft route and constrained wizard/dashboard preview panes, so render mode alone cannot determine whether the expanded footer belongs.

The change must preserve the marketing landing footer's current appearance and newsletter band, the public thank-you-message order, and the legal/report contact contract. It must also coexist with unrelated in-progress wishlist work in the current worktree.

## Goals / Non-Goals

**Goals:**

- Share one logo/navigation/legal footer-body composition between marketing and standalone public wishlists.
- Apply the active wishlist theme and selected public fonts through scoped semantic tokens.
- Render the expanded body consistently after every one of the nine public layouts.
- Distinguish standalone route previews from embedded editor previews without overloading the existing interaction mode.
- Preserve working marketing anchors, legal/contact links, report-list support, responsive behavior, and accessibility treatments.

**Non-Goals:**

- Showing the newsletter band on wishlist pages or adding newsletter persistence.
- Changing footer copy, marketing visual fidelity, public theme presets, wishlist button-style behavior, or the public data model.
- Adding social destinations or new footer customization settings.
- Adding the footer to archived, not-found, dashboard, creation-wizard shell, or compact marketing-demo pages.

## Decisions

### 1. Extract the marketing footer body, not the entire marketing footer

Create a reusable presentational footer-body component under `src/components/shared/`. `MarketingFooter` will continue to own the newsletter band and will compose the shared body beneath it. `WishlistFooter` will compose the same body without the band and will add wishlist-specific report/support affordances.

The shared body will contain the established logo/description, product and occasion navigation, legal/contact navigation, free-service callout, and copyright treatment. Navigation to landing sections will use root-qualified fragments such as `/#como-funciona`, which work from both `/` and `/w/*`.

Alternative considered: render `MarketingFooter` directly inside `PublicWishlistPage`. Rejected because it would bring the newsletter band, fixed marketing palette, marketing font helpers, and route-local hash links into the wishlist surface.

Alternative considered: copy the footer markup into `WishlistFooter`. Rejected because marketing and wishlist content would drift and future legal/navigation changes would require duplicate edits.

### 2. Use explicit presentation variants backed by existing scoped tokens

The shared footer body will expose marketing and public-wishlist presentation variants. The marketing variant retains the existing `--m*` classes and fixed values. The public variant uses semantic utilities inside `.public-theme`: an accent surface with `accent-foreground` content, semantic borders/cards, the public heading/body fonts, and scoped focus/hover colors. No `themeId` prop or new per-theme classes are needed because `PublicThemeProvider` already supplies the selected preset.

Only contrast-approved semantic foreground/background pairs will be combined; opacity may be used for secondary copy without substituting a foreground token from an unrelated surface.

Alternative considered: extend every theme preset with footer-specific variables. Rejected because the current semantic palette already expresses the required surfaces and adding seven parallel footer palettes would increase configuration and test burden.

### 3. Render the footer once in the public shell

Move footer composition out of `PublicWishlistBody` and `collage-staggered`. `PublicWishlistPage` will render `WishlistFooter` after the selected layout, still inside `PublicThemeProvider`. This guarantees the required thank-you → footer order while removing the ninth layout's bespoke path and ensuring all layouts receive identical footer behavior.

The layout components remain responsible for hero-through-thank-you content. `PublicWishlistPage` becomes responsible for page-level chrome that follows every layout.

Alternative considered: keep footer calls in all layout components and pass a new variant through each. Rejected because it preserves duplication and makes cross-layout consistency dependent on nine call sites.

### 4. Separate interaction mode from render surface

Add an explicit public-page surface distinction, for example `surface="standalone" | "embedded"`, alongside `mode="full" | "preview" | "compact"`.

- Public `/w/[slug]` and `/w/[slug]/[guestSlug]` routes pass `standalone`, including owner draft preview responses.
- Wizard and dashboard preview panes use `embedded` and retain a compact footer treatment.
- `compact` mode omits the footer as it does today, regardless of surface.

Use a safe default matching current embedded callers so newly added preview call sites do not unexpectedly gain a large footer. Route entry points must opt into `standalone` explicitly.

Alternative considered: show the expanded footer for every `preview` instance. Rejected because wizard and editor panes are constrained, scrollable cards where the marketing-sized body would dominate the preview.

Alternative considered: show it only for `mode="full"`. Rejected because an owner viewing a draft at `/w/[slug]` uses `preview` mode but still needs the standalone page ending.

### 5. Preserve public-specific legal and thank-you behavior

`thankYouMessage` remains rendered by the layout content immediately before the shell-level footer. The public variant will retain privacy, terms, contact, support email, and `Reportar lista` destinations. Marketing continues to render its existing legal/contact set without gaining the report-list control.

## Risks / Trade-offs

- [Shared markup could subtly alter marketing pixel fidelity] → Keep a marketing variant that preserves existing classes and add regression assertions for its newsletter/body content and responsive structure.
- [Semantic theme colors could produce weak contrast] → Use only approved token pairs (`accent`/`accent-foreground`, `card`/`card-foreground`) and verify representative light, colored, and minimal themes.
- [Footer centralization could break full-width behavior in `collage-staggered`] → Add layout-wide tests and browser verification at mobile and desktop widths, including that layout's viewport breakout.
- [The new surface prop could be omitted by a public route] → Default to embedded and add route/source integration tests requiring both public route entry points to request standalone rendering.
- [Root-qualified fragments can trigger a full navigation from wishlist pages] → This is intentional; it is the only way for footer links to reach marketing sections that do not exist under `/w/*`.
- [Existing uncommitted edits overlap the shared body and collage layout] → Apply changes surgically and preserve the current welcome-message attribution work when implementation begins.

## Migration Plan

1. Add the reusable footer body and migrate `MarketingFooter` to compose it without visual or behavioral changes.
2. Update `WishlistFooter` with expanded and compact public presentations while retaining report/support links.
3. Add the surface distinction to `PublicWishlistPage` and opt both public route entry points into standalone rendering.
4. Centralize footer placement in `PublicWishlistPage`; remove footer calls only from `PublicWishlistBody` and `collage-staggered`.
5. Add unit, structural, Storybook, and browser-responsive coverage, then run Biome, Vitest, typecheck, and production build checks appropriate to the UI change.

Rollback is code-only: restore the marketing-owned body markup, restore layout-level `WishlistFooter` calls, and remove the surface prop. No persisted data or migration rollback is involved.

## Open Questions

None. The product choice to omit the newsletter band and reuse only the logo/navigation/legal footer body is resolved.
