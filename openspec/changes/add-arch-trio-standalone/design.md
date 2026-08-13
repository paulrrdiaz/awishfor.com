# Design — arch-trio standalone layout

Design source: `PublicWishlistPages.dc.html` section **08 · ArchTrio**, lines 586–651 (theme `theme-cielorosa`, occasion Baby Shower).
Pattern references: `collage-staggered-layout.tsx` (Collage Escalonado) and `split-image-right-layout.tsx` (Imagen Fija), both already self-contained.

## Target composition

```
┌──────────────────────────────────────────────┐
│ isotype        [● Publicada] [Compartir]     │  PublicLayoutShell (exists)
├───────────────┬──────────────────────────────┤
│ ‹  ARC TRIO  ›│ EYEBROW  Baby Shower · niña  │  grid 290px / 1fr, min-h 380
│   ╭──╮  ╭─╮   │ H1  Esperando a Oriana       │  bg linear-gradient(160deg,
│   │172│ │92│  │ sub  Daniela & José          │      var(--accent), var(--card))
│   ╰──╯ ╭┴─┴╮  │ [Ver regalos][Cómo funciona] │
│        │128│  │                              │
│   ● ○ ○ ╰──╯  │                              │
│  Galería · foto 1/3                          │
├───────────────┴──────────────────────────────┤
│  [Fecha]   [Lugar]   [Dresscode]             │  EventDetails, compact
│           ( Faltan 28 días )                 │  Countdown, filled-pill
│  ┌─ ─ dashed ─ ─┐  ⟳PARA TI                  │  WishlistMessage, postcard
│  ──────── divline ────────                   │
│  Lista de regalos    7 disponibles·2 compr.  │  ProgressSummary, inline
│  [Todos][Disponibles][Comprados][★]          │
│  ▢ ▢ ▢   3 cols, rotated ±1.6°, middle +16px │  GiftCardStyle "tilted"
├──────────────────────────────────────────────┤
│      rotated thank-you card + "D" seal       │  WishlistThankYou, handwritten
├──────────────────────────────────────────────┤
│      expanded footer (page-owned)            │  WishlistFooter, NOT layout-owned
└──────────────────────────────────────────────┘
```

Arc geometry, inside a `240×280` relative box:

| Slot | Size | Position | z | Ring | Shadow |
|---|---|---|---|---|---|
| 1 (carousel) | 172px | `top:16 left:0` | 2 | none | `0 16px 40px rgba(80,30,60,.18)` |
| 2 | 128px | `bottom:0 right:0` | 1 | `5px solid var(--card)` | `0 12px 30px rgba(80,30,60,.15)` |
| 3 | 92px | `top:-8 right:8` | 3 | `5px solid var(--card)` | `0 10px 24px rgba(80,30,60,.14)` |

## Decision 1 — Carousel scoped to the largest arc, clipped at the embla viewport

**Chosen.** `HeroCarouselGallery` binds to slot 1 only. Slots 2 and 3 stay static `HeroImageSlot`. Two optional props are added, both defaulting to today's behavior:

- `CarouselContent` (`src/components/ui/carousel.tsx`) gains `viewportClassName`, merged via `cn` into the embla viewport `div` — the element that currently carries a hardcoded `"h-full overflow-hidden"` and the `carouselRef`. Its existing `className` continues to land on the inner flex track, unchanged.
- `HeroCarouselGallery` gains `viewportClassName` and forwards it to `CarouselContent`.

For `arch-trio`: `className` = the 290px media column (`relative`), `viewportClassName` = `absolute top-4 left-0 size-[172px] rounded-full` — the circular window. Slides are `basis-full` of that viewport, so images cycle *inside* a stationary arc. `GalleryControls` is a sibling of `CarouselContent` inside the root, so it lands at the column edges with the `Galería · foto N/M` caption below the whole trio — exactly the canvas.

**Why the viewport, and not the slide's media element.** An earlier draft of this decision put the circular clip and its offset on each slide's media `div`. That does not work: `absolute` on the media div takes it out of flow, and embla's `transform` on the track makes the track the containing block, so all three slides stack at the same point and sliding moves nothing visible. A `relative` variant does slide, but produces the wrong effect — the circle itself travels across the column and off its edge, rather than images changing within a fixed arc. The clip has to sit on the viewport, between the carousel root and the flex track, and that element has no class hook today.

**Why a hook is necessary at all.** `GalleryControls` positions absolutely against whatever element receives `className`. Binding `className` directly to the 172px circle means `rounded-full` + `overflow-hidden` clips the controls into the disc. Compact-variant arrows and dots do technically land inside the visible circle, but cramped — and the `compact` variant suppresses the `Galería · foto N/M` caption entirely, so the canvas's exact caption string becomes unreachable.

**Which images feed it.** The carousel receives `wishlist.images` in order at `startIndex={0}`, so the large arc opens on the same first image the composition would otherwise show statically. Slots 2 and 3 keep `resolveHeroSlots` indices 1 and 2. Unlike `collage-staggered` — which offsets to `startIndex={1}` because its flanking slots already display images 0 and 2 — no offset is needed here: the cycling slot is the one that owns image 0.

