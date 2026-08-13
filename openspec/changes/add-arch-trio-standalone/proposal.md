## Why

`arch-trio` ("Trío en Arco") is one of the seven layouts still rendering a bespoke hero on top of the generic `PublicWishlistBody`. A guest who picks it gets the design canvas's arc composition followed by a body that belongs to no particular design — different chrome, different section treatment, and no motif at all, while its two migrated siblings (`collage-staggered` / "Collage Escalonado" and `split-image-right` / "Imagen Fija") render the full page they were designed as.

Design canvas section **08 · ArchTrio · tres imágenes en arco · Cielo Suave Rosa · Baby Shower** (`PublicWishlistPages.dc.html`, lines 586–651) specifies the complete page. This change implements it, following the self-contained pattern the two migrated layouts established.

Three things in that canvas are not reachable with today's components, and each is included here because the layout is unshippable without it:

1. The arc trio is a **gallery** — prev/next controls and a `Galería · foto N/M` caption sit at the edges of the 290px media column, not inside a circle. `HeroCarouselGallery` positions its controls against whichever element receives `className`, and the big arc is a `rounded-full` + `overflow-hidden` clip, so today the controls would be trapped inside the disc and the caption suppressed. The clip has to move to the carousel's viewport element, which currently exposes no class hook.
2. The preset declares `supportsCarousel: false`, contradicting the canvas.
3. The gift cards are rotated and staggered, which no existing `GiftCardStyle` produces (`collage` is deliberately flat: `shadow-none`).

## What Changes

**Layout migration**

- Rewrite `arch-trio-layout.tsx` to compose `PublicLayoutShell` and own its full page body, replacing its `PublicWishlistBody` delegation. Register `arch-trio` in `SELF_CONTAINED_LAYOUT_IDS`.
- Hero: a two-column grid (`290px` media column / flexible text column at `lg` and above, min-height 380px) over a `linear-gradient(160deg, var(--accent), var(--card))`. Below `lg` it collapses to one column with the media column first.
- Arc trio geometry inside a 240×280 box, ported 1:1 from the canvas: slot 1 at 172px (`top:16 left:0`, z-index 2, **no** border ring), slot 2 at 128px (`bottom:0 right:0`, z-index 1, 5px `var(--card)` ring), slot 3 at 92px (`top:-8 right:8`, z-index 3, 5px `var(--card)` ring).
- Text column: event-type eyebrow, title, event summary line, guest welcome section, hero CTA group.
- Body, in required section order: the three-up event-details row (Fecha / Lugar / Dresscode), the countdown, the welcome message, a divider, the gift-list heading with an inline availability summary, the filtered gift list, and the thank-you message.

**Shared-component changes (all additive, all backward compatible)**

- `CarouselContent` and `HeroCarouselGallery` each gain an optional `viewportClassName`, threaded down to the embla viewport element (which today carries a hardcoded `h-full overflow-hidden` and no class hook). A layout can then clip the cycling images to one stationary shape while positioning gallery controls against a larger container. Omitting it preserves today's behavior exactly, so `collage-staggered`, `arch-hero-party`, and `carousel-hero` are untouched.
- A new `tilted` member of the `GiftCardStyle` union: rotated cards with a heavier drop shadow, and a vertical stagger on the middle card of each row. Rotation is positional (`-1.6°` / `1.4°` / `-0.8°`, middle card offset 16px), applied through `nth-child(3n+…)` classes on the grid wrapper rather than by drilling an index into `GiftCard`.
- `ProgressSummary` gains an `inline` variant so the availability summary can sit on the gift-list heading line as the canvas shows, instead of as a centered block. The inline variant also uses the canvas's shorter copy (`7 disponibles · 2 comprados`) rather than the block presentation's `… de N unidades compradas`.
- `EventDetails` gains a `compact` presentation (bordered cards, centered, `Dresscode` label) so `arch-trio` consumes it instead of inlining a third copy of the same row.

**Preset changes**

