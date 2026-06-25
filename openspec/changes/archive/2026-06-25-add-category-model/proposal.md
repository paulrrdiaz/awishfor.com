## Why

Wishlist owners need categories so gifts can be organized by event-specific groupings and public pages can expose predictable category filters. This milestone adds the durable category foundation before gift assignment, public filtering, and dashboard category management depend on it.

## What Changes

- Add a `Category` persistence model owned by a single wishlist, with name, sort order, and timestamps.
- Add a wishlist-to-categories relation so each wishlist can store ordered categories, including default categories created from event presets.
- Add server-side category validation, service methods, and a protected tRPC router for owner-only add, rename, delete, and reorder operations.
- Ensure category deletion preserves gifts by leaving assigned gifts uncategorized once the gift model exists.
- Keep wizard drag-and-drop and full category UI implementation out of this change.

## Capabilities

### New Capabilities
- `category-management`: Defines per-wishlist category storage, ordering, owner-managed mutations, and safe category deletion behavior.

### Modified Capabilities
- `wishlist-lifecycle`: Wishlists gain an ordered categories relation and can be initialized with default categories from event presets.

## Impact

- `prisma/schema.prisma`: Add `Category` model and `Wishlist.categories` relation.
- Prisma migrations/generated client: Add a migration for the new table and regenerate the client during implementation.
- `src/server/services/category.service.ts`: Add category CRUD/reorder business logic.
- `src/server/validators/category.schema.ts`: Add input schemas for category mutations.
- `src/server/api/routers/category.ts` and `src/server/api/root.ts`: Add protected category tRPC endpoints.
- Tests: Add focused service and validator tests for category ownership, ordering, and deletion behavior.
