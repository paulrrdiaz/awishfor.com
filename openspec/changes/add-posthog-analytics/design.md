## Context

The marketing route is deliberately isolated from the rest of the application. `src/app/layout.tsx` is a bare document shell. `src/app/(marketing)/layout.tsx` mounts no client providers at all — the comment in `src/components/providers/app-providers.tsx` states the intent directly: "Application-only providers kept out of the anonymous marketing document." `src/app/(marketing)/page.tsx` declares no `dynamic`, `revalidate`, `cookies()`, or `headers()` usage, so `/` is statically prerendered. The `w/`, `create/`, and `(protected)/` route groups mount `ApplicationLayout` → `AppProviders` (Clerk, nuqs, tRPC/React Query, tooltip, toaster) and carry no comparable budget gate.

That isolation was expensive to achieve. The `optimize-marketing-performance` change moved providers out of the root layout, narrowed the Clerk middleware matcher, rebuilt hero image delivery, and replaced client-side form and carousel runtimes, taking mobile median compressed JavaScript from 590.6 KiB to the current figure. The resulting `web-performance-guardrails` capability makes those gains enforceable, and requires that any change touching marketing rendering, hydration, or provider boundaries include a production audit in its verification evidence. This change touches the provider boundary.

The measured position from the last recorded audit (`artifacts/marketing-performance/summary.json`, generated 2026-08-03T21:04, mobile median of three cold runs). The audit computes byte metrics by summing Lighthouse `transferSize`, so these are compressed bytes:

| Metric | Measured | Budget | Headroom |
| --- | ---: | ---: | ---: |
| Performance score | 1.00 | ≥ 0.95 | comfortable |
| LCP | 1,113 ms | 2,500 ms | 1,387 ms |
| CLS | 0.000 | 0.100 | comfortable |
| TBT | 21 ms | 200 ms | 179 ms |
| JavaScript | 186,017 B | 225,280 B | **39,263 B (38.3 KiB)** |
| CSS | 28,808 B | 40,960 B | 12,152 B |
| Font preload | 87,124 B | 102,400 B | 15,276 B |
| Total transfer | 1,297,952 B | 819,200 B | **−478,752 B — already failing** |
| High-priority images | 2 | 1 | **already failing** |

Two conclusions follow. First, CPU is not the constraint: 21 ms of total blocking time against a 200 ms budget means an analytics client has ample execution headroom. This is purely a transferred-bytes problem, and the single relevant number is 38.3 KiB. Second, the audit currently exits unsuccessfully for reasons that predate this change. Implementation must record the baseline before writing analytics code, or the pre-existing failures will be misread as regressions.

This table is a stale snapshot and must be re-measured. It was generated at 16:04 local, after commit `3ea3342` ("redesign marketing sections for desktop", 14:27) but before commit `fe0b7bf` ("redesign marketing sections for mobile", 16:27), so the current state of the route is unmeasured. For comparison, the clean post-optimization baseline in the archived `optimize-marketing-performance` verification recorded 171.5 KiB of JavaScript and only 235.4 KiB of total transfer — meaning the total-transfer and image-priority failures above emerged during the marketing section redesigns, not during performance work. Task 1.3 re-runs the audit against current `main`. The exact headroom figure will move; the conclusion that a ~3 KiB runtime fits and a ~60 KiB runtime does not is stable across every recorded run.

A default `posthog-js` bundle (v1.410.6 at time of writing) is roughly 55–65 KiB compressed — larger than the entire remaining budget. `posthog-js-lite` (v4.10.2, maintained by PostHog) is roughly 3 KiB and exposes `capture()` and `identify()` without autocapture, session replay, feature flags, or surveys. That size difference, not feature preference, is what drives the central decision below.

The product context: Spanish-first, LatAm-first, wishlists for baby showers, birthdays, weddings and housewarmings. Creators authenticate through Clerk; guests never do. The landing page serves both audiences at once — `GuestFinder` exists on `/` specifically so a guest can find a wishlist link — which means a naive funnel would score guest visits as creator drop-off.

## Goals / Non-Goals

**Goals:**

