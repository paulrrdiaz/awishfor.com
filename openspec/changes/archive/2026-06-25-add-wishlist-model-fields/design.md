## Context

The current wishlist domain has lifecycle enums and a minimal `Wishlist` model with `status`, `publishedAt`, and `archivedAt`. Milestone 1.2 in `docs/TASKS.md` expands this model so a wishlist can back public pages, creation wizard drafts, and owner dashboard management.

The implementation must work with the existing Prisma 7 setup, generated client location, Clerk-synced local `User` model, and existing wishlist service/validator files. No new dependency or environment variable is needed.

## Goals / Non-Goals

**Goals:**

- Persist the owner relationship and all MVP-level wishlist public page fields.
- Keep lifecycle behavior from milestone 1.1 intact.
- Represent language and currency with existing canonical enums.
- Validate slug, optional event details, and defaults at the service boundary.
- Allow missing visual preset fields to be resolved by application preset logic later.

**Non-Goals:**

- No category, gift, purchase, or progress modeling.
- No public wishlist rendering, slug routing, or dashboard UI work.
- No rich-text location, map URL, custom domain, slug redirect history, or public discovery.
- No generated Prisma client edits committed by hand.

## Decisions

### Required owner relation

`Wishlist` will store a required `ownerId` relation to `User`, and `User` will expose a `wishlists` relation.

Rationale: every wishlist is user-owned in the owner dashboard and must be scoped to Clerk-synced local users. A required relation avoids orphan wishlists and keeps authorization checks straightforward.

Alternative considered: storing Clerk user IDs directly on `Wishlist`. Rejected because the app already mirrors Clerk identity into the local `User` table and Prisma relations are simpler for dashboard queries.

### Globally unique slug

`slug` will be globally unique across all wishlists.

Rationale: public URLs use `/w/[slug]` without user or locale prefix, so global uniqueness is required to resolve routes unambiguously.

Alternative considered: per-owner slug uniqueness. Rejected because it would require owner context in public URLs or ambiguous lookup rules.

### Enum-backed locale and currency defaults

`language` will use the existing `Locale` enum with default `es`; `currency` will use the existing `Currency` enum with default `PEN`.

Rationale: the product is Spanish-first and LatAm-friendly, and the enums already define supported values. Defaults let draft creation stay low-friction.

Alternative considered: free-form strings. Rejected because validation, filtering, display labels, and future localization are safer with bounded values.

### Event time as `HH:mm` string

`eventTime` will be stored as an optional string validated as 24-hour `HH:mm`.

Rationale: the MVP needs display-level local event time, not timezone-aware scheduling. A string avoids accidental timezone shifts when rendering public pages.

Alternative considered: storing a full DateTime. Rejected because date and time are optional, timezone policy is not defined, and this is not a calendar/event scheduling feature.

### Preset references as string IDs

`themeId`, `layoutId`, `buttonStyle`, and `fontPairing` will be optional strings. The service and UI can fall back to hardcoded event presets when values are missing.

Rationale: design presets are application-controlled and likely to evolve. Strings avoid schema churn while still allowing persisted user choices.

Alternative considered: Prisma enums for each design dimension. Rejected because visual presets are not stable domain vocabulary yet.

## Risks / Trade-offs

- Required owner relation on an existing table may make migration fail if existing rows are present without owners -> Mitigation: local/dev data can be reset or a migration can backfill/delete orphan draft rows before enforcing non-null ownership.
- Global slug uniqueness can block reuse of archived wishlist slugs -> Mitigation: accept this for MVP because there is no slug redirect history or hard delete workflow.
- Optional design fields push fallback behavior into application code -> Mitigation: validators/services should allow null/undefined and later public view-model logic should resolve missing values from event presets.
- Plain string design IDs can drift from available presets -> Mitigation: keep validation permissive for persistence now, then add stricter preset validation when preset registries are implemented.

## Migration Plan

1. Update `prisma/schema.prisma` with the expanded `Wishlist` fields, `User` relation, unique slug constraint, and useful owner/status indexes.
2. Generate a Prisma migration with `pnpm exec prisma migrate dev` or the project-specific Prisma command used in apply.
3. Update wishlist validators to include create/update shapes for the new fields and defaults.
4. Update wishlist service creation logic to require an owner and persist the expanded input while preserving lifecycle helper behavior.
5. Run `pnpm check`, `pnpm test`, and `pnpm typecheck`.

Rollback: revert the migration and service/validator changes before data depends on the new fields. Once public wishlists are created, rollback would require data export or a compensating migration.

## Open Questions

- Exact max lengths for public copy and design ID fields can be set during implementation; use pragmatic bounds that protect forms and database rows without blocking normal Spanish copy.