- `arch-trio`: `supportsCarousel` `false → true`; `giftCardStyle` `"card" → "tilted"`. `heroImageSlots` stays 3 and the 1:1 centered-subject image guidance is unchanged — the arcs still crop to circles.

**Consolidation**

- Repoint `collage-staggered`'s inlined event-details row at the shared `EventDetails` compact presentation. The shared component's `Código de vestimenta` label becomes `Dresscode` in the compact presentation, matching both canvases.

## Non-Goals

- Migrating the other six unmigrated layouts (`carousel-hero`, `scrapbook-polaroids`, `portrait-frame-split`, `arch-hero-party`, `overlap-duo`, `magazine-editorial`) to the shell.
- Changing the visual treatment of any layout other than `arch-trio`, beyond the `EventDetails` consolidation.
- Authoring or restyling motif shapes — that is `svg-motif-illustrations`, still in progress. This change only places the existing motif components.
- Wizard, dashboard, or settings surfaces. No schema, tRPC, or persistence change.
- Adding new themes. The canvas's `Cielo Suave Rosa` is presentation context, not a deliverable here.

## Capabilities

### New Capabilities

(none — this extends existing layout and preset capabilities)

### Modified Capabilities

- **`public-wishlist-layout`**: the "Layout variants" requirement's list of self-contained variants grows from two to three; "Hero gallery with multiple cover images" gains the rule that a layout may scope the carousel to one slot of a multi-slot composition and position controls against a container larger than that slot; "Event details section cards" gains the compact presentation; a new "Arch trio composition" requirement describes the layout, mirroring the existing "Split image right composition" requirement.
- **`public-theme-config`**: the `arch-trio` preset's declared `supportsCarousel` changes from false to true, and preset capability declaration now includes `giftCardStyle` as a named field.

## Impact

- **Code**: `src/components/layouts/public-wishlist/arch-trio-layout.tsx` (full rewrite), `self-contained-layouts.ts`, `src/components/ui/carousel.tsx` (`viewportClassName` on `CarouselContent` — a local modification to a shadcn-generated file, kept minimal and additive), `src/components/shared/hero-gallery.tsx` (forwards `viewportClassName`), `src/components/shared/gift-card.tsx` + `gift-grid.tsx` (`tilted` style), `src/components/shared/progress-summary.tsx` (inline variant), `src/components/shared/event-details.tsx` (compact presentation), `src/components/layouts/public-wishlist/collage-staggered-layout.tsx` (consume `EventDetails`), `src/config/public-layouts.ts` (two preset fields).
- **Known dead field, deliberately left alone**: `showCategoryDividers` is declared on all nine presets and read nowhere in `src/`. This change does not wire it up (the canvas shows no category chips) and does not remove it — see design.md Decision 7.
- **Tests that must change, not just pass**:
  - `src/config/public-layouts.test.ts` asserts `arch-trio` has `supportsCarousel: false` inside a loop shared with `scrapbook-polaroids` — `arch-trio` must move out of that loop into the carousel-supporting group.
  - `src/components/layouts/public-wishlist/public-wishlist-layouts.test.ts` greps `arch-trio-layout.tsx` for the literals `showHowItWorks={wishlist.showHowItWorks}` and `mode === "compact"` and asserts the file contains no `WishlistFooter` — the rewrite must keep all three true. Its "keeps thank-you content before shell-owned footer composition" test currently hardcodes only the shared body and `collage-staggered`; `arch-trio-layout.tsx` must be added, or the migration ships with zero coverage of its own thank-you rendering.
- **Working-tree coordination**: `src/components/shared/gift-card.tsx`, `gift-card.test.tsx`, `gift-grid.tsx`, `gift-list.tsx`, `public-wishlist-body.tsx`, and `collage-staggered-layout.tsx` all carry uncommitted changes from the in-progress message-variant and motif work. Apply work must rebase onto or coordinate with that state rather than assuming the committed versions.
- **No schema, API, env, or persistence changes.**
