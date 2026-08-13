## 1. Shape registry scaffolding

- [x] 1.1 Create `src/components/shared/motif/motif-shape-svgs.tsx` exporting `SHAPE_SVGS: Record<MotifShapeId, ShapeSvg>` where `ShapeSvg = { viewBox: string; width: number; height: number; children: ReactNode }`, ported native `width`/`height` 1:1 from each current `.m-<shape>` CSS rule in `src/styles/globals.css`
- [x] 1.2 Remove `horn` from the `MotifShape` union in `src/config/motifs.ts` and confirm no remaining reference (catalog `shapes` tuples, tests, stories)

## 2. Animal illustrations (kawaii treatment: oversized eyes, blush, rounded body)

- [x] 2.1 Author `bear` — body/head/muzzle/ears as filled rounded paths (`--m1`), muzzle patch (`--m2`), eyes/nose (`--m3`), blush as `fill="var(--m3)" fill-opacity="0.2"` per design.md decision 3, building on the existing CSS pass's bigger-eyes/blush direction
- [x] 2.2 Author `bunny` — rounded body, long ears, closed/open eye variant per references, blush cheeks (`--m3` + `fill-opacity`, matching current `.m-bunny` values)
- [x] 2.3 Author `fox` — rounded body/head/ears with `--m1`/`--m2` two-tone per `secondaryColors`, pointed but soft-edged ears and tail, blush
- [x] 2.4 Author `unicorn` — rounded body/head/mane, horn as part of the unicorn illustration (absorbs the dropped `horn` primitive's role), eyes/blush
- [x] 2.5 Author `duck` — rounded body, bill, wing detail, eye/blush
- [x] 2.6 Author `dino` — rounded body, back plates/spikes as soft filled shapes (not sharp triangles), eye/blush
- [x] 2.7 Author `elephant` — rounded body/head/trunk/ear silhouette with full kawaii face (eyes, blush) — grouped with the animal set per design.md decision 3 (it is `elephant-balloon`'s primary shape, rendered faced in seal/sticker/countdown placements alongside every other set's faced animal), `--m1`/`--m2`/`--m3`
- [ ] 2.8 Verify each animal shape (including `elephant`) at native size and at 0.18x (smallest current placement scale) — confirm the silhouette and face remain readable as the intended animal, not just as a colored blob

## 3. Geometric / prop illustrations (simplified curves, no character features)

- [x] 3.1 Author `cloud` — overlapping rounded-circle silhouette (replaces the 4-circle CSS cluster), using `--mc1`
- [x] 3.2 Author `flower` — rounded petal cluster + center, `--m1`/`--m2` (no face, despite pairing with `bunny` — see design.md decision 3)
- [x] 3.3 Author `rainbow` — stacked curved arcs, `--m1`/`--m2`/`--m3`
- [x] 3.4 Author `tree` — rounded canopy blob + trunk, `--m1`/`--m2`
- [x] 3.5 Author `boat` — hull curve + sail, `--m1`/`--m2`/`--m3` per `secondaryColors`
- [x] 3.6 Author `balloon` — rounded balloon body + string, `--m1`/`--m2`/`--m3` per `secondaryColors`
- [x] 3.7 Author `moon` — crescent curve, `--m1`/`--m2`
- [x] 3.8 Author `star` — rounded-point star silhouette (replaces the rotated-square CSS star), `--m1`
- [x] 3.9 Author `leaf` — simple curved leaf silhouette + vein, `--m1`/`--m2`/`--m3` per `secondaryColors`

## 4. Component rewrite

- [x] 4.1 Rewrite `src/components/shared/motif/motif-shape.tsx`: drop `SHAPE_CHILD_COUNT`, render `<svg aria-hidden="true" viewBox=.. width=.. height=..>{SHAPE_SVGS[shape].children}</svg>` inside the existing `div.mot` wrapper, preserving the `scale`/`rotate`/`opacity`/`tiltDepth`/`surface`/`colors`/`className`/`style` prop contract unchanged
- [x] 4.2 Confirm `[data-motif-surface="primary"]` and the `colors` inline-override mechanism both still work unmodified against `fill="var(--m1)"` SVG paths (no code change expected here per design.md — verify only)

## 5. CSS cleanup

- [x] 5.1 Delete all 16 `.m-<shape>` blocks (box sizing + `i:nth-child` painting rules) and the `.m-horn` block from `src/styles/globals.css`, keeping `.mot` (transform/position) and `[data-motif-surface="primary"]` intact
- [x] 5.2 Confirm `.mdiv`, `.mband`, `.seal`, `.stk` placement-chrome rules are untouched

## 6. Tests and stories

- [x] 6.1 Rewrite `src/components/shared/motif/motif-shape.test.tsx`: replace per-shape child-count assertions with assertions that every shape renders exactly one `<svg>`, no `<img>`/background-image, no `<title>`/`<desc>` inside the svg, `aria-hidden="true"` on the wrapper, and drop the `horn` entry from the shape list under test
- [ ] 6.2 Update `src/components/shared/motif/motif-shape.stories.tsx` to drop `horn` and confirm all 16 remaining shapes still render through Storybook controls at multiple scales/surfaces
- [x] 6.3 Run `src/components/shared/motif/motif-additivity.test.tsx` and confirm it still passes unmodified (validates the additive-rendering contract, not shape internals)

## 7. Docs: supersede the unarchived add-motif-gallery decision

- [x] 7.1 Edit `openspec/changes/add-motif-gallery/design.md` Decision 1 ("Pure-CSS shape primitives, not SVG") to note it is superseded by `svg-motif-illustrations`, pointing to this change's design.md Decision 1
- [x] 7.2 Rename `openspec/changes/add-motif-gallery/specs/public-wishlist-motifs/spec.md`'s requirement header from "Motif shapes render as CSS primitives" to "Motif shapes render as inline SVG" (matching this change's `MODIFIED Requirements` header exactly, per design.md decision 5) and replace its body/scenarios with the new SVG requirement text, so the unarchived change's own docs no longer contradict shipped behavior and archive tooling can match the requirement whichever change archives first

