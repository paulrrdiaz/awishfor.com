## 1. Schema and migration

- [x] 1.1 Add `deliveryRecipientName`, `deliveryAddress`, `deliveryPhone` as nullable `String` columns on `Wishlist` in `prisma/schema.prisma`, placed beside `eventLocation`/`dressCode`
- [x] 1.2 Change `welcomeMessage` from `String?` to `String` in `prisma/schema.prisma`
- [x] 1.3 Generate the migration, then hand-edit it so the backfill runs **before** the `NOT NULL` alter: `UPDATE "Wishlist" SET "welcomeMessage" = CASE "eventType" … END WHERE "welcomeMessage" IS NULL OR trim("welcomeMessage") = ''`. The `CASE` needs one explicit arm per `EventType` value — `baby_shower`, `birthday`, `wedding`, `housewarming`, `general` (verified: the enum has exactly these five and they match the `EVENT_TYPE_PRESETS` keys 1:1) — with each arm holding that preset's `defaultWelcomeMessage` inlined as a SQL literal, plus an `ELSE` arm reusing the `general` preset copy. The `ELSE` is not optional: a bare `CASE` returns `NULL` for an unmatched value, which would write `NULL` and then make the `SET NOT NULL` fail.
- [x] 1.4 Run `pnpm prisma migrate dev` and `pnpm prisma generate`

## 2. Validators and service

- [x] 2.1 Add `wishlistDeliveryRecipientNameSchema` (120), `wishlistDeliveryAddressSchema` (240), `wishlistDeliveryPhoneSchema` (40) to `src/server/validators/wishlist.schema.ts` using `optionalNullableTrimmedString`
- [x] 2.2 Add the three fields to `wishlistCreateUpdateShape` and to the settings-update shape
- [x] 2.3 In `src/server/services/wishlist.service.ts`, substitute `EVENT_TYPE_PRESETS[eventType].defaultWelcomeMessage` when an incoming `welcomeMessage` is empty or whitespace-only, on both the create and update paths — leaving `wishlistWelcomeMessageSchema` permissive so partial draft saves still validate
- [x] 2.4 Persist the three delivery fields through the create, update, and settings-update paths
- [x] 2.5 Extend `src/server/validators/wishlist.schema.test.ts` and `src/server/services/wishlist.service.test.ts` for the length limits, whitespace-to-absent normalization, and the empty-welcome-message substitution

## 3. View models, mappers, and nullability fallout

- [x] 3.1 Add the three delivery fields to `PublicWishlistViewModel` in `src/server/mappers/view-models.ts`
- [x] 3.2 Flip `welcomeMessage` from `string | null` to `string` in **both** view models in `src/server/mappers/view-models.ts` (public at ~:72, dashboard at ~:213)
- [x] 3.3 Map the delivery fields in `src/server/mappers/public-wishlist.mapper.ts` and update its `welcomeMessage` mapping for the non-nullable type
- [x] 3.4 Update `src/server/mappers/dashboard-wishlist.mapper.ts` for the non-nullable `welcomeMessage`
- [x] 3.5 Update `src/server/mappers/public-wishlist.mapper.test.ts` and `dashboard-wishlist.mapper.test.ts` fixtures

## 4. Draft pipeline

- [x] 4.1 Fix `src/lib/wishlist/draft-to-preview.ts:143` — `welcomeMessage: draft.welcomeMessage || null` no longer type-checks against a non-nullable field. Pass the draft value straight through (`welcomeMessage: draft.welcomeMessage`), letting `""` reach the preview. Do **not** substitute preset copy here: `draftToPreview` feeds the wizard's live preview pane, and the only way the value is empty is the host having just cleared the textarea — swapping the preset back in would make the preview show copy the host deleted. The persisted invariant is already guaranteed by the server substitution in 2.3, and the empty state is transient because 8.3 blocks advancing. `draftToPreview` returns `PublicWishlistViewModel`, the same type flipped in 3.2, so `""` type-checks — non-nullable is not non-empty.
- [x] 4.2 Carry the three delivery fields through `src/lib/wishlist/persisted-to-preview.ts` and `save-draft.ts` (neither `WishlistDraft` nor the save-draft schema carry delivery fields — the wizard never collects them, so `draftToPreview` emits explicit `null`s and these two files needed no change beyond confirming that)
- [x] 4.3 Update `draft-to-preview.test.ts`, `persisted-to-preview.test.ts`, and `save-draft.test.ts`

## 5. Composition helper and copy button

