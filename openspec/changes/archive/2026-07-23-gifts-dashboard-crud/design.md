## Context

The Regalos tab lives at `src/app/(protected)/dashboard/wishlists/[id]/gifts/page.tsx` (RSC) → `GiftGroup` (client) → `SortableGiftRow` → `GiftRow` / `GiftRowActions` / `EditGiftDialog` / `DeleteGiftDialog`. Data comes from tRPC `gift.list` (grouped) via the server caller; mutations (`update`, `setVisibility`, `delete`, `reorder`) are tRPC client mutations. `dnd-kit` reorder already works.

Current gaps vs. design §6c: no add-gift path (`gift.create` service + `createGiftSchema` exist but are not exposed on the router or UI), no search/filter/sort, no duplicate/priority-from-menu, and the markup uses ad-hoc `text-gray-*` mobile styling instead of the app-theme desktop layout. The design canvas §6c specifies the desktop layout, an Add/Edit **Sheet** (import-from-URL + manual fields + `infaltable`/`visible` switches), a row `⋯` menu (`Editar · Duplicar · Marcar infaltable · Ocultar · Eliminar`), search + filter chips + sort. The `importer` and `category` tRPC routers already exist and are registered.

Deps already installed: `nuqs`, `use-debounce`, `@dnd-kit/*`, `shadcn`, `sonner`. App theme is a shadcn Tailwind v4 token system (`--primary`, `--sidebar`, `--card`, etc.) in `src/styles/globals.css`; the design canvas `a*`/`abtn` classes are canvas-only and must be translated to these tokens.

## Goals / Non-Goals

**Goals:**
- Pixel-parity desktop Regalos tab per §6c, using shadcn components + app-theme semantic tokens.
- Add-gift and duplicate-gift flows; consolidated row action menu.
- Search / filter / sort as URL query params via `nuqs`, debounced search via `use-debounce` on shadcn `Input`.
- Dashboard gift mutations as Next.js **server actions** reusing `gift.service.ts`.
- Preserve existing `dnd-kit` reorder, purchase drawer, and category assignment.

**Non-Goals:**
- Mobile redesign of the tab (desktop §6c only this pass).
- Public wishlist page, category CRUD, or purchase-drawer changes.
- Schema changes (Gift already has all needed fields).

## Decisions

### 1. Filter/sort state in the URL via `nuqs`, read server-side
Search (`q`), status filter (`filter`), and sort (`sort`) are `nuqs` query params. The gifts page is a Server Component that reads `searchParams` and fetches the filtered/sorted list server-side, so results are correct on first paint and shareable. Client filter controls use `nuqs` `useQueryState` with `shallow: false` so navigation triggers an RSC refetch; the search box wraps `useQueryState` in a `use-debounce` `useDebouncedCallback` (~300ms). Requires mounting `NuqsAdapter` (next/app) in the app providers.
- *Alternative considered:* client-side filtering of a fully-fetched list. Rejected — the design wants shareable/back-safe state and it does not scale, and the user explicitly asked for query params.

### 2. Mutations as server actions wrapping the service layer
Add a `src/app/(protected)/dashboard/wishlists/[id]/gifts/actions.ts` (`"use server"`) exposing `createGiftAction`, `updateGiftAction`, `duplicateGiftAction`, `setGiftVisibilityAction`, `setGiftPriorityAction`, `deleteGiftAction`, `reorderGiftsAction`. Each resolves the Clerk `userId` + local user, authorizes ownership via `getOwnedGift` / wishlist ownership check, calls the existing `gift.service.ts` functions, then `revalidatePath` the gifts route. Inputs validated with the existing zod schemas (`createGiftSchema`, `updateGiftSchema`, etc.).
- *Why:* the user explicitly asked for server actions; they compose naturally with RSC + `revalidatePath` and reuse the service layer already covered by unit tests.
- *Alternative considered:* keep everything on tRPC. Rejected per explicit request, though the read path may stay on the tRPC **server caller** since that is already a server-side call. Reorder stays optimistic on the client, then calls `reorderGiftsAction`.
- `gift.create` is also wired onto the tRPC router for parity/testing, but the UI path is the server action.

### 3. Add/Edit as one shadcn `Sheet`, import via existing importer
A single `GiftSheet` handles add and edit (same fields; title `Agregar` vs `Editar regalo`). The import-from-URL card calls the existing `importer` router (client) to prefill; manual fields use shadcn `Input`/`Textarea`/`Select`/`Switch` and a quantity stepper. Form via `react-hook-form` + `@hookform/resolvers` against `createGiftSchema`/`updateGiftSchema`. Category `Select` options come from the `category` router scoped to the wishlist. Submit calls the create/update server action; `sonner` toast on success.
- *Alternative considered:* reuse the existing `EditGiftDialog`. Rejected — design §6c uses a right-side Sheet with the import card and switches; the dialog lacks those. The old dialog is replaced.

### 4. Presentation: translate canvas → shadcn + app tokens
Rebuild `gift-group`/`gift-row`/`sortable-gift-row` with app-theme tokens (`bg-card`, `text-muted-foreground`, `border-border`, `bg-primary`, `text-destructive`, etc.). Status filtering means the single flat, sorted list replaces the three hard-coded groups (grouping logic still informs the status badge + de-emphasis). Row `⋯` menu uses shadcn `dropdown-menu` (add the primitive if missing). Delete keeps the existing confirm dialog with the stronger has-purchases warning.

### 5. Status/priority filter semantics
`filter` maps to: `disponibles` → visible with remaining > 0; `comprados` → remaining == 0; `infaltables` → priority high; `ocultos` → visibility hidden; `todos`/absent → all. Sorting (`sort`): `manual` (sortOrder), `nombre` (name A–Z), `precio` (price asc). Filtering/sorting run server-side in a `listDashboardGifts` extension or a pure helper over the mapped rows (mirrors `src/lib/wishlist/gift-filters.ts` for the public side).

## Risks / Trade-offs

- **Server actions + tRPC coexistence** → two mutation styles in one app. Mitigation: isolate gift actions in one `actions.ts`, keep them thin wrappers over the shared service layer so logic isn't duplicated.
- **`revalidatePath` full-segment refresh vs. optimistic dnd reorder** → reorder could flicker. Mitigation: keep reorder optimistic in client state (as today) and only revalidate on settle.
- **nuqs adapter not yet mounted** → query hooks throw. Mitigation: add `NuqsAdapter` in the root/providers as the first task and verify.
- **Import prefill failures** (unsupported store) → blank fields. Mitigation: import is best-effort; manual fields remain fully editable, matching the design copy.
- **Pixel-perfection drift** → canvas uses fixed px and canvas-only classes. Mitigation: map to the nearest app tokens/spacing, verify against the rendered design at apply time; treat exact px as target, tokens as source of truth.

## Migration Plan

1. Mount `NuqsAdapter`.
2. Add server actions + wire `gift.create` on the router; keep old tRPC mutations until UI is swapped.
3. Build `GiftSheet`, filter/search/sort controls, row `⋯` menu; rebuild rows with app tokens.
4. Swap the page to read `searchParams` and render the new toolbar + list.
5. Remove the superseded `EditGiftDialog` once `GiftSheet` covers edit.
6. Rollback: revert the gifts route + components; server actions and `gift.create` are additive and safe to leave.

## Open Questions

- Should `Duplicar` copy the `sortOrder` neighbor position (insert right after) or append to the end? Default: append to end (simplest, matches create).
- Is a mobile layout expected this pass, or strictly desktop §6c? Assumed desktop-only per the section title; mobile keeps the existing responsive behavior until a follow-up.
