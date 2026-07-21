## 1. Data model & validation

- [x] 1.1 Prisma migration: add `Wishlist.coverImageUrls String[] @default([])`, `headingFont String?`, `bodyFont String?`; backfill `coverImageUrls` from `coverImageUrl` and font fields from the `fontPairing` mapping (`serif-soft`→lora+inter, `sans-modern`→inter+inter, `rounded-friendly`→nunito+nunito); regenerate client
- [x] 1.2 Extend wishlist router Zod inputs (`saveDraft`, update/settings) with `coverImageUrls: z.array(z.string().url()).max(6)`, `headingFont`, `bodyFont`; add a shared write helper that mirrors `coverImageUrl = coverImageUrls[0] ?? null` on every write
- [x] 1.3 Extend view models / `draftToPreview` / server draft mapping with `coverImageUrls`, `headingFont`, `bodyFont` (legacy fallbacks intact)
- [x] 1.4 Wizard store: add `coverImageUrls: string[]`, `headingFont`, `bodyFont` to the draft; bump persist `version` with a `migrate` seeding them from legacy `coverImageUrl`/`fontPairing`; update reset + save-draft input mapping; unit-test the migration

## 2. Preset configs

- [x] 2.1 `public-fonts.ts`: replace pairing-only shape with `PUBLIC_HEADING_FONTS` (lora default, playfair-display, cormorant-garamond, dm-serif-display, inter, nunito) and `PUBLIC_BODY_FONTS` (inter default, nunito, figtree, source-serif-4, karla); add `resolveHeadingFont`/`resolveBodyFont` with legacy `fontPairing` mapping; declare all 9 families in a `src/lib/fonts.ts` via `next/font/google` with subsetted weights and `--font-<id>` variables loaded from the root layout
- [x] 2.2 `public-themes.ts`: add `terracota-calida`, `menta-fresca`, `noche-azul`, `sol-dorado`, `coral-vivo` following the §7 palette system; verify ≥ 4.5:1 contrast for fg/bg and primary-fg/primary of each
- [x] 2.3 `public-button-styles.ts`: add `variant: "solid" | "outline"`; presets `pill` (default), `rounded`, `square` (0.25rem, weight 600), `outline` (pill radius, 1.5px border); update tests if any
- [x] 2.4 `public-layouts.ts`: add the 14 new presets (ids per design.md D1) with `heroImageSlots`, `supportsCarousel`, Spanish labels from the canvas titles; flag `grid`/`editorial`/`minimal` `deprecated: true` and sort them last; keep `resolveLayout` fallback
- [x] 2.5 `event-type-presets.ts`: re-point default layouts (baby_shower→collage-staggered, birthday→arch-split, wedding→hero-cinematic, housewarming→split-image-right, general→magazine-editorial); update `event-type-presets.test.ts`
- [x] 2.6 Add tech-debt entry to `docs/FUTURE_IMPROVEMENTS.md`: remove legacy layouts + `coverImageUrl` + `fontPairing` (with data migration) before PROD launch

## 3. Theme provider & button propagation

- [x] 3.1 `PublicThemeProvider`: accept `headingFont`/`bodyFont`, write `--public-font-heading`/`--public-font-body` (replacing `data-font-pairing`) plus existing button vars and a `data-btn-variant` attribute; map serif/heading and body styles in `globals.css` under `.public-theme`
- [x] 3.2 Add `.public-btn` treatment in `globals.css` consuming `--public-btn-radius`/`--public-btn-border-width`/`--public-btn-weight` with an outline variant (transparent bg, primary border/text)
- [x] 3.3 Apply `.public-btn` to every public button surface: `WishlistHero` CTAs, `GiftCard` actions, purchase modal actions, empty-state CTAs; remove the ad-hoc inline var usage in `gift-card.tsx` (legacy `WishlistHero` has no CTAs currently; new layout heroes in §5 use `.public-btn` from the start)

## 4. Hero gallery & multi-image upload

- [x] 4.1 Build shared `HeroGallery` component: ordered `coverImageUrls` into `heroImageSlots`, tinted placeholders for empty slots, `Carousel`-based prev/next + "Galería · foto N/M" caption when `supportsCarousel` && images ≥ 2
- [x] 4.2 Build `MultiImageUpload` (wraps UploadThing `coverImage` endpoint): thumbnail row, add tile disabled at 6, per-image remove, drag-to-reorder, "Principal" tag on first, layout-aware hint "Este diseño muestra N fotos"
- [x] 4.3 Wire `MultiImageUpload` into wizard design step and dashboard design editor + settings where cover image is edited

## 5. The 14 layout components

- [x] 5.1 Read the canvas explorations in full (sections at top 25500 / 27700 / 29900 of `A Wish For.dc.html`) and implement `hero-cinematic`, `split-image-right`, `arch-split` layouts composing shared sections + `HeroGallery`
- [x] 5.2 Implement `collage-staggered`, `magazine-editorial`, `overlap-duo`
- [x] 5.3 Implement `arch-hero-party`, `arch-trio`, `wedding-formal`
- [x] 5.4 Implement `panoramic-band`, `carousel-hero`, `diagonal-duo`
- [x] 5.5 Implement `scrapbook-polaroids` (gift tags treatment), `portrait-frame-split`
- [x] 5.6 Register all 14 in `PublicWishlistPage`'s layout switch; verify section order, render modes (`full`/`preview`/`compact`), and purchased-gift de-emphasis hold in each
- [x] 5.7 Storybook stories: one per new layout (0-image, 1-image, many-image states for at least the gallery layouts)

## 6. Step 3 & dashboard pickers

- [x] 6.1 Build `LayoutPicker`: 2-col thumbnail grid with hand-authored CSS/SVG skeleton previews (`LAYOUT_THUMBNAILS` map) + labels; legacy group last under muted "Clásico (se retirará)" divider
- [x] 6.2 Theme swatch picker → fixed-column grid (`grid-cols-4 sm:grid-cols-6`) for 12 swatches
- [x] 6.3 Tipografía → two selects (Títulos / Texto), each option rendered in its own font
- [x] 6.4 Estilo de botón → 4 chips each rendering its own preset shape (self-preview)
- [x] 6.5 Wire all new pickers into `design-step.tsx` and `wishlist-design-editor.tsx`; live preview reacts to every dimension
- [x] 6.6 Update marketing `theme-previews.tsx` with the 5 new theme gradients

## 7. Validation

- [x] 7.1 Unit tests: font/button/layout resolvers incl. legacy fallbacks; store migration; event-preset defaults
- [x] 7.2 Run `pnpm check`, `pnpm test`, `pnpm typecheck`
- [x] 7.3 Manual verify (dev server, port 4000): wizard step 3 with each picker, multi-image upload/reorder, carousel at 2+ images, placeholders at fixed-slot layouts, button style on hero CTA + modal, legacy wishlist still renders old layout
