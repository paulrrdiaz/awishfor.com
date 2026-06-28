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

The visual system is defined by the Claude Design brief (`Claude Design Output.md`,
canvas `A Wish For.dc.html`). Treat that brief as the source of truth for themes,
layouts, type, copy, and interaction behavior. Key brief-driven facts:

- **Seven** scoped public theme presets (adds `cielo-suave-rosa`, the niña variant).
- `serif-soft` default type system: **Lora** headings + **Inter** body via `next/font`.
- Public CSS variables are scoped to a `.public-theme` wrapper; the dashboard never sees them.
- Reusable presentational components live in `src/components/shared/` and ship with Storybook stories.

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

- [x] Add `WishlistStatus = draft | published | archived`.
- [x] Add `EventType = baby_shower | birthday | wedding | housewarming | general`.
- [x] Add `Locale = es | en`.
- [x] Add `Currency = PEN | USD | EUR | MXN | COP | CLP | ARS`.
- [x] Add `GiftPriority = low | medium | high`.
- [x] Add `GiftVisibilityStatus = available | hidden`.
- [x] Add `publishedAt` to Wishlist.
- [x] Add `archivedAt` to Wishlist.
- [x] Add lifecycle helpers for publish/archive/restore.

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

- [x] Add owner relation to `User`.
- [x] Add `title`.
- [x] Add globally unique `slug`.
- [x] Add `eventType`.
- [x] Add `language` default `es`.
- [x] Add `currency` default `PEN`.
- [x] Add `heroTitle`.
- [x] Add `welcomeMessage`.
- [x] Add `thankYouMessage`.
- [x] Add `displayName`.
- [x] Add `eventDate`.
- [x] Add `eventTime` as `HH:mm` string.
- [x] Add `eventLocation` as plain text.
- [x] Add `coverImageUrl`.
- [x] Add `themeId`.
- [x] Add `layoutId`.
- [x] Add `buttonStyle`.
- [x] Add `fontPairing`.
- [x] Add `showHowItWorks` default true.
- [x] Add `dressCode` optional plain text (powers the "Código de vestimenta" details card).

Acceptance criteria:

- Wishlist can store all public page content and design settings.
- Missing design values can fall back to presets.
- Event date/time/location are optional.
- Date can be in the past.
- Dress code is optional; details card hides when empty.

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

- [x] Add `Category` model.
- [x] Add `wishlistId` relation.
- [x] Add `name`.
- [x] Add `sortOrder`.
- [x] Add timestamps.
- [x] Add category service methods for add, rename, delete, reorder.
- [x] Deleting category sets assigned gifts to uncategorized.

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

- [x] Add `Gift` model.
- [x] Add wishlist relation.
- [x] Add optional category relation with `onDelete: SetNull`.
- [x] Add `name`.
- [x] Add optional `productUrl`.
- [x] Add optional `imageUrl`.
- [x] Add optional `storeName`.
- [x] Add optional `priceAmount Decimal(10,2)`.
- [x] Add optional `priceCurrency`.
- [x] Add `quantityNeeded Int @default(1)`.
- [x] Add `priority GiftPriority @default(medium)`.
- [x] Add `visibilityStatus GiftVisibilityStatus @default(available)`.
- [x] Add `publicNote`.
- [x] Add `internalNote`.
- [x] Add `sortOrder`.
- [x] Add `deletedAt`.
- [x] Add gift validation schema.

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

- [x] Add `Purchase` model.
- [x] Add gift relation with cascade.
- [x] Add `guestName` required.
- [x] Add optional `guestEmail`.
- [x] Add optional `guestPhone`.
- [x] Add optional `message`.
- [x] Add `quantity Int @default(1)`.
- [x] Add `undoTokenHash`.
- [x] Add `undoExpiresAt`.
- [x] Add purchase validation schema.
- [x] Add helper to calculate purchased quantity.
- [x] Add helper to calculate remaining quantity.
- [x] Add helper to derive public gift status.

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

- [x] Add slug validation helper.
- [x] Add slug suggestion helper from title.
- [x] Enforce lowercase letters, numbers, hyphens only.
- [x] Enforce length 3–60.
- [x] Reject start/end hyphen.
- [x] Add availability service.
- [x] Add `excludeWishlistId` support.
- [x] Add tRPC endpoint for availability checks.
- [x] Add tests.

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

- [x] Add publish readiness helper.
- [x] Validate title.
- [x] Validate event type.
- [x] Validate slug.
- [x] Validate language.
- [x] Validate currency.
- [x] Validate at least one visible non-deleted gift.
- [x] Return checklist-friendly result.
- [x] Add tests.

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

- [x] Add `src/server/mappers/public-wishlist.mapper.ts`.
- [x] Add `src/server/mappers/dashboard-wishlist.mapper.ts`.
- [x] Add `src/server/mappers/dashboard-gift.mapper.ts`.
- [x] Add public wishlist view model types.
- [x] Add public gift view model types.
- [x] Add dashboard card view model types.
- [x] Add dashboard gift row view model types.
- [x] Serialize Decimal to string.
- [x] Serialize Date to ISO string.
- [x] Exclude public-private data leaks.
- [x] Add mapper tests.

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

- [x] Add `src/lib/format/money.ts`.
- [x] Add `src/lib/format/dates.ts`.
- [x] Add `src/lib/format/strings.ts`.
- [x] Add `formatMoney`.
- [x] Add `formatEventDate`.
- [x] Add `formatRelativeDate`.
- [x] Add `formatStoreDomain`.
- [x] Add tests.

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

## Milestone 2 — Design system foundation & Storybook

### Goal

Establish the shared visual foundation the rest of the product builds on: app + public
design tokens aligned to the brief, the `serif-soft` font system, the scoped public-theme
provider with all seven presets, a `src/components/shared/` design-system layer, and a
Storybook for those shared components. This milestone front-loads the design system so
public, wizard, and dashboard UI consume a single source of truth.

