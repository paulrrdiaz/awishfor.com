## Why

Publishing a wishlist makes it publicly reachable at `/w/[slug]`, but today `publishWishlist` simply flips the status with no guarantee the wishlist has the minimum valid public content. Owners can publish an empty or incomplete list, and the dashboard has no structured signal of what is missing.

## What Changes

- Add a publish-readiness helper (`src/lib/wishlist/publish-readiness.ts`) that evaluates a wishlist against the minimum publish requirements and returns a checklist-friendly result (per-requirement pass/fail), not just a boolean.
- Required checks: title present, event type present, slug present (and format-valid), language present, currency present, and at least one visible, non-soft-deleted gift.
- Hidden gifts and soft-deleted gifts (`deletedAt` set) do NOT count toward the visible-gift requirement.
- Design settings (theme, layout, fonts, cover image, button style) do NOT block publishing.
- Gate the publish mutation: `publishWishlist` rejects when the wishlist is not ready, surfacing the failed checklist.
- Extend `wishlist.schema.ts` as needed for the readiness result type.

Non-goals: no slug *availability* check here (handled in `add-wishlist-slug-availability`); no dashboard UI rendering (this change provides the data contract the checklist UI will consume).

## Capabilities

### New Capabilities
- `wishlist-publish-readiness`: a deterministic readiness evaluation that returns a per-requirement checklist and gates the publish transition on minimum valid public content.

### Modified Capabilities
- `wishlist-lifecycle`: the "Wishlist publishing" requirement changes from an unconditional status flip to a readiness-gated transition.

## Impact

- New: `src/lib/wishlist/publish-readiness.ts` plus tests.
- Modified: `src/server/services/wishlist.service.ts` (publish gated on readiness; needs gift data in scope), `src/server/validators/wishlist.schema.ts` (readiness result type).
- Depends on Gift fields `visibilityStatus` (`available`/`hidden`) and `deletedAt` already present in the schema.
- No env or migration changes.
