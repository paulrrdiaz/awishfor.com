## Why

The Claude Design brief (`Claude Design Output.md`) defines A Wish For's full visual system, but the repo is missing its foundation: there is no `src/components/shared/` design-system layer, no Storybook, no Lora serif, no scoped public-theme provider, and only six of the seven theme presets the brief specifies. Front-loading this foundation gives every downstream public, wizard, and dashboard surface a single source of truth and prevents per-screen visual drift.

## What Changes

- Align app theme tokens in `src/styles/globals.css` to the brief's app palette (warm near-white surface, deep-navy ink, lime-chartreuse primary used sparingly) without changing component structure.
- Add the `serif-soft` type system: **Lora** headings + **Inter** body via `next/font`, exposed as `--font-serif`/`--font-sans`, plus three font pairings (`serif-soft` default, `sans-modern`, `rounded-friendly`). Replaces `--font-serif: Georgia, serif`.
- Add a `PublicThemeProvider` that scopes preset CSS variables to a `.public-theme` wrapper via `data-theme` and inline styles, with a `--radius: 18px` public override; the dashboard `:root` theme is never affected.
- Ship **all seven** theme presets as typed `ThemePreset[]` in `src/config/public-themes.ts`, adding the new `cielo-suave-rosa` niña variant.
- Create `src/components/shared/` and migrate reusable presentational components (`gift-card`, `gift-grid`, `gift-list`, `countdown`, `how-it-works`, `progress-summary`, `wishlist-hero`, `wishlist-footer`) plus new DS pieces (`StatusBadge`, `PriorityBadge`, `MetricCard`, `EmptyState`, `SharePanel`, `StepProgress`). Stateful/domain components stay in `features/`.
- Stand up the **current stable Storybook + `@storybook/nextjs-vite`** for `shared/`: colocated `*.stories.tsx`, `globals.css` import, a public-theme toolbar, a11y + docs addons, and `pnpm storybook` / `pnpm build-storybook` scripts.

Non-goals: no freeform color picker or custom hex input; no square button style; no visual-regression/Chromatic; no stories for stateful `features/` components; no redesign of dashboard chrome beyond token alignment.

## Capabilities

### New Capabilities
- `design-system`: app/public token alignment, the `serif-soft` font system and pairings, `cn()`/`cva` conventions, the ShadCN-vs-custom boundary, and `src/components/shared/` as the home for reusable presentational design-system components.
- `storybook`: current stable Storybook with the recommended `@storybook/nextjs-vite` framework, colocated stories for `shared/`, Tailwind v4 token loading via `globals.css`, a public-theme toolbar, and a11y/docs addons.

### Modified Capabilities
- `public-theme-config`: add the seventh preset `cielo-suave-rosa` and formalize the `PublicThemeProvider` scoping contract (`.public-theme` wrapper, `data-theme`, `--radius: 18px`, dashboard `:root` untouched).

## Impact

- Code: `src/styles/globals.css`, `src/app/layout.tsx` (font registration), `src/config/public-themes.ts`, `src/config/public-fonts.ts`, `src/components/shared/**`, `src/components/layouts/public-wishlist/**`, `src/components/features/wishlist/**`, `src/app/w/[slug]/**`, `.storybook/**`, `package.json` (scripts + Storybook deps).
- Specs: new `design-system`, new `storybook`, modified `public-theme-config`.
- Dependencies: adds current stable Storybook + `@storybook/nextjs-vite` and addons (dev). Adds Lora via `next/font` (no runtime dep).
- Docs: mirrors Milestone 2 in `docs/TASKS.md`.