## 8. Validation

- [x] 8.1 Run `pnpm check` and fix any Biome findings
- [x] 8.2 Run `pnpm test` and fix any failures
- [x] 8.3 Run `pnpm typecheck` and fix any type errors
- [ ] 8.4 Manual verification (reminder only, not to be attempted automatically): boot the dev server, view a published wishlist for each of the 8 motif sets across `scene`/`band` treatments and `base`/`primary` surfaces, confirm illustrations render correctly at hero, sticker, countdown, band, and divider scales with no console errors

## 9. Style pivot: outline + shading illustrations (post-review, design.md decision 3 amendment)

First pass (tasks 2.x/3.x) shipped as flat single-tone fills; product review against baby-shower reference art rejected that as too crude. Re-author with ink outlines (`stroke="var(--m3)"`), shading/highlight via `color-mix()` off the body token, and gradients where useful (`<stop>` colored via `style="stop-color:var(--m1)"`, never the bare attribute — see design.md decision 3 for the verified Safari rationale).

- [x] 9.1 Verify in-browser (not just read docs) that `style="stop-color:var(--m1)"` resolves custom properties in gradient stops, and that `color-mix(in srgb, var(--m1) 80%, black 20%)` renders a visibly distinct tone when `--m1: #ffffff` (the `primary`-surface case) — done via a scratch HTML page in Chrome, both confirmed working
- [ ] 9.2 Re-author `dino` in the outline/shading style, referencing the pasted chibi-triceratops and hatching-dino images
- [ ] 9.3 Re-author `bunny` in the outline/shading style, referencing the pasted floral-crown bunny image
- [ ] 9.4 Re-author `duck` in the outline/shading style, referencing the pasted rubber-duck images
- [ ] 9.5 Re-author `moon` in the outline/shading style, referencing the pasted kawaii moon/cloud/stars card
- [ ] 9.6 Re-author `elephant` in the outline/shading style (no direct reference pasted this round — reuse proportions/mood from the bunny/dino references)
- [ ] 9.7 Re-author `unicorn` in the outline/shading style (no direct reference pasted this round — reuse proportions/mood from the bunny/dino references)
- [ ] 9.8 Show the 6 re-authored shapes to the user (Storybook or dev server) and get style sign-off before touching the remaining 10 shapes
- [ ] 9.9 Once style is confirmed, re-author the remaining 10 shapes (`bear`, `fox`, `cloud`, `flower`, `rainbow`, `tree`, `boat`, `balloon`, `star`, `leaf`) to match
- [ ] 9.10 Re-run `pnpm check` / `pnpm test` / `pnpm typecheck` after the full 16-shape re-author
