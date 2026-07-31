## Context

The current landing page is visually faithful but inherits the application's heaviest delivery choices. The root layout mounts Clerk, nuqs, tRPC/React Query, tooltip, and toaster providers for every route and imports every public-wishlist font. The marketing navigation calls `auth()` during server rendering, while Clerk middleware calls `auth()` for every matched document request. Together these choices classify `/` as dynamic and add approximately 129 KiB of compressed provider JavaScript to its critical path.

The measured production marketing dependency graph contains approximately 433 KiB of compressed JavaScript across 26 modern-browser chunks. The document preloads ten font files totaling approximately 355 KiB and declares 164 font faces. The hero renders both mobile and desktop crops for four occasions; both initial crops and all four desktop photographs were requested in the observed session. The compact example imports `PublicWishlistPage`, which brings the complete 17-layout registry and interactive gift flows into a non-interactive proof section. Marketing motion adds GSAP/ScrollTrigger, while the simple guest finder adds React Hook Form, a resolver, and Zod.

The application running on port 4000 is a development server. Its multi-second timings are useful for dependency and request diagnosis but are not valid Lighthouse release scores. This change therefore treats the existing resource graph as the baseline and establishes a production-only measurement path before claiming a score.

The approved Claude Design composition, Spanish copy, section order, responsive layout, accessibility behavior, and public creation links remain product constraints. The solution must preserve Clerk and the public typography catalog where they are actually required, and it must not edit generated Prisma code or change database contracts.

## Goals / Non-Goals

**Goals:**

- Make the anonymous `/` document statically renderable and cacheable.
- Keep median production mobile Lighthouse Performance at or above 95, target 98+, and meet the established good Core Web Vitals thresholds.
- Reduce initial compressed marketing JavaScript to at most 220 KiB and critical font transfer to at most 100 KiB.
- Make the first wedding photograph the only initial hero/LCP image request and prevent future rotation states from extending initial LCP discovery.
- Preserve the approved landing design through server-first markup and narrowly scoped progressive enhancement.
- Add repeatable production auditing and resource-budget diagnostics that make regressions actionable.

**Non-Goals:**

- Redesigning the landing page, changing its copy, section order, or CTA destinations.
- Removing Clerk, tRPC, React Query, public-wishlist fonts, or shadcn from application routes that need them.
- Optimizing the dashboard, creation wizard, or live public-wishlist route beyond provider/font boundary work required to isolate marketing.
- Adding a new RUM vendor, changing Prisma, or changing public tRPC contracts.
- Guaranteeing a literal Lighthouse score of 100 across machines and network conditions.

## Decisions

### 1. Serve a static anonymous shell and enhance the account link after paint

The root layout will become a minimal document shell containing global CSS, metadata, and route-neutral HTML/body behavior. Clerk, tRPC/React Query, nuqs, tooltip, toaster, and optional font catalogs will move to the nearest route layouts that consume them. The marketing layout will import only marketing fonts and server-safe marketing components.

`MarketingNav` will stop calling `auth()`. Its server output will always contain the stable “Iniciar sesión” fallback. A small, isolated client enhancement may request a boolean session-state endpoint after the load event during idle time or after first interaction, then replace the label and target with “Dashboard” for a signed-in visitor. The account slot will reserve a stable inline size. The endpoint will return no user profile data and will use private/no-store caching. If the enhancement never runs, the existing signed-in redirect on the auth route remains the functional fallback.

The Clerk middleware matcher will cover protected routes, auth routes that redirect signed-in users, and API/tRPC routes that require Clerk context. Static marketing documents and assets will bypass it. Production build output must classify `/` as static/prerendered.

Alternatives considered:

- Keeping `auth()` in the marketing server tree preserves personalized first HTML but necessarily keeps the route dynamic.
- Keeping the root `ClerkProvider` and using `useAuth()` makes enhancement simple but retains most of the measured provider payload.
- Partial prerendering with a dynamic auth boundary still creates request-time work for a cosmetic link and couples the acquisition route to framework cache semantics. It can be revisited if first-response personalization becomes a stronger product requirement.

### 2. Scope fonts by route instead of exporting the whole catalog from the root

The root document will not apply `PUBLIC_FONT_VARIABLE_CLASSES` or JetBrains Mono. The marketing layout will import variable Lora and Inter declarations limited to the required Latin subset and apply their variables to the marketing wrapper. The public-wishlist route will retain the full selectable catalog in its own boundary, with optional families configured not to preload unless required by that route's strategy. Application monospace and application-specific fonts will be attached only to app boundaries that use them.

This design aims for two above-the-fold marketing font preloads and permits a third only if browser/build output requires a distinct italic file used by the H2b headline. The audit enforces both count and encoded-size limits.

