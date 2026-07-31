## 1. Establish the production audit

- [x] 1.1 Add a pinned production Lighthouse audit command and versioned mobile/desktop profiles, with generated reports written to an ignored artifact directory
- [x] 1.2 Add audit orchestration that builds the app, starts `next start` on a dedicated port, rejects a development runtime, and cleans up the server process
- [x] 1.3 Add three-run cold-mobile median calculation and enforce the score, LCP, CLS, total-blocking-time, JavaScript, CSS, font, total-transfer, image-priority, and font-preload budgets
- [x] 1.4 Make failed payload checks print encoded resource sizes, types, initiators, and URLs so regressions are actionable
- [x] 1.5 Run and retain the pre-optimization production baseline in the change/PR verification evidence

## 2. Isolate the static marketing route

- [x] 2.1 Make the root document layout route-neutral by removing application providers and the public font catalog from its HTML boundary
- [x] 2.2 Add the nearest provider boundaries needed by auth, creation, protected, and public-wishlist routes without changing their URLs or behavior
- [x] 2.3 Narrow Clerk middleware matching and authentication reads to protected, auth-redirect, API, and tRPC paths so marketing documents bypass session work
- [x] 2.4 Replace server-side marketing-nav authentication with a geometry-stable anonymous-safe account action
- [x] 2.5 Add the private boolean session-state endpoint and post-paint account-link enhancement, or document with audit evidence why the static auth-route redirect is the lower-cost final choice
- [x] 2.6 Add focused tests for the initial account fallback, signed-in enhancement/fallback redirect behavior, and absence of layout shift-producing markup changes
- [x] 2.7 Build the application and verify `/` is classified as static/prerendered and its initial chunks exclude Clerk UI, tRPC, React Query, nuqs, tooltip, and toaster runtimes

## 3. Scope typography and shared image priority

- [x] 3.1 Split marketing Lora/Inter declarations from the public-wishlist font catalog and apply only the marketing variables in the marketing layout
- [x] 3.2 Move JetBrains Mono and the selectable public font variables to only the route boundaries that consume them
- [x] 3.3 Verify the marketing document preloads at most three used font files totaling no more than 100 KiB while every configured public-wishlist font remains available
- [x] 3.4 Change reusable wishlist hero/media components to accept an explicit priority policy instead of always assigning priority
- [x] 3.5 Add focused tests proving the live above-the-fold use can opt into priority while the compact marketing preview cannot emit image preloads

## 4. Rebuild hero delivery around one LCP candidate

- [x] 4.1 Render the first wedding photograph as one optimized local `next/image` candidate with a deliberate `sizes` policy and reserved dimensions
- [x] 4.2 Remove inactive occasion images and duplicate breakpoint `<img>` elements from the initial server-rendered hero
- [x] 4.3 Implement the activity-, load-, visibility-, page-lifecycle-, and reduced-motion-gated hero controller with full listener/timer cleanup
- [x] 4.4 Load only the imminent occasion after activation, wait for decode before transition, and keep at most the active and imminent photographs mounted
- [x] 4.5 Drive photograph and proof-rail replacement from one state source while exposing exactly one rail link and one rail content block to assistive technology
- [x] 4.6 Preserve the static wedding photograph, H2b copy, scrim, trust line, and proof rail when JavaScript is unavailable, motion is reduced, or the visitor remains idle
- [x] 4.7 Add component tests for responsive source selection, activation gates, rotation synchronization, lifecycle pause/resume, cleanup, and accessible rail replacement
- [x] 4.8 Verify a cold mobile and desktop network trace requests one matching initial hero crop and no future occasion photograph before visitor activity

## 5. Remove below-the-fold application payload

- [x] 5.1 Extract a server-safe demo wishlist view model and any small presentational tokens needed by both the public page and marketing preview
- [x] 5.2 Replace the compact `PublicWishlistPage` mount with a server-rendered example that does not import the layout registry, purchase modal, mutations, or interactive gift-card code
- [x] 5.3 Add focused tests for demo content fidelity, disabled purchase behavior, and absence of production page/client-flow imports
- [x] 5.4 Replace the guest finder's React Hook Form, resolver, and Zod client path with native form semantics and lightweight slug/URL handling
- [x] 5.5 Render FAQ disclosures as accessible server-first markup and preserve keyboard and screen-reader behavior without a general-purpose client accordion runtime
- [x] 5.6 Convert the occasion-card carousel to server-visible scroll-snap content and load autoplay/dot synchronization only near the viewport with reduced-motion support
- [x] 5.7 Keep the mobile drawer accessible and dismissible while choosing the lightest implementation that satisfies focus return, Escape, and outside-click behavior
- [x] 5.8 Ensure example and later-section images have reserved geometry, lazy loading, and no priority/preload hints

## 6. Constrain marketing animation overhead

- [x] 6.1 Keep GSAP constrained to required hero/header behavior (including the required hero rotation and scroll-progress indicator); replace other GSAP/ScrollTrigger marketing motion with visible-by-default CSS plus small IntersectionObserver/scroll-state controllers
- [x] 6.2 Replace continuous box-shadow/filter/glow effects with static, hover/focus, or finite treatments that preserve the approved appearance
- [x] 6.3 Gate marquee and any retained decorative transform loops by intersection, document visibility, viewport size, and reduced-motion preference
- [x] 6.4 Remove ScrollTrigger, Embla, or other unused dependencies only when repository-wide import checks prove no remaining route consumes them; retain GSAP only while the required hero/header behavior depends on it
- [x] 6.5 Add tests for visible no-JavaScript content, reduced-motion static behavior, offscreen pause, hidden-tab pause, and structural nav state changes

## 7. Verify budgets and prevent regression

- [x] 7.1 Run focused tests while iterating, then run the full `pnpm test`, `pnpm typecheck`, and `pnpm check` suites
- [x] 7.2 Run a clean production build and confirm the static route classification and expected route chunk graph
- [x] 7.3 Run the final three-pass cold mobile audit and confirm median Performance ≥95, every run ≥90, LCP ≤2.5 s, CLS ≤0.1, and total blocking time ≤200 ms
- [x] 7.4 Confirm compressed first-load JavaScript ≤220 KiB, CSS ≤40 KiB, font preloads ≤100 KiB, total initial transfer ≤800 KiB, one priority content image, and no below-the-fold image preloads
- [x] 7.5 Run and record the desktop comparison audit and report whether the 98+ Lighthouse target was reached without presenting it as a guaranteed score
- [x] 7.6 Verify the H2b geometry, Spanish copy, section order, CTA targets, responsive behavior, keyboard flow, and reduced-motion/no-JavaScript fallbacks remain compliant with the approved specs
- [x] 7.7 Update the corresponding marketing-performance items in `docs/TASKS.md` after implementation and required validation are complete
