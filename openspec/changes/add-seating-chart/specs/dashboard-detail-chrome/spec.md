## MODIFIED Requirements

### Requirement: Horizontal section tabs

The wishlist detail route SHALL render its sections as a horizontal row of tabs placed directly below the wishlist title and above the content pane. Each tab SHALL show its section name as visible text at every viewport width, SHALL link to that section, and SHALL NOT depend on hover to reveal its name. The tab matching the active route SHALL be visually distinguished without hover. The row SHALL scroll horizontally when the tabs exceed the available width. Sections SHALL appear in the order Resumen, Regalos, Invitados, Mesas, Tema, Colaboradores, Ajustes, with Colaboradores rendered only for the wishlist owner.

#### Scenario: Tabs render with visible names

- **WHEN** the wishlist detail layout renders at any viewport width
- **THEN** every tab shows its section name as visible text without requiring hover

#### Scenario: Active tab reflects the current route

- **WHEN** the owner loads `/dashboard/wishlists/[id]/guests` directly
- **THEN** the Invitados tab is rendered in the active treatment without requiring a prior click

#### Scenario: Collaborator does not see the owner-only section

- **WHEN** a collaborator opens a wishlist section
- **THEN** the Colaboradores tab is absent and the remaining tabs render in order
- **AND** the Mesas tab is present, because seating is not owner-only

#### Scenario: Overflowing tabs remain reachable

- **WHEN** the tabs are wider than the available width
- **THEN** the row scrolls horizontally so every section can be reached

#### Scenario: Section labels follow the approved naming

- **WHEN** the tabs render
- **THEN** the design section reads `Tema` and the settings section reads `Ajustes`, while their route segments remain `design` and `settings`
- **AND** the seating section reads `Mesas` while its route segment remains `seating`

#### Scenario: The seating tab is active on its nested print route

- **WHEN** an authorized user loads `/dashboard/wishlists/[id]/seating/print`
- **THEN** the Mesas tab is rendered in the active treatment

### Requirement: Section tab badges

A section tab MAY carry a badge conveying a count or a pending state. The Regalos tab SHALL show the wishlist's visible gift count. The Invitados tab SHALL show the number of invitations still awaiting a response, styled as a warning when that number is greater than zero. The Mesas tab SHALL show the number of eligible people who have no table yet, styled as a warning, and only once the wishlist has at least one table. A badge SHALL be omitted entirely when its value is zero or unavailable rather than rendering a zero.

#### Scenario: Gift count appears on the Regalos tab

- **WHEN** a wishlist has four visible gifts
- **THEN** the Regalos tab renders a badge reading `4`

#### Scenario: Pending invitations are surfaced as a warning

- **WHEN** three invitations are still awaiting a response
- **THEN** the Invitados tab renders a warning-styled badge naming three pending

#### Scenario: Unseated guests are surfaced as a warning

- **WHEN** a wishlist has at least one table and seven eligible people without a table
- **THEN** the Mesas tab renders a warning-styled badge naming seven unseated

#### Scenario: No badge before the floor plan exists

- **WHEN** a wishlist has eligible guests and no tables at all
- **THEN** the Mesas tab renders no badge, because nobody could have been seated yet

#### Scenario: Zero counts render no badge

- **WHEN** a wishlist has no visible gifts, no pending invitations, and everyone seated
- **THEN** none of the Regalos, Invitados, or Mesas tabs renders a badge
