## 1. Data model

- [x] 1.1 Add `motifId`, `motifTreatment`, `motifPalette` as `String?` on `Wishlist` in `prisma/schema.prisma`
- [x] 1.2 Run `pnpm prisma migrate dev` to create the additive migration, then `pnpm prisma generate`
- [x] 1.3 Verify existing wishlists read back with null motif columns and no other column changed

## 2. Motif catalog

- [x] 2.1 Create `src/config/motifs.ts` with `MotifId`, `MotifShape`, `MotifTreatment`, `MotifPalette` and `MotifPreset` types per design.md §4
- [x] 2.2 Populate the eight catalog entries with their design hex palettes, shape pairs, `eventTypes` arrays and `suggestedThemeId` values from the design.md mapping table
- [x] 2.2a Extract each set's `m3Inverted` from the `band` cards in `Motif Proposals.dc.html`, falling back to `var(--primary-foreground)` where the design does not override `--m3`
- [x] 2.3 Add `resolveMotif(id)` returning `null` for null/unknown ids, plus `getMotifsForEventType(eventType)` filtering on `eventTypes`
- [x] 2.4 Add `src/config/motifs.test.ts` covering: eight entries; every `eventTypes` non-empty; every `suggestedThemeId` present in `PUBLIC_THEME_PRESETS`; `resolveMotif` returns null for unknown ids without throwing; birthday filter returns exactly `unicorn-rainbow`, `elephant-balloon`, `moon-stars`

## 3. Shape primitives

- [x] 3.1 Create `src/components/shared/motif/motif-shape.tsx` rendering `div.mot.m-<shape>` with the correct child count per shape, always `aria-hidden="true"`, accepting `shape`, `scale`, `opacity` and `className`
- [x] 3.2 Author the primitive stylesheet for all 16 shapes (`cloud`, `bear`, `flower`, `bunny`, `rainbow`, `horn`, `star`, `tree`, `fox`, `duck`, `boat`, `elephant`, `balloon`, `moon`, `leaf`, `dino`), colors sourced only from `--m1`/`--m2`/`--m3`/`--mc1`
- [x] 3.3 Add the `data-motif-surface` rules: `base` passes the palette through, `primary` forces body/detail to white and features to the motif's `m3Inverted`
- [x] 3.4 Add `motif-shape.stories.tsx` rendering all 16 shapes across both surfaces and both palettes
- [x] 3.5 Add `motif-shape.test.tsx` asserting: no `<svg>`/`<img>` in output; `aria-hidden` present; child count per shape matches the design

## 4. Theme provider integration

- [x] 4.1 Extend `PublicThemeProvider` to accept a resolved motif plus treatment and palette, and write `--m1`/`--m2`/`--m3`/`--mc1` onto the `.public-theme` wrapper
- [x] 4.2 Emit `data-motif` and `data-motif-treatment` attributes; omit all motif variables and attributes when no motif is selected
- [x] 4.3 Resolve the `themed` palette as `var(--primary)` / `var(--accent)` / `var(--foreground)` on the same wrapper
- [x] 4.4 Extend the provider test to cover: motif variables present when selected; wrapper unchanged when not; themed palette resolves from theme tokens

## 5. Shared placement components

- [x] 5.1 Create `motif-divider.tsx` (the `.mdiv` row, `scene` only)
- [x] 5.2 Create `motif-band.tsx` (the `.mband` row) supporting the `scene` single reduced-opacity band and the `band` accent-filled full-opacity variant
- [x] 5.3 Create `motif-seal.tsx` (white 60px drop-shadowed circle wrapping the primary shape, `band` only)
- [x] 5.4 Create `motif-sticker.tsx` (the rotated `.stk` corner sticker) with `base` and `primary` surfaces
- [x] 5.5 Create `motif-scatter.tsx` (absolutely-positioned hero motifs at the design opacities, `scene` only)
- [x] 5.6 Add motif slots to `src/components/shared/countdown.tsx` — icon before the label, `primary` surface under the `band` treatment
- [x] 5.7 Add the corner sticker to `src/components/shared/gift-card.tsx`; assert in its existing test that the accessible name is unchanged
- [x] 5.8 Add the footer band to `src/components/shared/wishlist-footer.tsx`
- [x] 5.9 Verify all four shared placements render in every one of the nine layouts (traced: 7 layouts route through `PublicWishlistBody`, `collage-staggered` and `split-image-right` wire their own Countdown/PublicGiftFilters/MotifDivider directly; `WishlistFooter` is rendered once for all layouts in `PublicWishlistPage`)
- [x] 5.10 Add an additivity test (`motif-additivity.test.tsx`): structural diff (strip motif/aria-hidden nodes, compare remaining outerHTML incl. className — jsdom has no layout engine or compiled Tailwind, so computed-style assertions would be vacuous) confirms no existing element changes under `scene`
- [x] 5.11 Assert the `band` treatment restyles only the countdown surface (`motif-additivity.test.tsx`), and that the gift sticker leaves image, name, price and priority badge fully visible (`gift-card.test.tsx`)

