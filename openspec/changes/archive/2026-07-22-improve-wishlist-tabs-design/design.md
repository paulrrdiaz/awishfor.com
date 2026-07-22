## Context

`WishlistDetailNavView` (`src/components/layouts/dashboard/wishlist-detail-nav.tsx:89`) renders the desktop tab row via `Tabs`/`TabsList`/`TabsTrigger` (`src/components/ui/tabs.tsx`), each `TabsTrigger` using `asChild` to render a Next.js `Link`. Active state is currently expressed per-trigger via a conditional `border-[#17213a] text-[#17213a]` class — there is no single moving indicator, no hover underline preview, and no focus-visible ring (the base trigger's `focus-visible:ring-3` exists in the shadcn primitive but is effectively invisible against the transparent/underline look used here). `Tabs`/`TabsList`/`TabsTrigger` have exactly one consumer (`WishlistDetailNav`), so styling changes can be scoped to that consumer without a variant system.

## Goals / Non-Goals

**Goals:**
- Single animated indicator that slides/resizes between tabs on activation (mirrors GitHub/Linear/Vercel dashboard tab patterns).
- Visible, on-brand focus ring for keyboard navigation.
- Distinguishable hover affordance separate from the active indicator.
- Zero new dependencies; correct output even before JS hydrates or measures (no flash of an unstyled/mispositioned indicator).
- Keep segment/routing logic, mobile `Select` fallback, and all other dashboard nav chrome untouched.

**Non-Goals:**
- No icon or count-badge additions to tabs (would conflict with the design brief's "clean, utilitarian, less decorative" dashboard direction).
- No changes to the shared `Tabs`/`TabsList`/`TabsTrigger` primitives' default pill styling (used only here today, but keeping the primitive generic avoids coupling it to one consumer's look).
- No changes to the `< md` `Select` dropdown variant.
- No new indicator color: stays the existing navy ink (`#17213a`), not the app's lime-chartreuse `--primary` — the design brief reserves primary color for "the single most important action per view," and tab wayfinding isn't that action.

## Decisions

**1. Sliding indicator via ref measurement + CSS transition, not a CSS-only trick or animation library.**
A single absolutely-positioned `<span>` lives inside a `relative` `TabsList`, with `left`/`width` computed from the active trigger's `offsetLeft`/`offsetWidth` and animated with `transition-[left,width] duration-200 ease-out`.
- Rejected: framer-motion/`layoutId` shared-element animation — correct and simpler, but adds a dependency for one component; plain CSS transition on `left`/`width` is enough for a straight horizontal move.
- Rejected: pure CSS (`:has()`/grid) approach — tab labels are variable-width text, so there's no CSS-only way to size/position an indicator to an arbitrary sibling's rendered width without JS measurement.

**2. Keep the existing static per-trigger `border-b-2` as a no-JS/pre-hydration fallback; layer the animated indicator on top once measured.**
The current active-tab border stays in the trigger's className (so SSR output already shows the correct tab underlined). The new sliding indicator renders additionally, starts at `opacity-0`, and fades in (`opacity-100`, short transition) only after the first `useLayoutEffect` measurement — at which point it visually takes over the underline job while the static border sits behind it. This avoids an indicator flashing at position `{0,0}` before measurement and degrades gracefully with JS disabled.
- Rejected: rendering only the animated indicator with no fallback — would show no active-state underline at all until hydration/measurement completes.

**3. Measurement driven by `activeSegment` (derived from `pathname`), not local click state.**
A `useRef<(HTMLAnchorElement | null)[]>([])` array (indexed by `NAV_ITEMS` position) collects trigger refs via callback refs. `useLayoutEffect` recomputes `{left, width}` whenever `activeSegment` changes, plus on a `ResizeObserver` attached to the `TabsList` container (handles font-swap reflow / viewport resize). Driving off `activeSegment` (not a click handler) keeps the indicator correct on back/forward navigation and on first load, not just on click.

**4. Hover underline is a separate, per-trigger element, not the shared indicator.**
Each `TabsTrigger` keeps a thin `absolute bottom-0` span, `opacity-0 group-hover:opacity-100 transition-opacity`, in a muted tone (`bg-[#e4e4df]` or equivalent border token), rendered under the active indicator's z-index. This keeps "currently hovered" and "currently active" visually distinct even when hovering a non-active tab.

**5. Focus-visible ring applied at the trigger (Link) level, scoped to this component's className overrides.**
`focus-visible:ring-2 focus-visible:ring-[#17213a]/40 focus-visible:ring-offset-2 focus-visible:rounded-sm` added to the `TabsTrigger`'s className in `wishlist-detail-nav.tsx`, not to the shared `ui/tabs.tsx` primitive, per the proposal's scoping decision.

## Risks / Trade-offs

- **Measurement flicker / layout thrash on first paint** → mitigated by `useLayoutEffect` (runs pre-paint) and the opacity-fade-in gate described in Decision 2; static border fallback means there's no visually broken state even in the worst case.
- **Font reflow after `next/font` swap resizes tab labels, leaving indicator stale** → mitigated by the `ResizeObserver` on the `TabsList` container (Decision 3), not just a window-resize listener.
- **`asChild` + `Link` inside `TabsTrigger` changes what element receives the ref** → the callback ref is attached to the rendered anchor element (Radix's `asChild` merges props onto the child), so `offsetLeft`/`offsetWidth` measurement targets the actual `<a>`, matching what's visually laid out.
- **Scope creep into the shared `ui/tabs.tsx` primitive** → mitigated by keeping the indicator, hover span, and focus-ring classes in `WishlistDetailNav`'s own className overrides / an additive wrapper, per Non-Goals.

## Migration Plan

Purely presentational, single-component change — no data migration, no feature flag. Ship behind the normal `pnpm typecheck` / `pnpm check` / `pnpm test` gate used for all changes; rollback is a plain revert if the animation or focus styling regresses visually.

## Open Questions

None blocking — indicator color and scoping are resolved above from the existing design brief and current implementation.
