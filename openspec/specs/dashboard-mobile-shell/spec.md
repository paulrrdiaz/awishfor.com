# dashboard-mobile-shell Specification

## Purpose

Defines how the protected dashboard presents itself below the `md` breakpoint.

## Requirements

### Requirement: Three mobile chrome modes

Below the `md` breakpoint the protected dashboard SHALL present one of three chrome modes, chosen by the route rather than by responsive utilities on shared markup.

- **Root mode** — a title bar carrying the screen's identity and at most one action, plus the bottom tab bar. Applies to Inicio, Datos, and Cuenta.
- **Section mode** — the wishlist context bar, the section chip row, an optional action bar, and the bottom tab bar. Applies to the wishlist sections that are browsing surfaces.
- **Editor mode** — a bar carrying a back affordance, the screen title, and a save affordance; no chip row and no bottom tab bar; a commit bar pinned to the bottom. Applies to screens whose whole purpose is editing a pending draft.

A route SHALL render exactly one chrome mode. At `md` and above none of the three SHALL render and the desktop sidebar, topbar, and section tabs SHALL remain the chrome.

#### Scenario: A browsing section wears section mode

- **WHEN** the owner opens Regalos below `md`
- **THEN** the context bar, the chip row, and the bottom tab bar all render

#### Scenario: An editing section wears editor mode

- **WHEN** the owner opens Ajustes or Tema below `md`
- **THEN** the chip row and the bottom tab bar are absent, and a commit bar renders in their place

#### Scenario: Desktop keeps its own chrome

- **WHEN** the viewport is at `md` or above
- **THEN** no mobile chrome renders and the sidebar, topbar, and section tabs render

### Requirement: Persistent bottom navigation in root and section modes

In root and section mode the protected dashboard SHALL present its top-level destinations as a bottom tab bar fixed to the bottom of the viewport, positioned clear of the device safe-area inset. Destinations SHALL NOT be hidden behind a menu control. Only destinations whose routes resolve SHALL be rendered; a destination that would navigate nowhere SHALL be omitted. The tab matching the current route SHALL be distinguished without hover. In editor mode the tab bar SHALL NOT render, so that a pending edit is not abandoned by an accidental tap.

#### Scenario: Destinations are always visible while browsing

- **WHEN** a signed-in owner opens a root or section route below `md`
- **THEN** the bottom tab bar is visible without opening any menu

#### Scenario: Unresolved destinations are omitted

- **WHEN** a tab's destination route does not exist
- **THEN** that tab is absent rather than rendered as an inert or dead-ending control

#### Scenario: Active tab reflects the route

- **WHEN** the owner is on a wishlist section
- **THEN** the Wishlists tab is shown in the active treatment without hover

#### Scenario: An editing screen suppresses the tab bar

- **WHEN** the owner opens Tema below `md`
- **THEN** no bottom tab bar renders

### Requirement: Mobile wishlist context bar

In section mode the wishlist detail route SHALL replace the desktop topbar with a context bar containing a back affordance, the wishlist name opening the wishlist switcher, a section-scoped context line, and an overflow control opening the sections sheet. The desktop topbar's three separate actions SHALL NOT be crowded into this bar.

The context line SHALL describe what the current section is about rather than always repeating the wishlist status: on Regalos it SHALL carry the wishlist's publication status, and on Invitados it SHALL carry the guest and invitation counts. A section that declares no context line SHALL render the wishlist status as the default.

#### Scenario: Regalos shows publication status

- **WHEN** the owner opens Regalos below `md` on a published wishlist
- **THEN** the context line reads the published status

#### Scenario: Invitados shows guest counts instead of status

- **WHEN** the owner opens Invitados below `md` with four people across four invitations
- **THEN** the context line reports those counts rather than the wishlist status

#### Scenario: Switcher is reachable from the context bar

- **WHEN** the owner activates the wishlist name
- **THEN** the wishlist switcher opens

#### Scenario: Overflow opens the sections sheet

- **WHEN** the owner activates the overflow control
- **THEN** the sections sheet opens

### Requirement: Mobile section chips as a projection of the section model

In section mode the wishlist's sections SHALL render as a horizontally scrollable row of chips derived from the same section model as the desktop tabs, carrying the same labels and counts. The chip row SHALL be a projection of that model, not a mirror of the desktop ordering: it SHALL lead with the sections an owner works in most — Regalos, then Invitados — followed by Resumen and Tema.

