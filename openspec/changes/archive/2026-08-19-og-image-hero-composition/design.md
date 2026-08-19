## Context

`src/app/w/[slug]/opengraph-image.tsx` currently does two sequential live fetches of the wishlist's first `WishlistImage.url` before a response can be produced: `safeCoverImage()` performs a full `fetch` + body buffer (up to 2MB, 1.5s timeout) purely to check content-type and size, and then `ImageResponse` (Satori, via `next/og`) fetches the same URL again to composite it into the output PNG. This route has no `revalidate`/caching, so both fetches happen on every request, including every crawler/link-unfurler hit. See proposal.md - Why for the production symptom this causes.

Separately, `WishlistImage` records already carry `url`, `width`, and `height` captured and validated once at upload time (`wishlist-cover-images` spec: "Orientation SHALL be computed once when the image is added and persisted, not recomputed at render time" — the same principle applies to trusting the stored record generally). `getPublishedWishlistMetadata` already selects these fields.

## Goals / Non-Goals

**Goals:**
- Remove the redundant pre-render validation fetch; the route should perform at most the one fetch `ImageResponse` needs to actually composite the photo.
- Guarantee the route still degrades to the existing branded fallback — never a hung request or a 500 — when the remote image is slow, unreachable, or invalid, without a separate validation round-trip providing that guarantee.
- Recompose the image so the cover photo is the dominant visual (full-bleed) with a legible text overlay, instead of a small ghosted corner accent.

**Non-Goals:**
- Route-level response caching (`revalidate`) for the OG image endpoint. Removing the duplicate fetch already bounds per-request latency and fixes the reported failure; adding caching on top is a reasonable follow-up but not required here and would widen this change's surface (cache invalidation on cover-image change, etc.).
- Personalizing the image or metadata per guest on `/w/<slug>/<guestSlug>` — unaffected and explicitly out of scope per the existing privacy requirement.
- Changing `buildPublicWishlistMetadata` / the `<head>` metadata composition logic — only the image route changes.
- Changing upload-time image validation or the `WishlistImage` schema.

## Decisions

**Drop `safeCoverImage`'s validation fetch; trust the persisted record.** The stored `url`/`width`/`height` were already validated when the image was uploaded. Re-fetching and buffering the full body at render time, only to discard the bytes and let Satori fetch it again, doubles the route's exposure to the remote host's latency for no correctness benefit. Alternative considered: keep the double-fetch but shrink the timeout — rejected, it reduces but doesn't remove the flakiness, and still pays for a full-body fetch whose result is thrown away.

**Preserve the fallback guarantee via a bounded, guarded render instead of pre-validation.** Wrap the `ImageResponse` construction for the hero composition in a try/catch, and bound its wall-clock time with an outer `Promise.race` against a short timeout (on the order of ~1s, well under what social-crawler analyzers budget). If the render throws or the timeout wins, re-render using the existing text-only fallback composition (which has no external dependency and cannot itself fail this way). This keeps exactly one network fetch attempt in the common case while still satisfying "cover image cannot be rendered → fallback" from the spec.

**Recompose the card as full-bleed photo + scrim, not a side accent.** The cover image becomes the full 1200×630 background (`object-fit: cover`), with a gradient/solid scrim beneath the text block strong enough to guarantee contrast regardless of the underlying photo, the "A Wish For" mark shrunk to a small corner badge, and title/event type as the primary overlay text. Alternative considered: keep a split/side-by-side layout with the photo enlarged — rejected, it still treats the photo as secondary, and most link-unfurler crops (roughly 1.91:1) favor a full-bleed treatment over a layout with dead space.

## Risks / Trade-offs

- [Risk] `next/og`'s `ImageResponse` may not expose a way to bound or abort a slow embedded image fetch internally → [Mitigation] Bound it externally with `Promise.race` against a fixed timeout, falling back to the text-only composition when the timeout wins.
- [Risk] If a broken image URL causes Satori to render silently (a blank/broken element) instead of throwing, the try/catch guard won't catch it and a broken-looking card could ship → [Mitigation] Verify this during apply with a test against a deliberately dead image URL; if silent failure is confirmed, add back a minimal existence-only check (HEAD request, short timeout, no body buffering) as a guard — a much cheaper check than today's full-body validation fetch, and still a single extra round trip rather than a full duplicate download.
- [Risk] A full-bleed photo with a text scrim could reduce legibility versus the current guaranteed-flat-color background for very bright or busy photos → [Mitigation] Use an opaque-enough scrim band (roughly 70-85% dark overlay) behind the text block so contrast holds regardless of the photo underneath.

## Migration Plan

No schema, data, or environment changes. This is a single-file composition and control-flow change plus its test file; ship as one deploy. Rollback is a plain revert of `opengraph-image.tsx` (and its test) to the prior version — no state to unwind.

## Open Questions

- Exact visual treatment (scrim strength, corner-badge size, typography scale) — check whether `A Wish For.dc.html` (the Claude Design reference in CLAUDE.md) documents a social-card treatment; if not, follow the existing theme tokens already used by the current implementation (`resolveTheme`'s `--background`/`--foreground`/`--primary`). This doesn't change the chosen approach or task breakdown, only the final pixel values.
