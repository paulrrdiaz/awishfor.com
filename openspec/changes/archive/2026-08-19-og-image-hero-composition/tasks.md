## 1. Verify render-failure behavior

- [x] 1.1 Spike: render `ImageResponse` with a deliberately dead/unreachable image URL in the `<img src>` and confirm whether it throws (catchable) or renders silently broken. This decides whether try/catch alone is sufficient or a minimal HEAD-only existence guard is also needed (see design.md Risks).
  - Result: constructor does not throw and `arrayBuffer()` resolves fine (status 200) even for a fully dead URL; Satori logs `Can't load image ... fetch failed` and skips the element silently. Confirms silent failure — try/catch alone is insufficient, HEAD-only guard (2.5) required.

## 2. Rewrite the OG image route

- [x] 2.1 Remove `safeCoverImage()` and its validation `fetch`/buffer/timeout logic from `src/app/w/[slug]/opengraph-image.tsx`.
- [x] 2.2 Recompose the JSX: cover image (when present) as full-bleed background (`object-fit: cover`, 100% opacity, full 1200×630), a scrim strong enough to guarantee text contrast, "A Wish For" mark reduced to a small corner badge, event type and title as the primary overlay text.
- [x] 2.3 Keep the existing text-only fallback composition (no cover image) as a distinct branch, restyled to match the new treatment's typography/identity placement so it doesn't read as a broken/half-finished card.
- [x] 2.4 Wrap the hero-composition render in try/catch plus a bounded timeout guard (per design.md Decisions); on failure or timeout, render the text-only fallback composition instead.
- [x] 2.5 If the spike (1.1) shows silent failure rather than a thrown error, add a minimal HEAD-only existence check (short timeout, no body buffering) ahead of the hero render as an additional guard.
- [x] 2.6 Confirm dimensions/content sourced from `wishlist.images[0]` (`url`, `width`, `height`) still come from `getPublishedWishlistMetadata` with no changes needed to `public-wishlist-metadata.service.ts`'s selection shape.
  - Confirmed: `publicWishlistMetadataSelect` unchanged, still selects `url`/`width`/`height`; new composition only consumes `url`.

## 3. Update tests

- [x] 3.1 Update `src/app/w/[slug]/opengraph-image.test.tsx`: replace the `global.fetch` stub used to simulate the old validation gate with cases that reflect the new control flow (cover present → hero composition; no cover on the record → fallback; render throws/times out → fallback).
- [x] 3.2 Keep and adapt the existing lifecycle (`draft`/`archived`/unknown → 404), privacy (no guest/delivery/purchase leakage), and title-escaping test cases against the new composition.
- [x] 3.3 Add a test for the render-failure fallback path exercised in 2.4/2.5.

## 4. Validate

- [x] 4.1 Run `pnpm test`, `pnpm check`, and `pnpm typecheck`; report and resolve any failures before closing the session.
  - `pnpm test`: 8/8 `opengraph-image.test.tsx` tests pass (added a fake-timers test for the timeout-fallback path, since the spike showed a dead image doesn't throw — only the bounded timeout can trigger that branch in practice). 7 failures remain in `hero-ctas.test.tsx` / `public-wishlist-layout-rendering.test.tsx`, confirmed pre-existing on `main` (identical failures with this change stashed out) — unrelated to this change, not touched here.
  - `pnpm check`: clean (one import-order fix applied via `pnpm check:write`).
  - `pnpm typecheck`: clean.
  - Post-implementation review caught and fixed three gaps the mocked tests couldn't surface: (1) verified against the real production cover-image host (`*.ufs.sh`, via a live URL pulled from `awishfor.com/w/baby-shower-aella`) and Unsplash that both return 200 on `HEAD` — the existence guard is not a silent dead end. (2) The hero path was hand-building `{ "content-type": ... }` instead of forwarding the real `ImageResponse`'s headers, silently dropping its `cache-control` — fixed to pass `response.headers`/`response.status` through. (3) `HERO_RENDER_TIMEOUT_MS` was an unvalidated guess; measured a real ~2MB UploadThing photo (674ms cold, ~350-375ms warm end-to-end) and set it to 1.5s with headroom.
- [x] 4.2 Manually verify in browser: load `/w/<slug>/opengraph-image` for a wishlist with a cover image and one without, and re-check the reported URL (`/w/baby-shower-aella/cristina`) against the social-preview inspector that originally flagged it. (Reminder only — skip attempting automated browser verification unless explicitly requested.)
