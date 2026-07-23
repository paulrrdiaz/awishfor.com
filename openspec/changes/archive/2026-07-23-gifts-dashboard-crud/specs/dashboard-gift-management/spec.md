## ADDED Requirements

### Requirement: Owner adds a gift from the dashboard
The system SHALL allow an authenticated owner to add a new gift to a wishlist they own directly from the Regalos tab, via an add/edit sheet that supports both importing from a product URL and manual entry, authorized against wishlist ownership.

#### Scenario: Owner opens the add-gift sheet
- **WHEN** the owner activates `Agregar regalo` on the Regalos tab
- **THEN** the system opens an add gift sheet with an import-from-URL section and manual fields for name, store, category, price with currency, quantity, product link, guest note, and the `infaltable` and `visible` toggles

#### Scenario: Owner imports gift data from a URL
- **WHEN** the owner enters a product URL in the sheet and requests import
- **THEN** the system attempts to prefill name, image, store, and price from that URL, leaving the fields editable

#### Scenario: Owner saves a valid new gift
- **WHEN** the owner submits the sheet with a valid gift name
- **THEN** the system creates the gift on that wishlist, appends it to the current ordering, and the new gift appears in the Regalos list

#### Scenario: Invalid new gift is rejected
- **WHEN** the owner submits the sheet without a valid name or with an invalid price or URL
- **THEN** the system rejects the submission and shows field-level validation without creating a gift

#### Scenario: Adding to a non-owned wishlist is rejected
- **WHEN** a signed-in user attempts to add a gift to a wishlist they do not own
- **THEN** the system denies the action and creates no gift

#### Scenario: Unauthenticated add is rejected
- **WHEN** an unauthenticated request attempts to add a gift
- **THEN** the system rejects the request as unauthorized

### Requirement: Owner duplicates a gift
The system SHALL allow the owner to duplicate an existing gift on a wishlist they own, creating an independent copy of the gift's editable fields without copying its purchases.

#### Scenario: Owner duplicates a gift
- **WHEN** the owner chooses `Duplicar` from a gift's action menu
- **THEN** the system creates a new gift copying the original's name, store, category, price, quantity, link, note, priority, and visibility, placed in the ordering, and carrying no purchase records

#### Scenario: Duplicate of a non-owned gift is rejected
- **WHEN** a signed-in user attempts to duplicate a gift that does not belong to a wishlist they own
- **THEN** the system denies the action and creates no gift

### Requirement: Owner toggles gift priority from the row menu
The system SHALL let the owner mark a gift as `infaltable` (high priority) or clear that mark from the gift's row action menu, authorized against wishlist ownership.

#### Scenario: Owner marks a gift infaltable
- **WHEN** the owner selects `Marcar infaltable` for a standard-priority gift they own
- **THEN** the system sets the gift priority to high and the row shows the `★ Infaltable` badge

#### Scenario: Owner clears the infaltable mark
- **WHEN** the owner clears the infaltable mark on a high-priority gift they own
- **THEN** the system sets the gift priority back to standard and removes the `★ Infaltable` badge

### Requirement: Dashboard gift mutations run as server actions
Dashboard gift create, update, duplicate, visibility change, priority change, delete, and reorder SHALL be performed through server actions that authorize ownership and reuse the gift service layer, refreshing the Regalos tab after a successful mutation.

#### Scenario: Mutation refreshes the tab
- **WHEN** a dashboard gift server action completes successfully
- **THEN** the Regalos tab reflects the change without a full manual page navigation by the owner

#### Scenario: Server action authorizes ownership
- **WHEN** a dashboard gift server action is invoked for a gift or wishlist the caller does not own
- **THEN** the action denies the request and performs no mutation

### Requirement: Desktop Regalos tab presentation matches design
The Regalos tab SHALL render on desktop using the app theme per design §6c: a header with wishlist title, status, and public link; the detail tabs; a toolbar with the gift count, a reorder hint, `Importar desde enlace`, and `Agregar regalo`; a second toolbar row with search, status filter chips, and sort; and gift rows composed of a drag handle, thumbnail, name with optional `★ Infaltable`, store and category, price, purchase progress with a bar, a status badge, an `Editar` action, and a `⋯` action menu.

#### Scenario: Regalos tab renders the §6c layout on desktop
- **WHEN** an owner views the Regalos tab of their wishlist on a desktop viewport
- **THEN** the system renders the header, tabs, both toolbar rows, and app-theme gift rows as specified, using semantic app-theme tokens rather than ad-hoc colors

#### Scenario: Row action menu exposes management actions
- **WHEN** the owner opens a gift row's `⋯` action menu
- **THEN** the menu offers `Editar`, `Duplicar`, mark/clear `infaltable`, hide/show, and `Eliminar`, with `Eliminar` visually marked as destructive

#### Scenario: Purchased and hidden rows are de-emphasized
- **WHEN** a gift is fully purchased or hidden
- **THEN** its row is de-emphasized (reduced opacity, purchased name struck through) and hidden rows show a `Oculto` badge with a `Mostrar` affordance
