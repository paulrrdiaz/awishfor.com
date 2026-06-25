## 1. Database Model

- [x] 1.1 Add `WishlistStatus`, `EventType`, `Locale`, `Currency`, `GiftPriority`, and `GiftVisibilityStatus` enums to `prisma/schema.prisma` with the values from `docs/TASKS.md`.
- [x] 1.2 Add a lifecycle-only `Wishlist` model with `id`, `status`, `publishedAt`, `archivedAt`, `createdAt`, and `updatedAt`.
- [x] 1.3 Generate and inspect a Prisma migration for the new enums and `Wishlist` model.
- [x] 1.4 Regenerate the Prisma client and confirm generated enum types are available from `src/generated/prisma`.

## 2. Validation

- [x] 2.1 Create `src/server/validators/wishlist.schema.ts`.
- [x] 2.2 Add zod schemas for wishlist lifecycle enum values and restore target status.
- [x] 2.3 Ensure restore validation only accepts `draft` or `published` as target states.

## 3. Lifecycle Service

- [x] 3.1 Create `src/server/services/wishlist.service.ts` using a Prisma-client-compatible database parameter.
- [x] 3.2 Add a create helper that persists wishlists as `draft` with null lifecycle timestamps by default.
- [x] 3.3 Add a publish helper that sets status to `published`, sets `publishedAt`, and clears `archivedAt`.
- [x] 3.4 Add an archive helper that sets status to `archived` and sets `archivedAt` without deleting the row.
- [x] 3.5 Add a restore helper that clears `archivedAt`, restores to `draft` or `published`, preserves existing `publishedAt`, and sets `publishedAt` when restoring to `published` without one.

## 4. Tests

- [x] 4.1 Add focused Vitest coverage for draft creation defaults.
- [x] 4.2 Add tests for publish and archive timestamp behavior.
- [x] 4.3 Add tests for restore-to-draft and restore-to-published behavior.
- [x] 4.4 Add tests for restore validator rejection of `archived` as a target state.

## 5. Verification

- [x] 5.1 Run `pnpm test` and fix failures.
- [x] 5.2 Run `pnpm typecheck` and fix type errors.
- [x] 5.3 Run `pnpm check` and fix Biome issues.
- [x] 5.4 Confirm the implemented behavior satisfies every `wishlist-lifecycle` spec scenario.
