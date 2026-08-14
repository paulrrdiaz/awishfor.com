## 0. Orientation

- [x] 0.1 Read in one batched call: `src/components/layouts/public-wishlist/arch-trio-layout.tsx`, `collage-staggered-layout.tsx`, `split-image-right-layout.tsx`, `public-layout-shell.tsx`, `self-contained-layouts.ts`, `public-wishlist-page.tsx`, `src/components/shared/hero-gallery.tsx`, `event-details.tsx`, `progress-summary.tsx`, `gift-grid.tsx`, `gift-card.tsx`, `src/config/public-layouts.ts`
- [x] 0.2 Confirm the working-tree state of `gift-card.tsx`, `gift-card.test.tsx`, `gift-grid.tsx`, `gift-list.tsx`, `public-wishlist-body.tsx`, `collage-staggered-layout.tsx` (all carry uncommitted message-variant/motif work) and base every edit on the working-tree version, not `HEAD`

## 1. Shared components: carousel viewport clipping

- [x] 1.1 In `src/components/ui/carousel.tsx`, add optional `viewportClassName?: string` to `CarouselContent` and merge it via `cn` into the embla viewport `div` — the one currently carrying the hardcoded `"h-full overflow-hidden"` and `ref={carouselRef}`. Leave its existing `className` landing on the inner flex track, unchanged. Keep the edit minimal and additive: this is a shadcn-generated file
- [x] 1.2 Add optional `viewportClassName?: string` to `HeroCarouselGalleryProps` in `src/components/shared/hero-gallery.tsx` and forward it to `CarouselContent`; leave `className` on the `Carousel` root so `GalleryControls` keeps positioning against it
- [x] 1.3 Apply `viewportClassName` in the `visibleImages.length <= 1` branch too, so the 0/1-image fallback clips to the same shape as a slide (merge it into `HeroImageSlot`'s `className`)
- [x] 1.4 Add tests asserting that omitting `viewportClassName` on both `CarouselContent` and `HeroCarouselGallery` produces the same rendered structure as before, so `collage-staggered`, `arch-hero-party`, and `carousel-hero` are provably unaffected

## 2. Shared component: event details compact presentation

- [x] 2.1 Add a `variant?: "block" | "compact"` prop to `src/components/shared/event-details.tsx`, defaulting to `"block"` (current markup, `Código de vestimenta` label, `max-w-4xl` section wrapper)
- [x] 2.2 Implement `"compact"`: three-up grid of bordered `bg-card` cards, centered, mono uppercase micro-label, `Dresscode` label for the dress-code entry, no `max-w-4xl` section wrapper (the caller positions it)
- [x] 2.3 Replace the inlined event-details row in `collage-staggered-layout.tsx` with `<EventDetails variant="compact" …>` and confirm its rendered output is unchanged
- [x] 2.4 Add/extend a test covering both presentations, including that `"block"` still renders `Código de vestimenta` and `"compact"` renders `Dresscode`

## 3. Shared component: inline availability summary

- [x] 3.1 Add a `variant?: "block" | "inline"` prop to `src/components/shared/progress-summary.tsx`, defaulting to `"block"` (current centered paragraph)
- [x] 3.2 Implement `"inline"`: muted, non-centered, sized to sit on a heading row, and using the canvas's SHORT copy — `{availableGiftCount} disponibles · {purchasedUnits} comprados` — not the block presentation's `… de {totalUnits} unidades compradas`
- [x] 3.3 Confirm `PublicWishlistBody`'s existing call site still renders the block presentation unchanged

## 4. Gift card: `tilted` style

- [x] 4.1 Add `tilted` to the `GiftCardStyle` union in `src/components/shared/gift-card.tsx` and give it a card treatment with a heavier drop shadow than `card`
- [x] 4.2 In `src/components/shared/gift-grid.tsx`, apply positional rotation for `giftCardStyle === "tilted"` via `nth-child(3n+1)` `-1.6°`, `nth-child(3n+2)` `1.4°` + 16px top offset, `nth-child(3n+3)` `-0.8°`, on the grid wrapper — no index prop drilled into `GiftCard`
- [x] 4.3 Confirm `gift-list.tsx` handles `tilted` (or explicitly falls back) so the list view does not break when the grid toggle switches
- [x] 4.4 Extend `src/components/shared/gift-card.test.tsx` for the new style, and confirm every pre-existing style's assertions still pass

## 5. Preset changes

- [x] 5.1 In `src/config/public-layouts.ts`, set `arch-trio` `supportsCarousel: true` and `giftCardStyle: "tilted"`; leave `heroImageSlots: 3` and the 1:1 centered-subject image guidance unchanged
- [x] 5.2 In `src/config/public-layouts.test.ts`, move `arch-trio` out of the `["arch-trio", "scrapbook-polaroids"]` non-carousel loop — assert `scrapbook-polaroids` stays 3 slots / no carousel, and assert `arch-trio` is 3 slots / carousel-supporting / `giftCardStyle: "tilted"`
- [x] 5.3 Confirm `byId["collage-staggered"]?.giftCardStyle === "collage"` still passes untouched

## 6. Layout rewrite

- [x] 6.1 Add `"arch-trio"` to `SELF_CONTAINED_LAYOUT_IDS` in `self-contained-layouts.ts`
- [x] 6.2 Convert `arch-trio-layout.tsx` to a `"use client"` component composing `PublicLayoutShell`, with a `heroRef` + `useMotifTilt`, dropping the `PublicWishlistBody` import
- [x] 6.3 Build the hero shell: `grid-cols-1 lg:grid-cols-[290px_1fr]`, `min-h-[380px]`, `bg-[linear-gradient(160deg,var(--accent),var(--card))]`, media column first below `lg`, contained (no `w-screen` bleed)
- [x] 6.4 Build the arc trio in a `240×280` relative box: slot 1 172px `top-4 left-0` z-2 no ring; slot 2 128px `bottom-0 right-0` z-1 `border-[5px] border-card`; slot 3 92px `-top-2 right-2` z-3 `border-[5px] border-card`; shadows per design.md's table
- [x] 6.5 Bind `HeroCarouselGallery` to slot 1 only: `className` = the media column (`relative`), `viewportClassName` = `absolute top-4 left-0 size-[172px] rounded-full` so images cycle inside a stationary arc while controls stay at the column edges. Do NOT put the clip on the slide's media element — embla's track transform makes that stack the slides or slide the circle itself. Slots 2 and 3 stay `HeroImageSlot`. Pass `images={wishlist.images}`, `startIndex={0}` (no offset — unlike `collage-staggered`, the cycling slot is the one that owns image 0), `priority={!isCompact}`, and a `sizes` value matching the 172px render
- [x] 6.6 Build the text column: event-type eyebrow, `MotifSeal`, title, event summary line (host name · formatted date), `GuestWelcomeSection`, and `HeroCtas` gated on `!isCompact` — keeping the literals `showHowItWorks={wishlist.showHowItWorks}` and `mode === "compact"` present in the file
- [x] 6.7 Add `MotifScatter` scoped to the media column (not the full hero) and give the text column `relative` so no scatter instance overlaps the title
- [x] 6.8 Build the body in required section order: `EventDetails variant="compact"`, `Countdown` in the wishlist's selected variant, `MotifDivider`, `WishlistMessage` in its selected variant, a divider, the gift-list heading row with `ProgressSummary variant="inline"`, the gift section, then `WishlistThankYou` in its selected variant — each gated on `!isCompact` where the references gate it
- [x] 6.9 Wire `PublicGiftFilters` with `actionsEnabled={mode === "full"}`, `showCounts={false}`, `showGridToggle`, `showSort={false}`, and `showCategories={false}` — the canvas's chip row is exactly `Todos / Disponibles / Comprados / ★`. Do NOT wire `layout.showCategoryDividers` through: it has no consumer anywhere in `src/` and doing so would render chips the design does not show (design.md Decision 7)
- [x] 6.10 Give the gift section `id="regalos"` and `scroll-mt-[59px]`, matching both reference layouts
- [x] 6.11 Confirm `arch-trio-layout.tsx` contains no `WishlistFooter` reference — the footer stays owned by `PublicWishlistPage`

## 7. Tests for the migration

- [x] 7.1 Add `arch-trio-layout.tsx` to the "keeps thank-you content before shell-owned footer composition" test in `public-wishlist-layouts.test.ts`, asserting it contains `<WishlistThankYou` and `message={wishlist.thankYouMessage}` and no `WishlistFooter`
- [x] 7.2 Run `public-wishlist-layouts.test.ts` and confirm the three literal-grep assertions against `arch-trio-layout.tsx` still hold after the rewrite
- [x] 7.3 Update `new-layouts.stories.tsx` if it renders `arch-trio` through an assumption the rewrite invalidates

## 8. Validation

- [x] 8.1 Run `pnpm check` and fix any Biome findings
- [x] 8.2 Run `pnpm test` and fix any failures
- [x] 8.3 Run `pnpm typecheck` and fix any type errors
- [x] 8.4 Sync the corresponding milestone items in `docs/TASKS.md`
- [x] 8.5 Manual verification (reminder only, not to be attempted automatically): render `arch-trio` at `full`, `preview`, and `compact` across 0, 1, 3, and 6 cover images — confirm gallery controls sit at the media-column edges with the `Galería · foto N/M` caption, empty arcs show the theme's tinted placeholder rather than stock imagery, motif scatter never overlaps the title, and the tilted gift grid does not clip its rotated cards at the container edge
