## Context

The `src/components/ui/*` shadcn layer wraps `@base-ui/react@^1.6.0` primitives. 17 components import Base UI directly; `badge.tsx` and `sidebar.tsx` additionally use Base-UI-only `useRender` + `mergeProps`. `components.json` uses `style: "base-nova"`. Consumers depend on two Base-UI-specific surfaces:

1. **`render={<Element/>}` polymorphism** — 7 files (e.g. `<Button render={<Link/>}/>`, dialog trigger/close renders, sidebar + nav links).
2. **Base UI animation data-attributes** — `data-starting-style` / `data-ending-style` in ~5 files.

Radix UI is shadcn/ui's default upstream engine. Its API differs in three load-bearing ways: composition uses `asChild` + `Slot` (not `render`); overlay sub-component trees differ (e.g. Select uses `Content`/`Viewport`, Base uses `Positioner`/`Popup`/`List`); and state is exposed via `data-[state=open|closed]` rather than `data-starting-style`/`data-ending-style`. There is no Radix `Input` primitive (use native `<input>`) and no Radix `Drawer` (use `vaul`).

## Goals / Non-Goals

**Goals:**
- 1:1 swap of the headless engine from Base UI to Radix UI with no visual change.
- Preserve every component's public surface where possible; where Base-only props (`render`) must change, migrate all call sites in the same change.
- Land guard tests for the highest-risk shared components before rewriting them.
- Make `shadcn add` drop-in again via a Radix-compatible `components.json` style.

**Non-Goals:**
- Visual redesign, new components, or token/Tailwind changes.
- Touching non-primitive UI deps (embla, dnd-kit, sonner, gsap).
- Refactoring consumer business logic beyond the `render` → `asChild` swap.

## Decisions

### D1: Radix `asChild`/`Slot` replaces Base `render`
Map `render={<Link href/>}` → `asChild` with the element as a child: `<Button asChild><Link href/></Button>`. Components implement it via `@radix-ui/react-slot`'s `Slot` (`const Comp = asChild ? Slot : "button"`). For `badge.tsx`/`sidebar.tsx`, drop `useRender`/`mergeProps` for the same `Slot` idiom.
- **Alternative considered**: keep a `render`-shaped shim wrapping `Slot`. Rejected — extra indirection, diverges from upstream shadcn, and obscures the standard API future contributors expect.

### D2: Animation attributes → `data-[state]`
Rewrite `data-starting-style:*`/`data-ending-style:*` Tailwind variants to Radix's `data-[state=open]:*`/`data-[state=closed]:*` (and `data-[side=*]` for positioned popovers/selects), reusing existing `tw-animate-css` keyframes already in the project.

### D3: Per-component engine mapping
- Native/Slot only (no Radix primitive): `input` (native `<input>`), `button` + `badge` (Slot).
- `@radix-ui/react-*`: accordion, alert-dialog, checkbox, dialog (also powers `sheet`), popover, progress, select, separator, switch, tabs, tooltip.
- `vaul`: drawer.
- `sidebar.tsx`: Slot for the polymorphic button; keep internal state logic.

### D4: Tests-first for high-risk components
Before rewriting, add Vitest + Testing Library tests for: `button` (asChild renders anchor, variant classes), `badge` (asChild), `dialog`/`alert-dialog` (open/close, trigger, focus), `select` (open, select value, controlled), `sidebar` (link rendering). These lock current behavior so the Radix rewrite is verified against them.

### D5: components.json style → `new-york`
Set `style: "new-york"` (Radix-compatible) so subsequent `shadcn add` output matches our conventions.

## Risks / Trade-offs

- **Missed `render` call site breaks a link/button at runtime, not compile time** → grep `render=` to zero against `ui/` components; rely on `pnpm typecheck` (Radix has no `render` prop, so stragglers surface as type errors) + tests-first.
- **Select/overlay sub-tree rewrite changes DOM structure, breaking styling hooks** → port `data-slot` attributes onto Radix equivalents; visually verify Select, Dialog, Sheet, Drawer, Popover, Tooltip in dev.
- **Animation regressions** (entrance/exit jank) → verify each overlay's open/close transition after the `data-[state]` rewrite.
- **`vaul` drawer behavior differs from Base UI drawer** → confirm snap/drag behavior matches current UX; drawer is low-traffic, acceptable minor divergence.
- **Bundle/peer-dep churn** → multiple `@radix-ui/*` packages replace one; net neutral, all React 19 compatible.

## Migration Plan

1. Add Radix deps + `vaul`; keep `@base-ui/react` temporarily.
2. Write guard tests (D4) against current Base UI components; confirm green.
3. Migrate leaf/simple components (button, badge, input, separator, progress, switch, checkbox, label).
4. Migrate overlays (dialog, alert-dialog, sheet, popover, tooltip, select, accordion, tabs, drawer, sidebar).
5. Migrate consumers: `render=` → `asChild`; fix animation attrs.
6. Remove `@base-ui/react`; set `components.json` style; run `pnpm check`, `pnpm test`, `pnpm typecheck`.
7. Update `docs/TASKS.md` + `docs/PRD.md`.

**Rollback**: revert the branch — single dependency line + isolated `ui/` + consumer edits; no DB/env/migration state changes.

## Open Questions

- None blocking. `style: "new-york"` chosen as default; revisit only if a token mismatch surfaces during component review.
