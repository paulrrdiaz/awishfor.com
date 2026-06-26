## Context

The wishlist slug powers the public route `/w/[slug]` and is globally unique at the DB layer. Format validation already lives in `src/server/validators/wishlist.schema.ts` (`wishlistSlugSchema`, `wishlistSlugPattern` = `^(?!-)[a-z0-9-]{3,60}(?<!-)$`). What is missing is (a) deriving a candidate slug from a free-text title, and (b) a runtime availability check that the create/edit UI can call before save and before publish. The DB unique constraint catches collisions at write time, but the owner needs an availability signal earlier and needs their own current slug to read as "available" while editing.

## Goals / Non-Goals

**Goals:**
- A pure, framework-free slug helper (`src/lib/slug.ts`) usable client- and server-side.
- A DB-backed availability service with `excludeWishlistId` self-exclusion.
- An authenticated tRPC procedure for live checks.
- Reuse the existing format schema/pattern as the single source of truth — no second regex.

**Non-Goals:**
- Slug redirect/history table (explicitly out of scope per docs/TASKS.md §1.6).
- Changing the DB unique constraint (already present).
- Publish-readiness gating (separate change `add-wishlist-publish-readiness`).
- Auto-incrementing/uniquifying suggestions (e.g. `-2` suffixes) — the helper suggests one candidate; the UI loops via the availability endpoint if needed.

## Decisions

- **Single source of truth for the pattern.** Export the existing `wishlistSlugPattern`/`wishlistSlugSchema` from the validator and have `src/lib/slug.ts` import the pattern rather than redefine it. Alternative (duplicate regex in `slug.ts`) rejected: drift risk between validation and availability.
- **`slug.ts` is pure and dependency-free.** `slugify(title)` returns `string | null` (null when fewer than 3 usable chars), using `String.prototype.normalize("NFKD")` + diacritic strip for accents. Keeps it usable in client components and trivially unit-testable.
- **Availability service takes a narrow DB port**, mirroring the existing `WishlistDatabase` pattern in `wishlist.service.ts` (structural typing over a `findFirst`/`findUnique` delegate). This keeps the service unit-testable with a mock and consistent with the codebase style.
- **Availability result shape** is `{ available: boolean; reason?: "invalid" | "taken" }` so the UI can render a specific validation state. Invalid format short-circuits before any DB query.
- **`excludeWishlistId`** is applied as `where: { slug, NOT: { id: excludeWishlistId } }` so the owner's own slug does not count as a collision.
- **Endpoint placement.** Add a `checkSlugAvailability` query to a `wishlist` tRPC router (`src/server/api/routers/wishlist.ts`). If that router does not yet exist, create it and register it in `src/server/api/root.ts`. Use `protectedProcedure` — availability is an owner-flow action.

## Risks / Trade-offs

- [Race between availability check and write] → Mitigation: the DB unique constraint remains the authority; the endpoint is advisory UX. Handle the unique-violation error at write time as the backstop.
- [Transliteration gaps for non-Latin scripts] → Mitigation: when `slugify` yields too few chars it returns null and the UI asks the owner to enter a slug manually; format validation still guards the manual value.
- [Suggestion is not guaranteed unique] → Accepted: the create flow calls the availability endpoint after suggesting; uniquification is a UI concern, not the helper's.

## Migration Plan

Additive only — new files plus a new tRPC query and (if needed) router registration. No schema migration, no env changes, no rollback steps beyond reverting the commit.

## Open Questions

- None blocking. Whether the create UI auto-suffixes a taken suggestion is a UI decision deferred to the create-flow change.
