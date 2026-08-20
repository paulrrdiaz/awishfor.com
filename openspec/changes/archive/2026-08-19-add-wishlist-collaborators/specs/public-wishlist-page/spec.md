## MODIFIED Requirements

### Requirement: Guest purchase drawer

The public wishlist page SHALL allow a guest to open a modal purchase drawer from a non-purchased gift's primary action. The drawer SHALL require a guest name of 2 to 80 characters; accept an optional email validated when present and an optional message of at most 500 characters; omit phone collection; show a quantity selector only when the gift's remaining quantity is greater than one, constrained between one and the remaining quantity; display the exact guest consent copy "Al marcar este regalo como comprado, compartiremos tu nombre y los datos opcionales que ingreses con quienes organizan la lista."; and surface loading and error states while submitting.

The consent copy SHALL NOT describe the recipients of a guest's purchase details as a single person, because a wishlist may be shared with collaborators who can all see purchase records. It SHALL remain accurate for a wishlist with no collaborators.

The purchase view SHALL NOT show delivery details. When the gift has a product URL, it SHALL show a small `Ver producto` helper that switches the same drawer to the product departure view. The drawer SHALL use a bottom-drawer presentation at every viewport width, full-width on narrow screens and centered with a constrained width on wider screens, with a scrollable form body and a sticky primary action area.

#### Scenario: Guest opens the purchase drawer

- **WHEN** a guest activates the purchase action on a gift that is not fully purchased
- **THEN** the system opens the purchase drawer showing the required name field, optional email and message fields, consent copy, and a submit action
- **AND** no phone field or delivery block is shown

#### Scenario: Drawer presentation is consistent across viewports

- **WHEN** the purchase interaction opens at any supported viewport width
- **THEN** it renders as a bottom drawer rather than a centered dialog
- **AND** wider viewports constrain and center the drawer content while retaining its bottom edge

#### Scenario: Consent copy is exact

- **WHEN** the purchase drawer renders
- **THEN** it shows the consent copy "Al marcar este regalo como comprado, compartiremos tu nombre y los datos opcionales que ingreses con quienes organizan la lista."

#### Scenario: Consent copy holds when the wishlist is shared

- **WHEN** the purchase drawer renders for a wishlist that has collaborators
- **THEN** the consent copy accurately describes that the guest's name and optional details are visible to the people organizing the list
- **AND** the copy is identical to the copy shown for a wishlist with no collaborators

#### Scenario: Guest name is required

- **WHEN** the guest submits the drawer with an empty name or a name outside 2 to 80 characters
- **THEN** the drawer shows a validation error and does not submit the purchase

#### Scenario: Optional fields are validated

- **WHEN** the guest provides an invalid email or a message longer than 500 characters
- **THEN** the drawer shows a validation error and does not submit the purchase

#### Scenario: Quantity selector visibility

- **WHEN** the gift's remaining quantity is greater than one
- **THEN** the drawer shows a quantity selector constrained between one and the remaining quantity

#### Scenario: Quantity selector hidden for single-unit gifts

- **WHEN** the gift's remaining quantity is one
- **THEN** the drawer does not show a quantity selector and submits a quantity of one

#### Scenario: Product helper is conditional

- **WHEN** the purchase drawer opens for a gift with a product URL
- **THEN** it shows a small `Ver producto` helper
- **AND WHEN** the gift has no product URL
- **THEN** the helper is absent and the rest of the form is unchanged

#### Scenario: Submission states

- **WHEN** the guest submits a valid purchase
- **THEN** the drawer shows a loading state while the request is in flight and an inline retryable error state if the request fails

#### Scenario: Drawer dismissal is accessible

- **WHEN** the guest dismisses the purchase drawer through its close control, Escape, backdrop interaction, or downward swipe
- **THEN** the drawer closes without submitting a purchase and focus returns to the action that opened it
