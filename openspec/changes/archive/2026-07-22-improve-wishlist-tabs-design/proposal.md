## Why

The wishlist detail nav (`Resumen · Regalos · Diseño · Configuración`, `src/components/layouts/dashboard/wishlist-detail-nav.tsx`) uses static per-tab underline borders with no animated transition, a hover state that only recolors text, and no visible focus-ring treatment. Modern dashboard tab patterns (GitHub, Linear, Vercel) use a single sliding active-indicator and clearer hover/focus affordances, which reads as more polished and reinforces the Claude Design brief's "clean, utilitarian" dashboard direction (`docs/CLAUDE_DESIGN_PROMPT.md`, design brief §6, §10 accessibility notes). The underlying `Tabs`/`TabsList`/`TabsTrigger` primitives (`src/components/ui/tabs.tsx`) have exactly one consumer today, so this is safe to refine without risk of regressing other screens.

## What Changes

- Replace the static per-trigger border-bottom with a single animated sliding indicator that transitions smoothly between tabs (position/width computed from the active trigger, transform-based, no new dependency).
- Add a visible `focus-visible` ring on tab triggers to meet the design brief's accessibility guidance (currently suppressed for the underline variant).
- Add a subtle hover affordance (muted underline preview) distinct from the active indicator, so hover and active states are visually distinguishable.
- Keep existing tab segments, hrefs, active-segment routing logic, and the mobile `Select` fallback (`< md`) unchanged.
- No change to the shared `Tabs`/`TabsList`/`TabsTrigger` primitives' pill-style defaults — all styling stays scoped to the `WishlistDetailNav` consumer via `className` overrides (or a small additive prop if needed), since it is the sole consumer.

## Capabilities

### New Capabilities
- `dashboard-detail-tabs`: Desktop/tablet tab navigation for the wishlist detail nav — active-indicator behavior, hover/focus states, and the responsive handoff to the mobile `Select` — formalized as a spec for the first time.

### Modified Capabilities
(none — no existing spec currently documents this component's behavior)

## Impact

- Affected code: `src/components/layouts/dashboard/wishlist-detail-nav.tsx` (primary), possibly `src/components/ui/tabs.tsx` if a small additive variant/prop is needed (no breaking change to its existing pill usage since it has no other consumers).
- No API, schema, or env changes.
- No dependency additions (indicator animation implemented with existing React + Tailwind, no animation library).
- Visual-only change; routing/segment logic (`hrefFor`, `activeSegmentFromPathname`) is untouched.
