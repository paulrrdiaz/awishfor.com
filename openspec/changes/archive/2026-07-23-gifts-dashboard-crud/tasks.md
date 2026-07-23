## 1. Foundations (nuqs + server layer)

- [x] 1.1 Mount `NuqsAdapter` in the app providers (root or `(protected)` layout) and verify `useQueryState` works in a dashboard client component
- [x] 1.2 Wire a `create` mutation on `giftRouter` (`src/server/api/routers/gift.ts`) using the existing `createGiftSchema` + `createGift` service, authorized against wishlist ownership
- [x] 1.3 Add a `duplicateGift` service function in `gift.service.ts` (copy editable fields, no purchases, appended `sortOrder`) with a unit test in `gift.service.test.ts`
- [x] 1.4 Add a pure `filterAndSortDashboardGifts` helper (search by name/store, status filter `todos|disponibles|comprados|infaltables|ocultos`, sort `manual|nombre|precio`) mirroring `src/lib/wishlist/gift-filters.ts`, with unit tests
- [x] 1.5 Create `.../gifts/actions.ts` (`"use server"`): `createGiftAction`, `updateGiftAction`, `duplicateGiftAction`, `setGiftVisibilityAction`, `setGiftPriorityAction`, `deleteGiftAction`, `reorderGiftsAction` — each resolves the local user, authorizes ownership, calls the service, and `revalidatePath`s the gifts route

## 2. Search / filter / sort (dashboard-gift-filters)

- [x] 2.1 Define nuqs query params `q`, `filter`, `sort` (parsers + defaults: `sort=manual`) as a shared `searchParams` schema
- [x] 2.2 Rework the gifts page (`page.tsx`) to read `searchParams`, fetch the owner's dashboard gifts, and apply `filterAndSortDashboardGifts` server-side before rendering
- [x] 2.3 Build the search field: shadcn `Input` with a leading icon, bound to `q` via `useQueryState` + `use-debounce` `useDebouncedCallback` (~300ms)
- [x] 2.4 Build the status filter chips (`Todos · Disponibles · Comprados · ★ Infaltables · Ocultos`) bound to `filter`, styling the active chip per §6c
- [x] 2.5 Build the sort control (`Orden: Manual/Nombre/Precio`) bound to `sort`; disable/skip drag-reorder when `sort !== manual`
- [x] 2.6 Add the filtered "no results" empty state (clear-filters action) distinct from the empty-wishlist state

## 3. Add / Edit gift Sheet (dashboard-gift-management)

- [x] 3.1 Add shadcn `dropdown-menu` primitive if missing (`src/components/ui/`)
- [x] 3.2 Build `GiftSheet` (shadcn `Sheet`) with add/edit modes: import-from-URL card, image, nombre, tienda, categoría (`Select` from `category` router), precio + moneda, cantidad stepper, enlace, nota, `infaltable` + `visible` `Switch`es
- [x] 3.3 Wire the form with `react-hook-form` + zod resolver (`createGiftSchema`/`updateGiftSchema`); submit calls create/update server action; `sonner` toast on success; field-level validation on error
- [x] 3.4 Wire the URL import card to the existing `importer` router to prefill fields (best-effort, fields stay editable)
- [x] 3.5 Wire `＋ Agregar regalo` and `🔗 Importar desde enlace` toolbar buttons to open `GiftSheet`

## 4. Row rebuild + action menu (§6c presentation)

- [x] 4.1 Rebuild `gift-row.tsx` with app-theme tokens per §6c: drag handle, thumbnail, name + optional `★ Infaltable`, store · category, price, `x / y comprados` + progress bar, status badge; de-emphasize purchased (line-through) and hidden (`Oculto` + `Mostrar`)
- [x] 4.2 Replace the three hard-coded groups in `gift-group.tsx` with the single filtered/sorted list while preserving `dnd-kit` `SortableContext`; reorder calls `reorderGiftsAction`
- [x] 4.3 Build the row `⋯` menu (`dropdown-menu`): `Editar`, `Duplicar`, mark/clear `infaltable`, hide/show, `Eliminar` (destructive) — wired to the corresponding server actions and `GiftSheet`
- [x] 4.4 Keep the delete confirmation with the stronger has-purchases warning; wire to `deleteGiftAction`
- [x] 4.5 Rebuild the header + toolbar rows (title + count + reorder hint; `Importar`/`Agregar`; search + chips + sort) per §6c using app tokens
- [x] 4.6 Remove the superseded `EditGiftDialog` once `GiftSheet` covers edit

## 5. Validation

- [x] 5.1 `pnpm check` (Biome) passes
- [x] 5.2 `pnpm test` passes (service, filter helper, and any component tests)
- [x] 5.3 `pnpm typecheck` passes
- [x] 5.4 Manual desktop pass against design §6c: add, edit, duplicate, hide/show, mark infaltable, delete, search, filter chips, sort, and drag-reorder all work and match the layout
