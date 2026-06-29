## Why

The creation wizard at `/create` is functionally complete but visually off-brand: every step is built with a hardcoded gray palette (`text-gray-900`, `bg-gray-50`, `border-gray-200`) and raw `<button>`/`<input>` elements instead of the app theme tokens and the ShadCN/shared component library the rest of the product uses. It does not match the §4 "Creation wizard — /create — 5 steps · app theme · mobile-first" design, and the layout is a single narrow column that is neither truly mobile-first nor optimized for desktop. This is the second-highest visual-priority surface in the brief, so it needs to be pixel-perfect now.

## What Changes

- Re-skin all five wizard steps (`event-type`, `details`, `design`, `gifts`, `publish`) and the wizard shell to the **app theme tokens** (`bg-background`, `text-foreground`, `bg-card`, `text-muted-foreground`, `border-border`, `bg-primary`, `bg-accent`, `ring`) — removing every hardcoded `gray-*`/`red-*`/`green-*` utility.
- Replace raw `<button>`/`<input>`/`<textarea>` markup with ShadCN primitives (`Button`, `Input`, `Label`, `Field`, `Textarea`, `Badge`, `Separator`, `Progress`) and shared components.
- Introduce a **responsive wizard chrome** with explicit desktop and mobile layouts: mobile-first single column with a sticky compact stepper + sticky action bar; desktop a wider, calmer layout (sidebar/progress stepper rail + roomier content column, two-column where the design brief calls for it).
- Add the **missing shared components** needed to do this cleanly to the design system: a `WizardLayout` shell, a `WizardStepper` (horizontal/responsive step indicator replacing the inline markup in `wizard-shell.tsx`), a `WizardNav` action bar, and a ShadCN `Card` primitive (`src/components/ui/card.tsx`) — all with Storybook stories.
- Keep all existing wizard behavior (routing, draft persistence, slug check, live preview, gift CRUD, publish/share) intact — this is a presentation-layer change, not a behavior change.

## Capabilities

### New Capabilities
<!-- none — wizard and design-system already exist as capabilities -->

### Modified Capabilities
- `creation-wizard`: add requirements that the wizard SHALL render with app theme tokens and ShadCN/shared primitives (no hardcoded color utilities), and SHALL provide distinct, pixel-perfect mobile-first and desktop responsive layouts for the shell and every step.
- `design-system`: add the new shared wizard chrome components (`WizardLayout`, `WizardStepper`, `WizardNav`) and the ShadCN `Card` primitive to the shared component layer, each with stories.

## Impact

- **Code (re-skin):** `src/components/features/wizard/wizard-shell.tsx`, `event-type-step.tsx`, `details-step.tsx`, `design-step.tsx`, `gifts-step.tsx`, `publish-step.tsx`, `save-draft-controls.tsx`, `recovery-prompt.tsx`.
- **Code (new components):** `src/components/ui/card.tsx`; `src/components/shared/wizard-layout.tsx`, `wizard-stepper.tsx`, `wizard-nav.tsx` (plus `.stories.tsx`).
- **Tests:** existing `publish-step.test.tsx`, `save-draft-controls.test.tsx`, `wizard-steps.test.ts` must continue to pass; update only selectors that change.
- **No changes** to tRPC routers, Prisma schema, env vars, the Zustand store contract, or the public wishlist preview.
- **Design reference:** §4 of `docs/CLAUDE_DESIGN_PROMPT.md` (Claude Design project — `A Wish For.dc.html`).
