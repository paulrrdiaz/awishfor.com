## ADDED Requirements

### Requirement: Owner purchase record listing
The system SHALL allow an authenticated wishlist owner to list purchase records for a non-deleted gift they own, including guest name, optional guest email, optional guest phone, optional message, quantity, and timestamps.

#### Scenario: Owner lists purchase records for an owned gift
- **WHEN** an authenticated owner requests purchases for a gift in their wishlist
- **THEN** the system returns that gift's purchase records with owner-visible guest details

#### Scenario: Non-owner cannot list purchase records
- **WHEN** an authenticated user requests purchases for a gift that is missing, deleted, or belongs to another owner
- **THEN** the system rejects the request and returns no purchase records

#### Scenario: Unauthenticated user cannot list purchase records
- **WHEN** an unauthenticated request asks for gift purchase records
- **THEN** the system rejects the request as unauthorized

### Requirement: Owner manual purchase creation
The system SHALL allow an authenticated wishlist owner to manually create a purchase record for a non-deleted gift they own, using `Registrado por el creador` as the default guest name when no explicit name is provided.

#### Scenario: Owner manually creates a purchase
- **WHEN** an authenticated owner submits a valid manual purchase for a gift in their wishlist
- **THEN** the system creates a purchase record for that gift and returns the created owner-visible purchase record

#### Scenario: Manual purchase uses default owner name
- **WHEN** an authenticated owner submits a valid manual purchase without a guest name
- **THEN** the system stores the purchase with guest name `Registrado por el creador`

#### Scenario: Manual purchase cannot exceed remaining quantity
- **WHEN** an authenticated owner submits a manual purchase quantity greater than the gift's remaining quantity
- **THEN** the system rejects the request and does not create a purchase record

#### Scenario: Owner cannot manually purchase a non-owned gift
- **WHEN** an authenticated user submits a manual purchase for a gift that is missing, deleted, or belongs to another owner
- **THEN** the system rejects the request and does not create a purchase record

### Requirement: Owner purchase deletion
The system SHALL allow an authenticated wishlist owner to delete a purchase record for a gift they own, restoring that quantity to the gift's remaining quantity without requiring a guest undo token.

#### Scenario: Owner deletes a purchase
- **WHEN** an authenticated owner deletes a purchase record for a gift in their wishlist
- **THEN** the system removes the purchase record and the gift's remaining quantity increases by the deleted purchase quantity

#### Scenario: Owner undo deletes a manual purchase
- **WHEN** an authenticated owner triggers undo for a just-created manual purchase
- **THEN** the system deletes that purchase through the owner deletion path without requiring an undo token

#### Scenario: Non-owner cannot delete a purchase
- **WHEN** an authenticated user tries to delete a purchase for a gift that belongs to another owner
- **THEN** the system rejects the request and keeps the purchase record
