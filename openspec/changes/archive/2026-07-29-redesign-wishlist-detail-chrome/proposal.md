## Why

The Claude Design canvas replaced the wishlist detail's horizontal tab row with a persistent 60px vertical icon rail, moved every wishlist-level action into a fixed 55px topbar, and collapsed the title block to a single baseline line. The implementation still ships the old tab design, and the code that draws it has drifted off-palette — `wishlist-detail-nav.tsx` hardcodes roughly ten hex values (`#e9e9e2`, `#fbfbf8`, `#17213a`, `#566174`, `#ecefea`) that do not correspond to any token, even though `globals.css` already defines the exact app theme the canvas specifies.

Owners today also lose their bearings on long lists: the tab row scrolls out of view with the document, so from the bottom of a 200-gift page there is no visible way to reach another section.

## What Changes

- **BREAKING** Remove the horizontal tab row, its `ResizeObserver`-driven animated indicator, and the sub-`md` `Select` fallback. `src/components/layouts/dashboard/wishlist-detail-nav.tsx` (334 lines) is deleted.
- Add a persistent vertical icon rail (60px, `40x40` items at `radius:11px`, active item filled with `--primary`) carrying the five wishlist sections: Resumen, Regalos, Invitados, Diseño, Configuración. Icon-only with hover tooltips at `md` and up.
- Below `md`, the rail becomes a horizontal scroll-x strip showing icon **and** label. Touch devices have no hover, so an icon-only rail would be unlabeled navigation.
- Refactor the topbar to a fixed 55px white bar holding the breadcrumb, the status badge, and all three actions (`Ver pública`, `⋯`, `+ Crear wishlist`). Breadcrumb gains a third segment on subsections (`Mis wishlists / Título / Regalos`).
- Refactor the title block to a single baseline row — `h1` serif 22px, public URL at 13px, and the `copiar` chip — with the status badge and action buttons removed (they moved to the topbar). It renders once in the layout, not per page: the canvas markup is byte-identical across `§6`, `§6c`, and `§6d`.
- Wire the `⋯` button, currently a dead control with no dropdown, to a menu with Copiar enlace and Archivar, plus the canvas restore dialog (`¿Restaurar esta wishlist?` → `Restaurar publicada` / `Restaurar como borrador`). The `archive` and `restore` mutations already exist on the wishlist router.
- Switch the protected shell to an app-shell scroll model: topbar and rail stay fixed, only the content pane scrolls.
- Align the Resumen, Regalos, and Invitados content to their canvas sections — metric cards lose their icon and description and drop to `radius:16px`, progress bars go from 8px to 6px, and the two-column grid becomes `1.3fr / 1fr` at an 18px gap.
- Add `--status-*` tokens and matching `badge.tsx` variants so published/draft/archived colors stop being inline hexes.
- Map the orphaned `categories` segment to `gifts` for active-state resolution, so that route stops highlighting Resumen.

## Capabilities

### New Capabilities

- `dashboard-detail-chrome`: The shared chrome of the wishlist detail route — fixed topbar with breadcrumb, status badge and actions; the vertical icon rail and its responsive strip; the title block; the `⋯` action menu and restore dialog; and the app-shell scroll model.

### Modified Capabilities

- `dashboard-detail-tabs`: Every requirement is superseded. Tab navigation, the animated active-tab indicator, its pre-hydration fallback, hover and focus affordances, and the mobile `Select` handoff all cease to exist once the rail replaces them.
- `design-system`: Adds status color tokens (`--status-published`, `--status-draft`, `--status-archived` plus foregrounds) and the corresponding `badge.tsx` variants, so wishlist status, gift status, and RSVP status stop being expressed as inline hex.

## Impact

**Deleted**
- `src/components/layouts/dashboard/wishlist-detail-nav.tsx`

**New**
- `src/components/layouts/dashboard/wishlist-topbar.tsx`
- `src/components/layouts/dashboard/wishlist-section-rail.tsx`
- `src/components/layouts/dashboard/wishlist-actions-menu.tsx`

**Modified**
- `src/app/(protected)/layout.tsx` — `min-h-svh` becomes `h-svh` for the app-shell model
- `src/app/(protected)/dashboard/wishlists/[id]/layout.tsx` — composes topbar, rail, and title
- `src/app/(protected)/dashboard/wishlists/[id]/{page,gifts/page,guests/page}.tsx` — content padding per canvas
- `src/components/features/dashboard/overview/*` (4 files)
- `src/components/features/dashboard/gifts/*`, `guests/*` — toolbars and rows to canvas
- `src/components/ui/badge.tsx`, `src/styles/globals.css` — status variants and tokens
- `src/components/shared/metric-card.tsx` and its story — `icon` and `description` removed

**Required side effects**
- `h-svh` on the protected shell clips `/dashboard` and `/dashboard/wishlists` unless each receives its own scroll container. Both must be updated in this change.

**Conventions**
- lucide imports use the `Icon` suffix (`GiftIcon`, `UsersIcon`). Applied to new files and to any file this change already edits; the rest of the repo is left alone.

## Non-goals

- `app-sidebar.tsx` is untouched. Canvas `§6b` specifies three sidebar states, but the current sidebar already matches structurally and its drift is color-only — separable work that blocks nothing here.
- Content for `Diseño` and `Configuración` is not redesigned. Both inherit the new chrome; neither has a canvas section.
- The `categories` route keeps its current content and stays out of the rail. Only its active-state mapping is corrected.
- No dark-mode values are added. `next-themes` is absent and the `.dark` block in `globals.css` is unreachable for dashboard routes.
- The repo-wide lucide `Icon` suffix normalization is deferred to its own change.
