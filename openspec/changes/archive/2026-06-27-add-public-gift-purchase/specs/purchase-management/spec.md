## ADDED Requirements

### Requirement: Public guest gift purchase eligibility

The system SHALL provide a public, unauthenticated action that lets a guest mark a gift as purchased only when the target gift belongs to a published wishlist and is neither hidden nor soft-deleted, in addition to satisfying the existing purchase quantity limit. The action SHALL create the purchase, generate a one-time raw undo token, persist only the token hash, and return the raw token to the caller exactly once.

#### Scenario: Guest purchases an available public gift
- **WHEN** a guest submits a purchase for a visible, non-deleted gift in a published wishlist with a valid guest name and a quantity at least one and at most the remaining quantity
- **THEN** the system creates the purchase, stores a hashed undo token, and returns a success payload containing the raw undo token once

#### Scenario: Gift belongs to a wishlist that is not published
- **WHEN** a guest submits a purchase for a gift whose wishlist is in draft or archived status
- **THEN** the system rejects the request and does not create a purchase

#### Scenario: Gift is hidden
- **WHEN** a guest submits a purchase for a gift marked as hidden
- **THEN** the system rejects the request and does not create a purchase

#### Scenario: Gift is soft-deleted
- **WHEN** a guest submits a purchase for a soft-deleted gift
- **THEN** the system rejects the request and does not create a purchase

#### Scenario: Quantity exceeds remaining
- **WHEN** a guest submits a purchase whose quantity exceeds the gift's remaining quantity
- **THEN** the system rejects the request and does not create a purchase

### Requirement: Public purchase undo window

The undo token created for a public guest purchase SHALL expire 60 seconds after the purchase is created.

#### Scenario: Public undo token expiry is 60 seconds
- **WHEN** a public guest purchase is created
- **THEN** the stored undo token expiry is 60 seconds after the purchase creation time
