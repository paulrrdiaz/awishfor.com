## Why

The creation wizard at `/create` is functionally complete but visually off-brand: every step is built with a hardcoded gray palette (`text-gray-900`, `bg-gray-50`, `border-gray-200`) and raw `<button>`/`<input>` elements instead of the app theme tokens and the ShadCN/shared component library the rest of the product uses. It does not match the §4 "Creation wizard — /create — 5 steps · app theme · mobile-first" design, and the layout is a single narrow column that is neither truly mobile-first nor optimized for desktop. This is the second-highest visual-priority surface in the brief, so it needs to be pixel-perfect now.

## What Changes

- Re-skin all five wizard steps (`event-type`, `details`, `design`, `gifts`, `publish`) and the wizard shell to the **app theme tokens** (`bg-background`, `text-foreground`, `bg-card`, `text-muted-foreground`, `border-border`, `bg-primary`, `bg-accent`, `ring`) — removing every hardcoded `gray-*`/`red-*`/`green-*` utility.
- Replace raw `<button>`/`<input>`/`<textarea>` markup with ShadCN primitives (`Button`, `Input`, `Label`, `Field`, `Textarea`, `Badge`, `Separator`, `Progress`) and shared components.
- Introduce a **responsive wizard chrome** with explicit desktop and mobile layouts: mobile-first single column with a sticky compact stepper + sticky action bar; desktop a wider, calmer layout (sidebar/progress stepper rail + roomier content column, two-column where the design brief calls for it).
- Add the **missing shared components** needed to do this cleanly to the design system: a `WizardLayout` shell, a `WizardStepper` (horizontal/responsive step indicator replacing the inline markup in `wizard-shell.tsx`), a `WizardNav` action bar, and a ShadCN `Card` primitive (`src/components/ui/card.tsx`) — all with Storybook stories.
- Keep all existing wizard behavior (routing, draft persistence, slug check, live preview, gift CRUD, publish/share) intact — this is a presentation-layer change, not a behavior change.

### Round 2 — pixel-match the now-available DesignSync canvas (desktop) + isotype wordmark

DesignSync access was unavailable when the above was implemented (see `design.md` D4/Open Questions), so the desktop layout was built as a wider version of the mobile full-bleed shell — a reasonable guess, not a match to the actual brief. DesignSync access is now available and the canvas (`A Wish For.dc.html`) contains five fully-specified desktop wizard frames (`Desktop Step 1`–`4` + `4b` edit-gift) that this round pixel-matches:

- **Desktop chrome is a centered card, not a full-bleed shell.** Replace the `lg:` desktop treatment of `WizardLayout`/`WizardStepper`/`WizardNav` with a `max-w-[1200px]` card (`bg-card`, `border-border`, `rounded-[18px]`, `overflow-hidden`) containing its own 58px logo header, in-card full stepper, a fixed-height two-pane content area per step, and an in-card footer nav — exactly as specified in the canvas frames. Mobile keeps the existing full-bleed sticky-bar shell (also corrected: the canvas mobile stepper is a 5-segment bar, `.wbar`/`.wseg`, not the continuous `Progress` bar currently used).
- **Add the `isotype.svg` wordmark** (`public/assets/isotype.svg`, already used in `app-sidebar.tsx`) to the desktop wizard header, paired with the "A Wish For" serif wordmark — matching every desktop canvas frame exactly. Not present in the mobile chrome (the canvas mobile frames never show it in the wizard bar).
- **Step-by-step desktop content**, per canvas: Step 1 fixed 540px form pane + suggested-design preview pane; Step 2 fixed 520px form pane + live header preview pane; Step 3 fixed 420px selector pane + live scoped-theme preview on a `#E6EBF0` backdrop; Step 4 fixed 520px importer/gift-list pane + guest-view preview pane; Step 4b (edit-gift) as a 380px image/name pane + price/qty/category pane. Step 5 (Publish & Share) has no desktop canvas frame — extrapolate the same card chrome with a single centered pane, consistent with the pattern.
- Finishes the previously-open task 4.4 (visual verification), now verifiable against real reference frames instead of the written brief alone.

## Capabilities

### New Capabilities
<!-- none — wizard and design-system already exist as capabilities -->

### Modified Capabilities
- `creation-wizard`: add requirements that the wizard SHALL render with app theme tokens and ShadCN/shared primitives (no hardcoded color utilities), and SHALL provide distinct, pixel-perfect mobile-first and desktop responsive layouts for the shell and every step.
- `design-system`: add the new shared wizard chrome components (`WizardLayout`, `WizardStepper`, `WizardNav`) and the ShadCN `Card` primitive to the shared component layer, each with stories.

## Impact

- **Code (re-skin):** `src/components/features/wizard/wizard-shell.tsx`, `event-type-step.tsx`, `details-step.tsx`, `design-step.tsx`, `gifts-step.tsx`, `publish-step.tsx`, `save-draft-controls.tsx`, `recovery-prompt.tsx`.
- **Code (new components):** `src/components/ui/card.tsx`; `src/components/shared/wizard-layout.tsx`, `wizard-stepper.tsx`, `wizard-nav.tsx` (plus `.stories.tsx`).
- **Code (round 2 — desktop card chrome):** `wizard-layout.tsx` (new `lg:` card-frame branch), `wizard-stepper.tsx` (desktop circle/line spec + mobile segmented `.wbar` spec), `wizard-nav.tsx` (in-card footer variant), plus a wordmark element (isotype + "A Wish For") in the desktop header, reusing the asset already wired in `app-sidebar.tsx:101`.
- **Tests:** existing `publish-step.test.tsx`, `save-draft-controls.test.tsx`, `wizard-steps.test.ts` must continue to pass; update only selectors that change.
- **No changes** to tRPC routers, Prisma schema, env vars, the Zustand store contract, or the public wishlist preview.
- **Design reference:** §4 of `docs/CLAUDE_DESIGN_PROMPT.md`; DesignSync canvas `A Wish For.dc.html`, frames `Desktop Step 1`–`4`, `Desktop Step 4b`, and mobile `Step 1` (`.wbar`/`.wseg`).
