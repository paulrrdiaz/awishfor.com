## Why

Shared public wishlists currently produce no Open Graph, Twitter Card, or canonical metadata, so copied links cannot render a deliberate branded preview. The same guest-facing route also misses the project's production performance bar: a representative 24-gift wishlist scored a median 47 in mobile Lighthouse with 6.4 s LCP, 1.2 s TBT, about 815 KiB of JavaScript, and ten preloaded font files.

## What Changes

- Add privacy-safe social metadata for published wishlists: canonical URL, Open Graph fields, Twitter Card fields, and a branded 1200×630 share image with a deterministic fallback.
- Keep public wishlists unlisted and `noindex`; social previews MUST NOT expose guest identity, owner-only data, hidden gifts, purchase details, or draft content.
- Make personalized invite URLs reuse the parent wishlist's public social identity and canonical URL without including `guestSlug` or guest names in metadata.
- Reduce published-wishlist server latency by deduplicating route/metadata reads, removing redundant relation loading, and caching only public published data with explicit invalidation after relevant lifecycle, content, design, image, gift, purchase, and undo mutations.
- Reduce the anonymous wishlist baseline by avoiding unnecessary Clerk client UI and application-wide providers on the public surface while preserving server-side owner-preview authorization and every guest purchase/RSVP interaction.
- Load only the active public heading/body font resources and keep one above-the-fold hero image prioritized; defer non-critical runtime and below-the-fold work where interaction behavior permits.
- Add a repeatable production Lighthouse audit for deterministic light and heavy public-wishlist fixtures, with versioned score, Core Web Vitals proxy, payload, font, image-priority, and diagnostic budgets.
- Add metadata, privacy, cache invalidation, provider-boundary, font-loading, and performance regression coverage.
- Preserve the current visual design, layout catalog, copy, filters, purchase drawer, RSVP behavior, owner preview, archived/not-found handling, and `noindex` policy.

## Capabilities

### New Capabilities

- `public-wishlist-social-metadata`: Define canonical, Open Graph, Twitter Card, share-image, fallback, lifecycle, and privacy behavior for public and personalized wishlist links.

### Modified Capabilities

- `public-wishlist-page`: Require efficient published-route data resolution, safe cache invalidation, and unchanged owner-preview and guest interaction freshness.
- `personalized-invite-page`: Require personalized URLs to publish only the parent wishlist's privacy-safe social identity while retaining invite resolution and open tracking.
- `public-theme-config`: Require the public wishlist to request only the active font families instead of the full configurable font catalog.
- `authentication`: Allow the anonymous public-wishlist client surface to omit Clerk client UI/application-provider overhead while preserving authenticated owner preview and protected-route session behavior.
- `web-performance-guardrails`: Extend production audit coverage and budgets from the marketing homepage to representative public-wishlist routes.

## Impact

- Affected routes and metadata: `src/app/w/[slug]`, `src/app/w/[slug]/[guestSlug]`, route layouts, metadata helpers, and a share-image route or image generator.
- Affected server paths: public wishlist queries/mappers, request memoization or published-data cache, and invalidation from wishlist, design, image, gift, purchase, undo, publish, archive, and restore mutations.
- Affected client boundaries: Clerk, tRPC/React Query, Nuqs, tooltip/toaster providers, public gift/RSVP interaction islands, and below-the-fold hydration.
- Affected assets/config/tooling: public font registration, wishlist performance audit configuration/scripts, deterministic audit fixtures, Vitest coverage, and CI verification evidence.
- No database-schema, public URL format, new environment-variable, or external dependency change is expected.
- Non-goals: making wishlists indexable or searchable, exposing personalized guest information in previews, redesigning wishlist layouts, changing gift purchase/RSVP business rules, adding historical slug redirects, or optimizing unrelated dashboard and marketing flows.
