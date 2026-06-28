## Why

The wishlist detail nav already ships a `Configuración` tab (`wishlist-detail-nav.tsx`), but no `settings` route exists — clicking it 404s. Owners therefore cannot edit core wishlist content (title, slug, event details, copy, language/currency, How-it-works) after creation, and cannot archive or restore a wishlist. This is Milestone 7.5, a "do not defer" P0, and the only incomplete surface of an otherwise-complete dashboard.

## What Changes

- Add the settings route `src/app/(protected)/dashboard/wishlists/[id]/settings/page.tsx` (mirrors the existing design page: server component fetches `wishlist.getById`, renders a client editor).
- Add a settings editor form to edit: title, slug, event date/time/location, dress code, hero/welcome/thank-you copy, display name, language, currency, and the How-it-works toggle.
- Add a debounced slug-availability check on the slug field (reusing `wishlist.checkSlugAvailability`) and a slug-change warning for **published** wishlists (existing QR/links break).
- Add archive and restore actions: an archive confirmation, and a restore dialog for archived wishlists offering `Restaurar publicada` / `Restaurar como borrador`.
- Wire the missing tRPC procedures: `wishlist.updateSettings`, `wishlist.archive`, `wishlist.restore` (the `archiveWishlist` / `restoreWishlist` service functions already exist; archive/restore are not yet exposed on the router).
- Add `updateWishlistSettingsSchema` reusing the existing field validators.

### Non-goals

- No hard delete (no `Wishlist` deletion).
- No design editing here (theme/layout/font/cover live on the design page, M7.4).
- No gift/category editing here (those have their own pages).
- No slug redirect history when a published slug changes.

## Capabilities

### New Capabilities
- `wishlist-settings`: Dashboard editing of core wishlist content/settings, slug change (with published warning + availability check), and archive/restore lifecycle actions.

### Modified Capabilities
<!-- None. wishlist-lifecycle already specs the archive/restore state rules; this change exposes them via new router procedures and UI without changing those rules. -->

## Impact

- **Routes/pages**: new `src/app/(protected)/dashboard/wishlists/[id]/settings/page.tsx`.
- **Components**: new `src/components/features/dashboard/settings/*` (settings form, slug field, archive/restore dialogs).
- **API**: `src/server/api/routers/wishlist.ts` — add `updateSettings`, `archive`, `restore` procedures; `revalidatePath("/w/<slug>")` after settings changes.
- **Validators**: `src/server/validators/wishlist.schema.ts` — add `updateWishlistSettingsSchema`.
- **Services**: reuse existing `archiveWishlist`, `restoreWishlist`; add an update-settings service path if not already covered.
- **Config/env/schema**: none (no new env vars, no Prisma changes).
