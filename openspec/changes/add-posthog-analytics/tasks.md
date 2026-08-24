## 1. Spike identity continuity and record both baselines

- [x] 1.1 Spike whether the candidate minimal browser runtime and full `posthog-js` share a persisted visitor identifier: initialize both against the same project key, inspect the stored identifier and its storage mechanism, and record the finding in `verification.md`
- [x] 1.2 Decide the runtime split from the spike result and record it: interoperable → minimal runtime on marketing and public-wishlist routes plus full runtime in the Clerk-backed application shell; not interoperable → own the identifier in a shared helper; fragile → fall back to the minimal runtime on every route
- [x] 1.3 Run `pnpm audit:marketing` before any analytics code exists and retain the baseline in `verification.md`, naming pre-existing failures separately so they cannot be misattributed to this change
- [x] 1.4 Run `pnpm audit:public-wishlist` before any analytics code exists and retain light and heavy fixture baselines in `verification.md`, including the recorded JavaScript headroom against the 225,280-byte ceiling
- [x] 1.5 Provision the PostHog project in the **US** region and confirm the ingestion and asset hosts to be proxied

## 2. Configure environment and transport

- [x] 2.1 Add `NEXT_PUBLIC_POSTHOG_KEY` and `NEXT_PUBLIC_POSTHOG_HOST` to the client schema and `runtimeEnv` in `src/env.ts`, and to `.env.example`
- [x] 2.2 Add the first-party ingest rewrite in `next.config.ts` targeting the US ingestion and asset hosts
- [x] 2.3 Verify the chosen ingest path is not matched by the `src/proxy.ts` matcher and performs no authentication work, and add a test asserting the matcher does not cover it
- [x] 2.4 Confirm the ingest rewrite does not alter the existing `headers()` configuration or the marketing `Link` preload header

## 3. Build the analytics module

- [x] 3.1 Create `src/lib/analytics/` with one typed event contract covering marketing events and the seven public-wishlist events, including their property shapes and the visitor-intent property carried by every marketing event
- [x] 3.2 Add the client wrapper exposing capture and identify, degrading to a no-op when unconfigured and suppressing capture outside production; following the Lite-runtime audit failure, use the explicit first-party beacon transport for anonymous surfaces and full `posthog-js` only in the application shell
- [x] 3.3 Add attribution helpers that parse only allowlisted campaign parameters and reduce public-wishlist referrers to hostnames
- [x] 3.4 Add a public-wishlist payload allowlist/sanitizer at the final transport boundary so client-added URL, pathname, raw-referrer, and content properties cannot escape call-site sanitization
- [x] 3.5 Add unit tests for the contract, no-op and non-production paths, attribution parsing, and final public payload sanitization

## 4. Capture marketing pageviews

- [x] 4.1 Add the marketing analytics provider to `src/app/(marketing)/layout.tsx` using the runtime chosen in task 1.2
- [x] 4.2 Add the pageview tracker deriving navigation from `usePathname` and `useSearchParams`, wrapped in its own `<Suspense>` boundary
- [x] 4.3 Ensure exactly one pageview is captured per navigation, with no duplicate on initial load
- [x] 4.4 Build for production and verify the output still classifies `/` as static or prerendered
- [x] 4.5 Add tests for pageview capture on load, on client navigation, and for absence of duplicates

## 5. Instrument marketing engagement

- [x] 5.1 Instrument occasion selection in `OccasionPickerSection`
- [x] 5.2 Instrument section reach with `IntersectionObserver`, firing once per section per pageview and respecting the existing `content-visibility` wrappers in `src/app/(marketing)/page.tsx`
- [x] 5.3 Instrument theme preview interaction in `ThemePreviews`
- [x] 5.4 Instrument FAQ disclosure in `FaqSection`
- [x] 5.5 Instrument guest finder submission in `GuestFinder`, carrying guest intent
- [x] 5.6 Instrument every call to action leading to the creation wizard with its placement, without delaying navigation
- [x] 5.7 Verify instrumentation adds no client runtime to sections that are currently server-rendered beyond what the events require
- [x] 5.8 Add tests asserting each instrumented flow captures its expected event, properties, and visitor intent

