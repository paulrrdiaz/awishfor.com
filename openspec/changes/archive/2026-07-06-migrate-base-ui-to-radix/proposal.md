## Why

The UI layer is built on `@base-ui/react` as the headless primitive engine behind our shadcn components. We are standardizing on **Radix UI** — the primitive library that the upstream shadcn/ui registry, docs, and ecosystem target by default. Staying on Base UI forces us to hand-translate every shadcn example, blocks `shadcn add` from producing drop-in components, and leaves us on a divergent composition API (`render` prop vs. the Radix `asChild`/Slot pattern). Migrating now — while only ~17 primitives are in use and there are no app-level forks — keeps the cost bounded.

## What Changes

- Swap the headless primitive engine from `@base-ui/react` to Radix UI across all `src/components/ui/*` shadcn components (accordion, alert-dialog, button, badge, checkbox, dialog, drawer, input, popover, progress, select, separator, sheet, switch, tabs, tooltip, sidebar).
- **BREAKING**: Replace Base UI's `render={<Component/>}` polymorphism with Radix's `asChild` + `Slot` pattern. Affects 7 consumer files (`Button`, dialog triggers, sidebar/nav links) that pass `render={<Link/>}`.
- **BREAKING**: Replace Base UI's `useRender` + `mergeProps` implementation in `badge.tsx` and `sidebar.tsx` with the Radix `Slot`/`asChild` idiom.
- Re-map Base UI animation data-attributes (`data-starting-style` / `data-ending-style`) to Radix's `data-[state=open]` / `data-[state=closed]` + `tw-animate-css` conventions (5 affected files).
- Update `components.json` `style` from `base-nova` to a Radix-compatible registry style so future `shadcn add` is drop-in.
- Replace the `@base-ui/react` dependency with the required `@radix-ui/react-*` packages (+ `vaul` for drawer) in `package.json`.
- Add unit/interaction tests (Vitest + Testing Library) for the highest-risk shared components **before** rewriting them, to guard against behavior regressions.
- Document the Base UI → Radix decision in `docs/TASKS.md` (and `docs/PRD.md` where it states the stack).

### Non-Goals

- No visual redesign — components keep their current Tailwind classes, tokens, and look.
- No new components added; this is a 1:1 primitive swap of existing ones.
- No change to non-primitive UI deps (`embla` carousel, `dnd-kit`, `sonner`, `gsap`).

## Capabilities

### New Capabilities
<!-- none -->

### Modified Capabilities
- `shadcn-ui-setup`: The headless primitive engine SHALL be Radix UI (not Base UI), `components.json` SHALL use a Radix-compatible style, and polymorphic composition SHALL use the `asChild`/`Slot` contract.

## Impact

- **Dependencies**: remove `@base-ui/react`; add `@radix-ui/react-{accordion,alert-dialog,checkbox,dialog,popover,progress,select,separator,slot,switch,tabs,tooltip}` and `vaul`.
- **Code**: all 17 components in `src/components/ui/`; ~7 consumer files using `render=`; ~5 files using Base UI animation data-attrs; `components.json`.
- **Tests**: new tests under `src/components/ui/` for button, badge, dialog/alert-dialog, select, sidebar.
- **Docs**: `docs/TASKS.md`, `docs/PRD.md`.
- **Specs**: `shadcn-ui-setup` (modified).
- **No DB / API / env changes.**
