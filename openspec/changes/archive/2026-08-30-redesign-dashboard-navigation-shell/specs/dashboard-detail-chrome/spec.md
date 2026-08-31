## REMOVED Requirements

### Requirement: Vertical section rail replaces tab navigation

**Reason**: The icon-only rail hid every section name behind a hover tooltip, which is unreachable by touch and slow by pointer. Replaced by named horizontal tabs.

**Migration**: Route segments are unchanged, so no links break. `WishlistSectionRail` is deleted and replaced by `WishlistSectionTabs`.

### Requirement: Labeled rail strip below the md breakpoint

**Reason**: The tabs are label-first and horizontally scrollable at every width, so a separate narrow-viewport idiom is no longer needed.

**Migration**: Behavior below `md` is subsumed by the tabs requirement; the dedicated mobile shell is specified separately in `dashboard-mobile-shell`.

### Requirement: Shared title block

**Reason**: The block carried the wishlist title, the public URL, and a copy affordance on one row. The URL and copy affordance now belong to the published status strip, where they are reachable from every section rather than only where the title renders.

**Migration**: Replaced by `Wishlist title heading`, which keeps the single-`h1` guarantee. The `Copying the public URL` and `Copy failure is surfaced` scenarios move to `Persistent wishlist status strip`.

## MODIFIED Requirements

### Requirement: Fixed wishlist topbar

The wishlist detail route SHALL render a fixed 55px topbar as the first element of the detail layout, containing on the left a breadcrumb whose first level is the wishlist switcher and whose second level is the active section name, and on the right the `Ver pública`, `⋯`, and `+ Crear wishlist` actions. The topbar SHALL NOT render the wishlist status badge, which belongs to the status strip. The topbar SHALL sit on the card surface with a bottom border, SHALL NOT scroll with the content pane, and SHALL be the only place these actions appear.

#### Scenario: Topbar renders on every wishlist section

- **WHEN** the owner opens any of `/dashboard/wishlists/[id]`, `/gifts`, `/guests`, `/design`, or `/settings`
- **THEN** the topbar renders with the switcher, the active section name, and the three actions

#### Scenario: Topbar stays fixed while content scrolls

- **WHEN** the owner scrolls a section whose content exceeds the viewport
- **THEN** the topbar remains visible at the top of the content area

#### Scenario: Breadcrumb names the active section

- **WHEN** the owner is on a section other than Resumen
- **THEN** the breadcrumb renders the switcher followed by the active section name

#### Scenario: Breadcrumb omits the section on Resumen

- **WHEN** the owner is on the Resumen section
- **THEN** the breadcrumb renders the switcher alone

#### Scenario: Status is not duplicated in the topbar

- **WHEN** any wishlist section renders
- **THEN** the wishlist status appears in the status strip and not in the topbar

### Requirement: App-shell scroll model

The protected dashboard shell SHALL occupy the viewport height rather than growing with its content, and scrolling SHALL be confined to the content pane so that the sidebar, topbar, status strip, and section tabs remain fixed. Routes rendered inside the shell SHALL provide their own scroll container.

#### Scenario: Only the content pane scrolls

- **WHEN** the owner scrolls a wishlist section longer than the viewport
- **THEN** the sidebar, topbar, status strip, and tabs stay in place while the content moves

#### Scenario: Dashboard routes are not clipped

- **WHEN** the owner opens `/dashboard` or `/dashboard/wishlists` with more content than fits the viewport
- **THEN** all content remains reachable by scrolling within the route's own scroll container

### Requirement: Wishlist actions menu

The topbar's `⋯` control SHALL open a menu offering Copiar enlace and, for a wishlist that is not archived, Archivar. Archiving SHALL require confirmation. For an archived wishlist the menu SHALL instead offer Restaurar, which SHALL present the choice of restoring as published or as a draft.

#### Scenario: Menu opens with actions

- **WHEN** the owner activates the `⋯` control on a published or draft wishlist
- **THEN** a menu appears containing Copiar enlace and Archivar

#### Scenario: Archiving asks for confirmation

- **WHEN** the owner chooses Archivar
- **THEN** a confirmation dialog appears and the wishlist is archived only after the owner confirms

#### Scenario: Restoring offers both target states

- **WHEN** the owner opens the menu on an archived wishlist and chooses Restaurar
- **THEN** a dialog offers `Restaurar publicada` and `Restaurar como borrador`, alongside a cancel action

#### Scenario: Restored wishlist reflects the chosen state

- **WHEN** the owner confirms one of the two restore options
- **THEN** the wishlist's status becomes the chosen state and the status strip switches to the variant matching that status

### Requirement: Section resolution for aliased routes

The active section tab SHALL be derived from the current pathname. Routes nested under the wishlist that do not correspond to a tab SHALL resolve to the tab they belong to rather than defaulting to Resumen. The `categories` segment SHALL resolve to Regalos.

#### Scenario: Categories route highlights Regalos

- **WHEN** the owner opens `/dashboard/wishlists/[id]/categories`
- **THEN** the Regalos tab is shown as active and the breadcrumb's section name reads `Regalos`

