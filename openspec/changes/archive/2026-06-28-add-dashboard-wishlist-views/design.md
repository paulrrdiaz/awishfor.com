## Context

The dashboard already has a sidebar (`AppSidebar`) fed by `wishlist.list` (returns `{id, title, status, eventType}`, excludes archived, ordered by `createdAt desc`). Each sidebar item links to `/dashboard/wishlists/[id]/gifts`. The wishlist root (`/dashboard/wishlists/[id]`) and the list root (`/dashboard/wishlists`) have no `page.tsx`.

Reusable building blocks already exist:
- `mapDashboardWishlist` + `DashboardWishlistCardViewModel` (heavy; includes full `gifts[]` with per-gift `purchasedQuantity`/`remainingQuantity`/`quantityNeeded`).
- `evaluatePublishReadiness(input)` → `{ ready, checks }` over title/eventType/slug/language/currency/visibleGift.
- `wishlist.publish` mutation (throws `PRECONDITION_FAILED` when not ready).
- `SharePanel` component (copy / WhatsApp / QR buttons) + `toCanonicalWishlistUrl`, `toWhatsAppShareUrl`, `downloadQrCodePng`.
- `mapOwnerPurchaseRecord` + `OwnerPurchaseRecordViewModel`; `purchase.listForGift` (per-gift only).
- `formatRelativeDate` (`src/lib/format/dates.ts`), money formatters.

Gaps: no owner-scoped wishlist summary that includes archived + aggregate counts; no wishlist-level recent-purchases query; no overview view-model.

## Goals / Non-Goals

**Goals:**
- A `/dashboard/wishlists` card grid scoped to the signed-in owner with status filters and empty states.
- A `/dashboard/wishlists/[id]` overview with metrics, share, recent purchases, readiness checklist, and publish.
- Quantity-based progress everywhere (units, not gift counts), matching the public progress model.
- Reuse existing readiness/publish/share/QR primitives rather than re-implementing.

**Non-Goals:**
- Wishlist search, sorting beyond the default, pagination.
- Full analytics (charts, time series, conversion).
- Dashboard navigation/design/settings pages (7.3–7.5).
- New DB tables or columns.

## Decisions

### 1. Server data shapes

Add two view-models in `view-models.ts`:

- `DashboardWishlistSummaryViewModel` — lightweight card data: `id, slug, title, eventType, status, eventDate, coverImageUrl, totalUnits, purchasedUnits, availableGiftCount, totalGiftCount, createdAt`. Derived by aggregating visible, non-deleted gifts. Avoids shipping the full `gifts[]` array to the list page.
- `DashboardWishlistOverviewViewModel` — `id, slug, title, status, publicUrl, whatsAppUrl, metrics { totalGifts, availableGifts, purchasedGifts, totalUnits, purchasedUnits }, readiness { ready, checks }, recentPurchases: RecentPurchaseViewModel[]` where `RecentPurchaseViewModel = { id, guestName, giftId, giftName, quantity, status, createdAt }`.

Add mapper functions `mapDashboardWishlistSummary` and `mapDashboardWishlistOverview` in `dashboard-wishlist.mapper.ts`, computing unit/gift aggregates from the same `isVisibleAndNotDeleted` rule already used by `mapDashboardWishlist`. Progress = `purchasedUnits / totalUnits` (0 when no units), mirroring `PublicWishlistProgress`.

### 2. tRPC procedures (all `protectedProcedure`, owner-scoped via `getLocalUserId`)

- `wishlist.summaryList` — returns `DashboardWishlistSummaryViewModel[]` for the owner, **including archived** (the list page filters client-side so all four tabs work without refetch), ordered `createdAt desc`. Selects gifts with their purchases to compute aggregates. Leaves the existing `wishlist.list` untouched (sidebar keeps its minimal, archived-excluded query).
- `wishlist.overview` — input `{ wishlistId }`; loads the owner's wishlist with gifts+purchases, returns `DashboardWishlistOverviewViewModel` or throws `NOT_FOUND` if not owned. Recent purchases = latest 5 across the wishlist's gifts, ordered `createdAt desc`, joined to gift name; `status` distinguishes confirmed vs. pending/manual using the existing purchase fields.

Ownership is enforced by filtering on `ownerId` in the query `where` (same pattern as `wishlist.list` / `getOwnedGift`), so a non-owner gets `NOT_FOUND`.

### 3. List page (7.1)

- `src/app/(protected)/dashboard/wishlists/page.tsx` (RSC) fetches `api.wishlist.summaryList()` and renders a client wrapper holding the active filter tab.
- Filters map to status: **Activas** = `draft` + `published` (everything not archived), **Borradores** = `draft`, **Publicadas** = `published`, **Archivadas** = `archived`. Default tab = Activas, so archived is hidden by default (acceptance criterion).
- `wishlist-card.tsx`: title, event-type label, status badge, quantity-based progress bar + counts; links to `/dashboard/wishlists/[id]` (overview).
- Empty states: global empty (no wishlists at all) → CTA card linking to `/create` with copy "Aún no tienes wishlists / Crea tu primera wishlist…". Per-filter empty (e.g. no archived) → lighter inline message.

### 4. Overview page (7.2)

- `src/app/(protected)/dashboard/wishlists/[id]/page.tsx` (RSC) fetches `api.wishlist.overview({ id })`; `notFound()` on throw (same pattern as the gifts page).
- `overview/` components: `metric-cards.tsx` (4 cards; the 4th is the progress card with bar), `overview-share.tsx` (client; wraps `SharePanel`, wires `navigator.clipboard` copy + toast and `downloadQrCodePng`), `recent-purchases.tsx` (avatar from initials, buyer, gift name, `formatRelativeDate`, status badge; empty state when none), `publish-readiness-checklist.tsx` (renders `readiness.checks`), `publish-button.tsx` (client; calls `api.wishlist.publish`, disabled unless `readiness.ready`, surfaces `PRECONDITION_FAILED`).
- Share section is only meaningful once published; show the readiness checklist + publish action prominently while `status === "draft"`, and the share panel once `published`. Public URL via `toCanonicalWishlistUrl(`/w/${slug}`)` (confirm the public path segment against the existing public route during apply).

## Risks / Trade-offs

- **Aggregate cost**: `summaryList` loads gifts+purchases for every wishlist to compute units. Acceptable at MVP scale (few wishlists per owner); a denormalized counter can come later if needed.
- **Public URL path**: `share.ts` builds URLs from a path passed in; the exact public segment (`/w/[slug]` vs `/[slug]`) must be read from the live public route during apply to avoid a wrong link.
- **Purchase "status" semantics**: the badge (confirmed vs pending) depends on which `Purchase` fields encode state; verify against `purchase.service` during apply rather than assuming.
- **Client-side filtering** ships archived rows to the browser. Fine for MVP; revisit if a single owner accumulates many wishlists.
