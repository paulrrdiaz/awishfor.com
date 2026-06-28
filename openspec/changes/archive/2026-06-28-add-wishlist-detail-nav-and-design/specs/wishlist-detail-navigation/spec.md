## ADDED Requirements

### Requirement: Wishlist detail section navigation

The wishlist detail area SHALL render a shared navigation, wrapping all detail pages, that lets the owner move between the wishlist's sections. The navigation SHALL expose exactly these items in order, each linking to its route relative to the wishlist id:

- **Resumen** → `/dashboard/wishlists/[id]`
- **Regalos** → `/dashboard/wishlists/[id]/gifts`
- **Diseño** → `/dashboard/wishlists/[id]/design`
- **Configuración** → `/dashboard/wishlists/[id]/settings`

The navigation SHALL be rendered from the detail layout (`[id]/layout.tsx`) so every child page shares it.

#### Scenario: Navigating between sections

- **WHEN** the owner selects a navigation item on any wishlist detail page
- **THEN** the app navigates to that item's route under the same wishlist id and renders the corresponding section

#### Scenario: Navigation present on every detail page

- **WHEN** the owner views any page under `/dashboard/wishlists/[id]`
- **THEN** the section navigation is visible with all four items

### Requirement: Responsive navigation presentation

The navigation SHALL present as horizontal tabs at the `md` breakpoint and above, and SHALL collapse to a single `Select` dropdown below `md`. Both presentations SHALL navigate to the same routes.

#### Scenario: Tabs on desktop and tablet

- **WHEN** the viewport width is at or above the `md` breakpoint
- **THEN** the navigation is shown as horizontal tabs and the dropdown is hidden

#### Scenario: Dropdown on mobile

- **WHEN** the viewport width is below the `md` breakpoint
- **THEN** the navigation is shown as a `Select` dropdown and the tabs are hidden
- **AND** choosing an option navigates to that section

### Requirement: Active section indication

The navigation SHALL clearly indicate which section is currently active based on the active route, in both the tab and dropdown presentations.

#### Scenario: Active tab highlighted

- **WHEN** the owner is on a given section's route
- **THEN** that section's tab is visually marked active and the other tabs are not

#### Scenario: Active option selected in dropdown

- **WHEN** the owner is on a given section's route below the `md` breakpoint
- **THEN** the `Select` shows that section as the selected value