#### Scenario: Unknown nested segment falls back to Resumen

- **WHEN** the owner opens a nested route under the wishlist that maps to no tab and has no alias
- **THEN** the Resumen tab is shown as active

## ADDED Requirements

### Requirement: Wishlist title heading

The wishlist detail layout SHALL render the wishlist title as the route's only `h1`, immediately above the section tabs. The status badge, the public URL, the copy affordance, and the wishlist-level action buttons SHALL NOT appear in this row. Section pages SHALL render their own heading below it at a lower level.

#### Scenario: Title renders once per section

- **WHEN** the owner opens any wishlist section
- **THEN** the wishlist title renders once, above the tabs and above the section's own content

#### Scenario: Single h1 per route

- **WHEN** any wishlist section renders
- **THEN** the document contains exactly one `h1`, holding the wishlist title

#### Scenario: Title row carries no actions

- **WHEN** any wishlist section renders
- **THEN** the title row contains no status badge, no public URL, and no copy affordance

### Requirement: Horizontal section tabs

The wishlist detail route SHALL render its sections as a horizontal row of tabs placed directly below the wishlist title and above the content pane. Each tab SHALL show its section name as visible text at every viewport width, SHALL link to that section, and SHALL NOT depend on hover to reveal its name. The tab matching the active route SHALL be visually distinguished without hover. The row SHALL scroll horizontally when the tabs exceed the available width. Sections SHALL appear in the order Resumen, Regalos, Invitados, Tema, Colaboradores, Ajustes, with Colaboradores rendered only for the wishlist owner.

#### Scenario: Tabs render with visible names

- **WHEN** the wishlist detail layout renders at any viewport width
- **THEN** every tab shows its section name as visible text without requiring hover

#### Scenario: Active tab reflects the current route

- **WHEN** the owner loads `/dashboard/wishlists/[id]/guests` directly
- **THEN** the Invitados tab is rendered in the active treatment without requiring a prior click

#### Scenario: Collaborator does not see the owner-only section

- **WHEN** a collaborator opens a wishlist section
- **THEN** the Colaboradores tab is absent and the remaining tabs render in order

#### Scenario: Overflowing tabs remain reachable

- **WHEN** the tabs are wider than the available width
- **THEN** the row scrolls horizontally so every section can be reached

#### Scenario: Section labels follow the approved naming

- **WHEN** the tabs render
- **THEN** the design section reads `Tema` and the settings section reads `Ajustes`, while their route segments remain `design` and `settings`

### Requirement: Section tab badges

A section tab MAY carry a badge conveying a count or a pending state. The Regalos tab SHALL show the wishlist's visible gift count. The Invitados tab SHALL show the number of invitations still awaiting a response, styled as a warning when that number is greater than zero. A badge SHALL be omitted entirely when its value is zero or unavailable rather than rendering a zero.

#### Scenario: Gift count appears on the Regalos tab

- **WHEN** a wishlist has four visible gifts
- **THEN** the Regalos tab renders a badge reading `4`

#### Scenario: Pending invitations are surfaced as a warning

- **WHEN** three invitations are still awaiting a response
- **THEN** the Invitados tab renders a warning-styled badge naming three pending

#### Scenario: Zero counts render no badge

- **WHEN** a wishlist has no visible gifts and no pending invitations
- **THEN** neither the Regalos nor the Invitados tab renders a badge

### Requirement: Persistent wishlist status strip

The wishlist detail layout SHALL render a status strip between the topbar and the wishlist title, present on every section of the wishlist. The strip SHALL render exactly one variant, determined by the wishlist's status.

For a draft wishlist the strip SHALL state that the list is not yet visible, list the publish readiness items with their met and unmet state, show progress as a count of met items over total items, and offer the publish action. For a published wishlist the strip SHALL show the public URL, the recorded view count, and the `Copiar enlace` and `WhatsApp` share actions. For an archived wishlist the strip SHALL state that the list is archived and offer the restore action.

#### Scenario: Draft state is visible from every section

- **WHEN** the owner of a draft wishlist opens Regalos
- **THEN** the strip states the list is a draft and shows the readiness items and publish action without the owner navigating to Resumen

#### Scenario: Readiness progress reflects met items

- **WHEN** three of five readiness items are met
- **THEN** the strip shows progress as three of five and marks the two unmet items

#### Scenario: Published state offers sharing from every section

- **WHEN** the owner of a published wishlist opens Invitados
- **THEN** the strip shows the public URL and the copy and WhatsApp actions

#### Scenario: Copying the public URL

- **WHEN** the owner activates `Copiar enlace`
- **THEN** the wishlist's full public URL is written to the clipboard and the strip confirms the copy

#### Scenario: Copy failure is surfaced

- **WHEN** the clipboard write fails
- **THEN** the owner is told the copy did not succeed rather than being shown a success state

#### Scenario: Archived state offers restore

- **WHEN** the owner opens an archived wishlist
- **THEN** the strip states the list is archived and offers the restore action

#### Scenario: Exactly one variant renders

- **WHEN** any wishlist section renders
- **THEN** the strip shows the single variant matching the wishlist's status and no other