### Dependencies

- Existing shadcn (`base-nova`) + Tailwind v4 setup (`src/styles/globals.css`, `components.json`).
- Milestone 1 view models (shared components consume view-model props).
- Claude Design brief (`Claude Design Output.md`) as the visual source of truth.

### 2.1 Align design tokens to the brief

Priority: P0

Details:

Reconcile the app theme tokens in `globals.css` with the brief's app palette and shape
language. Tokens largely exist — this is alignment, not a rebuild.

Tasks:

- [x] Align app `:root` tokens to warm near-white surface `#F7F8F1`, deep-navy ink, lime-chartreuse primary used sparingly.
- [x] Confirm `--radius` app scale (`1rem`) and shadow scale match the brief (low-contrast, 1px tinted borders).
- [x] Document the app-theme tokens that must stay untouched by public themes.
- [x] Verify dark-mode variants remain coherent after alignment.

Acceptance criteria:

- App chrome (dashboard/wizard) matches the brief's app theme.
- Lime primary appears on at most one important action per view by convention.
- Existing components render unchanged in structure after token alignment.

Affected areas:

- `src/styles/globals.css`

Notes/out-of-scope:

- No freeform color picker.
- No per-component color overrides.

### 2.2 Add the `serif-soft` font system

Priority: P0

Details:

Add Lora serif and the three shippable font pairings as tokens via `next/font`.

Tasks:

- [x] Load **Lora** via `next/font`; expose `--font-serif`.
- [x] Confirm **Inter** body via `--font-sans`.
- [x] Replace `--font-serif: Georgia, serif` in `globals.css` with the Lora token.
- [x] Add `src/config/public-fonts.ts` with `serif-soft` (default), `sans-modern`, `rounded-friendly` pairings.
- [x] Expose font pairing via a wrapper data-attribute, not per-element classes.

Acceptance criteria:

- Serif moments (names, section titles, gift names) render in Lora at 26–60px.
- Body/UI renders in Inter.
- Switching `fontPairing` changes the active pair with zero per-element changes.

Affected areas:

- `src/app/layout.tsx` (or font registration module)
- `src/styles/globals.css`
- `src/config/public-fonts.ts`

Notes/out-of-scope:

- Alternate pairings are font tokens only, not redesigns.

### 2.3 Add scoped public theme provider and presets

Priority: P0

Details:

Implement the seven theme presets and a provider that scopes their CSS vars to the public
page wrapper only.

Tasks:

- [x] Add `src/config/public-themes.ts` as typed `ThemePreset[]`.
- [x] Add all seven presets: `dulce-rosa`, `cielo-suave` (default ★), `cielo-suave-rosa`, `jardin-verde`, `crema-elegante`, `lavanda-fiesta`, `clasico-minimal`.
- [x] Add `PublicThemeProvider` that writes preset vars to a `.public-theme` wrapper as inline styles with `data-theme`.
- [x] Apply `--radius: 18px` public override on the wrapper.
- [x] Confirm Tailwind v4 `@theme inline` maps `--color-*` so semantic utilities resolve per theme.
- [x] Ensure dashboard `:root` theme is never affected by public vars.

Acceptance criteria:

- Public page switches palette by `data-theme` with zero per-theme class names.
- All seven themes render with brief-accurate bg/primary/accent.
- `cielo-suave` and `cielo-suave-rosa` read as a matching baby-shower set.
- Dashboard chrome is visually unchanged when public themes mount.

Affected areas:

- `src/config/public-themes.ts`
- `src/components/layouts/public-wishlist/public-theme-provider.tsx`
- `src/styles/globals.css`

Notes/out-of-scope:

- No square button style.
- No custom hex input.

### 2.4 Establish `src/components/shared/` and migrate reusable components

Priority: P1

Details:

Create the shared design-system layer and migrate reusable, presentational, theme-driven
components out of `features/`. Stateful/domain-coupled components stay in `features/`.

Tasks:

- [x] Create `src/components/shared/` and keep `@/components/shared/*` alias consistent with `components.json`.
- [x] Move presentational components into `shared/`: `gift-card`, `gift-grid`, `gift-list`, `countdown`, `how-it-works`, `progress-summary`, `wishlist-hero`, `wishlist-footer`.
- [x] Add new shared DS pieces from the brief inventory: `StatusBadge`, `PriorityBadge`, `MetricCard`, `EmptyState`, `SharePanel`, `StepProgress`.
- [x] Update import paths across public layouts, `src/app/w/[slug]/*`, wizard preview, and marketing demo.
- [x] Keep stateful/domain components in `features/`: `purchase-gift-modal`, `public-filters`, `gift-form`, `image-upload`, all `wizard/*` steps, all `dashboard/*` tables/drawers, importer UI.
- [x] Use `cn()` + `cva` for variant components (e.g. `GiftCard` status variants).

Acceptance criteria:

- Shared components are presentational and consume view-model/typed props only.
- No domain/data-fetching logic leaks into `shared/`.
- App builds and typechecks after the move.
- `GiftCard` exposes `available | partial | purchased | hidden` variants via `cva`.

Affected areas:

- `src/components/shared/*`
- `src/components/features/wishlist/*`
- `src/components/layouts/public-wishlist/*`
- `src/app/w/[slug]/*`

Notes/out-of-scope:

- Do not move stateful modals/forms into `shared/`.

### 2.5 Set up Storybook for shared components

Priority: P1

Details:

Stand up Storybook 9 with the Vite builder for the `shared/` design-system layer.

Tasks:

- [x] Install and configure **Storybook 9 + `@storybook/nextjs-vite`**.
- [x] Import `src/styles/globals.css` in `.storybook/preview` so Tailwind v4 tokens load.
- [x] Add a public-theme decorator/toolbar to preview components under each `data-theme`.
- [x] Add a11y and docs addons.
- [x] Add colocated `*.stories.tsx` for every `shared/` component, covering key variants/states.
- [x] Add `pnpm storybook` and `pnpm build-storybook` scripts.

