## Context

See `proposal.md` for motivation and the capability deltas for observable behavior.

Published and personalized wishlist routes share `buildPublicWishlistMetadata`, backed by a minimal published-only projection. That projection currently omits `eventDate` and `language`; metadata uses the raw wishlist title and bounds the normalized welcome message at 200 characters. The existing UTC-safe `formatEventDate` already produces a capitalized weekday and full date for Spanish and English.

The social image route renders a 1200×630 composition through `ImageResponse`. Next.js rasterizes that composition to PNG, so a photographic cover can produce a response around 1.4 MiB even when the uploaded source was compressed. The route already bounds remote cover reachability and render time and falls back to a branded text-only composition.

Cover controls measure each original file, upload it directly through UploadThing, then persist its dimensions and orientation. UploadThing enforces the existing supported types and 4 MiB cover limit. Gift images share the transport but are outside this change.

## Goals / Non-Goals

**Goals:**

- Keep one privacy-safe parent social identity for published and personalized links while adding localized event context.
- Produce consistent bounded metadata without changing visible wishlist content.
- Reduce photographic social cards below 1 MiB while retaining the standard 1200×630 composition and legible overlays.
- Reduce transfer and storage for accepted oversized cover photos with high-quality, client-side preprocessing.
- Keep preprocessing and social encoding deterministic, testable, and bounded.

**Non-Goals:**

- Recompressing existing UploadThing objects or storing separate original/optimized cover variants.
- Changing public layouts, the social-card composition, gift-image uploads, or user-facing content fields.
- Guaranteeing mathematically lossless cover or social-image encoding.
- Changing cache topology, database records, upload authorization, lifecycle privacy, or search indexing.

## Decisions

### 1. Extend the published metadata projection only with public date fields

Add `eventDate` and `language` to `publicWishlistMetadataSelect` and its audit-fixture mapping. Both values already belong to the public presentation model and reveal no owner or guest identity. Do not load event time, invite state, or any broader wishlist relation.

The metadata flow remains:

```text
published slug
  │
  ▼
minimal metadata projection
  ├── title + eventDate + language ─► bounded social title
  ├── welcomeMessage + eventType ───► bounded description
  └── first cover + theme ───────────► social image
```

Alternative considered: load the full public wishlist snapshot. Rejected because it weakens the existing privacy and crawler-performance boundary for two scalar fields.

### 2. Build a localized title within one fixed total budget

Use `formatEventDate(eventDate, language)` without event times. Dated titles use:

```text
{wishlist title} — {localized weekday and date} | A Wish For
```

Undated titles use locale-specific labels:

```text
es: {wishlist title} — Lista de deseos | A Wish For
en: {wishlist title} — Wishlist | A Wish For
```

Build the suffix first, reserve its characters within the 60-character total, then normalize and truncate only the wishlist-title segment at its last available word boundary. If no boundary exists, use a character boundary. Append an ellipsis inside the reserved title segment. The full original wishlist title remains unchanged in the page and social-card artwork.

Alternative considered: append only the date. Rejected because representative Spanish and English examples remain about 42–45 characters and can still trigger short-title diagnostics. Alternative considered: allow the title to reach the previous 120-character limit. Rejected because it makes the date and brand the most likely portion to be truncated by social clients.

### 3. Bound the existing welcome message at a word boundary

Keep the current source priority: normalized `welcomeMessage`, then the existing event-aware fallback. Lower the final description budget to 125 characters. A shared bounding helper will collapse whitespace, preserve text that already fits, and otherwise truncate at the last word boundary that leaves room for an ellipsis. It must never exceed the configured limit even for a single long token.

Alternative considered: replace custom welcome copy with generated event copy. Rejected because the product decision is to retain the creator's message when present.

### 4. Encode the completed social composition as JPEG

Keep `ImageResponse` for layout and rasterization, then decode its fully buffered PNG output with `pngjs` and encode it with `jpeg-js`. Both libraries are portable JavaScript dependencies, avoiding native image-library binaries in the Vercel server function. Return a new response with `content-type: image/jpeg`, the encoded byte length, and the relevant cache headers. Export `contentType = "image/jpeg"`; keep `size = { width: 1200, height: 630 }`.

Start JPEG encoding at quality 85. If an encoded response exceeds 1 MiB, retry through a bounded descending quality ladder. The first result below the hard limit wins. Deterministic representative photo and text-only fixtures must remain at or below the preferred 500 KiB budget. The composition is fully opaque, so JPEG does not introduce an alpha-background decision.

