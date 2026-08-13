## Context

The public wishlist already has a four-axis personalization system: `themeId` (7 presets), `layoutId` (9 layouts), `headingFont`/`bodyFont`, and `buttonStyle`. All four are injected as CSS custom properties by `PublicThemeProvider`, which stamps `theme.vars` plus `--radius`, `--public-font-*` and `--public-btn-*` onto a single root `<div>` and exposes `data-theme` / `data-btn-variant` attributes. Every downstream layout and shared component reads those tokens rather than hardcoding color.

`countdownVariant`, `welcomeMessageVariant` and `thankYouMessageVariant` established the pattern this change follows: a nullable `String` column on `Wishlist`, a catalog in `src/config/`, a `resolveX(id)` function that falls back to a default instead of throwing, and a picker component under `src/components/features/wishlist/`.

The design source is `Motif Proposals.dc.html` (Claude Design project `10380ffb-0586-4cc7-aa3b-862f4fb0ab17`) — 16 cards, being 8 motif sets rendered in 2 treatments each. Every card demonstrates the same five placements, so the design is effectively a specification of a placement grid rather than of individual page compositions.

Constraint worth stating up front: four of the eight design cards use theme presets that do not exist in `PUBLIC_THEME_PRESETS`. The designer worked from the real catalog — `theme-cielo`, `theme-rosa`, `theme-lavanda` and `theme-verde` match `cielo-suave`, `dulce-rosa`, `lavanda-fiesta` and `jardin-verde` on exact hex — and added four new ones. Those four are out of scope, so their motifs need a home among the existing seven.

## Goals / Non-Goals

**Goals:**

- Give baby shower and birthday wishlists a recognizable illustrated identity that survives a theme change.
- Render motifs with zero new assets and zero new dependencies.
- Keep the public render path free of runtime computation — what the wizard previews is byte-for-byte what publishes.
- Structure the catalog so new motif sets and new event types are additive, not a migration.
- Keep decorative content out of the accessibility tree and out of the way of reduced-motion users.
- Stay additive: motifs decorate what exists rather than restyling it, with exactly one specified exception (the `band` countdown surface).

**Non-Goals:**

- New theme presets (`theme-marino`, `theme-circo`, `theme-noche`, `theme-jungla`).
- Touch/scroll motion. Tilt is hover-only; parallax is a separate effect, deferred.
- Hero motifs in all nine layouts. Two ship; seven are follow-up.
- Motifs for `wedding`, `housewarming` or `general`.

## Decisions

### 1. Pure-CSS shape primitives, not SVG

**Superseded by `svg-motif-illustrations`** — shapes now render as inline `<svg>` illustrations recolored via `fill="var(--m1)"` etc. See that change's `design.md` Decision 1 for the current approach and rationale. The below is retained as historical record of the original decision.

Each motif shape is a `div.mot.m-<shape>` containing N absolutely-positioned `<i>` elements. `.m-bear` is 7 `<i>`s (two ears, head, muzzle, two eyes, nose); `.m-star` is a single rotated square with no children. Sizing comes from the wrapper's fixed `width`/`height`; instances scale with `transform: scale()`.

Chosen over SVG because the design is already expressed this way, the shapes are geometrically trivial (circles, rounded rects, CSS-border triangles), and every part recolors through inherited custom properties without per-instance markup edits. An SVG sprite would need `currentColor` gymnastics or per-part `fill` attributes to achieve the same three-token recoloring.

Cost accepted: 16 shapes × up to 7 children is verbose CSS, and the shapes are not independently scalable beyond `transform`. Both are acceptable for decoration.

**Rejected:** inline SVG components (recolor friction), an icon font (no multi-color), raster assets (no theming at all).

### 2. Three color tokens, two palettes, two surfaces

Colors resolve through `--m1` (body), `--m2` (detail), `--m3` (features). `bear-cloud` additionally uses `--mc1` for the cloud, which is white independent of the bear's brown.

Each catalog entry carries a **fixed** palette lifted from the design. The **themed** alternate is not authored per motif — it is derived:

```
--m1: var(--primary)
--m2: var(--accent)
--m3: var(--foreground)
```

This is a user toggle (`motifPalette`), default `fixed`.

The reason it is a toggle and not a computed value: WCAG contrast of each motif's `--m1` against its suggested theme's background spans 1.48–3.22 across all eight sets.

| Motif | `--m1` | Suggested theme | Contrast vs bg |
|---|---|---|---|
| duck-boat | `#F2C464` | cielo-suave | 1.48 |
| moon-stars | `#E8C468` | lavanda-fiesta | 1.48 |
| elephant-balloon | `#8FB6AA` | jardin-verde | 1.99 |
| bear-cloud | `#C99A6B` | cielo-suave | 2.29 |
| unicorn-rainbow | `#A78BDE` | lavanda-fiesta | 2.51 |
| dino-leaf | `#8C9A5D` | jardin-verde | 2.72 |
| forest-fox | `#6E9B6E` | jardin-verde | 2.86 |
| flower-bunny | `#E8637E` | dulce-rosa | 3.22 |

