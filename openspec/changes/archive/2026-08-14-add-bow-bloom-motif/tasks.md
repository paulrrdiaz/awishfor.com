## 1. Catalog types and shape registry scaffold

- [x] 1.1 Add `"bow"` and `"bloom"` to the `MotifShape` union in `src/config/motifs.ts`
- [x] 1.2 Add `"bow-bloom"` to the `MotifId` union and to `MOTIF_IDS` in `src/config/motifs.ts`
- [x] 1.3 Add placeholder `bow` (`viewBox "0 0 48 40"`, `width: 48`, `height: 40`) and `bloom` (`viewBox "0 0 40 40"`, `width: 40`, `height: 40`) entries to `SHAPE_SVGS` in `src/components/shared/motif/motif-shape-svgs.tsx` so the union compiles before the illustrations exist

## 2. Author the `bow` illustration

- [x] 2.1 Draw the two open ribbon loops with a band width ≈20% of the viewBox and an interior hole of at least 8 viewBox units, filled `var(--m1)` with `stroke="var(--m3)"` at ~2.5% of the viewBox (design.md decision 3)
- [x] 2.2 Add the center knot as a rounded rect filled `color-mix(in srgb, var(--m1) 85%, black 15%)`, sitting over the point where the loops meet
- [x] 2.3 Add the two short thick tails with notched (swallowtail) ends, filled `color-mix(in srgb, var(--m1) 90%, black 10%)` so they read behind the loops
- [x] 2.4 Add the front-loop highlight as `color-mix(in srgb, var(--m1) 75%, white 25%)`, reproducing the two-tone loop layering from the reference
- [x] 2.5 Confirm every `fill` and `stroke` in the entry resolves from `--m1`/`--m2`/`--m3` directly or via `color-mix()`, with no unconditional hardcoded color

## 3. Author the `bloom` illustration

- [x] 3.1 Draw six tapered petals with rounded tips, spaced slightly unevenly, as the outer ring filled `color-mix(in srgb, var(--m1) 82%, black 18%)`
- [x] 3.2 Draw the inner petal ring filled `var(--m1)`, inset and rotated off the outer ring so both rings read as separate layers
- [x] 3.3 Add the serrated center disc filled `var(--m2)` with a `var(--m3)` seed dot, sized to at least 8% of the viewBox width so it survives downscaling — this is why `secondaryColors` must not override `m2` (task 4.3)
- [x] 3.4 Add the `stroke="var(--m3)"` ink outline at the same proportional weight used for `bow`
- [x] 3.5 Confirm no stem, sprig, or foliage element is present, and that every color resolves from `--m1`/`--m2`/`--m3` or `color-mix()`

## 4. Catalog entry

- [x] 4.1 Add the `bow-bloom` `MotifPreset` to `MOTIF_PRESETS` in `src/config/motifs.ts` with `label: "Lazos y flores"`, `shapes: ["bow", "bloom"]`, `eventTypes: ["baby_shower", "birthday"]`, and `suggestedThemeId: "cielo-suave-rosa"`
- [x] 4.2 Set `colors` to `{ m1: "#E3A0B4", m2: "#F5E7D8", m3: "#6B3D4C" }` and `m3Inverted` to `"#5A2F3C"` (design.md decision 5)
- [x] 4.3 Set `secondaryColors` to `{ m1: "#EFB98A" }` — `m1` only, so the bloom's petals go peach while its center disc keeps the set's cream `m2` (design.md decision 5)

## 5. Tests

- [x] 5.1 Update `src/config/motifs.test.ts`: change both `toHaveLength(8)` assertions to `9`, rename the "contains exactly eight entries" test, and add `bow-bloom` to the expected birthday id list (renaming that test to reflect four sets)
- [x] 5.2 Add `"bow"` and `"bloom"` to the literal shape list in `src/components/shared/motif/motif-shape.test.tsx` so the per-shape suite covers them
- [x] 5.3 Update any count- or id-sensitive assertions in `src/components/features/wishlist/motif-picker.test.tsx` for the ninth set and the fourth birthday-tagged set
- [x] 5.4 Add a `motifs.test.ts` case asserting `bow-bloom` declares `secondaryColors` and that its `suggestedThemeId` resolves to an existing theme preset

