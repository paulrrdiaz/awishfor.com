## Context

> Product update (2026-08-06): a later approved visual direction supersedes the
> handoff for `--accent` and `--accent-foreground` only. Accents now use light tonal
> variants of each preset's primary hue, removing the ivory/gold cast from Cielo and
> the unrelated beige/pink accents from Jardín and Lavanda. All other synced token
> roles remain literal design values.

`src/config/public-themes.ts` holds seven hand-authored token sets. Two independent
design sources — the theme classes in `PublicWishlistPages.dc.html` and the token
table in `design_handoff_public_wishlist_page/README.md` — agree with each other and
disagree with the repo on every preset. The repo is the outlier, so this is drift to
correct, not a redesign to negotiate.

The drift is structural, not per-value: the design uses **pastel primary + dark
primary-foreground**; the repo uses **saturated primary + near-white
primary-foreground**. Accents diverge the same way — the repo reaches for vivid
(`lavanda-fiesta` `#ffd166` gold, `jardin-verde` `#c9eb7a` lime) where the design
uses muted neutrals (`#F3E0EC`, `#EDE7D6`).

Three facts shape the approach:

1. **The correct values already exist in this repo.** `.m-preview-theme` in
   `src/styles/marketing.css` hardcodes the design's exact `cielo` tokens, including
   `--ph-tint: #dceaf6`. The marketing landing therefore advertises the product in
   colours the product does not use.
2. **The current values violate an existing spec.** `public-theme-config` already
   requires ≥ 4.5:1 on primary-foreground-on-primary. Five of seven presets fail
   (measured: 3.00 – 4.44). All seven design values pass (5.64 – 14.38).
3. **Scope is narrower than "global theme change" suggests.** `PublicThemeProvider`
   applies tokens as an inline `style` on a single `.public-theme` div. Dashboard and
   wizard chrome read `:root`, which this change does not touch.

## Goals / Non-Goals

**Goals:**
- Make `public-themes.ts` a faithful transcription of the design token set, with a
  documented derivation rule for every token the design does not define.
- Make the sync verifiable by test rather than by eyeballing, so it cannot silently
  drift again.
- Land before `refine-collage-staggered-layout`, whose acceptance criterion is a
  screenshot match that cannot close while tokens differ.

**Non-Goals:**
- Layout, geometry, typography, or the shared public header bar.
- Introducing a runtime theme editor or per-wishlist custom colours.
- Re-deriving the design palette. If a design value looks wrong, that is a
  conversation with the design file, not a decision made here.

## Decisions

### D1 — Transcribe base values literally; approve tonal accent overrides

The seven `vars` blocks retain the design hex values for base, surface, primary,
muted, border, and placeholder roles. Accent pairs are explicit approved hex values
drawn from the corresponding primary hue family so diffs remain readable and
foreground contrast can be verified.

*Alternative considered:* generate tints at runtime from a base hue per theme.
Rejected — explicit values preserve predictable rendering, readable diffs, and
independent contrast tuning for accent foregrounds.

### D2 — Derive the five tokens the design does not define

The repo's `ThemePresetVars` carries shadcn tokens with no design counterpart. Rules:

| repo token | rule | rationale |
|---|---|---|
| `--popover` | ← `--card` | design has one surface colour; popovers sit on it |
| `--popover-foreground` | ← `--card-foreground` | same |
| `--input` | ← `--border` | already true in every current preset |
| `--ring` | ← `--primary` | already true in every current preset; matches design `--ring` |
| `--secondary` / `--secondary-foreground` | **unchanged** | see D3 |

### D3 — Leave `--secondary` alone

The design system has no secondary token: `.btn-out` is transparent + border,
`.chip-on` is fg-on-bg. The existing repo values are light tints in each theme's own
hue family, so they stay compatible with the new pastel primaries.

*Alternative considered:* set `--secondary` ← design `--accent`. Rejected — it would
collide with `PriorityBadge`, where `high` already uses the accent pair and `medium`
uses secondary; the two badges would become indistinguishable.

Its only two consumers are `StatusBadge.available` (moved off it by D5) and
`PriorityBadge.medium` (has no design counterpart at all).

### D4 — Promote `--ph-tint` to the theme contract