Alternative considered: disabling all font preloads would lower contention but makes headline font swap timing less predictable. Two carefully scoped, used preloads give a better LCP/visual-fidelity balance.

### 3. Render one optimized local hero image and add future occasions on demand

The first hero photograph will use one local `next/image` request candidate through the framework optimizer. It will carry the only high-priority/fetch-priority signal on the page. Its `sizes` policy and intrinsic geometry will reserve the final layout without emitting duplicate breakpoint images.

Only the wedding image and rail will be present in server HTML. A minimal hero controller will listen once for meaningful visitor activity and will start only when the document is loaded, the tab is visible, the hero intersects the viewport, and reduced motion is not requested. At activation it will insert or request the next occasion. The DOM will retain at most the active and imminent photographs; after a crossfade, the outgoing image is removed and the following image may be prepared. The controller owns both image and rail state so they cannot drift.

Transforms and opacity remain the only animated photograph properties. Activity listeners, visibility observers, and timers will be cleaned up when no longer needed. No-JavaScript, idle, and reduced-motion users receive the exact first H2b composition.

Alternatives considered:

- Rendering all images with lazy loading still allowed the browser to request stacked above-the-fold resources and produced late LCP candidates.
- CSS `display: none` across duplicate breakpoint image elements does not reliably prevent both resources from being discovered.
- Preloading all occasions makes transitions instant but directly competes with the LCP asset.

### 4. Use server-first progressive enhancement with narrowly scoped hero/header motion

Marketing sections will render meaningful HTML as server components. A small shared controller layer may add:

- IntersectionObserver-driven reveal classes.
- Scroll state for the H2b navigation.
- Page/viewport lifecycle control for the hero and marquee.
- Native scroll-snap occasion cards with lazy autoplay/dot synchronization.
- Accessible mobile-drawer behavior if the existing Sheet chunk cannot be deferred within budget.

FAQ content will use native accessible disclosure markup unless a shadcn accordion can meet the same initial-JavaScript budget. The guest finder will use a native form and lightweight slug parsing rather than React Hook Form, the Zod resolver, and Zod. Validation that protects a server boundary remains server-owned; this field's client code is only usability validation.

GSAP is permitted only in the hero and header controllers, where the required photographic rotation and header treatment benefit from its sequencing. It must not become a general marketing animation dependency: other sections use CSS or small browser-API controllers only when motion is useful. ScrollTrigger will leave the marketing dependency graph, and GSAP may be removed from the package only if the required hero/header behavior is replaced and a repository search proves no remaining consumer. Decorative glow will become static or hover/focus emphasis. Any retained marquee or decorative transform loop runs only while visible and pauses for hidden tabs and reduced motion.

Alternative considered: dynamically importing the existing React/GSAP implementations near the viewport. This reduces initial execution but preserves duplicate component/runtime abstractions and can still expose their preload chunks; the server-first controller is smaller and easier to budget.

### 5. Replace the embedded application with a purpose-built server preview

The “Ejemplo real” section will consume `demo-wishlist.ts` through a small view model and server-safe presentation primitives. It will reproduce the approved compact hero, event metadata, and representative gift cards without importing `PublicWishlistPage`, the 17-layout static map, purchase modals, tRPC mutations, or client gift interactions.

Shared types, token resolution, data formatting, and purely presentational atoms may be extracted from the public implementation to prevent drift. Stateful production components will not be generalized merely to satisfy reuse. A component/visual regression test will cover the compact preview's required content and non-interactive behavior.

Alternative considered: adding deeper `compact` branches to every production component. Static imports would still pull the layout registry and client modules into the marketing graph, while conditional complexity would increase in the live public page.

### 6. Treat image priority as an explicit component contract

Reusable image-bearing components such as wishlist heroes will accept an explicit loading/priority policy instead of unconditionally setting priority. Live public routes can opt into their true above-the-fold image; the marketing preview will always opt out. Fixed marketing imagery should be localized and encoded through the framework optimizer when external origins or cache behavior make the audit nondeterministic.

Tests will cover the generated priority attributes and the audit will inspect actual network requests, because DOM attributes alone do not prove that alternate crops or future states stayed off the wire.

### 7. Gate on stable budgets and report the stretch target separately

A versioned audit configuration and package command will:

1. Build the current revision.
2. start `next start` on a dedicated audit port;
3. verify production runtime markers;
4. run at least three cold mobile Lighthouse passes and one desktop pass;
5. calculate medians and enforce score, LCP, CLS, total blocking time, and payload budgets; and
6. print a resource breakdown when a threshold fails.