Sections excluded from the chip row SHALL remain reachable, and the sections sheet SHALL be complete. Chip membership and ordering SHALL be derived, so a section added to or removed from the shared model appears in or disappears from both shells without a second edit.

#### Scenario: Chips lead with the working sections

- **WHEN** an owner or a collaborator opens a wishlist below `md`
- **THEN** the chip row reads Regalos, Invitados, Resumen, Tema in that order for both, since none of the four is owner-only

#### Scenario: Chips carry the same counts as the desktop tabs

- **WHEN** three invitations are pending
- **THEN** the Invitados chip carries the same pending count the desktop tab would carry

#### Scenario: Sections outside the chip row stay reachable

- **WHEN** an owner needs Colaboradores or Ajustes below `md`
- **THEN** those sections are absent from the chip row and present in the sections sheet

#### Scenario: Collaborators never see owner-only sections

- **WHEN** a collaborator opens the sections sheet
- **THEN** owner-only sections are absent from both the chip row and the sheet

### Requirement: Sections sheet

The sections sheet SHALL list every section available to the viewer with its icon, label, and count, marking the current section as active, together with `Ver pública` and `Compartir` actions separated from the section list.

#### Scenario: Sheet lists every section

- **WHEN** the owner opens the sections sheet
- **THEN** every section available to them appears with its icon, label, and count, alongside `Ver pública` and `Compartir`

#### Scenario: Selecting from the sheet navigates and closes it

- **WHEN** the owner selects a section from the sheet
- **THEN** the app navigates to that section and the sheet closes

#### Scenario: The current section is marked

- **WHEN** the owner opens the sheet from Regalos
- **THEN** the Regalos entry is shown in the active treatment

### Requirement: Thumb-reachable action bar

In section mode a wishlist section MAY declare an action bar pinned directly above the bottom tab bar, reachable without scrolling the section content. The bar SHALL carry at most one primary action and MAY carry one secondary action shown above it. A section that declares no action SHALL render no bar and its content SHALL extend to the tab bar.

In editor mode the pinned bar SHALL instead be a commit bar carrying a discard action and a save action, with save given the greater weight.

#### Scenario: Adding a gift without scrolling

- **WHEN** the owner opens Regalos below `md` with more gifts than fit the viewport
- **THEN** `Agregar regalo` is visible above the tab bar without scrolling

#### Scenario: Pending invitations surface a reminder above the primary action

- **WHEN** the owner opens Invitados below `md` with three pending invitations
- **THEN** a reminder action naming the pending count renders above `Agregar invitado`

#### Scenario: No pending invitations, no reminder

- **WHEN** no invitation is pending
- **THEN** the reminder action is absent and only the primary action renders

#### Scenario: Sections without an action render no bar

- **WHEN** the owner opens a section that declares no action
- **THEN** no action bar renders and the content extends to the tab bar

#### Scenario: Editing screens commit explicitly

- **WHEN** the owner opens Ajustes below `md`
- **THEN** a commit bar offers a discard action and a save action

### Requirement: Touch row actions with confirmation and undo

In section mode row-level actions SHALL be presented in a bottom action sheet rather than a hover-dependent menu. The sheet SHALL identify the row it acts on, list that row's actions, and place any destructive action last and visually distinguished. A destructive action SHALL require confirmation before it takes effect. A non-destructive action SHALL take effect immediately and SHALL offer an undo affordance for at least five seconds afterwards.

#### Scenario: Row actions are reachable by touch

- **WHEN** a touch user activates a row's overflow control
- **THEN** an action sheet identifies the row and lists its actions without requiring hover

#### Scenario: Deleting asks first

- **WHEN** the owner chooses a destructive action from the sheet
- **THEN** the action takes effect only after explicit confirmation

#### Scenario: Hiding a gift can be undone

- **WHEN** the owner hides a gift from the action sheet
- **THEN** the gift is hidden immediately and an undo affordance remains available for at least five seconds

### Requirement: Swipe-to-reveal quick action on gift rows

In section mode a gift row SHALL expose its most common action by horizontal swipe, in addition to — not instead of — the row's overflow control. The list SHALL tell the user the gesture exists. A horizontal swipe SHALL NOT be the only route to any action.

