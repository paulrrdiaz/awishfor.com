## 1. Validation schema

- [x] 1.1 Add `updateWishlistSettingsSchema` to `src/server/validators/wishlist.schema.ts` composing the existing field validators (title, slug, displayName, eventDate, eventTime, eventLocation, dressCode, hero/welcome/thankYou, language, currency, showHowItWorks) plus the wishlist id.

## 2. tRPC procedures

- [x] 2.1 Add `wishlist.updateSettings` protected mutation: owner-check via `getLocalUserId`, persist via the settings schema, `revalidatePath("/w/<slug>")` (and the previous slug path when the slug changed).
- [x] 2.2 Add `wishlist.archive` protected mutation wrapping `archiveWishlist` with owner-check + public-path revalidation.
- [x] 2.3 Add `wishlist.restore` protected mutation wrapping `restoreWishlist` (input `targetStatus` via `wishlistRestoreTargetStatusSchema`) with owner-check + public-path revalidation.

## 3. Settings route + form

- [x] 3.1 Add `src/app/(protected)/dashboard/wishlists/[id]/settings/page.tsx` mirroring the design page (server component → `getById` → `notFound()` → render client form).
- [x] 3.2 Add `src/components/features/dashboard/settings/wishlist-settings-form.tsx` editing all core content fields, prefilled from the `getById` payload, wired to `updateSettings` with success/error toasts.
- [x] 3.3 Add the slug field with a debounced `checkSlugAvailability` check (`excludeWishlistId` = current id) and Checking/Available/Taken/Invalid states.
- [x] 3.4 Show the published-slug-change warning (existing links/QR break) when `status === "published"` and the slug differs from the saved value.

## 4. Archive / restore UI

- [x] 4.1 Add an archive action with a confirmation dialog.
- [x] 4.2 Add a restore dialog (shown only when `status === "archived"`) offering `Restaurar publicada` / `Restaurar como borrador`, calling `wishlist.restore` with the chosen target.

## 5. Validation

- [x] 5.1 Run `pnpm check`, `pnpm test`, and `pnpm typecheck`; fix any issues.
- [ ] 5.2 Manually verify: edit + save content, slug availability + published warning, archive flips public page to inactive, restore (both targets) reactivates correctly.
