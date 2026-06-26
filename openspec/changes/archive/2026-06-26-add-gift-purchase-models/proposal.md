## Why

The wishlist domain has owners, wishlists, and categories, but no gifts and no way for guests to claim them. Gifts and purchases are the core conversion primitives of the product: without them there is nothing to display publicly, no quantity logic, and no progress tracking. This change adds the durable gift and purchase foundation that public pages, the creation wizard, dashboard management, and the guest purchase flow all depend on.

## What Changes

- Add a `Gift` persistence model owned by one wishlist, with optional category assignment, optional URL/image/store/price, quantity, priority, visibility, public/internal notes, ordering, and soft delete via `deletedAt`.
- Add a `Purchase` persistence model owned by one gift, with required guest name, optional guest contact/message, purchased quantity, and a hashed time-limited undo token.
- Add the `Wishlist.gifts` relation and complete the previously deferred `Category` ↔ `Gift` nullable relation with `onDelete: SetNull`, so deleting a category leaves its gifts uncategorized.
- Add server-side gift and purchase validation schemas and service-layer quantity rules: purchased quantity, remaining quantity, derived public gift status, and an invariant that a purchase cannot exceed remaining quantity.
- Exclude soft-deleted gifts from all progress and remaining-quantity calculations.
- Keep public mutations, the purchase modal/undo UI, rate limiting, owner purchase drawer, importer, and dashboard tables out of this change.

## Capabilities

### New Capabilities
- `gift-management`: Per-wishlist gift storage with optional category, optional commerce metadata, quantity, priority, visibility, notes, ordering, and soft delete.
- `purchase-management`: Per-gift purchase records and the quantity rules that derive purchased/remaining quantity, public gift status, and enforce the no-over-purchase invariant.

### Modified Capabilities
- `wishlist-lifecycle`: Wishlists gain a gifts relation.
- `category-management`: Categories gain a gifts relation, and category deletion now nullifies the assigned gifts' category via `onDelete: SetNull` instead of being a reserved future behavior.

## Impact

- `prisma/schema.prisma`: Add `Gift` and `Purchase` models, `Wishlist.gifts`, `Category.gifts`, and the nullable `Gift.category` relation with `onDelete: SetNull`.
- Prisma migrations/generated client: Add a migration for the new tables, foreign keys, and indexes; regenerate the client during implementation.
- `src/server/validators/gift.schema.ts`, `src/server/validators/purchase.schema.ts`: Add input schemas.
- `src/server/services/gift.service.ts`, `src/server/services/purchase.service.ts`: Add gift persistence helpers and purchase quantity rules.
- Tests: Add focused validator and service tests for gift soft delete, quantity math, derived status, and the over-purchase invariant.
