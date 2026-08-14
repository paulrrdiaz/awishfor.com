## Why

The shipped motif system (`add-motif-gallery`) renders all 16 shapes as boxy CSS primitives — circles, rounded rects, border-triangles — which cannot produce the soft, curved "kawaii" baby-animal illustration style the product now wants (big eyes, blush cheeks, rounded bodies). The CSS approach was chosen specifically because it recolors cheaply through three inherited custom properties; that constraint still holds, but the visual ceiling of `border-radius` boxes has been reached. Inline SVG removes that ceiling while keeping every recoloring, sizing, and accessibility contract the CSS primitives already satisfy.

## What Changes

- Replace all 16 `MotifShape` primitives — `cloud`, `bear`, `flower`, `bunny`, `unicorn`, `rainbow`, `tree`, `fox`, `duck`, `boat`, `elephant`, `balloon`, `moon`, `star`, `dino`, `leaf` — with inline `<svg>` illustrations rendered from `<path>`/`<circle>` elements inside the `MotifShape` React component. **BREAKING** (internal): the shape wrapper markup changes from `div.mot > i*N` to `div.mot > svg`; no consumer-facing prop or placement API changes.
- Drop the `horn` shape primitive and its `MotifShape` type member — orphaned since `unicorn-rainbow` shipped using `["unicorn", "rainbow"]`, never `horn`. **BREAKING** (internal): removes a `MotifShape` union member and its CSS rules.
- Delete the ~750-line CSS primitive block in `src/styles/globals.css` (`.mot`, `.m-<shape>`, all `i:nth-child(...)` rules) now superseded by SVG markup.
- Recolor every shape purely via `fill="var(--m1)"` / `var(--m2)` / `var(--m3)` (and `mc1` where declared), preserving the existing `base`/`primary` surface split and the `fixed`/`themed`/`secondaryColors` palette mechanisms untouched at the catalog level.
- Preserve the `MotifShape` component's public prop contract (`scale`, `rotate`, `opacity`, `tiltDepth`, `surface`, `colors`) — this is a rendering swap inside the component, not a change to how `MotifScatter`, `MotifSeal`, `MotifSticker`, `MotifBand`, or `MotifDivider` call it.
- Keep every SVG `aria-hidden="true"`, with no `<title>`/`<desc>`, matching the current accessibility contract.
- Animal shapes (`bear`, `bunny`, `fox`, `unicorn`, `duck`, `dino`) get full "kawaii character" treatment (big eyes, blush, rounded bodies); non-animal shapes (`cloud`, `rainbow`, `star`, `moon`, `balloon`, `tree`, `leaf`, `boat`, `flower`, `elephant`) get cleaner geometric curves without character features.
- Reverse two prior decisions from `add-motif-gallery`, updating their source documents rather than working around them: the "pure-CSS, not SVG" call in that change's `design.md`, and the "no `<svg>`" requirement in its `public-wishlist-motifs` spec.
- Ship all 16 shapes together in one change, not staged. See design.md for why a staged rollout was rejected.

## Capabilities

### New Capabilities

(none — this is a rendering swap inside an existing capability, not a new one)

### Modified Capabilities

- `public-wishlist-motifs`: the "Motif shapes render as CSS primitives" requirement (no SVG, `<i>`-child markup) is replaced by a requirement that shapes render as inline SVG, recolored via the same `--m1`/`--m2`/`--m3`/`--mc1` custom properties, with the same `aria-hidden`, no-`<title>`/`<desc>`, and scale-without-markup-change guarantees carried forward under the new markup shape.

Note: `public-wishlist-motifs` (and `motif-picker`) were introduced by `add-motif-gallery`, which is fully implemented but not yet archived into `openspec/specs/`. This change's spec delta is written against that change's `specs/public-wishlist-motifs/spec.md` as the effective baseline, since no top-level `openspec/specs/public-wishlist-motifs/spec.md` exists yet.

## Impact

- **Code**: `src/components/shared/motif/motif-shape.tsx` (full rewrite of render logic), `src/config/motifs.ts` (drop `horn` from the `MotifShape` union), `src/styles/globals.css` (delete the primitive CSS block).
- **Tests**: `src/components/shared/motif/motif-shape.test.tsx` (per-shape child-count assertions no longer apply; replaced with SVG-structure assertions), `src/components/shared/motif/motif-shape.stories.tsx`, `src/components/shared/motif/motif-additivity.test.tsx` (verify still pass against new markup).
- **Consumers unaffected in API terms, but visually changed**: `motif-scatter.tsx`, `motif-seal.tsx`, `motif-sticker.tsx`, `motif-band.tsx`, `motif-divider.tsx` — all five placements render new illustrations at existing scale/opacity/rotate values, no prop or call-site changes.
- **OpenSpec docs**: `add-motif-gallery/design.md` decision 1 ("Pure-CSS shape primitives, not SVG") and `add-motif-gallery/specs/public-wishlist-motifs/spec.md` requirement "Motif shapes render as CSS primitives" are both superseded by this change's delta spec.
- **No schema, API, or persistence changes** — `MotifPreset`, `resolveMotif`, and the wizard/settings/router paths are untouched.
