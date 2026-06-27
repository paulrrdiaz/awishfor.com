## 1. Validation & service

- [x] 1.1 Add `reorderGiftsSchema` to `src/server/validators/gift.schema.ts`: `{ wishlistId, orderedGiftIds: string[] (min 1) }` and export its inferred type.
- [x] 1.2 Add `reorderGifts(db, { ownerId, wishlistId, orderedGiftIds })` to `src/server/services/gift.service.ts`: verify wishlist ownership, load non-deleted gift ids for the wishlist, reject (NOT_FOUND) if `orderedGiftIds` is not an exact set match, then `$transaction` updating each gift's `sortOrder = index`.
- [x] 1.3 Add unit tests in `gift.service.test.ts` for `reorderGifts`: happy path renumbers by index; non-owner rejected; mismatched/partial/foreign id set rejected with no writes.

## 2. tRPC router

- [x] 2.1 Add `reorder` mutation to `src/server/api/routers/gift.ts` using `reorderGiftsSchema`: resolve `getLocalUserId`, call `reorderGifts`.

## 3. Drag-and-drop UI

- [x] 3.1 Add dependencies: `pnpm add @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities`.
- [x] 3.2 Convert `src/components/features/dashboard/gifts/gift-group.tsx` to a client component wrapping a `DndContext` + `SortableContext`; on drag end build the full `orderedGiftIds` (available ++ purchased ++ hidden), optimistically reorder local state, call `api.gift.reorder` (`@/trpc/react`), and invalidate `gift.list` on settle (refetch on error).
- [x] 3.3 Add a sortable wrapper for `gift-row.tsx` (or a thin `sortable-gift-row.tsx`) using `useSortable` with a drag handle; keep `GiftRow` presentational.
- [x] 3.4 Update `gifts/page.tsx` to pass the full grouped result into the client drag tree so all three groups share one `DndContext`.

## 4. Validation

- [x] 4.1 Run `pnpm check`, `pnpm test`, and `pnpm typecheck`; fix any failures.
- [x] 4.2 Manually verify: owner drags to reorder within a group, order persists on refresh, and the public page reflects the new order within its groupings.
