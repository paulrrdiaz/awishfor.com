## Context

The current domain model has `User` and `Wishlist`, plus wishlist lifecycle/content fields. Product milestone 1.3 introduces categories as per-wishlist organization primitives before gifts, public filters, and dashboard category management depend on them.

Categories need to support two flows:

- Initial ordered category creation for a wishlist from event preset names.
- Owner-managed add, rename, delete, and reorder operations through authenticated server APIs.

The project already has service and validator patterns for wishlist logic, and tRPC protected procedures provide Clerk `ctx.userId`. Category ownership checks must resolve that Clerk ID to the local `User` row before mutating wishlist-owned categories.

## Goals / Non-Goals

**Goals:**

- Add a durable `Category` Prisma model scoped to one wishlist.
- Add category service logic for add, rename, delete, reorder, and default-category seeding.
- Expose protected tRPC procedures that only allow the owning user to mutate categories for their own wishlists.
- Validate category names, IDs, wishlist IDs, and reorder payloads with Zod.
- Preserve deterministic category filter ordering with `sortOrder`.

**Non-Goals:**

- No dashboard category management UI.
- No wizard drag-and-drop.
- No nested categories.
- No public wishlist filtering UI.
- No gift model implementation in this change.
- No full event preset configuration if it does not already exist; category seeding should accept ordered names so the preset milestone can call it later.

## Decisions

1. Store categories as first-class wishlist-owned rows.

   Chosen approach: add `Category` with `id String @id @default(cuid())`, `wishlistId String`, `wishlist Wishlist @relation(fields: [wishlistId], references: [id], onDelete: Cascade)`, `name String`, `sortOrder Int @default(0)`, `createdAt`, and `updatedAt`; add `categories Category[]` to `Wishlist`.

   Rationale: categories are owner-managed, ordered, and later referenced by gifts. Embedding category names in wishlist JSON would make reorder/delete behavior and future gift foreign keys harder to enforce.

   Alternative rejected: store string arrays on `Wishlist`. This is simpler initially but loses stable category IDs and does not support future gift assignment cleanly.

2. Use service-level ownership checks for category mutations.

   Chosen approach: each category operation validates that the wishlist belongs to the authenticated local user, either by wishlist ID for create/seed/reorder or by joining through category to wishlist for rename/delete.

   Rationale: protected tRPC only proves the caller is signed in. Category authorization is resource-specific and belongs in server logic so tests can cover it without UI.

   Alternative rejected: trust client-provided `ownerId`. This would make cross-account mutations possible if callers forge IDs.

3. Keep reorder explicit and transaction-safe.

   Chosen approach: accept an ordered list of category IDs for one wishlist and update `sortOrder` values in list order inside a transaction after verifying all IDs belong to that wishlist.

   Rationale: public filters need deterministic order. Full replacement is easier to validate than per-row relative movement and avoids duplicate or missing sort values.

   Alternative rejected: expose individual `moveUp`/`moveDown` mutations. That spreads ordering logic across repeated client calls and is easier to race.

4. Seed default categories through a reusable category service, not hardwired wizard behavior.

   Chosen approach: add a service function that accepts `wishlistId`, authenticated owner context, and ordered category names, then creates categories with sequential `sortOrder`.

   Rationale: milestone 1.3 can satisfy the model/service foundation without depending on the later event preset configuration milestone. When presets are added, they can call the same service.

   Alternative rejected: implement event presets in this change. That expands milestone scope beyond category model/API work and duplicates later planned work.

5. Enforce category name uniqueness per wishlist in service logic.

   Chosen approach: reject add/rename operations that would create a duplicate category name within the same wishlist after trimming and case-folding.

   Rationale: duplicate category chips create confusing filters. A service-level check is enough for MVP and avoids adding a normalized-name column before product needs stronger database-level guarantees.

   Alternative rejected: allow duplicates. This is simpler but creates ambiguous public filters and dashboard management states.

6. Defer gift nullification implementation until the `Gift` model exists, while reserving compatible schema behavior.

   Chosen approach: do not add a `gifts` relation yet if `Gift` does not exist. When `Gift` is added, it should use nullable `categoryId` with `onDelete: SetNull`, matching the PRD.

   Rationale: Prisma cannot model a relation to a nonexistent model. The category schema should not block the later gift change.

   Alternative rejected: create a partial placeholder `Gift` model. That would leak unrelated milestone scope into this change.

## Risks / Trade-offs

- Auth mapping gap -> category router must look up local `User` by `ctx.userId` before calling services; tests should cover missing local user handling.
- Reorder race conditions -> use a transaction and require all submitted IDs to belong to the same wishlist before updating sort orders.
- Duplicate category races -> service-level duplicate checks cover normal use; if concurrent writes become a real issue, add a persisted normalized name plus a composite unique index.
- Default categories before preset config -> expose a seeding function that accepts names instead of coupling this change to future preset files.
- Future gift deletion behavior -> document and reserve nullable gift category relation with `onDelete: SetNull` for the gift milestone.

## Migration Plan

1. Add the `Category` model and `Wishlist.categories` relation to `prisma/schema.prisma`.
2. Create a Prisma migration for the new categories table, wishlist foreign key, and helpful indexes on `wishlistId` and `(wishlistId, sortOrder)`.
3. Regenerate the Prisma client without editing generated files manually.
4. Add validators, service methods, router procedures, and tests.
5. Rollback by dropping the category router/service usage and reverting the migration before production data depends on category rows.

## Open Questions

- None.
