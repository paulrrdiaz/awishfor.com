## Context

The Category model and its full server surface already exist: `category.service.ts` (list, add, rename, delete, reorder, seedDefaults), `category.ts` router (all six as `protectedProcedure`), and `category.schema.ts`. Ownership is enforced server-side via `getOwnedWishlist` / `getOwnedCategory`. Gifts carry an optional `categoryId` with `onDelete: SetNull`, and `gift.update` already accepts `categoryId` (`string | null`). The dashboard gift view model already exposes `categoryId`.

What's missing is purely UI plus one read-shape addition:
1. No dashboard categories page/components.
2. `category.list` returns bare `Category[]` with no gift counts, so the panel can't show usage.
3. The dashboard gift edit dialog has no category selector (wizard's `GiftForm` does, via a string dropdown).
4. The wizard can only pick from `draft.categories: string[]`; there's no inline add/rename/remove of that list.

UI primitives available: `button`, `input`, `label`, `badge`, `alert-dialog`. No shadcn `select`/`dialog`/`dropdown-menu` — existing dashboard code uses native `<select>` and hand-rolled modals (`edit-gift-dialog.tsx`). We follow that pattern to stay consistent and dependency-free.

## Goals / Non-Goals

**Goals:**
- Owners manage categories fully from the dashboard: add, rename, delete (with confirmation), reorder, and see gift counts + uncategorized count.
- Deleting a category clearly communicates gifts become uncategorized (backed by existing `onDelete: SetNull`).
- Dashboard gift edit can assign/clear a gift's category.
- Wizard Gifts step gets lightweight inline category list editing.

**Non-Goals:**
- Drag-and-drop category reorder (use move up/down buttons; a parallel change owns @dnd-kit for gifts).
- Nested categories, bulk re-assignment UI, standalone categories route.
- Changing any category mutation semantics.

## Decisions

### 1. Add gift counts to `category.list` rather than a separate count endpoint
Extend `listCategories` to return `(Category & { giftCount: number })[]` using Prisma `_count` on the `gifts` relation (filtered to non-deleted gifts). Add a small `getUncategorizedGiftCount(db, { ownerId, wishlistId })` service fn + `category.uncategorizedCount` query. Rationale: the panel needs counts on first paint; `_count` is one query and avoids N+1. Alternative (client computes counts from `gift.list`) was rejected — it couples the categories page to the full gift payload and double-counts hidden/deleted logic.

Count filter: `gifts: { where: { deletedAt: null } }` so soft-deleted gifts don't inflate counts, matching `listDashboardGifts`.

### 2. Reorder via move up/down, not drag-and-drop
The panel renders an ordered list; each row gets ↑/↓ buttons that swap adjacent IDs and call the existing `category.reorder` with the full ordered ID array (the mutation already validates exact-set membership). Rationale: no new dependency, no coupling to the in-flight `add-drag-drop-gift-ordering` change, and reorder is P1 polish. Optimistic local reorder, invalidate `category.list` on settle.

### 3. Reuse the dashboard modal/native-select pattern
New components live in `src/components/features/dashboard/categories/`:
- `category-panel.tsx` (client) — owns `api.category.list` + `uncategorizedCount` queries, renders rows + add form, holds mutation handlers, invalidates on success.
- `category-row.tsx` — name, gift-count badge, inline rename (input toggle), ↑/↓, delete trigger.
- `add-category-form.tsx` — single input + submit, surfaces duplicate/length errors from the mutation.
- `delete-category-dialog.tsx` — `alert-dialog`, warns "N regalos quedarán sin categoría".

Page: `src/app/(protected)/dashboard/wishlists/[id]/categories/page.tsx` (RSC) prefetches and renders `<CategoryPanel wishlistId={id} />`. No `[id]/layout.tsx` exists yet (dashboard nav is task 6.3), so the page is standalone and self-titled for now.

### 4. Gift edit dialog category selector
Add a native `<select>` to `edit-gift-dialog.tsx` bound to `categoryId`, options from `api.category.list` (id → name) plus "Sin categoría" (empty → send `categoryId: null`). Wire into the existing `gift.update` mutate call. The dialog becomes a client component already; it fetches categories with `api.category.list.useQuery({ wishlistId })`. The gift view model lacks `wishlistId`, so pass it from the page/row down to the dialog.

### 5. Wizard lightweight category editing
Add `addCategory`/`renameCategory`/`removeCategory` actions to `wishlist-wizard.store.ts` operating on the `draft.categories: string[]` (dedupe case-insensitively, trim). In `gifts-step.tsx`, add a small "Categorías" inline editor above the gift list: chips with rename/remove and an add input. Removing a category clears it from any gift whose `category` string matched. This stays local-only (no DB) consistent with the wizard's draft model.

## Risks / Trade-offs

- [Counts drift if gift add/delete doesn't invalidate `category.list`] → Gift mutations already `router.refresh()`/invalidate; categories page refetches on focus. Acceptable for MVP; counts are advisory.
- [Move up/down is clunky for many categories] → Wishlists have a handful of categories; drag-and-drop can be a later enhancement reusing the existing `reorder` mutation.
- [Wizard string categories vs DB Category records mismatch] → Wizard is intentionally local/lightweight; seeding to DB Category records already happens at save/publish via `seedDefaults`. Removing a wizard category only edits local draft state.
- [Gift edit dialog gains a query] → Small; `category.list` is cheap and cached by React Query across rows.

## Open Questions

None blocking. Dashboard nav (task 6.3) will later host the categories tab; until then the page is reachable by direct URL.
