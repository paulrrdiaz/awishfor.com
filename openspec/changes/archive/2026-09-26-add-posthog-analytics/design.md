## Context

The marketing route is deliberately isolated from the rest of the application. `src/app/layout.tsx` is a bare document shell. `src/app/(marketing)/layout.tsx` mounts no client providers at all — the comment in `src/components/providers/app-providers.tsx` states the intent directly: "Application-only providers kept out of the anonymous marketing document." `src/app/(marketing)/page.tsx` declares no `dynamic`, `revalidate`, `cookies()`, or `headers()` usage, so `/` is statically prerendered. The `create/` and `(protected)/` route groups mount `ApplicationLayout` → `AppProviders` (nuqs, tRPC/React Query, tooltip, toaster), with Clerk scoped by `ClerkApplicationLayout` where authentication is required.

The public wishlist route no longer shares that application boundary. The later `improve-public-wishlist-sharing-performance` change moved `/w/[slug]` and `/w/[slug]/[guestSlug]` behind a lean `src/app/w/layout.tsx`; public tRPC providers are loaded only around the personalized RSVP form and the lazy guest gift drawer. The original version of this design predates that change and incorrectly listed `/w/[slug]` under `AppProviders`. Public analytics must be mounted deliberately without restoring Clerk, nuqs, the global tRPC provider, tooltips, or the toaster to the initial public document.

That isolation was expensive to achieve. The `optimize-marketing-performance` change moved providers out of the root layout, narrowed the Clerk middleware matcher, rebuilt hero image delivery, and replaced client-side form and carousel runtimes, taking mobile median compressed JavaScript from 590.6 KiB to the current figure. The resulting `web-performance-guardrails` capability makes those gains enforceable, and requires that any change touching marketing rendering, hydration, or provider boundaries include a production audit in its verification evidence. This change touches the provider boundary.

The measured position from the latest checked-in audit (`artifacts/marketing-performance/summary.json`, generated 2026-08-18T18:55:58Z with revision `local`, mobile median of three cold runs). The audit computes byte metrics by summing Lighthouse `transferSize`, so these are compressed bytes:

| Metric | Measured | Budget | Headroom |
| --- | ---: | ---: | ---: |
| Performance score | 0.97 median / 0.82 minimum run | ≥ 0.95 median / ≥ 0.90 each run | **one run already failing** |
| LCP | 2,143 ms | 2,500 ms | 357 ms |
| CLS | 0.000 | 0.100 | comfortable |
| TBT | 14 ms | 200 ms | 186 ms |
| JavaScript | 184,275 B | 225,280 B | **41,005 B (40.0 KiB)** |
| CSS | 33,071 B | 40,960 B | 7,889 B |
| Font preload | 87,124 B | 102,400 B | 15,276 B |
| Total transfer | 1,354,167 B | 819,200 B | **−534,967 B — already failing** |
| High-priority images | 2 | 1 | **already failing** |

Two conclusions follow. First, CPU is not the constraint: 14 ms of median total blocking time against a 200 ms budget means an analytics client has ample execution headroom. This is primarily a transferred-bytes problem, and the relevant marketing number is 40.0 KiB of JavaScript headroom. Second, the audit already exits unsuccessfully for reasons that predate this change. Implementation must record the baseline before writing analytics code, or the existing failures will be misread as regressions.

This table is still a stale snapshot for implementation purposes: its revision is recorded only as `local`, and it predates the current `main` history. For comparison, the clean post-optimization baseline in the archived `optimize-marketing-performance` verification recorded 171.5 KiB of JavaScript and only 235.4 KiB of total transfer, so the current transfer and image-priority failures are not caused by analytics. Task 1.3 re-runs the audit against current `main`. The exact headroom will move; the conclusion that a minimal runtime may fit and a roughly 60 KiB full runtime does not is stable across every recorded run.

A default `posthog-js` bundle (v1.410.6 at time of writing) is roughly 55–65 KiB compressed — larger than the entire remaining budget. The attempted `posthog-js-lite` integration was measured during implementation and added 101,122 compressed JavaScript bytes to `/w/*`, far beyond its published package-size expectation and the route ceiling. The anonymous surfaces therefore use a deliberately small explicit transport built on `navigator.sendBeacon` with `fetch({ keepalive: true })` fallback; it sends only the typed, sanitized events this change defines.

