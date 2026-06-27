## 1. Backend: gift counts

- [x] 1.1 Extend `listCategories` in `src/server/services/category.service.ts` to include a non-deleted gift count per category (Prisma `_count` with `gifts: { where: { deletedAt: null } }`); return `(Category & { giftCount: number })[]`.
- [x] 1.2 Add `getUncategorizedGiftCount(db, { ownerId, wishlistId })` to `category.service.ts`: assert wishlist ownership, return count of gifts where `categoryId: null, deletedAt: null`.
- [x] 1.3 Add `uncategorizedCountSchema` (`{ wishlistId }`) to `src/server/validators/category.schema.ts` and a `uncategorizedCount` query to `src/server/api/routers/category.ts` calling the new service fn.
- [x] 1.4 Add unit tests in `category.service.test.ts` (create if absent): `listCategories` returns correct counts excluding soft-deleted gifts; `getUncategorizedGiftCount` counts only null-category non-deleted gifts; non-owner rejected.

## 2. Dashboard category panel

- [x] 2.1 Add `src/app/(protected)/dashboard/wishlists/[id]/categories/page.tsx` (RSC): resolve params, `notFound()` on error, render `<CategoryPanel wishlistId={id} />` with a title.
- [x] 2.2 Add `src/components/features/dashboard/categories/category-panel.tsx` (client): queries `api.category.list` + `api.category.uncategorizedCount`, renders the add form, ordered rows, and uncategorized count; holds add/rename/delete/reorder mutation handlers that invalidate `category.list` + `uncategorizedCount` on success.
- [x] 2.3 Add `src/components/features/dashboard/categories/add-category-form.tsx`: single name input + submit, surfaces duplicate/length errors from the `add` mutation.
- [x] 2.4 Add `src/components/features/dashboard/categories/category-row.tsx`: name + gift-count badge, inline rename (input toggle), ↑/↓ move buttons (disabled at ends), delete trigger.
- [x] 2.5 Implement reorder in the panel: ↑/↓ swap adjacent IDs and call `api.category.reorder` with the full ordered ID array; optimistic local order, refetch on error.
- [x] 2.6 Add `src/components/features/dashboard/categories/delete-category-dialog.tsx` using `alert-dialog`: warn "N regalos quedarán sin categoría" (N from the row's gift count), confirm calls `category.delete`.

## 3. Dashboard gift category assignment

- [x] 3.1 Pass `wishlistId` down to `edit-gift-dialog.tsx` (from the gifts page → group → row → dialog, or via the gift view model) so it can query categories.
- [x] 3.2 Add a native `<select>` for category to `edit-gift-dialog.tsx`: options from `api.category.list.useQuery({ wishlistId })` plus a "Sin categoría" option; default to `gift.categoryId`; include `categoryId` (empty → `null`) in the existing `gift.update` mutate call.

## 4. Wizard lightweight category editing

- [x] 4.1 Add `addCategory(name)`, `renameCategory(oldName, newName)`, `removeCategory(name)` actions to `src/stores/wishlist-wizard.store.ts` operating on `draft.categories` (trim, case-insensitive dedupe); `removeCategory` clears matching `gift.category` on draft gifts.
- [x] 4.2 Add an inline "Categorías" editor to `src/components/features/wizard/gifts-step.tsx`: chips with rename/remove and an add input wired to the new store actions.

## 5. Validation

- [x] 5.1 Run `pnpm check`, `pnpm test`, and `pnpm typecheck`; fix any failures.
- [x] 5.2 Manually verify: add/rename/delete/reorder categories in the dashboard with live gift counts; deleting a category leaves gifts uncategorized and updates the uncategorized count; gift edit dialog assigns/clears category; public filters follow category order; wizard category add/remove updates draft gifts.
