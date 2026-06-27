## Context

The repo already runs shadcn (`base-nova`) + Tailwind v4 with tokens inline in `src/styles/globals.css` (`@theme` + `:root`/`.dark`), and `components.json` aliases `@/components`, `@/components/ui`, `@/lib`, `@/hooks`. Public wishlist UI exists under `src/components/features/wishlist/*` and `src/components/layouts/public-wishlist/*`, but there is no `shared/` layer, no Storybook, no Lora serif (`--font-serif` is Georgia), and the theme config ships six presets. The Claude Design brief (`Claude Design Output.md`) is the visual source of truth and specifies seven presets, a Lora-based `serif-soft` type system, and a `.public-theme`-scoped provider. This change builds that foundation; downstream milestones in `docs/TASKS.md` depend on it.

## Goals / Non-Goals

**Goals:**
- App tokens match the brief without structural component churn.
- A Lora-based `serif-soft` font system with three switchable pairings.
- A `PublicThemeProvider` that scopes seven presets to `.public-theme` (`data-theme`, `--radius:18px`) and never touches the dashboard `:root`.
- A `src/components/shared/` design-system layer with migrated reusable components and colocated Storybook stories.
- Current stable Storybook (`@storybook/nextjs-vite`) with token loading, a public-theme toolbar, and a11y/docs addons.

**Non-Goals:**
- Freeform color pickers / custom hex; square button style.
- Visual-regression / Chromatic.
- Stories for stateful `features/` components.
- Dashboard chrome redesign beyond token alignment.

## Decisions

- **Scoped vars via inline styles on `.public-theme`, not class-per-theme.** Tailwind v4 `@theme inline` already maps `--color-*` → `var(--*)`, so writing a preset's vars onto one wrapper makes every semantic utility (`bg-background`, etc.) resolve to the active theme with zero per-theme class names. Alternative — generating a class per theme — was rejected as redundant given the existing inline mapping and harder to keep in sync.
- **Framework: `@storybook/nextjs-vite` on the current stable Storybook release.** Official Storybook docs recommend the Vite-based Next.js framework for most Next.js projects because it is faster, more modern, simpler to configure, and has better test support. Alternative `@storybook/nextjs` (webpack) remains available only for projects that need custom Webpack/Babel compatibility; this repo has no such requirement.
- **Toolbar theming through `globalTypes` + decorator in `.storybook/preview`.** Official Storybook docs define toolbar controls as globals configured in preview and consumed by decorators, so the public-theme toolbar should set a `theme` global and wrap stories in `PublicThemeProvider`.
- **Migration boundary = presentational vs stateful.** Move reusable, theme-driven, view-model-prop components into `shared/`; keep modals/forms/wizard/dashboard tables in `features/`. This keeps `shared/` Storybook-friendly (no data fetching) and matches the brief's component inventory.
- **`@/components/shared/*` alias.** Reuse the existing `@/components` base alias from `components.json`; no new alias entry required.
- **Fonts via `next/font` tokens, pairing via wrapper data-attribute.** Keeps font switching declarative and SSR-safe; pairings live in `src/config/public-fonts.ts`.
- **`cn()` + `cva` for variants.** `GiftCard` status variants (`available|partial|purchased|hidden`) are the canonical example.

## Risks / Trade-offs

- [Import churn from the `shared/` migration breaks builds] → Move components one at a time, update imports across `layouts/public-wishlist/*`, `app/w/[slug]/*`, wizard preview, and marketing demo; gate with `pnpm typecheck` + `pnpm check`.
- [Token alignment shifts dashboard visuals unexpectedly] → Alignment is colors/shape only; verify dashboard renders unchanged structurally and dark mode stays coherent.
- [Storybook + Tailwind v4 + Next 16/React 19 version friction] → Use the current stable Storybook release with `@storybook/nextjs-vite`; load tokens via `globals.css` import; keep stories to presentational components to avoid unnecessary Next runtime dependencies.
- [`next/font` Lora swap regresses serif rendering] → Replace `--font-serif` token centrally in `globals.css` and verify serif moments across themes.

## Migration Plan

1. Align app tokens in `globals.css` (no component edits).
2. Add Lora + pairings (`public-fonts.ts`, layout font registration); replace `--font-serif`.
3. Add `public-themes.ts` (seven presets incl. `cielo-suave-rosa`) + `PublicThemeProvider`; wire into `PublicWishlistPage`.
4. Create `shared/`, migrate components incrementally, fix imports, add new DS pieces.
5. Add Storybook config + colocated stories + scripts.
6. Validate: `pnpm typecheck`, `pnpm check`, `pnpm test`, `pnpm storybook` boots, public page renders all seven themes, dashboard unaffected.

Rollback: revert per-step commits; the migration is additive until import paths flip, so partial revert is safe.

## Open Questions

- None blocking. Exact preset hex values come verbatim from brief §7.
