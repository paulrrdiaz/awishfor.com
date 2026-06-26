## Context

The public wishlist mapper (`src/server/mappers/public-wishlist.mapper.ts`) already filters gifts via `isGiftVisible`, sums purchased quantity per gift via `getPurchasedQuantityFromLoaded`, and derives each gift's public status via `deriveGiftPublicStatus`. The resulting `PublicWishlistViewModel` (`src/server/mappers/view-models.ts`) carries per-gift `quantityNeeded` and `status`, but **not** per-gift purchased quantity — by design, the public model excludes finer purchase detail. That means the page cannot reconstruct `7 de 16 unidades compradas` from the gifts array alone; an aggregate must be computed in the mapper, where the loaded `Purchase[]` rows are still available.

Task 2.6 names the affected areas as the mapper plus a new `progress-summary.tsx` component. The summary is quantity-based, guest-facing, and read-only.

## Goals / Non-Goals

**Goals:**
- Compute a single aggregate progress object in the mapper from visible gifts only.
- Render it as `8 disponibles · 7 de 16 unidades compradas` in `full` mode.
- Be safe at the zero-state (no gifts / no purchases / zero total units).
- Keep the computation pure and unit-testable.

**Non-Goals:**
- Visual/animated progress bars (text only).
- Per-category or amount/currency-based progress.
- Owner/dashboard progress (Milestone 6).
- Real-time refresh after purchase (Task 5.4 owns that behavior).

## Decisions

### Aggregate progress lives on `PublicWishlistViewModel`, not per gift
Add a `progress` field to the public view model:
```ts
type PublicWishlistProgress = {
  availableGiftCount: number; // gifts with status available | partial
  purchasedUnits: number;     // sum of min(purchased, quantityNeeded)
  totalUnits: number;         // sum of quantityNeeded
};
```
Computed in `mapPublicWishlist` while iterating the already-filtered `visibleGifts`, reusing `getPurchasedQuantityFromLoaded`. Purchased units are capped per gift with `Math.min(purchased, quantityNeeded)` so over-purchase can't push `purchasedUnits` past `totalUnits`.

*Alternative considered:* expose per-gift `purchasedQuantity` on `PublicGiftViewModel` and sum client-side. Rejected — it leaks more purchase granularity into the public model than needed and spreads the business rule into the component. The aggregate keeps the rule in the mapper.

### `availableGiftCount` = available + partial
Matches the filters capability's `Disponibles` bucket (available + partial), so "disponibles" is consistent across the page. A partially purchased gift is still buyable, so it counts as available.

### Component is a pure presentational function
`ProgressSummary` takes the `progress` object (not the whole wishlist) and renders text. No data fetching, no client state — render in the page shell only in `full` mode, consistent with how filters are gated.

### Zero-state handled in copy, not by hiding
When `totalUnits === 0` (empty wishlist), render `0 disponibles · 0 de 0 unidades compradas` rather than special-casing. No division occurs (the format is plain integer interpolation), so there is no divide-by-zero risk. The page may still choose to omit the summary alongside an empty gift list, but the component itself stays safe.

### Localization
Copy follows the existing Spanish-first convention used by the filters (`Todos`/`Disponibles`). String: `{availableGiftCount} disponibles · {purchasedUnits} de {totalUnits} unidades compradas`. Singular/plural polish is out of scope for MVP unless trivially added.

## Risks / Trade-offs

- [Aggregate drifts from per-gift `status` semantics] → Derive `availableGiftCount` from the same `deriveGiftPublicStatus` result used for gifts, so a single source of truth governs both.
- [Over-purchase inflates totals] → Cap purchased units per gift at `quantityNeeded`.
- [Stale progress after a purchase] → Out of scope here; Task 5.4 handles refresh. This change only renders whatever the current view model holds.

## Open Questions

- None blocking. Plural/singular wording ("1 unidad" vs "1 unidades") can be refined during apply if cheap; not a spec requirement.
