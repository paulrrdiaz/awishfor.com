## Why

A social-preview inspector flagged `og:image` as invalid ("Failed to analyze image") for a live published wishlist. The root cause is in `src/app/w/[slug]/opengraph-image.tsx`: before rendering, `safeCoverImage()` performs its own synchronous `fetch` of the remote cover-image URL, buffers the full body (up to 2MB) just to check its content-type and size, and only then hands the same URL to `ImageResponse` (Satori), which fetches it again to composite the pixels. Every request to the OG image route therefore depends on two sequential live fetches of a third-party-hosted file, bounded by a 1.5s timeout with no cross-request caching. Under a normal browser that's tolerable; under an external analyzer or link-unfurler with its own tight fetch budget, it reads as a broken image.

This is also a product opportunity worth taking at the same time: the cover photo is currently rendered at 34% opacity in a small 440px corner square behind bold "A Wish For" text — a decorative accent, not the star of the card. Making the actual wishlist photo the dominant visual is both a better share card and removes the reason the redundant validation fetch exists in the first place, since the image becomes structurally load-bearing rather than an optional overlay.

## What Changes

- Drop the request-time live-fetch-and-buffer validation in `opengraph-image.tsx`. The cover image is already a `WishlistImage` record with `url`, `width`, and `height` captured and validated at upload time (per `wishlist-cover-images`); render time should trust that record instead of re-fetching and re-validating the remote bytes before Satori fetches them again to composite.
- Recompose the branded 1200×630 preview: the cover photo becomes the dominant, full-bleed visual instead of a ghosted corner accent, with the "A Wish For" mark, event type, and title rendered as a legible overlay/scrim on top of it.
- Keep a branded fallback composition for wishlists with no cover image, restyled to match the new treatment so it still reads as intentional rather than a broken card.
- No change to what data is exposed in the image or metadata (still the existing public projection: title, welcome message, event type, theme, first cover image) and no change to the personalized-invite route's behavior — `/w/<slug>/<guestSlug>` still inherits the identical parent image with no guest name or slug in it.

## Capabilities

### New Capabilities

_None._

### Modified Capabilities

- `public-wishlist-social-metadata`: The "Branded preview image" requirement changes on two axes — (1) the cover image, when present, is the dominant visual element of the composition rather than a decorative accent, and (2) including the cover image no longer depends on a live, synchronous, per-request fetch of the remote file, so the response reliably completes without being at the mercy of the image host's live latency or availability.

## Impact

- `src/app/w/[slug]/opengraph-image.tsx` — composition rewrite; drop `safeCoverImage`'s live-fetch validation step.
- `src/app/w/[slug]/opengraph-image.test.tsx` — currently stubs `global.fetch` to simulate the validation gate for both the "cover available" and "cover unavailable" cases; needs to shift to exercising the new trust-the-record path and its own fallback condition (e.g. no cover image on the record) instead of a fetch failure.
- `openspec/specs/public-wishlist-social-metadata/spec.md` — delta to the "Branded preview image" requirement and its two scenarios.
- No schema, environment, or API changes. `src/server/services/public-wishlist-metadata.service.ts` already selects `url`, `width`, and `height` for the first cover image, which is sufficient for the new composition.
- Applies to both `/w/[slug]` and the inherited `/w/[slug]/[guestSlug]` route, since Next.js cascades one `opengraph-image.tsx` per segment down to nested routes.
