# TASKS.md — A Wish For

## Context

This project starts from `sietch-init`.

Do not add foundational setup tasks for:

- Next.js
- React
- tRPC
- Prisma
- Neon
- Clerk
- Clerk webhook sync
- Tailwind
- Shadcn/Base UI
- Biome
- Vitest
- Lefthook
- base protected routes
- base auth/dashboard shell

Tasks below are product implementation work for A Wish For.

Priority labels:

- P0 = required for MVP launch
- P1 = important but deferrable if scope gets tight
- P2 = nice-to-have / polish

Task format:

```txt
Milestone
→ Goal
→ Dependencies
→ Detailed tasks
→ Acceptance criteria
→ Affected areas
→ Notes/out-of-scope
→ Cut line
```

---

## Milestone 1 — Product domain & data model

### Goal

Define the core wishlist, category, gift, purchase, lifecycle, quantity, validation, view model, and business-rule foundation.

### Dependencies

- Existing Prisma setup from `sietch-init`.
- Existing local `User` model synced from Clerk.
- Existing tRPC/service conventions from template.

### 1.1 Add core enums and wishlist lifecycle

Priority: P0

Details:

- Add event, status, locale, currency, gift priority, and gift visibility enums.
- Add wishlist lifecycle fields.
- Support draft, published, archived.

Tasks:

- [ ] Add `WishlistStatus = draft | published | archived`.
- [ ] Add `EventType = baby_shower | birthday | wedding | housewarming | general`.
- [ ] Add `Locale = es | en`.
- [ ] Add `Currency = PEN | USD | EUR | MXN | COP | CLP | ARS`.
- [ ] Add `GiftPriority = low | medium | high`.
- [ ] Add `GiftVisibilityStatus = available | hidden`.
- [ ] Add `publishedAt` to Wishlist.
- [ ] Add `archivedAt` to Wishlist.
- [ ] Add lifecycle helpers for publish/archive/restore.

Acceptance criteria:

- Wishlist can be created as draft.
- Published wishlist has status `published` and `publishedAt`.
- Archived wishlist has status `archived` and `archivedAt`.
- Restoring clears `archivedAt`.
- Restore can choose draft or published state.

Affected areas:

- `prisma/schema.prisma`
- `src/server/services/wishlist.service.ts`
- `src/server/validators/wishlist.schema.ts`

Notes/out-of-scope:

- No hard delete for wishlists in MVP.
- No slug redirect history in MVP.

### 1.2 Add Wishlist model fields

Priority: P0

Details:

Wishlist stores content, event, design, language, currency, lifecycle, and owner relationship.

Tasks:

- [ ] Add owner relation to `User`.
- [ ] Add `title`.
- [ ] Add globally unique `slug`.
- [ ] Add `eventType`.
- [ ] Add `language` default `es`.
- [ ] Add `currency` default `PEN`.
- [ ] Add `heroTitle`.
- [ ] Add `welcomeMessage`.
- [ ] Add `thankYouMessage`.
- [ ] Add `displayName`.
- [ ] Add `eventDate`.
- [ ] Add `eventTime` as `HH:mm` string.
- [ ] Add `eventLocation` as plain text.
- [ ] Add `coverImageUrl`.
- [ ] Add `themeId`.
- [ ] Add `layoutId`.
- [ ] Add `buttonStyle`.
- [ ] Add `fontPairing`.
- [ ] Add `showHowItWorks` default true.

Acceptance criteria:

- Wishlist can store all public page content and design settings.
- Missing design values can fall back to presets.
- Event date/time/location are optional.
- Date can be in the past.

Affected areas:

- `prisma/schema.prisma`
- `src/server/validators/wishlist.schema.ts`
- `src/server/services/wishlist.service.ts`

Notes/out-of-scope:

- No rich-text event location.
- No map link in MVP.

### 1.3 Add Category model

Priority: P0

Details:

Categories are per-wishlist and can be created from event presets.

Tasks:

- [ ] Add `Category` model.
- [ ] Add `wishlistId` relation.
- [ ] Add `name`.
- [ ] Add `sortOrder`.
- [ ] Add timestamps.
- [ ] Add category service methods for add, rename, delete, reorder.
- [ ] Deleting category sets assigned gifts to uncategorized.

Acceptance criteria:

- Wishlist can have default categories.
- Owner can add/rename/delete categories.
- Deleting a category does not delete gifts.
- Category filters use `sortOrder`.

Affected areas:

- `prisma/schema.prisma`
- `src/server/services/category.service.ts`
- `src/server/api/routers/category.ts`
- `src/server/validators/category.schema.ts`

Notes/out-of-scope:

- No category drag-and-drop inside wizard.
- Full category reorder belongs in dashboard.

### 1.4 Add Gift model with quantity and soft delete

Priority: P0

Details:

Gift supports manual and URL-imported gifts, optional price/image/link, quantity, priority, visibility, notes, ordering, and soft delete.

Tasks:

- [ ] Add `Gift` model.
- [ ] Add wishlist relation.
- [ ] Add optional category relation with `onDelete: SetNull`.
- [ ] Add `name`.
- [ ] Add optional `productUrl`.
- [ ] Add optional `imageUrl`.
- [ ] Add optional `storeName`.
- [ ] Add optional `priceAmount Decimal(10,2)`.
- [ ] Add optional `priceCurrency`.
- [ ] Add `quantityNeeded Int @default(1)`.
- [ ] Add `priority GiftPriority @default(medium)`.
- [ ] Add `visibilityStatus GiftVisibilityStatus @default(available)`.
- [ ] Add `publicNote`.
- [ ] Add `internalNote`.
- [ ] Add `sortOrder`.
- [ ] Add `deletedAt`.
- [ ] Add gift validation schema.

Acceptance criteria:

- Gift can be created without product URL.
- Gift can be created without image.
- Gift price is optional.
- Gift supports quantity > 1.
- Gift supports hidden state.
- Soft-deleted gifts are excluded from public/dashboard progress.

Affected areas:

- `prisma/schema.prisma`
- `src/server/services/gift.service.ts`
- `src/server/validators/gift.schema.ts`
- `src/server/api/routers/gift.ts`

Notes/out-of-scope:

- No persisted `description` field.
- No user-facing restore for deleted gifts.
- No hard delete in MVP.

