## Why

Owners cannot add real imagery today: the wizard cover-image control is a disabled "próximamente" placeholder, and gift images are limited to pasting a raw URL. Lists therefore look generic and gift cards often have broken or missing images. We need first-party uploads so owners can give their list and gifts a real visual identity.

## What Changes

- Add UploadThing as the file-upload provider: package, server file router, env vars, and a thin client wrapper.
- Add a reusable `ImageUpload` component (preview + upload + remove) used by both cover and gift flows.
- Wire **cover image** upload/remove into the wizard design step, replacing the disabled placeholder. Persists to `Wishlist.coverImageUrl`.
- Wire **gift image** upload/replace/remove into the gift form, replacing the free-text image-URL input. Persists to `Gift.imageUrl`.
- Enforce validation: allowed types JPG/PNG/WEBP; cover ≤ 4MB; gift ≤ 3MB. Reject invalid type or oversized files with a friendly error.
- Restrict uploads to the authenticated owner of the target wishlist.

Non-goals (out of scope): cropping/editing, AI image features, multiple images per gift, migrating existing pasted image URLs.

## Capabilities

### New Capabilities
- `image-upload`: owner-facing upload, replacement, and removal of a wishlist cover image and per-gift images via UploadThing, including file-type and size validation and owner authorization.

### Modified Capabilities
<!-- None: cover/gift image fields already exist in the schema; no spec-level requirement changes to creation-wizard or gift-management. -->

## Impact

- **Dependencies**: add `uploadthing` + `@uploadthing/react`.
- **Env**: add `UPLOADTHING_TOKEN` to `src/env.ts` (server) and `.env.example`.
- **Routes/config**: new UploadThing file router (`src/app/api/uploadthing/route.ts`) and core config; client helpers wrapper.
- **Components**: new `src/components/features/wishlist/image-upload.tsx`; update `src/components/features/wizard/design-step.tsx` and `src/components/features/wishlist/gift-form.tsx`.
- **Schema**: none — `Wishlist.coverImageUrl` and `Gift.imageUrl` already exist.
- **Auth**: upload middleware authorizes the signed-in owner via Clerk.
