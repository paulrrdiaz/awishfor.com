## REMOVED Requirements

### Requirement: Invitados tab in the detail nav

**Reason**: Tab navigation is replaced by the vertical section rail. Invitados is now a rail item, not a tab.

**Migration**: Covered by `dashboard-detail-chrome` → "Vertical section rail replaces tab navigation", which requires Invitados as the third of five rail items and requires the active item to be derived from the route.

### Requirement: Animated active-tab indicator

**Reason**: There is no tab row to slide an indicator along. The rail marks its active item with a filled background rather than a moving underline, so the `useLayoutEffect` and `ResizeObserver` measurement that drove the indicator is deleted with `wishlist-detail-nav.tsx`.

**Migration**: Covered by `dashboard-detail-chrome` → "Vertical section rail replaces tab navigation", scenario "Active item reflects the current route".

### Requirement: Correct pre-hydration and no-JS fallback

**Reason**: The fallback existed because the indicator's position could only be known after client-side measurement. The rail's active item is resolved from the pathname during render, so it is correct in the server-rendered markup with no measurement step and nothing to fall back from.

**Migration**: Covered by `dashboard-detail-chrome` → "Vertical section rail replaces tab navigation", scenario "Active item reflects the current route".

### Requirement: Distinct hover affordance

**Reason**: The requirement existed to separate a hovered tab's underline from the active tab's underline, which were the same visual device. The rail distinguishes active from hovered by different properties — a filled primary background versus a muted surface tint — so the ambiguity does not arise.

**Migration**: Covered by `dashboard-detail-chrome` → "Vertical section rail replaces tab navigation", scenario "Hovering an item reveals its label".

### Requirement: Keyboard focus visibility

**Reason**: Scoped to tab triggers, which no longer exist.

**Migration**: Rail items are links and inherit the application's global focus-visible treatment; no rail-specific requirement is needed.

### Requirement: Indicator tracks route-derived active segment

**Reason**: There is no indicator. Route-derived active state is retained and strengthened — it now also handles aliased nested routes, which the tab nav resolved incorrectly.

**Migration**: Covered by `dashboard-detail-chrome` → "Section resolution for aliased routes" and "Vertical section rail replaces tab navigation", scenario "Active item reflects the current route".

### Requirement: Responsive handoff to mobile Select unchanged

**Reason**: The `Select` fallback is removed. It presented a navigation pattern unrelated to the desktop one and hid the sibling sections until opened.

**Migration**: Covered by `dashboard-detail-chrome` → "Labeled rail strip below the md breakpoint", which keeps all five sections visible and labeled at narrow widths.
