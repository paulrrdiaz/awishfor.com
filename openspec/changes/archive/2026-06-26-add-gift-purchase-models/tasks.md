## 1. Database Schema

- [x] 1.1 Add `Gift` model to `prisma/schema.prisma` with wishlist relation (`onDelete: Cascade`), optional category relation (`onDelete: SetNull`), `name`, optional `productUrl`/`imageUrl`/`storeName`, optional `priceAmount Decimal @db.Decimal(10, 2)` and `priceCurrency Currency?`, `quantityNeeded Int @default(1)`, `priority GiftPriority @default(medium)`, `visibilityStatus GiftVisibilityStatus @default(available)`, `publicNote`, `internalNote`, `sortOrder Int @default(0)`, `deletedAt DateTime?`, and timestamps
- [x] 1.2 Add `Purchase` model with gift relation (`onDelete: Cascade`), required `guestName`, optional `guestEmail`/`guestPhone`/`message`, `quantity Int @default(1)`, `undoTokenHash String?`, `undoExpiresAt DateTime?`, and timestamps
- [x] 1.3 Add `gifts Gift[]` to `Wishlist` and `gifts Gift[]` to `Category`
- [x] 1.4 Add indexes on `Gift.wishlistId`, `(Gift.wishlistId, Gift.sortOrder)`, `Gift.categoryId`, and `Purchase.giftId`
- [x] 1.5 Create and verify the Prisma migration for the gift and purchase tables
- [x] 1.6 Regenerate the Prisma client without editing generated files manually

## 2. Validation

- [x] 2.1 Add `src/server/validators/gift.schema.ts` with gift ID, wishlist ID, name, optional URL/image/store, optional Decimal price + currency, quantity needed (min 1), priority, visibility, notes, sort order, and create/update schemas
- [x] 2.2 Add `src/server/validators/purchase.schema.ts` with gift ID, required guest name, optional email/phone/message, quantity (min 1), and create/undo schemas
- [x] 2.3 Add validator tests for gift name trimming/length, quantity floor, optional price handling, and purchase guest-name requirement plus contact validation

## 3. Gift Service Layer

- [x] 3.1 Add `src/server/services/gift.service.ts` with create/update/soft-delete helpers using a narrow `db` delegate type
- [x] 3.2 Implement soft delete by setting `deletedAt` and ensure reads exclude soft-deleted gifts
- [x] 3.3 Add service tests for create without optional metadata, hidden gift, soft delete, and soft-deleted exclusion

## 4. Purchase Service Layer And Quantity Rules

- [x] 4.1 Add `src/server/services/purchase.service.ts` with a purchased-quantity helper (sum of active purchases)
- [x] 4.2 Add a remaining-quantity helper (`quantityNeeded - purchased`, floored at zero) that ignores soft-deleted gifts
- [x] 4.3 Add a public-status helper deriving `available` / `partial` / `purchased`
- [x] 4.4 Add a create-purchase helper that rejects quantity below 1 or exceeding remaining quantity, and stores only the hashed undo token plus expiry
- [x] 4.5 Add a delete/undo helper that removes a purchase and restores remaining quantity, validating undo token hash and expiry
- [x] 4.6 Add service tests for purchased/remaining math, status derivation, the over-purchase rejection, soft-deleted exclusion, and undo token validity/expiry

## 5. Documentation And Verification

- [x] 5.1 Update `docs/TASKS.md` milestone 1.4 and 1.5 checkboxes after implementation is complete
- [x] 5.2 Run `pnpm check` and fix any Biome issues
- [x] 5.3 Run `pnpm test` and fix failing tests
- [x] 5.4 Run `pnpm typecheck` and fix type errors