Acceptance criteria:

- `pnpm storybook` boots and renders all `shared/` stories.
- `GiftCard` story shows available/partial/purchased/hidden variants.
- Theme toolbar switches stories across the seven presets.
- a11y addon reports on shared components.

Affected areas:

- `.storybook/*`
- `src/components/shared/**/*.stories.tsx`
- `package.json` scripts

Notes/out-of-scope:

- No visual regression / Chromatic in MVP.
- No stories for stateful `features/` components in this milestone.

### Cut line

If scope gets tight, defer:

- Storybook a11y/docs polish.
- Stories for lower-traffic shared components.
- Alternate font pairings beyond `serif-soft`.

Do not defer:

- Token alignment.
- Lora serif + `--font-serif`.
- Seven theme presets + scoped provider.
- `src/components/shared/` existence (downstream depends on it).

---

## Milestone 3 — Public wishlist foundation

### Goal

Render `/w/[slug]` correctly, safely, beautifully, and mobile-first before completing all owner flows.

### Dependencies

- Milestone 1 core models.
- Milestone 2 design system (themes, fonts, shared components).
- Public wishlist view model mapper.

### 3.1 Add public wishlist service

Priority: P0

Details:

Server service fetches wishlist by slug and enforces public route rules.

Tasks:

- [x] Add `src/server/services/public-wishlist.service.ts`.
- [x] Fetch wishlist by slug with categories, gifts, purchases.
- [x] Exclude soft-deleted gifts from calculations.
- [x] Apply draft/published/archived behavior.
- [x] Support owner draft preview.
- [x] Return public view model.
- [x] Return archived state when applicable.
- [x] Return not found for inaccessible draft.

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

### 3.2 Add public route and metadata behavior

Priority: P0

Details:

Create public route and SEO/noindex behavior.

Tasks:

- [x] Add `src/app/w/[slug]/page.tsx`.
- [x] Add metadata generation.
- [x] Add `noindex` for public wishlist pages.
- [x] Handle 404 state.
- [x] Handle archived state.
- [x] Handle owner preview banner.

Acceptance criteria:

- Public URL is `/w/[slug]`.
- Public wishlist pages are `noindex`.
- Marketing pages remain indexable.
- Archived page has correct message.
- Draft owner preview shows sticky top banner: "Vista previa — esta lista aún no está publicada." + bottom `Publicar wishlist`.
- Archived page shows: "Esta lista ya no está activa. El creador ha archivado esta wishlist." + `Crear mi wishlist`.

Affected areas:

- `src/app/w/[slug]/page.tsx`
- `src/app/w/[slug]/metadata` if split

Notes/out-of-scope:

- No locale prefix.

### 3.3 Add public theme and layout config

Priority: P0

Details:

Wire the public theme/layout/font/button presets (from Milestone 2) into the page.

Tasks:

- [x] Add `src/config/public-themes.ts`.
- [x] Add theme presets (now seven — see 2.3; add `cielo-suave-rosa`).
- [x] Add scoped Shadcn/Tailwind CSS variable support.
- [x] Add `src/config/public-layouts.ts`.
- [x] Add three layout presets.
- [x] Add `src/config/public-fonts.ts`.
- [x] Add font pairings using `next/font` (now Lora-based — see 2.2).
- [x] Add `src/config/public-button-styles.ts`.
- [x] Add button style presets.

Acceptance criteria:

- Public page can switch theme by `themeId` (all seven).
- Public page can switch layout by `layoutId`.
- Dashboard theme remains unaffected.
- Public components use scoped variables.

Affected areas:

- `src/config/*`
- `src/components/layouts/public-wishlist/*`

Notes/out-of-scope:

- No custom color picker.
- No square button style.

### 3.4 Add public layout components

Priority: P0

Details:

Create shared public wishlist page components and layout variants.

Tasks:

- [x] Add `PublicWishlistPage` shell.
- [x] Add `GridWishlistLayout`.
- [x] Add `EditorialWishlistLayout`.
- [x] Add `MinimalWishlistLayout`.
- [x] Add `WishlistHero`.
- [x] Add `Countdown`.
- [x] Add `GiftCard`.
- [x] Add `GiftGrid/GiftList`.
- [x] Add `HowItWorks`.
- [x] Add `WishlistFooter`.
- [x] Support `full | preview | compact` render modes.
- [x] Add event-details section: 3 cards (Fecha · Lugar · Código de vestimenta), hiding empty cards.
- [x] Add countdown states: `Faltan N días` · `Falta 1 día` · `Es hoy` · post-event "Gracias por celebrar con nosotros."
- [x] De-emphasize purchased gifts: ~60% opacity + line-through name, sorted below available.

Acceptance criteria:

- Public page renders all required sections in correct brief order (hero → details → countdown → welcome → gifts → how it works → thank-you → footer).
- Components support preview mode with disabled actions.
- Compact mode works for landing preview.
- Page is mobile-first (designed at 390px).
- Countdown recomputes client-side and flips to post-event message at T-0.

Affected areas:

- `src/components/layouts/public-wishlist/*`
- `src/components/shared/*` (migrated section components)

Notes/out-of-scope:

- No advanced animations required on the public page.

### 3.5 Add public gift filters and sorting

Priority: P0

Details:

Guests can filter and sort gifts.

Tasks:

- [x] Add filter state.
- [x] Add `Todos` filter.
- [x] Add `Disponibles` filter.
- [x] Add `Comprados` filter.
- [x] Add `Infaltables` filter.
- [x] Add category filters.
- [x] Add sort dropdown.
- [x] Add default recommended order.
- [x] Add empty filter states.
- [x] Render filter chips as a scroll-snap toggle group with `aria-pressed`; selected chip inverted (`bg-foreground text-background`).
- [x] Use exact empty-filter copy from brief §11.

