## Context

The public wishlist page (`/w/[slug]`) renders gifts from `PublicWishlistViewModel`, where each `PublicGiftViewModel` carries `status` (`available` | `partial` | `purchased`), `priority` (`low` | `medium` | `high`), `categoryId`, `sortOrder`, and `priceAmount`/`priceCurrency`. Categories carry `sortOrder`. Task 2.4 (`add-public-layout-components`) provides the page shell, gift list/grid, and `full | preview | compact` render modes. This change layers guest-facing filtering and sorting on top of that already-mapped data — no server, schema, or mapper changes are needed.

## Goals / Non-Goals

**Goals:**
- Let guests narrow the gift list with single-active status filters and category filters.
- Provide a sort dropdown with a sensible recommended default that pushes purchased gifts down.
- Keep all filter/sort logic in a pure, unit-tested module independent of React.
- Render correct empty states; degrade gracefully (no controls) in preview/compact modes.

**Non-Goals:**
- Multi-select / combined filters (status + category at once).
- Server-side filtering, pagination, or URL/query-param persistence.
- Persisted per-guest preferences.
- Sort modes beyond recommended and price asc/desc (secondary modes are deferred per the Task 2.5 cut line).

## Decisions

### Pure logic module separate from UI
Put all derivation in `src/lib/wishlist/gift-filters.ts`: filter-option typing, a `filterGifts(gifts, filter)` function, a `sortGifts(gifts, sortMode)` function, and `buildCategoryFilters(categories, gifts)` (only categories with ≥1 visible gift, ordered by `sortOrder`). The component composes filter→sort. Rationale: matches the repo pattern of tested `src/lib/**` helpers (e.g. `src/lib/format/countdown.ts`) and keeps the spec scenarios directly testable without rendering. Alternative — inline logic in the component — was rejected as untestable and harder to reason about.

### Single filter state, discriminated union
Model the active filter as one value rather than independent toggles, e.g. `{ kind: "status"; value: "all" | "available" | "purchased" | "infaltable" } | { kind: "category"; categoryId: string }`. Default `{ kind: "status", value: "all" }`. This structurally enforces "one active filter at a time" so status and category selections are mutually exclusive. Alternative — a set of active filters — was rejected because it cannot express the single-active rule without extra guards.

### Filter bucket semantics
- `Todos` → all visible gifts. `Disponibles` → `status ∈ {available, partial}`. `Comprados` → `status === purchased`. `Infaltables` → `priority === high` (independent of purchase status). `Disponibles` includes `partial` because partially purchased gifts still have buyable units, which is what a guest looking to give cares about.

### Recommended sort
Comparator order: (1) purchasable (`available`/`partial`) before `purchased`; (2) priority `high` > `medium` > `low`; (3) `sortOrder` ascending. Price modes parse `priceAmount` (string) to a number; gifts with null price sort last. Sorting is a stable, non-mutating sort applied to the filtered array. Rationale: satisfies "purchased gifts appear below available gifts by default" while keeping the owner-defined `sortOrder` meaningful within a group.

### State lives in a client component; gifts pass through props
`PublicGiftFilters` (client) owns `useState` for `activeFilter` and `sortMode`, renders chips + sort dropdown, and renders the existing gift list/grid with the computed gift array (or an empty state). Counts on status chips come from running each filter over the full gift array. In `full` mode the layout renders `PublicGiftFilters`; in `preview`/`compact` it renders the gift list directly in recommended order with no controls. Rationale: filtering is presentation-only and reactive, so it belongs client-side; the server component stays a pure data source.

### Empty states
A small map from active filter → `{ copy, ctaLabel }`. The CTA resets `activeFilter` to the `Todos` default. Reuses existing shadcn/button styling.

## Risks / Trade-offs

- [Client-side filtering of a very large gift list could be slow] → Lists are guest wishlists (tens, not thousands) of gifts; `useMemo` on the filter+sort keeps recomputation cheap. Revisit with server filtering only if list sizes grow.
- [No URL persistence means filter state is lost on refresh/share] → Acceptable for v1 and explicitly a non-goal; can be added later via search params without changing the pure module.
- [Category vs. status mutual exclusivity may surprise users expecting to combine them] → Matches the Task 2.5 acceptance criterion ("one active filter at a time"); multi-select is a stated non-goal.

## Open Questions

- Sort dropdown copy/labels (Spanish strings) and whether price sort ships in v1 or is trimmed to recommended-only under the cut line — resolve during implementation against existing UI copy conventions.
