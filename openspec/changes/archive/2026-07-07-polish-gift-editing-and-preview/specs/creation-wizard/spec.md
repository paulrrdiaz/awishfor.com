## MODIFIED Requirements

### Requirement: Gifts step with local draft gifts

The Gifts step SHALL let the user add, edit, and remove gifts that are stored in the wizard draft store as local draft gifts (no database write). Each gift SHALL support a name, optional product URL, optional image, optional price, a category assignment, a quantity, a priority, public and internal notes, and a hide toggle. The edit action SHALL open a drawer for the selected draft gift while preserving the Gifts step list and preview context. The selected draft gift id SHALL be represented in the URL query string so the drawer state is addressable and clearable. A URL-import entry point SHALL be present as a placeholder.

#### Scenario: Add a manual gift without a product URL

- **WHEN** the user fills in a gift name (and no product URL) and saves
- **THEN** a draft gift is added to the store and appears in the gift list

#### Scenario: Assign category and quantity

- **WHEN** the user assigns a gift to one of the draft categories and sets a quantity
- **THEN** the draft gift stores that category and quantity

#### Scenario: Edit a draft gift from the list

- **WHEN** the user activates `Editar` for a draft gift in the Gifts step list
- **THEN** the system opens a drawer containing that gift's editable fields without replacing the whole Gifts step
- **AND** the URL contains the selected draft gift id as a query param

#### Scenario: Save edited draft gift from the drawer

- **WHEN** the user changes draft gift fields in the drawer and saves
- **THEN** the wizard draft store updates that gift
- **AND** the drawer closes
- **AND** the gift id query param is cleared
- **AND** the list and guest preview reflect the updated values

#### Scenario: Close edit drawer without saving

- **WHEN** the edit drawer is open and the user cancels or dismisses it
- **THEN** the drawer closes
- **AND** the gift id query param is cleared
- **AND** the draft gift remains unchanged

#### Scenario: Open drawer from gift id query param

- **WHEN** the user is on the Gifts step with a gift id query param matching an existing draft gift
- **THEN** the edit drawer opens for that gift

#### Scenario: Unknown gift id query param

- **WHEN** the user is on the Gifts step with a gift id query param that does not match an existing draft gift
- **THEN** no edit drawer opens
- **AND** no draft gift is modified

#### Scenario: Hidden gifts are excluded from the visible list and preview

- **WHEN** the user toggles a gift to hidden
- **THEN** that gift is excluded from the public preview and does not count toward visible-gift readiness

#### Scenario: Remove a gift

- **WHEN** the user removes a gift
- **THEN** the gift is deleted from the draft store and the list

## ADDED Requirements

### Requirement: Gifts step preview shows complete product images

The Gifts step guest preview SHALL render gift images so the complete product image is visible within a stable card media area. The preview layout SHALL use the available desktop width efficiently, including a three-column gift card layout on wide viewports when space allows.

#### Scenario: Product image is not cropped in preview

- **WHEN** a visible draft gift has an image URL
- **THEN** the Gifts step guest preview shows the complete image within the card media area without cropping off product edges

#### Scenario: Preview uses three columns when space allows

- **WHEN** the Gifts step preview pane has enough horizontal space for three gift cards
- **THEN** visible preview gifts render in a three-column grid

#### Scenario: Preview remains responsive when narrow

- **WHEN** the Gifts step preview pane is too narrow for three gift cards
- **THEN** the preview falls back to fewer columns without overlapping card content or clipping text