The public-wishlist audit is tighter. `artifacts/public-wishlist-performance/summary.json` records 220,985 bytes of compressed JavaScript for both light and heavy mobile fixtures against a 225,280-byte ceiling, leaving only 4,295 bytes. That snapshot must also be re-measured before implementation, but it is sufficient to reject the full client categorically and to make the existing ceiling a hard gate. A minimal runtime is a candidate, not an entitlement: if the runtime plus the public tracker and call sites exceed the ceiling, implementation pauses and this design is revisited. The budget is not raised automatically and loading is not deferred merely to escape the audit window.

The product context: Spanish-first, LatAm-first, wishlists for baby showers, birthdays, weddings and housewarmings. Creators authenticate through Clerk; guests never do. The landing page serves both audiences at once — `GuestFinder` exists on `/` specifically so a guest can find a wishlist link — which means a naive funnel would score guest visits as creator drop-off.

## Goals / Non-Goals

**Goals:**

- Capture pageviews for the anonymous `/` route and understand acquisition volume, source, and campaign attribution.
- Capture the engagement events that explain landing-page behavior: which occasion visitors choose, how far they scroll, which call to action converts, and whether they arrived as a creator or a guest.
- Connect guest intent on the landing page to published public-wishlist views, store exits, purchase attempts and outcomes, and personalized RSVP outcomes.
- Preserve `/` as a statically prerendered route with its current performance profile.
- Keep the analytics addition to `/` small enough that meaningful JavaScript headroom remains for future marketing work.
- Keep `/w/*` within its existing public-wishlist JavaScript ceiling and preserve its lean provider boundary.
- Resolve one visitor to one analytics identity across the marketing route, public-wishlist route, and application shell so both creator and guest funnels are trustworthy.
- Establish a typed event contract that later server-side product events can extend without renaming anything.

**Non-Goals:**

- Session replay, heatmaps, surveys, feature flags, and experimentation.
- The nine remaining product events in `docs/PRD.md` §19 after `public_wishlist_viewed` and `gift_marked_purchased`, and the `posthog-node` server client they require.
- An owner-facing analytics dashboard (`docs/PRD.md` §20 lists it as out of MVP scope).
- Operational monitoring of route availability, server errors, latency, cache behavior, or database performance; those belong to Sentry and platform telemetry rather than this PostHog funnel.
- A consent management platform or cookie banner.
- Fixing the pre-existing total-transfer and high-priority-image budget failures.
- Sentry, rate limiting, or the remaining `docs/TASKS.md` §9 observability work.

## Decisions

### 1. Capture marketing pageviews on the client, not the server

Marketing pageviews are captured by a client component mounted in the marketing route group. Server-side capture is rejected.

Server-side capture would need a stable visitor identifier, which means reading or writing a cookie, which means `cookies()` in the server tree, which opts `/` out of static rendering. That would undo the central achievement of `optimize-marketing-performance` — a statically prerendered acquisition route with a 1,113 ms LCP — in exchange for analytics coverage. Server capture would also count bot and prefetch traffic that client capture naturally filters, and would produce a request-time write on the hot path of the most performance-sensitive route in the product.

The client is not a compromise here; it is where this data is both cheapest and most accurate. Referrer, viewport, campaign parameters, and engagement depth are all client-side facts. The tradeoff accepted is that content blocking and no-JavaScript sessions produce undercounting, which decision 4 mitigates and which is acceptable for trend data.

Adding a client component to `(marketing)/layout.tsx` does not by itself break static generation; client components still prerender. Only request-time server APIs would.

### 2. Explicit anonymous transport and one application runtime across three route boundaries

The marketing route and public-wishlist route use a small typed transport through their own lean analytics boundaries, without inheriting `AppProviders` or Clerk. The transport POSTs the documented PostHog capture batch shape to `/ingest/batch/` via `navigator.sendBeacon`, falling back to a non-blocking `fetch` request with `keepalive: true`. It has no automatic pageviews, autocapture, remote configuration, feature flags, surveys, replay, or content capture. The Clerk-backed application shell — covering `/create` and `/dashboard` — mounts full `posthog-js`, since no comparable budget gate applies there.

