## 1. Provider setup

- [x] 1.1 Add `uploadthing` and `@uploadthing/react` to dependencies (pnpm)
- [x] 1.2 Add `UPLOADTHING_TOKEN` to `src/env.ts` (server schema + runtimeEnv)
- [x] 1.3 Add `UPLOADTHING_TOKEN` placeholder to `.env.example`

## 2. File router and route handler

- [x] 2.1 Create `src/lib/uploadthing/core.ts` with `ourFileRouter` exposing `coverImage` (image/jpeg|png|webp, max 4MB, 1 file) and `giftImage` (same types, max 3MB, 1 file)
- [x] 2.2 Add `.middleware()` to each route that calls Clerk `auth()` and throws `UploadThingError` when there is no `userId`
- [x] 2.3 Export the router type `OurFileRouter`
- [x] 2.4 Create `src/app/api/uploadthing/route.ts` mounting the router via `createRouteHandler`
- [x] 2.5 Create `src/lib/uploadthing/client.ts` with typed `UploadButton`/`UploadDropzone` (or upload helpers) generated from `OurFileRouter`

## 3. Reusable ImageUpload component

- [x] 3.1 Create `src/components/features/wishlist/image-upload.tsx` — controlled component with props `value: string | null`, `onChange(url | null)`, `endpoint: "coverImage" | "giftImage"`
- [x] 3.2 Render preview + remove button when `value` is set; render upload control when empty
- [x] 3.3 On successful upload call `onChange(hostedUrl)`; on remove call `onChange(null)`
- [x] 3.4 Surface a friendly error on upload failure / rejected type / oversized file without changing `value`

## 4. Wire cover image (wizard)

- [x] 4.1 Replace the disabled cover placeholder in `src/components/features/wizard/design-step.tsx` with `<ImageUpload endpoint="coverImage" value={draft.coverImageUrl} onChange={(url) => setField("coverImageUrl", url)} />`
- [x] 4.2 Confirm the cover renders in the live preview and persists via the existing draft-save flow

## 5. Wire gift image (gift form)

- [x] 5.1 Replace the free-text image-URL input in `src/components/features/wishlist/gift-form.tsx` with `<ImageUpload endpoint="giftImage" value={values.imageUrl} onChange={(url) => set("imageUrl", url)} />`
- [x] 5.2 Confirm upload, replace, and remove update `imageUrl` and persist via the existing gift mutation

## 6. Validation and verification

- [x] 6.1 Manually verify: cover upload/remove, gift upload/replace/remove
- [x] 6.2 Manually verify rejection of non-JPG/PNG/WEBP files and oversized files (cover > 4MB, gift > 3MB)
- [x] 6.3 Run `pnpm check`, `pnpm test`, and `pnpm typecheck`
