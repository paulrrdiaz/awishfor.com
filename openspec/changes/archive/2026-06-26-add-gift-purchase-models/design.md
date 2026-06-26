## Context

The domain model has `User`, `Wishlist`, and `Category`, plus the wishlist lifecycle enums (`GiftPriority`, `GiftVisibilityStatus`, `Currency`) already defined for this milestone. Product milestones 1.4 and 1.5 add gifts and purchases, the last core data primitives before public rendering, the wizard, dashboard management, and the guest purchase flow can be built.

The `Category` change intentionally deferred the gift relation: it documented that `Gift` should later use a nullable `categoryId` with `onDelete: SetNull`. This change fulfills that reservation.

Two flows drive the design:

- Persisting gifts that may be fully manual (no URL, image, or price) or URL-imported, with quantity, visibility, soft delete, and ordering.
- Recording purchases against gifts and deriving quantity-based availability, with a short-lived undo token so guests can reverse a just-created purchase.

Existing service and validator patterns from `wishlist` and `category` apply: pure service functions take a narrow `db` delegate type, validators live in `src/server/validators`, and Decimal/quantity math stays in the service layer.

## Goals / Non-Goals

**Goals:**

- Add durable `Gift` and `Purchase` Prisma models with correct relations, indexes, and delete behavior.
- Complete the `Category` ↔ `Gift` nullable relation with `onDelete: SetNull`.
- Add gift and purchase Zod validators.
- Add service-layer quantity rules: purchased quantity, remaining quantity, derived public status, and the no-over-purchase invariant.
- Exclude soft-deleted gifts from all quantity/progress math.

**Non-Goals:**

- No public purchase mutation, purchase modal, or undo UI (milestone 5).
- No owner purchase drawer or dashboard gift table (milestone 4).
- No URL importer (milestone 4).
- No rate limiting or Upstash wiring (milestone 5).
- No public/dashboard view-model mappers (milestone 1.8).
- No tRPC routers in this change beyond what service tests need; routers land with their UI milestones.
- No hard delete and no user-facing restore for soft-deleted gifts.

## Decisions

1. Store gifts as first-class wishlist-owned rows with optional category.

   Chosen approach: `Gift` with `id String @id @default(cuid())`, `wishlistId String`, `wishlist Wishlist @relation(..., onDelete: Cascade)`, `categoryId String?`, `category Category? @relation(..., onDelete: SetNull)`, optional `productUrl`/`imageUrl`/`storeName`, optional `priceAmount Decimal @db.Decimal(10, 2)` and `priceCurrency Currency?`, `quantityNeeded Int @default(1)`, `priority GiftPriority @default(medium)`, `visibilityStatus GiftVisibilityStatus @default(available)`, `publicNote String?`, `internalNote String?`, `sortOrder Int @default(0)`, `deletedAt DateTime?`, plus timestamps. Add `gifts Gift[]` to `Wishlist` and `Category`.

   Rationale: gifts are owner-managed, ordered, and referenced by purchases. Cascade from wishlist matches existing category behavior; `SetNull` from category matches the PRD and keeps gifts when a category is deleted.

   Alternative rejected: embedding gifts as JSON on the wishlist. Loses stable IDs needed by purchases and ordering.

2. Use soft delete for gifts, hard delete for purchases.

   Chosen approach: gifts carry `deletedAt`; all quantity/progress reads filter `deletedAt: null`. Purchases have no soft-delete column — owner delete and guest undo remove the row.

   Rationale: PRD says soft-deleted gifts must vanish from public/dashboard progress without hard delete, while purchases are "active records" with no cancelled state in MVP, so a hard delete restores availability cleanly.

   Alternative rejected: soft-deleting purchases too. Adds filtering complexity with no MVP benefit and risks double-counting remaining quantity.

3. Keep money as `Decimal(10, 2)` with a separate optional currency.

   Chosen approach: `priceAmount Decimal? @db.Decimal(10, 2)` and `priceCurrency Currency?`, both optional and independent of the wishlist currency.

   Rationale: prices are optional, must avoid float rounding, and an imported gift may carry its own currency distinct from the wishlist default.

   Alternative rejected: storing integer minor units. Decimal is already the project convention and reads cleanly for the small MVP price range.

4. Derive gift availability instead of persisting status.

   Chosen approach: service helpers compute `purchasedQuantity` (sum of active purchase quantities), `remainingQuantity` (`quantityNeeded - purchasedQuantity`, floored at 0), and a derived public status of `available`, `partial`, or `purchased`. Visibility and soft delete are separate concerns layered on top.

   Rationale: derived status cannot drift from purchase rows and keeps the over-purchase check and progress summary consistent from one source of truth.

   Alternative rejected: a persisted `status` column updated on every purchase/undo. Invites drift and extra write paths.

5. Enforce the no-over-purchase invariant in the service layer.

   Chosen approach: a purchase-quantity validator rejects quantity below 1, and a service rule rejects a requested quantity that exceeds current remaining quantity, computed from active purchases on a non-deleted, visible gift.

   Rationale: the database cannot express "sum of children ≤ parent field"; the rule needs the live remaining value and belongs where tests can cover the edge cases.

   Alternative rejected: a database check constraint. Cannot reference an aggregate of child rows.

6. Model the undo token as a hash plus expiry, never the raw token.

   Chosen approach: `undoTokenHash String?` and `undoExpiresAt DateTime?` on `Purchase`. The raw token is returned to the caller once at creation time (consumed by milestone 5) and never stored.

   Rationale: a leaked database row must not let an attacker reconstruct a usable undo token; hashing plus a short expiry bounds the blast radius.

   Alternative rejected: storing the raw token. A read of the table would expose every active undo capability.

7. Land models, validators, and services now; defer routers to their UI milestones.

   Chosen approach: this change adds schema, validators, and service quantity rules with unit tests, but does not add `gift`/`purchase` tRPC routers, since those couple to milestone 4/5 UI and mutations.

   Rationale: keeps the change scoped to the data/logic foundation the later milestones consume, mirroring how the category change staged its work.

   Alternative rejected: building full routers now. Pulls public mutation, undo, and rate-limit concerns into a data-model change.

## Risks / Trade-offs

- Over-purchase races -> compute remaining quantity inside the same transaction as the purchase insert when the mutation milestone lands; this change provides the helper and invariant, the router wraps it transactionally.
- Soft-delete leaks -> every quantity/progress read must filter `deletedAt: null`; service helpers centralize the filter and tests assert deleted gifts are excluded.
- Decimal serialization -> `Decimal` is not directly serializable to the client; mappers in milestone 1.8 convert to string, so services keep `Decimal` internally.
- Undo token exposure -> store only the hash and an expiry; return the raw token once and rely on milestone 5 to transmit and verify it.
- Category nullification -> rely on `onDelete: SetNull` at the database level plus a migration so existing/new gifts survive category deletion.

## Migration Plan

1. Add `Gift` and `Purchase` models, `Wishlist.gifts`, `Category.gifts`, and the nullable `Gift.category` relation with `onDelete: SetNull` to `prisma/schema.prisma`.
2. Create a Prisma migration for the new tables, foreign keys, and indexes on `Gift.wishlistId`, `(Gift.wishlistId, Gift.sortOrder)`, `Gift.categoryId`, and `Purchase.giftId`.
3. Regenerate the Prisma client without editing generated files manually.
4. Add validators, service quantity rules, and tests.
5. Rollback by reverting the migration before production data depends on gift/purchase rows; no data backfill is required because both tables start empty.

## Open Questions

- None.
