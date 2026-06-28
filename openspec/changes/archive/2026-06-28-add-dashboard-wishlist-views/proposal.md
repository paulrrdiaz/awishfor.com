## Why

The dashboard currently has no home for managing wishlists as a whole. The sidebar lists wishlists and links straight to each one's gifts page, but there is no place where an owner can:

- See all of their wishlists at a glance with status and progress (task 7.1).
- Open a single wishlist's overview to read its metrics, copy/share its public link, review recent purchases, check publish readiness, and publish it (task 7.2).

`/dashboard` is a placeholder ("Selecciona una lista…") and `/dashboard/wishlists/[id]` has no `page.tsx` (only `/gifts` and `/categories` exist), so visiting a wishlist root 404s. These two views are P0 and close that gap.

## What Changes

- **Dashboard wishlist list** at `/dashboard/wishlists`: a card grid of the owner's wishlists, each card showing title, event type, status, and quantity-based purchase progress. Status filters (Activas, Borradores, Publicadas, Archivadas) with archived hidden from the default view. Empty state with a CTA to `/create`.
- **Wishlist overview** at `/dashboard/wishlists/[id]`: four metric cards (Regalos totales, Disponibles, Comprados, Progreso de compras with bar), a public link / share section (copy, WhatsApp, QR download — reusing the existing `SharePanel`, `share.ts`, `qr.ts`), a recent-purchases section (latest 5: buyer, gift, relative time, status badge), a publish-readiness checklist, and a publish action.
- **Server data**: new tRPC queries to back both views — an owner-scoped wishlist summary list (including archived, with aggregate gift/purchase counts) and a wishlist overview query (metrics + readiness + latest 5 purchases joined with gift name). Extend `dashboard-wishlist.mapper.ts` / view-models with the aggregate progress and overview shapes.

Out of scope: wishlist search, full analytics dashboard, dashboard navigation/design/settings pages (tasks 7.3–7.5).

## Capabilities

### New Capabilities
- `dashboard-wishlist-list`: owner-facing list of their wishlists as status/progress cards with status filters and empty states.
- `dashboard-wishlist-overview`: per-wishlist overview with metrics, public link sharing, recent purchases, publish readiness, and a publish action.

### Modified Capabilities
<!-- No spec-level requirement changes to existing capabilities; new server queries reuse existing publish/readiness/share behavior. -->

## Impact

- **New pages**: `src/app/(protected)/dashboard/wishlists/page.tsx`, `src/app/(protected)/dashboard/wishlists/[id]/page.tsx`.
- **New components**: `src/components/features/dashboard/wishlist-card.tsx`, `src/components/features/dashboard/overview/*`.
- **Server**: new procedures in `src/server/api/routers/wishlist.ts` (summary list) and `src/server/api/routers/purchase.ts` (recent purchases for a wishlist); extend `src/server/mappers/dashboard-wishlist.mapper.ts` and `src/server/mappers/view-models.ts`.
- **Reused**: `evaluatePublishReadiness` (`src/lib/wishlist/publish-readiness.ts`), `wishlist.publish` mutation, `SharePanel` (`src/components/shared/share-panel.tsx`), `toCanonicalWishlistUrl`/`toWhatsAppShareUrl` (`src/lib/wishlist/share.ts`), `downloadQrCodePng` (`src/lib/qr.ts`), `formatRelativeDate` (`src/lib/format/dates.ts`).
- **No DB schema changes.**