**Rejected — carousel across all three arcs as a set.** The mock shows three dots for three arcs, which reads as "the trio pages through the gallery as a unit." Rejected: it makes the composition's meaning depend on image count (with 4 images, which arc shows which?), it has no precedent in either reference layout, and `heroImageSlots: 3` already commits the composition to three fixed slots.

**Rejected — compose the `Carousel` primitive directly in `arch-trio-layout.tsx`.** Would avoid touching a shared component, but `GalleryControls` is module-private in `hero-gallery.tsx`, so this duplicates the selected-index tracking, the `api.on("select")` wiring, and the control markup. A fourth copy of gallery chrome is worse than one optional prop.

**Rejected — accept clipped controls inside the circle.** Cheapest, no shared-component change, but it ships an approximation: no caption, cramped arrows. `CLAUDE.md` makes the imported design authoritative for layout, spacing, and interaction behavior.

**Consequence.** `arch-trio`'s preset flips `supportsCarousel: false → true`, and `public-layouts.test.ts` must move `arch-trio` out of the non-carousel loop it currently shares with `scrapbook-polaroids`.

## Decision 2 — Full motif treatment, scatter constrained to the media column

**Chosen.** `MotifScatter` + `MotifSeal` + `useMotifTilt` on the hero, plus `MotifDivider` in the body — matching `collage-staggered`'s depth rather than `arch-hero-party`'s (scatter + seal, divider from the shared body it still delegates to). The `MotifSeal` sits at the top of the text column, following `arch-hero-party`'s precedent (`className="lg:mx-0"` so it left-aligns with the copy at `lg` and centers below it).

**The constraint that differs from `collage-staggered`.** Collage's hero is a single centered column, so scatter can occupy the whole hero safely. ArchTrio's hero is `290px / 1fr`. `SCATTER_LAYOUT`'s second instance sits at `top:2% right:5%` at scale 1.5, opacity 0.9 — directly on the H1. The scatter container is therefore scoped to the media column, not the full hero, and the text column is raised (`relative`) so nothing overlaps the title at readable opacity.

**Rejected — divider-only, like `split-image-right`.** Consistent with the other two-column layout, but leaves `arch-trio` the only arc layout with no hero motif while its sibling `arch-hero-party` has scatter + seal. The occasion the canvas targets (Baby Shower) is exactly the motif system's primary use case.

**Rejected — full-hero scatter with raised text.** Simpler, but the two heaviest scatter instances (`top:2% right:5%` at 1.5, `bottom:6% right:12%` at 1.1) sit under the text column, so they would be half-occluded and read as clipped decoration rather than an ambient field.

**Note.** `useMotifTilt` requires a `"use client"` component and a `useRef` on the hero element, which is why the rewritten layout is a client component like both references.

## Decision 3 — `tilted` as a new `GiftCardStyle` member, rotation applied positionally by the grid

**Chosen.** Add `tilted` to the `GiftCardStyle` union and set it on the `arch-trio` preset. `GiftGrid` applies the rotation and stagger through `nth-child(3n+1) / (3n+2) / (3n+3)` classes on the grid wrapper for that style only.

**Why not reuse `collage`.** `collage` is deliberately flat — `shadow-none`, `rounded-[16px]` — and belongs to Collage Escalonado, which `public-layouts.test.ts` asserts explicitly (`byId["collage-staggered"]?.giftCardStyle === "collage"`). Overloading it would change that layout's shipped appearance.

**Why positional classes rather than an index prop.** `GiftGrid` maps gifts without an index, and `GiftCard` has no positional concept. Threading an index through both to apply three fixed rotations would put layout knowledge inside the card. `nth-child` keeps the rotation where the composition lives — in the grid — and degrades correctly when a row is short.

**Rejected — rotation as inline style computed per card.** Requires the index prop above and re-randomizes nothing, so it buys no variety over three fixed values.

**Coordination risk.** `gift-card.tsx`, `gift-card.test.tsx`, `gift-grid.tsx`, and `gift-list.tsx` all carry uncommitted working-tree changes from the message-variant/motif work. This decision's edits land on top of that, not on the committed versions.

## Decision 4 — Consolidate the event-details row instead of writing a third copy

**Chosen.** `EventDetails` gains a compact presentation (bordered cards, centered text, mono uppercase micro-label, `Dresscode` rather than `Código de vestimenta`). `arch-trio` consumes it, and `collage-staggered`'s inlined copy is repointed at it.

The shared `EventDetails` component already exists and is used by `PublicWishlistBody`; `collage-staggered` reimplemented the same three cards inline when it migrated, with a different label. Adding `arch-trio` as a third inline copy would make the label divergence permanent. Both canvases (04 and 08) say `Dresscode`, so the compact presentation adopts it and the default block presentation keeps `Código de vestimenta` unchanged.

