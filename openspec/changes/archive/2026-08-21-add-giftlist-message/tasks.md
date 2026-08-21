## 1. Data model

- [x] 1.1 Add `giftListMessage String?` to the `Wishlist` model in `prisma/schema.prisma`, placed near `thankYouMessage`.
- [x] 1.2 Run `pnpm prisma migrate dev` to generate and apply the migration; verify `pnpm prisma generate` regenerates `src/generated/prisma` with the new field.

## 2. Validation

- [x] 2.1 Add `wishlistGiftListMessageSchema = optionalNullableTrimmedString("Gift list message", 2000)` in `src/server/validators/wishlist.schema.ts`, next to `wishlistThankYouMessageSchema`.
- [x] 2.2 Wire `giftListMessage` into the relevant input/output types and Zod objects in `wishlist.schema.ts` (settings update input, draft input, wherever `thankYouMessage` currently appears).
- [x] 2.3 Wire `giftListMessage` into `src/server/validators/wishlist-save-draft.schema.ts` alongside `thankYouMessage`.

## 3. Server plumbing

- [x] 3.1 Add `giftListMessage: input.giftListMessage ?? null` to `src/server/services/wishlist.service.ts` wherever `thankYouMessage` is mapped (create, update, and the read-side mapping back out).
- [x] 3.2 Add `giftListMessage` to `src/server/mappers/dashboard-wishlist.mapper.ts`.
- [x] 3.3 Add `giftListMessage` to `src/server/mappers/public-wishlist.mapper.ts`.
- [x] 3.4 Add `giftListMessage: string | null` to the relevant view-model types in `src/server/mappers/view-models.ts`.
- [x] 3.5 Add `giftListMessage: true` to the Prisma `select` in `src/server/services/public-wishlist.service.ts`.
- [x] 3.6 Add `giftListMessage: wishlist.giftListMessage` to the `wishlist.updateSettings` (and any other relevant) procedure in `src/server/api/routers/wishlist.ts`.

## 4. Wizard: draft store and Details step

- [x] 4.1 Add `giftListMessage: string` to the draft shape in `src/stores/wishlist-wizard.store.ts`, defaulted to `""`. Do NOT add it to `copyTouched` or to event-type preset seeding (per design.md — no preset machinery for this field).
- [x] 4.2 Add `giftListMessage` handling to `src/lib/wishlist/save-draft.ts`, `src/lib/wishlist/draft-to-preview.ts` (map `""` to `null`, matching other optional strings), and `src/lib/wishlist/persisted-to-preview.ts` (map `null` to `""`).
- [x] 4.3 Add a "Mensaje de la lista de regalos" textarea to `src/components/features/wizard/details-step.tsx`, positioned after the thank-you message field, using `setField("giftListMessage", ...)`. No required-field validation, no error state.

## 5. Dashboard settings form

- [x] 5.1 Add a `giftListMessage` state + textarea to `src/components/features/dashboard/settings/wishlist-settings-form.tsx`, positioned after the thank-you message field (same grouping as welcome/thank-you copy), submitting `giftListMessage: giftListMessage || null` in the mutation payload.

## 6. Public rendering

- [x] 6.1 Create `src/components/shared/gift-list-message.tsx`: a `GiftListMessage` component taking `{ message?: string | null; className?: string }`, returning `null` when `message` is falsy, otherwise rendering centered italic serif text flanked by short hairlines using theme tokens only — match the visual treatment shown in `PublicWishlistPages.dc.html` (the italic line immediately preceding "Lista de regalos" in the design canvas).
- [x] 6.2 Add `giftListMessage?: string | null` and a content-width prop (mirroring `DeliveryBar`'s `contentClassName` pattern) to `GiftSection` (`src/components/shared/gift-section.tsx`), rendering `GiftListMessage` immediately before `GiftListBand`'s content when set.
- [x] 6.3 Pass `giftListMessage={wishlist.giftListMessage}` (plus matching content-width class) at each `GiftSection` call site: `arch-trio-layout.tsx`, `split-image-right-layout.tsx`, `collage-staggered-layout.tsx`, and `public-wishlist-body.tsx`.
- [x] 6.4 Confirm visually (dev server) that the message renders above the gift list on a layout that has a "Lista de regalos" heading (e.g. `arch-trio`) and one that doesn't (e.g. `collage-staggered`), and that it renders nothing when the field is empty.

## 7. Tests

- [x] 7.1 Add/extend unit tests for the new validator (`optionalNullableTrimmedString` boundary cases already covered generically — confirm the new schema export is exercised, e.g. in existing `wishlist.schema` test coverage if present).
- [x] 7.2 Add a test for `GiftListMessage` (renders `null` when message is absent; renders the text when present) alongside the existing `gift-section.test.tsx` pattern.
- [x] 7.3 Update `src/components/layouts/public-wishlist/public-wishlist-layouts.test.ts` if it asserts on `GiftSection` call-site props (mirroring its existing `thankYouMessage` assertions) to also cover `giftListMessage`.

## 8. Validation and sync

- [x] 8.1 Run `pnpm check`, `pnpm test`, and `pnpm typecheck`; fix any failures before closing the session.
- [x] 8.2 Mark completed tasks `[x]` in this file only after their work is done and validation has passed (or the failure is explicitly reported).
- [x] 8.3 Identify and check off any corresponding milestone items in `docs/TASKS.md`, if applicable. (No corresponding item found.)
