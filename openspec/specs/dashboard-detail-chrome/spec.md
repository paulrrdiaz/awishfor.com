# dashboard-detail-chrome Specification

## Purpose
TBD - created by archiving change redesign-wishlist-detail-chrome. Update Purpose after archive.
## Requirements
### Requirement: Fixed wishlist topbar

The wishlist detail route SHALL render a fixed 55px topbar as the first element of the detail layout, containing on the left the breadcrumb and the wishlist status badge, and on the right the `Ver pública`, `⋯`, and `+ Crear wishlist` actions. The topbar SHALL sit on the card surface with a bottom border, SHALL NOT scroll with the content pane, and SHALL be the only place these actions appear.

#### Scenario: Topbar renders on every wishlist section

- **WHEN** the owner opens any of `/dashboard/wishlists/[id]`, `/gifts`, `/guests`, `/design`, or `/settings`
- **THEN** the topbar renders with the breadcrumb, status badge, and the three actions

#### Scenario: Topbar stays fixed while content scrolls

- **WHEN** the owner scrolls a section whose content exceeds the viewport
- **THEN** the topbar remains visible at the top of the content area

#### Scenario: Breadcrumb names the active section

- **WHEN** the owner is on a section other than Resumen
- **THEN** the breadcrumb renders three segments — `Mis wishlists`, the wishlist title, and the active section name

#### Scenario: Breadcrumb omits the section on Resumen

- **WHEN** the owner is on the Resumen section
- **THEN** the breadcrumb renders two segments — `Mis wishlists` and the wishlist title

### Requirement: Vertical section rail replaces tab navigation

The wishlist detail route SHALL render a persistent 60px vertical rail immediately below the topbar and beside the content pane, containing exactly five items in order: Resumen, Regalos, Invitados, Diseño, Configuración. Each item SHALL be a link to its section, SHALL render as a 40x40 target, and the item matching the active route SHALL be filled with the primary color. At the `md` breakpoint and above, items SHALL render icon-only with the label delivered by a hover tooltip and by an accessible name available to assistive technology.

#### Scenario: Rail renders all five sections

- **WHEN** the wishlist detail layout renders at `md` or above
- **THEN** the rail shows five items linking to the summary, gifts, guests, design, and settings routes

#### Scenario: Active item reflects the current route

- **WHEN** the owner loads `/dashboard/wishlists/[id]/guests` directly
- **THEN** the Invitados item is rendered in the active treatment without requiring a prior click

#### Scenario: Rail stays reachable on long content

- **WHEN** the owner scrolls to the bottom of a section with more content than fits the viewport
- **THEN** the rail remains visible and every section is still one click away

#### Scenario: Icon-only items expose an accessible name

- **WHEN** a screen reader reaches a rail item at `md` or above
- **THEN** the item's section name is announced even though no visible text label is rendered

#### Scenario: Hovering an item reveals its label

- **WHEN** a pointer user hovers a rail item at `md` or above
- **THEN** a tooltip showing that section's name appears

### Requirement: Labeled rail strip below the md breakpoint

Below the `md` breakpoint the rail SHALL render as a horizontal, horizontally scrollable strip placed between the topbar and the content, and each item SHALL show its icon together with its visible text label. The tooltip SHALL NOT be the only source of the label at these widths.

#### Scenario: Narrow viewport shows labels

- **WHEN** the viewport is below the `md` breakpoint
- **THEN** each rail item renders its icon and its visible text label

#### Scenario: Overflowing items remain reachable

- **WHEN** the five items are wider than the viewport
- **THEN** the strip scrolls horizontally so every item can be reached

#### Scenario: Active item is identifiable without hover

- **WHEN** a touch user views the strip
- **THEN** the item matching the active route is visibly distinguished without any hover interaction

### Requirement: Shared title block

The wishlist detail layout SHALL render the wishlist title as the route's only `h1`, on a single baseline-aligned row together with the public URL and a copy affordance. The status badge and the wishlist-level action buttons SHALL NOT appear in this block. Section pages SHALL render their own heading below it at a lower level.

#### Scenario: Title block renders once per section

- **WHEN** the owner opens any wishlist section
- **THEN** the wishlist title, its public URL, and the copy affordance render once, above the section's own content

#### Scenario: Copying the public URL

- **WHEN** the owner activates the copy affordance
- **THEN** the wishlist's full public URL is written to the clipboard and the affordance confirms the copy

#### Scenario: Copy failure is surfaced

- **WHEN** the clipboard write fails
- **THEN** the owner is told the copy did not succeed rather than being shown a success state

#### Scenario: Single h1 per route

- **WHEN** any wishlist section renders
- **THEN** the document contains exactly one `h1`, holding the wishlist title

### Requirement: App-shell scroll model

The protected dashboard shell SHALL occupy the viewport height rather than growing with its content, and scrolling SHALL be confined to the content pane so that the sidebar, topbar, and rail remain fixed. Routes rendered inside the shell SHALL provide their own scroll container.

#### Scenario: Only the content pane scrolls

- **WHEN** the owner scrolls a wishlist section longer than the viewport
- **THEN** the sidebar, topbar, and rail stay in place while the content moves

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
- **THEN** the wishlist's status becomes the chosen state and the topbar status badge updates to match

### Requirement: Section resolution for aliased routes

The active rail item SHALL be derived from the current pathname. Routes nested under the wishlist that do not correspond to a rail item SHALL resolve to the rail item they belong to rather than defaulting to Resumen. The `categories` segment SHALL resolve to Regalos.

#### Scenario: Categories route highlights Regalos

- **WHEN** the owner opens `/dashboard/wishlists/[id]/categories`
- **THEN** the Regalos rail item is shown as active and the breadcrumb's third segment reads `Regalos`

#### Scenario: Unknown nested segment falls back to Resumen

- **WHEN** the owner opens a nested route under the wishlist that maps to no rail item and has no alias
- **THEN** the Resumen item is shown as active

