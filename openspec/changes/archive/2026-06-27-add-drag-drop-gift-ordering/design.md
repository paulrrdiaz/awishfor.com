## Context

`Gift.sortOrder` already exists and is the primary sort key in both `listGifts` (public) and `listDashboardGifts` (dashboard): `orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }]`. The dashboard gifts page (`gifts/page.tsx`) renders three groups via `gift-group.tsx` → `gift-row.tsx`; both are currently server-rendered (no client interactivity in the rows themselves; actions live in `gift-row-actions.tsx`). No drag library is installed. This change only adds the missing *write* path and the drag UI.

## Goals / Non-Goals

**Goals:**
- Owner reorders gifts by drag-and-drop in the dashboard.
- A single shared `sortOrder` drives both dashboard and public ordering.
- Reorder is ownership-checked and atomic.

**Non-Goals:**
- No category drag-and-drop (covered by task 4.6 / category-management).
- No cross-group dragging semantics beyond preserving each group's internal order; dragging is within a status group.
- No DB migration (column exists).
- No reordering in the public view or the wizard.

## Decisions

**Reorder contract: full ordered id list per wishlist.** `gift.reorder` takes `{ wishlistId, orderedGiftIds }` — the complete desired order of all non-deleted gifts in the wishlist. Service validates that `orderedGiftIds` is exactly the set of the wishlist's non-deleted gifts (same length, same membership), then writes `sortOrder = index` in a transaction (`db.$transaction` of `updateMany`/`update` calls). *Alternative considered:* per-group partial lists with fractional/sparse ordering — rejected as more complex and error-prone; the full-list renumber is simple and the gift counts per wishlist are small.

**Client builds the full list from grouped data.** The dashboard already holds `{ available, purchased, hidden }`. On a drop within a group, the client produces the reordered group array, then concatenates `available ++ purchased ++ hidden` in display order to form `orderedGiftIds`. Renumbering is harmless to cross-group order because each group is already rendered in `sortOrder` and stays contiguous.

**Drag within group only, via `@dnd-kit/sortable`.** Each `GiftGroup` becomes a `SortableContext`; rows use `useSortable`. `gift-group.tsx` becomes a client component wrapping a `DndContext`. Use `@dnd-kit` (the task's named choice) over native HTML5 DnD for accessibility + touch support.

**Optimistic update + invalidate.** On drag end, optimistically set local order, fire `gift.reorder`, then `utils.gift.list.invalidate()` on settle; on error, refetch to restore server order.

## Risks / Trade-offs

- Concurrent edits (e.g. a gift deleted in another tab) make the submitted id set stale → strict set validation rejects the reorder → client refetches. Acceptable; reorder is idempotent and re-submittable.
- Making `gift-group` a client component means the page passes grouped data as props to a client tree; the RSC page (`gifts/page.tsx`) already fetches via `@/trpc/server`, so it passes the grouped result down. Keep `gift-row` presentational and add a thin sortable wrapper.

## Migration Plan

No DB migration. Deploy is additive (new mutation + dependency). Rollback = remove the mutation/UI; existing `sortOrder` data stays valid.

## Open Questions

None.
