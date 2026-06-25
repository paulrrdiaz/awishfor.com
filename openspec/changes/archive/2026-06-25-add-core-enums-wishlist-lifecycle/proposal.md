## Why

A Wish For needs a durable wishlist lifecycle foundation before adding wishlist content, gifts, categories, or purchase flows. The current data model only has synced users, so there is no way to represent draft, published, or archived wishlists consistently across Prisma, services, validators, and APIs.

## What Changes

- Add core domain enums for wishlist status, event type, locale, currency, gift priority, and gift visibility.
- Add wishlist lifecycle fields for publication and archival timestamps.
- Define lifecycle behavior for creating drafts, publishing, archiving, and restoring wishlists.
- Introduce service-level helpers for lifecycle transitions so status and timestamp rules are centralized.
- Add validation schemas for lifecycle inputs and restore target state.

## Capabilities

### New Capabilities

- `wishlist-lifecycle`: Defines core wishlist lifecycle states, transition rules, timestamp semantics, and the domain enums needed by upcoming wishlist and gift models.

### Modified Capabilities

<!-- None. Existing specs do not define wishlist behavior. -->

## Impact

- **Database**: `prisma/schema.prisma` gains enums, a `Wishlist` model foundation, and lifecycle fields.
- **Services**: new `src/server/services/wishlist.service.ts` lifecycle helpers for create, publish, archive, and restore behavior.
- **Validation**: new `src/server/validators/wishlist.schema.ts` schemas for lifecycle operations and enum-backed inputs.
- **Tests**: focused Vitest coverage for lifecycle transition helpers and timestamp handling.
- **Dependencies**: no new runtime dependencies expected.
