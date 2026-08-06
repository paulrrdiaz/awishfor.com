## 1. Token contract

- [x] 1.1 Add `"--ph-tint": string` to `ThemePresetVars` in `src/config/public-themes.ts`
- [x] 1.2 Add `--color-ph-tint: var(--ph-tint);` to the `@theme inline` block in `src/styles/globals.css`

## 2. Sync the seven presets

Design source: theme classes in `PublicWishlistPages.dc.html` (`.theme-cielo`, `.theme-rosa`, `.theme-verde`, `.theme-cielorosa`, `.theme-crema`, `.theme-lavanda`, `.theme-clasico`), cross-checked against the token table in `design_handoff_public_wishlist_page/README.md`. Per preset, transcribe `--background`, `--foreground`, `--card`, `--card-foreground`, `--primary`, `--primary-foreground`, `--accent`, `--accent-foreground`, `--muted`, `--muted-foreground`, `--border`, `--ph-tint` literally; derive `--popover`←`--card`, `--popover-foreground`←`--card-foreground`, `--input`←`--border`, `--ring`←`--primary`; leave `--secondary` / `--secondary-foreground` untouched (design.md D2, D3).

- [x] 2.1 `cielo-suave` ← `.theme-cielo` (primary `#8FBEE0` / fg `#1B2A40`, tonal accent `#DCEAF6` / fg `#496781`, ph-tint `#DCEAF6`)
- [x] 2.2 `dulce-rosa` ← `.theme-rosa` (primary `#E2A0B3` / fg `#4A2531`, tonal accent `#F5E3E9` / fg `#815064`, ph-tint `#F2DCE2`)
- [x] 2.3 `cielo-suave-rosa` ← `.theme-cielorosa` (primary `#E6A6BC` / fg `#4A2533`, tonal accent `#F5E2E9` / fg `#85556A`, ph-tint `#F2DDE6`)
- [x] 2.4 `jardin-verde` ← `.theme-verde` (primary `#9CC4A0` / fg `#22382A`, tonal accent `#DFEEDD` / fg `#4F6B54`, ph-tint `#DDE9DA`)
- [x] 2.5 `crema-elegante` ← `.theme-crema` (primary `#BFA06B` / fg `#332B18`, tonal accent `#EDE3D2` / fg `#6E5B38`, ph-tint `#EBE1CE`)
- [x] 2.6 `lavanda-fiesta` ← `.theme-lavanda` (primary `#B79CE0` / fg `#2C2342`, tonal accent `#EBE3F5` / fg `#62537A`, ph-tint `#E6DBF5`)
- [x] 2.7 `clasico-minimal` ← `.theme-clasico` (primary `#2A2A28` / fg `#FFFFFF`, accent `#EFEFEC`, ph-tint `#ECECE8`)
- [x] 2.8 Update each preset's `preview` block so `background`/`primary`/`accent` mirror its new `vars`

## 3. Consumers

- [x] 3.1 `HeroPlaceholder` in `src/components/shared/hero-gallery.tsx`: `bg-accent/50` → `bg-ph-tint`
- [x] 3.2 `src/components/shared/status-badge.tsx`: replace theme-derived variants with the fixed pairs — available `#E4F3E8`/`#2F7D43`, partial `#FBF1DC`/`#9A6F1E`, purchased `#EAECEF`/`#71798A`; keep `hidden` on the muted pair (dashboard-only, no design counterpart)
- [x] 3.3 Leave `src/components/shared/priority-badge.tsx` unchanged — `high` already uses the accent pair per the handoff (verify only)
- [x] 3.4 `src/components/layouts/marketing/theme-previews.tsx`: re-tune `mixWithWhite(selectedTheme.preview.primary, 0.35)` so pastel primaries stay distinguishable from the preview background
- [x] 3.5 `src/styles/marketing.css`: align `.m-preview-theme` values with the synced `cielo-suave` and add a comment naming `public-themes.ts` as its source of truth (design.md D6)

## 4. Tests

- [x] 4.1 Create `src/config/public-themes.test.ts` with the design token table as a literal fixture
- [x] 4.2 Assert per preset that the eleven design-defined tokens match the fixture case-insensitively
- [x] 4.3 Assert the D2 derivations hold: `--popover`=`--card`, `--popover-foreground`=`--card-foreground`, `--input`=`--border`, `--ring`=`--primary`
- [x] 4.4 Assert every preset defines a non-empty `--ph-tint`
- [x] 4.5 Assert `preview.background`/`primary`/`accent` equal the corresponding `vars`
- [x] 4.6 Add a local relative-luminance + contrast-ratio helper (no new dependency) and assert both foreground-on-background and primary-foreground-on-primary clear 4.5:1 for all seven presets
- [x] 4.6a Assert accent-foreground-on-accent also clears 4.5:1 for all seven presets
- [x] 4.7 Run `pnpm test` and confirm no existing suite regressed — `public-layouts.test.ts`, `draft-to-preview.test.ts`, `publish-readiness.test.ts`, `review-step.test.tsx`, `example-preview.test.tsx`

## 5. Verify

- [x] 5.1 `pnpm check` and `pnpm typecheck` pass
- [x] 5.2 Compare `http://localhost:4000/w/baby-shower-de-noah` (`cielo-suave` + `collage-staggered`) against block 04 of `PublicWishlistPages.dc.html`; colours should now match even though geometry will not (that is `refine-collage-staggered-layout`)
- [x] 5.3 Load a wishlist with zero cover images and confirm empty hero slots render on the neutral placeholder tint, not a wash of accent
- [x] 5.4 Open the wizard theme step and the dashboard design editor; confirm swatches match the pages they produce
- [x] 5.5 Check the marketing landing themes section — the seven swatches and the selected preview
- [x] 5.6 Spot-check the nine `new-layouts.stories.tsx` stories for unintended regressions