- [x] 5.1 Add a pure helper (e.g. `src/lib/format/delivery.ts`) taking the three optional fields and returning `null` when the address is absent, otherwise `{ line, recipientName, rest }` — `[name, address].filter(Boolean).join(", ")` then `" · " + phone` when present
- [x] 5.2 Write its unit test covering all eight presence combinations, asserting no doubled, leading, or trailing separator and `null` for every address-absent case
- [x] 5.3 Create the `"use client"` `CopyButton` component owning `navigator.clipboard.writeText`, the copied flag, and the 1500ms revert to `Copiar` — swallowing clipboard failures without a visible error

## 6. Welcome message postscript

- [x] 6.1 Add the shared postscript slot to `src/components/shared/wishlist-message.tsx`, rendering `P.D. — si prefieres enviarlo a casa:` in italic, the emphasized recipient name when present, the rest of the composed line, and `CopyButton`
- [x] 6.2 Render the slot in all three variants (`Postcard`, `Handwritten`, `Avatars`) without adding any entry to `WELCOME_VARIANT_IDS`; give `postcard` and `handwritten` the bare top-margin separation and `avatars` the top-border separation per design.md
- [x] 6.3 Confirm `wishlist-message.tsx` still has no `"use client"` directive
- [x] 6.4 Extend `src/components/shared/wishlist-message.test.tsx`: postscript renders in each variant with an address, renders nothing when the address is absent, and renders partial lines without orphaned separators

## 7. Purchase modal and prop threading

- [x] 7.1 Add a delivery prop to `PurchaseGiftModal` in `src/components/features/wishlist/purchase-gift-modal.tsx` and render the contained block in the `form` phase only, beside the consent copy, with `border` + `bg-muted`, a short label, the composed line, and `CopyButton`
- [x] 7.2 Add the forwarding prop to `PublicGiftFilters` in `src/components/features/wishlist/public-filters.tsx` (only one `PurchaseGiftModal` call site exists in current code, not two as originally noted — wired it)
- [x] 7.3 Pass the delivery value from the four render sites: `public-wishlist-body.tsx`, `split-image-right-layout.tsx`, `collage-staggered-layout.tsx`, `arch-trio-layout.tsx`
- [x] 7.4 Remove the now-dead `wishlist.welcomeMessage &&` guards at `public-wishlist-body.tsx:65` (keeping the `!isCompact` half), `split-image-right-layout.tsx:114`, and `collage-staggered-layout.tsx:151`
- [x] 7.5 Collapse the `arch-trio-layout.tsx:121` ternary to its truthy branch. This one is a behavior change, not cleanup: the else branch renders a standalone full-width `EventDetails` for wishlists with no welcome message, and after this change that state is unreachable. Confirmed safe — the truthy branch already renders `EventDetails` alongside the message, so nothing is lost. Re-read the branch before deleting to confirm nothing new depends on it.
- [x] 7.6 Extend `src/components/features/wishlist/purchase-gift-modal.test.tsx`: block renders in the form phase with an address, is absent without one, and is absent in the success and undo states

## 8. Settings form and wizard validation

- [x] 8.1 Add the three delivery fields to `src/components/features/dashboard/settings/wishlist-settings-form.tsx`, grouped immediately after the "Firma del mensaje" field
- [x] 8.2 Make the settings welcome message field required with a visible validation error that blocks submit when empty
- [x] 8.3 Make the wizard welcome message textarea required in `src/components/features/wizard/details-step.tsx`, blocking advance with a visible error, and confirm no delivery fields are added to the wizard
- [x] 8.4 Add a store test in `src/stores/wishlist-wizard.store.test.ts` confirming preset copy still seeds the field so the error is reachable only on a deliberate clear

## 9. Fixtures and stories

- [x] 9.1 Add delivery values and a non-null `welcomeMessage` to `src/config/demo-wishlist.ts`
- [x] 9.2 Add postscript stories to `src/components/shared/wishlist-message.stories.tsx` covering all three variants with full, partial, and absent delivery details
- [x] 9.3 Run `pnpm typecheck` and update every fixture it surfaces. Do not work from a pre-guessed file list — the nullability flip reaches test fixtures across `src/server/`, and only the compiler knows which.

## 10. Validation

- [x] 10.1 Run `pnpm typecheck` and resolve every remaining `welcomeMessage` nullability error
- [x] 10.2 Run `pnpm test`
- [x] 10.3 Run `pnpm check`
- [x] 10.4 Verify against a real published wishlist at `pnpm dev` (port 4000): postscript on the public page for an anonymous visitor, block in the purchase modal's form phase, copy action writing the full composed line, and nothing rendering when the address is cleared