- Capture pageviews for the anonymous `/` route and understand acquisition volume, source, and campaign attribution.
- Capture the engagement events that explain landing-page behavior: which occasion visitors choose, how far they scroll, which call to action converts, and whether they arrived as a creator or a guest.
- Preserve `/` as a statically prerendered route with its current performance profile.
- Keep the analytics addition to `/` small enough that meaningful JavaScript headroom remains for future marketing work.
- Resolve one visitor to one person across the marketing route and the application shell so the landing-to-wizard funnel is trustworthy.
- Establish a typed event contract that later server-side product events can extend without renaming anything.

**Non-Goals:**

- Session replay, heatmaps, surveys, feature flags, and experimentation.
- The eleven product events in `docs/PRD.md` §19, and the `posthog-node` server client they require.
- An owner-facing analytics dashboard (`docs/PRD.md` §20 lists it as out of MVP scope).
- A consent management platform or cookie banner.
- Fixing the pre-existing total-transfer and high-priority-image budget failures.
- Sentry, rate limiting, or the remaining `docs/TASKS.md` §9 observability work.

## Decisions

### 1. Capture marketing pageviews on the client, not the server

Marketing pageviews are captured by a client component mounted in the marketing route group. Server-side capture is rejected.

Server-side capture would need a stable visitor identifier, which means reading or writing a cookie, which means `cookies()` in the server tree, which opts `/` out of static rendering. That would undo the central achievement of `optimize-marketing-performance` — a statically prerendered acquisition route with a 1,113 ms LCP — in exchange for analytics coverage. Server capture would also count bot and prefetch traffic that client capture naturally filters, and would produce a request-time write on the hot path of the most performance-sensitive route in the product.

The client is not a compromise here; it is where this data is both cheapest and most accurate. Referrer, viewport, campaign parameters, and engagement depth are all client-side facts. The tradeoff accepted is that content blocking and no-JavaScript sessions produce undercounting, which decision 4 mitigates and which is acceptable for trend data.

Adding a client component to `(marketing)/layout.tsx` does not by itself break static generation; client components still prerender. Only request-time server APIs would.

### 2. Two runtimes: a minimal client on `/`, the full client in the application shell

The marketing route mounts `posthog-js-lite` (~3 KiB). The application shell — `AppProviders`, covering `/create`, `/w/[slug]`, and `/dashboard` — mounts full `posthog-js` and gains autocapture and richer automatic properties, since no budget gate applies to those routes.

The arithmetic is decisive. Against 38.3 KiB of headroom, full `posthog-js` does not fit at all; a lean `no-external` build at roughly 30–40 KiB would fit only by consuming nearly the entire remaining budget, leaving the next marketing dependency nowhere to go. `posthog-js-lite` costs under 8% of the headroom.

What the marketing route gives up is autocapture, automatic campaign-parameter parsing, and automatic `$pageleave`. All of the events this change actually wants are explicit and deliberate, so autocapture would mostly generate noise on a page whose interactions we already enumerate. Campaign parameters must be parsed manually from the URL and attached to the pageview; this is a small, testable helper, not a hidden cost.

Alternatives considered:

- **Full `posthog-js` everywhere, budget raised deliberately.** The `web-performance-guardrails` capability explicitly permits threshold changes when committed with a rationale, so this is a legitimate path rather than a violation. It is rejected because paying 60 KiB on the acquisition route to obtain replay and flags we have scoped out, and autocapture we do not want, is a poor trade. It remains the correct escape hatch if feature flags on the landing page later become a product requirement — at which point raising `javascriptBytes` in `config/marketing-performance-audit.json` with a written rationale is the honest move.
- **Lite everywhere.** Simpler: one runtime, one identity mechanism, decision 3's risk disappears entirely. Rejected as the default because the application shell already ships Clerk, tRPC, and React Query, so the marginal cost of full `posthog-js` there is comparatively small, and autocapture is genuinely useful inside the wizard where interactions are numerous and not individually enumerated. This remains the designated fallback if decision 3's spike fails.
- **Deferring full `posthog-js` behind `requestIdleCallback` after the load event** so the bytes land outside Lighthouse's gather window. Explicitly rejected. It would pass the audit without helping a single real user, and it contradicts the guardrail requirement that budgets not relax through untracked means. If the bytes are worth spending, raise the budget in the open.

