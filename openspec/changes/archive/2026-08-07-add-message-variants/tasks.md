## 1. Foundations

- [x] 1.1 Create `src/config/public-message-variants.ts` with three catalogs (countdown, welcome, thank-you), each entry carrying `id`, `label`, a short description, and a comment naming its origin proposal in the design file
- [x] 1.2 Export `getAllCountdownVariants` / `getAllWelcomeVariants` / `getAllThankYouVariants`, matching `resolve*` functions, and `DEFAULT_*_VARIANT_ID` constants (`outline-pill`, `postcard`, `handwritten`)
- [x] 1.3 Add `src/config/public-message-variants.test.ts` covering resolution of a known id, `null` falling back to the default, and an unknown id falling back to the default rather than throwing
- [x] 1.4 Create `src/lib/format/signature.ts` exporting `parseSignatureInitials`, splitting only on `&`, `+`, `,`, and whitespace-delimited `y` / `e` / `and`
- [x] 1.5 Add `src/lib/format/signature.test.ts` covering the full table: `Ana & Diego`, `Ana y Diego`, `Ana, Diego`, `Isabel e Ignacio`, `Ana, Diego y Sofía`, `Familia Rodríguez`, `María José`, `Álvaro`, `Valentina`, and null/empty/whitespace input

## 2. Schema and persistence

- [x] 2.1 Add `countdownVariant`, `welcomeMessageVariant`, and `thankYouMessageVariant` as nullable `String?` columns on the `Wishlist` model in `prisma/schema.prisma`
- [x] 2.2 Run `pnpm prisma migrate dev` to generate the migration; confirm no backfill is required because `NULL` resolves to the default at read time
- [x] 2.3 Add the three fields to `src/server/validators/wishlist.schema.ts`, validating each id against its catalog and allowing null
- [x] 2.4 Add the three fields to `src/server/validators/wishlist-save-draft.schema.ts`

## 3. View models and mappers

- [x] 3.1 Add the three variant fields plus `createdAt` to `PublicWishlistViewModel` in `src/server/mappers/view-models.ts`, and the three variant fields to `DashboardWishlistCardViewModel`
- [x] 3.2 Add a `PublicContributorsViewModel` type (`count`, `initials`) and expose it on `PublicWishlistViewModel`
- [x] 3.3 Implement contributor computation in `src/server/mappers/public-wishlist.mapper.ts`: dedupe guest names case- and whitespace-insensitively, exclude the owner manual-purchase default name, count purchases still inside their undo window, cap initials at four
- [x] 3.4 Map the three variant fields and `createdAt` in `public-wishlist.mapper.ts` and `dashboard-wishlist.mapper.ts`
- [x] 3.5 Ensure `src/server/services/public-wishlist.service.ts` loads the purchase `guestName` needed for the contributor summary, and confirm no raw name reaches the view model
- [x] 3.6 Extend `src/server/mappers/public-wishlist.mapper.test.ts` and `dashboard-wishlist.mapper.test.ts` with the contributor scenarios from the spec and the new field mappings

## 4. API and preview plumbing

- [x] 4.1 Thread the three variant fields through `src/server/api/routers/wishlist.ts` — `getById`, the settings update mutation, and `updateDesign` as applicable
- [x] 4.2 Add the fields to `src/lib/wishlist/draft-to-preview.ts` and `src/lib/wishlist/persisted-to-preview.ts`
- [x] 4.2a In `draft-to-preview.ts`, seed **representative sample values** for `contributors` and `createdAt` the way `demo-wishlist.ts` already seeds sample data. An unsaved draft has no purchases and no persisted creation date, so real values would make `social-proof` degrade to a plain paragraph and `progress-bar` sit at 0% — both are spec-correct degradations that no test will flag, and both would misrepresent the two most distinctive variants in the design editor's preview. (`persisted-to-preview.ts` needs no seeding: `DashboardWishlistCardViewModel` already carries `createdAt`.)
- [x] 4.3 Add the fields to `src/stores/wishlist-wizard.store.ts` (state, initial values, and reset) and update `src/stores/wishlist-wizard.store.test.ts`
- [x] 4.4 Add representative variant values, a contributor summary, and `createdAt` to `src/config/demo-wishlist.ts`
- [x] 4.5 Update fixtures in `src/server/api/routers/wishlist.test.ts` and `src/server/validators/wishlist-save-draft.schema.test.ts`

## 5. Countdown variants

