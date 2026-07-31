## Why

The landing page is the product's main acquisition surface, but its current anonymous request path is dynamically rendered and ships roughly 433 KB of compressed JavaScript, 355 KB of preloaded fonts, duplicate responsive hero images, and below-the-fold priority media. That delivery model makes a near-perfect Lighthouse result fragile and puts Core Web Vitals at risk even though the page is visually complete.

## What Changes

- Establish production-mode performance budgets and a repeatable audit workflow for the marketing route, including Lighthouse, Core Web Vitals, transferred JavaScript, critical font, image-priority, and layout-stability checks.
- Make the anonymous marketing shell statically renderable and cacheable by moving request-time authentication and application-wide client providers out of its critical rendering path.
- Preserve signed-in navigation as a non-blocking enhancement with stable geometry, while the initial marketing HTML uses a safe signed-out state.
- Restrict marketing typography to the families and weights used by the landing design instead of preloading the complete public-wishlist font catalog.
- Deliver one local, optimized `next/image` initial hero image as the sole high-priority/LCP candidate, delay future occasion images until after the initial render, and remove priority loading from below-the-fold examples.
- Keep the required hero-image rotation and synchronized occasion proof rail behind meaningful visitor activity, loading only the active and imminent image resources.
- Replace the full interactive public-wishlist composition inside the compact example with a lightweight, faithful marketing preview built from shared presentation contracts.
- Limit GSAP to the hero and header when it is needed for their required motion; use native CSS and browser APIs for all other optional marketing animation.
- Preserve the required header scroll-progress indicator while keeping its controller small and independent of unrelated marketing interactions.
- Stop continuous paint-heavy decorative effects when they do not communicate state, and make all nonessential motion conditional on viewport visibility and reduced-motion preferences.
- **BREAKING:** The initial signed-in marketing navigation is no longer server-personalized; it begins with a stable anonymous-safe action and may enhance after first paint.
- **BREAKING:** Hero occasion rotation no longer starts solely because the page loaded; it waits for visitor activity and remains static for reduced-motion or no-JavaScript sessions.
- **BREAKING:** The compact example is no longer required to mount `PublicWishlistPage`; Embla and shadcn are not required implementation details for marketing interactions that can meet the same UX contract more cheaply. GSAP is retained only for the constrained hero/header use cases.

## Capabilities

### New Capabilities

- `web-performance-guardrails`: Defines measurable production budgets, repeatable audits, and regression checks for the anonymous marketing experience.

### Modified Capabilities

- `marketing-landing`: Changes the route delivery, authentication enhancement, font loading, example-preview composition, image priority, and animation implementation requirements while preserving the approved design, content, section order, and responsive behavior.
- `hero-occasion-rotation`: Changes activation and resource-loading behavior so the first hero remains the sole initial LCP candidate and later occasion media cannot compete with first paint.

## Impact

- Affected code includes the root and route-group layouts, provider placement, request proxy, marketing navigation, hero and proof rail, compact example, font declarations, image components, marketing animation utilities, and related styles.
- Build and CI tooling gains a production audit command and explicit budgets; a Lighthouse-compatible development dependency or equivalent local runner may be added.
- Marketing image assets may be localized or re-encoded where needed to make their cache and transfer behavior deterministic.
- Existing public-wishlist layouts and typography remain supported outside the marketing route; extracting shared presentational data must not change their behavior.
- No Prisma schema, database migration, tRPC contract, Clerk configuration, or environment-variable change is planned.
- Redesigning the approved landing page, changing its copy or section order, and broadly optimizing authenticated application routes are out of scope.
- Field Core Web Vitals should be reviewed at the 75th percentile once representative traffic exists; selecting or integrating a new analytics/RUM vendor is out of scope for this change.