No threshold separates these — the maximum is 3.22 and the pastel language is deliberately low-contrast. A rule like "swap below 3:1" would flip seven of eight sets away from their designed appearance. The real trigger is qualitative ("the user picked a theme other than the suggested one"), which is a judgment the user makes, not a number the system computes.

Because the alternate is derived from theme tokens, it contrasts by construction and needs no validation. It also happens to satisfy the original "motifs should follow the theme color" intent, via the fallback path rather than the default one.

**Surfaces.** Motifs sit on light backgrounds everywhere except two spots in the `band` treatment — the countdown chip and the gift sticker, both filled with `--primary` — where the design inverts motifs to white. The white 60px seal recolors identically to a card, so it needs no special case. Two values suffice:

```
data-motif-surface="base"     → palette as resolved
data-motif-surface="primary"  → --m1/--m2 forced #FFF, --m3 to the motif's m3Inverted
```

The inverted feature color is **per motif, not a theme token**. The design's `band` cards override `--m3` to four distinct values, and only two of them coincide with their theme's `--primary-foreground`:

| Inverted `--m3` | Theme | Theme's `--primary-fg` | Match |
|---|---|---|---|
| `#1B2A40` | cielo | `#1B2A40` | yes |
| `#22382A` | verde | `#22382A` | yes |
| `#3B4F2A` | jungla | `#FFFFFF` | no |
| `#9A4E36` | — | — | matches no preset |

Two divergences settle it: the value is a darkened form of the motif's own identity hue, not a theme derivation. It belongs in the catalog as `m3Inverted`.

**Rejected:** per-motif hand-authored alternates (16 palettes to maintain, no contrast guarantee); render-time contrast computation (preview/publish divergence when the theme changes underneath); a third `seal` surface (verified unnecessary against all 5 placements × 2 treatments).

### 3. Motif variables ride on `PublicThemeProvider`

`--m1`/`--m2`/`--m3`/`--mc1` join `theme.vars` in the provider's inline `style`, and the provider gains `data-motif` / `data-motif-treatment` attributes alongside `data-theme`. Placement components then need no color props — they inherit, exactly as they already do for `--primary` and `--border`.

This also makes the `themed` palette trivial: it is the same three variables assigned `var(--primary)` / `var(--accent)` / `var(--foreground)`, resolved by the cascade in the same element where those tokens are defined.

### 4. Catalog shape

```ts
type MotifPreset = {
  id: MotifId;                    // "bear-cloud" | ...
  label: string;                  // Spanish, user-facing
  shapes: [MotifShape, MotifShape]; // primary (figurative), secondary
  eventTypes: EventType[];        // gate + picker filter
  colors: { m1: string; m2: string; m3: string; mc1?: string };
  m3Inverted: string;             // feature ink on --primary surfaces
  suggestedThemeId: ThemePresetId;
};
```

Four `m3Inverted` values are recoverable from the design file (`#1B2A40`, `#22382A`, `#3B4F2A`, `#9A4E36`); the remaining sets' `band` cards do not override `--m3`. Apply should extract each set's value from `Motif Proposals.dc.html` where present and fall back to `var(--primary-foreground)` where the design is silent.

`eventTypes` is an array from the start. The product intent is explicitly many-to-many — a motif may suit birthday *and* housewarming, or baby shower *and* wedding — so a scalar field would need a migration on the first crossover. Three sets ship tagged for both gated types:

| Motif | Design theme | Mapped theme | Event types |
|---|---|---|---|
| bear-cloud | cielo | `cielo-suave` (exact) | baby_shower |
| flower-bunny | rosa | `dulce-rosa` (exact) | baby_shower |
| unicorn-rainbow | lavanda | `lavanda-fiesta` (exact) | baby_shower, birthday |
| forest-fox | verde | `jardin-verde` (exact) | baby_shower |
| duck-boat | marino | `cielo-suave` (remapped) | baby_shower |
| elephant-balloon | circo | `jardin-verde` (remapped) | baby_shower, birthday |
| moon-stars | noche | `lavanda-fiesta` (remapped) | baby_shower, birthday |
| dino-leaf | jungla | `jardin-verde` (remapped) | baby_shower |

Remapping picks the nearest existing preset by background and primary hue. `suggestedThemeId` is advisory — it drives a hint in the picker and nothing else; any motif works with any theme.

IDs are English kebab-case, matching `countdownVariant` (`outline-pill`, `progress-bar`) and layouts (`arch-hero-party`). Theme IDs are Spanish only because they are brand names. Labels stay Spanish.

