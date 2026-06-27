## ADDED Requirements

### Requirement: Guest purchase modal

The public wishlist page SHALL allow a guest to open a purchase modal from a non-purchased gift's primary action. The modal SHALL require a guest name of 2 to 80 characters; accept an optional email validated when present, an optional phone validated when present, and an optional message of at most 500 characters; show a quantity selector only when the gift's remaining quantity is greater than one, constrained between one and the remaining quantity; display guest consent copy; and surface loading and error states while submitting. The product link SHALL be disabled for gifts whose public status is purchased.

#### Scenario: Guest opens the purchase modal
- **WHEN** a guest activates the purchase action on a gift that is not fully purchased
- **THEN** the system opens the purchase modal showing the name field, optional contact and message fields, consent copy, and a submit action

#### Scenario: Guest name is required
- **WHEN** the guest submits the modal with an empty name or a name outside 2 to 80 characters
- **THEN** the modal shows a validation error and does not submit the purchase

#### Scenario: Optional contact and message validation
- **WHEN** the guest provides an invalid email, an invalid phone, or a message longer than 500 characters
- **THEN** the modal shows a validation error and does not submit the purchase

#### Scenario: Quantity selector visibility
- **WHEN** the gift's remaining quantity is greater than one
- **THEN** the modal shows a quantity selector constrained between one and the remaining quantity

#### Scenario: Quantity selector hidden for single-unit gifts
- **WHEN** the gift's remaining quantity is one
- **THEN** the modal does not show a quantity selector and submits a quantity of one

#### Scenario: Submission states
- **WHEN** the guest submits a valid purchase
- **THEN** the modal shows a loading state while the request is in flight and shows an error state if the request fails

#### Scenario: Purchased gift product link disabled
- **WHEN** a gift's public status is purchased
- **THEN** the gift's product link is disabled
