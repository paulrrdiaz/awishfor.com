## Why

The design-system foundation (Milestone 2) shipped shared presentational components, the seven scoped themes, the Lora type system, and a Storybook for `src/components/shared/`. But the Claude Design canvas defines richer component states that the codebase does not yet treat as first-class design-system artifacts: the `PurchaseGiftModal` only implements `form | success` (the canvas specifies six states), the stateful product components (purchase modal, wizard steps, dashboard states) have zero Storybook coverage, several ShadCN primitives the canvas relies on are missing, and GSAP motion exists only on the marketing route. This change closes the gap so every component state shown in the canvas is a documented, ShadCN-first, animated, story-covered part of the design system.

## What Changes

- Establish a component-authoring priority across the design system: **ShadCN/Base UI primitive first, raw TailwindCSS as fallback, GSAP for motion/"good vibes"** — all motion reduced-motion-guarded.
- Add the missing ShadCN/Base UI primitives the canvas requires: `Select`, `Tabs`, `Progress`, `Sonner Toaster`, `Popover`, `Calendar`, `ToggleGroup`, `Drawer`, `Checkbox`, `Switch`, `Textarea`.
- Complete the `PurchaseGiftModal` state machine to the canvas's six states: `form · loading · success · undo-available (toast) · undo-expired/error · purchase-error`.
- Define canonical state matrices for the canvas's stateful product components and document each state:
  - GiftCard / dashboard giftcard variants: `available · partial · purchased · hidden` (incl. `Oculto` + `Mostrar/Editar` dashboard actions).
  - Creation-wizard steps (`event · details · design · gifts · publish`) + auth-gate state.
  - Dashboard states: empty state, mobile `Tabs → Select` responsive nav, settings slug-change warning callout, share copy `success / error` states, archive/restore confirmation dialog.
- Add a reduced-motion-guarded GSAP micro-interaction layer for product components: success-check draw-in, undo countdown ring, toast slide/lift, modal/sheet ease, copy-success pop, card hover lift, theme-swatch hover.
- Extend Storybook to cover stateful feature components and their full state matrices, previewable under all seven themes.
- Update `docs/PRD.md` (§13) and add **Milestone 10** to `docs/TASKS.md` to record this scope.

Non-goals: no new product behavior (no new mutations, no schema/API changes), no freeform theme/color builder, no visual-regression/Chromatic, no moving stateful components out of `features/` into `shared/`.

## Capabilities

### New Capabilities
- `design-system-motion`: GSAP-based, reduced-motion-guarded micro-interaction layer and motion conventions for product components (modal/toast/success/undo/hover).
- `component-state-coverage`: canonical state matrices and Storybook coverage for the canvas's stateful product components (purchase modal, wizard steps, dashboard states), including completing the purchase modal to six states.

### Modified Capabilities
- `design-system`: add the ShadCN-first → TailwindCSS-fallback → GSAP-for-motion component-authoring priority as a stated convention.
- `shadcn-ui-setup`: add the additional Base UI primitives required by the canvas inventory.
- `storybook`: extend coverage from `shared/`-only to the stateful feature-component state matrices and motion/interaction stories.

## Impact

- Components: `src/components/features/wishlist/purchase-gift-modal.tsx`, `src/components/features/wizard/*`, `src/components/features/dashboard/*`, `src/components/shared/*`, new `src/components/ui/*` primitives.
- Motion: new `src/lib/gsap/*` helpers (reduced-motion guard reused from marketing) consumed by product components.
- Storybook: new colocated `*.stories.tsx` for stateful components; preview theme toolbar reused.
- Dependencies: existing `@base-ui/react`, `gsap`, `sonner` — no new runtime deps expected (Base UI primitives generated via shadcn CLI).
- Docs: `docs/PRD.md` §13, `docs/TASKS.md` Milestone 10.
- No Prisma schema, tRPC API, or env changes.
