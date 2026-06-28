## 1. Server data (view-models, mappers, tRPC)

- [x] 1.1 Add `DashboardWishlistSummaryViewModel`, `DashboardWishlistOverviewViewModel`, and `RecentPurchaseViewModel` to `src/server/mappers/view-models.ts`.
- [x] 1.2 Add `mapDashboardWishlistSummary` and `mapDashboardWishlistOverview` to `src/server/mappers/dashboard-wishlist.mapper.ts`, computing quantity-based unit aggregates and gift counts from visible, non-deleted gifts (reuse `isVisibleAndNotDeleted`).
- [x] 1.3 Add `wishlist.summaryList` (`protectedProcedure`) returning owner's wishlists including archived, ordered `createdAt desc`, with gift+purchase aggregates.
- [x] 1.4 Add `wishlist.overview` (`protectedProcedure`, input `{ wishlistId }`) returning the overview view-model with metrics, `evaluatePublishReadiness` result, public/WhatsApp URLs, and latest 5 purchases joined to gift name; throw `NOT_FOUND` when not owned.
- [x] 1.5 Add a wishlist-scoped recent-purchases helper in `purchase.service`/`purchase` router as needed for task 1.4 (latest 5 across the wishlist's gifts, newest first, with status).
- [x] 1.6 Add/extend mapper unit tests in `src/server/mappers/dashboard-wishlist.mapper.test.ts` for the new summary and overview aggregates (zero-units, partial, fully purchased).

## 2. Dashboard wishlist list page (7.1)

- [x] 2.1 Add `src/app/(protected)/dashboard/wishlists/page.tsx` (RSC) fetching `api.wishlist.summaryList()`.
- [x] 2.2 Add `src/components/features/dashboard/wishlist-card.tsx` showing title, event-type label, status badge, and quantity-based progress bar + counts; links to `/dashboard/wishlists/[id]`.
- [x] 2.3 Add a client card-grid wrapper with status filter tabs: Activas (non-archived), Borradores (`draft`), Publicadas (`published`), Archivadas (`archived`); default to Activas so archived is hidden.
- [x] 2.4 Add the global empty state with a CTA to `/create` and copy "Aún no tienes wishlists / Crea tu primera wishlist…", plus a per-filter empty message.

## 3. Wishlist overview page (7.2)

- [x] 3.1 Add `src/app/(protected)/dashboard/wishlists/[id]/page.tsx` (RSC) fetching `api.wishlist.overview({ id })`; `notFound()` on throw.
- [x] 3.2 Add `src/components/features/dashboard/overview/metric-cards.tsx`: 4 cards (Regalos totales, Disponibles, Comprados, Progreso de compras with bar).
- [x] 3.3 Add `src/components/features/dashboard/overview/overview-share.tsx` (client) wrapping `SharePanel`, wiring `navigator.clipboard` copy with feedback and `downloadQrCodePng`; use `toCanonicalWishlistUrl` + `toWhatsAppShareUrl` (confirm the public path segment against the live public route).
- [x] 3.4 Add `src/components/features/dashboard/overview/recent-purchases.tsx`: avatar (initials), buyer, gift name, `formatRelativeDate`, status badge; empty state when none.
- [x] 3.5 Add `src/components/features/dashboard/overview/publish-readiness-checklist.tsx` rendering each `readiness.checks` entry.
- [x] 3.6 Add `src/components/features/dashboard/overview/publish-button.tsx` (client) calling `api.wishlist.publish`, disabled unless `readiness.ready`, surfacing `PRECONDITION_FAILED`; show share panel once published.

## 4. Validation

- [x] 4.1 Run `pnpm check`, `pnpm test`, and `pnpm typecheck`; fix any failures.
- [x] 4.2 Manually verify owner scoping (non-owner gets not-found on overview), default list hides archived, filters work, publish + share flow, and recent purchases show latest 5 with relative time.
