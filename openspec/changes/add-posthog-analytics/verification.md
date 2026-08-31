# Verification evidence

## 1.1 Identity-continuity spike

Date: 2026-08-23

Tested `posthog-js-lite` 4.10.4 and `posthog-js` 1.418.10 in the same
browser storage context with project key `spike-project-key` and
`localStorage` persistence. Both clients use the key
`ph_spike-project-key_posthog`.

When lite initializes first, it writes `anonymous_id` but not `distinct_id`.
Full PostHog subsequently generates a separate `distinct_id`; the two values
did not match. When full PostHog initializes first, lite reads its
`distinct_id`, but that one-way behavior is insufficient for the marketing to
application transition.

Finding: the runtimes do **not** safely interoperate when the minimal runtime
initializes first.

## 1.2 Runtime decision

Use `posthog-js-lite` on marketing and public-wishlist routes and full
`posthog-js` in the Clerk-backed application shell. A shared analytics
identifier helper will own the anonymous identifier and initialize every
runtime from it, with regression coverage for marketing-to-application and
marketing-to-public transitions.

## 1.5 PostHog US Cloud project

The project was provisioned in PostHog US Cloud on 2026-08-23. Its configured
API host is `https://us.i.posthog.com`; the first-party rewrite also proxies
PostHog browser assets through `https://us-assets.i.posthog.com`.

## 1.3 Marketing baseline (before application analytics code)

`pnpm audit:marketing` ran on 2026-08-23. The audit writes production evidence
to `artifacts/marketing-performance/summary.json` and exits non-zero because
of pre-existing failures.

| Metric | Result | Budget / note |
| --- | ---: | --- |
| Median JavaScript | 184,258 B | 225,280 B (41,022 B headroom) |
| Median LCP | 2,222 ms | 2,500 ms |
| Median CLS | 0.000 | 0.100 |
| Median TBT | 27 ms | 200 ms |
| Median total transfer | 1,343,652 B | 819,200 B — pre-existing failure |
| High-priority content images | 2 | 1 — pre-existing failure |
| Mobile performance runs | 87, 96, 99 | the 87 run is below the 90 floor |

The audit is accepted here as baseline evidence only. Its failed total-transfer,
high-priority-image, and one low-performance-run checks predate analytics and
must be reported separately from the post-change JavaScript delta.

## 1.4 Public-wishlist baseline (before application analytics code)

`pnpm audit:public-wishlist` ran on 2026-08-23 and wrote production evidence
to `artifacts/public-wishlist-performance/summary.json`.

| Fixture | JavaScript | Headroom to 225,280 B | Result |
| --- | ---: | ---: | --- |
| Light | 212,020 B | 13,260 B | Within budget |
| Heavy | 212,020 B | 13,260 B | Within budget |

Both fixtures also remain within the other configured performance budgets. The
225,280-byte JavaScript ceiling remains unchanged and is a hard post-change
gate.

## Public-wishlist post-instrumentation gate — blocked

`pnpm audit:public-wishlist` ran after adding the minimal PostHog client on
2026-08-23. Both fixtures exceeded the fixed JavaScript ceiling:

| Fixture | Baseline JavaScript | Post-instrumentation JavaScript | Delta | Ceiling |
| --- | ---: | ---: | ---: | ---: |
| Light | 212,020 B | 313,142 B | +101,122 B | 225,280 B |
| Heavy | 212,020 B | 313,142 B | +101,122 B | 225,280 B |

The `posthog-js-lite` package does not fit the public route in this build. Per
the product-analytics specification, implementation is paused for a design
revision; the JavaScript budget must not be raised or evaded.

## Public-wishlist post-redesign gate — passed

After replacing the Lite SDK with the explicit first-party beacon transport,
`pnpm audit:public-wishlist` completed on 2026-08-23 with the following mobile
median JavaScript results:

| Fixture | Baseline JavaScript | Post-redesign JavaScript | Delta | Ceiling |
| --- | ---: | ---: | ---: | ---: |
| Light | 212,020 B | 215,779 B | +3,759 B | 225,280 B |
| Heavy | 212,020 B | 215,779 B | +3,759 B | 225,280 B |

Both fixtures remain within the fixed ceiling. The measured addition is the
explicit transport and public event boundary; the public route does not load
either PostHog browser SDK.

## Marketing post-instrumentation gate

`pnpm audit:marketing` completed on 2026-08-23. Marketing JavaScript measured
185,936 B versus the 184,258 B pre-instrumentation baseline: a **+1,678 B**
delta, within the 10 KiB analytics limit and the 225,280 B route ceiling.

