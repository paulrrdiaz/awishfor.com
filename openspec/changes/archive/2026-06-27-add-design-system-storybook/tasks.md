## 1. App token alignment

- [x] 1.1 Align app `:root` tokens in `src/styles/globals.css` to the brief app theme (warm near-white surface, deep-navy ink, lime-chartreuse primary).
- [x] 1.2 Confirm `--radius` app scale and shadow/border scale match the brief.
- [x] 1.3 Verify dark-mode variants remain coherent after alignment.
- [x] 1.4 Document the app tokens that public themes must not override.

## 2. Serif-soft font system

- [x] 2.1 Load **Lora** via `next/font` and expose `--font-serif`; confirm **Inter** as `--font-sans`.
- [x] 2.2 Replace `--font-serif: Georgia, serif` in `globals.css` with the Lora token.
- [x] 2.3 Add `src/config/public-fonts.ts` with `serif-soft` (default), `sans-modern`, `rounded-friendly` pairings.
- [x] 2.4 Apply font pairing via a wrapper data-attribute (no per-element classes); add default fallback.

## 3. Public theme provider and presets

- [x] 3.1 Add `src/config/public-themes.ts` as typed `ThemePreset[]` with all seven presets, including the new `cielo-suave-rosa`.
- [x] 3.2 Add `PublicThemeProvider` writing preset vars as inline styles to a `.public-theme` wrapper with `data-theme` and `--radius: 18px`.
- [x] 3.3 Wire `PublicThemeProvider` into `PublicWishlistPage`.
- [x] 3.4 Confirm semantic utilities resolve per theme via Tailwind v4 `@theme inline`; verify dashboard `:root` is untouched.

## 4. Shared component layer

- [x] 4.1 Create `src/components/shared/` (reachable via `@/components/shared/*`).
- [x] 4.2 Migrate presentational components into `shared/`: `gift-card`, `gift-grid`, `gift-list`, `countdown`, `how-it-works`, `progress-summary`, `wishlist-hero`, `wishlist-footer`.
- [x] 4.3 Update import paths across `layouts/public-wishlist/*`, `app/w/[slug]/*`, wizard preview, and marketing demo.
- [x] 4.4 Add new DS pieces: `StatusBadge`, `PriorityBadge`, `MetricCard`, `EmptyState`, `SharePanel`, `StepProgress`.
- [x] 4.5 Express `GiftCard` status variants (`available|partial|purchased|hidden`) with `cva` + `cn()`.
- [x] 4.6 Confirm stateful/domain components remain in `features/` (purchase modal, filters, gift-form, image-upload, wizard, dashboard).

## 5. Storybook

- [x] 5.1 Install and configure current stable Storybook + `@storybook/nextjs-vite`.
- [x] 5.2 Import `src/styles/globals.css` in `.storybook/preview`.
- [x] 5.3 Add a public-theme toolbar via `globalTypes`/`initialGlobals` and a decorator covering all seven presets via `data-theme`.
- [x] 5.4 Enable a11y and docs addons.
- [x] 5.5 Add colocated `*.stories.tsx` for every `shared/` component, covering key variants/states (incl. `GiftCard` available/partial/purchased/hidden).
- [x] 5.6 Add `pnpm storybook` and `pnpm build-storybook` scripts.

## 6. Validation

- [x] 6.1 Run `pnpm typecheck` and `pnpm check`; fix issues.
- [x] 6.2 Run `pnpm test`.
- [x] 6.3 Boot `pnpm storybook`; verify shared stories and the theme toolbar.
- [x] 6.4 Verify the public page renders all seven themes via `data-theme` and the dashboard is visually unaffected.