### 5. Placement split: 3 shared components, hero per-layout

| Placement | Where | Scope |
|---|---|---|
| countdown icon | shared countdown component | all 9 layouts |
| gift corner sticker | shared gift card | all 9 layouts |
| footer band | shared themed footer | all 9 layouts |
| section divider | shared, `scene` only | all 9 layouts |
| hero scatter / seal | per-layout | `collage-staggered`, `arch-hero-party` |

The hero is the only placement that must know its layout's composition — the other four live in components already shared across all layouts, so they cost one integration each rather than nine.

The two v1 hero layouts are `collage-staggered` and `arch-hero-party`, which are the `defaultLayoutId` of `baby_shower` and `birthday` respectively. Every user who lands in the motif gate without changing their layout therefore gets the full designed experience; users who switch layouts get the four shared placements until the follow-up lands.

**Rejected:** all nine hero integrations in v1 (45 integration points against a design that specifies none of the nine compositions); shared-only with no hero (would leave `scene` and `band` nearly indistinguishable, since the seal is the primary visual difference between them).

### 6. Treatments are structural

`scene` and `band` are not density levels:

| | scene | band |
|---|---|---|
| hero | scattered absolute motifs, opacity .35–.9 | white 60px drop-shadowed seal, centered |
| divider | present (`.mdiv`) | absent |
| countdown | motif on white card | motif on `--primary`, inverted |
| sticker | on white card | on `--primary`, inverted |
| bands | footer only, opacity .55 | top **and** bottom, `--accent`, opacity 1 |

Encoded as a discriminant read by each placement component, not as a set of independent opacity/density props.

### 7. Tilt: one listener, CSS variables

`useMotifTilt(containerRef)` attaches a single `pointermove` listener to the motif container, normalizes cursor position to −1..1, and writes `--tilt-x` / `--tilt-y` on the container. Motifs consume them through their `transform`, so per-instance depth is a static CSS multiplier.

With 5–15 motifs per page, per-motif listeners would mean 15 handlers each doing layout reads on every pointer event. One listener writing two variables lets the compositor do the rest.

Follows the `src/lib/gsap/use-hover-lift.ts` idiom: `"use client"`, ref argument, effect that early-returns on `reducedMotion` from `useReducedMotion()`, listeners cleaned up on unmount. GSAP drives the easing back to rest on pointer leave.

Touch: the hook binds nothing when the pointer is coarse. Hover has no touch equivalent; parallax is a different effect and is out of scope.

### 8. Persistence

```prisma
motifId        String?   // null = motifs off
motifTreatment String?   // "scene" | "band"
motifPalette   String?   // "fixed" | "themed"
```

No `motifEnabled` boolean — nullable `motifId` already encodes off, and a redundant flag drifts out of sync. `resolveMotif(id)` returns `null` for null/unknown ids rather than falling back to a default, since "no motif" is a legitimate and common state; this differs from `resolveTheme`, which must always yield a theme.

Additive migration, all columns nullable, no backfill, no breaking change. Existing wishlists render exactly as before.

## Risks / Trade-offs

**Three motifs share `jardin-verde` as their suggested theme** (`forest-fox`, `elephant-balloon`, `dino-leaf`) → Consequence of dropping the four design themes. `suggestedThemeId` is advisory only, so this affects a picker hint and nothing functional. If the four themes are added later, the remapped entries revert by editing one field each.

**Verbose primitive CSS** — 16 shapes with up to 7 children each → Confined to one stylesheet co-located with the shape component; no consumer ever writes it. Snapshot-test the primitives so accidental geometry edits surface.

**`themed` palette can make a figurative motif read wrong** — a bear in `--primary` lavender is a lavender bear → Accepted and intentional: `fixed` is the default, and `themed` is an opt-in the user reaches for precisely when the fixed palette clashes. The picker previews the result before saving.

**Motifs on unsuggested themes may wash out** — `duck-boat` at 1.48 contrast on a cream theme → This is what the `themed` toggle exists for. The picker should surface the suggestion when the current theme is not the motif's `suggestedThemeId`.

**Tilt on a decorative element could distract** → `prefers-reduced-motion` disables it entirely; the effect is bounded to a few degrees; nothing about comprehension depends on it.

**Motifs are decorative but sit inside meaningful components** (countdown, gift card) → Every motif element carries `aria-hidden="true"`. Motifs never carry text and never replace a label. Verify the gift card's accessible name is unchanged after the sticker lands.

**Two layouts get the hero, seven do not** → A user switching layouts sees the motif partially disappear. Mitigation: the four shared placements keep the motif present in every layout, so the change reads as "less decoration" rather than "the motif vanished". Follow-up tasks cover the remaining seven.
