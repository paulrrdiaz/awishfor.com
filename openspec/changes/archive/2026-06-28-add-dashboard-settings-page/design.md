## Context

Milestone 7 dashboard is complete except 7.5 settings. Relevant existing state:

- `wishlist-detail-nav.tsx` already lists a `Configuración` tab (`segment: "settings"`) → currently 404s.
- `design/page.tsx` is the pattern to mirror: server component awaits `params`, calls `api.wishlist.getById({ id })`, `notFound()` on failure, renders a client editor (`WishlistDesignEditor`).
- `wishlist.getById` already returns every settings field (title, slug, eventType, language, currency, hero/welcome/thankYou, displayName, eventDate/Time/Location, dressCode, showHowItWorks, status, archivedAt).
- Service functions `archiveWishlist` and `restoreWishlist` exist; `restoreWishlist` takes a target status (`wishlistRestoreTargetStatusSchema` = draft | published).
- Router exposes `updateDesign` and `checkSlugAvailability`, but **not** `updateSettings`, `archive`, or `restore`.
- Field validators all exist (`wishlistTitleSchema`, `wishlistSlugSchema`, copy/date/time/location/dressCode schemas).

Constraints: `protectedProcedure` + owner check (`getLocalUserId`); `revalidatePath` the public page after edits; Spanish copy default; no Prisma/env changes.

## Goals / Non-Goals

**Goals:**
- A working `/dashboard/wishlists/[id]/settings` page that edits core content and runs archive/restore.
- Reuse existing validators, slug-availability endpoint, and lifecycle service functions.
- Warn before changing a published slug.

**Non-Goals:**
- Hard delete; design/gift/category editing; slug redirect history.

## Decisions

### Mirror the design page structure
`settings/page.tsx` = server component → `getById` → `notFound()` on throw → render `<WishlistSettingsForm wishlist={...} />` client component. Keeps the detail-nav tab pattern consistent and reuses the already-typed `getById` payload (no new read shape).

- **Why over a bespoke loader**: the design page already proves this pattern with the same data; consistency + zero new server read code.

### One `updateSettings` mutation with a dedicated schema
Add `updateWishlistSettingsSchema` composing the existing field validators (title, slug, event date/time/location, dressCode, hero/welcome/thankYou, displayName, language, currency, showHowItWorks) plus the wishlist id. Add a single `wishlist.updateSettings` mutation that owner-checks, updates, and `revalidatePath("/w/<slug>")` (and the old slug path if the slug changed).

- **Alternative**: per-field mutations. Rejected — heavier, worse UX, more surface.
- Slug uniqueness is enforced at write time; the client-side availability check is advisory UX, mirroring the wizard.

### Slug change warning is client-side, gated on published status
The slug field shows the debounced availability state (reuse `checkSlugAvailability`, `excludeWishlistId` = current id). When `status === "published"` and the slug differs from the saved value, show the brief's QR/link-break warning before save. Unpublished drafts change slug freely.

### Expose archive/restore as thin router procedures
`wishlist.archive({ id })` → owner check → `archiveWishlist`. `wishlist.restore({ id, targetStatus })` → owner check → `restoreWishlist`. UI: archive behind a confirm dialog; restore (only when `status === "archived"`) behind a dialog with `Restaurar publicada` / `Restaurar como borrador`. Both `revalidatePath` the public page so the archived/active state flips immediately.

- **Why thin**: lifecycle rules already live (and are tested) in the service; the router only adds auth + cache revalidation.

## Risks / Trade-offs

- [Published slug change silently breaks shared QR/links] → Require the published-slug warning to be acknowledged in the form before the save submits; copy matches the brief.
- [Restore-to-published a wishlist that no longer meets publish readiness] → Restore only flips lifecycle state (matches existing `restoreWishlist` behavior); readiness is enforced at publish time elsewhere. Call this out rather than re-validating on restore.
- [Concurrent edits from settings vs design pages] → Both write disjoint field sets and revalidate; last-write-wins on shared `updatedAt` is acceptable for a single owner.

## Migration Plan

Additive: new route, components, schema, and three procedures wrapping existing service functions. No schema/env/data migration. Rollback = revert; the nav tab simply returns to 404 (its pre-change state).

## Open Questions

- Should restoring to `published` re-run publish readiness and block if unmet? Default per existing `restoreWishlist`: no — restore is a pure lifecycle flip. Flagged for product if stricter behavior is wanted later.