### 1.5 Add Purchase model and quantity rules

Priority: P0

Details:

Purchases are active records that represent guest or owner-confirmed purchased quantities.

Tasks:

- [ ] Add `Purchase` model.
- [ ] Add gift relation with cascade.
- [ ] Add `guestName` required.
- [ ] Add optional `guestEmail`.
- [ ] Add optional `guestPhone`.
- [ ] Add optional `message`.
- [ ] Add `quantity Int @default(1)`.
- [ ] Add `undoTokenHash`.
- [ ] Add `undoExpiresAt`.
- [ ] Add purchase validation schema.
- [ ] Add helper to calculate purchased quantity.
- [ ] Add helper to calculate remaining quantity.
- [ ] Add helper to derive public gift status.

Acceptance criteria:

- Multiple purchase records can exist per gift.
- Purchase quantity cannot exceed remaining quantity.
- Gift public status is derived from purchased quantity.
- Guest undo can delete recent purchase using valid token.
- Owner can delete purchase and restore available quantity.

Affected areas:

- `prisma/schema.prisma`
- `src/server/services/purchase.service.ts`
- `src/server/validators/purchase.schema.ts`
- `src/server/api/routers/purchase.ts`

Notes/out-of-scope:

- No cancelled purchase records in MVP.
- No purchase history/audit log in MVP.

### 1.6 Add slug validation and availability logic

Priority: P0

Details:

Slugs are global and power `/w/[slug]`.

Tasks:

- [ ] Add slug validation helper.
- [ ] Add slug suggestion helper from title.
- [ ] Enforce lowercase letters, numbers, hyphens only.
- [ ] Enforce length 3–60.
- [ ] Reject start/end hyphen.
- [ ] Add availability service.
- [ ] Add `excludeWishlistId` support.
- [ ] Add tRPC endpoint for availability checks.
- [ ] Add tests.

Acceptance criteria:

- Invalid slugs return specific validation state.
- Existing slug is unavailable.
- Current wishlist slug is available when editing same wishlist.
- Slug checked before save and before publish.

Affected areas:

- `src/lib/slug.ts`
- `src/server/services/slug.service.ts`
- `src/server/api/routers/wishlist.ts`
- `src/server/validators/wishlist.schema.ts`

Notes/out-of-scope:

- No slug redirect history.

### 1.7 Add publish readiness validation

Priority: P0

Details:

Publish requires minimum valid public wishlist data.

Tasks:

- [ ] Add publish readiness helper.
- [ ] Validate title.
- [ ] Validate event type.
- [ ] Validate slug.
- [ ] Validate language.
- [ ] Validate currency.
- [ ] Validate at least one visible non-deleted gift.
- [ ] Return checklist-friendly result.
- [ ] Add tests.

Acceptance criteria:

- Dashboard can render checklist from validation result.
- Publish mutation blocks incomplete wishlist.
- Hidden gifts do not count.
- Soft-deleted gifts do not count.
- Design settings do not block publish.

Affected areas:

- `src/server/services/wishlist.service.ts`
- `src/server/validators/wishlist.schema.ts`
- `src/lib/wishlist/publish-readiness.ts`

Notes/out-of-scope:

- No required cover image.
- No required event date.

### 1.8 Add public and dashboard view model mappers

Priority: P0

Details:

Components should consume view models, not raw Prisma models.

Tasks:

- [ ] Add `src/server/mappers/public-wishlist.mapper.ts`.
- [ ] Add `src/server/mappers/dashboard-wishlist.mapper.ts`.
- [ ] Add `src/server/mappers/dashboard-gift.mapper.ts`.
- [ ] Add public wishlist view model types.
- [ ] Add public gift view model types.
- [ ] Add dashboard card view model types.
- [ ] Add dashboard gift row view model types.
- [ ] Serialize Decimal to string.
- [ ] Serialize Date to ISO string.
- [ ] Exclude public-private data leaks.
- [ ] Add mapper tests.

Acceptance criteria:

- Public view model excludes hidden/deleted gifts.
- Public view model excludes guest email/phone/message.
- Public view model excludes internal notes.
- Dashboard view models include management-ready derived fields.
- Client components receive serializable primitives.

Affected areas:

- `src/server/mappers/*`
- `src/server/services/public-wishlist.service.ts`
- `src/server/services/wishlist.service.ts`

Notes/out-of-scope:

- Mappers should not perform localization formatting.

### 1.9 Add shared formatting helpers

Priority: P0

Details:

Centralize money, date, relative date, and string/domain formatting.

Tasks:

- [ ] Add `src/lib/format/money.ts`.
- [ ] Add `src/lib/format/dates.ts`.
- [ ] Add `src/lib/format/strings.ts`.
- [ ] Add `formatMoney`.
- [ ] Add `formatEventDate`.
- [ ] Add `formatRelativeDate`.
- [ ] Add `formatStoreDomain`.
- [ ] Add tests.

Acceptance criteria:

- PEN formats correctly for Spanish Peru.
- USD formats correctly for English US.
- Event date formats in Spanish and English.
- Store domain fallback is clean.

Affected areas:

- `src/lib/format/*`

Notes/out-of-scope:

- No advanced timezone support beyond app needs in MVP.

### Cut line

If scope gets tight, defer:

- Some non-critical formatter variants.
- Some edge-case store-domain formatting.

Do not defer:

- Data models.
- Quantity logic.
- Purchase model.
- Slug validation.
- Publish readiness.
- Public/private data safety.

---

## Milestone 2 — Public wishlist foundation

### Goal

Render `/w/[slug]` correctly, safely, beautifully, and mobile-first before completing all owner flows.

### Dependencies

- Milestone 1 core models.
- Public wishlist view model mapper.
- Theme/layout config.

### 2.1 Add public wishlist service

Priority: P0

Details:

Server service fetches wishlist by slug and enforces public route rules.

Tasks:

- [ ] Add `src/server/services/public-wishlist.service.ts`.
- [ ] Fetch wishlist by slug with categories, gifts, purchases.
- [ ] Exclude soft-deleted gifts from calculations.
- [ ] Apply draft/published/archived behavior.
- [ ] Support owner draft preview.
- [ ] Return public view model.
- [ ] Return archived state when applicable.
- [ ] Return not found for inaccessible draft.

