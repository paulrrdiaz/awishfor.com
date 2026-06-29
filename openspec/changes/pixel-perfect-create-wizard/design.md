## Context

The `/create` wizard (`src/app/create/page.tsx` → `WizardProvider` → `WizardShell`) renders five steps from `WIZARD_STEPS` (`event-type`, `details`, `design`, `gifts`, `publish`) selected by the `?step=` query param. Each step component (`event-type-step.tsx`, `details-step.tsx`, `design-step.tsx`, `gifts-step.tsx`, `publish-step.tsx`) is self-contained and reads/writes the Zustand draft store via `useWizardStore`.

Current state of the UI layer:
- Every step and the shell use **hardcoded Tailwind grays** (`bg-gray-50`, `text-gray-900`, `border-gray-200`, `text-red-500`, `text-green-600`) — the app theme tokens are never used.
- Inputs and buttons are **raw HTML elements** with bespoke classes, not the ShadCN primitives in `src/components/ui/` (`button.tsx`, `input.tsx`, `label.tsx`, `field.tsx`, `textarea.tsx`, `badge.tsx`, `separator.tsx`, `progress.tsx`, `select.tsx`).
- The step indicator is inline markup in `wizard-shell.tsx` (lines 76–116); a generic `StepProgress` exists in `src/components/shared/step-progress.tsx` but is vertical/3-col and not used here.
- Layout is a single `max-w-2xl` column (design step uses `max-w-5xl`), with a sticky bottom nav. There is no distinct desktop treatment and the mobile treatment is incidental rather than designed.

The app theme (`src/styles/globals.css`) already defines the full semantic token set in oklch, with a lime/chartreuse **primary** (`oklch(0.8871 0.2122 128.5041)`, matching the brand `#AFF33E`), soft-green **accent**, and `--radius: 1rem`. The shared component library (`src/components/shared/`) already consumes these tokens correctly — the wizard is the outlier.

Design source of truth: §4 of `docs/CLAUDE_DESIGN_PROMPT.md` ("Creation wizard — /create — 5 steps · app theme · mobile-first") and the Claude Design project `A Wish For.dc.html`. The `claude_design`/DesignSync MCP currently lists no accessible project for this session, so the §4 brief in `docs/CLAUDE_DESIGN_PROMPT.md` is the authoritative written reference; when DesignSync access is restored, the implementer SHOULD diff against `A Wish For.dc.html` before finalizing spacing/typography.

## Goals / Non-Goals

**Goals:**
- Make all five wizard steps + chrome pixel-match the §4 app-theme design.
- Use only app theme tokens — zero hardcoded `gray-*`/`red-*`/`green-*`/`amber-*` color utilities in wizard files (status colors map to `text-destructive`, `text-primary`/`accent-foreground`, `text-muted-foreground`).
- Use ShadCN primitives and shared components everywhere; create the missing primitives/components and register them in the design system with Storybook stories.
- Deliver deliberate, responsive **mobile-first and desktop** layouts for the shell and each step.
- Preserve 100% of existing wizard behavior and keep existing tests green.

**Non-Goals:**
- No changes to wizard routing, the Zustand store contract, tRPC procedures, Prisma schema, or env vars.
- No changes to the public wishlist preview component used inside the design step.
- No new wizard steps, fields, or copy changes beyond what the §4 brief already specifies (exact existing Spanish copy and slug/date warning strings are retained verbatim).
- Not redesigning the dashboard, marketing, or public pages.

## Decisions

### D1. Re-skin in place with theme tokens, don't rebuild
Each step component keeps its current structure and store wiring; only the JSX/markup and classes change. **Why:** the behavior, tests, and store integration are correct and well-tested — the defect is purely visual. Rebuilding risks regressions in slug-check, draft recovery, and publish/share flows for no benefit.
**Alternative rejected:** a ground-up wizard rewrite — higher risk, no behavioral upside.

### D2. Extract wizard chrome into shared components
Create three shared components consumed by `WizardShell`:
- `WizardLayout` (`src/components/shared/wizard-layout.tsx`) — the responsive page frame: header slot (stepper), scrollable content slot, sticky footer slot (nav). Owns the mobile-first → desktop responsive grid.
- `WizardStepper` (`src/components/shared/wizard-stepper.tsx`) — responsive step indicator. Mobile: compact "Paso N de 5" + a `Progress` bar (or condensed dots); desktop: full horizontal labeled stepper with done/active/upcoming states and click-to-jump for completed steps. Replaces the inline markup in `wizard-shell.tsx:76–116`.
- `WizardNav` (`src/components/shared/wizard-nav.tsx`) — the Back / Save-draft / Next sticky action bar, built from `Button`. Accepts `isFirst`/`isLast`/handlers and a slot for `SaveDraftControls`.

