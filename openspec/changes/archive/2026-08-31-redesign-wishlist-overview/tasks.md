## 0. Precondition

- [x] 0.1 Confirm `redesign-dashboard-navigation-shell` has been applied, so the status strip exists and owns the readiness checklist and publish control. If it has not, stop and apply that change first — this change assumes those components have already left the Resumen page.

## 1. View series aggregate

- [x] 1.1 Add `getWishlistViewSeries` to `wishlist-view-analytics.service.ts`, returning one bucket per day across the requested window and emitting zero-count buckets for days with no views.
- [x] 1.2 Add service tests covering a window with gaps, a window with no views at all, and the disabled-analytics case where no rows are ever recorded.

## 2. RSVP and invitation aggregates

- [x] 2.1 Add an aggregate over the wishlist's invitations producing confirmed, declined, pending, and total party counts across primary and extra guests.
- [x] 2.2 Add an aggregate producing opened and unopened invitation counts from `Invite.openedAt`.
- [x] 2.3 Expose both aggregates on the overview view model, keeping them ungated so collaborators see them.

## 3. Overview view model and resolver

- [x] 3.1 Extend the overview metrics with the confirmed count, the invitation-open counts, and the purchase-conversion rate, keeping view-derived figures behind the existing owner gate.
- [x] 3.2 Derive the purchase-conversion rate as distinct purchasers over unique visitors, returning no value when unique visitors is zero or analytics is disabled.
- [x] 3.3 Add the daily view series to the overview payload behind the owner gate, defaulting to a 30-day window.
- [x] 3.4 Add a query input for the view window accepting 7, 30, or 90 days.

## 4. Activity feed

- [x] 4.1 Build a merged activity source combining RSVP responses, purchases, and invitation opens into one reverse-chronological list capped at ten entries, each tagged with its kind.
- [x] 4.2 Represent a purchase with no recorded purchaser name as `Alguien` rather than an empty name.

## 5. Resumen page

- [x] 5.1 Extend `MetricCards` to the six cards — Regalos, Comprados, Confirmados, Visitas, Visitantes únicos, Tasa de compra — rendering a placeholder rather than a zero for figures that are unavailable.
- [x] 5.2 Build the daily view trend panel with the 7/30/90-day window selector, labeled so its window is clearly scoped to the chart.
- [x] 5.3 Build the activity feed panel with per-kind badges for RSVP, purchase, and invitation-open entries.
- [x] 5.4 Build the purchase-progress panel and the invitation-open panel, including the count of invitations still unopened.
- [x] 5.5 Recompose `[id]/page.tsx` from these panels; the readiness checklist and publish control must already be absent per task 0.1.
- [x] 5.6 Give every panel a defined empty state for a wishlist with no views, no invitations, and no purchases.
- [x] 5.7 Render the collaborator view without the owner-gated view trend and view metrics.

## 6. Tests and verification

- [x] 6.1 Add mapper tests for the confirmed, invitation-open, and conversion-rate figures, including the zero-visitor and analytics-disabled cases.
- [x] 6.2 Add activity feed tests for ordering across the three event kinds and for the anonymous purchase label.
- [x] 6.3 Add page-level tests for the owner and collaborator variants and for the all-zero empty state.
- [x] 6.4 Run `pnpm check` and resolve reported issues.
- [x] 6.5 Run `pnpm test` and resolve or report failures.
- [x] 6.6 Run `pnpm typecheck` and resolve or report failures.