Acceptance criteria:

- Published wishlist renders publicly.
- Draft wishlist returns 404 for non-owner.
- Draft wishlist renders preview for owner.
- Archived wishlist renders inactive state.
- Hidden gifts never appear publicly.

Affected areas:

- `src/server/services/public-wishlist.service.ts`
- `src/app/w/[slug]/page.tsx`

Notes/out-of-scope:

- No public search/discovery.

### 2.2 Add public route and metadata behavior

Priority: P0

Details:

Create public route and SEO/noindex behavior.

Tasks:

- [ ] Add `src/app/w/[slug]/page.tsx`.
- [ ] Add metadata generation.
- [ ] Add `noindex` for public wishlist pages.
- [ ] Handle 404 state.
- [ ] Handle archived state.
- [ ] Handle owner preview banner.

Acceptance criteria:

- Public URL is `/w/[slug]`.
- Public wishlist pages are `noindex`.
- Marketing pages remain indexable.
- Archived page has correct message.

Affected areas:

- `src/app/w/[slug]/page.tsx`
- `src/app/w/[slug]/metadata` if split

Notes/out-of-scope:

- No locale prefix.

### 2.3 Add public theme and layout config

Priority: P0

Details:

Implement hardcoded theme, layout, font, and button presets.

Tasks:

- [ ] Add `src/config/public-themes.ts`.
- [ ] Add six theme presets.
- [ ] Add scoped Shadcn/Tailwind CSS variable support.
- [ ] Add `src/config/public-layouts.ts`.
- [ ] Add three layout presets.
- [ ] Add `src/config/public-fonts.ts`.
- [ ] Add font pairings using `next/font`.
- [ ] Add `src/config/public-button-styles.ts`.
- [ ] Add button style presets.

Acceptance criteria:

- Public page can switch theme by `themeId`.
- Public page can switch layout by `layoutId`.
- Dashboard theme remains unaffected.
- Public components use scoped variables.

Affected areas:

- `src/config/*`
- `src/components/layouts/public-wishlist/*`

Notes/out-of-scope:

- No custom color picker.
- No square button style.

### 2.4 Add public layout components

Priority: P0

Details:

Create shared public wishlist page components and layout variants.

Tasks:

- [ ] Add `PublicWishlistPage` shell.
- [ ] Add `GridWishlistLayout`.
- [ ] Add `EditorialWishlistLayout`.
- [ ] Add `MinimalWishlistLayout`.
- [ ] Add `WishlistHero`.
- [ ] Add `Countdown`.
- [ ] Add `GiftCard`.
- [ ] Add `GiftGrid/GiftList`.
- [ ] Add `HowItWorks`.
- [ ] Add `WishlistFooter`.
- [ ] Support `full | preview | compact` render modes.

Acceptance criteria:

- Public page renders all required sections in correct order.
- Components support preview mode with disabled actions.
- Compact mode works for landing preview.
- Page is mobile-first.

Affected areas:

- `src/components/layouts/public-wishlist/*`
- `src/components/features/wishlist/*`

Notes/out-of-scope:

- No advanced animations required.

### 2.5 Add public gift filters and sorting

Priority: P0

Details:

Guests can filter and sort gifts.

Tasks:

- [ ] Add filter state.
- [ ] Add `Todos` filter.
- [ ] Add `Disponibles` filter.
- [ ] Add `Comprados` filter.
- [ ] Add `Infaltables` filter.
- [ ] Add category filters.
- [ ] Add sort dropdown.
- [ ] Add default recommended order.
- [ ] Add empty filter states.

Acceptance criteria:

- One active filter at a time.
- Category filters follow category sort order.
- Purchased gifts appear below available gifts by default.
- Empty states show correct copy and CTA.

Affected areas:

- `src/components/features/wishlist/public-filters.tsx`
- `src/components/features/wishlist/gift-list.tsx`

Notes/out-of-scope:

- No multi-select filters.

### 2.6 Add public progress display

Priority: P0

Details:

Show quantity-based progress summary.

Tasks:

- [ ] Add public progress component.
- [ ] Show available gift count.
- [ ] Show purchased units / total units.
- [ ] Handle zero-state safely.
- [ ] Reuse public view model progress.

Acceptance criteria:

- Example format: `8 disponibles · 7 de 16 unidades compradas`.
- Hidden/deleted gifts excluded.
- Partial purchases reflected correctly.

Affected areas:

- `src/components/features/wishlist/progress-summary.tsx`
- `src/server/mappers/public-wishlist.mapper.ts`

Notes/out-of-scope:

- No animated progress required.

### Cut line

If scope gets tight, defer:

- Secondary sorting modes.
- Extra decorative theme details.
- Advanced empty-state illustrations.

Do not defer:

- Public route rules.
- Public view model.
- Hidden/deleted gift exclusion.
- Gift cards.
- Basic filters.
- Public/private data safety.

---

## Milestone 3 — Wishlist creation wizard

### Goal

Build the unauthenticated-first creation flow with local drafts, event presets, design preview, gifts, auth gate, publish, and share success.

### Dependencies

- Milestone 1 models/validation.
- Milestone 2 public preview components.
- Existing Clerk auth from template.

### 3.1 Add event presets config

Priority: P0

Details:

Event type presets drive default categories, suggested copy, sample gifts, and default design.

Tasks:

- [ ] Add `src/config/event-type-presets.ts`.
- [ ] Add presets for baby shower, birthday, wedding, housewarming, general.
- [ ] Add default categories.
- [ ] Add default hero title template.
- [ ] Add default welcome message.
- [ ] Add default thank-you message.
- [ ] Add sample gifts.
- [ ] Add default theme/layout IDs.

Acceptance criteria:

- Selecting event type seeds default content.
- Sample gifts render in preview before real gifts exist.
- Defaults can be regenerated manually.

Affected areas:

- `src/config/event-type-presets.ts`
- `src/components/features/wizard/*`

Notes/out-of-scope:

- No AI copy generation.

### 3.2 Add wizard route and state structure

Priority: P0

Details:

Wizard lives at `/create` with query-param steps.

Tasks:

- [ ] Add `/create` page.
- [ ] Add step router using query params.
- [ ] Add wizard state shape.
- [ ] Add Zustand store.
- [ ] Add localStorage persistence.
- [ ] Add 30-day stale draft detection.
- [ ] Add signed-out recovery prompt.
- [ ] Add reset/start over behavior.

Acceptance criteria:

- User can start without auth.
- Refresh preserves local draft.
- Old draft prompts user before continuing.
- Step URLs are shareable enough for local navigation.

Affected areas:

- `src/app/create/page.tsx`
- `src/components/features/wizard/*`
- `src/stores/wishlist-wizard.store.ts`

Notes/out-of-scope:

- No DB autosave.

### 3.3 Add Event Type step

Priority: P0

Details:

User chooses event type and receives seeded defaults.

Tasks:

- [ ] Add event type cards.
- [ ] Apply default categories.
- [ ] Apply default design.
- [ ] Apply default copy if fields untouched.
- [ ] Track `copyTouched` local-only.
- [ ] Add Spanish labels.

Acceptance criteria:

- Changing event type does not overwrite user-edited copy.
- Untouched copy can update from presets.
- User can regenerate suggested copy manually.

Affected areas:

- `src/components/features/wizard/event-type-step.tsx`
- `src/stores/wishlist-wizard.store.ts`

Notes/out-of-scope:

- No custom event type in MVP.

### 3.4 Add Event Details + slug step

Priority: P0

Details:

User enters title, display/event details, and public slug.

Tasks:

- [ ] Add title field.
- [ ] Add display name field.
- [ ] Add event date picker with Shadcn Calendar + Popover.
- [ ] Add time input/select normalized to `HH:mm`.
- [ ] Add location text field.
- [ ] Add slug auto-generation from title.
- [ ] Add editable slug field.
- [ ] Add `use-debounce` slug availability check.
- [ ] Add Checking/Available/Taken/Invalid states.
- [ ] Add past date warning.

Acceptance criteria:

- Slug validates client-side and server-side.
- Slug is checked before save/publish.
- Past dates allowed with warning.
- Event date/time/location optional.

Affected areas:

- `src/components/features/wizard/details-step.tsx`
- `src/lib/slug.ts`
- `src/server/api/routers/wishlist.ts`

Notes/out-of-scope:

- No map autocomplete.

### 3.5 Add Design & Preview step

Priority: P0

Details:

User picks theme/layout/font/button style and sees embedded preview.

Tasks:

- [ ] Add theme preview cards.
- [ ] Add layout preview cards.
- [ ] Add font pairing selector.
- [ ] Add button style selector.
- [ ] Add cover image upload hook placeholder/integration with UploadThing milestone if needed.
- [ ] Add embedded public preview.
- [ ] Use sample gifts before real gifts exist.
- [ ] Disable purchase actions in preview mode.

Acceptance criteria:

- User sees live preview of design choices.
- Preview uses event-specific sample gifts before gifts exist.
- Preview does not mutate purchase state.

Affected areas:

- `src/components/features/wizard/design-step.tsx`
- `src/components/layouts/public-wishlist/*`
- `src/config/public-*`

Notes/out-of-scope:

- No freeform theme builder.

### 3.6 Add Gifts step

Priority: P0

Details:

User adds gifts manually or via URL importer.

Tasks:

- [ ] Add gift list editor.
- [ ] Add manual gift form.
- [ ] Add URL import entry point.
- [ ] Add category assignment.
- [ ] Add quantity field.
- [ ] Add priority field.
- [ ] Add public note/internal note.
- [ ] Add hide gift toggle.
- [ ] Add local draft gift handling before DB save.

Acceptance criteria:

- User can add at least one visible gift.
- User can add gift without product URL.
- User can assign category.
- User can set quantity.
- Hidden gifts do not count for publish readiness.

Affected areas:

- `src/components/features/wizard/gifts-step.tsx`
- `src/components/features/wishlist/gift-form.tsx`
- `src/stores/wishlist-wizard.store.ts`

Notes/out-of-scope:

- Full drag-and-drop gift ordering can be dashboard-first.

### 3.7 Add authenticated save draft

Priority: P0

Details:

Authenticated users can persist local wizard draft to DB manually.

Tasks:

- [ ] Add `Guardar borrador` action.
- [ ] Add save draft mutation.
- [ ] Create DB draft on first save.
- [ ] Update same DB draft on subsequent saves.
- [ ] Store `savedWishlistId` and `lastSavedAt` locally.
- [ ] Show Sonner toast.
- [ ] Add `Ver en dashboard` link.
- [ ] Add signed-in draft conflict handling.

Acceptance criteria:

- User can save draft manually.
- No autosave occurs.
- Subsequent saves update same draft.
- Conflicts are detected and prompt user.

Affected areas:

- `src/server/services/wishlist.service.ts`
- `src/server/api/routers/wishlist.ts`
- `src/components/features/wizard/*`

Notes/out-of-scope:

- No autosave MVP.

### 3.8 Add Final Preview, Auth Gate, Publish & Share step

Priority: P0

Details:

Final step validates, gates auth, publishes, and shows share state.

Tasks:

- [ ] Add final embedded preview.
- [ ] Add full page preview button.
- [ ] Add publish readiness checklist.
- [ ] Add auth gate if unauthenticated.
- [ ] Add publish mutation.
- [ ] Add publish success state.
- [ ] Add copy link action.
- [ ] Add WhatsApp share action.
- [ ] Add QR download action.
- [ ] Clear local draft after successful publish.

Acceptance criteria:

- Unauthenticated user must auth before save/publish.
- Publish blocked until readiness criteria met.
- Successful publish stays on success/share state.
- Local storage clears after publish.

Affected areas:

- `src/components/features/wizard/publish-step.tsx`
- `src/server/services/wishlist.service.ts`
- `src/server/api/routers/wishlist.ts`

Notes/out-of-scope:

- No payment/premium gate.

### Cut line

If scope gets tight, defer:

- Some wizard polish.
- Advanced local draft conflict UI.
- Full category management inside wizard.

Do not defer:

- Event type selection.
- Details/slug step.
- Design preview.
- Gift creation.
- Auth gate.
- Publish/share flow.

---

## Milestone 4 — Gift management & importer

### Goal

Make gift creation/editing powerful in dashboard and wizard, including URL import, image upload, category management, ordering, and purchase drawer.

