## ADDED Requirements

### Requirement: Brand logo header

The owner dashboard sidebar SHALL display the A Wish For brand logo in its header, linking to `/dashboard`. The logo SHALL be sourced from `public/assets/logo.svg`. The full wordmark SHALL render in the expanded state; a compact brand mark SHALL render in the collapsed icon state so the header fits the icon rail width.

#### Scenario: Expanded shows full wordmark

- **WHEN** the sidebar is in the expanded state
- **THEN** the full "A Wish For" wordmark logo is visible in the header
- **AND** clicking it navigates to `/dashboard`

#### Scenario: Collapsed shows compact mark

- **WHEN** the sidebar is in the collapsed icon state
- **THEN** the compact brand mark is visible (fits the icon rail width)
- **AND** the full wordmark is hidden

### Requirement: Claude Design app frame

The protected dashboard shell SHALL match the Claude Design app frame: an off-white page canvas containing a white, bordered, rounded dashboard surface. The sidebar trigger SHALL live in the sidebar header rather than as a standalone floating top bar in the content area.

#### Scenario: Dashboard shell renders as framed app

- **WHEN** an owner opens a protected dashboard route on desktop
- **THEN** the dashboard renders inside a rounded, bordered white app frame on the off-white app canvas
- **AND** there is no generic full-width top trigger bar before the page content

#### Scenario: Sidebar owns the trigger

- **WHEN** the sidebar is expanded
- **THEN** the collapse trigger is visible in the sidebar header near the brand
- **AND** activating it collapses the sidebar to the icon rail

### Requirement: Three sidebar states

The owner dashboard sidebar SHALL support three states: expanded (full width with labels), collapsed icon-rail (icons only, on desktop/tablet), and a mobile offcanvas sheet. The desktop expanded/collapsed state SHALL be toggleable via the sidebar trigger and the Cmd/Ctrl+B keyboard shortcut, and SHALL persist across reloads.

#### Scenario: Toggle to collapsed on desktop

- **WHEN** a desktop user activates the sidebar trigger while expanded
- **THEN** the sidebar collapses to an icon rail showing only icons
- **AND** the navigation remains operable

#### Scenario: Keyboard shortcut toggles state

- **WHEN** the user presses Cmd/Ctrl+B
- **THEN** the sidebar toggles between expanded and collapsed

#### Scenario: State persists across reload

- **WHEN** the user collapses the sidebar and reloads the page
- **THEN** the sidebar remains collapsed

#### Scenario: Mobile uses offcanvas sheet

- **WHEN** the viewport is mobile-width
- **THEN** the sidebar is presented as an offcanvas sheet rather than an inline rail

### Requirement: Navigation usable while collapsed

When the sidebar is collapsed to the icon rail, each navigation item SHALL expose a tooltip with its label so destinations remain identifiable without text labels.

#### Scenario: Tooltip appears on collapsed nav item

- **WHEN** the sidebar is collapsed and the user hovers a navigation icon
- **THEN** a tooltip with that item's label is shown

#### Scenario: No tooltip when expanded

- **WHEN** the sidebar is expanded
- **THEN** navigation item tooltips are not shown (labels are already visible)

### Requirement: Wishlist navigation and account footer

The sidebar SHALL list the owner's wishlists (from `wishlist.list`) with the active route highlighted, a link to dashboard home, and an account footer containing the Clerk user control. The footer account label SHALL hide in the collapsed icon state while the user control remains accessible.

The expanded sidebar SHALL follow the Claude Design navigation model: text wordmark header, `Inicio`, a nested `Mis wishlists` group with per-wishlist status chips, a `Nueva wishlist` action, utility links for analytics/settings/help, and an account footer that shows Clerk avatar plus user name/email when available.

#### Scenario: Active wishlist highlighted

- **WHEN** the user is viewing a wishlist detail route
- **THEN** that wishlist's sidebar item is rendered as active

#### Scenario: Empty wishlist state

- **WHEN** the owner has no wishlists
- **THEN** the sidebar shows the "Sin listas aún" empty hint instead of items

#### Scenario: Footer adapts when collapsed

- **WHEN** the sidebar is collapsed
- **THEN** the account text label is hidden and the Clerk user control stays clickable

#### Scenario: Expanded sidebar shows nested wishlist controls

- **WHEN** the sidebar is expanded
- **THEN** the `Mis wishlists` section shows each wishlist title indented under the section label
- **AND** each wishlist can show a compact status chip such as `Pub` or `Bor`
- **AND** the sidebar includes a `Nueva wishlist` link

#### Scenario: Expanded footer shows account details

- **WHEN** the sidebar is expanded and Clerk user details are available
- **THEN** the footer shows the user's display name and primary email next to the Clerk user control
