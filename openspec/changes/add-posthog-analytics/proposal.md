## Why

The marketing landing page at `/` is the product's acquisition surface and the most heavily optimized route in the codebase, yet nothing measures it. We cannot answer how many people arrive, which occasion they care about, how far down the page they read, which call to action earns the click, or how many visitors continue into the creation wizard. Every marketing decision after launch is currently a guess.

PostHog is already committed to on paper without existing in code. `docs/PRD.md` §19 names eleven product events, `docs/TASKS.md` §9.3 targets `src/lib/analytics/*`, the `legal-pages` capability requires the privacy policy to name PostHog as a processor, and `src/app/(marketing)/privacy/page.tsx` already discloses it to visitors today. The disclosure is live; the instrumentation is not.

The obstacle is that `/` is governed by the strictest budget in the project. The last recorded production audit measured 186,017 bytes of compressed JavaScript against a 225,280-byte ceiling, leaving roughly 38 KiB of headroom. A default `posthog-js` installation is larger than that headroom on its own. Analytics must therefore be designed against the budget rather than dropped in and reconciled afterwards.

## What Changes

- Add first-party product analytics to the anonymous marketing route: pageview capture on `/` plus the engagement events that explain how visitors move through the landing page.
- Capture marketing analytics from the client so the statically prerendered `/` document keeps its current rendering classification; request-time capture is rejected because it would force dynamic rendering.
- Select a client analytics runtime small enough to fit the marketing JavaScript budget with headroom left over, and mount the fuller runtime only inside the application shell where no budget gate applies.
- Preserve one visitor identity across the marketing route and the application shell so the landing-to-wizard funnel resolves to a single person rather than two.
- Route ingestion through a first-party path on the application's own origin so ordinary content blocking does not silently erase the acquisition data this change exists to collect.
- Add a single typed event contract under `src/lib/analytics/` so event names and properties cannot drift between call sites or between client and future server capture.
- Register the PostHog project key and host through `src/env.ts` validation and `.env.example`, and suppress capture outside production so local and test activity cannot pollute reporting.
- Record the analytics JavaScript delta against the marketing performance budget as explicit verification evidence for this change.

## Capabilities

### New Capabilities

- `product-analytics`: Defines marketing pageview and engagement capture, visitor identity continuity, ingestion transport, payload budget, environment isolation, and the privacy constraints that bound what may be collected.

## Impact

- Affected code includes the marketing route group layout, marketing section components that own the instrumented interactions, the application provider boundary, `next.config.ts` rewrites, `src/env.ts`, `.env.example`, and a new `src/lib/analytics/` module.
- New runtime dependencies: a PostHog browser client. `posthog-node` is not added in this change because no server-side capture is in scope yet.
- A PostHog project must be provisioned in the **US** cloud region before implementation. Region choice is effectively permanent; changing it later means abandoning or migrating historical data.
- **Session replay, heatmaps, surveys, feature flags, and A/B testing are explicitly out of scope.** Replay in particular would require masking configuration and a privacy-policy change, neither of which this change makes.
- The eleven product events in `docs/PRD.md` §19 (`wizard_started`, `wishlist_created`, `wishlist_published`, the `gift_import_*` family, `gift_added`, `public_wishlist_viewed`, `gift_marked_purchased`, `qr_downloaded`, `whatsapp_share_clicked`) are **out of scope** and remain unchecked in `docs/TASKS.md` §9.3. Most of them are server-side truths that belong to a follow-up change introducing `posthog-node`. This change deliberately proves the top of the funnel first.
- No Prisma schema, database migration, tRPC contract, or Clerk configuration change is planned. The Clerk webhook remains the natural future home for server-side person properties, but is untouched here.
- `legal-pages` requires no delta: `src/app/(marketing)/privacy/page.tsx` already names PostHog as a processor. Implementation must confirm the existing wording still describes actual behavior once events flow, and must not broaden what is collected beyond that disclosure.
- No consent banner is added. `docs/PRD.md` states no banner is required absent advertising, retargeting, or third-party pixels, and this change introduces none of those. That position is scoped to the LatAm-first launch and is recorded in `design.md` with explicit review triggers rather than treated as settled for all jurisdictions.
- **Known precondition:** the last recorded audit (`artifacts/marketing-performance/summary.json`, generated 2026-08-03) already exceeds two budgets unrelated to this change — total transfer at 1,297,952 bytes against a 819,200-byte ceiling, and two high-priority content images against a limit of one. That snapshot also predates commit `fe0b7bf`, so it is stale as well as failing. This change does not fix those failures; task 1.3 re-runs the audit against current `main` to establish a real baseline, then measures this change's JavaScript delta against it and reports the pre-existing failures separately so they are not misattributed. Resolving them belongs to its own change.
- A second change, `add-marketing-parallax-motion`, is active on the same route. It is CSS-only by design and adds no JavaScript, so the two do not compete for the marketing JavaScript budget — but whichever lands second inherits the other's audit numbers and should re-baseline rather than compare against a stale run.
