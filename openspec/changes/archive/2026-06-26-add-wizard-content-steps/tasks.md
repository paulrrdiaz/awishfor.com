## 1. Dependencies & store extension

- [x] 1.1 Add `use-debounce` dependency
- [x] 1.2 Extend `WishlistDraft` in `src/stores/wishlist-wizard.store.ts` with `title`, `slug`, `displayName`, `eventDate` (ISO string | null), `eventTime` (`HH:mm` | null), `eventLocation`, `coverImageUrl`, `buttonStyle`, `fontPairing`, `showHowItWorks`, and `gifts: DraftGift[]`
- [x] 1.3 Add the `DraftGift` type (`id`, `name`, `productUrl`, `imageUrl`, `priceAmount`, `category`, `quantityNeeded`, `priority`, `publicNote`, `internalNote`, `hidden`, `sortOrder`) and `slugTouched` flag
- [x] 1.4 Add gift actions: `addGift`, `updateGift`, `removeGift`, `reorderGifts`; update `emptyDraft`/`reset`/`partialize` to cover the new fields
- [x] 1.5 Add slug auto-tracking behavior in `setField` (title updates slug while `slugTouched` is false; editing slug sets `slugTouched`)
- [x] 1.6 Extend store unit tests for new fields, gift add/update/remove/reorder, and slug auto-track vs. manual-edit

## 2. Slug availability (public)

- [x] 2.1 Change `checkSlugAvailability` in `src/server/api/routers/wishlist.ts` to a `publicProcedure`
- [x] 2.2 Verify a signed-out caller can query slug availability (Available/Taken/Invalid)

## 3. Event Details + slug step (3.4)

- [x] 3.1 Add `src/components/features/wizard/details-step.tsx` with title and display-name fields wired to the store
- [x] 3.2 Add event date picker (Shadcn Calendar + Popover) writing a date-only ISO string, and a time input normalized to `HH:mm`
- [x] 3.3 Add location text field; keep date/time/location optional
- [x] 3.4 Add auto-generated, editable slug field (auto from title via `slugify` until edited)
- [x] 3.5 Add debounced availability check with `use-debounce` and Checking/Available/Taken/Invalid states
- [x] 3.6 Add past-date warning that does not block

## 4. Design & Preview step (3.5)

- [x] 4.1 Add `src/lib/wishlist/draft-to-preview.ts` mapping the draft (and preset `sampleGifts` fallback) to `PublicWishlistViewModel`
- [x] 4.2 Add `src/components/features/wizard/design-step.tsx` with theme, layout, font-pairing, and button-style selector cards wired to the store
- [x] 4.3 Embed `PublicWishlistPage` in `mode="preview"` driven by the mapper; confirm purchase actions are disabled
- [x] 4.4 Use preset `sampleGifts` when no visible gifts exist; real gifts replace samples
- [x] 4.5 Add disabled cover-image upload placeholder (UploadThing deferred to M4)
- [x] 4.6 Add unit test for `draft-to-preview` (sample-gift fallback, hidden-gift exclusion, category synthesis)

## 5. Gifts step (3.6)

- [x] 5.1 Add `src/components/features/wishlist/gift-form.tsx` (name, product URL, image, price, category, quantity, priority, public/internal note, hide toggle)
- [x] 5.2 Add `src/components/features/wizard/gifts-step.tsx` gift-list editor using the store gift actions
- [x] 5.3 Add category assignment from the draft categories and a URL-import entry-point placeholder
- [x] 5.4 Wire hide toggle so hidden gifts are excluded from the preview/visible list

## 6. Shell navigation

- [x] 6.1 Extend `WizardShell` `STEPS` to `event-type → details → design → gifts` with `?step=` routing and first-step fallback
- [x] 6.2 Add Back/Next controls that update the active step

## 7. Validation

- [x] 7.1 `pnpm check`
- [x] 7.2 `pnpm test`
- [x] 7.3 `pnpm typecheck`
