## 1. Metadata Foundation

- [x] 1.1 Add a server-only published-wishlist metadata projection and tests proving it selects only lifecycle, public presentation, theme, and first-cover-image fields.
- [x] 1.2 Add a shared metadata builder with tests for title, description fallback, absolute canonical URL, Open Graph, Twitter Card, `noindex, nofollow`, and bounded user text.
- [x] 1.3 Wire `/w/[slug]` and `/w/[slug]/[guestSlug]` metadata through the shared builder, preserving generic metadata for draft, archived, inaccessible, and unknown states.
- [x] 1.4 Add route-level HTML metadata tests proving published tags require no client execution and personalized metadata excludes guest name, `guestSlug`, owner, delivery, hidden-gift, and purchase data.

## 2. Branded Social Image

- [x] 2.1 Implement the 1200×630 `/w/[slug]/opengraph-image` composition with A Wish For branding, event treatment, wishlist title, and existing public theme colors.
- [x] 2.2 Add bounded cover-image fetching with timeout, content-type and size validation, plus a deterministic branded fallback for missing or unreadable images.
- [x] 2.3 Restrict social-image resolution to published metadata and add tests proving draft, archived, inaccessible, and unknown wishlists cannot leak a wishlist-specific image.
- [x] 2.4 Add image-response tests for dimensions, content type, first-cover use, fallback behavior, escaped text, and absence of personalized or owner-only data.

## 3. Public Snapshot and Cache

- [x] 3.1 Split minimal lifecycle resolution, cached published loading, uncached owner-preview loading, archived resolution, and not-found resolution into explicit server-only paths.
- [x] 3.2 Replace broad Prisma includes with explicit public selects so categories do not reload gifts and purchases and sensitive fields never enter the snapshot.
- [x] 3.3 Add request memoization so metadata and page rendering share one consistent route snapshot, with call-count and concurrent-change consistency tests.
- [x] 3.4 Add tagged cross-request caching for published presentation data keyed by wishlist id and slug, with tests for anonymous reuse and draft/personalized cache isolation.
- [x] 3.5 Compose personalized pages from the cached published base plus an uncached invite lookup, preserving first-render `openedAt` tracking without metadata side effects.

## 4. Cache Invalidation

- [x] 4.1 Add a central post-commit public-wishlist invalidation helper for id tags, current/previous slug tags, page paths, and the social-image path.
- [x] 4.2 Invoke invalidation after successful wishlist publish, archive, restore, slug, settings, content, and design mutations.
- [x] 4.3 Invoke invalidation after successful cover-image, category, and gift create/update/delete/visibility/reorder mutations.
- [x] 4.4 Invoke invalidation after guest purchase, owner purchase changes, and guest undo, before refreshed public data is requested.
- [x] 4.5 Add mutation coverage proving failed transactions do not invalidate, slug changes clear old and new paths, and every public mutation entry point is mapped.

## 5. Provider and Font Boundaries

- [x] 5.1 Add a scoped Clerk application wrapper to the existing auth, protected, and creation layouts and remove `ClerkProvider` from the anonymous root layout.
- [x] 5.2 Add regression tests for sign-up/sign-in/recovery/OAuth/create/dashboard client auth, server/API auth, and signed-in draft-owner preview after the provider move.
- [x] 5.3 Replace `/w`'s `ApplicationLayout` with a public-specific layout and scope the minimal tRPC/React Query provider to public mutation subtrees, excluding Nuqs, tooltip, and global toaster.
- [x] 5.4 Extend public font options with active variable classes, disable catalog-wide automatic preload, deduplicate identical heading/body families, and keep utility mono delivery within the three-font limit.
- [x] 5.5 Add production HTML/network assertions proving public wishlists load no Clerk UI packages, no inactive font families, and no more than three initial font resources.

## 6. Hydration and Rendering Cost

- [x] 6.1 Replace per-card and filter-result GSAP animation with equivalent CSS motion/reduced-motion treatments and remove the unused public-list GSAP hooks from the initial bundle.
- [x] 6.2 Apply stable `content-visibility` and intrinsic-size containment to below-the-fold gift cards without changing server-rendered gift availability or accessibility.
- [x] 6.3 Defer guest gift drawer implementation until first product/purchase activation while showing an immediate themed loading state and honoring the first pointer or keyboard activation.
- [x] 6.4 Verify filters, sorting, product departure, purchase, undo, focus restoration, refreshed progress, share, and RSVP behavior across light and heavy wishlists after hydration changes.
- [x] 6.5 Verify every public layout exposes exactly one high-priority first-fold hero image and keeps below-the-fold gift images lazy.

## 7. Production Performance Guardrail

- [x] 7.1 Add deterministic light and heavy public-wishlist fixtures with local assets behind a server-only audit mode and prove their reserved slugs return not-found in normal runtime.
- [x] 7.2 Add versioned public-wishlist Lighthouse configuration with the specified mobile/desktop profiles, score, LCP, CLS, TBT, JavaScript, CSS, font, total-transfer, image-priority, and font-count budgets.
- [x] 7.3 Add `scripts/audit-public-wishlist-performance.mjs` to build, serve, run three cold mobile audits per fixture plus heavy desktop, persist evidence, and print actionable resource diagnostics.
- [x] 7.4 Add the package script and repository guidance for running the public-wishlist audit independently and alongside the marketing audit when shared provider/font code changes.
- [x] 7.5 Run the audit and optimize until both fixtures achieve median Performance ≥95, every run ≥90, LCP ≤2.5 s, CLS ≤0.1, TBT ≤200 ms, JS ≤220 KiB, CSS ≤40 KiB, fonts ≤100 KiB, total transfer ≤800 KiB, one priority image, and at most three fonts.

## 8. Final Verification and Tracking

- [x] 8.1 Run focused metadata, service, cache, invalidation, provider, font, and public interaction tests and resolve all regressions.
- [x] 8.2 Run `pnpm check`, `pnpm test`, `pnpm typecheck`, and `pnpm build`, recording any environment-dependent limitation explicitly.
- [x] 8.3 Run both production performance audits and retain their summaries as verification evidence.
- [x] 8.4 Inspect generated published and personalized HTML plus the social-image response to confirm canonical, Open Graph, Twitter, robots, privacy, image dimensions, and content type.
- [x] 8.5 Update the corresponding public-wishlist metadata, sharing, font, auth-provider, and performance items in `docs/TASKS.md` to reflect the completed OpenSpec change.