#### Scenario: Swiping a row reveals its quick action

- **WHEN** a touch user swipes a gift row horizontally
- **THEN** a quick action is revealed beside the row

#### Scenario: The gesture is discoverable

- **WHEN** the owner opens Regalos below `md` with at least one gift
- **THEN** the list states that swiping reveals actions

#### Scenario: Every swipe action is also in the sheet

- **WHEN** a user never swipes
- **THEN** every action reachable by swipe is also reachable from the row's action sheet

### Requirement: One-tap RSVP on guest cards

In section mode a guest card SHALL present the owner's RSVP decision as directly tappable choices on the card, without first opening a menu, sheet, or edit mode. The choices offered SHALL depend on the invitation's current state, and a card whose response is already recorded SHALL NOT offer them again. A card SHALL surface who recorded the response and when.

Recording a response SHALL take effect on a single tap. Reversing a recorded response SHALL remain explicitly confirmed, because it unlocks the guest's personal invitation link, and SHALL NOT be reduced to a bare undo affordance.

#### Scenario: An unanswered invitation offers both decisions

- **WHEN** the owner opens Invitados below `md` and a guest has not responded
- **THEN** that guest's card offers an attending choice and a not-attending choice directly on the card

#### Scenario: Recording takes one tap

- **WHEN** the owner taps the attending choice
- **THEN** the response is recorded without a further confirmation step

#### Scenario: An answered card reports its provenance

- **WHEN** a response was recorded by the owner
- **THEN** the card states that the owner recorded it and how long ago

#### Scenario: Reversing a recorded response is confirmed

- **WHEN** the owner reverses a recorded response
- **THEN** the reversal is confirmed explicitly before the guest's personal link is unlocked

#### Scenario: Pending guests offer a reminder

- **WHEN** a guest's invitation is unopened or unanswered
- **THEN** the card offers a per-guest reminder action

### Requirement: Explicit reorder mode

In section mode reordering SHALL require entering an explicit reorder mode from a control in the list's own toolbar. Reorder mode SHALL take over the screen: the chip row, the bottom tab bar, and every other row action SHALL be suppressed, the bar SHALL report that reordering is in progress, and each row SHALL expose a drag handle whose touch target is at least 44px. The mode SHALL end with an explicit save or cancel, and SHALL state that the order is saved on confirmation. Outside reorder mode a vertical drag SHALL scroll the page and SHALL NOT move rows.

#### Scenario: Dragging scrolls until reorder mode is entered

- **WHEN** a touch user drags vertically over the gift list outside reorder mode
- **THEN** the page scrolls and no row is moved

#### Scenario: Reorder mode takes over the screen

- **WHEN** the owner enters reorder mode
- **THEN** each row shows a drag handle of at least 44px, and the chip row, tab bar, and other row actions are suppressed

#### Scenario: Order is committed explicitly

- **WHEN** the owner rearranges rows and chooses save
- **THEN** the new order is persisted and reorder mode ends

#### Scenario: Cancelling discards the rearrangement

- **WHEN** the owner rearranges rows and chooses cancel
- **THEN** the previous order is restored and reorder mode ends

### Requirement: Full-screen share view

Below the `md` breakpoint `Compartir` SHALL open a full-screen view rather than a crowded sheet, reachable from the sections sheet. It SHALL offer a per-guest message with selectable template variants, a row of send targets led by WhatsApp, and a separate whole-list section carrying the public link. It SHALL retain the bottom tab bar and SHALL NOT render the section chip row. Any send target or artifact that is not implemented SHALL be omitted rather than shown inert.

#### Scenario: Sharing opens full screen

- **WHEN** the owner chooses `Compartir` from the sections sheet below `md`
- **THEN** a full-screen share view opens with the bottom tab bar retained and no chip row

#### Scenario: The message is addressed to the guest

- **WHEN** the share view opens for a specific guest
- **THEN** the message names that guest and carries their personal invitation link

#### Scenario: Template variants are selectable

- **WHEN** the owner switches the template variant
- **THEN** the message body changes to that variant

#### Scenario: Unimplemented targets are absent

- **WHEN** a send target or share artifact has no implementation
- **THEN** it is omitted rather than rendered as an inert control