Acceptance criteria:

- One active filter at a time.
- Category filters follow category sort order.
- Purchased gifts appear below available gifts by default.
- Sort options: Recomendados · Precio: menor a mayor · Precio: mayor a menor · Nombre: A–Z.
- Empty states show exact copy and a single corrective CTA that resets to `Todos`.

Affected areas:

- `src/components/features/wishlist/public-filters.tsx`
- `src/components/shared/gift-list.tsx`

Notes/out-of-scope:

- No multi-select filters.

### 3.6 Add public progress display

Priority: P0

Details:

Show quantity-based progress summary.

Tasks:

- [x] Add public progress component.
- [x] Show available gift count.
- [x] Show purchased units / total units.
- [x] Handle zero-state safely.
- [x] Reuse public view model progress.

Acceptance criteria:

- Example format: `8 disponibles · 7 de 16 unidades compradas`.
- Hidden/deleted gifts excluded.
- Partial purchases reflected correctly.

Affected areas:

- `src/components/shared/progress-summary.tsx`
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

## Milestone 4 — Wishlist creation wizard

### Goal

Build the unauthenticated-first creation flow with local drafts, event presets, design preview, gifts, auth gate, publish, and share success.

### Dependencies

- Milestone 1 models/validation.
- Milestone 2 design system.
- Milestone 3 public preview components.
- Existing Clerk auth from template.

### 4.1 Add event presets config

Priority: P0

Details:

Event type presets drive default categories, suggested copy, sample gifts, and default design.

Tasks:

- [x] Add `src/config/event-type-presets.ts`.
- [x] Add presets for baby shower, birthday, wedding, housewarming, general.
- [x] Add default categories.
- [x] Add default hero title template.
- [x] Add default welcome message.
- [x] Add default thank-you message.
- [x] Add sample gifts.
- [x] Add default theme/layout IDs.
- [x] Align default-by-event-type to brief: Baby Shower → Cielo Suave + Editorial; Birthday → Lavanda Fiesta + Galería; Wedding → Crema Elegante + Editorial; Housewarming → Jardín Verde + Lista Minimal; General → Clásico Minimal + Galería.

Acceptance criteria:

- Selecting event type seeds default content.
- Sample gifts render in preview before real gifts exist.
- Defaults can be regenerated manually.
- Seeded theme/layout match the brief's default-by-event-type table.

Affected areas:

- `src/config/event-type-presets.ts`
- `src/components/features/wizard/*`

Notes/out-of-scope:

- No AI copy generation.

### 4.2 Add wizard route and state structure

Priority: P0

Details:

Wizard lives at `/create` with query-param steps.

Tasks:

- [x] Add `/create` page.
- [x] Add step router using query params.
- [x] Add wizard state shape.
- [x] Add Zustand store.
- [x] Add localStorage persistence.
- [x] Add 30-day stale draft detection.
- [x] Add signed-out recovery prompt.
- [x] Add reset/start over behavior.

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

### 4.3 Add Event Type step

Priority: P0

Details:

User chooses event type and receives seeded defaults.

Tasks:

- [x] Add event type cards.
- [x] Apply default categories.
- [x] Apply default design.
- [x] Apply default copy if fields untouched.
- [x] Track `copyTouched` local-only.
- [x] Add Spanish labels.

Acceptance criteria:

- Changing event type does not overwrite user-edited copy.
- Untouched copy can update from presets.
- User can regenerate suggested copy manually.

Affected areas:

- `src/components/features/wizard/event-type-step.tsx`
- `src/stores/wishlist-wizard.store.ts`

Notes/out-of-scope:

- No custom event type in MVP.

### 4.4 Add Event Details + slug step

Priority: P0

Details:

User enters title, display/event details, and public slug.

Tasks:

- [x] Add title field.
- [x] Add display name field.
- [x] Add event date picker with Shadcn Calendar + Popover.
- [x] Add time input/select normalized to `HH:mm`.
- [x] Add location text field.
- [x] Add slug auto-generation from title.
- [x] Add editable slug field.
- [x] Add `use-debounce` slug availability check.
- [x] Add Checking/Available/Taken/Invalid states.
- [x] Add past date warning.
- [x] Add optional dress-code ("Código de vestimenta") field.
- [x] Use exact slug-state copy: `◌ Verificando…` · `✓ Disponible` (green ring) · `✕ Ya está en uso` · `✕ Solo letras, números y guiones`.
- [x] Use exact past-date copy: "Esta fecha ya pasó. Puedes continuar, pero el contador mostrará un mensaje de cierre."

Acceptance criteria:

- Slug validates client-side and server-side, debounced ~350ms.
- Slug is checked before save/publish.
- Past dates allowed with warning.
- Event date/time/location/dress-code optional.

Affected areas:

- `src/components/features/wizard/details-step.tsx`
- `src/lib/slug.ts`
- `src/server/api/routers/wishlist.ts`

Notes/out-of-scope:

- No map autocomplete.

### 4.5 Add Design & Preview step

Priority: P0

Details:

User picks theme/layout/font/button style and sees embedded preview.

Tasks:

- [x] Add theme preview cards.
- [x] Add layout preview cards.
- [x] Add font pairing selector.
- [x] Add button style selector.
- [x] Add cover image upload hook placeholder/integration with UploadThing milestone if needed.
- [x] Add embedded public preview.
- [x] Use sample gifts before real gifts exist.
- [x] Disable purchase actions in preview mode.
- [x] Label the embedded preview "Vista previa con ejemplos".
- [x] Show all seven theme swatches including `cielo-suave-rosa`.

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

### 4.6 Add Gifts step

Priority: P0

Details:

User adds gifts manually or via URL importer.

Tasks:

- [x] Add gift list editor.
- [x] Add manual gift form.
- [x] Add URL import entry point.
- [x] Add category assignment.
- [x] Add quantity field.
- [x] Add priority field.
- [x] Add public note/internal note.
- [x] Add hide gift toggle.
- [x] Add local draft gift handling before DB save.

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

### 4.7 Add authenticated save draft

Priority: P0

Details:

Authenticated users can persist local wizard draft to DB manually.

Tasks:

- [x] Add `Guardar borrador` action.
- [x] Add save draft mutation.
- [x] Create DB draft on first save.
- [x] Update same DB draft on subsequent saves.
- [x] Store `savedWishlistId` and `lastSavedAt` locally.
- [x] Show Sonner toast.
- [x] Add `Ver en dashboard` link.
- [x] Add signed-in draft conflict handling.

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

### 4.8 Add Final Preview, Auth Gate, Publish & Share step

Priority: P0

Details:

Final step validates, gates auth, publishes, and shows share state.

Tasks:

- [x] Add final embedded preview.
- [x] Add full page preview button.
- [x] Add publish readiness checklist.
- [x] Add auth gate if unauthenticated.
- [x] Add publish mutation.
- [x] Add publish success state.
- [x] Add copy link action.
- [x] Add WhatsApp share action.
- [x] Add QR download action.
- [x] Clear local draft after successful publish.
- [x] Label the final preview "Vista previa de tu wishlist"; auth gate copy "tu progreso ya está guardado".
- [x] Publish success copy + actions: Copiar enlace · Compartir por WhatsApp · Descargar QR · Ver lista pública · Gestionar en dashboard.

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

## Milestone 5 — Gift management & importer

### Goal

Make gift creation/editing powerful in dashboard and wizard, including URL import, image upload, category management, ordering, and purchase drawer.

### Dependencies

- Gift model and service.
- Category model and service.
- Milestone 2 shared gift components.
- UploadThing product dependency.

### 5.1 Add URL importer service

Priority: P0

Details:

Server-side metadata importer with manual fallback.

Tasks:

- [x] Add `src/server/services/importer.service.ts`.
- [x] Add URL safety validation.
- [x] Block private/internal URLs.
- [x] Add timeout with AbortController.
- [x] Limit redirects to 5.
- [x] Limit HTML size to 2MB.
- [x] Validate final URL after redirects.
- [x] Parse JSON-LD Product.
- [x] Parse Open Graph.
- [x] Parse Twitter Card.
- [x] Parse HTML title.
- [x] Add domain fallback.
- [x] Return `ImportedGiftDraft`.
- [x] Add importer tests.

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

### 5.2 Add URL cleanup and store display mapping

Priority: P0

Details:

Clean URLs and display friendly store names.

Tasks:

- [x] Add tracking param cleanup helper.
- [x] Strip known UTM/click IDs.
- [x] Preserve unknown params.
- [x] Add `src/config/store-display-names.ts`.
- [x] Add Peru/LatAm store mappings.
- [x] Add international store mappings.
- [x] Add clean domain fallback.
- [x] Add tests.

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

### 5.3 Add image upload support

Priority: P0

Details:

Support cover image and gift image upload using UploadThing.

Tasks:

- [x] Add UploadThing routes/config.
- [x] Add cover image upload.
- [x] Add cover image remove.
- [x] Add gift image upload.
- [x] Add gift image replacement.
- [x] Add gift image remove.
- [x] Validate file types JPG/PNG/WEBP.
- [x] Validate cover max 4MB.
- [x] Validate gift max 4MB.

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

### 5.4 Add dashboard gift management table/list

Priority: P0

Details:

Owner manages all gifts from dashboard with filters, status badges, and edit/delete actions.

Tasks:

- [x] Add dashboard gifts page.
- [x] Add gift row view model usage.
- [x] Add available/partial group.
- [x] Add purchased group.
- [x] Add hidden group.
- [x] Add status badges (reuse `shared/StatusBadge`).
- [x] Add quantity progress per gift.
- [x] Add edit action.
- [x] Add hide/unhide action.
- [x] Add soft delete action.
- [x] Add delete confirmation.

Acceptance criteria:

- Dashboard shows available, purchased, and hidden gifts.
- Hidden gifts are shown with `Oculto` badge in dashboard.
- Soft-deleted gifts disappear from dashboard.
- Gift with purchases shows stronger delete warning.

Affected areas:

- `src/app/(protected)/dashboard/wishlists/[id]/gifts/page.tsx`
- `src/components/features/dashboard/gifts/*`

Notes/out-of-scope:

- No restore UI for deleted gifts.

### 5.5 Add drag-and-drop gift ordering

Priority: P1

Details:

Owner can reorder gifts using drag-and-drop.

Tasks:

- [x] Add `@dnd-kit` integration.
- [x] Add reorder mutation.
- [x] Persist shared `sortOrder` per gift.
- [x] Support all non-deleted gifts.
- [x] Preserve public grouping behavior.

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

### 5.6 Add category management UI

Priority: P1

Details:

Owner can manage categories in dashboard; wizard remains lightweight.

Tasks:

- [x] Add dashboard category management panel.
- [x] Add category add.
- [x] Add category rename.
- [x] Add category delete.
- [x] Add category reorder.
- [x] Show gift counts.
- [x] Add wizard lightweight category assignment/editing.

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

### 5.7 Add purchase drawer for owner

Priority: P0

Details:

Owner views and manages purchase records at gift level.

Tasks:

- [x] Add gift purchase drawer.
- [x] Show purchase records.
- [x] Show guest name.
- [x] Show optional email/phone/message.
- [x] Show quantity.
- [x] Add owner manual purchase form.
- [x] Add owner delete purchase action.
- [x] Add confirmation dialog.
- [x] Add owner undo toast for manual purchase.

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

## Milestone 6 — Guest purchase flow