The required mobile score is a median of 95 with no run below 90. A median of 98+ is the optimization target. This separates a meaningful “almost perfect” goal from a brittle exact-100 promise. The audit will also enforce compressed first-load JavaScript at 220 KiB, CSS at 40 KiB, preloaded fonts at 100 KiB, total initial transfer at 800 KiB, one high-priority content image, no below-fold image preloads, and no more than three font preloads.

The command should reuse existing browser tooling when it can expose Lighthouse categories and resource details consistently; otherwise it will add a pinned Lighthouse-compatible development dependency. Generated reports belong in an ignored artifact directory, while thresholds and scripts are committed.

## Data Flow

1. A browser requests `/`; middleware does not intercept the document.
2. The CDN or Next static handler returns cached marketing HTML, scoped font links, CSS, and one optimized local wedding image candidate.
3. Server HTML provides all copy, navigation fallback, sections, first proof rail, and lightweight example content without application providers.
4. Small marketing enhancement code registers visibility/reduced-motion guards without hiding content.
5. After load and visitor activity, the hero controller requests the imminent optimized image and advances the image/rail from one shared state.
6. During idle time or first interaction, the account enhancement optionally requests a private boolean session state and updates a geometry-stable link.
7. Below-the-fold controllers and media activate only as their sections approach the viewport.

The only new HTTP surface under consideration is the private, read-only session-state endpoint. It returns `{ authenticated: boolean }`, exposes no identity fields, performs no mutation, and does not alter tRPC, Prisma, or environment configuration.

## Validation

- Confirm `next build` reports `/` as static/prerendered.
- Run Biome, TypeScript, and the focused Vitest/component suite.
- Inspect a fresh mobile and desktop network trace for one initial hero crop, no future occasion requests before activity, no below-fold priority images, and bounded font preloads.
- Verify no Clerk/tRPC/React Query/nuqs/ScrollTrigger/Embla/RHF/Zod marketing-only chunks appear in the initial dependency graph. If GSAP is present, verify it is limited to the required hero/header behavior and remains within the measured budget.
- Run the versioned production audit and record all three mobile scores, medians, vitals, payloads, and the desktop comparison.
- Exercise no-JavaScript, reduced-motion, keyboard navigation, mobile drawer dismissal/focus return, hidden-tab pause, offscreen pause, and authenticated link enhancement.
- Compare the 1240px artboard and the supplied 1302×739 viewport against the approved H2b design after architectural changes.

## Risks / Trade-offs

- [Signed-in visitors briefly see “Iniciar sesión”] → Reserve stable geometry, enhance after first paint, and keep auth-route redirect as the no-JavaScript fallback.
- [Static route loses request-time personalization beyond navigation] → Keep marketing content anonymous by contract; move future personalization behind explicit post-paint islands.
- [On-demand hero images can make the first transition late on slow networks] → Fetch the imminent image immediately after activity and transition only after decode; extend the hold rather than showing a blank or abrupt swap.
- [Native replacements can regress accessibility] → Preserve keyboard, focus, Escape, outside-click, and semantic disclosure scenarios in focused tests before removing shadcn primitives.
- [Font isolation changes rendering on non-marketing routes] → Move existing declarations without deleting supported families, then smoke-test public wishlist and app route typography.
- [Lighthouse results vary by machine] → Gate on three-run medians plus an individual floor, pin profiles/tooling, and treat 98+ as a target rather than a guaranteed exact score.
- [A static session endpoint adds a request for a cosmetic enhancement] → Schedule it after critical rendering, return one boolean, and omit the request entirely when the enhancement budget proves more costly than its value.

## Migration Plan

1. Add the production audit and capture the current production baseline before changing delivery behavior.
2. Add route-scoped provider and font boundaries, remove server auth from marketing, narrow middleware matching, and verify `/` becomes static.
3. Replace duplicate hero markup with one optimized local `next/image` candidate and an activity-gated two-image controller.
4. Replace the full public-page example and simplify below-the-fold marketing interactions and motion.
5. Tune assets and loading priorities until all hard budgets pass, then complete visual and accessibility regression checks.
6. Land the changes without a data migration. Rollback consists of reverting the route/layout and component commits; no persisted state or schema rollback is required.

## Open Questions

- Whether the post-paint account-label enhancement provides enough value to keep after its measured request and JavaScript cost. The static auth-route redirect remains required either way.
- Whether existing browser tooling can produce stable Lighthouse category scores and encoded-resource reports in CI, or whether the repository should pin Lighthouse/LHCI as a development dependency.
- Which remote marketing photographs must be localized to make cache headers and image transformation deterministic; decide from the first production baseline rather than preemptively copying every asset.