- [x] 5.1 Replace `Countdown`'s `variant` prop in `src/components/shared/countdown.tsx` with the three catalog ids, removing the `"default"` accent-box rendering
- [x] 5.2 Implement `filled-pill` — solid `--foreground` ground, `--background` text, leading dot
- [x] 5.3 Implement `outline-pill` — `--card` ground, `--border` outline, `--primary` dot (the current `"chip"` appearance)
- [x] 5.4 Implement `progress-bar` — eyebrow, day count, `--muted` track with a `--primary` fill, and "Lista creada" / "Gran día" end labels
- [x] 5.5 Compute progress from `createdAt` to `eventDate`, clamped to 0–100%, rendering full when `createdAt` is after `eventDate`
- [x] 5.6 Guard every variant so that nothing renders when no event date exists, and so the post-event message falls back to a variant-neutral container (preserving the shipped `Gracias por celebrar con nosotros.` requirement) rather than being crammed into a pill or progress bar; no negative day count can display
- [x] 5.7 Update `src/components/shared/countdown.test.tsx` for the three variants, the past-date guard, and the progress clamp

## 6. Welcome message variants

- [x] 6.1 Move all welcome rendering into `src/components/shared/wishlist-message.tsx` and accept a variant prop
- [x] 6.2 Implement `postcard` — dashed `--border` frame on a `--muted` ground with a static "PARA TI" stamp, requiring no signature
- [x] 6.3 Implement `handwritten` — slightly rotated `--card` note with an initials seal derived from the signature
- [x] 6.4 Implement `avatars` — `--accent` ground, avatar cluster from signature initials, eyebrow line, quoted body
- [x] 6.5 Degrade `handwritten` and `avatars` to a seal-less / cluster-less card when no signature exists
- [x] 6.6 Update `src/components/shared/wishlist-message.test.tsx` for the three variants and the missing-signature degradation

## 7. Thank-you message variants

- [x] 7.1 Move all thank-you rendering into `src/components/shared/wishlist-thank-you.tsx` and accept a variant prop
- [x] 7.2 Implement `spotlight` — inverted block mapping background to `--foreground`, text to `--background`, divider to `--primary`, with eyebrow, large "Gracias", body, and signature
- [x] 7.3 Implement `handwritten` — the same rotated-note treatment as the welcome variant, sharing the seal logic
- [x] 7.4 Implement `social-proof` — contributor avatar cluster with `+N` overflow, "N personas hicieron esto posible", eyebrow, body, and signature
- [x] 7.5 Degrade `social-proof` to the plain message body when the contributor count is zero
- [x] 7.6 Feed all three variants the page-wide signature from `welcomeMessageAttribution`
- [x] 7.7 Add `src/components/shared/wishlist-thank-you.test.tsx` covering the three variants, the zero-contributor degradation, and the missing-signature case

## 8. Consolidation and call sites

> **Land groups 6, 7, and 8 as a single commit.** Between them the eight body-delegating layouts still show the old inline italic welcome while the two self-contained layouts already show the new variant — the split-brain state design.md's migration step 4 exists to prevent.

- [x] 8.1 Delete the inline welcome block at `src/components/shared/public-wishlist-body.tsx:41-52` and render `WishlistMessage` with the resolved variant instead
- [x] 8.2 Pass the resolved countdown and thank-you variants from `public-wishlist-body.tsx`
- [x] 8.3 Remove the hardcoded `variant="chip"` in `src/components/layouts/public-wishlist/collage-staggered-layout.tsx` and `split-image-right-layout.tsx`, reading the owner's selection instead
- [x] 8.4 Verify all ten layouts render the selected variants, including the two self-contained ones

## 9. Settings form pickers

- [x] 9.1 Build a shared variant picker component with per-option visual thumbnails, following the `ThemeSwatchPicker` / `LayoutPicker` pattern
- [x] 9.2 Add the countdown picker beneath the event date/time field in `src/components/features/dashboard/settings/wishlist-settings-form.tsx`
- [x] 9.3 Add the welcome picker beneath the welcome message textarea
- [x] 9.4 Add the thank-you picker beneath the thank-you message textarea
- [x] 9.5 Reword the "Firma del mensaje" help text from "Aparecerá debajo del mensaje" to wording covering both messages
- [x] 9.6 Include the three variant fields in the form's submit payload and its dirty-state comparison

## 10. Stories and validation

- [x] 10.1 Add contributor and variant data to `src/components/shared/story-data.ts`
- [x] 10.2 Add or extend Storybook stories covering all nine variants across at least two contrasting theme presets
- [x] 10.3 Verify no variant contains a hardcoded color value; all color comes from theme tokens
- [x] 10.4 Run `pnpm check`, `pnpm test`, and `pnpm typecheck` and resolve any failures