**Why shared, not feature-local:** these are presentational and reusable (the dashboard edit flows could reuse the stepper/nav), and the `design-system` spec mandates reusable, stateless presentational components live in `src/components/shared/`. Stateful logic (store access, routing) stays in `WizardShell`/steps per that same spec.
**Alternative rejected:** keep chrome inline in `wizard-shell.tsx` — leaves an untestable, unstoried blob and blocks reuse.

### D3. Add a ShadCN `Card` primitive
There is no `src/components/ui/card.tsx`; steps hand-roll `rounded-2xl border bg-white` cards. Add the standard ShadCN `Card`/`CardHeader`/`CardContent`/`CardFooter` primitive (theme-token based) and use it for gift cards, category panels, the design preview frame, and publish panels.
**Why:** removes repeated bespoke card markup and guarantees consistent radius/border/elevation from tokens.
**Alternative rejected:** a shared one-off card — duplicates what ShadCN's canonical primitive provides and breaks convention with the rest of `ui/`.

### D4. Responsive strategy — mobile-first, Tailwind breakpoints
Author base styles for mobile (single column, full-width controls, sticky compact stepper top + sticky nav bottom). Layer desktop at `md:`/`lg:`:
- Shell: content column widens (`lg:max-w-3xl` for form steps), stepper becomes a full horizontal labeled rail; nav buttons right-aligned.
- `design-step`: keep the two-column `lg:grid-cols-[320px_1fr]` selectors + live preview; on mobile, stack with the preview collapsible/below.
- `event-type-step`: `grid-cols-2 sm:grid-cols-3` cards → larger tap targets, token-based selected state (`bg-primary text-primary-foreground` / `border-primary`).
- Touch targets ≥ 44px on mobile; sticky bars respect safe-area insets.

**Why Tailwind breakpoints over JS:** zero runtime cost, matches the rest of the codebase, SSR-safe. **Alternative rejected:** a `useMediaQuery` JS split — hydration flicker and extra complexity.

### D5. Status color mapping
Slug states and date warning move from literal colors to tokens: `available` → `text-primary`/`text-accent-foreground` with `ring-ring`; `taken`/`invalid` → `text-destructive`; `checking`/hints → `text-muted-foreground`; past-date warning → `text-destructive` (or a `warning` token if one is added — see Open Questions). Keep the exact Spanish strings and the `✓ Disponible` green-ring affordance required by the `creation-wizard` spec, expressed with tokens.

### D6. Storybook coverage
Add stories for `Card`, `WizardLayout`, `WizardStepper`, `WizardNav`, mirroring existing patterns in `src/components/shared/*.stories.tsx`. The existing `wizard-states.stories.tsx` is updated to render through the new layout.

## Risks / Trade-offs

- **Existing tests reference current markup** (`publish-step.test.tsx`, `save-draft-controls.test.tsx`). → Update only the selectors that change; prefer role/label queries over class-based queries so future re-skins don't break them.
- **`✓ Disponible` green ring is spec-locked.** → Preserve the affordance via tokens; verify against the `creation-wizard` slug-availability scenarios so the delta stays compatible.
- **Pixel-perfect without live DesignSync access.** → Implement against the §4 written brief and app tokens; flag a follow-up to diff against `A Wish For.dc.html` once MCP access is available. Spacing/typography fidelity is the main exposure.
- **Design-step two-column preview on small screens** can feel cramped. → Stack preview below selectors on mobile and cap its height (existing `max-h-[600px] overflow-y-auto` pattern) so it never dominates the fold.
- **Theme-token migration could miss a hardcoded color.** → Add a check step: grep wizard files for `gray-|red-|green-|amber-|bg-white|text-white` and confirm only token utilities remain.

## Migration Plan

1. Add primitives/shared components (`Card`, `WizardLayout`, `WizardStepper`, `WizardNav`) + stories — additive, no behavior change.
2. Refactor `WizardShell` to compose the new chrome; verify routing/nav unchanged.
3. Re-skin steps one at a time (`event-type` → `details` → `design` → `gifts` → `publish`), running `pnpm test` after each.
4. Re-skin `save-draft-controls` and `recovery-prompt`.
5. Run `pnpm check`, `pnpm test`, `pnpm typecheck`; grep for residual hardcoded colors; visually verify mobile + desktop.

**Rollback:** revert the change branch; no data, schema, or API surface is touched, so rollback is purely a code revert.

## Open Questions

- Should a dedicated `warning`/`amber` semantic token be added to `globals.css` for the past-date warning, or is `text-destructive` acceptable? (Default: reuse `text-destructive` to avoid expanding the token set; revisit if the design calls for amber.)
- Mobile stepper: progress bar + "Paso N de 5" vs. condensed numbered dots — pick whichever matches `A Wish For.dc.html` when DesignSync access is restored. (Default: `Progress` bar + step label.)
