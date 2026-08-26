## Context

The public page already emits a client-side `public_wishlist_viewed` event to PostHog through a small, performance-sensitive analytics provider. That event is intentionally anonymous and is disabled outside production; PostHog has no owner authorization model or dashboard contract. Personalized invite resolution currently performs a best-effort server write that sets `Invite.openedAt` once, which can occur during an automated render and cannot count later opens or provide aggregate wishlist metrics.

The dashboard overview already has a metrics-card boundary and the guest-list data is returned through owner-access-checked tRPC procedures. Public wishlist pages are anonymous, unlisted, and performance-gated, so view recording must keep their client addition minimal and must never delay rendering.

## Goals / Non-Goals

**Goals:**

- Create durable, owner-authorized view data independent of PostHog.
- Attribute personalized page views to the resolved invite while keeping plain-link visitors anonymous.
- Produce cheap enough overview and guest-list reads for the existing dashboard surfaces.
- Preserve current public rendering, preview, metadata, and RSVP behavior.

**Non-Goals:**

- Prevent every bot, prefetch, repeat request, or malicious replay from affecting the approximate metrics.
- Identify or profile people who use the general public link.
- Export raw event histories, add traffic-source reports, or send notifications.

## Decisions

### Store private first-party view records and invite aggregates

Add a `WishlistView` relation that records `wishlistId`, optional `inviteId`, a wishlist-scoped anonymous visitor hash, and `createdAt`; cascade it with its wishlist (and invite when attributed). Add `viewCount` (default `0`) and `lastViewedAt` to `Invite`, while retaining `openedAt` as the historical first qualifying view.

Every accepted view creates one event row. In the same transaction, an attributed view atomically increments `Invite.viewCount`, updates `lastViewedAt`, and sets `openedAt` only if it is still null. Overview totals, latest view, and distinct visitor count are derived from the event relation; invite rows use their maintained aggregate fields. This avoids a second denormalized wishlist counter that could drift while keeping invite-list reads cheap.

Alternative rejected: querying PostHog from dashboard pages. It couples product data to an external reporting API, creates owner authorization and retention problems, and cannot provide a trustworthy transactional invite counter. Alternative rejected: storing only counters. It cannot derive approximate unique visitors or recover aggregate integrity after concurrent writes.

### Client-confirmed view signal with a short-lived signed authorization

When a published page is rendered, the server supplies the public analytics provider a short-lived signed view authorization containing the resolved wishlist ID and, for a personalized page, its invite ID. After hydration, the existing provider emits one first-party recording request alongside its existing PostHog event. The endpoint validates the signature, expiry, current published state, and invite-to-wishlist relationship before writing; it returns no analytics data.

The signed authorization avoids accepting arbitrary wishlist/invite identifiers from the browser while requiring no session or guest account. The transport uses the existing beacon/fetch fallback pattern, is best-effort, and must not throw or block the public page. The token is deliberately replay-tolerant within its short lifetime: analytics remain approximate rather than an access-control boundary.

Alternative rejected: recording on server render. It counts crawlers and metadata requests, fails the agreed "actual page load" definition, and risks making public request latency depend on writes. Alternative rejected: an unauthenticated endpoint keyed only by public slugs. It makes targeted metric inflation trivial.

### Derive a per-wishlist anonymous visitor hash on the server

The browser reuses the existing anonymous analytics identifier but sends it only to the first-party recording endpoint. The endpoint derives and stores an HMAC hash of that identifier scoped to the wishlist, using a new server-only environment secret, and immediately discards the original value. Unique visitors are calculated as distinct stored hashes for one wishlist only.

Scoping prevents the persisted value from correlating a browser across wishlists. No IP, user agent, full referrer, full URL, guest slug, or browser-fingerprint value is stored. The public endpoint must accept only a bounded identifier and payload, and configuration absence must disable tracking safely.

Alternative rejected: IP-based deduplication. It is less reliable for households/mobile networks and increases privacy exposure. Alternative rejected: exposing the global analytics identifier directly to the database or dashboard. It creates unnecessary cross-page correlation risk.

### Preserve owner-only dashboard visibility

The existing access check returns whether the caller is the owner. Overview and invite-list queries will collect and map analytics only when that flag is true. Owner dashboard cards will add Spanish labels for total views, approximate unique visitors, and latest view; owner guest rows will add views and last view. Collaborator views retain the current management data but omit analytics fields and UI.

Alternative rejected: treating every collaborator as an analytics viewer. The request specifies the owner, and invitation views can imply an invitee's engagement; defaulting to the stricter audience preserves room for an explicit collaboration-policy change later.

## Risks / Trade-offs

- [Views are approximate: headless browsers or a token replay can still record a view.] → Require client completion, short-lived authorizations, and server validation; label unique visitors as approximate and do not use counts for billing or security.
- [Client transport can be interrupted or blocked.] → Keep the write best-effort and show no error to a guest; metrics can undercount rather than affect page usability.
- [The event table grows with public traffic.] → Index by wishlist and creation time plus invite and creation time; dashboard queries stay scoped to one wishlist. Revisit retention/rollups only when observed volume warrants it.
- [Public-route JavaScript budget is tight.] → Reuse the existing analytics provider, anonymous-id utility, and beacon transport; extend the public performance audit and reject a design that breaches its current ceiling.
- [Existing `openedAt` values were recorded during server rendering.] → Preserve them during migration as legacy first-open data; new writes change it only for rows where it is null.

## Migration Plan

1. Add the view-record model, invite aggregate columns, foreign keys, and indexes in a Prisma migration. Existing invitations start with a zero count and null last-view timestamp; their existing `openedAt` values remain intact.
2. Add the server-only HMAC secret to environment validation and deployment configuration before enabling recording in production.
3. Deploy the endpoint and dashboard read path with tracking disabled when the secret is unavailable; then deploy the public client signal.
4. Re-run the public-wishlist performance audit and verify production with a general link and a personalized link. Confirm no view is created for draft preview or metadata requests.
5. Roll back by disabling the secret/client signal. Existing view records and columns are additive and may remain safely unread; no public route or RSVP data requires destructive rollback.
