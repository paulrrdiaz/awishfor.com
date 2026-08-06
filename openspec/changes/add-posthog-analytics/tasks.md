## 1. Spike identity continuity and record the baseline

- [ ] 1.1 Spike whether `posthog-js-lite` and full `posthog-js` share a persisted visitor identifier: initialize both against the same project key, inspect the stored identifier and its storage mechanism, and record the finding in `verification.md`
- [ ] 1.2 Decide the runtime split from the spike result and record it: interoperable → proceed as designed; not interoperable → own the identifier in a shared helper; fragile → fall back to the lite runtime on every route
- [ ] 1.3 Run `pnpm audit:marketing` before any analytics code exists and retain the baseline in `verification.md`, naming the pre-existing total-transfer and high-priority-image failures so they cannot be misattributed to this change
- [ ] 1.4 Provision the PostHog project in the **US** region and confirm the ingestion and asset hosts to be proxied

## 2. Configure environment and transport

- [ ] 2.1 Add `NEXT_PUBLIC_POSTHOG_KEY` and `NEXT_PUBLIC_POSTHOG_HOST` to the client schema and `runtimeEnv` in `src/env.ts`, and to `.env.example`
- [ ] 2.2 Add the first-party ingest rewrite in `next.config.ts` targeting the US ingestion and asset hosts
- [ ] 2.3 Verify the chosen ingest path is not matched by the `src/proxy.ts` matcher and performs no authentication work, and add a test asserting the matcher does not cover it
- [ ] 2.4 Confirm the ingest rewrite does not alter the existing `headers()` configuration or the marketing `Link` preload header

## 3. Build the analytics module

- [ ] 3.1 Create `src/lib/analytics/` with the typed event contract: event names, property shapes, and the visitor-intent property carried by every marketing event
- [ ] 3.2 Add the client wrapper exposing capture and identify, degrading to a no-op when unconfigured and suppressing capture outside production
- [ ] 3.3 Add the campaign-parameter helper that parses attribution parameters from the URL for attachment to the pageview
- [ ] 3.4 Add unit tests for the contract, the no-op and non-production paths, and campaign-parameter parsing

## 4. Capture marketing pageviews

- [ ] 4.1 Add the marketing analytics provider to `src/app/(marketing)/layout.tsx` using the runtime chosen in task 1.2
- [ ] 4.2 Add the pageview tracker deriving navigation from `usePathname` and `useSearchParams`, wrapped in its own `<Suspense>` boundary
- [ ] 4.3 Ensure exactly one pageview is captured per navigation, with no duplicate on initial load
- [ ] 4.4 Build for production and verify the output still classifies `/` as static or prerendered
- [ ] 4.5 Add tests for pageview capture on load, on client navigation, and for absence of duplicates

## 5. Instrument marketing engagement

- [ ] 5.1 Instrument occasion selection in `OccasionPickerSection`
- [ ] 5.2 Instrument section reach with `IntersectionObserver`, firing once per section per pageview and respecting the existing `content-visibility` wrappers in `src/app/(marketing)/page.tsx`
- [ ] 5.3 Instrument theme preview interaction in `ThemePreviews`
- [ ] 5.4 Instrument FAQ disclosure in `FaqSection`
- [ ] 5.5 Instrument guest finder submission in `GuestFinder`, carrying guest intent
- [ ] 5.6 Instrument every call to action leading to the creation wizard with its placement, without delaying navigation
- [ ] 5.7 Verify instrumentation adds no client runtime to sections that are currently server-rendered beyond what the events require
- [ ] 5.8 Add tests asserting each instrumented flow captures its expected event, properties, and visitor intent

## 6. Establish identity continuity

- [ ] 6.1 Mount the application-shell analytics client in `src/components/providers/app-providers.tsx` per the task 1.2 decision
- [ ] 6.2 Implement identifier continuity between the marketing and application runtimes, including the shared helper if task 1.1 showed they do not interoperate natively
- [ ] 6.3 Configure identified-only person profiles so anonymous visitors and wishlist guests create none
- [ ] 6.4 Call identify with the Clerk user id on sign-in and sign-up so pre-authentication history stitches to the account
- [ ] 6.5 Confirm no analytics client is initialized on `/w/[slug]` in a way that would identify guests
- [ ] 6.6 Add a regression test asserting one visitor identifier persists across a marketing-to-application transition

## 7. Confirm privacy alignment

- [ ] 7.1 Verify session recording, heatmaps, surveys, and content capture are disabled in every client configuration
- [ ] 7.2 Audit every event property for personal data and confirm no guest name, email, phone, or message text can be captured
- [ ] 7.3 Confirm the existing PostHog disclosure in `src/app/(marketing)/privacy/page.tsx` still accurately describes what is collected, and record that the `legal-pages` capability needs no change

## 8. Verify

- [ ] 8.1 Run `pnpm check`, `pnpm test`, and `pnpm typecheck`
- [ ] 8.2 Run `pnpm audit:marketing` and record the post-analytics result in `verification.md` alongside the task 1.3 baseline
- [ ] 8.3 Report the analytics JavaScript delta explicitly and confirm it is at most 10 KiB and that total route JavaScript remains within budget
- [ ] 8.4 Confirm the pre-existing total-transfer and high-priority-image failures are unchanged and reported separately from this change's delta
- [ ] 8.5 Verify end to end in a production build that a landing pageview, one engagement event, and a wizard transition arrive in PostHog under a single person