### Dependencies

- Gift model and service.
- Category model and service.
- Public gift components.
- UploadThing product dependency.

### 4.1 Add URL importer service

Priority: P0

Details:

Server-side metadata importer with manual fallback.

Tasks:

- [ ] Add `src/server/services/importer.service.ts`.
- [ ] Add URL safety validation.
- [ ] Block private/internal URLs.
- [ ] Add timeout with AbortController.
- [ ] Limit redirects to 5.
- [ ] Limit HTML size to 2MB.
- [ ] Validate final URL after redirects.
- [ ] Parse JSON-LD Product.
- [ ] Parse Open Graph.
- [ ] Parse Twitter Card.
- [ ] Parse HTML title.
- [ ] Add domain fallback.
- [ ] Return `ImportedGiftDraft`.
- [ ] Add importer tests.

Acceptance criteria:

- Valid product URL returns best available metadata.
- Invalid/private URL is rejected.
- Timeout returns friendly error state.
- Manual fallback always remains possible.

Affected areas:

- `src/server/services/importer.service.ts`
- `src/server/api/routers/importer.ts`
- `src/server/validators/importer.schema.ts`

Notes/out-of-scope:

- No JavaScript execution.
- No Puppeteer/Playwright.

### 4.2 Add URL cleanup and store display mapping

Priority: P0

Details:

Clean URLs and display friendly store names.

Tasks:

- [ ] Add tracking param cleanup helper.
- [ ] Strip known UTM/click IDs.
- [ ] Preserve unknown params.
- [ ] Add `src/config/store-display-names.ts`.
- [ ] Add Peru/LatAm store mappings.
- [ ] Add international store mappings.
- [ ] Add clean domain fallback.
- [ ] Add tests.

Acceptance criteria:

- Product URL stored without known tracking params.
- Unknown params preserved.
- Known stores show friendly name.
- Unknown stores show clean domain.

Affected areas:

- `src/lib/url/*`
- `src/config/store-display-names.ts`
- `src/lib/format/strings.ts`

Notes/out-of-scope:

- No affiliate link rewrite.

### 4.3 Add image upload support

Priority: P0

Details:

Support cover image and gift image upload using UploadThing.

Tasks:

- [ ] Add UploadThing routes/config.
- [ ] Add cover image upload.
- [ ] Add cover image remove.
- [ ] Add gift image upload.
- [ ] Add gift image replacement.
- [ ] Add gift image remove.
- [ ] Validate file types JPG/PNG/WEBP.
- [ ] Validate cover max 4MB.
- [ ] Validate gift max 3MB.

Acceptance criteria:

- Owner can upload/remove cover image.
- Owner can upload/replace/remove gift image.
- Invalid file types rejected.
- Oversized files rejected.

Affected areas:

- UploadThing route/config
- `src/components/features/wishlist/image-upload.tsx`
- `src/components/features/wizard/design-step.tsx`
- `src/components/features/wishlist/gift-form.tsx`

Notes/out-of-scope:

- No crop/edit.
- No AI image features.
- No multiple images per gift.

### 4.4 Add dashboard gift management table/list

Priority: P0

Details:

Owner manages all gifts from dashboard with filters, status badges, and edit/delete actions.

Tasks:

- [ ] Add dashboard gifts page.
- [ ] Add gift row view model usage.
- [ ] Add available/partial group.
- [ ] Add purchased group.
- [ ] Add hidden group.
- [ ] Add status badges.
- [ ] Add quantity progress per gift.
- [ ] Add edit action.
- [ ] Add hide/unhide action.
- [ ] Add soft delete action.
- [ ] Add delete confirmation.

Acceptance criteria:

- Dashboard shows available, purchased, and hidden gifts.
- Hidden gifts are shown with badge in dashboard.
- Soft-deleted gifts disappear from dashboard.
- Gift with purchases shows stronger delete warning.

Affected areas:

- `src/app/(protected)/dashboard/wishlists/[id]/gifts/page.tsx`
- `src/components/features/dashboard/gifts/*`

Notes/out-of-scope:

- No restore UI for deleted gifts.

### 4.5 Add drag-and-drop gift ordering

Priority: P1

Details:

Owner can reorder gifts using drag-and-drop.

Tasks:

- [ ] Add `@dnd-kit` integration.
- [ ] Add reorder mutation.
- [ ] Persist shared `sortOrder` per gift.
- [ ] Support all non-deleted gifts.
- [ ] Preserve public grouping behavior.

Acceptance criteria:

- Owner can reorder gifts.
- Public page respects sort order within status groups.
- Dashboard respects sort order within groups.

Affected areas:

- `src/components/features/dashboard/gifts/gift-table.tsx`
- `src/server/services/gift.service.ts`
- `src/server/api/routers/gift.ts`

Notes/out-of-scope:

- No category drag-and-drop in wizard.

### 4.6 Add category management UI

Priority: P1

Details:

Owner can manage categories in dashboard; wizard remains lightweight.

Tasks:

- [ ] Add dashboard category management panel.
- [ ] Add category add.
- [ ] Add category rename.
- [ ] Add category delete.
- [ ] Add category reorder.
- [ ] Show gift counts.
- [ ] Add wizard lightweight category assignment/editing.

Acceptance criteria:

- Owner can manage categories fully in dashboard.
- Deleting category moves gifts to uncategorized.
- Public filters update from categories.

Affected areas:

- `src/components/features/dashboard/categories/*`
- `src/components/features/wizard/gifts-step.tsx`
- `src/server/services/category.service.ts`

Notes/out-of-scope:

- No nested categories.

### 4.7 Add purchase drawer for owner

Priority: P0

Details:

Owner views and manages purchase records at gift level.

Tasks:

- [ ] Add gift purchase drawer.
- [ ] Show purchase records.
- [ ] Show guest name.
- [ ] Show optional email/phone/message.
- [ ] Show quantity.
- [ ] Add owner manual purchase form.
- [ ] Add owner delete purchase action.
- [ ] Add confirmation dialog.
- [ ] Add owner undo toast for manual purchase.

Acceptance criteria:

- Owner can see who purchased a gift.
- Owner can manually add purchase.
- Manual purchase quantity cannot exceed remaining.
- Owner can delete purchase and increase remaining quantity.