The audit still reports the pre-existing total-transfer failure (1,348,573 B
against 819,200 B) and two high-priority content images. They are independent
of this change; neither is a JavaScript-delta regression.

## 8.1–8.4 Privacy and payload verification

Verified 2026-08-24 with focused Vitest coverage in
`src/lib/analytics/identity.test.ts`,
`src/lib/analytics/analytics.test.ts`, and the marketing/public analytics
provider tests.

- The full application client disables automatic pageviews, autocapture,
  session recording, and surveys; it uses `person_profiles: "identified_only"`.
  The anonymous beacon clients have no recording, heatmap, survey, or content
  capture capability and send only explicit events.
- The typed contract and final public transport allowlist exclude guest names,
  email, phone, messages, guest identifiers, wishlist titles/slugs, gift names,
  pathnames, raw referrers, and public URLs. Public payload tests include
  simulated `$current_url` and `$pathname` properties and assert they are
  removed before dispatch.
- Published public and personalized views, all seven public events, normalized
  purchase failures, success-only purchase/undo/RSVP capture, and anonymous
  identity continuity are covered by mocked transport tests.
- The existing privacy disclosure names PostHog as the product-analytics
  processor for aggregated, anonymized usage events. This remains aligned with
  the restricted event vocabulary and identified-only profiles; the
  `legal-pages` capability needs no change.

## 9.7–9.8 Production E2E status

On 2026-08-24, a production build completed and `/` remained statically
prerendered. Browser verification observed successful `200` requests to the
first-party `/ingest/batch` endpoint for the landing pageview, a CTA event,
and the navigation to `/create`; the same browser identity persisted through
that navigation. The public audit fixture also rendered through its dedicated
boundary and exposed the store and purchase-start interactions.

The two full E2E tasks remain pending: confirming arrival and person state in
the PostHog project needs an authenticated PostHog session, and confirming a
public purchase/RSVP outcome needs a mutable published wishlist fixture. The
local audit fixture deliberately has no backing purchase or invite records, so
it cannot safely produce either client-confirmed outcome.

## 9.7 continued — PostHog project verification

On 2026-08-24, a fresh production build was served locally and exercised in a
new browser storage context. The connected PostHog project confirmed that the
landing `$pageview`, automatic first-fold `section_viewed`, and hero
`cta_clicked` events arrived through the first-party `/ingest/batch` rewrite.
All three carried the same generated anonymous `distinct_id`, creator intent,
and the expected beacon library metadata; the CTA retained the `hero`
placement.

The browser successfully navigated to `/create` with that same identifier in
local storage. The application-shell client then loaded its first-party
configuration, but it correctly emitted no automatic `/create` pageview:
automatic pageviews are intentionally disabled and the creation wizard has no
explicit entry event. PostHog also returned no row for the anonymous visitor
in `persons`, consistent with `$process_person_profile: false` and the
identified-only profile policy.

This verifies transport delivery, anonymous identity continuity at the browser
boundary, and anonymous-profile suppression. Task 9.7 remains open because
there is no creation-wizard event to query in PostHog after the route change;
calling the existing CTA a separate wizard-arrival event would overstate the
evidence. Task 9.8 remains open: the connected project currently has no
`guest_finder_used`, store/purchase, or RSVP events, and the audit fixture has
no mutable published wishlist or invite data with which to generate the
required client-confirmed outcome.

## 2026-08-31 follow-up — live PostHog MCP verification

A fresh production build was exercised through the real first-party ingest
path. The creator session preserved anonymous identifier
`b1888542-e8de-4a3a-8085-b165a62ec0f0` from `/` through `/create`; the public
fixture session used `8c931062-8651-46bc-a5b0-ec52cc427468`. PostHog MCP
confirmed the latter's `public_wishlist_viewed` event with route variant
`public`, the fixture's stable internal wishlist id, the explicit
`awishfor-beacon` library, and its anonymous person state.

The verification also exposed and corrected a production-only wizard-state
issue: the Zustand persistence callback mutated `_hasHydrated` directly, which
does not notify React subscribers. It now calls `setHasHydrated()` so the
wizard-start effect can observe rehydration. The focused wizard test suite and
typecheck pass, and a subsequent production build still prerenders `/`.

Tasks 9.7 and 9.8 remain open. PostHog did not yet show the fresh
`wizard_started` event in the connected project, so marking the creator funnel
as delivered would overstate the evidence. The audit fixture is intentionally
database-free and can safely verify a public view and purchase-form activation,
but it cannot generate a client-confirmed purchase success/undo or RSVP
outcome. A mutable published wishlist and personalized invite are required to
complete task 9.8 without manufacturing production analytics data.
