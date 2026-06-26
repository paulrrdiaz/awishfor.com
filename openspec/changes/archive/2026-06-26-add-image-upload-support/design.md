## Context

The `Wishlist.coverImageUrl` and `Gift.imageUrl` columns already exist (nullable strings) — no schema change is needed. Today nothing populates them well: the wizard design step (`design-step.tsx`) shows a disabled "próximamente" cover placeholder, and the gift form (`gift-form.tsx`) only accepts a pasted image URL string. There is no file-upload infrastructure in the repo, and no upload-related env vars in `src/env.ts`.

Auth is Clerk; user-specific server work goes through `protectedProcedure` / `ctx.userId`. The wizard is a client-side Zustand draft store (`wizard-provider.tsx`) that calls `setField`; the gift form is a controlled form with a `set(field, value)` updater. Both already have a "field → value" shape that an upload result can plug into.

## Goals / Non-Goals

**Goals:**
- First-party image hosting for cover and gift images with type/size validation and owner authorization.
- One reusable upload component reused by both flows to avoid divergence.
- Minimal surface: drop into existing field-setter patterns; no schema migration.

**Non-Goals:**
- Crop/edit, AI image features, multiple images per gift.
- Backfilling/migrating existing pasted `imageUrl` values.
- Deleting orphaned files from the storage provider when an image is replaced/removed (tracked as a risk, not solved here).

## Decisions

### Provider: UploadThing
Per `docs/TASKS.md` 4.3, use UploadThing (`uploadthing` + `@uploadthing/react`). It ships a typed Next.js App Router file router, handles client upload + progress, and enforces type/size limits server-side via its route config — covering most acceptance criteria with little custom code.
- *Alternative considered*: direct S3/Cloudflare R2 presigned uploads. Rejected for this task: more boilerplate (presign endpoint, client multipart, manual validation) for no required benefit at this stage.

### File router with two endpoints
Define a single `ourFileRouter` (`src/lib/uploadthing/core.ts`) with two routes:
- `coverImage`: `image/jpeg|png|webp`, `maxFileSize: "4MB"`, `maxFileCount: 1`.
- `giftImage`: same types, `maxFileSize: "3MB"`, `maxFileCount: 1`.

Type and size are enforced declaratively by the route config (satisfies the validation requirements without hand-rolled checks). Mounted at `src/app/api/uploadthing/route.ts` via `createRouteHandler`.

### Authorization in middleware
Each route's `.middleware()` calls Clerk `auth()` and throws `UploadThingError` if there is no `userId`, satisfying the upload-authorization requirement. Owner-of-wishlist enforcement at write time is already handled where `coverImageUrl`/`imageUrl` are persisted (existing `protectedProcedure` wishlist/gift mutations); the upload endpoint only guarantees an authenticated user.

### Reusable `ImageUpload` component
`src/components/features/wishlist/image-upload.tsx` — a controlled component: props `value: string | null`, `onChange(url | null)`, and `endpoint: "coverImage" | "giftImage"`. Renders the current image preview with a remove button, or an `UploadButton`/dropzone when empty. Cover and gift differ only by `endpoint` and copy. Uses the typed React helpers generated from `ourFileRouter` (`src/lib/uploadthing/client.ts`).

### Wiring into existing field setters
- Cover: replace the placeholder block in `design-step.tsx` with `<ImageUpload endpoint="coverImage" value={draft.coverImageUrl} onChange={(url) => setField("coverImageUrl", url)} />`.
- Gift: replace the free-text image-URL input in `gift-form.tsx` with `<ImageUpload endpoint="giftImage" value={values.imageUrl} onChange={(url) => set("imageUrl", url)} />`.

Persistence is unchanged: existing draft-save / gift mutations already write these fields.

### Env
Add `UPLOADTHING_TOKEN` (server) to `src/env.ts` schema + `runtimeEnv` and to `.env.example`. No client-exposed key needed (UploadThing v7 uses a single token).

## Risks / Trade-offs

- **Orphaned files on replace/remove** → Old files remain in UploadThing storage when an image is replaced or removed (we only swap the URL). Acceptable for now; a cleanup job can be added later. Documented as a non-goal.
- **External dependency / network during upload** → Upload failures must surface a friendly error and leave the stored URL unchanged; the component treats only a completed upload as a state change.
- **Tailwind v4 / Base UI styling** → UploadThing default styles may not match the design system; mitigate by styling the wrapper and relying on a minimal preview/remove UI rather than UploadThing's full chrome.
- **Wizard preview vs. persistence timing** → Cover upload returns a hosted URL immediately and updates the draft; the existing draft-save flow persists it, so no extra save path is required.

## Migration Plan

1. Add deps and `UPLOADTHING_TOKEN`; create an UploadThing app and set the token in `.env`.
2. Add file router, route handler, and client helpers.
3. Add `ImageUpload`; wire cover and gift flows.
4. Verify locally (upload, replace, remove, invalid type, oversized) then ship. No DB migration, so rollback is reverting the code and removing the env var.

## Open Questions

- None blocking. Optional future work: storage cleanup of orphaned files and an image CDN/transform layer.
