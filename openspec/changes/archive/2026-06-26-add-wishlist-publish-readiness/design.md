## Context

`publishWishlist` in `src/server/services/wishlist.service.ts` currently performs an unconditional status flip to `published`. The PRD (§"Publish requirements") and docs/TASKS.md §1.7 require a minimum content bar before a wishlist goes public: title, event type, slug, language, currency, and ≥1 visible non-deleted gift. The Gift model already carries `visibilityStatus` (`available`/`hidden`) and a nullable `deletedAt` for soft-deletion, so the visible-gift rule is expressible from existing fields. The dashboard needs a structured per-requirement result, not just a boolean, so it can render a checklist.

## Goals / Non-Goals

**Goals:**
- A pure readiness evaluator (`src/lib/wishlist/publish-readiness.ts`) returning a per-requirement checklist plus an overall `ready` flag.
- Gate `publishWishlist` on readiness, rejecting unready wishlists and surfacing the failed checklist.
- Reuse the existing slug format validator for the slug check (no second regex).

**Non-Goals:**
- Slug *availability/uniqueness* (separate change `add-wishlist-slug-availability`).
- Dashboard checklist UI — this change delivers the data contract only.
- Validating design settings — they explicitly never block publishing.

## Decisions

- **Pure evaluator over an input shape, not a DB query.** `evaluatePublishReadiness(input)` takes the wishlist's required fields plus a gift summary (e.g. `visibleGiftCount` or a gift list it can filter). Keeping it pure makes it trivially unit-testable and reusable by both the publish mutation and a future read-only dashboard query. Alternative (evaluator does its own DB read) rejected: couples the helper to Prisma and complicates testing.
- **Result shape is a checklist.** `{ ready: boolean; checks: { title: boolean; eventType: boolean; slug: boolean; language: boolean; currency: boolean; visibleGift: boolean } }`. Per-requirement booleans let the dashboard render the exact failing items; `ready` is the AND of all checks.
- **Visible-gift rule.** A gift counts only when `visibilityStatus === "available"` AND `deletedAt == null`. The service layer passes the count (or the candidate gifts) so the evaluator stays pure.
- **Gating location.** `publishWishlist` computes/receives readiness and throws when not ready, before the `update`. The thrown error carries the failed checklist so the tRPC layer can surface it (`TRPCError` with the checklist in its cause/data at the router boundary). The service signature gains the gift data it needs (extend `WishlistDatabase` to read the wishlist's required fields + count visible gifts, or accept the readiness result from the caller).
- **Slug check reuses the format validator** from `wishlist.schema.ts` so "slug present and valid" matches the canonical rule.

## Risks / Trade-offs

- [Service now needs gift data in scope] → Mitigation: extend the narrow `WishlistDatabase` port with a gift count/read, keeping structural-typing test mocks straightforward; mirrors the existing port pattern.
- [Readiness drift vs. create/update validation] → Mitigation: readiness reuses the same field schemas/pattern rather than redefining rules.
- [Error surface] → The service throws a typed error; the router maps it to `TRPCError`. Ensure the checklist survives serialization (superjson) so the client can render it.

## Migration Plan

Additive plus one behavioral change to `publishWishlist`. Existing tests that publish a minimal record must be updated to seed a publish-ready wishlist (or to assert the new rejection path). No schema migration; no env changes. Rollback = revert the commit.

## Open Questions

- Whether to expose a standalone read-only `getPublishReadiness` tRPC query now or defer to the dashboard change. Default: defer; the evaluator is exported and the publish mutation is gated, which satisfies §1.7. Revisit when the dashboard checklist UI lands.
