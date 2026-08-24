## Why

The marketing landing page at `/` is the product's acquisition surface and the most heavily optimized route in the codebase, yet nothing measures it. We cannot answer how many people arrive, which occasion they care about, how far down the page they read, which call to action earns the click, or how many visitors continue into the creation wizard. Every marketing decision after launch is currently a guess.

PostHog is already committed to on paper without existing in code. `docs/PRD.md` §19 names eleven product events, `docs/TASKS.md` §9.3 targets `src/lib/analytics/*`, the `legal-pages` capability requires the privacy policy to name PostHog as a processor, and `src/app/(marketing)/(site)/privacy/page.tsx` already discloses it to visitors today. The disclosure is live; the instrumentation is not.

The obstacle is that `/` is governed by a strict performance budget. The latest checked-in production audit, generated 2026-08-18, measured 184,275 bytes of compressed JavaScript against a 225,280-byte ceiling, leaving 41,005 bytes (about 40 KiB) of headroom. A default `posthog-js` installation is larger than that headroom on its own. Analytics must therefore be designed against the budget rather than dropped in and reconciled afterwards.

The public wishlist is the product's guest conversion surface and is equally opaque. We cannot connect a guest who uses the landing-page finder to a wishlist view, a store visit, a purchase attempt, a confirmed gift, or an RSVP. Since this change was first proposed, `/w/[slug]` and `/w/[slug]/[guestSlug]` were moved out of `AppProviders` into a deliberately lean public boundary with their own performance audit. The latest recorded public audit measures 220,985 bytes of compressed JavaScript against the same 225,280-byte ceiling, leaving only 4,295 bytes. Public-wishlist analytics therefore needs its own explicit runtime, privacy, and payload design rather than inheriting the application-shell client.

## What Changes

- Add first-party product analytics to the anonymous marketing route: pageview capture on `/` plus the engagement events that explain how visitors move through the landing page.
- Add a minimal anonymous guest-conversion funnel to published `/w/[slug]` and personalized `/w/[slug]/[guestSlug]` pages: `public_wishlist_viewed`, `gift_store_opened`, `gift_purchase_started`, `gift_marked_purchased`, `gift_purchase_failed`, `gift_purchase_undone`, and `rsvp_submitted`.
- Capture marketing analytics from the client so the statically prerendered `/` document keeps its current rendering classification; request-time capture is rejected because it would force dynamic rendering.
- Use a tiny explicit first-party beacon transport on both performance-gated anonymous surfaces, and mount the fuller PostHog browser runtime only inside the Clerk-backed application shell where no comparable budget gate applies.
- Preserve one visitor identity across the marketing, public-wishlist, and application boundaries so both the landing-to-wizard and guest-finder-to-wishlist funnels resolve to one analytics identity rather than split records.
- Disable automatic pageviews and autocapture on `/w/*`; emit only the named guest-funnel events with sanitized properties so raw wishlist slugs, guest slugs, personalized URLs, and visible page content never reach PostHog.
- Route ingestion through a first-party path on the application's own origin so ordinary content blocking does not silently erase the acquisition data this change exists to collect.
- Add a single typed event contract under `src/lib/analytics/` so event names and properties cannot drift between call sites or between client and future server capture.
- Register the PostHog project key and host through `src/env.ts` validation and `.env.example`, and suppress capture outside production so local and test activity cannot pollute reporting.
- Record the analytics JavaScript delta against both the marketing and public-wishlist performance budgets as explicit verification evidence for this change, without raising or evading the public-wishlist ceiling.

## Capabilities

### New Capabilities

- `product-analytics`: Defines marketing pageview and engagement capture, the public-wishlist guest funnel, visitor identity continuity, ingestion transport, payload budgets, environment isolation, and the privacy constraints that bound what may be collected.

## Impact

- Affected code includes the marketing route group layout, marketing section components that own the instrumented interactions, the application provider boundary, the lean public-wishlist route boundary and its guest interaction components, `next.config.ts` rewrites, `src/env.ts`, `.env.example`, and a new `src/lib/analytics/` module.
- New runtime dependency: `posthog-js` in the Clerk-backed application shell only. The marketing and public-wishlist surfaces use the native beacon/fetch platform APIs and do not ship a PostHog SDK. `posthog-node` is not added because no server-side capture is in scope yet.
- A PostHog project must be provisioned in the **US** cloud region before implementation. Region choice is effectively permanent; changing it later means abandoning or migrating historical data.
- **Session replay, heatmaps, surveys, feature flags, and A/B testing are explicitly out of scope.** Replay in particular would require masking configuration and a privacy-policy change, neither of which this change makes.
- Two product events from `docs/PRD.md` §19, `public_wishlist_viewed` and `gift_marked_purchased`, are now in scope. Purchase conversion is captured in the browser only after the public purchase mutation succeeds, preserving the anonymous visitor identity without adding `posthog-node`. The other nine PRD events remain out of scope and unchecked in `docs/TASKS.md` §9.3. The five additional guest-funnel events introduced here are client interaction or client-confirmed outcome events.
- No Prisma schema, database migration, tRPC contract, or Clerk configuration change is planned. The Clerk webhook remains the natural future home for server-side person properties, but is untouched here.
- `legal-pages` requires no delta: `src/app/(marketing)/(site)/privacy/page.tsx` already names PostHog as a processor. Implementation must confirm the existing wording still describes actual behavior once events flow, and must not broaden what is collected beyond that disclosure.
- No consent banner is added. `docs/PRD.md` states no banner is required absent advertising, retargeting, or third-party pixels, and this change introduces none of those. That position is scoped to the LatAm-first launch and is recorded in `design.md` with explicit review triggers rather than treated as settled for all jurisdictions.
- **Known marketing precondition:** the latest checked-in audit (`artifacts/marketing-performance/summary.json`, generated 2026-08-18 with revision `local`) already exceeds budgets unrelated to this change — median total transfer is 1,354,167 bytes against an 819,200-byte ceiling, two high-priority content images exceed the limit of one, and one mobile run scored 0.82 against the 0.90 per-run floor. The snapshot predates current `main`, so task 1.3 re-runs the audit before implementation, measures this change's JavaScript delta against that baseline, and reports pre-existing failures separately. Resolving them belongs to its own change.
- **Public-route precondition:** `artifacts/public-wishlist-performance/summary.json` records 220,985 bytes of JavaScript against a 225,280-byte ceiling for both light and heavy fixtures, leaving 4,295 bytes. Task 1.4 must re-baseline before analytics code. If the minimal client and instrumentation do not remain within the existing ceiling, implementation pauses for a deliberate redesign; this change does not raise the public budget or hide bytes through deferred loading.
- The former `add-marketing-parallax-motion` change has been archived and its CSS-only work is part of the current route. It no longer represents a concurrent change, but it reinforces the need to re-baseline current `main` rather than reuse the analytics proposal's original August 3 measurements.