## 6. Legibility verification

`motif-shape.stories.tsx` derives its grid from `MOTIF_PRESETS`, so `bow-bloom` appears automatically once task 4.1 lands — but every cell renders at the default `scale: 1`, which is not where these shapes are at risk. Task 6.1 adds the vehicle the rest of this group needs.

- [x] 6.1 Add a scale-ladder story to `src/components/shared/motif/motif-shape.stories.tsx` rendering a chosen shape across the real placement scales (primary: 1.5 / 0.7 / 0.5 / 0.40 / 0.32 / 0.28; secondary: 1.3 / 0.7 / 0.4 / 0.24 / 0.18), against both `base` and `primary` surfaces
- [x] 6.2 Render `bow` down the primary ladder and confirm the loop interiors still read as open holes rather than filling in at 0.28 (design.md Risks — this is the decision-3 fallback trigger) — verified via a standalone HTML harness rendering the exact SVG paths at scale, magnified for inspection; open holes remain visible at 0.28
- [x] 6.3 Render `bloom` down the secondary ladder and confirm it still reads as a rosette rather than an indistinct blob at 0.18 — verified the same way; rosette shape remains recognizable at 0.18
- [x] 6.4 Confirm at `surface="primary"` that the `color-mix()` shading on both shapes stays visible when `--m1` is forced to white — verified; gray shading tones remain visible against white on the primary surface for both shapes
- [x] 6.5 Confirm under the `fixed` palette that the bloom renders peach petals with a cream center disc — i.e. that `secondaryColors` overrode `m1` only and did not repoint `--m2` — verified visually
- [x] 6.6 If 6.2 fails, fall back to solid (non-open) loops per design.md decision 3 and re-run 6.2 — not triggered; 6.2 passed

## 7. Spec sync

- [x] 7.1 Confirm the delta in `specs/public-wishlist-motifs/spec.md` matches the shipped catalog: nine ids, four birthday-tagged sets, `secondaryColors` documented as optional, and the design-source assertion scoped to the eight sets from `Motif Proposals.dc.html` — confirmed, matches shipped `MOTIF_PRESETS`
- [x] 7.2 Confirm the delta in `specs/motif-picker/spec.md` matches the shipped picker behavior for nine and four sets — confirmed
- [x] 7.3 Confirm the "Motif shapes remain legible across every placement scale" requirement matches what task 6 actually verified — confirmed; 6.2 passed without the solid-loop fallback, so no outcome note is needed
- [ ] 7.4 At archive time, verify the REMOVED-plus-ADDED restatements landed cleanly in `openspec/specs/public-wishlist-motifs/spec.md` and `openspec/specs/motif-picker/spec.md` — that the old "Motif catalog" and "Picker offers only motifs tagged for the event type" blocks are gone and no duplicate requirement remains

## 8. Validation

- [x] 8.1 Run `pnpm check` and fix any Biome findings — no findings in changed files (59 pre-existing errors in unrelated `public/assets/motif/*.svg` files, untouched by this change)
- [x] 8.2 Run `pnpm test` and fix any failures — 866/866 passing
- [x] 8.3 Run `pnpm typecheck` and fix any type errors — clean
- [x] 8.4 Run `openspec validate add-bow-bloom-motif --strict` and fix any findings — valid
- [x] 8.5 Manual verification (reminder only, not to be attempted automatically): boot the dev server on port 4000, publish a `baby_shower` wishlist with `bow-bloom` under both `scene` and `band` treatments and both `fixed` and `themed` palettes, and confirm the hero scatter/seal, divider, footer band, gift sticker, and countdown chip all render with no console errors