Affected areas:

- `src/components/features/dashboard/purchases/*`
- `src/server/services/purchase.service.ts`
- `src/server/api/routers/purchase.ts`

Notes/out-of-scope:

- No separate purchases page.

### Cut line

If scope gets tight, defer:

- Drag-and-drop ordering.
- Category reorder UI.
- Some dashboard table polish.

Do not defer:

- Manual gift form.
- URL importer with fallback.
- Gift image upload.
- Owner purchase drawer.
- Gift soft delete/hide behavior.

---

## Milestone 5 — Guest purchase flow

### Goal

Complete the public conversion action: guests can mark gifts as purchased safely, with quantity, consent, success state, undo, progress updates, and rate limiting.

### Dependencies

- Public wishlist page.
- Purchase model/service.
- Gift quantity logic.
- Upstash Redis.

### 5.1 Add public purchase mutation

Priority: P0

Details:

Public mutation lets guests mark gifts as purchased without auth.

Tasks:

- [ ] Add `purchase.markGiftPurchased` public mutation.
- [ ] Validate gift belongs to published wishlist.
- [ ] Validate gift is not hidden.
- [ ] Validate gift is not soft-deleted.
- [ ] Validate quantity remaining.
- [ ] Create purchase record.
- [ ] Generate raw undo token.
- [ ] Hash undo token.
- [ ] Set undo expiry to 60 seconds.
- [ ] Return success payload and raw undo token once.

Acceptance criteria:

- Guest can purchase available gift.
- Guest cannot purchase hidden/deleted gift.
- Guest cannot exceed remaining quantity.
- Mutation returns undo token only once.

Affected areas:

- `src/server/services/purchase.service.ts`
- `src/server/api/routers/purchase.ts`
- `src/server/validators/purchase.schema.ts`

Notes/out-of-scope:

- No guest account creation.

### 5.2 Add public purchase modal

Priority: P0

Details:

Guest enters name, optional contact/message, quantity, and consent.

Tasks:

- [ ] Add `PurchaseGiftModal`.
- [ ] Add required name field.
- [ ] Add optional email field.
- [ ] Add optional phone field.
- [ ] Add optional message field.
- [ ] Add quantity selector if remaining > 1.
- [ ] Add consent copy.
- [ ] Add loading/error states.
- [ ] Disable product link for purchased gifts.

Acceptance criteria:

- Name is required, 2–80 chars.
- Email validates if present.
- Phone validates if present.
- Message max 500 chars.
- Quantity min 1 and max remaining.
- Consent copy visible.

Affected areas:

- `src/components/features/wishlist/purchase-gift-modal.tsx`
- `src/components/features/wishlist/gift-card.tsx`

Notes/out-of-scope:

- No CAPTCHA unless abuse appears.

### 5.3 Add success and undo flow

Priority: P0

Details:

Guest sees thank-you state and can undo briefly.

Tasks:

- [ ] Add success state copy.
- [ ] Add `Deshacer` action.
- [ ] Add `Cerrar` action.
- [ ] Add `purchase.undoRecentPurchase` mutation.
- [ ] Validate token hash.
- [ ] Validate token expiry.
- [ ] Delete purchase record on valid undo.
- [ ] Update UI after undo.

Acceptance criteria:

- Guest can undo within 60 seconds.
- Expired/invalid token fails safely.
- Undo deletes only the just-created purchase.
- Public progress updates after undo.

Affected areas:

- `src/server/services/purchase.service.ts`
- `src/server/api/routers/purchase.ts`
- `src/components/features/wishlist/purchase-gift-modal.tsx`

Notes/out-of-scope:

- Undo is not available across devices/browsers.

### 5.4 Add public progress refresh behavior

Priority: P0

Details:

After purchase/undo, public gift status and progress should reflect changes.

Tasks:

- [ ] Refresh public data after purchase.
- [ ] Refresh public data after undo.
- [ ] Update gift card quantity progress.
- [ ] Move fully purchased gifts into purchased group.
- [ ] Remove CTAs from purchased gift.

Acceptance criteria:

- Gift transitions from available/partial to purchased when quantity complete.
- Purchased gifts move below available gifts.
- Progress summary updates.

Affected areas:

- Public wishlist components
- tRPC utils/cache invalidation

Notes/out-of-scope:

- No realtime updates between different guests.

### 5.5 Add rate limiting

Priority: P0

Details:

Protect public mutations and importer/slug endpoints using Upstash Redis.

Tasks:

- [ ] Add rate limit helper.
- [ ] Rate limit purchase confirmations: 10/hour/IP.
- [ ] Rate limit purchase attempts per gift: 3/hour/IP/gift.
- [ ] Rate limit undo endpoint.
- [ ] Rate limit slug checks.
- [ ] Rate limit importer.
- [ ] Add friendly rate-limit error copy.

Acceptance criteria:

- Excessive purchase attempts are blocked.
- Excessive slug checks are blocked.
- Excessive importer calls are blocked.
- User sees friendly error.

Affected areas:

- `src/server/lib/rate-limit.ts`
- `src/server/api/routers/*`
- Upstash config/env

Notes/out-of-scope:

- No full abuse dashboard.

### Cut line

If scope gets tight, defer:

- Extra success animations.
- Advanced per-gift abuse messaging.

Do not defer:

- Purchase modal.
- Server-side quantity validation.
- Undo token security.
- Rate limiting.
- Progress updates.

---

## Milestone 6 — Owner dashboard

### Goal

Allow owners to manage existing wishlists, view progress, publish readiness, share, design, settings, archive, and restore.

### Dependencies

- Product models/services.
- Public view components.
- Dashboard shell from template.

### 6.1 Add dashboard wishlist list

Priority: P0

Details:

Owner sees wishlists as cards with status/progress and filters.

Tasks:

- [ ] Add wishlist list page.
- [ ] Add card grid.
- [ ] Add dashboard wishlist card view model.
- [ ] Add Activas filter.
- [ ] Add Borradores filter.
- [ ] Add Publicadas filter.
- [ ] Add Archivadas filter.
- [ ] Add empty states.

Acceptance criteria:

- Owner sees their wishlists only.
- Archived hidden from default list.
- Empty state CTA goes to `/create`.

Affected areas:

- `src/app/(protected)/dashboard/wishlists/page.tsx`
- `src/components/features/dashboard/wishlist-card.tsx`
- `src/server/mappers/dashboard-wishlist.mapper.ts`

Notes/out-of-scope:

- No search in MVP.

### 6.2 Add wishlist overview page

Priority: P0

Details:

Overview shows metrics, link, sharing, readiness, and recent purchases.

Tasks:

- [ ] Add overview page.
- [ ] Add metrics cards.
- [ ] Add public link section.
- [ ] Add copy link action.
- [ ] Add WhatsApp share action.
- [ ] Add QR download action.
- [ ] Add recent purchases section.
- [ ] Add publish readiness checklist.
- [ ] Add publish action.

Acceptance criteria:

- Owner sees quantity-based progress.
- Owner sees latest 5 purchases.
- Owner can publish if ready.
- Owner can share after publish.

Affected areas:

- `src/app/(protected)/dashboard/wishlists/[id]/page.tsx`
- `src/components/features/dashboard/overview/*`

Notes/out-of-scope:

- No full analytics dashboard.

### 6.3 Add dashboard navigation

Priority: P0

Details:

Wishlist detail pages use tabs/dropdown navigation.

Tasks:

- [ ] Add wishlist detail layout.
- [ ] Add desktop/tablet tabs.
- [ ] Add mobile select/dropdown.
- [ ] Add nav items: Resumen, Regalos, Diseño, Configuración.

Acceptance criteria:

- Navigation works on desktop and mobile.
- Active section clearly indicated.

Affected areas:

- `src/app/(protected)/dashboard/wishlists/[id]/layout.tsx`
- `src/components/layouts/dashboard/*`

Notes/out-of-scope:

- No breadcrumbs required unless already in template.

### 6.4 Add dashboard design page

Priority: P1

Details:

Owner can update design after wishlist creation.

Tasks:

- [ ] Add design page.
- [ ] Add theme selector.
- [ ] Add layout selector.
- [ ] Add font selector.
- [ ] Add button style selector.
- [ ] Add cover image upload/remove.
- [ ] Add embedded preview.
- [ ] Save design changes.

Acceptance criteria:

- Owner can update public design.
- Preview reflects changes.
- Public page uses updated design.

Affected areas:

- `src/app/(protected)/dashboard/wishlists/[id]/design/page.tsx`
- `src/components/features/dashboard/design/*`

Notes/out-of-scope:

- No freeform custom colors.

### 6.5 Add dashboard settings page

Priority: P0

Details:

Owner can edit core wishlist content/settings and archive/restore.

Tasks:

- [ ] Add settings page.
- [ ] Edit title.
- [ ] Edit slug.
- [ ] Edit event details.
- [ ] Edit hero/welcome/thank-you copy.
- [ ] Edit language/currency.
- [ ] Toggle How it works.
- [ ] Add slug change warning for published wishlists.
- [ ] Add archive action.
- [ ] Add restore dialog for archived wishlist.

Acceptance criteria:

- Owner can edit core settings.
- Published slug change shows QR/link warning.
- Archive makes public page inactive.
- Restore as draft or published works.

Affected areas:

- `src/app/(protected)/dashboard/wishlists/[id]/settings/page.tsx`
- `src/components/features/dashboard/settings/*`
- `src/server/services/wishlist.service.ts`

Notes/out-of-scope:

- No hard delete.

### Cut line

If scope gets tight, defer:

- Dashboard design page polish.
- Advanced recent purchase UI.
- Some dashboard card polish.

Do not defer:

- Wishlist list.
- Overview metrics.
- Publish checklist.
- Share panel.
- Settings edit.
- Archive/restore.

---

## Milestone 7 — Marketing, legal, and sharing polish

### Goal

Make the app launch-ready publicly with landing page, legal pages, demo preview, footer/report links, QR, and Spanish copy polish.

### Dependencies

- Public components.
- QR package.
- WhatsApp templates.

### 7.1 Add marketing landing page

Priority: P0

Details:

Landing page explains product and drives users to `/create`.

Tasks:

- [ ] Add hero section.
- [ ] Add Cómo funciona section.
- [ ] Add Casos de uso section.
- [ ] Add theme previews section.
- [ ] Add example public wishlist preview.
- [ ] Add final CTA section.
- [ ] Add minimal nav.

Acceptance criteria:

- CTA `Crear mi wishlist` links to `/create`.
- Secondary CTA `Ver ejemplo` links to `#ejemplo`.
- Signed-out nav shows Iniciar sesión + Crear mi wishlist.
- Signed-in nav shows Dashboard + Crear mi wishlist.

Affected areas:

- `src/app/(marketing)/page.tsx`
- `src/components/layouts/marketing/*`
- `src/config/demo-wishlist.ts`

Notes/out-of-scope:

- No pricing.
- No testimonials.
- No FAQ.

### 7.2 Add demo wishlist config

Priority: P1

Details:

Landing page uses public wishlist components with sample data.

Tasks:

- [ ] Add `src/config/demo-wishlist.ts`.
- [ ] Add compact public wishlist view model sample.
- [ ] Render using compact mode.
- [ ] Ensure actions disabled.

Acceptance criteria:

- Landing preview looks like real public wishlist.
- Demo does not mutate anything.

Affected areas:

- `src/config/demo-wishlist.ts`
- Public wishlist components

Notes/out-of-scope:

- No separate screenshot carousel.

### 7.3 Add QR download

Priority: P0

Details:

Owners can download PNG QR for current public URL.

Tasks:

- [ ] Add QR generation helper using `qrcode`.
- [ ] Generate QR from current public URL.
- [ ] Add download PNG action.
- [ ] Use in publish success step.
- [ ] Use in dashboard share panel.

Acceptance criteria:

- QR encodes `https://awishfor.com/w/[slug]`.
- PNG downloads successfully.
- QR changes when slug changes.

Affected areas:

- `src/lib/qr.ts`
- Wizard publish step
- Dashboard overview/share panel

Notes/out-of-scope:

- No logo/custom styling.
- No SVG.
- No scan tracking.

### 7.4 Add WhatsApp share templates

Priority: P0

Details:

Share messages vary by event type.

Tasks:

- [ ] Add WhatsApp template helper.
- [ ] Add baby shower template.
- [ ] Add birthday template.
- [ ] Add wedding template.
- [ ] Add housewarming template.
- [ ] Add general template.
- [ ] URL-encode message correctly.

Acceptance criteria:

- WhatsApp share opens with correct Spanish message.
- Message includes public URL.
- Template matches event type.

Affected areas:

- `src/lib/share/whatsapp.ts`
- Wizard publish step
- Dashboard share panel

Notes/out-of-scope:

- No custom WhatsApp message editor.

### 7.5 Add legal pages and footer links

Priority: P0

Details:

Add minimal legal pages and report link.

Tasks:

- [ ] Add `/privacy`.
- [ ] Add `/terms`.
- [ ] Mention Clerk, PostHog, Sentry, UploadThing, Neon.
- [ ] Mention guest purchase/contact data.
- [ ] Add public footer links.
- [ ] Add report mailto link.
- [ ] Add support email `hola@awishfor.com`.

Acceptance criteria:

- Privacy and terms pages exist.
- Footer links work.
- Report list opens email draft.
- Guest consent copy is present in purchase modal.

Affected areas:

- `src/app/(marketing)/privacy/page.tsx`
- `src/app/(marketing)/terms/page.tsx`
- `src/components/features/wishlist/wishlist-footer.tsx`

Notes/out-of-scope:

- No cookie banner unless ads/retargeting added.

### Cut line

If scope gets tight, defer:

- Theme preview section detail.
- Demo preview polish.
- Extra landing copy sections.

Do not defer:

- Landing hero/CTA.
- QR download.
- WhatsApp share.
- Privacy/terms.
- Footer/report links.

---

## Milestone 8 — Observability, tests, and release hardening

### Goal

Add confidence before launch with product logic tests, analytics, error monitoring, rate-limit verification, and final QA.

### Dependencies

- Main product flows implemented.
- Vitest from template.
- PostHog/Sentry if enabled.

### 8.1 Add product logic tests

Priority: P0

Details:

Test business logic and pure helpers first.

Tasks:

- [ ] Test slug validation and suggestions.
- [ ] Test URL safety validation.
- [ ] Test URL cleanup/tracking removal.
- [ ] Test store display-name detection.
- [ ] Test importer metadata parsing.
- [ ] Test gift progress calculation.
- [ ] Test public status derivation.
- [ ] Test publish readiness validation.
- [ ] Test purchase quantity validation.
- [ ] Test undo token hashing/validation.
- [ ] Test money formatting.
- [ ] Test date/countdown formatting.
- [ ] Test public/dashboard view model mappers.

Acceptance criteria:

- Core product rules have Vitest coverage.
- Public/private data leak checks covered by mapper tests.
- Quantity edge cases covered.

Affected areas:

- Colocated `*.test.ts` files
- `src/test/fixtures/*`

Notes/out-of-scope:

- No full E2E test suite in MVP.
- No visual regression tests in MVP.

### 8.2 Add shared test fixtures

Priority: P1

Details:

Use reusable fixtures for wishlist/gift/importer tests.

Tasks:

- [ ] Add `src/test/fixtures/wishlist-fixtures.ts`.
- [ ] Add `src/test/fixtures/gift-fixtures.ts`.
- [ ] Add `src/test/fixtures/importer-html-fixtures.ts`.

Acceptance criteria:

- Mapper and service tests can reuse fixtures.
- Fixtures cover available, partial, purchased, hidden, deleted gifts.

Affected areas:

- `src/test/fixtures/*`

Notes/out-of-scope:

- No test database required unless already supported by template.

### 8.3 Add PostHog events

Priority: P1

Details:

Track key product events.

Tasks:

- [ ] Track `wizard_started`.
- [ ] Track `wishlist_created`.
- [ ] Track `wishlist_published`.
- [ ] Track `gift_import_attempted`.
- [ ] Track `gift_import_succeeded`.
- [ ] Track `gift_import_failed`.
- [ ] Track `gift_added`.
- [ ] Track `public_wishlist_viewed`.
- [ ] Track `gift_marked_purchased`.
- [ ] Track `qr_downloaded`.
- [ ] Track `whatsapp_share_clicked`.

Acceptance criteria:

- Events fire in expected flows.
- Events avoid sensitive guest contact data.

Affected areas:

- `src/lib/analytics/*`
- Wizard components
- Public page components
- Dashboard share components

Notes/out-of-scope:

- No owner analytics dashboard.

### 8.4 Add Sentry coverage

Priority: P1

Details:

Capture key unexpected errors.

Tasks:

- [ ] Capture importer errors.
- [ ] Capture purchase mutation errors.
- [ ] Capture public page runtime errors.
- [ ] Capture publish errors.
- [ ] Avoid logging sensitive guest contact data.

Acceptance criteria:

- Key server failures are observable.
- Sensitive data is not sent intentionally.

Affected areas:

- Sentry config from template if present
- Services/mutations

Notes/out-of-scope:

- No custom Sentry dashboard setup required.

### 8.5 Add release QA checklist

Priority: P0

Details:

Manual launch checklist for critical flows.

Tasks:

- [ ] Verify create wizard from signed-out state.
- [ ] Verify save draft signed-in.
- [ ] Verify publish from wizard.
- [ ] Verify public page mobile layout.
- [ ] Verify guest purchase flow.
- [ ] Verify undo flow.
- [ ] Verify owner purchase drawer.
- [ ] Verify gift importer success/failure.
- [ ] Verify hidden/deleted gifts excluded publicly.
- [ ] Verify archived wishlist public state.
- [ ] Verify slug change warning.
- [ ] Verify QR download.
- [ ] Verify WhatsApp share.
- [ ] Verify privacy/terms links.
- [ ] Verify no public data leak.

Acceptance criteria:

- All P0 flows pass manually before launch.
- Known P1/P2 gaps are documented.

Affected areas:

- `docs/QA_CHECKLIST.md` optional, or section in release issue.

Notes/out-of-scope:

- No automated E2E required for MVP launch.

### Cut line

If scope gets tight, defer:

- PostHog event completeness.
- Sentry polish.
- Shared fixtures if colocated tests are enough.

Do not defer:

- Product logic tests for quantity/slug/public mapper.
- Rate-limit verification.
- Manual launch QA.
- Public/private data leak checks.