### 3. One visitor identity across both runtimes, verified by a spike before anything else is built

A visitor who lands on `/`, clicks "Crear mi wishlist", and enters the wizard crosses from the lite runtime to the full runtime. If the two runtimes do not agree on `distinct_id`, that visitor becomes two people and the landing-to-wizard funnel — the single most valuable thing this change produces — reports nonsense.

`posthog-js` persists `distinct_id` in a cookie named for the project key; `posthog-js-lite` uses its own storage strategy. **Whether they interoperate is not assumed by this design.** Task 1.1 is a spike that loads both, inspects the persisted identifier, and records the finding. Three outcomes are pre-authorized so implementation is never blocked:

1. They interoperate → proceed as designed, with a regression test asserting identifier continuity.
2. They do not → a shared helper in `src/lib/analytics/` owns reading and writing the identifier in the format `posthog-js` expects, and both runtimes are initialized from it.
3. The bridge proves fragile → fall back to lite everywhere per decision 2's alternative, accepting the loss of autocapture in the application shell in exchange for one identity mechanism.

Person profiles are configured as identified-only. The overwhelming majority of traffic to this product is anonymous — marketing visitors and wishlist guests who will never hold an account. Creating a person profile for each is expensive and collects more than the product needs. Anonymous events still produce pageviews and funnels. This also makes "we only build profiles for registered users" a true statement in the privacy policy rather than an aspiration.

`identify()` is called with the Clerk user id when a creator authenticates, stitching the pre-signup anonymous history to the account. Guests on `/w/[slug]` are never identified.

### 4. First-party ingestion through a rewrite on the application origin

`next.config.ts` gains a rewrite mapping a first-party path to the PostHog US ingestion and asset hosts. The browser client is configured to use that path as its API host.

Content blockers routinely block requests to known analytics domains. Blocking rates in LatAm are lower than in Europe or North America but are not negligible, and undercounting falls hardest on exactly the technically literate segment. Since the point of this change is to stop guessing, systematic blind spots are worth removing.

The middleware interaction was checked and is safe: `src/proxy.ts` matches `/dashboard(.*)`, `/sign-in(.*)`, `/sign-up(.*)`, and `/(api|trpc)(.*)`. A first-party ingest path under none of those prefixes bypasses Clerk middleware entirely, so ingestion adds no session work. The path must be chosen to keep that true — in particular it must not live under `/api`.

Costs accepted: each captured event becomes a hosting function invocation, and ingest requests count toward the audit's `totalTransferBytes`. They do not count toward `javascriptBytes`, which is the binding constraint. On a pageview-plus-engagement workload this is a small number of requests per visit.

### 5. US cloud region

The PostHog project is provisioned in the US region, with the client pointed at the US ingestion and asset hosts through the rewrite of decision 4.

Latency from Lima, Bogotá, Buenos Aires, and São Paulo to US-East is roughly 90–160 ms, which is irrelevant for fire-and-forget analytics beacons. Region is effectively permanent — moving later means abandoning or migrating history — so it is recorded here as a deliberate, dated decision rather than a default.

### 6. Marketing-specific events, distinct from the PRD product events

`docs/PRD.md` §19 begins at `wizard_started`. This change instruments the layer above it, which no document currently specifies:

```
  $pageview /
      │
      ├─ occasion_selected      which event types visitors actually want
      ├─ section_viewed         which of the eight sections are reached
      ├─ theme_preview_opened   whether visual customization is a draw
      ├─ faq_opened             which objections block conversion
      ├─ guest_finder_used      guest intent, NOT creator drop-off
      └─ cta_clicked            hero | final | sticky — which CTA converts
              │
              ▼
        wizard_started  ──▶  docs/PRD.md §19, follow-up change
```

`guest_finder_used` carries real analytical weight. The landing page serves creators and guests simultaneously, so every event must let analysis separate the two audiences or guest bounces will be scored as creator drop-off. Every marketing event therefore carries a property distinguishing visitor intent.

