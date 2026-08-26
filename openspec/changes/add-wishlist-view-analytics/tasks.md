## 1. Persistence and configuration

- [x] 1.1 Add the private wishlist-view data model, invite `viewCount` and `lastViewedAt` fields, relations, cascade behavior, and dashboard query indexes to the Prisma schema.
- [x] 1.2 Generate and apply the Prisma migration while preserving existing invite `openedAt` values and initializing new invite metrics safely.
- [x] 1.3 Add the server-only view-analytics HMAC secret to environment validation and `.env.example`, with production-safe disablement when unavailable.

## 2. Public view recording

- [x] 2.1 Implement the server-side signed, short-lived authorization for a resolved published wishlist view and the wishlist-scoped anonymous visitor hash utility.
- [x] 2.2 Implement the first-party public view-recording endpoint/service with authorization, payload bounds, published-state and invite-relationship validation, transactional event creation, and atomic invite aggregate updates.
- [x] 2.3 Update personalized invite resolution so it no longer writes `openedAt` during server rendering and instead passes resolved invite tracking context to the public page.
- [x] 2.4 Extend the lean public analytics provider to emit one best-effort first-party view signal after hydration without delaying rendering or changing existing PostHog event behavior.

## 3. Owner analytics read contracts

- [x] 3.1 Add owner-scoped service queries for wishlist total views, wishlist-scoped approximate unique visitors, and latest view time.
- [x] 3.2 Extend the dashboard overview and invite view models, mappers, and tRPC/router read paths to return analytics only for the wishlist owner and omit them for collaborators.

## 4. Dashboard presentation

- [x] 4.1 Add total views, approximate unique visitors, and latest-view states to the main wishlist overview metrics, following the established dashboard visual system and explicit zero-data copy.
- [x] 4.2 Add view count and latest-view states to owner guest-list rows while preserving search, RSVP filters, existing empty states, and collaborator-safe rendering.
- [x] 4.3 Update the Spanish privacy policy to accurately disclose the new first-party, privacy-minimized view measurement and owner visibility.

## 5. Verification

- [x] 5.1 Add focused tests for signing/hashing, recording authorization and validation failures, public versus personalized attribution, repeated personalized views, and cascade-safe persistence behavior.
- [x] 5.2 Add focused tests for owner-only overview and invite analytics contracts, serialized dates, zero-data states, and dashboard metric/guest-row rendering.
- [x] 5.3 Add public analytics-provider tests proving one first-party signal per mount and no signal for preview or disabled tracking.
- [x] 5.4 Re-run the public-wishlist performance audit and record the JavaScript delta, confirming the existing budget remains satisfied.
- [x] 5.5 Run `pnpm check`, `pnpm test`, and `pnpm typecheck`; report any unrelated pre-existing failure separately.