## 6. Tilt

- [x] 6.1 Create `src/lib/gsap/use-motif-tilt.ts` following the `use-hover-lift.ts` idiom: `"use client"`, ref argument, one `pointermove` listener on the container writing normalized `--tilt-x`/`--tilt-y`
- [x] 6.2 Early-return without binding when `useReducedMotion()` is true or the pointer is coarse
- [x] 6.3 Ease motifs back to rest on pointer leave via GSAP; remove all listeners on unmount
- [x] 6.4 Consume `--tilt-x`/`--tilt-y` in the primitive transforms with a per-placement depth multiplier
- [x] 6.5 Add a test asserting exactly one listener is attached regardless of motif count, none under reduced motion, and cleanup on unmount

## 7. Hero integration

- [x] 7.1 Add the scatter (`scene`) / seal (`band`) to `collage-staggered-layout.tsx`
- [x] 7.2 Add the scatter (`scene`) / seal (`band`) to `arch-hero-party-layout.tsx`
- [x] 7.3 Verify a wishlist on any other layout renders the four shared placements with no hero motifs and no layout error

## 8. Persistence and view models

- [x] 8.1 Add the three motif fields to the wishlist view model and to `draft-to-preview.ts` and `persisted-to-preview.ts`, with tests
- [x] 8.2 Add Zod validation to the settings mutation in `src/server/api/routers/wishlist.ts`: `motifId` against the catalog, `motifTreatment` against `scene`/`band`, `motifPalette` against `fixed`/`themed`
- [x] 8.3 Reject a `motifId` whose `eventTypes` does not include the wishlist's event type
- [x] 8.4 Clear the motif when the event type changes to one outside the gate
- [x] 8.5 Persist through the settings router (mirrors the existing inline-in-router pattern, not a separate `wishlist.service.ts` function — no settings field currently routes through that service) and revalidate the public path; extended router and schema tests. Also threaded the same validation into the wizard's `saveDraftWishlistSchema`/`wishlist.service.ts` path so a motif picked in the wizard survives save/publish.

## 9. Picker UI

- [x] 9.1 Create `src/components/features/wishlist/motif-picker.tsx` mirroring `message-variant-picker.tsx`, with an explicit "no motif" option selected by default
- [x] 9.2 Filter the gallery by the wishlist's event type; render nothing when the event type is outside the gate
- [x] 9.3 Add the Escena/Banda treatment control and the fixed/themed palette control, revealed once a motif is chosen, defaulting to `scene` and `fixed`
- [x] 9.4 Preview each option against the wishlist's current theme, treatment and palette
- [x] 9.5 Show the non-blocking suggested-theme hint when the current theme differs from the motif's `suggestedThemeId`; never block saving
- [x] 9.6 Wire the picker into the wizard theme step and the wishlist settings form
- [x] 9.7 Add `motif-picker.test.tsx`: gate by event type; birthday sees exactly three sets; clearing sets null; labels Spanish and values English

## 10. Validation

- [x] 10.1 Run `pnpm check` and fix any Biome findings
- [x] 10.2 Run `pnpm test` and fix any failures
- [x] 10.3 Run `pnpm typecheck` and fix any type errors
- [x] 10.4 Manual verification: booted the dev server and hit a real published wishlist (`baby-shower-de-noah`, `collage-staggered`) with `bear-cloud` in both treatments — confirmed `.mot`/`.mdiv`/`.mband`/`.seal`/`.stk`, `data-motif`/`data-motif-treatment`/`data-motif-surface="primary"`, fixed vs. themed `--m1` resolution, and the hero scatter wrapper, all with no server errors; reverted the DB afterward. Not manually checked this session: `arch-hero-party` hero (verified only by code/pattern match against `collage-staggered`) and tilt behavior on a real fine pointer (jsdom-tested only).

## Follow-up (not in this change — deliberately unchecked-free so it does not count toward progress)

Deferred to later changes, listed here so the boundary is explicit:

* Hero motifs for the remaining seven layouts: `split-image-right`, `magazine-editorial`, `overlap-duo`, `arch-trio`, `carousel-hero`, `scrapbook-polaroids`, `portrait-frame-split`
* Motif sets for `wedding`, `housewarming` and `general`
* Scroll-driven motion for touch devices (the deferred parallax)
* The four theme presets the design introduced and this change declined: `theme-marino`, `theme-circo`, `theme-noche`, `theme-jungla`
