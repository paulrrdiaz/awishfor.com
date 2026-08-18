## Context

See `proposal.md` for motivation and the capability deltas for observable requirements.

The public route currently calls `auth()` and loads the complete wishlist graph independently from `generateMetadata` and the page component. The query loads gifts and purchases both beneath categories and again at wishlist level even though public categories only need id, name, and order. The resulting dynamic response is private/no-store.

`/w` also inherits the root `ClerkProvider` and `ApplicationLayout`. That application wrapper loads Nuqs, tRPC/React Query, tooltip, toaster, JetBrains Mono, and every configurable public font. The audited 24-gift page transferred about 815 KiB of JavaScript and 360 KiB across ten fonts; per-card GSAP hydration then pushed total blocking time above one second. The LCP hero image itself was correctly prioritized and CLS was zero, so the design keeps those successful behaviors.

Constraints:

- Published wishlists remain unlisted and `noindex`.
- Draft owner preview still depends on server Clerk identity.
- Personalized invite rendering and `openedAt` tracking remain dynamic and private.
- Purchase, undo, filters, sorting, sharing, and RSVP remain behaviorally unchanged.
- No schema migration, new user-configured environment variable, or new dependency is needed.

## Goals / Non-Goals

**Goals:**

- Produce complete, privacy-safe social metadata and a resilient branded share image.
- Share one consistent wishlist snapshot between metadata and page rendering.
- Cache only published public presentation data and invalidate it from every public mutation.
- Remove anonymous wishlist dependencies on Clerk client UI and unrelated application providers.
- Deliver only active fonts and defer non-critical guest interaction code.
- Gate both light and heavy wishlist delivery with deterministic production audits.

**Non-Goals:**

- Full-page static generation or search indexing.
- Changing public URLs, lifecycle semantics, design layouts, or guest business rules.
- Caching personalized guest state, draft previews, or mutation responses.
- Paginating or hiding gifts to manufacture a higher score.
- Making the audit depend on mutable developer or production database records.

## Decisions

### 1. Build metadata from a minimal public projection

Add a server-only metadata projection containing status, slug, title, welcome message, event type, theme id, and the first ordered cover image's URL/dimensions. A shared metadata builder will return:

- the existing `noindex, nofollow` directive;
- absolute canonical `/w/<slug>` URL;
- Open Graph `website` fields and `siteName: "A Wish For"`;
- Twitter `summary_large_image` fields;
- an absolute `/w/<slug>/opengraph-image` URL for published wishlists only.

The wishlist title remains the social title. The trimmed welcome message is the description, falling back to a short event-aware A Wish For description when empty. Rendering escapes user text; metadata helpers enforce bounded title/description lengths without adding owner or guest data.

Personalized metadata calls the parent public metadata builder with `slug` only. It does not resolve the invite and therefore cannot set `openedAt` or serialize `guestSlug`. Draft, archived, and not-found states retain generic/noindex metadata without wishlist-specific social fields.

Alternative rejected: use the first uploaded image directly as `og:image`. Its aspect ratio and crop are uncontrolled, it carries no product identity, and an extensionless third-party URL is a fragile social contract.

### 2. Generate a branded image at the public wishlist route

Implement `src/app/w/[slug]/opengraph-image.tsx` with `ImageResponse`, fixed at 1200×630. The composition uses existing theme tokens, A Wish For identity, event label, wishlist title, and the first cover image when it can be fetched safely. The renderer fetches that image with a short timeout, validates an image content type and bounded response size, and falls back to a theme-derived branded composition on any error.

The image resolver accepts only the minimal published metadata projection. It returns not-found for non-published lifecycle states and shares the published wishlist cache tag so content, image, theme, or slug mutations invalidate it with the page.

Alternative rejected: store generated social cards. That adds storage lifecycle, cleanup, and regeneration state without improving the MVP contract.

### 3. Separate lifecycle resolution from published presentation data

The route data flow becomes:

```text
slug
  │
  ▼
minimal lifecycle lookup ── published ──► tagged published snapshot
  │                                      │
  ├── archived ──► minimal inactive data ├──► metadata
  │                                      └──► page body
  └── draft ──► auth() ── owner ──► uncached preview snapshot
                         └─ other ──► not found
```

A React request memoization boundary keys the route resolution by slug and viewer state so `generateMetadata` and the page use one request snapshot. The published branch uses a Next data cache keyed by wishlist id/slug and tagged with stable `public-wishlist:<id>` and `public-wishlist-slug:<slug>` tags. Draft preview, personalized invite records, archived results, and not-found results remain outside the shared published cache.

The full public query uses explicit `select` projections. Categories select only public category fields; gifts load their required purchases once. Owner contact fields, purchase contact/message fields, internal notes, hidden gifts, and deleted gifts are never selected into the public snapshot.

Alternative rejected: cache the current viewer-aware service wholesale. Its draft-owner result makes accidental cross-user cache leakage too easy.

### 4. Centralize post-commit public cache invalidation

Add one server-only invalidation helper accepting wishlist id plus current and previous slugs when relevant. After a successful database commit, it immediately expires the id/slug tags and revalidates affected public paths. Call it from:

- publish, archive, restore, slug, settings, content, and design updates;
- cover-image add/remove/reorder;
- gift create/update/delete/visibility/reorder/category changes;
- purchase creation, owner purchase changes, and guest undo.

Slug changes invalidate both old and new slug tags/paths. Invalidation happens only after persistence succeeds. Unit tests enumerate public mutation entry points and prove that purchase/undo and slug/lifecycle transitions cannot retain stale public snapshots.

