# Design: expand-design-customization

## Context

Step 3 ("Diseña tu página") and the dashboard Diseño editor drive the public page through four preset dimensions persisted on `Wishlist` (`themeId`, `layoutId`, `fontPairing`, `buttonStyle`) plus a single `coverImageUrl`. Presets live in `src/config/public-*.ts`; `PublicWishlistPage` resolves them and `PublicThemeProvider` scopes CSS vars to `.public-theme`. The Claude Design project (`A Wish For.dc.html`) added 14 layout explorations (canvas sections "§3+ … fila 1/fila 2" at top 25500/27700 and "§3+ · 4 exploraciones nuevas" at top 29900) that are the visual source of truth for this change. A `Carousel` primitive already exists (`src/components/ui/carousel.tsx`).

Known defect: `--public-btn-radius`/`--public-btn-weight` are consumed only by `GiftCard` action buttons (`src/components/shared/gift-card.tsx`); hero CTAs and the purchase modal ignore them, and `--public-btn-border-width` is set by `PublicThemeProvider` but consumed nowhere.

Decisions below were confirmed with the user via grill-me on 2026-07-17.

## Goals / Non-Goals

**Goals:**

- Ship the 14 new layouts faithful to the design canvas; keep the legacy 3 working but demoted (bottom of picker) and registered as pre-PROD tech debt.
- Scale step 3 pickers: layout thumbnail grid, 12-theme swatch grid, heading/body font selects, 4 self-previewing button-style chips, multi-image cover manager.
- Support up to 6 ordered cover images with carousel behavior at 2+ images.
- Make button style presets affect every public button surface.

**Non-Goals:**

- Removing `grid`/`editorial`/`minimal`, `coverImageUrl`, or `fontPairing` (tracked as tech debt for pre-PROD cleanup, not this change).
- Freeform color/font pickers (presets only, per design principle 5).
- Gift image galleries (gifts keep one image).
- New marketing-page work beyond what breaks (theme preview strip may mention 12 themes — optional polish, not required).

## Decisions

### D1 — Layout catalog: 14 new + 3 legacy, single preset registry

`src/config/public-layouts.ts` grows to 17 presets. New ids (order = picker order):

`hero-cinematic`, `split-image-right`, `arch-split`, `collage-staggered`, `magazine-editorial`, `overlap-duo`, `arch-hero-party`, `arch-trio`, `wedding-formal`, `panoramic-band`, `carousel-hero`, `diagonal-duo`, `scrapbook-polaroids`, `portrait-frame-split`, then legacy `grid`, `editorial`, `minimal` last with a `deprecated: true` flag (renders a "Clásico" divider/badge in the picker).

`PublicLayoutPreset` extends with:

- `deprecated?: boolean`
- `heroImageSlots: number` — how many cover images the hero composition displays (1 for single-hero layouts, 2 for `overlap-duo`, 3 for `collage-staggered`/`arch-trio`/`diagonal-duo`/`scrapbook-polaroids`/`portrait-frame-split`, up to 6 for gallery/carousel layouts)
- `supportsCarousel: boolean` — layout shows prev/next gallery controls when `coverImageUrls.length ≥ 2`

Rationale: single registry keeps `resolveLayout` fallback semantics; per-preset metadata lets shared code (upload hint copy, preview) adapt without switch statements.

**Alternative considered**: retiring legacy layouts now with data migration — rejected by user; existing wishlists keep rendering, removal is pre-PROD tech debt (`docs/FUTURE_IMPROVEMENTS.md`).

### D2 — One component per layout, shared sections, shared gallery

Each new layout is a component in `src/components/layouts/public-wishlist/` (e.g. `hero-cinematic-layout.tsx`) selected by `PublicWishlistPage`'s existing layout switch. All compose the shared sections (`WishlistHero` variants, `EventDetails`, `Countdown`, `GiftGrid`/`GiftList`, `HowItWorks`, `WishlistFooter`) so section order, render modes (`full`/`preview`/`compact`), and purchased-gift rules stay uniform. Hero compositions differ per layout and are implemented from the canvas (arch masks via `border-radius`, collage offsets, monogram/ornament dividers, diagonal color blocks, polaroid rotations).

