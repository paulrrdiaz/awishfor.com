## Why

The category backend (service, router, validators) ships full CRUD + reorder + seeding, but owners have no UI to use it. Today categories can only be assigned via the wizard gift form dropdown, and there is no way to add, rename, delete, reorder, or see usage of categories after a wishlist exists. This blocks the public gift filters from being curated and leaves Milestone 4.6 incomplete.

## What Changes

- Add a dashboard **categories management panel** at `/dashboard/wishlists/[id]/categories`: list categories in sort order, add, rename, delete (with confirmation), reorder, and show per-category gift counts.
- Surface an **"uncategorized" gift count** so owners understand what deleting a category does (gifts move to uncategorized, not deleted).
- Extend `category.list` (service + router) to return each category's **gift count**; add a query for the wishlist's uncategorized gift count.
- Add **category assignment** to the dashboard gift edit dialog (currently missing), so dashboard gifts can be moved between categories.
- Add **lightweight category management to the wizard** Gifts step: owners can add/rename/remove the local `draft.categories` string list inline (not just pick from a fixed dropdown).
- Category reorder UI uses **move up/down controls** (drives the existing `category.reorder` mutation); no drag-and-drop dependency in this change.

Non-goals: nested/sub-categories; category drag-and-drop; bulk gift re-assignment UI; a standalone categories route outside a wishlist.

## Capabilities

### New Capabilities
- `category-management-ui`: dashboard panel and wizard controls for owners to add, rename, delete, reorder, and inspect categories, including gift counts and uncategorized handling.

### Modified Capabilities
- `category-management`: `list` returns per-category gift counts and the service exposes an uncategorized gift count for the wishlist (read-shape addition; no mutation behavior change).
- `dashboard-gift-management`: the owner gift edit action can change a gift's category assignment.

## Impact

- New UI: `src/components/features/dashboard/categories/*`, `src/app/(protected)/dashboard/wishlists/[id]/categories/page.tsx`.
- Modified UI: `src/components/features/dashboard/gifts/edit-gift-dialog.tsx`, `src/components/features/wizard/gifts-step.tsx` (and wizard store category actions).
- Backend: `src/server/services/category.service.ts`, `src/server/api/routers/category.ts`, `src/server/validators/category.schema.ts` (count query); `src/server/services/gift.service.ts` / `gift.schema.ts` if gift update needs `categoryId`.
- No new env vars, no new dependencies, no schema migration (Category model already exists).