Alternative rejected: short time-based revalidation alone. Even a brief stale window is visible immediately after purchase/undo and contradicts the existing refresh behavior.

### 5. Scope Clerk and application providers by route need

Remove `ClerkProvider` from the root HTML layout. Add a shared scoped Clerk application wrapper to the existing `(auth)`, `(protected)`, and `/create` layouts, which are the client surfaces that consume Clerk hooks/session state. Keep `clerkMiddleware` on public wishlist requests so server `auth()` can still authorize a draft owner preview. Marketing and `/w` render without Clerk client scripts; API authentication remains server-side.

Replace `/w`'s `ApplicationLayout` usage with a public-specific layout. It omits Nuqs, global tooltip, and global toaster. A minimal public interaction provider supplies tRPC/React Query only around the subtrees that currently use public mutations. Moving purchase/RSVP off tRPC is not required for this change, but provider placement must keep unrelated hero and static content outside that hydration boundary.

Alternative rejected: conditionally render the root provider by reading pathname headers. That would make the root layout request-dynamic and couple routing to middleware headers.

### 6. Load active fonts without preloading the full catalog

Keep `next/font` and the existing font ids. Disable automatic preload for the configurable public catalog, extend each font option with its generated variable class, and attach only the resolved heading/body variable classes to the public theme wrapper. Deduplicate the class when both roles use one family. The public utility mono family may be attached with preload disabled, keeping total initial font requests at three or fewer.

`font-display: swap` remains in effect. Tests inspect production HTML/network evidence to ensure inactive catalog families are not preloaded or requested.

Alternative rejected: self-host a second copy of every font under `public/`; it duplicates assets and bypasses the existing `next/font` pipeline.

### 7. Reduce hydration cost without changing list behavior

Keep all visible gifts in the server-rendered document and retain client filtering/sorting. Remove per-card GSAP hover hooks and the results-container GSAP fade in favor of CSS transforms/transitions with `prefers-reduced-motion`. Add `content-visibility: auto` with a stable intrinsic-size fallback to below-the-fold gift cards.

Load the guest gift drawer implementation only after its first product or purchase activation, showing the existing themed loading state during the import and honoring the initiating click. Keep the hero carousel eager only for layouts whose first fold requires it; other optional interaction modules load at their activation boundary. Image priority remains singular: only the active first-fold hero candidate is high priority.

Alternative rejected: paginate or render a truncated gift list. That changes guest discovery and filter semantics and masks rather than fixes hydration overhead.

### 8. Add deterministic public-wishlist performance fixtures

Add `scripts/audit-public-wishlist-performance.mjs` and a versioned config modeled on the existing marketing audit. The script starts a production server with a server-only audit flag and exposes reserved light/heavy wishlist fixtures through the real `/w/[slug]` route. The flag is set only in the spawned audit process, is not part of deployment configuration, and the reserved slugs return normal not-found behavior otherwise.

Fixtures use deterministic local image assets and exercise the same metadata, provider, layout, gift, and hydration path as production. They bypass network database variability; service/query call counts and cache invalidation are covered separately by integration/unit tests. Each fixture receives three cold mobile runs; the heavy fixture also receives desktop comparison. The audit records all required metrics and fails with resource diagnostics when a budget is exceeded.

The existing marketing audit stays independent. A new package script runs the wishlist audit, while the verification task runs both when shared root/provider/font code changes.

## Risks / Trade-offs

- **[Missed invalidation entry point]** → Centralize invalidation, enumerate mutation callers in tests, and invalidate both tag and path after successful commits.
- **[Draft data enters shared cache]** → Split lifecycle resolution from published loading and make the published cache function accept only a published-safe projection.
- **[Scoped Clerk provider breaks an auth flow]** → Cover sign-up, sign-in, recovery, OAuth callback, create, dashboard, and draft-owner preview in route/provider tests before removing the root provider.
- **[Remote cover image slows or breaks social rendering]** → Enforce timeout/type/size checks and always return the deterministic branded fallback.
- **[Font swap changes first paint]** → Retain `font-display: swap`, stable fallback metrics, and visual regression checks for every supported heading/body combination.
- **[Deferred drawer makes first interaction feel delayed]** → Start import on activation, render an immediate themed loading surface, and verify one-click keyboard/pointer behavior.
- **[Audit fixture hides database latency]** → Treat the Lighthouse gate as delivery/hydration evidence and separately assert one request snapshot, slim selects, cache reuse, and invalidation. Production field data remains authoritative when available.
- **[Strict 95 score is noisy]** → Gate medians across three cold runs, retain a 90 per-run floor, and commit every profile/threshold change with rationale.

## Migration Plan

1. Land metadata projection, builder, social image, and privacy tests without changing existing page rendering.
2. Introduce published snapshot caching and centralized invalidation, then verify every mutation and owner-preview isolation.
3. Scope Clerk/application providers and active font classes; run auth-flow and public interaction regression tests.
4. Remove per-card GSAP, defer the drawer, and validate all layouts at mobile and desktop widths.
5. Add deterministic performance fixtures and iterate until both public budgets pass.
6. Run `pnpm check`, `pnpm test`, `pnpm typecheck`, `pnpm build`, the existing marketing audit, and the new public-wishlist audit.

No database migration or data backfill is required. Rollback consists of restoring the provider boundary and uncached loader while retaining privacy-safe metadata; cache and social-image entries are disposable and require no cleanup.