A shared `HeroGallery` component owns image logic: takes `coverImageUrls`, `heroImageSlots`, `supportsCarousel`; renders the composition's slots, fills missing slots with the theme's tinted placeholder (`--ph-tint`-equivalent from `--accent`), and mounts the existing `Carousel` primitive with `‹ ›` controls + "Galería · foto N/M" caption when `supportsCarousel` and 2+ images. Rationale: 14 layouts must not each reimplement placeholder/carousel rules.

### D3 — Themes: 12 presets, same scoped-var system

Add 5 presets to `src/config/public-themes.ts` following §7's construction rules (near-white bg, tinted ink fg, white card, soft primary with dark `primary-fg` ≥ 4.5:1, soft accent, `--radius: 18px`):

- `terracota-calida` — clay/peach family
- `menta-fresca` — mint family
- `noche-azul` — deep navy family (dark-ink primary like `clasico-minimal` but blue)
- `sol-dorado` — warm yellow family
- `coral-vivo` — coral family

Exact hex values authored at apply time and validated for contrast. Swatch picker becomes `grid grid-cols-4 sm:grid-cols-6` (12 = 2 rows of 6 desktop, 3 rows of 4 mobile). Marketing `theme-previews.tsx` gradient strip gains the 5 new entries (cheap, keeps it truthful).

### D4 — Fonts: independent heading/body presets replacing pairings

New shape in `src/config/public-fonts.ts`:

- `PUBLIC_HEADING_FONTS` (6): `lora` (default), `playfair-display`, `cormorant-garamond`, `dm-serif-display`, `inter`, `nunito`
- `PUBLIC_BODY_FONTS` (5): `inter` (default), `nunito`, `figtree`, `source-serif-4`, `karla`

All loaded via `next/font/google` in the root layout with `variable:` CSS custom properties (weights subsetted: headings 400–700, bodies 400–600) — fonts must load at module scope, so all 9 families are declared once in a `src/lib/fonts.ts` (or layout) and exposed as `--font-<id>` vars. `PublicThemeProvider` gains `headingFont`/`bodyFont` props and writes `--public-font-heading`/`--public-font-body` referencing the loaded vars; `.public-theme` CSS maps serif/heading elements to `var(--public-font-heading)` and body to `var(--public-font-body)` (replacing the `data-font-pairing` attribute mechanism).

Legacy resolution: `resolveHeadingFont(headingFont, fontPairing)` — explicit id wins; else map `serif-soft`→Lora+Inter, `sans-modern`→Inter+Inter, `rounded-friendly`→Nunito+Nunito; else defaults. `fontPairing` stays readable until pre-PROD cleanup.

**Trade-off**: 9 font families ≈ heavier font payload; mitigated by subsetting and `display: swap`. Rejected loading fonts on demand per page — `next/font` requires static declarations.

### D5 — Images: `coverImageUrls String[]`, cap 6

Prisma: `coverImageUrls String[] @default([])` on `Wishlist`; migration backfills `ARRAY["coverImageUrl"]` where not null. `headingFont String?`, `bodyFont String?` added in the same migration with backfill from `fontPairing` mapping. `coverImageUrl` remains (deprecated) and is kept in sync on write (first array element) so anything unmigrated keeps working.

Zod inputs (`saveDraft`, wishlist update): `coverImageUrls: z.array(z.string().url()).max(6)`. Wizard store draft field `coverImageUrls: string[]` (migrating persisted localStorage drafts: seed from old `coverImageUrl` on rehydrate version bump).

New `MultiImageUpload` component (wraps existing `ImageUpload`/UploadThing `coverImage` endpoint): thumbnails row with add tile (disabled at 6), per-image remove, drag-to-reorder (reuse the dnd approach from `sortable-gift-row`), first image labeled "Principal". Layout-aware hint: "Este diseño muestra N fotos" from the selected preset's `heroImageSlots`.

