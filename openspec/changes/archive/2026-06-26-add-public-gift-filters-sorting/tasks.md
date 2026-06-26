## 1. Pure filter/sort module

- [x] 1.1 Create `src/lib/wishlist/gift-filters.ts` with filter types: `GiftFilter` discriminated union (`{ kind: "status"; value: "all" | "available" | "purchased" | "infaltable" }` | `{ kind: "category"; categoryId: string }`) and `GiftSortMode` (`"recommended" | "price-asc" | "price-desc"`), plus the default filter and sort constants.
- [x] 1.2 Implement `filterGifts(gifts, filter)`: `all` → all; `available` → status `available`/`partial`; `purchased` → status `purchased`; `infaltable` → priority `high`; `category` → matching `categoryId`.
- [x] 1.3 Implement `sortGifts(gifts, mode)`: recommended (purchasable before purchased → priority high>medium>low → `sortOrder` asc) and price asc/desc (null price last), non-mutating and stable.
- [x] 1.4 Implement `buildCategoryFilters(categories, gifts)` returning categories that have ≥1 gift, ordered by `sortOrder` ascending.
- [x] 1.5 Add `countByStatusFilter(gifts)` helper for chip counts.

## 2. Module tests

- [x] 2.1 Add `src/lib/wishlist/gift-filters.test.ts` covering each status filter, category filter, single-active behavior, recommended sort ordering, price sort with null prices, category ordering, and empty results.

## 3. Filter UI component

- [x] 3.1 Create `src/components/features/wishlist/public-filters.tsx` client component owning `activeFilter` + `sortMode` state with `useMemo`-derived filtered/sorted gifts.
- [x] 3.2 Render status filter chips (`Todos`, `Disponibles`, `Comprados`, `Infaltables`) with counts; one active at a time.
- [x] 3.3 Render category filter chips from `buildCategoryFilters`, deselecting status filter on selection.
- [x] 3.4 Render the sort dropdown (recommended default, price asc/desc) using existing shadcn primitives.
- [x] 3.5 Render per-filter empty states (copy + CTA resetting to `Todos`) when the result is empty.

## 4. Wiring & render modes

- [x] 4.1 Wire `gift-list.tsx`/grid to consume the filtered+sorted gift array and render the empty state slot.
- [x] 4.2 Render `PublicGiftFilters` only in `full` mode; in `preview`/`compact` render gifts in recommended order with no controls.

## 5. Validation

- [x] 5.1 Run `pnpm check`, `pnpm test`, and `pnpm typecheck`; fix any failures.
- [x] 5.2 Manually verify on `/w/[slug]`: single active filter, category order, purchased-last default, and empty states.