The arithmetic is decisive. Against 40.0 KiB of recorded marketing headroom, full `posthog-js` does not fit at all; on `/w/*`, the current baseline headroom is only 13,260 bytes. The attempted Lite SDK added 101,122 bytes on `/w/*`, so it is not a candidate. The explicit transport and its public instrumentation must prove they fit through the production public-wishlist audit before they are accepted.

What the anonymous surfaces give up is automatic capture, automatic campaign-parameter parsing, and automatic `$pageleave`. All of the events this change actually wants are explicit and deliberate, so autocapture would mostly generate noise on a page whose interactions we already enumerate. Campaign parameters are parsed manually from the URL and attached to the pageview; this is a small, testable helper, not a hidden cost.

Alternatives considered:

- **Full `posthog-js` everywhere, budget raised deliberately.** The `web-performance-guardrails` capability explicitly permits threshold changes when committed with a rationale, so this is a legitimate path rather than a violation. It is rejected because paying 60 KiB on the acquisition route to obtain replay and flags we have scoped out, and autocapture we do not want, is a poor trade. It remains the correct escape hatch if feature flags on the landing page later become a product requirement — at which point raising `javascriptBytes` in `config/marketing-performance-audit.json` with a written rationale is the honest move.
- **`posthog-js-lite` on anonymous surfaces.** Rejected after the production audit measured a 101,122-byte public-route JavaScript increase. It would violate the hard public ceiling and fails the purpose of a minimal route boundary.
- **Lite everywhere.** Rejected because the tested Lite runtime does not fit the public budget. The application shell retains full `posthog-js`, where its size is not budget-bound.
- **Deferring full `posthog-js` behind `requestIdleCallback` after the load event** so the bytes land outside Lighthouse's gather window. Explicitly rejected. It would pass the audit without helping a single real user, and it contradicts the guardrail requirement that budgets not relax through untracked means. If the bytes are worth spending, raise the budget in the open.

### 3. One visitor identity across all route boundaries, verified by a spike before anything else is built

A creator who lands on `/`, clicks "Crear mi wishlist", and enters the wizard crosses from the minimal runtime to the full runtime. A guest who submits the wishlist finder crosses from the marketing instance of the minimal runtime into the public-wishlist instance. If these boundaries do not agree on `distinct_id`, both funnels split one visitor into multiple people and report nonsense.

`posthog-js` persists `distinct_id` in a cookie named for the project key; the attempted Lite runtime used its own storage strategy. The spike confirmed they do not interoperate in the required direction, so a shared helper owns the anonymous identifier in local storage and initializes both the explicit transport and the application client. The custom transport never calls `identify()`; only the application client does after Clerk resolves a user.

Person profiles are configured as identified-only. The overwhelming majority of traffic to this product is anonymous — marketing visitors and wishlist guests who will never hold an account. Creating a person profile for each is expensive and collects more than the product needs. Anonymous events still produce pageviews and funnels. This also makes "we only build profiles for registered users" a true statement in the privacy policy rather than an aspiration.

`identify()` is called with the Clerk user id when a creator authenticates, stitching the pre-signup anonymous history to the account. Guests on `/w/*` are never identified. A published owner visit is intentionally indistinguishable from a guest visit because published resolution avoids Clerk on the hot path; this small amount of self-traffic noise is accepted. Draft-owner previews are excluded from `public_wishlist_viewed` because the route already knows their render mode.

### 4. First-party ingestion through a rewrite on the application origin

`next.config.ts` gains a rewrite mapping a first-party path to the PostHog US ingestion and asset hosts. The browser client is configured to use that path as its API host.

Content blockers routinely block requests to known analytics domains. Blocking rates in LatAm are lower than in Europe or North America but are not negligible, and undercounting falls hardest on exactly the technically literate segment. Since the point of this change is to stop guessing, systematic blind spots are worth removing.

The middleware interaction was checked and is safe: `src/proxy.ts` matches `/dashboard(.*)`, `/sign-in(.*)`, `/sign-up(.*)`, and `/(api|trpc)(.*)`. A first-party ingest path under none of those prefixes bypasses Clerk middleware entirely, so ingestion adds no session work. The path must be chosen to keep that true — in particular it must not live under `/api`.

