## Context

See proposal.md — Why. What follows is only the state that constrains the approach.

The catalog is data. `MotifPreset` entries in `src/config/motifs.ts` declare `shapes: [primary, secondary]`, and shape names index `SHAPE_SVGS` in `src/components/shared/motif/motif-shape-svgs.tsx`. `MotifShape` (the component) is a thin wrapper: it writes `--motif-scale`/`--motif-rotate`/`--motif-tilt-depth` and optional `--m1`/`--m2`/`--m3` overrides onto a `div.mot`, then renders the registry entry's `viewBox`/`width`/`height`/`children` as a single inline `<svg>`. Nothing downstream of the catalog needs to know a new set exists — `wishlistMotifIdSchema` derives its enum from `MOTIF_IDS`, the save-draft gate reads `preset.eventTypes`, and all five placement components take shapes as opaque props.

Two facts shape every decision below.

**The primary/secondary split is a scale contract, not just a naming convention.** The five placement components apply different scale ranges to each role. Read off the source:

```
PRIMARY                                  SECONDARY
  scatter   1.5 · 1.1 · 0.75               scatter   1.3 · 0.9 · 0.7 · 0.6 · 0.55
  thumb     0.9                            divider   0.4 · 0.4
  seal      0.7                            band      0.24 · 0.22 · 0.20 · 0.18
  divider   0.5
  band      0.40 · 0.30 · 0.28
  sticker   0.32
  ── floor 0.28 ──                         ── floor 0.18 ──
```

A shape's role therefore decides how small it will ever be drawn. Assigning a shape to `primary` buys roughly 1.5× more room at the floor than `secondary`.

**The catalog currently ships two illustration styles.** `svg-motif-illustrations` archived with its task 9.9 unfinished: six shapes (`bunny`, `unicorn`, `duck`, `elephant`, `moon`, `dino`) carry ink outlines and `color-mix()` shading; the other ten (`bear`, `fox`, `cloud`, `flower`, `rainbow`, `tree`, `boat`, `balloon`, `star`, `leaf`) are still flat first-pass fills. `flower` in particular is five plain circles with no stroke. The finished style is the target style; the flat ten are a debt this change does not pay.

## Goals / Non-Goals

**Goals:**

- Author `bow` and `bloom` so both are legible across the entire scale range their assigned roles apply, with the bow's open-loop interior specifically surviving its floor.
- Keep every color — fill, stroke, shading — derived from `--m1`/`--m2`/`--m3` directly or through `color-mix()`, so both the `themed` palette and the `primary` surface inversion keep working with no shape-level branching.
- Land the set entirely within existing mechanisms: one catalog row, two registry entries, zero changes to component contracts.

