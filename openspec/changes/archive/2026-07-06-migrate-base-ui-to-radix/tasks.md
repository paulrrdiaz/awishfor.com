## 1. Dependencies

- [x] 1.1 Add Radix deps: `@radix-ui/react-{accordion,alert-dialog,checkbox,dialog,popover,progress,select,separator,slot,switch,tabs,tooltip}` + `vaul` via pnpm
- [x] 1.2 Keep `@base-ui/react` installed for now (removed in §6)
- [x] 1.3 Confirm `pnpm install` resolves cleanly with React 19

## 2. Guard tests first (high-risk shared components)

- [x] 2.1 `button.test.tsx`: default renders `<button>`; `asChild` renders single `<a>` with button classes + `data-slot="button"`; variant/size classes applied
- [x] 2.2 `badge.test.tsx`: default renders `<span>`; `asChild` renders child element with badge classes
- [x] 2.3 `dialog.test.tsx` + `alert-dialog.test.tsx`: trigger opens, close/escape closes, content visible when open
- [x] 2.4 `select.test.tsx`: trigger opens list, selecting an item updates value, controlled value renders
- [x] 2.5 `sidebar.test.tsx`: menu button renders as `<a>` link via `asChild`
- [x] 2.6 Run `pnpm test` and confirm all new tests pass against the current Base UI implementation

## 3. Migrate leaf / simple components

- [x] 3.1 `button.tsx`: replace Base `Button` with `Slot`-based `asChild` (`@radix-ui/react-slot`); preserve cva variants + `data-slot`
- [x] 3.2 `badge.tsx`: replace `useRender`/`mergeProps` with `Slot`/`asChild`
- [x] 3.3 `input.tsx`: replace Base `Input` with native `<input>` + existing classes
- [x] 3.4 `separator.tsx` → `@radix-ui/react-separator`
- [x] 3.5 `progress.tsx` → `@radix-ui/react-progress`
- [x] 3.6 `switch.tsx` → `@radix-ui/react-switch`
- [x] 3.7 `checkbox.tsx` → `@radix-ui/react-checkbox`
- [x] 3.8 Re-run §2 guard tests for button/badge; fix until green

## 4. Migrate overlay / composite components

- [x] 4.1 `dialog.tsx` → `@radix-ui/react-dialog`; port `data-slot` attrs; rewrite anim attrs to `data-[state=open|closed]`
- [x] 4.2 `sheet.tsx` → `@radix-ui/react-dialog` (side variants); port slots + anims
- [x] 4.3 `alert-dialog.tsx` → `@radix-ui/react-alert-dialog`
- [x] 4.4 `popover.tsx` → `@radix-ui/react-popover`; `data-[side]`/`data-[state]` anims
- [x] 4.5 `tooltip.tsx` → `@radix-ui/react-tooltip`
- [x] 4.6 `select.tsx` → `@radix-ui/react-select` (Trigger/Value/Icon/Portal/Content/Viewport/Item/ItemText/ItemIndicator); port `data-slot` + anims
- [x] 4.7 `accordion.tsx` → `@radix-ui/react-accordion`
- [x] 4.8 `tabs.tsx` → `@radix-ui/react-tabs`
- [x] 4.9 `drawer.tsx` → `vaul`
- [x] 4.10 `sidebar.tsx`: replace `useRender`/`mergeProps` with `Slot`/`asChild`; keep state logic
- [x] 4.11 Re-run §2 guard tests for dialog/alert-dialog/select/sidebar; fix until green

## 5. Migrate consumers

- [x] 5.1 Replace all `render={<Link .../>}` on `ui/` components with `asChild` + child element (7 files: wishlist-card-grid, app-sidebar, wishlist-detail-nav, wishlist-settings-form, delete-purchase/gift/category dialogs)
- [x] 5.2 Rewrite remaining `data-starting-style`/`data-ending-style` Tailwind variants in consumers to `data-[state]` equivalents (~5 files) — none found in consumers; also fixed `field.tsx`'s stale `has-data-checked:` selector and `faq-section.tsx`'s Base UI `multiple` prop to Radix `type`/`collapsible`
- [x] 5.3 Grep `src/` to confirm zero `render={` on `ui/` components and zero `@base-ui` references

## 6. Config, cleanup, validation

- [x] 6.1 Remove `@base-ui/react` from `package.json`; `pnpm install`
- [x] 6.2 Set `components.json` `style` to `new-york`
- [x] 6.3 Run `pnpm check`, `pnpm test`, `pnpm typecheck` — all green
- [x] 6.4 Manually verify in dev: dialog, sheet, drawer, select, popover, tooltip open/close + animations; sidebar/nav links navigate — skipped (browser automation unavailable this session; user asked to continue without it)

## 7. Documentation

- [x] 7.1 Document the Base UI → Radix UI decision in `docs/TASKS.md`
- [x] 7.2 Update stack references in `docs/PRD.md` (and `CLAUDE.md` "shadcn/Base UI" mentions) to Radix — no CLAUDE.md mentions found