Costs accepted: each captured event becomes a hosting function invocation, and ingest requests count toward the audit's `totalTransferBytes`. They do not count toward `javascriptBytes`, which is the binding constraint. On a pageview-plus-engagement workload this is a small number of requests per visit.

### 5. US cloud region

The PostHog project is provisioned in the US region, with the client pointed at the US ingestion and asset hosts through the rewrite of decision 4.

Latency from Lima, Bogotá, Buenos Aires, and São Paulo to US-East is roughly 90–160 ms, which is irrelevant for fire-and-forget analytics beacons. Region is effectively permanent — moving later means abandoning or migrating history — so it is recorded here as a deliberate, dated decision rather than a default.

### 6. A focused event vocabulary for creator and guest funnels

`docs/PRD.md` §19 begins the creator product funnel at `wizard_started`. This change instruments the marketing layer above it and a deliberately small guest funnel. It brings the existing PRD events `public_wishlist_viewed` and `gift_marked_purchased` into scope; the other nine PRD events remain for a follow-up server-side change.

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

  guest_finder_used
      │
      ▼
  public_wishlist_viewed
      │
      ├─ gift_store_opened
      └─ gift_purchase_started
              ├─ gift_marked_purchased
              ├─ gift_purchase_failed
              └─ gift_purchase_undone

  public_wishlist_viewed [personalized]
      │
      └─ rsvp_submitted
