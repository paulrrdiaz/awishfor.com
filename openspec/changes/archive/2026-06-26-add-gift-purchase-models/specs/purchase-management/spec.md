## ADDED Requirements

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