`section_viewed` is implemented with `IntersectionObserver` and must respect the existing `content-visibility: auto` wrappers in `src/app/(marketing)/page.tsx`; it fires once per section per pageview, never repeatedly on scroll oscillation.

### 7. A single typed event contract in `src/lib/analytics/`

All event names and property shapes are declared once, in the location `docs/TASKS.md` §9.3 already anticipates. Call sites import the contract rather than passing string literals.

Without this, `cta_clicked` and `cta-clicked` coexist within a month, and the divergence is invisible until someone builds a funnel on the wrong one. A typed contract also makes the "events fire in expected flows" acceptance criterion in `docs/TASKS.md` §9.3 testable under Vitest by asserting against a mocked client, and gives the follow-up server-side change a registry to extend rather than a parallel vocabulary to invent.

### 8. Pageview tracking on navigation must not deoptimize static rendering

App Router does not emit pageviews on client navigation automatically; the tracker derives them from `usePathname` and `useSearchParams`.

`useSearchParams()` in a statically rendered route opts the route out of static generation unless it sits inside a `<Suspense>` boundary. The pageview tracker is therefore wrapped in its own boundary. This is the specific mechanism by which a careless analytics integration would silently undo static rendering on `/` while every test still passed, so verification asserts the build still classifies `/` as prerendered.

### 9. Production-only capture, validated through `src/env.ts`

`NEXT_PUBLIC_POSTHOG_KEY` and `NEXT_PUBLIC_POSTHOG_HOST` are added to the client schema and `runtimeEnv` in `src/env.ts`, and to `.env.example`, per the project convention that every environment variable is declared in both places.

Capture is disabled outside production. Local development and Vitest runs would otherwise inject wizard-abandonment and repeated pageviews into the same funnel the team reads for decisions, and early noise is disproportionately damaging while volume is low. Absent configuration, the client degrades to a no-op rather than throwing — analytics must never be able to break the acquisition page.

### 10. No consent banner for the LatAm-first launch, with recorded review triggers

`docs/PRD.md` states no cookie banner is required absent advertising, retargeting, Meta Pixel, or Google Ads. This change introduces none of those, and `src/app/(marketing)/privacy/page.tsx` already names PostHog as a processor.

First-party analytics under Peru's Ley 29733, Argentina's Ley 25.326, Colombia's Ley 1581, and Mexico's LFPDPPP is principally a disclosure obligation, which the existing privacy page satisfies. Decision 3's identified-only profiles reduce the collected surface further, and session replay being out of scope means no page content is recorded.

Two triggers require revisiting this position, recorded here so the assumption is dated rather than forgotten:

- **Brazil.** LGPD is materially closer to GDPR. A deliberate push into Brazilian traffic should re-examine consent before it happens.
- **Chile.** Ley 21.719 phases in around the end of 2026 and is GDPR-shaped.

This is an engineering assessment recorded to make the assumption reviewable, not legal advice. It should be confirmed by counsel before either trigger fires. If consent later becomes necessary, the cheapest path preserving the no-banner promise is memory-only persistence, trading cross-session identity for a smaller obligation.

## Risks

| Risk | Mitigation |
| --- | --- |
| The two runtimes do not share `distinct_id`, silently splitting the primary funnel | Task 1.1 spike before any other work; three pre-authorized outcomes; a regression test asserting continuity |
| Analytics JavaScript pushes `/` past the 225,280-byte budget | ~3 KiB runtime against 38.3 KiB headroom; a spec requirement caps the delta at 10 KiB; audit is verification evidence |
| `useSearchParams` silently deoptimizes `/` from static rendering | Suspense boundary per decision 8; build-output classification asserted in verification |
| The pre-existing failing budgets are misattributed to this change | Baseline recorded in task 1.2 before implementation; both failures named in `proposal.md` |
| Content blocking undercounts acquisition | First-party rewrite per decision 4; residual undercounting accepted for trend data |
| Dev and test capture pollutes early reporting | Production-only capture per decision 9 |
| Marketing events conflated across creator and guest audiences | Visitor-intent property on every marketing event per decision 6 |
| Analytics failure breaks the landing page | No-op degradation when unconfigured; capture never blocks render or navigation |
