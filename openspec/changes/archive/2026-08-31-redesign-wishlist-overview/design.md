## Context

`wishlist.overview` returns `metrics` (gift and unit counts, plus owner-only `totalViews`, `uniqueVisitors`, `latestViewAt`), `readiness`, and `recentPurchases`. The Resumen page renders `MetricCards`, `RecentPurchases`, `PublishReadinessChecklist`, and `PublishButton`.

Two data sources already hold what §5 needs and are not yet read:

- `WishlistView` rows: `wishlistId`, `inviteId`, `visitorHash`, `createdAt`. `getWishlistViewAnalytics` currently reduces them to three scalars, discarding the time dimension.
- `Invite`: RSVP status for the primary guest and each extra guest, plus `openedAt`, `lastViewedAt`, `viewCount`.

Two panels in §5 have no source at all, which is what keeps this change read-only.

## Goals / Non-Goals

Goals:
- Six metric cards, all derived from data already stored.
- A daily view trend over a selectable window.
- One activity feed spanning RSVPs, purchases, and invitation opens.
- Purchase progress and invitation-open progress.

Non-Goals:
- Per-gift view events (`Regalos más vistos`).
- Referrer capture (`De dónde llegan`).
- QR generation.
- Readiness and share affordances, now owned by the status strip.

## Decisions

### Panel-by-panel data provenance

| Panel | Source | Status |
|---|---|---|
| Regalos | `getVisibleGiftAggregates.totalGiftCount` | exists |
| Comprados | `getVisibleGiftAggregates.purchasedGifts` | exists |
| Confirmados `n / m` | `Invite` RSVP statuses | new aggregate |
| Visitas | `WishlistView.count` | exists |
| Visitantes únicos | `WishlistView` distinct `visitorHash` | exists |
| Tasa de compra | derived, see below | new derivation |
| Visitas por día | `WishlistView.createdAt` grouped by day | new aggregate |
| Actividad reciente | invites + purchases + invite opens | new merge |
| Progreso de compras | `purchasedUnits / totalUnits` | exists |
| Invitaciones abiertas | `Invite.openedAt` non-null count | new aggregate |
| Regalos más vistos | — | **blocked**, deferred |
| De dónde llegan | — | **blocked**, deferred |

### Tasa de compra

Defined as distinct purchasers over unique visitors — the share of people who saw the list and bought something. Unique visitors is the honest denominator; `totalViews` would deflate the rate by counting repeat visits by one person.

Rendered as `—` rather than `0%` when `uniqueVisitors` is zero, and when view analytics is disabled (`VIEW_ANALYTICS_HMAC_SECRET` unset, so no rows are ever recorded).

Rejected: purchased gifts over total gifts. That is list completion, already shown by Progreso de compras, and says nothing about conversion.

### Daily view series

`getWishlistViewAnalytics` grows a companion `getWishlistViewSeries(db, wishlistId, { since })` returning one bucket per day in the window, including days with zero views so the chart has no gaps. Buckets are computed in the wishlist's stored timezone-free `createdAt`, matching how every other date in the dashboard is rendered.

Window selector offers 7, 30, and 90 days, defaulting to 30 to match the design's `Últimos 30 días`. The selector is client state re-querying the series; the scalar metrics stay lifetime totals and do not follow the window, matching the design where `Visitas` reads 37 against a 30-day chart.

Rejected: a Prisma `groupBy` on a date expression. Prisma cannot group by a truncated date without raw SQL; fetching timestamps for the window and bucketing in the service keeps it typed and testable, and the row count over 90 days is small.

### Activity feed

Merges three event kinds into one reverse-chronological list:

- RSVP response — `Invite.respondedAt`, labeled with the guest name and resulting status
- Purchase — existing `recentPurchases`, labeled `Alguien` when the purchaser left no name
- Invitation opened — `Invite.openedAt`, labeled with the guest name

Capped at the ten most recent. Each entry carries a kind so the badge (`RSVP`, `Compra`, `Vista`) is presentational only.

### Owner-only figures

`mapDashboardWishlistOverview` already gates view analytics behind `isOwner`. The same gate covers the new view series and conversion rate. RSVP and invitation-open aggregates concern the guest list, which collaborators can already see on Invitados, so those are not owner-gated. A collaborator's Resumen therefore renders four of six metric cards and no view trend.

## Risks / Trade-offs

- **Two panels ship missing.** Accepted so the change stays read-only. Both are named in non-goals with the capture work they need.
- **Feed reads three sources per page load.** Bounded by taking the ten most recent of each before merging.
- **Metric cards and chart use different windows.** Deliberate and matches the design, but the window selector is labeled so it is clearly scoped to the chart.
- **Empty states matter more here.** A new draft has no views, no invitations, and no purchases; every panel needs a defined zero state rather than an empty box.

## Migration Plan

No data migration. Purely additive reads over `WishlistView` and `Invite`. Existing `MetricCards` consumers keep working because the metrics object only gains fields.

## Open Questions

- Should the window selector persist per wishlist, or reset to 30 days on each visit?
- Should a collaborator see the view trend, or is view data owner-only as it is today?
