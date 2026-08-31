## Why

Public wishlist previews currently use short titles, allow welcome messages to exceed common social-preview description lengths, and return photograph-heavy Open Graph cards as large PNG files. Shared links need clearer event context and substantially lighter preview images, while cover uploads should avoid sending unnecessarily oversized source photos.

## What Changes

- Format published wishlist social titles with the localized event date and A Wish For identity, using a date-independent fallback when no event date exists.
- Normalize and truncate the existing welcome message at a word boundary for the social description, retaining event-aware fallback copy when the message is empty.
- Preserve the branded 1200×630 composition while returning a compressed JPEG social image with a measurable byte-size budget instead of a photograph-heavy PNG.
- Preprocess wishlist cover images in the browser before UploadThing transfer when they are oversized, retaining the original file whenever preprocessing does not reduce its size.
- Keep gift-image uploads, visible wishlist headings, visible welcome copy, personalized invite identity, lifecycle privacy, and the `noindex, nofollow` policy unchanged.
- Add focused metadata, image-response, upload-preprocessing, and production performance verification.

Non-goals:

- Redesigning the social-card composition or public wishlist layouts.
- Adding user-configurable social title or description fields.
- Optimizing gift-image uploads.
- Changing the 1200×630 social-card dimensions, public URL structure, indexing policy, or database schema.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `public-wishlist-social-metadata`: Add localized date-aware social titles, bounded welcome-message descriptions, and compressed JPEG preview-image performance requirements.
- `image-upload`: Add client-side preprocessing for oversized wishlist cover images without changing gift-image upload behavior.

## Impact

- Metadata projection and formatting: `src/server/services/public-wishlist-metadata.service.ts`, `src/lib/wishlist/public-metadata.ts`, and their tests.
- Social image generation: `src/app/w/[slug]/opengraph-image.tsx` and response tests.
- Cover upload controls and shared preprocessing utilities under `src/components/features/wishlist/` and `src/lib/`.
- Dependencies: add direct production dependencies for server-side image encoding and browser-side cover preprocessing as needed; reuse UploadThing's existing client upload flow.
- Verification: focused Vitest coverage, `pnpm check`, `pnpm test`, `pnpm typecheck`, `pnpm build`, and the production public-wishlist performance audit.
- No new environment variables, external services, API routes, schema migrations, or generated Prisma edits are expected.
