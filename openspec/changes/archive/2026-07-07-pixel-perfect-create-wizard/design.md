## Context

The `/create` wizard (`src/app/create/page.tsx` → `WizardProvider` → `WizardShell`) renders five steps from `WIZARD_STEPS` (`event-type`, `details`, `design`, `gifts`, `publish`) selected by the `?step=` query param. Each step component (`event-type-step.tsx`, `details-step.tsx`, `design-step.tsx`, `gifts-step.tsx`, `publish-step.tsx`) is self-contained and reads/writes the Zustand draft store via `useWizardStore`.

Current state of the UI layer:
- Every step and the shell use **hardcoded Tailwind grays** (`bg-gray-50`, `text-gray-900`, `border-gray-200`, `text-red-500`, `text-green-600`) — the app theme tokens are never used.
- Inputs and buttons are **raw HTML elements** with bespoke classes, not the ShadCN primitives in `src/components/ui/` (`button.tsx`, `input.tsx`, `label.tsx`, `field.tsx`, `textarea.tsx`, `badge.tsx`, `separator.tsx`, `progress.tsx`, `select.tsx`).
- The step indicator is inline markup in `wizard-shell.tsx` (lines 76–116); a generic `StepProgress` exists in `src/components/shared/step-progress.tsx` but is vertical/3-col and not used here.
- Layout is a single `max-w-2xl` column (design step uses `max-w-5xl`), with a sticky bottom nav. There is no distinct desktop treatment and the mobile treatment is incidental rather than designed.

The app theme (`src/styles/globals.css`) already defines the full semantic token set in oklch, with a lime/chartreuse **primary** (`oklch(0.8871 0.2122 128.5041)`, matching the brand `#AFF33E`), soft-green **accent**, and `--radius: 1rem`. The shared component library (`src/components/shared/`) already consumes these tokens correctly — the wizard is the outlier.

Design source of truth: §4 of `docs/CLAUDE_DESIGN_PROMPT.md` ("Creation wizard — /create — 5 steps · app theme · mobile-first") and the Claude Design project `A Wish For.dc.html`.

**Update — DesignSync access restored.** The canvas is now readable via the `DesignSync` MCP (`get_file` on project `10380ffb-0586-4cc7-aa3b-862f4fb0ab17`). It contains five fully-specified desktop wizard frames — `Desktop Step 1` (Event Type), `Desktop Step 2` (Details + slug), `Desktop Step 3` (Design & live preview), `Desktop Step 4` (Gifts), `Desktop Step 4b` (Edit gift) — plus a mobile `Step 1` frame showing the actual mobile stepper markup. Round 1 (below, D1–D6) was built against the written §4 brief only, without these frames, and got the desktop shell shape wrong (full-bleed wide shell instead of a centered card) and the mobile stepper wrong (continuous `Progress` bar instead of a segmented bar). See **D7/D8** for the corrected, canvas-sourced spec — D7/D8 supersede the desktop/mobile-stepper parts of D2/D4/D6 below; D1, D3, D5 (re-skin-in-place, `Card` primitive, status-color-token mapping) are unaffected and still hold.

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
Add stories for `Card`, `WizardLayout`, `WizardStepper`, `WizardNav`, mirroring existing patterns in `src/components/shared/*.stories.tsx`. The existing `wizard-states.stories.tsx` is updated to render through the new layout. **Update:** add a `lg` desktop-chrome story per D7 and a mobile segmented-bar story per D8.

### D7. Desktop chrome is a centered card, not a wider full-bleed shell
The canvas's `Desktop Step 1`–`4`/`4b` frames are **not** a scaled-up version of the mobile sticky-header/sticky-footer shell — they're a self-contained `1200px`-wide card floating on the app background, with its own header, stepper, and footer *inside* the card border. This replaces the `lg:` branch of D2/D4's "wider full-bleed shell" assumption. Exact spec, transcribed from the canvas (`var(--a*)` tokens map 1:1 to this repo's existing semantic tokens: `--apri`→`--primary`, `--aprifg`→`--primary-foreground`, `--abg`→`--background`, `--acard`→`--card`, `--abord`→`--border`, `--afg`→`--foreground`, `--amut`→`--muted-foreground`):

**Card shell** (`lg:` and up): `max-w-[1200px]` centered, `bg-card`, `border border-border`, `rounded-[18px]`, `overflow-hidden`. Sits on the plain `bg-background` page (no page-level sticky bars at this breakpoint — everything lives inside the card).

**Header** (58px tall, `px-9`, `bg-white`/`bg-card`, `border-b border-border`): left — `isotype.svg` (`h-[26px] w-auto`) + `A Wish For` in `font-serif text-lg font-bold`, `gap-[7px]`; right (`flex-1` spacer between) — outline "Guardar borrador" button (`text-[13px] px-[18px] py-2`).

