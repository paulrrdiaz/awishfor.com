## Why

Resumen answers almost nothing an owner asks. It shows raw gift counts, a recent-purchase list, and a publish checklist, but not whether the invitation is landing: no view trend, no unique-visitor figure, no RSVP progress, no signal of which invitations went unopened. The `WishlistView` table has recorded every view with a timestamp and a visitor hash since view analytics shipped, and the `Invite` model has carried `openedAt`, `lastViewedAt`, and RSVP status since personalized invites — none of it surfaces on Resumen.

`Dashboard.dc.html` §5 defines the target: six metric cards, a daily view trend, recent activity, purchase progress, and invitation-open progress, with readiness and sharing moved out to the status strip.

## What Changes

- Replace the Resumen body with six metric cards: Regalos, Comprados, Confirmados, Visitas, Visitantes únicos, and Tasa de compra.
- Add a daily view trend for the wishlist, aggregated from recorded view timestamps over a selectable window.
- Add a recent activity feed merging RSVP responses, purchases, and invitation opens into one reverse-chronological list that names an anonymous purchaser as `Alguien`.
- Add a purchase-progress panel and an invitation-open panel showing how many invitations remain unopened.
- Extend the wishlist overview view model with RSVP aggregates, invitation-open aggregates, and the view timeseries.

Non-goals:

- `Regalos más vistos`. `WishlistView` records views per wishlist, not per gift, so this needs per-gift view events that do not exist. Deferred.
- `De dónde llegan`. No referrer or traffic source is captured anywhere. Deferred.
- `Descargar QR`. No QR generator exists in the codebase. Deferred alongside the status strip's QR action.
- The readiness checklist and share actions, which move to the status strip in `redesign-dashboard-navigation-shell`.
- Any cross-wishlist rollup on `/dashboard`.

## Capabilities

### New Capabilities

- `dashboard-wishlist-overview`: what the Resumen section presents and how each figure is derived.

### Modified Capabilities

- `wishlist-view-models`: the overview view model carries RSVP aggregates, invitation-open aggregates, and a daily view series.

## Impact

- `src/server/services/wishlist-view-analytics.service.ts` gains a daily-series aggregate over `WishlistView.createdAt`.
- `src/server/mappers/dashboard-wishlist.mapper.ts` and `view-models.ts` extend the overview metrics.
- `wishlist.overview` resolver adds RSVP and invitation aggregates.
- `src/app/(protected)/dashboard/wishlists/[id]/page.tsx` rebuilt; `metric-cards.tsx` extended; new trend, activity, and progress components.
- Depends on `redesign-dashboard-navigation-shell` having removed `PublishReadinessChecklist` and `PublishButton` from this page.
- Read-only over existing tables. No schema change, no migration, no new environment variables, no new dependencies.
