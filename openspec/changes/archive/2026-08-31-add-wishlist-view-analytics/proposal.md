## Why

Wishlist owners can share a public or personalized link but cannot tell whether it reached anyone. The application already sends anonymous public-page events to PostHog for internal product analysis, but those events are neither persisted as owner-facing data nor safely available in the owner dashboard.

Owners need privacy-preserving evidence that their list and each personalized invitation were opened, without turning an unlisted wishlist into an identity-tracking product.

## What Changes

- Persist a privacy-minimized record when a published public wishlist completes a real browser-page view, including whether it used the general or personalized route and the view time.
- Count every recorded personalized-link view against its invite and retain that invite's most recent view time, replacing the current first-open-only behavior.
- Add owner-scoped aggregate view metrics to each wishlist overview: total views, approximate unique visitors, and most recent view time.
- Display each invite's view count and most recent view time in the dashboard Invitados list.
- Keep general-link visitors anonymous; attribute a view to a named invite only when it arrives through that invite's existing personalized URL.
- Exclude owner draft previews, archived/not-found routes, metadata crawls, raw IP addresses, full referrer URLs, and browser-fingerprint data from owner-facing view tracking.

## Capabilities

### New Capabilities

- `wishlist-view-analytics`: Privacy-preserving public wishlist view recording and owner-only aggregate analytics.

### Modified Capabilities

- `guest-invite-management`: The guest-management list exposes each personalized invitation's view count and latest view.
- `personalized-invite-page`: Personalized invite opens record all qualifying views and the latest view time rather than only the first opening time.
- `wishlist-view-models`: Owner dashboard view models expose the aggregate view metrics and invite view fields needed by the dashboard.

## Impact

- Affected areas include the Prisma schema and migration, public wishlist analytics boundary, a first-party recording endpoint/service, the wishlist and invite tRPC/service/view-model contracts, dashboard overview metrics, and guest-list rows.
- PostHog remains internal product analytics. This change does not expose PostHog data or credentials to owners, and it does not add a PostHog dependency.
- A server-held secret will be needed to derive non-reversible anonymous visitor identifiers for approximate unique counts; it must be validated in `src/env.ts` and documented in `.env.example`.
- **Non-goals:** named identity for general public-link visitors, IP or device fingerprint collection, per-view activity logs for owners, source/referrer reporting in the initial dashboard, live notifications, email alerts, and bot-proof analytics.