**Stepper** (centered, `px-10 py-[18px]`, `bg-white`, `border-b border-border`): five nodes, each a 26px circle + label + a 56px×2px connector (except after the last node). Per-node state:
  - *upcoming*: `bg-white border-2 border-border text-muted-foreground`, shows the number.
  - *active*: `bg-primary border-2 border-primary text-primary-foreground`, `font-bold`, shows the number; label `text-foreground font-bold`.
  - *done*: `bg-[#EAF6EE] border-2 border-[#2E7D4F] text-[#2E7D4F]`, shows a checkmark; label `text-[#2E7D4F] font-semibold`; the connector immediately **after** a done node is `bg-[#C3E63E]` (lime), all other connectors `bg-border`.
  Labels: Ocasión · Detalles · Diseño · Regalos · Publicar (font-size 12px throughout).

**Content** (`flex`, fixed height `500px` for steps 1–3, `520px` for step 4/4b): a fixed-width left pane (`border-r border-border`, `overflow-auto` on steps 3/4) + a `flex-1` right pane. Left pane width and right-pane treatment vary per step — see the per-step table below. Both panes share `padding: 36px 40px` on steps 1–2 and `28px 32px` on steps 3–4/4b.

**Footer nav** (`flex justify-between` — or `justify-end` on step 1, which has no Back — `px-9 py-4`, `bg-white`, `border-t border-border`): outline "← Atrás" button (omitted step 1) + primary "Continuar →" button (`px-8 py-[13px]`).

**Per-step content pane spec:**

| Step | Left pane | Right pane |
|---|---|---|
| 1 · Event Type | 540px. "Paso 1 de 5" eyebrow, serif H2 "¿Qué vas a celebrar?", helper line, `3×2` grid of 6 event-type cards (emoji + label + seeded theme name; selected = `border-primary` + `shadow-[0_0_0_2px_var(--primary)]`) | `flex-1`, `bg-background`. "Diseño inicial sugerido" eyebrow + a live scoped-theme preview card (compact hero + one sample gift row) + a one-line hint referencing "paso 3" |
| 2 · Details + slug | 520px. "Paso 2 de 5" eyebrow, serif H2 "Cuéntanos del evento", Título/Anfitriones/Fecha fields (`.afield`-style static-looking inputs), past-date warning callout (amber bg, not destructive-red), then the slug field (`awishfor.com/w/` prefix + editable slug segment) with the `✓ Disponible` green-ring affordance | `flex-1`, `bg-background`. "Vista previa del encabezado" eyebrow + a live scoped hero preview (eyebrow/serif title/host line/date/countdown pill) |
| 3 · Design & preview | 420px, `overflow-auto`. "Paso 3 de 5" eyebrow, serif H2 "Diseña tu página", theme swatch row (6 tappable color chips), layout segmented control (Editorial/Galería/Minimal), a 2-col grid for tipografía/botones selects, cover-photo dropzone | `flex-1`, **`bg-[#E6EBF0]`** (distinct cool-gray backdrop, not `bg-background`), padding `24px 28px`. "Vista previa en vivo" eyebrow + a live "en vivo" pill + the full scoped-theme preview card (cover photo, hero, 2-col gift grid) |
| 4 · Gifts | 520px, `overflow-auto`. "Paso 4 de 5" eyebrow, serif H2 "Agrega tus regalos", URL paste-and-import row, suggested-list chips, "Tus regalos · N" eyebrow + reorderable gift rows (drag handle, thumb, name, store·price, Editar, ×) + dashed "+ Agregar regalo manualmente" card | `flex-1`, `bg-background`. "Así los verán tus invitados" eyebrow + a 2-col guest-view gift-card preview grid |
| 4b · Edit gift | 380px. Large product-photo panel with hover "Cambiar imagen"/"Eliminar" overlay actions, Nombre field, Enlace field + refresh-icon button | `flex-1`, `bg-background`. 2-col Precio/Cantidad row (stepper control), 2-col Categoría/Prioridad row. A green "✓ Datos obtenidos de {store}" confirmation banner spans full width above the two panes when the gift was URL-imported |
| 5 · Publish & share | *No desktop canvas frame exists.* Extrapolate: same card chrome (header/stepper/footer), single centered pane (not two-pane) holding the final preview + publish readiness checklist + (post-publish) the share panel, capped at a comfortable reading width inside the 1200px card |

**Why a card, not a wider shell:** this is what the canvas actually specifies — verified directly, not inferred. Building the D2/D4 guess (wider full-bleed shell) further would still fail Open Question review against real artwork.
**Alternative rejected:** keep the D2/D4 guess and treat this as acceptable drift — rejected because the proposal's explicit goal is pixel-perfect matching and the reference is now available.

