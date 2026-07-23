## Why

The owner dashboard Regalos tab (`/dashboard/wishlists/[id]/gifts`) currently renders a narrow, mobile-styled list with ad-hoc `text-gray-*` classes, has no way to **add** a gift, and offers no search, filtering, or sorting. Design §6c specifies a desktop, app-themed Regalos tab with add/edit/delete, a search box, filter chips, a sort control, and drag-to-reorder. This change brings the tab to pixel-parity with the design and closes the missing "add gift" and "find gift" gaps.

## What Changes

- Rebuild the Regalos tab to match design §6c on desktop: toolbar with title + count + reorder hint, `Importar desde enlace` + `＋ Agregar regalo` actions, a search field, status/priority filter chips (`Todos · Disponibles · Comprados · ★ Infaltables · Ocultos`), a sort control, and app-theme gift rows (drag handle, thumbnail, name + `★ Infaltable`, store · category, price, `x / y comprados` + progress bar, status badge, `Editar` + `⋯` menu).
- Add **gift creation** from the dashboard via an Add/Edit **Sheet** (URL import card powered by the existing importer + manual fields: nombre, tienda, categoría, precio + moneda, cantidad stepper, enlace, nota, `infaltable` and `visible` switches). Expose a `gift.create` mutation path (service `createGift` and `createGiftSchema` already exist but are not wired to the router/UI).
- Add a **row action menu** (`Editar · Duplicar · Marcar infaltable · Ocultar · Eliminar`), including gift **duplicate**.
- Implement **search / filter / sort as URL query params** using `nuqs`, with a debounced search input (`use-debounce`) built on the shadcn `Input`. The gifts Server Component reads the params and returns the filtered, sorted list.
- Implement dashboard gift mutations (create, update, duplicate, set visibility/priority, delete, reorder) as **Next.js server actions** that reuse the existing service layer and `revalidatePath` the gifts route.
- Keep **drag-and-drop reorder** via `dnd-kit` (already present), aligned to the new row markup.

Non-goals: mobile layout redesign of the tab (desktop §6c only this pass); the gift-level purchase drawer (already specced/implemented); category CRUD (reuse existing category management); changing the public wishlist page.

## Capabilities

### New Capabilities
- `dashboard-gift-filters`: URL-query-param-driven search (debounced), status/priority filtering, and sorting of dashboard gifts, shareable and back/forward safe.

### Modified Capabilities
- `dashboard-gift-management`: add owner gift **creation** from the dashboard (Add/Edit Sheet with URL import + manual fields), gift **duplication**, a consolidated row action menu, and the desktop §6c presentation for the Regalos tab.

## Impact

- **Routes/UI**: `src/app/(protected)/dashboard/wishlists/[id]/gifts/page.tsx` and `src/components/features/dashboard/gifts/*` (new Sheet, toolbar, filter chips, sort, row menu; rework `gift-group`, `gift-row`, `sortable-gift-row` to app-theme tokens).
- **Server**: new server actions module for dashboard gift CRUD (reusing `src/server/services/gift.service.ts`); `gift.create` wiring; reuse `importer` and `category` routers.
- **Deps**: `nuqs`, `use-debounce`, `@dnd-kit/*`, `shadcn` — all already in `package.json`. Requires `NuqsAdapter` in the app providers. May add shadcn `dropdown-menu` primitive (row `⋯` menu) if not present.
- **No** schema changes (Gift model already has `priority`, `visibilityStatus`, `sortOrder`, `quantityNeeded`, price fields).