Both the cover-photo and text-only paths go through the same encoder. Existing HEAD and hero-render timeouts remain in front of encoding; a slow or unreachable cover still selects the text-only composition before encoding. Encoding errors are treated as route failures rather than returning bytes whose MIME type contradicts advertised metadata. Build and focused response tests validate that the native encoder is available in the deployment runtime.

Alternative considered: optimize the uploaded cover only. Rejected because `ImageResponse` decodes the source and creates a new PNG; source byte savings do not control final-card bytes. Alternative considered: lossless PNG optimization. Rejected because photographic cards cannot reliably meet the hard budget without color quantization. Alternative considered: WebP. Rejected in favor of JPEG's broader social-crawler compatibility.

### 5. Preprocess accepted cover images before UploadThing starts

Add `browser-image-compression` as a direct production dependency and wrap it in a cover-only utility. Validate the original file against the existing supported MIME types and 4 MiB source limit first. Trigger preprocessing when either the file exceeds 1.5 MiB or its longest edge exceeds 2560 pixels. Configure a 1.5 MiB target, 2560-pixel longest edge, initial quality 0.92, preserved MIME type and aspect ratio, and Web Worker execution.

Use a same-origin, application-owned worker URL so preprocessing does not require a CDN script or weaker Content Security Policy. If Worker execution is unavailable or compression throws, continue with the original accepted file. Compare byte sizes and choose the processed file only when it is smaller. This makes optimization best-effort without converting a valid selection into an upload failure.

Measure natural dimensions after the upload candidate has been selected. Persist those candidate dimensions and derive orientation from them, ensuring stored geometry matches the hosted object after a resize. Process multi-file selections sequentially as today to bound browser memory, retain selection order, and report per-file failures without aborting the batch.

Alternative considered: process uploads on the application server. Rejected because it routes image bytes through application compute, adds a second storage upload, and complicates cleanup. Alternative considered: modify gift uploads simultaneously. Rejected because social rendering only consumes cover images and the user explicitly scoped this change to covers.

### 6. Verify byte budgets independently from page Lighthouse budgets

Add focused tests for title localization and truncation, undated fallback titles, description word-boundary truncation, privacy-safe projection fields, JPEG content type and dimensions, encoder fallback quality, and cover-file candidate selection. Use deterministic local photo and text-only fixtures to assert the 500 KiB preferred budget and 1 MiB hard budget.

Run the existing production public-wishlist audit because the route and metadata image are performance-sensitive. Record the social-image URL, content type, dimensions, transfer bytes, and response timing alongside the existing page evidence; do not relax the existing page budgets.

## Risks / Trade-offs

- **[JPEG compression softens text or skin detail]** → Start at quality 85 with 4:4:4 chroma, use lower quality only when required by the hard budget, and visually inspect representative photo and fallback cards.
- **[Native encoding increases cold-start CPU or bundle size]** → Encode only one fixed 1200×630 buffer, keep the retry ladder bounded, cache through the existing metadata-image route behavior, and record response timing in production-mode verification.
- **[Worker loading conflicts with CSP]** → Serve the worker from the application origin and add no third-party script source; cover the production upload surface in verification.
- **[Preprocessing technically changes accepted cover pixels]** → Use high-quality encoding, cap only oversized sources, preserve aspect ratio/type, and retain the original whenever the processed result is not smaller or processing fails.
- **[Stored dimensions describe the wrong file]** → Measure after candidate selection and persist only the selected candidate's geometry.
- **[Long localized suffix leaves little room for the wishlist title]** → Support only the existing Spanish and English date formats, reserve the suffix first, and test minimum remaining title space in both locales.
- **[Social platforms retain stale preview caches]** → Validate with fresh test slugs or each platform's re-scrape tooling; no application cache migration is required.

## Migration Plan

1. Add the two direct image-processing dependencies and verify server/runtime plus same-origin worker bundling.
2. Extend the safe metadata projection and land bounded localized metadata with focused tests.
3. Add the shared JPEG encoder and route it through both social compositions; verify bytes, MIME type, dimensions, failure behavior, and timing.
4. Add cover-only preprocessing, measure the selected upload candidate, and verify multi-file ordering and fallback behavior.
5. Run static checks, the full test suite, production build, and public-wishlist performance audit; inspect representative social cards visually.

No database migration or backfill is needed. Existing hosted covers remain valid and are optimized only when re-uploaded. Rollback restores PNG social responses and direct cover uploads; newly optimized covers remain valid UploadThing objects and require no cleanup.
