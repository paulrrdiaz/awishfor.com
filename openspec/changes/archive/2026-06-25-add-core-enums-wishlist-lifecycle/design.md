## Context

The repository currently has a synced `User` model but no wishlist domain model, service layer, or validators. Milestone 1.1 in `docs/TASKS.md` asks for the first wishlist lifecycle foundation: core enums, lifecycle fields, and helpers for draft, published, archived, and restore behavior.

## Goals / Non-Goals

**Goals:**
- Introduce Prisma enums for wishlist status, event type, locale, currency, gift priority, and gift visibility.
- Add the initial `Wishlist` persistence shape needed for lifecycle state and timestamps.
- Centralize lifecycle transitions in `src/server/services/wishlist.service.ts`.
- Add zod validators in `src/server/validators/wishlist.schema.ts` for lifecycle inputs.
- Cover lifecycle timestamp behavior with focused Vitest tests.

**Non-Goals:**
- No complete wishlist content model, owner relation, slug, design settings, or event details; those belong to Milestone 1.2.
- No gift, category, purchase, or public wishlist page behavior.
- No hard delete or slug redirect history.

## Decisions

- **Introduce the `Wishlist` model foundation now.** Add only lifecycle-related fields required by this milestone: id, `status`, `publishedAt`, `archivedAt`, `createdAt`, and `updatedAt`. Rationale: lifecycle fields need a concrete model to migrate and test. Alternative: define only enums now, but that would not satisfy the lifecycle acceptance criteria.

- **Use Prisma enum names with the requested values.** Keep `WishlistStatus` values as `draft | published | archived` and related enums exactly as listed in the task. Rationale: this keeps generated Prisma types aligned with validator and service schemas, without adding translation layers.

- **Make lifecycle helpers service-level functions.** Implement create, publish, archive, and restore helpers in `src/server/services/wishlist.service.ts`, taking the shared Prisma client or a transaction-compatible client. Rationale: transition rules remain reusable by future tRPC routers and tests. Alternative: put transition logic directly in routers later, but that would duplicate timestamp rules.

- **Preserve `publishedAt` on restore to draft.** Restoring clears only `archivedAt`. If restoring to `published`, set `publishedAt` when missing. Rationale: the task only requires restore to clear `archivedAt`; preserving publication history avoids accidental data loss.

## Risks / Trade-offs

- **Temporary sparse `Wishlist` model** -> Later migrations will add owner and content fields from Milestone 1.2; keep this migration minimal and explicitly named.
- **Enum value casing differences** -> Use the exact task values in Prisma and zod so API validation and database writes match.
- **Timestamp flakiness in tests** -> Inject `now` or assert timestamp presence/ranges instead of relying on exact wall-clock equality.

## Migration Plan

1. Add enums and the lifecycle-only `Wishlist` model to `prisma/schema.prisma`.
2. Generate a Prisma migration with `pnpm prisma migrate dev`.
3. Add service and validator files plus lifecycle tests.
4. Roll back by reverting the migration and removing the service/validator files before any dependent wishlist fields are introduced.

## Open Questions

- Should Milestone 1.2 make the owner relation required immediately, or will any existing lifecycle-only rows need a backfill before enforcing ownership?
