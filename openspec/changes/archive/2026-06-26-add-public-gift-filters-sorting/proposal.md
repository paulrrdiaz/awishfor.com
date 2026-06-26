## Why

The public wishlist page renders every visible gift in one flat list. Guests on a wishlist with many gifts have no way to focus on what's still buyable, jump to a category, or surface must-have ("infaltable") gifts, and purchased gifts clutter the top of the list. Task 2.5 adds guest-facing filtering and sorting so guests can quickly find a gift to buy.

## What Changes

- Add a pure, testable gift filter/sort module (`src/lib/wishlist/gift-filters.ts`) that derives filter buckets, applies a single active filter, and sorts gifts.
- Add status filters with one active filter at a time: `Todos`, `Disponibles` (available + partial), `Comprados` (fully purchased), `Infaltables` (priority `high`).
- Add category filters generated from the wishlist's categories, ordered by category `sortOrder`.
- Add a sort dropdown with a default **recommended** order (purchasable gifts before purchased, then priority, then sort order) plus price ascending/descending.
- Add the `PublicGiftFilters` client component holding filter + sort state and rendering filter chips, counts, and the sort control.
- Wire the gift list/grid to render the filtered + sorted result, with per-filter empty states (copy + CTA back to all gifts).
- Hide/disable filter controls in `preview` and `compact` render modes (filters apply only in `full` mode).
- Non-goals: multi-select filters, server-side filtering, persisted per-guest preferences, and additional secondary sort modes beyond price.

## Capabilities

### New Capabilities
- `public-wishlist-filters`: guest-facing filtering and sorting of public gifts — single-active status filters (`Todos`/`Disponibles`/`Comprados`/`Infaltables`), category filters ordered by category sort order, a sort dropdown with a default recommended order, and per-filter empty states.

### Modified Capabilities
<!-- None: consumes PublicWishlistViewModel and the public-wishlist-layout components without changing their contracts. -->

## Impact

- New: `src/lib/wishlist/gift-filters.ts` (+ test), `src/components/features/wishlist/public-filters.tsx`.
- Modified: `src/components/features/wishlist/gift-list.tsx` (and/or grid) to consume filtered/sorted gifts and render empty states; layout shell wires filters in `full` mode only.
- Consumes existing `PublicGiftViewModel` / `PublicCategoryViewModel` (`src/server/mappers/view-models.ts`) and `GiftPublicStatus`; no schema, env, API, or mapper changes.
- Depends on `add-public-layout-components` (Task 2.4) components being in place.
