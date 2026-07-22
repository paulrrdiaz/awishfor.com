## 1. Indicator measurement plumbing

- [x] 1.1 Add a `useRef<(HTMLAnchorElement | null)[]>([])` trigger-ref array and callback refs on each `TabsTrigger`'s `Link` in `WishlistDetailNavView` (`src/components/layouts/dashboard/wishlist-detail-nav.tsx`)
- [x] 1.2 Add indicator state (`{ left: number; width: number }`) plus a `measured` boolean gate for the fade-in
- [x] 1.3 Add `useLayoutEffect` that recomputes indicator position/width from the ref matching `activeSegment`, running on `activeSegment` change and on mount
- [x] 1.4 Attach a `ResizeObserver` to the `TabsList` container to re-measure on reflow (font swap, viewport resize); clean up on unmount

## 2. Indicator + fallback markup

- [x] 2.1 Make `TabsList`'s wrapper `relative` and render the animated indicator as an absolutely-positioned `<span>` with `transition-[left,width] duration-200 ease-out`, `opacity-0` until `measured`, then `opacity-100`
- [x] 2.2 Keep the existing static `border-[#17213a]` active-tab class on the trigger itself as the pre-hydration/no-JS fallback (per design.md Decision 2) — do not remove it
- [x] 2.3 Set indicator color to the existing navy ink (`#17213a`), not `--primary`, per design.md's indicator-color decision

## 3. Hover and focus states

- [x] 3.1 Add a per-trigger `absolute bottom-0` hover span (`opacity-0 group-hover:opacity-100 transition-opacity`, muted tone e.g. `bg-[#e4e4df]`), layered below the active indicator's stacking order, and mark each trigger `group relative` for it to key off
- [x] 3.2 Ensure the hover span does not render/compete visually on the already-active tab (e.g. suppress or no-op when `isActive`)
- [x] 3.3 Add `focus-visible:ring-2 focus-visible:ring-[#17213a]/40 focus-visible:ring-offset-2 focus-visible:rounded-sm` to the trigger's className overrides in `wishlist-detail-nav.tsx`

## 4. Verification

- [x] 4.1 Run `pnpm typecheck`
- [x] 4.2 Run `pnpm check`
- [x] 4.3 Run `pnpm test`
- [x] 4.4 Manually verify in browser: tab click animates the indicator, direct navigation to `/gifts`/`/design`/`/settings` shows the indicator in the right place on load, keyboard Tab shows a visible focus ring, and hovering a non-active tab shows the muted underline without moving the active indicator (reminder only — not run automatically)
