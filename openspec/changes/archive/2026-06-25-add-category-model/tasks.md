## 1. Database Schema

- [x] 1.1 Add `Category` model to `prisma/schema.prisma` with wishlist relation, name, sortOrder, timestamps, and cascade delete from wishlist
- [x] 1.2 Add `categories Category[]` relation to `Wishlist`
- [x] 1.3 Add useful category indexes for wishlist lookup and ordered filters
- [x] 1.4 Create and verify the Prisma migration for the category table
- [x] 1.5 Regenerate the Prisma client without editing generated files manually

## 2. Validation

- [x] 2.1 Add `src/server/validators/category.schema.ts` with category ID, wishlist ID, name, add, rename, delete, reorder, and seed schemas
- [x] 2.2 Add validator tests for trimming, empty names, length limits, duplicate reorder IDs, and complete reorder payload shape

## 3. Service Layer

- [x] 3.1 Add `src/server/services/category.service.ts` with owner authorization helpers that resolve wishlist ownership from local `User`
- [x] 3.2 Implement category listing ordered by `sortOrder` and creation time
- [x] 3.3 Implement category add with deterministic sort order and case-insensitive duplicate-name rejection per wishlist
- [x] 3.4 Implement category rename with ownership checks and duplicate-name rejection per wishlist
- [x] 3.5 Implement category delete while preserving the parent wishlist and leaving future gift nullification compatible with `onDelete: SetNull`
- [x] 3.6 Implement category reorder as an all-category transaction that rejects missing, duplicate, or cross-wishlist IDs
- [x] 3.7 Implement default category seeding from an ordered list of names with sequential sort orders
- [x] 3.8 Add service tests for owner access, non-owner rejection, ordered reads, add, rename, delete, reorder, duplicate names, and default seeding

## 4. tRPC API

- [x] 4.1 Add `src/server/api/routers/category.ts` with protected category procedures for list, add, rename, delete, reorder, and seed defaults
- [x] 4.2 Resolve `ctx.userId` to the local `User` row in category procedures and return `UNAUTHORIZED` or `NOT_FOUND` consistently when needed
- [x] 4.3 Register the category router in `src/server/api/root.ts`

## 5. Documentation And Verification

- [x] 5.1 Update `docs/TASKS.md` milestone 1.3 checkboxes after implementation is complete
- [x] 5.2 Run `pnpm check` and fix any Biome issues
- [x] 5.3 Run `pnpm test` and fix failing tests
- [x] 5.4 Run `pnpm typecheck` and fix type errors
