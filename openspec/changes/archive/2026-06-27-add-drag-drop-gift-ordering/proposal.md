## Why

Owners can edit gifts in the dashboard but cannot control their order. `sortOrder` already exists on every gift and both dashboard and public lists already sort by it — but nothing lets an owner change it. Drag-and-drop reordering gives owners direct control over how gifts appear.

## What Changes

- Add a `gift.reorder` tRPC mutation that persists a new `sortOrder` for a wishlist's gifts from an owner-supplied ordered list.
- Add a `reorderGifts` service method (ownership-checked, transactional renumber of non-deleted gifts).
- Add `@dnd-kit` and make dashboard gift rows draggable within each status group (available / purchased / hidden).
- Persist the shared `sortOrder` so the public page keeps the same relative order within its own groupings.

## Capabilities

### New Capabilities
- `gift-ordering`: Owner-driven reordering of gifts within a wishlist — the reorder operation, ownership/validation rules, and the requirement that the shared `sortOrder` is honored by both dashboard and public views.

### Modified Capabilities
<!-- None. `gift-management` already requires sortOrder persistence and a default; no existing requirement changes. -->

## Impact

- New: `gift.reorder` mutation in `src/server/api/routers/gift.ts`; `reorderGifts` in `src/server/services/gift.service.ts`; `reorderGiftsSchema` in `src/server/validators/gift.schema.ts`.
- UI: `src/components/features/dashboard/gifts/gift-group.tsx` + `gift-row.tsx` become a client-side drag context.
- Dependency: adds `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`.
- No DB migration (the `Gift.sortOrder` column already exists).