### D6 — Buttons: 4 presets + `.public-btn` utility

`PublicButtonStylePreset` gains `variant: "solid" | "outline"`:

| id | label | radius | border | weight | variant |
|---|---|---|---|---|---|
| `pill` (default) | Píldora | 9999px | 0 | 500 | solid |
| `rounded` | Redondeado | 0.75rem | 0 | 500 | solid |
| `square` | Cuadrado | 0.25rem | 0 | 600 | solid |
| `outline` | Contorno | 9999px | 1.5px | 500 | outline |

Fix propagation with a single `.public-btn` class defined in `globals.css` under `.public-theme`: consumes `--public-btn-radius`, `--public-btn-border-width`, `--public-btn-weight`, and for `outline` (via `data-btn-variant` on the wrapper) renders transparent bg + `--primary` border/text. Applied to hero CTAs, gift card actions, purchase modal confirm, and empty-state CTAs. Picker chips in step 3 render each preset in its own shape (self-preview) instead of uniform chips. Note: the old spec's "SHALL NOT include a square button style" rule is reversed deliberately (user decision).

### D7 — Disposición picker: thumbnail grid

New `LayoutPicker` component (used by wizard `design-step.tsx` and dashboard `wishlist-design-editor.tsx`): 2-column grid; each option = mini abstract skeleton preview (pure CSS/inline-SVG blocks sketching that layout's hero: arch shape, collage offsets, split panes, banner band…) + Spanish label; selected state = primary ring. Legacy 3 render last under a muted "Clásico (se retirará)" group. Skeletons are hand-authored per layout in the picker component (a `LAYOUT_THUMBNAILS: Record<layoutId, ReactNode>` map) — no screenshots, no image assets.

### D8 — Event-type default layouts re-seeded

`event-type-presets.ts`: `baby_shower` → `collage-staggered`, `birthday` → `arch-split`, `wedding` → `hero-cinematic`, `housewarming` → `split-image-right`, `general` → `magazine-editorial` (per the explorations' event tags). Themes unchanged. Preset tests updated.

## Risks / Trade-offs

- [14 bespoke layouts is a large UI surface] → Shared sections + `HeroGallery` keep per-layout code to the hero composition; Storybook stories per layout; visual review against canvas before archive.
- [Font payload grows (9 families)] → subset weights, `display: swap`; only public pages reference the vars; revisit if Lighthouse regresses.
- [Legacy localStorage drafts lack new fields] → zustand persist `version` bump + `migrate` seeding `coverImageUrls`/`headingFont`/`bodyFont` from legacy fields.
- [Dual-write `coverImageUrl` drift] → single helper in the wishlist router computes `coverImageUrl = coverImageUrls[0] ?? null` on every write; removal tracked as tech debt.
- [Placeholder-filled collages may look empty with 0 photos] → tinted placeholders + upload hint ("Este diseño muestra 3 fotos") nudge owners; matches design's `--ph-tint` rule.
- [Old 3 layouts must die before PROD] → entry added to `docs/FUTURE_IMPROVEMENTS.md` covering layouts + `coverImageUrl` + `fontPairing` removal and data migration.

## Migration Plan

1. Prisma migration: add `coverImageUrls`, `headingFont`, `bodyFont`; backfill from `coverImageUrl`/`fontPairing`. Reversible (columns additive).
2. Deploy code that reads new fields with legacy fallback and dual-writes `coverImageUrl`.
3. Pre-PROD (separate change): migrate legacy `layoutId`s to new equivalents, drop `coverImageUrl` + `fontPairing`, delete legacy layout components.

## Open Questions

- Exact hex palettes for the 5 new themes (authored + contrast-checked at apply; design file defines only the system, not these palettes).
- Exact Spanish picker labels for the 14 layouts (derive from canvas exploration titles at apply).