**Rejected — leave `collage-staggered` alone and only add the compact presentation.** Halves the diff but leaves two implementations of one row, which is the condition that produced the divergence in the first place.

## Decision 5 — Contained hero, not full-bleed

`collage-staggered` bleeds its hero past the shell's 1160px main with `left-1/2 w-screen -translate-x-1/2`. `arch-trio` does not: canvas 08 draws the hero edge-to-edge of the card container, not beyond it. This follows `split-image-right`, which is also contained.

## Decision 6 — Availability summary inline on the gift heading

The canvas puts `7 disponibles · 2 comprados` on the `Lista de regalos` heading line, right-aligned. Both reference layouts instead pass `showCounts={false}` to `PublicGiftFilters` and drop `ProgressSummary` entirely. `ProgressSummary` gains an `inline` variant rather than the layout hand-rolling its own copy.

The inline variant differs in **copy as well as styling**. The block presentation reads `{availableGiftCount} disponibles · {purchasedUnits} de {totalUnits} unidades compradas`; the canvas reads `7 disponibles · 2 comprados`. The inline variant therefore uses the short form — available count, then purchased count, no unit total — and the block presentation's sentence is left untouched for `PublicWishlistBody`'s existing call site.

`showCounts={false}` still applies to the filter chips, matching the canvas's plain `Todos / Disponibles / Comprados / ★` chips.

## Decision 7 — Category filters stay off; `showCategoryDividers` is a dead preset field

The canvas's chip row is exactly `Todos / Disponibles / Comprados / ★` — no category chips. So `arch-trio` passes `showCategories={false}` to `PublicGiftFilters`, matching both reference layouts.

This *appears* to contradict `arch-trio`'s own preset, which declares `showCategoryDividers: true`. It does not, because `showCategoryDividers` has no consumer anywhere in `src/` outside its declaration in `public-layouts.ts` — every layout that renders category filters does so from a literal at the call site. The field is currently inert metadata on all nine presets.

**Chosen:** pass `showCategories={false}`, matching the canvas, and leave the dead field alone. Wiring `showCategoryDividers` into live behavior for one layout would make `arch-trio` the only preset where the flag means anything, produce chips the design does not show, and silently change nothing for the other eight — a worse state than an unused field.

**Rejected — wire the flag through as `showCategories={layout.showCategoryDividers}`.** Reads principled, ships the wrong UI.

**Rejected — delete `showCategoryDividers` from the preset type in this change.** It touches all nine presets, `public-theme-config`'s preset requirement, and `public-layouts.test.ts` for a cleanup unrelated to shipping this layout. Worth its own change; noted, not done here.

## Integration points

- `SELF_CONTAINED_LAYOUT_IDS` — adding `arch-trio` also switches the `PublicThemeProvider` className branch in `public-wishlist-page.tsx`, which keys off that set.
- `PublicLayoutShell` — supplies the header, the `max-w-[1160px]` main, and `--sticky-offset`. `arch-trio` does not use `--sticky-offset` (nothing is sticky) but inherits it harmlessly.
- `WishlistFooter` stays owned by `PublicWishlistPage`. The layout must not render it — `public-wishlist-layouts.test.ts` asserts its absence from every layout file.
- Dropping `PublicWishlistBody` drops `EventDetails`, `Countdown`, `MotifDivider`, `WishlistMessage`, `ProgressSummary`, `WishlistThankYou`, and the default `PublicGiftFilters` call. Each must be re-rendered by the layout.
- `showCategoryDividers` is declared on every preset and read by nothing (verified: no consumer in `src/` outside `public-layouts.ts`). See Decision 7 — `arch-trio` passes `showCategories={false}` per the canvas and does not wire the flag up.
- `src/components/ui/carousel.tsx` is shadcn-generated. The `viewportClassName` addition to `CarouselContent` is a local modification to a generated file; it must survive a future shadcn re-pull, so keep it minimal and additive.

## Validation expectations

- `pnpm check`, `pnpm test`, `pnpm typecheck` all clean.
- `public-layouts.test.ts` updated for the `supportsCarousel` and `giftCardStyle` changes, and still asserting `collage-staggered` is `"collage"`.
- `public-wishlist-layouts.test.ts` still finds `showHowItWorks={wishlist.showHowItWorks}`, `mode === "compact"`, and no `WishlistFooter` in `arch-trio-layout.tsx`; its thank-you test extended to cover `arch-trio-layout.tsx`.
- A test asserting `CarouselContent` without `viewportClassName`, and `HeroCarouselGallery` without `viewportClassName`, each render identically to before, so the three existing carousel consumers are provably unaffected.
- Manual (reminder only, not automated): render `arch-trio` at `full`, `preview`, and `compact` across 0, 1, 3, and 6 cover images; confirm gallery controls sit at the media-column edges, the caption reads `Galería · foto N/M`, placeholder arcs show the theme tint rather than stock imagery, and motif scatter never overlaps the title.
