## Context

`/w/[slug]/page.tsx` already resolves a wishlist via `getPublicWishlistBySlug` into published / preview / archived / notFound results and renders a bare title. The config presets (`src/config/public-{themes,layouts,fonts,button-styles}.ts`) and `PublicWishlistViewModel` (`src/server/mappers/view-models.ts`) exist and expose resolver functions (`resolveTheme`, `resolveLayout`, `resolveFontPairing`, `resolveButtonStyle`). Format helpers live in `src/lib/format/*`. Components currently only exist under `src/components/{ui,features/auth}`. This change builds the presentational layer that consumes those resolvers and the view model.

## Goals / Non-Goals

**Goals:**
- One `PublicWishlistPage` shell driving published, owner-preview, and compact landing previews from the same view model.
- Three layout variants and a set of shared section components, all theme/layout/font/button aware via scoped CSS variables.
- Deterministic section ordering with graceful omission of empty sections.
- A reusable countdown helper producing the exact Spanish copy from the design doc.

**Non-Goals:**
- Gift filtering/sorting (Task 2.5) and the purchase modal + live actions (later task). `GiftCard` renders action affordances but wiring/state is out of scope; in this change actions are inert/disabled.
- Demo data and marketing landing assembly — only the `compact` render mode that the landing will later consume.
- Animations beyond basic CSS.

## Decisions

- **Server components by default.** The shell and section components render on the server (RSC) since they are read-only from the view model. Only future interactive pieces (purchase modal, filters) become client components. Keeps the page fast and avoids shipping JS for static sections.
- **Scoped theming via a wrapper element, not `:root`.** `PublicWishlistPage` renders a wrapping `<div>` carrying the resolved theme `vars`, button-style vars, and the font pairing's `heading`/`body` `className`s as inline `style` + class. Public components reference `var(--public-*)`. This keeps dashboard styling untouched (spec requirement) without a separate provider. Alternative considered: a React context `ThemeProvider` — rejected as unnecessary indirection for static CSS vars.
- **Render mode as a single `mode: "full" | "preview" | "compact"` prop** threaded from the page down. `preview` shows the banner + disables actions; `compact` trims to hero + gift grid (no how-it-works/footer/event details) for embedding. Centralizing the enum avoids scattering booleans.
- **Layout selection by mapping id → component.** `PublicWishlistPage` resolves the preset then picks `GridWishlistLayout | EditorialWishlistLayout | MinimalWishlistLayout` via a small record keyed on `layoutId`, defaulting to grid (mirrors `resolveLayout`'s fallback). Each layout composes the shared sections and passes preset `giftColumns`/`giftCardStyle` to `GiftGrid`/`GiftList`.
- **Countdown helper in `src/lib/format/countdown.ts`.** Pure function `formatCountdown(eventDate, now?)` returning the copy string, computed from whole-day difference at local midnight to avoid off-by-one from time-of-day. Unit tested. `Countdown` component is a thin wrapper. Alternative: reuse `formatRelativeDate` — rejected because its `Intl.RelativeTimeFormat` output ("en 44 días") doesn't match the required `Faltan 44 días` / `Es hoy` copy.
- **Directory split per design doc.** Shell + layout variants under `src/components/layouts/public-wishlist/`; reusable feature pieces (`GiftCard`, `GiftGrid`/`GiftList`, `Countdown`, `WishlistHero`, `HowItWorks`, `WishlistFooter`) under `src/components/features/wishlist/`.
- **Mobile-first columns.** Gift grids use Tailwind `grid-cols-1` base with `sm:`/`lg:` overrides derived from the preset's `giftColumns`. Because Tailwind class strings must be static for the v4 scanner, map `giftColumns` to a fixed class via a lookup rather than interpolation.

## Risks / Trade-offs

- [Tailwind can't see dynamically built column classes] → Use a static `Record<number, string>` of full class strings (`1 → "grid-cols-1"`, `2 → "grid-cols-1 sm:grid-cols-2"`, `3 → "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"`) so Biome's class sorter and the JIT both see literals.
- [Scoped vars vs. shadcn `--background` tokens] → Public components consume `--public-*` names only (per design doc / spec), never the dashboard tokens, preventing bleed in either direction.
- [`GiftCard` actions rendered but inert risks confusing future wiring] → Component accepts an `actionsEnabled`/`mode` prop now so the later purchase-modal task wires behavior without restructuring markup.
- [Countdown timezone] → Compute at local midnight; document that server render uses server timezone. Acceptable for v1 (single-locale es-PE); revisit if multi-timezone accuracy is needed.

## Open Questions

- None blocking. Purchase action wiring and filters are deferred to their own tasks by design.