### Goal

Complete the public conversion action: guests can mark gifts as purchased safely, with quantity, consent, success state, undo, progress updates, and rate limiting.

### Dependencies

- Public wishlist page.
- Purchase model/service.
- Gift quantity logic.
- Upstash Redis.

### 6.1 Add public purchase mutation

Priority: P0

Details:

Public mutation lets guests mark gifts as purchased without auth.

Tasks:

- [x] Add `purchase.markGiftPurchased` public mutation.
- [x] Validate gift belongs to published wishlist.
- [x] Validate gift is not hidden.
- [x] Validate gift is not soft-deleted.
- [x] Validate quantity remaining.
- [x] Create purchase record.
- [x] Generate raw undo token.
- [x] Hash undo token.
- [x] Set undo expiry to 60 seconds.
- [x] Return success payload and raw undo token once.

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

### 6.2 Add public purchase modal

Priority: P0

Details:

Guest enters name, optional contact/message, quantity, and consent.

Tasks:

- [x] Add `PurchaseGiftModal`.
- [x] Add required name field.
- [x] Add optional email field.
- [x] Add optional phone field.
- [x] Add optional message field.
- [x] Add quantity selector if remaining > 1.
- [x] Add consent copy.
- [x] Add loading/error states.
- [x] Disable product link for purchased gifts.
- [x] Render as bottom sheet on mobile, centered dialog ≥ md; sticky 48px footer actions.
- [x] Use exact consent copy: "Al marcar este regalo como comprado, compartiremos tu nombre y los datos opcionales que ingreses con el creador de la lista."

Acceptance criteria:

- Name is required, 2–80 chars.
- Email validates if present.
- Phone validates if present.
- Message max 500 chars.
- Quantity min 1 and max remaining; selector only renders when remaining > 1.
- Consent copy visible.

Affected areas:

- `src/components/features/wishlist/purchase-gift-modal.tsx`
- `src/components/shared/gift-card.tsx`

Notes/out-of-scope:

- No CAPTCHA unless abuse appears.

### 6.3 Add success and undo flow

Priority: P0

Details:

Guest sees thank-you state and can undo briefly.

Tasks:

- [x] Add success state copy: "¡Gracias, {nombre}! Tu regalo fue marcado como comprado. Gracias por tu cariño y por ser parte de este momento."
- [x] Add `Deshacer` action with live 8s countdown.
- [x] Add `Cerrar` action.
- [x] Add `purchase.undoRecentPurchase` mutation.
- [x] Validate token hash.
- [x] Validate token expiry.
- [x] Delete purchase record on valid undo.
- [x] Update UI after undo.
- [x] Show "el tiempo para deshacer expiró" on expiry.

Acceptance criteria:

- Guest can undo within the undo window.
- Expired/invalid token fails safely.
- Undo deletes only the just-created purchase.
- Public progress updates after undo.

Affected areas:

- `src/server/services/purchase.service.ts`
- `src/server/api/routers/purchase.ts`
- `src/components/features/wishlist/purchase-gift-modal.tsx`

Notes/out-of-scope:

- Undo is not available across devices/browsers.

### 6.4 Add public progress refresh behavior

Priority: P0

Details:

After purchase/undo, public gift status and progress should reflect changes.

Tasks:

- [x] Refresh public data after purchase.
- [x] Refresh public data after undo.
- [x] Update gift card quantity progress.
- [x] Move fully purchased gifts into purchased group.
- [x] Remove CTAs from purchased gift.

Acceptance criteria:

- Gift transitions from available/partial to purchased when quantity complete.
- Purchased gifts move below available gifts.
- Progress summary updates.

Affected areas:

- Public wishlist components
- tRPC utils/cache invalidation

Notes/out-of-scope:

- No realtime updates between different guests.

### 6.5 Add rate limiting

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

## Milestone 7 — Owner dashboard

### Goal

Allow owners to manage existing wishlists, view progress, publish readiness, share, design, settings, archive, and restore.

### Dependencies

- Product models/services.
- Milestone 2 shared components (MetricCard, SharePanel, PublishChecklist, etc.).
- Dashboard shell from template.

### 7.1 Add dashboard wishlist list

Priority: P0

Details:

Owner sees wishlists as cards with status/progress and filters.

Tasks:

- [x] Add wishlist list page.
- [x] Add card grid.
- [x] Add dashboard wishlist card view model.
- [x] Add Activas filter.
- [x] Add Borradores filter.
- [x] Add Publicadas filter.
- [x] Add Archivadas filter.
- [x] Add empty states.

Acceptance criteria:

- Owner sees their wishlists only.
- Archived hidden from default list.
- Empty state CTA goes to `/create` with copy: "Aún no tienes wishlists / Crea tu primera wishlist…".

Affected areas:

- `src/app/(protected)/dashboard/wishlists/page.tsx`
- `src/components/features/dashboard/wishlist-card.tsx`
- `src/server/mappers/dashboard-wishlist.mapper.ts`

Notes/out-of-scope:

- No search in MVP.

### 7.2 Add wishlist overview page

Priority: P0

Details:

Overview shows metrics, link, sharing, readiness, and recent purchases.

Tasks:

- [x] Add overview page.
- [x] Add 4 metric cards (Regalos totales · Disponibles · Comprados · Progreso de compras with bar).
- [x] Add public link section.
- [x] Add copy link action.
- [x] Add WhatsApp share action.
- [x] Add QR download action.
- [x] Add recent purchases section (avatar + buyer + gift + relative time + status badge).
- [x] Add publish readiness checklist.
- [x] Add publish action.

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

### 7.3 Add dashboard navigation

Priority: P0

Details:

Wishlist detail pages use tabs/dropdown navigation.

Tasks:

- [x] Add wishlist detail layout.
- [x] Add desktop/tablet tabs.
- [x] Add mobile select/dropdown (< md).
- [x] Add nav items: Resumen, Regalos, Diseño, Configuración.

