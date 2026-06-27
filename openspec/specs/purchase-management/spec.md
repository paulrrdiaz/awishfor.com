# purchase-management Specification

## Purpose
Defines how purchases are persisted and validated for gifts, including guest details, quantity calculations, public status derivation, quantity limits, and undo token mechanics.

## Requirements

### Requirement: Purchase persistence
The system SHALL persist purchases as active records owned by exactly one gift, allowing multiple purchases per gift.

#### Scenario: Purchase is stored for a gift
- **WHEN** a purchase is created with a valid gift, a required guest name, and a quantity
- **THEN** the system persists the purchase with that gift relation, guest name, quantity, created timestamp, and updated timestamp

#### Scenario: Multiple purchases exist for one gift
- **WHEN** several purchases are created for the same gift
- **THEN** the system persists each purchase as a separate active record

#### Scenario: Purchase is deleted
- **WHEN** a purchase is deleted by the owner or by a valid guest undo
- **THEN** the system removes the purchase record and restores its quantity to the gift's remaining quantity

### Requirement: Purchase guest details
The system SHALL require a guest name on a purchase and SHALL accept optional guest email, guest phone, and message.

#### Scenario: Purchase has only a guest name
- **WHEN** a purchase is created with a valid guest name and no contact details or message
- **THEN** the system persists the purchase with empty optional contact fields

#### Scenario: Guest name is missing
- **WHEN** a purchase is created without a guest name or with a name that is empty after trimming
- **THEN** the system rejects the request and does not create a purchase

#### Scenario: Optional contact details are invalid
- **WHEN** a purchase is created with an email, phone, or message that fails validation
- **THEN** the system rejects the request and does not create a purchase

### Requirement: Purchased quantity calculation
The system SHALL calculate the purchased quantity of a gift as the sum of the quantities of its active purchases.

#### Scenario: Gift has active purchases
- **WHEN** purchased quantity is calculated for a gift with active purchases
- **THEN** the system returns the sum of those purchase quantities

#### Scenario: Gift has no purchases
- **WHEN** purchased quantity is calculated for a gift with no purchases
- **THEN** the system returns zero

### Requirement: Remaining quantity calculation
The system SHALL calculate the remaining quantity of a gift as its quantity needed minus its purchased quantity, never below zero.

#### Scenario: Gift is partially purchased
- **WHEN** remaining quantity is calculated for a gift with some active purchases
- **THEN** the system returns quantity needed minus purchased quantity

#### Scenario: Gift is fully purchased
- **WHEN** purchased quantity meets or exceeds quantity needed
- **THEN** the system returns a remaining quantity of zero

### Requirement: Public gift status derivation
The system SHALL derive a public gift status of available, partial, or purchased from quantity needed and purchased quantity.

#### Scenario: No units purchased
- **WHEN** purchased quantity is zero
- **THEN** the system derives the status as available

#### Scenario: Some units purchased
- **WHEN** purchased quantity is greater than zero but less than quantity needed
- **THEN** the system derives the status as partial

#### Scenario: All units purchased
- **WHEN** purchased quantity meets or exceeds quantity needed
- **THEN** the system derives the status as purchased

### Requirement: Purchase quantity limit
The system SHALL reject a purchase whose quantity is below one or exceeds the gift's remaining quantity.

#### Scenario: Purchase within remaining quantity
- **WHEN** a purchase quantity is at least one and does not exceed remaining quantity
- **THEN** the system allows the purchase

#### Scenario: Purchase exceeds remaining quantity
- **WHEN** a purchase quantity exceeds the gift's remaining quantity
- **THEN** the system rejects the purchase and does not change purchased quantity

#### Scenario: Purchase quantity is below one
- **WHEN** a purchase quantity is below one
- **THEN** the system rejects the purchase

### Requirement: Purchase undo token
The system SHALL store only a hashed, time-limited undo token for a purchase and SHALL never persist the raw token.

#### Scenario: Undo token is recorded
- **WHEN** a purchase is created with an undo capability
- **THEN** the system stores a hashed undo token and an expiry timestamp and returns the raw token to the caller once

#### Scenario: Undo with a valid token
- **WHEN** an undo request presents a token whose hash matches a purchase and whose expiry has not passed
- **THEN** the system deletes that purchase

#### Scenario: Undo with an invalid or expired token
- **WHEN** an undo request presents a token that does not match or whose expiry has passed
- **THEN** the system rejects the undo and keeps the purchase

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
