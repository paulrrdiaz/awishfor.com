## ADDED Requirements

### Requirement: Fixed global sidebar destinations

The protected dashboard sidebar SHALL offer exactly four destinations in order: `Inicio`, `Mis wishlists`, `Mi cuenta`, and `Ayuda y soporte`. The sidebar SHALL NOT list individual wishlists, so its height SHALL be independent of how many wishlists the owner has. `Inicio` SHALL link to `/dashboard`. `Mis wishlists` SHALL link to `/dashboard/wishlists` and SHALL carry a badge with the number of the owner's non-archived wishlists. `Mi cuenta` SHALL open the account profile. The sidebar SHALL render the brand isotype in its header and the signed-in user in its footer, and SHALL remain collapsible to an icon-only width.

#### Scenario: Sidebar lists four destinations

- **WHEN** a signed-in owner opens any protected route
- **THEN** the sidebar shows Inicio, Mis wishlists, Mi cuenta, and Ayuda y soporte, and no individual wishlist entries

#### Scenario: Sidebar height does not grow with wishlists

- **WHEN** an owner with twenty wishlists opens the dashboard
- **THEN** the sidebar still shows exactly the four destinations

#### Scenario: Mis wishlists is active across the section

- **WHEN** the owner opens `/dashboard/wishlists/[id]/gifts`
- **THEN** the `Mis wishlists` destination renders in the active treatment

#### Scenario: Wishlist count is badged

- **WHEN** the owner has three non-archived wishlists
- **THEN** the `Mis wishlists` destination renders a badge reading `3`

#### Scenario: Account is reachable from the sidebar

- **WHEN** the owner activates `Mi cuenta`
- **THEN** the account profile opens

#### Scenario: Collapsed sidebar keeps every destination reachable

- **WHEN** the owner collapses the sidebar
- **THEN** all four destinations remain present as icons with accessible names

### Requirement: Wishlist switcher

The wishlist detail topbar SHALL offer a switcher as the first level of its breadcrumb, showing the current wishlist's name and a status indicator. Opening the switcher SHALL present the owner's non-archived wishlists, each with a status indicator, a summary line, and a status pill, together with a filter input, a `Nueva wishlist` action linking to the creation flow, and a link to the full list including archived wishlists. Choosing a wishlist SHALL navigate to that wishlist, preserving the current section when that section exists for the target and falling back to the target's Resumen otherwise. The switcher SHALL be operable by keyboard.

#### Scenario: Switcher lists the owner's wishlists

- **WHEN** the owner opens the switcher
- **THEN** each of their non-archived wishlists appears with a status indicator, a summary line, and a status pill

#### Scenario: Switching preserves the current section

- **WHEN** the owner is on Regalos and switches to another wishlist
- **THEN** they arrive on that wishlist's Regalos section

#### Scenario: Switching falls back to Resumen

- **WHEN** the owner is on a section the target wishlist does not offer them
- **THEN** they arrive on the target wishlist's Resumen section

#### Scenario: Filtering narrows the list

- **WHEN** the owner types into the switcher's filter input
- **THEN** only wishlists matching the entered text remain listed

#### Scenario: Switcher offers creation and the full list

- **WHEN** the switcher is open
- **THEN** it offers a `Nueva wishlist` action and a link to the full list including archived wishlists

#### Scenario: Switcher is keyboard operable

- **WHEN** a keyboard user opens the switcher
- **THEN** they can move through the listed wishlists and choose one without a pointer
