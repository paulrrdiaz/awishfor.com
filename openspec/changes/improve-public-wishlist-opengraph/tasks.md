## 1. Image Processing Foundations

- [x] 1.1 Add `sharp` and `browser-image-compression` as direct production dependencies and verify their server and browser entry points build under Next.js 16.
- [x] 1.2 Add deterministic local cover-photo and text-only image fixtures suitable for JPEG byte-budget tests without relying on remote hosts.

## 2. Localized Social Metadata

- [x] 2.1 Extend the published-only metadata projection and audit-fixture mapping with `eventDate` and `language`, and update service tests to preserve the minimal privacy-safe field boundary.
- [x] 2.2 Implement word-boundary text bounding plus localized dated and undated social-title composition with a 60-character total budget.
- [x] 2.3 Apply the 125-character word-boundary budget to normalized welcome-message descriptions while preserving event-aware fallback copy.
- [x] 2.4 Expand metadata builder and route tests for Spanish and English dates, missing dates, long titles, long or empty welcome messages, canonical identity, and personalized-route privacy.

## 3. Compressed Open Graph Responses

- [x] 3.1 Add a server-only JPEG encoder around `sharp` with progressive mozjpeg defaults, a bounded quality ladder, preserved 1200×630 dimensions, and focused encoder tests.
- [x] 3.2 Route both cover-photo and text-only `ImageResponse` buffers through the JPEG encoder and update exported/HTTP content types and response headers.
- [x] 3.3 Update social-image route tests for cover fallback behavior, timeouts, JPEG MIME consistency, encoder failures, dimensions, and the 1 MiB hard limit.
- [x] 3.4 Verify deterministic cover-photo and fallback compositions meet the preferred 500 KiB response budget.

## 4. Cover-Only Upload Preprocessing

- [x] 4.1 Add a cover optimizer with the 1.5 MiB or 2560-pixel trigger, 1.5 MiB/2560-pixel targets, 0.92 initial quality, supported-type preservation, and same-origin Worker execution.
- [x] 4.2 Make optimizer failure, unsupported Worker execution, and non-smaller output select the original accepted cover file without weakening existing type or 4 MiB validation.
- [x] 4.3 Integrate preprocessing into `MultiImageUpload` before UploadThing transfer and measure dimensions/orientation from the selected upload candidate while preserving sequential batch order.
- [x] 4.4 Add utility and component tests for skipped small files, smaller optimized files, original-file fallbacks, post-resize dimensions, partial batch failures, and unchanged gift-image uploads.

## 5. Performance Audit and Delivery Verification

- [x] 5.1 Extend the production public-wishlist audit evidence with social-image MIME type, dimensions, encoded bytes, response timing, and explicit 500 KiB preferred/1 MiB hard budget reporting without relaxing page budgets.
- [x] 5.2 Run focused metadata, projection, Open Graph encoder/route, and cover-upload preprocessing tests and resolve regressions.
- [x] 5.3 Run `pnpm check`, `pnpm test`, and `pnpm typecheck` and resolve or explicitly report every failure before marking the related tasks complete.
- [x] 5.4 Run `pnpm build` and `pnpm audit:public-wishlist`, recording social-image and page-performance evidence.
- [x] 5.5 Add completed follow-up entries to the corresponding metadata, image-upload, and public-performance milestones in `docs/TASKS.md` after implementation and verification.
