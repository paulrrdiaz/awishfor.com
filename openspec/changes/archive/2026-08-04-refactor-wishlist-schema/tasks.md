## 1. Schema and migration

- [x] 1.1 Confirm the target database holds no real wishlists before writing a destructive migration
- [x] 1.2 Add the `ImageOrientation` enum and `WishlistImage` model to `prisma/schema.prisma`, with the `wishlistId` and `wishlistId, sortOrder` indexes and cascade delete
- [x] 1.3 Drop `displayName`, `heroTitle`, `fontPairing`, `coverImageUrl` and `coverImageUrls` from the `Wishlist` model
- [x] 1.4 Run `pnpm prisma migrate dev` and `pnpm prisma generate`, and verify the client regenerates into `src/generated/prisma`

## 2. Config catalogs

- [x] 2.1 Run `codegraph_impact` on each of the eight retired layout components before deleting anything, and note any shared helper that needs to move
- [x] 2.2 Trim `src/config/public-layouts.ts` to the nine design layouts, removing the `deprecated` flag from `PublicLayoutPreset` now that nothing uses it
- [x] 2.3 Trim `src/config/public-themes.ts` to the seven design themes
- [x] 2.4 Delete the eight retired layout components under `src/components/layouts/public-wishlist/` along with their tests and stories
- [x] 2.5 Remove `defaultHeroTitleTemplate` from `EventTypePreset` and the `{name}` resolution helper it fed
- [x] 2.6 Repoint `birthday` to `arch-hero-party` and `wedding` to `carousel-hero` in `EVENT_TYPE_PRESETS`
- [x] 2.7 Add `sampleCoverImages` to every event-type preset, grouped by orientation, with enough samples per orientation to fill the largest `heroImageSlots`
- [x] 2.8 Update `src/config/public-layouts.test.ts`, `public-themes` tests and `event-type-presets.test.ts` for the trimmed catalogs and the new preset field

## 3. Shared image classification

- [x] 3.1 Move `getImageOrientation` and the square deadband out of `multi-image-upload.tsx` into a shared module reachable from the store, mappers and tests
- [x] 3.2 Delete `withCoverImageUrlMirror` from `src/lib/wishlist/cover-images.ts` and replace the module's contents with the cover-image record helpers
- [x] 3.3 Add unit tests covering landscape, portrait and in-deadband square classification

## 4. Validators and server

- [x] 4.1 Remove `wishlistDisplayNameSchema`, `wishlistHeroTitleSchema`, `wishlistFontPairingSchema`, `wishlistCoverImageUrlSchema` and `wishlistCoverImageUrlsSchema` from `src/server/validators/wishlist.schema.ts`, adding a cover-image record schema
- [x] 4.2 Update `src/server/validators/wishlist-save-draft.schema.ts` so the draft payload carries `title` and an ordered image collection
- [x] 4.3 Update `src/server/services/wishlist.service.ts` to write and read `WishlistImage` rows alongside categories and gifts
- [x] 4.4 Update `src/server/api/routers/wishlist.ts` for the changed create, save-draft and update-settings inputs
- [x] 4.5 Update `src/server/mappers/view-models.ts`, `public-wishlist.mapper.ts` and `dashboard-wishlist.mapper.ts` to expose the ordered image collection and drop the removed fields
- [x] 4.6 Update the affected validator, service, mapper and router tests

## 5. Client state and preview

- [x] 5.1 Remove `displayName`, `heroTitle`, `fontPairing`, `coverImageUrl` and `coverImageUrls` from `WishlistDraft` and add the image collection
- [x] 5.2 Drop `heroTitle` from `CopyTouched` and remove the hero-title seeding from `setEventType` and `regenerateCopy`
- [x] 5.3 Raise `WISHLIST_WIZARD_STORE_VERSION` to 2 and write a migration that drops unmappable legacy values without throwing
- [x] 5.4 Update `src/lib/wishlist/draft-to-preview.ts` and `persisted-to-preview.ts` for the new draft and view-model shapes
- [x] 5.5 Update `src/stores/wishlist-wizard.store.test.ts` and the preview tests, including a rehydration test for a pre-change persisted draft

## 6. Public rendering

- [x] 6.1 Remove the `fontPairing` fallback from the public theme provider and font resolution
- [x] 6.2 Update the shared hero gallery to consume image records and keep filling empty slots with the theme's tinted placeholder
- [x] 6.3 Remove the `displayName` subtitle block from each of the nine surviving layouts so the hero renders `title` alone
- [x] 6.4 Wire `src/components/shared/event-details.tsx` into all nine layouts in the required section order
- [x] 6.5 Update `src/components/shared/public-wishlist-body.tsx` and `wishlist-footer.tsx` for the removed fields
- [x] 6.6 Rebuild `src/config/demo-wishlist.ts` — it currently references the retired `grid` layout plus all four dropped columns
- [x] 6.7 Update `src/components/shared/story-data.ts` and the layout stories and tests

## 7. Owner-facing UI

- [x] 7.1 Update `multi-image-upload.tsx` to measure natural dimensions, submit them with the hosted URL, and reject unmeasurable files with a friendly error
- [x] 7.2 Remove the display-name field from `details-step.tsx` and reword the name field's help text as guest-facing
- [x] 7.3 Update `design-step.tsx` to read and write image records
- [x] 7.4 Remove the display-name and hero-title fields from `wishlist-settings-form.tsx`
- [x] 7.5 Update `wizard-states.stories.tsx` and the wizard tests for the changed draft shape

## 8. Verification

- [x] 8.1 Clear the pre-PROD debt entry for legacy layouts, `coverImageUrl` and `fontPairing` from `docs/FUTURE_IMPROVEMENTS.md`
- [x] 8.2 Run `pnpm check`, `pnpm test` and `pnpm typecheck` until clean
- [x] 8.3 Walk `/create` end to end on the existing five steps — pick an occasion, name the list, upload covers, add a gift, publish — and confirm the published page renders the title alone with the event-details cards