### D8. Mobile stepper is a segmented bar, not a continuous `Progress` fill
The canvas's mobile `Step 1` frame shows the mobile stepper chrome as `.wbar` (`flex`, `gap:8px`, `padding:14px 16px`, `bg-white`, `border-b border-border`) containing five `.wseg` segments (`height:4px`, `flex:1`, `rounded-full`, default `bg-border`, filled segments `bg-primary`) — a **discrete 5-segment bar**, not the shadcn `Progress` continuous-fill bar currently used, and it carries **no "Paso N de 5" text** in the sticky chrome (that caption lives inside each step's own content pane, both mobile and desktop, as the eyebrow above the step's H2 — it's content, not chrome). Update `WizardStepper`'s mobile (`<lg`) branch to render 5 static segments keyed by `currentIndex`/`completedSteps` instead of `<Progress value={progressValue}>`; move any "Paso N de 5"-style caption out of the sticky stepper and into each step body if not already there.
**Why:** matches the canvas exactly; a segmented bar also reads more clearly as "5 discrete steps" than a continuous percentage fill, consistent with the desktop stepper's discrete nodes.
**Alternative rejected:** keep `Progress` with a resegmented visual layered on top — more code for a worse match than just rendering 5 divs.

## Risks / Trade-offs

- **Existing tests reference current markup** (`publish-step.test.tsx`, `save-draft-controls.test.tsx`). → Update only the selectors that change; prefer role/label queries over class-based queries so future re-skins don't break them.
- **`✓ Disponible` green ring is spec-locked.** → Preserve the affordance via tokens; verify against the `creation-wizard` slug-availability scenarios so the delta stays compatible.
- ~~**Pixel-perfect without live DesignSync access.**~~ **Resolved** — DesignSync access is now available; D7/D8 are transcribed directly from the canvas frames, not inferred from the written brief. Spacing/typography fidelity is now verifiable against the source of truth.
- **Design-step two-column preview on small screens** can feel cramped. → Stack preview below selectors on mobile and cap its height (existing `max-h-[600px] overflow-y-auto` pattern) so it never dominates the fold.
- **Theme-token migration could miss a hardcoded color.** → Add a check step: grep wizard files for `gray-|red-|green-|amber-|bg-white|text-white` and confirm only token utilities remain. Note D7 intentionally introduces a small number of literal hex values (`#EAF6EE`/`#2E7D4F`/`#C3E63E` done-state, `#E6EBF0` step-3 backdrop) that are **canvas-specified, not accidental** — these are exempt from the grep check; everything else must stay token-based.
- **Desktop card chrome (D7) is a bigger structural change than the original re-skin-in-place scope (D1).** → Still additive at the component level: `WizardLayout`/`WizardStepper`/`WizardNav` grow a `lg:` card-frame rendering path; step components keep their existing store wiring and mostly restructure their JSX into the left/right pane shape the canvas specifies. Test selectors most likely to move: anything asserting on the old sticky-bar DOM structure at desktop width.
- **No desktop canvas frame for Step 5 (Publish & Share).** → Extrapolated per D7's table (same chrome, single centered pane). Flag this explicitly in `pnpm storybook`/manual QA as "extrapolated, not canvas-verified" so a future design pass can confirm it if a frame is ever added.

## Migration Plan

1. Add primitives/shared components (`Card`, `WizardLayout`, `WizardStepper`, `WizardNav`) + stories — additive, no behavior change.
2. Refactor `WizardShell` to compose the new chrome; verify routing/nav unchanged.
3. Re-skin steps one at a time (`event-type` → `details` → `design` → `gifts` → `publish`), running `pnpm test` after each.
4. Re-skin `save-draft-controls` and `recovery-prompt`.
5. Run `pnpm check`, `pnpm test`, `pnpm typecheck`; grep for residual hardcoded colors; visually verify mobile + desktop.
6. **(Round 2)** Rebuild the `lg:` branch of `WizardLayout`/`WizardStepper`/`WizardNav` as the D7 card chrome; add the isotype wordmark to the desktop header.
7. **(Round 2)** Rebuild the mobile branch of `WizardStepper` as the D8 segmented bar; relocate any "Paso N de 5" caption into step content if it's currently in the sticky chrome.
8. **(Round 2)** Restructure each step's desktop JSX into the D7 per-step left/right pane spec (fixed-width left pane + `flex-1` right pane), reusing existing store wiring and mobile JSX untouched.
9. **(Round 2)** Build the extrapolated Step 5 desktop pane; run `pnpm check`/`pnpm test`/`pnpm typecheck`; visually verify all 5 steps at mobile (390px) and desktop (1200px+) against the actual canvas frames (not just the written brief).

**Rollback:** revert the change branch; no data, schema, or API surface is touched, so rollback is purely a code revert.

## Open Questions

- Should a dedicated `warning`/`amber` semantic token be added to `globals.css` for the past-date warning, or is `text-destructive` acceptable? The canvas's Step 2 past-date callout actually uses a literal amber (`#FBF1DC` bg / `#F0DBA8` border / `#8A6512` text), distinct from destructive-red — so this should probably become a real `warning` token rather than reusing `text-destructive`. (Default: add `--warning`/`--warning-foreground` tokens if the implementer judges the amber callout important enough to formalize; otherwise a scoped literal-color exemption per D7's risk note is acceptable.)
- ~~Mobile stepper: progress bar vs. condensed dots~~ **Resolved by D8** — segmented bar (`.wbar`/`.wseg`), 5 discrete segments, no inline "Paso N de 5" text in the chrome.
