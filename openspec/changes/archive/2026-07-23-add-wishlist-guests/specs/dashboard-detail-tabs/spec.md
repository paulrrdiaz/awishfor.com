## ADDED Requirements

### Requirement: Invitados tab in the detail nav

The wishlist detail nav `NAV_ITEMS` SHALL include an `Invitados` tab mapping to the `guests` segment, positioned after `Regalos` and before `Diseño`. The Invitados tab SHALL participate in the animated active-tab indicator, hover, focus, and route-derived active-segment behavior identically to the other tabs, and SHALL appear as an option in the mobile `Select` fallback below the `md` breakpoint.

#### Scenario: Invitados tab present and navigable
- **WHEN** the wishlist detail nav renders
- **THEN** an `Invitados` tab is shown that links to `/dashboard/wishlists/[id]/guests`

#### Scenario: Indicator tracks the Invitados tab
- **WHEN** a user loads `/dashboard/wishlists/[id]/guests` directly
- **THEN** the active-tab indicator is positioned under the `Invitados` tab without requiring a prior click

#### Scenario: Invitados appears in the mobile Select
- **WHEN** the viewport is below the `md` breakpoint
- **THEN** the section `Select` dropdown includes an `Invitados` option