**Non-Goals** (design-level, beyond the proposal's scope boundaries):

- Introducing gradients. Ruled out in the prior change for a reason that still holds — `SHAPE_SVGS` entries are static JSX with no per-render identity, so any shape rendered more than once on a page (guaranteed: `MotifScatter` alone renders each role three-to-five times) would emit duplicate `<stop>` ids into one document. `color-mix()` shading covers what these two shapes need.
- Any per-shape special-casing inside `MotifShape`. If a shape needs behavior the wrapper does not provide, the shape is wrong, not the wrapper.
- Animation beyond the float/tilt the placement components already apply.

## Decisions

### 1. Two new shapes, not a reuse of `flower`

`bloom` is a new `MotifShape` union member rather than a second use of the existing `flower`.

Reusing `flower` would mean re-authoring it anyway — it is a flat five-circle blob that would look wrong beside a carefully drawn bow — and re-authoring it silently changes how `flower-bunny` renders. That couples a new-set change to a visual change in a shipped set, and makes one review cover two unrelated judgments. It also collapses two catalog entries onto one silhouette, distinguished only by palette.

**Rejected:** reuse `flower` and re-author it in place (couples two changes, and leaves two sets sharing a silhouette). **Rejected:** reuse `flower` as-is (a flat blob next to an outlined bow is exactly the inconsistency this style pass exists to remove).

The ten flat shapes remain flat after this change. That is a known, accepted inconsistency, documented here so a reviewer does not read it as an oversight; the catch-up belongs in its own change.

### 2. `bow` is primary, `bloom` is secondary

`shapes: ["bow", "bloom"]`, id `bow-bloom`, label "Lazos y flores".

Three reasons, in order of weight:

1. **`MotifThumb` renders `motif.shapes[0]` and nothing else.** The picker gallery identifies a set by its primary shape alone, at a fixed 64px-tall tile. A bloom-primary set would sit in that gallery next to `flower-bunny` — also flower-primary — as two near-identical pink flower tiles. A bow tile is unmistakable, and no existing set has anything like it.
2. **The floor math above.** The bow is the shape with interior negative space to protect; `primary` gives it a 0.28 floor instead of 0.18. This is what makes decision 3 affordable at all.
3. The bow is the novel element of the set. It should carry the seal, the sticker, and the countdown chip.

**Rejected:** `["bloom", "bow"]` matching the "flowers and ribbons" phrasing. The label still leads with the concept the user named; only the shape order and thumb differ, and the picker-legibility cost of a second flower tile is concrete while the ordering cost is cosmetic.

### 3. The bow takes row-2 open loops with row-1 tails, and sizes its interior to survive

The reference sheet has four tiers: solid filled bows, ribbon-drawn bows with open loops, wispy line bows, and a wide banner bow. Tier 2 is the target look. Tier 3 is not authorable — long thin trailing curls fall below a pixel at any placement.

The synthesis, rather than a straight copy of any one tier:

- **Loops: open, ribbon-drawn (tier 2).** Ribbon band ≈ 20% of the viewBox width, interior hole ≥ 8 viewBox units. At the 0.28 floor on a 48-unit viewBox that hole renders ~2.2px — enough to read as open rather than filling in. The reference's holes are proportionally larger; ours are deliberately tightened. This is the one place the illustration diverges from the reference on purpose.
- **Tails: short and thick (tier 1), not wavy (tier 2).** The wavy tails are the specific element that dies first, and they are not what makes a bow recognizable.
- **Ends: notched / swallowtail.** The single most identifiable bow cue on the whole sheet, and cheap to keep — it is a silhouette notch, not fine detail.
- **Knot: a distinct rounded rectangle** in `color-mix(in srgb, var(--m1) 85%, black 15%)`, separating the loops visually where they meet.
- **Ink: `stroke="var(--m3)"`** at ~2.5% of the viewBox, matching the six finished shapes.

At the floor the stroke is sub-pixel and aliases to a faint edge. That is the same behavior the six finished shapes already have and the prior change already accepted as an improvement over no edge definition.

**Rejected:** tier-1 solid loops (safe at every scale, but the user chose the prettier option and the floor math shows it is affordable). **Rejected:** the tier-4 banner bow (beautiful in the divider, unusable in the seal and sticker, and there is one shape slot, not two).

### 4. The bloom takes papercraft construction with wildflower petal shape

Two of the three references contribute, each for a different reason:

- **Construction from the layered papercraft reference:** concentric petal rings in graduated tones, plus a serrated inner disc. This maps directly onto the `color-mix()` shading system — the outer ring is `color-mix(in srgb, var(--m1) 82%, black 18%)`, the inner ring is `var(--m1)` — so the depth is theme-safe by construction rather than painted in.
- **Petal shape and palette from the hand-drawn wildflower reference:** six tapered petals with rounded tips, spaced slightly unevenly so the bloom does not read as a machine-perfect rosette. The disc takes `var(--m2)` with a `var(--m3)` seed.
- **Nothing from either reference's stems, sprigs, or foliage.** Those are the elements that fall below a pixel at the secondary floor.

The papercraft reference's saturation is dropped entirely — see decision 5.

No face. The shipped group split gives character features to animal shapes only; `bloom` and `bow` join `flower`, `star`, and `balloon` as faceless.

### 5. Baby-shower-first muted palette, with `secondaryColors` giving the bloom its own identity

```
colors           m1 #E3A0B4  dusty rose   → bow ribbon
                 m2 #F5E7D8  cream        → bloom disc, highlight surfaces
                 m3 #6B3D4C  plum ink     → outlines, seed
secondaryColors  m1 #EFB98A  peach        → bloom petals (m1 only)
m3Inverted       #5A2F3C
suggestedThemeId cielo-suave-rosa
```

`secondaryColors` overrides `m1` and nothing else, deliberately. The override is applied by merging the partial over the set's palette — `{ ...motif.colors, ...motif.secondaryColors }` — so any token listed there replaces the set's value for that shape. Listing `m2` would repoint the bloom's center disc away from cream, since the disc reads `var(--m2)`. An earlier draft carried a sage `m2` for foliage; foliage was then cut in decision 4, leaving sage with no surface to land on and only a mis-tinted disc as its effect. Peach petals, cream disc, plum seed and outline.

The set is tagged for both event types, so the palette has to serve both. Baby shower is the priority, which settles it toward the muted wildflower register over the saturated papercraft one. Birthday is still served: an owner who wants more punch switches to the `themed` palette, which discards these hexes and derives from `--primary`/`--accent`/`--foreground`.

`secondaryColors` exists precisely for a secondary shape with its own natural color independent of the set's ambient palette — `forest-fox` keeps an orange fox against green trees, `duck-boat` a blue boat against a yellow duck. Peach blooms against rose bows uses the same mechanism and stops the set reading monochrome. It applies only under the `fixed` palette and only on the `base` surface, both already handled by `MotifShape`.

Under the `themed` palette the override is discarded and both shapes take the theme's tokens, so the bloom loses its peach and matches the bow. That is the existing behavior for every set that declares `secondaryColors`, not something specific to this one.

`m3Inverted` is a hardcoded dark plum, matching how `bear-cloud`, `duck-boat`, and `forest-fox` declare theirs, rather than `var(--primary-foreground)`. On the `primary` surface the shapes render white, so a fixed dark ink is legible regardless of the active theme's foreground.

`cielo-suave-rosa` is verified unclaimed by any existing set, and its `--primary: #e6a6bc` / `--background: #fbf1f4` sit directly in this palette's family.

### 6. Native dimensions: `bow` 48×40, `bloom` 40×40

New shapes carry no back-compatibility constraint on native size — the 1:1 port rule from the prior change bound only shapes that already had a CSS box. Sizes are chosen from the floor math, then checked against the family for outliers:

```
bow   48×40  identical to boat (48×40); rainbow is wider at 64×32
             floor 0.28 → 13.4 × 11.2px      ceiling 1.5 → 72 × 60px
bloom 40×40  between flower (34×34) and bear (44×44)
             floor 0.18 → 7.2 × 7.2px        ceiling 1.3 → 52 × 52px
```

The bloom's 7.2px floor is generous by catalog standards — `star` renders at 1.8px and `leaf` at 4.0px at the same scale. A radially symmetric rosette at 7px reads as a colored dot, which is the correct outcome for a band-strip filler.

## Risks / Trade-offs

- **The bow's open loops fill in at the 0.28 band floor** → The interior hole is spec'd at ≥8 viewBox units rather than copied from the reference, and the tasks include an explicit in-browser check at the band, sticker, and divider scales before the shape is considered done. If it still fills in, the fallback is tier-1 solid loops, which is a change to this one registry entry and nothing else.
- **The set ships polished beside ten flat first-pass shapes** → Accepted and documented in decision 1. The inconsistency already exists in the catalog (`flower-bunny` pairs a flat flower with an outlined bunny); this change does not worsen it, and confining the fix to its own change keeps both reviews honest.
- **`bow-bloom` has no row in `Motif Proposals.dc.html`, which a shipped spec scenario requires of every entry** → The scenario is rewritten to scope the design-source assertion to the eight sets that actually originate there, and to point `bow-bloom` at this change as its source of record. Handled in the spec delta rather than by inventing a design-file row.
- **Adding a fourth birthday-tagged set changes two shipped spec scenarios and three test assertions** → All enumerated in the proposal's Impact and covered by tasks. The count assertions are the kind that fail loudly, not silently.
- **A muted palette risks reading washed-out at low opacity** — hero scatter renders secondary instances down to `opacity: 0.28` → Verified visually during the manual pass. The mitigation, if needed, is deepening `m1`/`secondaryColors.m1` a step; opacity values themselves are placement-owned and out of scope.

## Migration Plan

None required. No schema change, no migration, no backfill. The set is additive: existing wishlists keep their stored `motifId`, and `bow-bloom` becomes selectable in the picker as soon as the catalog row exists. Rollback is deleting the catalog row and the two registry entries.
