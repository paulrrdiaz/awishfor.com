## Context

Milestone 2 delivered the design-system foundation: `src/components/shared/` presentational components, the seven scoped public themes (`PublicThemeProvider` + `data-theme`), the Lora/Inter `serif-soft` type system, and a `@storybook/nextjs-vite` Storybook with a theme toolbar. Stack: Next.js 16 RSC, React 19, Tailwind v4, shadcn on the Base UI registry (`@base-ui/react`), `sonner`, `gsap`.

The Claude Design canvas defines more component states than the code currently treats as design-system artifacts:
- `PurchaseGiftModal` implements only `phase: "form" | "success"`; the canvas (image 3/4) specifies six states.
- Stateful product components (purchase modal, wizard steps, dashboard states) have **zero** Storybook stories — Milestone 2 deliberately deferred them.
- Canvas surfaces need ShadCN primitives absent from `src/components/ui/`: `Select`, `Tabs`, `Progress`, a Sonner `Toaster`, `Popover`, `Calendar`, `ToggleGroup`, `Drawer`, `Checkbox`, `Switch`, `Textarea`.
- GSAP is wired only on the marketing route (`src/lib/gsap/use-marketing-animations.ts`); product components have no motion layer.

## Goals / Non-Goals

**Goals:**
- Make every component state in the six canvas images a documented, story-covered design-system artifact.
- Establish a single authoring priority: ShadCN/Base UI primitive → raw Tailwind fallback → GSAP for motion, motion always reduced-motion-guarded.
- Complete the `PurchaseGiftModal` six-state machine.
- Fill the missing ShadCN primitive set.
- Add a reusable, reduced-motion-safe GSAP micro-interaction layer for product components.

**Non-Goals:**
- No new product behavior: no new tRPC mutations, no Prisma schema changes, no env/API changes.
- No moving stateful components from `features/` into `shared/` (foundation rule stands).
- No freeform theme/color builder, no square button style.
- No visual-regression / Chromatic.

## Decisions

**1. Authoring priority is ShadCN-first, Tailwind-fallback, GSAP-for-motion.**
Components reach for a Base UI primitive (via shadcn registry) before hand-rolling markup; raw Tailwind is the fallback only when no primitive fits; GSAP supplies motion/"good vibes" on top. Rationale: maximizes a11y/behavior reuse and keeps a consistent token surface. Alternative considered — bespoke Tailwind everywhere — rejected for losing Base UI's focus/keyboard/ARIA behavior.

**2. Complete the purchase modal as an explicit state machine, not new mutations.**
Expand `Phase` from `form | success` to `form | loading | success | undo | undo-expired | error`. `loading` and `error` derive from the existing `markGiftPurchased` mutation's `isPending`/`onError`; `undo`/`undo-expired` from the existing 8s undo countdown; the toast uses Sonner. No server contract changes — these are presentational states over the current mutation lifecycle. Alternative — separate components per state — rejected; one modal owning a discriminated phase matches the canvas and current code.

**3. GSAP motion layer mirrors the marketing pattern but is component-scoped.**
Add small helpers under `src/lib/gsap/` (e.g. `useReducedMotion` reuse, `playSuccessCheck`, `useUndoRing`, toast/modal ease presets) that components opt into. Every animation is wrapped in a `prefers-reduced-motion: reduce` guard and degrades to the final static state. Alternative — CSS `@keyframes` only — kept for trivial cases, but GSAP is chosen for sequenced/interruptible motion (success check draw-in, undo ring countdown) the canvas implies.

**4. Stateful components stay in `features/` but gain colocated stories.**
Storybook coverage extends to `features/` state matrices using mocked props/handlers (tRPC calls stubbed via story args/decorators), previewable under the seven-theme toolbar. Rationale: honors the foundation rule while still documenting states. Stories render presentational states; they do not exercise real network calls.

**5. ShadCN primitives added via the shadcn CLI on the Base UI registry.**
Generate each missing primitive into `src/components/ui/` so they inherit the existing token mapping and `cn()`/`cva` conventions, rather than authoring from scratch.

## Risks / Trade-offs

- [Base UI registry may lack a 1:1 component (e.g. `Drawer`/`Calendar`)] → fall back to the closest primitive (`Sheet` for drawer) or a thin Tailwind wrapper, documented per component; do not block the milestone on a missing primitive.
- [Stories that stub tRPC can drift from real behavior] → stories cover presentational states only; real flows stay covered by existing `*.test.tsx` (e.g. `purchase-gift-modal.test.tsx`).
- [Motion can cause layout shift or distract] → all motion reduced-motion-guarded, transform/opacity-only, no layout-affecting animation; final state always reachable statically.
- [Scope creep into a full component refactor] → limited to the states in the six canvas images plus the named primitive set; no redesign of existing working components beyond wiring states/motion.

## Open Questions

- None blocking. Undo window is 8s in code vs 60s in PRD §11 — out of scope here (UI uses the implemented 8s, matching the canvas "Deshacer · 8s"); reconcile separately if needed.
