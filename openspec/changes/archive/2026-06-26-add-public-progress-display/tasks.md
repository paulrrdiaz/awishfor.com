## 1. View model: aggregate progress

- [x] 1.1 Add `PublicWishlistProgress` type (`availableGiftCount`, `purchasedUnits`, `totalUnits`) and a `progress` field on `PublicWishlistViewModel` in `src/server/mappers/view-models.ts`.
- [x] 1.2 In `mapPublicWishlist` (`src/server/mappers/public-wishlist.mapper.ts`), compute the aggregate from `visibleGifts`: sum `quantityNeeded` into `totalUnits`, sum `min(purchasedQuantity, quantityNeeded)` into `purchasedUnits`, and count gifts with derived status `available`/`partial` into `availableGiftCount`. Reuse `getPurchasedQuantityFromLoaded` and `deriveGiftPublicStatus`.
- [x] 1.3 Add a unit test covering: mixed available/partial/purchased gifts, partial counted, over-purchase capped at needed, hidden/deleted excluded, and empty-wishlist zero-state.

## 2. Progress summary component

- [x] 2.1 Add `src/components/features/wishlist/progress-summary.tsx`: a pure presentational component taking the `progress` object and rendering `{availableGiftCount} disponibles · {purchasedUnits} de {totalUnits} unidades compradas`.
- [x] 2.2 Ensure the zero-state renders safely (`0 disponibles · 0 de 0 unidades compradas`) with no division.

## 3. Wire into the public page

- [x] 3.1 Render `ProgressSummary` in the public wishlist page shell only in `full` render mode; omit in `preview` and `compact`.

## 4. Validate

- [x] 4.1 Run `pnpm check`, `pnpm test`, and `pnpm typecheck`; fix any failures.
