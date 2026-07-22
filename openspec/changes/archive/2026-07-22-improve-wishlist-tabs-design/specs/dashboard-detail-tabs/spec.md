## ADDED Requirements

### Requirement: Animated active-tab indicator
The wishlist detail nav SHALL render a single active-tab indicator that visually moves (position and width transition) to the currently active tab whenever the active segment changes, rather than each tab independently toggling its own static border.

#### Scenario: Indicator slides on tab change
- **WHEN** the active segment changes from one `NAV_ITEMS` entry to another (via click or browser back/forward navigation)
- **THEN** the indicator's left offset and width animate from the previous active tab's position/size to the new active tab's position/size

#### Scenario: Indicator matches active tab on initial load
- **WHEN** the wishlist detail page first renders with a given `activeSegment`
- **THEN** the indicator is positioned under that segment's tab once measurement completes

### Requirement: Correct pre-hydration and no-JS fallback
The active tab SHALL display a visible underline even before client-side measurement runs or if JavaScript fails to execute, so the nav never renders with no active-state indication.

#### Scenario: Server-rendered markup shows the active tab
- **WHEN** the page is rendered server-side and before hydration/measurement completes on the client
- **THEN** the active tab already shows a static underline matching its segment, with the animated indicator fading in only after it is measured

### Requirement: Distinct hover affordance
Each tab SHALL show a hover affordance visually distinct from the active-tab indicator, so a user can tell "hovered" apart from "active" even when hovering a non-active tab.

#### Scenario: Hovering an inactive tab
- **WHEN** a user hovers a tab that is not the active segment
- **THEN** that tab shows a muted underline/hover treatment distinct in tone from the active indicator, and the active indicator does not move

#### Scenario: Hovering the active tab
- **WHEN** a user hovers the tab that is already active
- **THEN** the active indicator remains in place and no conflicting hover underline is shown on top of it

### Requirement: Keyboard focus visibility
Each tab trigger SHALL show a visible focus ring when reached via keyboard navigation.

#### Scenario: Tabbing to a nav item
- **WHEN** a keyboard user moves focus to a tab trigger via Tab/Shift+Tab
- **THEN** a visible focus ring renders around that trigger

### Requirement: Indicator tracks route-derived active segment
The indicator SHALL derive its target position from the route-derived `activeSegment` (based on `pathname`), not from transient click state, so it remains correct across direct navigation, reloads, and browser history navigation.

#### Scenario: Direct navigation to a non-summary tab
- **WHEN** a user loads `/dashboard/wishlists/[id]/gifts` directly (not via clicking a tab)
- **THEN** the indicator is positioned under the "Regalos" tab without requiring a prior click

### Requirement: Responsive handoff to mobile Select unchanged
Below the `md` breakpoint, the tab row SHALL remain replaced by the existing `Select` dropdown, and the indicator/hover/focus behavior above applies only to the `md`-and-up tab presentation.

#### Scenario: Narrow viewport shows Select, not tabs
- **WHEN** the viewport is below the `md` breakpoint
- **THEN** the section picker renders as a `Select` dropdown and none of the tab indicator/hover/focus behavior applies (it is not rendered)