## 6. Establish identity continuity

- [x] 6.1 Mount the Clerk-backed application-shell analytics client in `src/components/providers/app-providers.tsx` per the task 1.2 decision
- [x] 6.2 Implement identifier continuity across the marketing, public-wishlist, and Clerk-backed application runtimes, including the shared helper if task 1.1 showed the runtimes do not interoperate natively
- [x] 6.3 Configure identified-only person profiles so anonymous visitors and wishlist guests create none
- [x] 6.4 Call identify with the Clerk user id on sign-in and sign-up so pre-authentication history stitches to the account
- [x] 6.5 Add a regression test asserting one visitor identifier persists across a marketing-to-application transition
- [x] 6.6 Add a regression test asserting `guest_finder_used` and the destination `public_wishlist_viewed` share one anonymous visitor identifier without calling identify

## 7. Instrument the public-wishlist guest funnel

- [x] 7.1 Add a dedicated minimal analytics boundary for `/w/*` without restoring `AppProviders`, Clerk, nuqs, the global tRPC provider, tooltip, or toaster to the initial public document
- [x] 7.2 Disable automatic pageviews and autocapture on `/w/*`, and emit exactly one explicit `public_wishlist_viewed` for published plain and personalized pages with `public` or `personalized` route variant
- [x] 7.3 Exclude draft-owner previews from `public_wishlist_viewed`; accept published owner self-views without adding authentication work to the published route
- [x] 7.4 Instrument external-store activation as `gift_store_opened` and purchase-form activation as `gift_purchase_started`, without delaying the initiating interaction or breaking the lazy drawer boundary
- [x] 7.5 Instrument `markGiftPurchased` success as `gift_marked_purchased`, failure as `gift_purchase_failed` with a normalized code, and successful `undoRecentPurchase` as `gift_purchase_undone`
- [x] 7.6 Instrument successful `invite.respond` completion as `rsvp_submitted` with response status and party size only
- [x] 7.7 Confirm public filtering, sorting, scrolling, and generic clicks emit no analytics events in this change
- [x] 7.8 Add tests for all seven public events, success-before-capture ordering, failure normalization, undo correction, RSVP minimization, route variants, exact-once views, and draft-preview exclusion

## 8. Confirm privacy alignment

- [x] 8.1 Verify session recording, heatmaps, surveys, automatic public pageviews, public autocapture, and content capture are disabled in every applicable client configuration
- [x] 8.2 Audit every event property for personal data and confirm no guest name, email, phone, message, guest identifier, wishlist title or slug, gift name, pathname, or personalized URL can be captured
- [x] 8.3 Inspect mocked final outbound public payloads, including client-added automatic properties, and assert they contain only stable internal IDs and the documented public allowlist
- [x] 8.4 Confirm the existing PostHog disclosure in `src/app/(marketing)/(site)/privacy/page.tsx` still accurately describes what is collected, and record that the `legal-pages` capability needs no change

## 9. Verify

- [x] 9.1 Run `pnpm check`, `pnpm test`, and `pnpm typecheck`
- [x] 9.2 Run `pnpm audit:marketing` and record the post-analytics result in `verification.md` alongside the task 1.3 baseline
- [x] 9.3 Report the marketing analytics JavaScript delta explicitly, confirm it is at most 10 KiB, and confirm total marketing route JavaScript remains within budget
- [x] 9.4 Report pre-existing marketing audit failures separately from this change's delta so they are not misattributed
- [x] 9.5 Run `pnpm audit:public-wishlist` and record post-analytics light and heavy results alongside the task 1.4 baseline
- [x] 9.6 Confirm both public fixtures remain at or below 225,280 compressed JavaScript bytes; if either exceeds the ceiling, pause implementation and revisit the design without raising or evading the budget
- [ ] 9.7 Verify end to end in a production build that a landing pageview, one engagement event, and a wizard transition arrive in PostHog under a single person
- [ ] 9.8 Verify end to end in a production build that guest-finder use, a public-wishlist view, a store or purchase-start interaction, and a client-confirmed outcome arrive under one anonymous visitor with no person profile
