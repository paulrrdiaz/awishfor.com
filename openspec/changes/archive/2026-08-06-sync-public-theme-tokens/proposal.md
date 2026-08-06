## Why

> Product update (2026-08-06): the design-token sync remains the source for the
> base, surface, primary, muted, border, and placeholder colors. A later approved
> direction supersedes the handoff's independent accent colors: every accent is now
> a light tonal variant of its theme primary. In particular, `cielo-suave` no longer
> introduces a warm ivory/gold cast.

Guests see the wrong colors. `src/config/public-themes.ts` drifted from the design
system: the mock CSS in `PublicWishlistPages.dc.html` and the token table in
`design_handoff_public_wishlist_page/README.md` agree with each other and both
disagree with the repo on every theme. The drift is systemic — the design uses
**pastel primaries with dark foregrounds**, the repo uses **saturated primaries with
light foregrounds**.

This is not only cosmetic. `openspec/specs/public-theme-config/spec.md` already
requires "primary-foreground-on-primary combinations meet at least 4.5:1 contrast".
**Five of seven presets violate that today**, and every design value clears it:

| preset | repo primary-fg / primary | design primary-fg / primary |
|---|---|---|
| `dulce-rosa` | 3.54 ✗ | 6.20 ✓ |
| `cielo-suave` | 3.32 ✗ | 7.31 ✓ |
| `cielo-suave-rosa` | 3.00 ✗ | 6.58 ✓ |
| `jardin-verde` | 5.03 ✓ | 6.49 ✓ |
| `crema-elegante` | 3.81 ✗ | 5.64 ✓ |
| `lavanda-fiesta` | 4.44 ✗ | 6.20 ✓ |
| `clasico-minimal` | 14.68 ✓ | 14.38 ✓ |

The repo already knows the correct values: `.m-preview-theme` in
`src/styles/marketing.css` hardcodes the design's exact `cielo-suave` tokens
(`#eef5fb`, `#33425c`, `#8fbee0`, `#f1eee7`, `#dce7f2`, `#6c7c95`, `#dceaf6`) so the
marketing example card renders correctly — while the real public page it advertises
renders in the drifted palette. The landing page and the product it sells do not match.

Now, because the CollageStaggered pixel-fidelity work (`refine-collage-staggered-layout`)
cannot be verified against the design mock until the tokens agree.

## What Changes

- **BREAKING (visual):** All seven `PUBLIC_THEME_PRESETS` token sets in
  `src/config/public-themes.ts` are replaced with the design-system values. Every
  published wishlist changes appearance. No data migration — `themeId` values are
  unchanged, only what they resolve to.
- Accent pairs are kept in the primary hue family instead of introducing an
  unrelated hue. This affects every layout through the shared public theme scope.
- Primary buttons across the public page ("Ver regalos disponibles", "Marcar
  comprado") become quieter: pastel fill with dark label instead of saturated fill
  with white label. This is the intended design language, and it is what fixes the
  contrast failures.
- Add `--ph-tint` to `ThemePresetVars` (seven values) and map `--color-ph-tint` in
  `src/styles/globals.css`. The token name is already established in
  `marketing.css`; this promotes it to the shared theme contract.
- `HeroPlaceholder` (`src/components/shared/hero-gallery.tsx`) switches from
  `bg-accent/50` to the new placeholder tint. On today's butter-yellow
  `cielo-suave` accent, empty hero slots render as a wash of yellow instead of a
  neutral photo-shaped tint.
- `ThemePreset.preview` swatches (`background` / `primary` / `accent`) are updated in
  lockstep so `theme-swatch-picker.tsx` and `marketing/theme-previews.tsx` stop
  misrepresenting the themes.
- `StatusBadge` gift-status colors move off theme tokens onto the fixed triple the
  design specifies (available `#E4F3E8`/`#2F7D43`, partial `#FBF1DC`/`#9A6F1E`,
  purchased `#EAECEF`/`#71798A`). The handoff states these are "fixed across all
  themes, not theme-tokenized"; `bg-secondary` / `bg-primary/15` currently recolors
  them per theme.
- `.m-preview-theme` in `marketing.css` becomes a duplicate of the synced
  `cielo-suave` and is reconciled.

## Capabilities

### New Capabilities
<!-- none -->

### Modified Capabilities
- `public-theme-config`: the seven theme presets' concrete token values become
  design-system-defined rather than hand-authored; `ThemePresetVars` gains a
  placeholder-tint token; the existing ≥4.5:1 contrast requirement gains a
  verifiable per-preset assertion instead of a prose claim.
- `public-wishlist-page`: gift status badge colors are fixed across themes rather
  than derived from the active theme's tokens.

## Impact

**Source**
- `src/config/public-themes.ts` — all seven `vars` blocks, all seven `preview`
  blocks, `ThemePresetVars` type
- `src/styles/globals.css` — `--color-ph-tint` in the `@theme inline` block
- `src/styles/marketing.css` — `.m-preview-theme` reconciliation
- `src/components/shared/hero-gallery.tsx` — `HeroPlaceholder`
- `src/components/shared/status-badge.tsx` — fixed status colors
- `src/components/layouts/marketing/theme-previews.tsx` — `mixWithWhite(primary, 0.35)`
  washes out the new pastel primaries; the mix amount needs re-tuning

**Blast radius is scoped, not global.** Theme vars are applied as an inline `style`
on the `.public-theme` div in `PublicThemeProvider`, so dashboard and wizard *chrome*
is unaffected. Affected surfaces are the eight `PublicWishlistPage` mount points —
`app/w/[slug]/page.tsx`, `app/w/[slug]/[guestSlug]/page.tsx`, wizard `theme-step` /
`images-step` / `layout-step` / `review-step`,
`dashboard/design/wishlist-design-editor.tsx`, `new-layouts.stories.tsx` — plus the
two swatch consumers above.

**No** database, Prisma schema, env var, API, or dependency changes.

## Non-Goals

- The shared public page header bar (isotype + "● Publicada" + "Compartir") — absent
  from the live page, present in every mock. Separate change.
- Any CollageStaggered geometry, wrapper, or layout work — that is
  `refine-collage-staggered-layout`, which should land after this.
- `--secondary` / `--secondary-foreground`: the design system has no secondary token
  (`.btn-out` is transparent + border, `.chip-on` is fg-on-bg). Existing values are
  hue-compatible tints of each theme and are retained deliberately.
- `PriorityBadge`: `high` already correctly uses the theme `accent`/`accent-foreground`
  pair per the handoff; `medium`/`low` have no design counterpart and stay as-is.
- Font, button-style, layout, and image-guidance presets.
