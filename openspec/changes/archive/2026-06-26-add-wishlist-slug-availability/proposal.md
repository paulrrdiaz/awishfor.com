## Why

Slugs are global and power the public `/w/[slug]` route, but today the system only validates slug *format* — it has no way to check whether a slug is actually free, suggest one from a title, or let the owner re-save their own wishlist without colliding with their existing slug. Owners need a deterministic availability check before save and before publish.

## What Changes

- Add a slug helper module (`src/lib/slug.ts`): normalize/slugify a title into a valid candidate slug, plus a reusable format validator.
- Add a slug suggestion helper that derives a candidate slug from a wishlist title.
- Add a slug availability service (`src/server/services/slug.service.ts`) that checks a slug against persisted wishlists, with `excludeWishlistId` support so an owner editing their own wishlist sees their current slug as available.
- Add a tRPC endpoint on the wishlist router for live availability checks from the create/edit UI.
- Extend `wishlist.schema.ts` with the availability-check input schema (reusing the existing slug format schema).

Non-goals: no slug redirect/history table, no automatic uniqueness enforcement change at the DB layer (the unique constraint already exists), no publish-readiness gating (tracked separately in `add-wishlist-publish-readiness`).

## Capabilities

### New Capabilities
- `wishlist-slug`: slug normalization/suggestion from a title, format validation, and global availability checks (with self-exclusion) used before save and before publish.

### Modified Capabilities
<!-- None: slug format/uniqueness behavior already documented under wishlist-lifecycle stays as-is; this adds a new capability rather than changing existing requirements. -->

## Impact

- New: `src/lib/slug.ts`, `src/server/services/slug.service.ts`, plus tests.
- Modified: `src/server/api/routers/wishlist.ts` (new availability procedure), `src/server/validators/wishlist.schema.ts` (availability input schema), `src/server/api/root.ts` if the wishlist router is not yet registered.
- No env, migration, or breaking API changes.