`--ph-tint` is added to `ThemePresetVars` and mapped as `--color-ph-tint` in the
`@theme inline` block of `globals.css`, so it is usable as `bg-ph-tint`.
`HeroPlaceholder` moves from `bg-accent/50` to `bg-ph-tint`.

This is a promotion, not an invention — the token name and the `cielo` value already
exist in `marketing.css`, and `example-preview.tsx` already consumes it via
`bg-[var(--ph-tint)]`.

*Why it matters now:* `bg-accent/50` was tolerable while accents were vivid enough to
read as "a tint". With the design's muted neutral accents it is fine, but on the
*current* butter-yellow `cielo-suave` accent an all-placeholder hero renders as a
wash of yellow — the failure mode observed on `/w/baby-shower-de-noah` before images
load.

### D5 — Gift status badges leave the theme system

The handoff states status colours are "fixed across all themes, not theme-tokenized".
`StatusBadge` currently derives them (`bg-secondary`, `bg-primary/15`, `bg-muted`), so
"Disponible" changes colour per theme today. Move to the fixed triple.

Scoped deliberately: `PriorityBadge.high` correctly uses the accent pair per the
handoff and is left alone.

### D6 — Reconcile `.m-preview-theme` rather than delete it

After the sync it duplicates `cielo-suave`. It cannot simply be dropped: it is scoped
under `.marketing-theme` and uses design-local variable *names* (`--bg`, `--fg`,
`--muted-fg`) that differ from the app's semantic names (`--background`,
`--foreground`, `--muted-foreground`), and `example-preview.tsx` reads those names
directly.

Decision: keep the block, add a comment pointing at `cielo-suave` as its source of
truth, and align any value that drifted. Rewiring `example-preview.tsx` onto the
shared token names belongs to whatever change next touches that component.

### D7 — Assert the sync in a test

Add `src/config/public-themes.test.ts` holding the design token table as a literal
fixture, asserting per preset that the eleven design-defined tokens match, that the
derivation rules of D2 hold, that `--ph-tint` is present, that `preview` mirrors
`vars`, and that both contrast pairs clear 4.5:1.

This is what stops the drift recurring, and it converts the existing prose contrast
scenario into something enforced. The contrast helper is small (relative luminance +
ratio) and lives in the test file — no dependency.

## Risks / Trade-offs

**Every published wishlist changes appearance with no announcement** → Unavoidable
and intended; there is no per-wishlist colour override to preserve. `themeId` values
are untouched, so nothing breaks functionally and rollback is a single-file revert.

**CTAs get visually quieter** — pastel fill with dark label reads softer than
saturated fill with white label, and "Marcar comprado" is the page's conversion
action → Accepted: it is the design language, and it is what lifts contrast from
3.00–4.44 to 5.64–14.38. Worth a look at real pages after landing.

**`theme-previews.tsx` lightens the primary by 35% white** (`mixWithWhite(primary,
0.35)`) — tuned for saturated primaries; applied to a pastel it washes into the
background → Re-tune the mix amount as part of this change; covered by the
"marketing preview keeps pastel primaries legible" scenario.

**`cielo-suave-rosa` no longer shares the `cielo-suave` accent** — an existing spec
scenario asserts it does → The MODIFIED requirement updates that scenario; flagged
here because it is easy to miss as a "cosmetic" edit.

**Storybook and screenshot baselines shift** → `new-layouts.stories.tsx` renders
`PublicWishlistPage`; expect visual diffs across all nine layout stories. No
assertions depend on colour.

## Migration Plan

No data migration. `themeId` values, the Prisma schema, and the resolver API are
unchanged — only the values a `themeId` resolves to.

1. Land `public-themes.ts` + `globals.css` + the test together; the test fails until
   both land.
2. `HeroPlaceholder`, `StatusBadge`, `theme-previews.tsx`, `marketing.css` follow.
3. Verify on `/w/baby-shower-de-noah` (a `cielo-suave` + `collage-staggered` page)
   and against block 04 of the design mock.
4. Rollback: revert `public-themes.ts`. The `--ph-tint` and status-badge changes are
   independently safe to keep.

## Open Questions

- Does `PriorityBadge.medium` ("Sugerido") have an intended design treatment? It has
  no counterpart in the handoff, so it keeps `--secondary` by default.
- Should `example-preview.tsx` eventually consume the shared theme tokens instead of
  its own `.m-preview-theme` block? Out of scope here; noted so the duplication is a
  known debt rather than an accident.