Acceptance criteria:

- Navigation works on desktop and mobile.
- Active section clearly indicated.
- Tabs collapse to a `Select` below md.

Affected areas:

- `src/app/(protected)/dashboard/wishlists/[id]/layout.tsx`
- `src/components/layouts/dashboard/*`

Notes/out-of-scope:

- No breadcrumbs required unless already in template.

### 7.4 Add dashboard design page

Priority: P1

Details:

Owner can update design after wishlist creation.

Tasks:

- [x] Add design page.
- [x] Add theme selector (all seven themes).
- [x] Add layout selector.
- [x] Add font selector.
- [x] Add button style selector.
- [x] Add cover image upload/remove.
- [x] Add embedded preview.
- [x] Save design changes.

Acceptance criteria:

- Owner can update public design.
- Preview reflects changes.
- Public page uses updated design.

Affected areas:

- `src/app/(protected)/dashboard/wishlists/[id]/design/page.tsx`
- `src/components/features/dashboard/design/*`

Notes/out-of-scope:

- No freeform custom colors.

### 7.5 Add dashboard settings page

Priority: P0

Details:

Owner can edit core wishlist content/settings and archive/restore.

Tasks:

- [x] Add settings page.
- [x] Edit title.
- [x] Edit slug.
- [x] Edit event details (incl. dress code).
- [x] Edit hero/welcome/thank-you copy.
- [x] Edit language/currency.
- [x] Toggle How it works.
- [x] Add slug change warning for published wishlists.
- [x] Add archive action.
- [x] Add restore dialog for archived wishlist.

Acceptance criteria:

- Owner can edit core settings.
- Published slug change shows QR/link warning with exact brief copy.
- Archive makes public page inactive.
- Restore dialog offers `Restaurar publicada` / `Restaurar como borrador`.

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

## Milestone 8 — Marketing, legal, and sharing polish

### Goal

Make the app launch-ready publicly with a rich light-green landing page, legal pages, demo preview, footer/report links, QR, WhatsApp templates, and Spanish copy polish.

### Dependencies

- Milestone 2 + 3 public/shared components.
- QR package.
- WhatsApp templates.

### 8.1 Add marketing landing page

Priority: P0

Details:

Landing page (fresh light-green theme) explains the product and drives users to `/create`.
Implemented faithfully from the Claude Design canvas (`A Wish For.dc.html` §5,
"Marketing / landing · desktop · light green theme"). Source-of-truth palette (canvas
`.mkt` tokens): bg `#EEF9E6`, forest-green ink `#173E29`, sage muted `#4E6E56`, hairline
`#CCE8BE`, lime pop `#BCE25A`, sunshine accent `#F4C84A`. Deep-green serif (Lora) headlines,
lime primary buttons. Tokens scoped to a `.marketing-theme` wrapper — they never touch the
app `:root` or the seven public wishlist themes. Animations use **GSAP + ScrollTrigger**
(scroll reveals, floating blobs/emoji, hero bob, headline shimmer, partner marquee, mesh
gradient, pulse dot, slow spin, button glow), all gated by `prefers-reduced-motion`. Brand
logo (`public/assets/awishfor-logo.svg`) used in nav (and footer, inverted on the dark band).

Tasks:

- [x] Add hero section (split: serif shimmer headline + CTAs + stats left, bobbing public-page card right).
- [x] Add ¿Por qué A Wish For? benefits row (4 cards: todo en un lugar · gratis sin comisiones · enlace/QR · listas sugeridas).
- [x] Add Cómo funciona section (3 numbered cards).
- [x] Add Casos de uso section (5 event pills).
- [x] Add Tiendas aliadas partner-logo strip (GSAP marquee + "y cualquier tienda con enlace").
- [x] Add theme previews section (gradient swatches for the seven themes).
- [x] Add example public wishlist preview (real `PublicWishlistPage` in compact mode).
- [x] Add final CTA section (dark-green band).
- [x] Add minimal nav (uses logo asset).
- [x] Add GSAP animation engine scoped to the marketing route, with reduced-motion fallback.
- [x] Add guest list-finder + FAQ sections (folded in from 8.2 since the canvas includes them).

Acceptance criteria:

- CTA `Crear mi wishlist` links to `/create`.
- Secondary CTA `Ver ejemplo` links to the example block.
- Signed-out nav shows Iniciar sesión + Crear mi wishlist.
- Signed-in nav shows Dashboard + Crear mi wishlist (server-side `auth()`; this Clerk v7 build does not export `<SignedIn>/<SignedOut>`).
- Example block reuses the real public components (single source of truth).
- All animations off and content fully visible under `prefers-reduced-motion` / no-JS.
- `.marketing-theme` tokens do not leak into app or public themes.

Affected areas:

- `src/app/(marketing)/layout.tsx`, `src/app/(marketing)/page.tsx`
- `src/components/layouts/marketing/*`
- `src/components/layouts/marketing/marketing-shell.tsx`, `src/lib/gsap/use-marketing-animations.ts`
- `src/config/demo-wishlist.ts`
- `src/styles/marketing.css`, `src/app/layout.tsx` (JetBrains Mono font)

Notes/out-of-scope:

- No pricing.
- No testimonials.
- Guest-finder search + FAQ accordion are visual (FAQ uses native `<details>`); wiring search is part of 8.2.
- Desktop-first; mobile stacking is best-effort (responsive polish is a follow-up).

### 8.2 Add guest list-finder and FAQ

Priority: P1

Details:

Discovery + trust sections adapted from the LatAm category leader, re-expressed in A Wish
For's softer editorial language.

Tasks:

- [x] Add guest list-finder section ("¿Buscas la lista de alguien?" — search by name/link).
- [x] Wire finder to slug/name lookup behavior.
- [x] Add FAQ accordion (Base UI `Collapsible`).