```

`guest_finder_used` carries real analytical weight. The landing page serves creators and guests simultaneously, so every event must let analysis separate the two audiences or guest bounces will be scored as creator drop-off. Every marketing event therefore carries a property distinguishing visitor intent.

`section_viewed` is implemented with `IntersectionObserver` and must respect the existing `content-visibility: auto` wrappers in `src/app/(marketing)/page.tsx`; it fires once per section per pageview, never repeatedly on scroll oscillation.

Public filters, sorting, scrolling, and generic clicks are intentionally omitted. The seven public events answer the guest conversion questions without creating a noisy interaction stream.

### 7. Public-wishlist capture is explicit, client-confirmed, and URL-safe

Automatic pageview capture and autocapture are disabled on `/w/*`. Published pages emit `public_wishlist_viewed` explicitly; draft-owner previews emit nothing. The event distinguishes `public` from `personalized` through a `route_variant` property, but never sends the pathname or URL.

The allowed public pageview properties are stable internal `wishlist_id`, `event_type`, `layout_id`, `theme_id`, `route_variant`, gift count, referrer hostname, and allowlisted campaign parameters. Gift events may add internal `gift_id`. RSVP success may add response status and party size. Stable internal identifiers are intentionally allowed so events can be joined and deduplicated, but wishlist slugs, titles, gift names, guest identifiers or names, contact data, form values, raw referrers, and full or partial personalized URLs are forbidden.

PostHog clients can attach automatic properties even when call sites pass a sanitized object. The public wrapper must therefore verify and, where necessary, sanitize the final outbound payload so `$current_url`, `$pathname`, referrer fields, or equivalent automatic properties cannot reveal a wishlist slug or `guestSlug`. This is tested at the transport boundary, not merely by inspecting call-site arguments.

Purchase and RSVP outcome events are emitted in the browser after their existing public mutations resolve:

- `gift_marked_purchased` only after `markGiftPurchased` succeeds;
- `gift_purchase_failed` after a failed attempt, with a normalized error code and never the raw error message;
- `gift_purchase_undone` only after `undoRecentPurchase` succeeds;
- `rsvp_submitted` only after `invite.respond` succeeds, with response status and party size but no guest identifiers.

This client-confirmed model preserves the anonymous visitor identity and avoids adding `posthog-node`. It may undercount when an analytics request is blocked or the page closes immediately after mutation success; that residual loss is accepted for v1. Analytics never delays store navigation, mutation completion, refresh, or user feedback.

### 8. A single typed event contract in `src/lib/analytics/`

All event names and property shapes are declared once, in the location `docs/TASKS.md` §9.3 already anticipates. Call sites import the contract rather than passing string literals.

Without this, `cta_clicked` and `cta-clicked` coexist within a month, and the divergence is invisible until someone builds a funnel on the wrong one. A typed contract also makes the "events fire in expected flows" acceptance criterion in `docs/TASKS.md` §9.3 testable under Vitest by asserting against a mocked client, and gives the follow-up server-side change a registry to extend rather than a parallel vocabulary to invent.

### 9. Marketing pageview tracking on navigation must not deoptimize static rendering

App Router does not emit pageviews on client navigation automatically; the tracker derives them from `usePathname` and `useSearchParams`.

`useSearchParams()` in a statically rendered route opts the route out of static generation unless it sits inside a `<Suspense>` boundary. The pageview tracker is therefore wrapped in its own boundary. This is the specific mechanism by which a careless analytics integration would silently undo static rendering on `/` while every test still passed, so verification asserts the build still classifies `/` as prerendered.

### 10. Production-only capture, validated through `src/env.ts`

`NEXT_PUBLIC_POSTHOG_KEY` and `NEXT_PUBLIC_POSTHOG_HOST` are added to the client schema and `runtimeEnv` in `src/env.ts`, and to `.env.example`, per the project convention that every environment variable is declared in both places.

Capture is disabled outside production. Local development and Vitest runs would otherwise inject wizard-abandonment and repeated pageviews into the same funnel the team reads for decisions, and early noise is disproportionately damaging while volume is low. Absent configuration, the client degrades to a no-op rather than throwing — analytics must never be able to break the acquisition page.

### 11. No consent banner for the LatAm-first launch, with recorded review triggers

`docs/PRD.md` states no cookie banner is required absent advertising, retargeting, Meta Pixel, or Google Ads. This change introduces none of those, and `src/app/(marketing)/(site)/privacy/page.tsx` already names PostHog as a processor.

First-party analytics under Peru's Ley 29733, Argentina's Ley 25.326, Colombia's Ley 1581, and Mexico's LFPDPPP is principally a disclosure obligation, which the existing privacy page satisfies. Decision 3's identified-only profiles reduce the collected surface further, and session replay being out of scope means no page content is recorded.

Two triggers require revisiting this position, recorded here so the assumption is dated rather than forgotten:

- **Brazil.** LGPD is materially closer to GDPR. A deliberate push into Brazilian traffic should re-examine consent before it happens.
- **Chile.** Ley 21.719 phases in around the end of 2026 and is GDPR-shaped.

This is an engineering assessment recorded to make the assumption reviewable, not legal advice. It should be confirmed by counsel before either trigger fires. If consent later becomes necessary, the cheapest path preserving the no-banner promise is memory-only persistence, trading cross-session identity for a smaller obligation.

## Risks

| Risk | Mitigation |
| --- | --- |
| The two runtimes do not share `distinct_id`, silently splitting the primary funnel | Task 1.1 spike before any other work; three pre-authorized outcomes; a regression test asserting continuity |
| Analytics JavaScript pushes `/` past the 225,280-byte budget | Minimal runtime against 40.0 KiB recorded headroom; a spec requirement caps the delta at 10 KiB; audit is verification evidence |
| Public analytics pushes `/w/*` past its 225,280-byte budget | Re-baseline before implementation; use only the minimal runtime; keep the ceiling hard; pause and revisit the design if the audited route exceeds it |
| `useSearchParams` silently deoptimizes `/` from static rendering | Suspense boundary per decision 9; build-output classification asserted in verification |
| The pre-existing failing budgets are misattributed to this change | Marketing and public baselines recorded before implementation; existing failures named separately in `proposal.md` and `verification.md` |
| Content blocking undercounts acquisition | First-party rewrite per decision 4; residual undercounting accepted for trend data |
| Dev and test capture pollutes early reporting | Production-only capture per decision 10 |
| Marketing events conflated across creator and guest audiences | Visitor-intent property on every marketing event per decision 6 |
| Automatic PostHog properties leak a wishlist or guest slug | Autocapture and automatic pageviews disabled on `/w/*`; final outbound payload sanitized and tested per decision 7 |
| Published owner visits inflate guest views | Draft previews excluded; small published self-traffic accepted to avoid restoring authentication work to the public hot path |
| Client-confirmed purchase or RSVP outcomes undercount after a successful mutation | Capture synchronously from success callbacks without delaying UX; residual blocker/page-close loss accepted; no false success is emitted |
| Analytics failure breaks the landing page | No-op degradation when unconfigured; capture never blocks render or navigation |
