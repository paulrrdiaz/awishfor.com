## Why

Public wishlists today are personalized only through theme, layout, fonts and button style — all abstract choices. Nothing on the page says "this is a baby shower" the way an illustrated motif does, so two wishlists for very different occasions can look nearly identical. The Claude Design file `Motif Proposals.dc.html` resolves this with a gallery of illustrated motif sets that thread a recurring character pair through five points of the page, giving each list a recognizable identity while staying inside the existing theme system.

## What Changes

- **New motif catalog** — 8 motif sets (`bear-cloud`, `flower-bunny`, `unicorn-rainbow`, `forest-fox`, `duck-boat`, `elephant-balloon`, `moon-stars`, `dino-leaf`), each pairing a figurative character with a secondary shape, tagged with the event types it suits.
- **16 pure-CSS shape primitives** — motifs render as `div.mot` with absolutely-positioned `<i>` children, no SVG assets, colored by three CSS variables (`--m1` body, `--m2` detail, `--m3` features) and scaled with `transform: scale()`.
- **Two treatments per set** — `scene` (scattered hero motifs, divider row, soft footer band) and `band` (accent-filled bands top and bottom, a white seal replacing the hero scatter, inverted motifs on `--primary` surfaces). These differ structurally, not only in density.
- **Two palettes per motif** — a fixed palette taken from the design (default) and a themed alternate derived from theme tokens (`--m1: var(--primary)`, `--m2: var(--accent)`, `--m3: var(--foreground)`) for wishlists whose theme is not the motif's suggested one. User-selected toggle, no automatic contrast computation.
- **Five placements** — hero scatter/seal, section divider, countdown icon, gift-card corner sticker, footer band.
- **Wizard + settings picker** — a motif picker gated to `baby_shower` and `birthday` event types, filtered by each motif's `eventTypes`, mirroring the existing message-variant and theme-swatch pickers.
- **Hover tilt** — a single container-level pointer listener writing `--tilt-x` / `--tilt-y`, disabled under `prefers-reduced-motion` and absent on touch.
- **Schema** — three nullable columns on `Wishlist` (`motifId`, `motifTreatment`, `motifPalette`); `motifId = null` means motifs are off.

### Non-goals

- **No new theme presets.** The design file introduces `theme-marino`, `theme-circo`, `theme-noche` and `theme-jungla`; these are explicitly out of scope. The four affected motif sets are remapped onto existing presets.
- **No parallax or touch motion.** Tilt is hover-only. A scroll-driven alternative for touch devices is deferred.
- **No hero motifs in all layouts.** The three shared components carry motifs everywhere, but the hero scatter/seal ships for `collage-staggered` and `arch-hero-party` only; the remaining seven layouts are follow-up work.
- **No motifs for `wedding`, `housewarming` or `general`.** The catalog is structured to accept them later, but none ship in this change.

## Capabilities

### New Capabilities
- `public-wishlist-motifs`: the motif catalog, its shape primitives, treatments, palettes, surfaces and the five page placements on the public wishlist.
- `motif-picker`: selecting, previewing and clearing a motif from the wizard and wishlist settings, including the event-type gate.

### Modified Capabilities
- `public-theme-config`: the public theme provider gains motif CSS variables (`--m1`, `--m2`, `--m3`, `--mc1`) and the `data-motif-surface` contract alongside the existing theme, font and button-style variables.
- `wishlist-settings`: motif selection becomes a persisted, editable wishlist setting.

## Impact

**Schema** — `prisma/schema.prisma`: `Wishlist.motifId`, `Wishlist.motifTreatment`, `Wishlist.motifPalette`, all `String?`. One additive migration, no backfill, no breaking change.

**New files** — `src/config/motifs.ts` (catalog + resolvers), `src/components/shared/motif/*` (shape primitives and the five placement components), `src/lib/gsap/use-motif-tilt.ts`, `src/components/features/wishlist/motif-picker.tsx`.

**Modified files** — `src/components/layouts/public-wishlist/public-theme-provider.tsx` (motif variables), the countdown, gift-card and themed-footer shared components (motif slots), `collage-staggered-layout.tsx` and `arch-hero-party-layout.tsx` (hero scatter/seal), the wishlist tRPC router and service plus the draft/persisted preview mappers and view models, and the wizard theme step.

**Dependencies** — none added. Tilt uses the GSAP setup already in `src/lib/gsap/`.

**Design source** — Claude Design project `10380ffb-0586-4cc7-aa3b-862f4fb0ab17`, file `Motif Proposals.dc.html`.