Acceptance criteria:

- Guest can search for a friend's list by name or link.
- FAQ expands/collapses accessibly with rotating chevron.

Affected areas:

- `src/components/layouts/marketing/*`
- `src/server/api/routers/wishlist.ts` (lookup, if needed)

Notes/out-of-scope:

- No full search index.

### 8.3 Add landing animations (reduced-motion safe)

Priority: P1

Details:

Subtle celebratory motion, fully static under `prefers-reduced-motion: reduce`.

Tasks:

- [x] Add `useInView()` hook to fire reveals once on enter (implemented via GSAP ScrollTrigger).
- [x] Add hero mesh-gradient drift + blurred blobs + floating emoji.
- [x] Add staggered `rise` entrance + "hermosa" shimmer sweep.
- [x] Add hero card `bob` + pulsing status dot.
- [ ] Add stats count-up via IntersectionObserver.
- [x] Add allied-stores infinite marquee (edge-masked, pause on hover).
- [x] Add card fade-up stagger + hover lift.
- [x] Add button hover scale + arrow nudge.
- [x] Keep all `@keyframes` in `globals.css`, every animated rule inside the reduced-motion guard (implemented via GSAP with `prefers-reduced-motion` guard).

Acceptance criteria:

- Animations run only when motion is allowed.
- Page is fully static for `prefers-reduced-motion: reduce`.
- No layout shift from animations.

Affected areas:

- `src/styles/globals.css`
- `src/hooks/use-in-view.ts`
- `src/components/layouts/marketing/*`

Notes/out-of-scope:

- No JS animation library.

### 8.4 Add demo wishlist config

Priority: P1

Details:

Landing page uses public wishlist components with sample data.

Tasks:

- [x] Add `src/config/demo-wishlist.ts`.
- [x] Add compact public wishlist view model sample.
- [x] Render using compact mode (Crema Elegante in brief).
- [x] Ensure actions disabled.

Acceptance criteria:

- Landing preview looks like a real public wishlist.
- Demo does not mutate anything.

Affected areas:

- `src/config/demo-wishlist.ts`
- Public wishlist components

Notes/out-of-scope:

- No separate screenshot carousel.

### 8.5 Add QR download

Priority: P0

Details:

Owners can download PNG QR for current public URL.

Tasks:

- [x] Add QR generation helper using `qrcode`.
- [x] Generate QR from current public URL.
- [x] Add download PNG action.
- [x] Use in publish success step.
- [x] Use in dashboard share panel.

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

### 8.6 Add WhatsApp share templates

Priority: P0

Details:

Share messages vary by event type.

Tasks:

- [x] Add WhatsApp template helper.
- [x] Add baby shower template.
- [x] Add birthday template.
- [x] Add wedding template.
- [x] Add housewarming template.
- [x] Add general template.
- [x] URL-encode message correctly.

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

### 8.7 Add legal pages and footer links

Priority: P0

Details:

Add minimal legal pages and report link.

Tasks:

- [x] Add `/privacy`.
- [x] Add `/terms`.
- [x] Mention Clerk, PostHog, Sentry, UploadThing, Neon.
- [x] Mention guest purchase/contact data.
- [x] Add public footer links ("Hecho con cariño en A Wish For").
- [x] Add report mailto link.
- [x] Add support email `hola@awishfor.com`.

Acceptance criteria:

- Privacy and terms pages exist.
- Footer links work.
- Report list opens email draft.
- Guest consent copy is present in purchase modal.

Affected areas:

- `src/app/(marketing)/privacy/page.tsx`
- `src/app/(marketing)/terms/page.tsx`
- `src/components/shared/wishlist-footer.tsx`

Notes/out-of-scope:

- No cookie banner unless ads/retargeting added.

### Cut line

If scope gets tight, defer:

- Guest list-finder + FAQ.
- Landing animations.
- Demo preview polish.
- Theme preview section detail.

Do not defer:

- Landing hero/CTA.
- QR download.
- WhatsApp share.
- Privacy/terms.
- Footer/report links.

---

## Milestone 9 — Observability, tests, and release hardening

### Goal

Add confidence before launch with product logic tests, analytics, error monitoring, rate-limit verification, and final QA.

### Dependencies

- Main product flows implemented.
- Vitest from template.
- PostHog/Sentry if enabled.

### 9.1 Add product logic tests

Priority: P0

Details:

Test business logic and pure helpers first.

Tasks:

- [x] Test slug validation and suggestions.
- [x] Test URL safety validation.
- [x] Test URL cleanup/tracking removal.
- [x] Test store display-name detection.
- [x] Test importer metadata parsing.
- [x] Test gift progress calculation.
- [x] Test public status derivation.
- [x] Test publish readiness validation.
- [x] Test purchase quantity validation.
- [x] Test undo token hashing/validation.
- [x] Test money formatting.
- [x] Test date/countdown formatting.
- [x] Test public/dashboard view model mappers.

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

### 9.2 Add shared test fixtures

Priority: P1

Details:

Use reusable fixtures for wishlist/gift/importer tests.

Tasks:

- [ ] Add `src/test/fixtures/wishlist-fixtures.ts`.
- [ ] Add `src/test/fixtures/gift-fixtures.ts`.
- [x] Add `src/test/fixtures/importer-html-fixtures.ts`.

Acceptance criteria:

- Mapper and service tests can reuse fixtures.
- Fixtures cover available, partial, purchased, hidden, deleted gifts.

Affected areas:

- `src/test/fixtures/*`

Notes/out-of-scope:

- No test database required unless already supported by template.

### 9.3 Add PostHog events

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

### 9.4 Add Sentry coverage

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

### 9.5 Add release QA checklist

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
- [ ] Verify all seven themes render correctly via `data-theme`.
- [ ] Verify reduced-motion disables landing animations.

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
