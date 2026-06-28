## MODIFIED Requirements

### Requirement: Purchase quantity limit

The system SHALL reject a purchase whose quantity is below one or exceeds the gift's remaining quantity. The quantity check and purchase creation SHALL be performed atomically within a single database transaction to prevent concurrent over-purchasing.

#### Scenario: Purchase within remaining quantity

- **WHEN** a purchase quantity is at least one and does not exceed remaining quantity
- **THEN** the system allows the purchase

#### Scenario: Purchase exceeds remaining quantity

- **WHEN** a purchase quantity exceeds the gift's remaining quantity
- **THEN** the system rejects the purchase and does not change purchased quantity

#### Scenario: Purchase quantity is below one

- **WHEN** a purchase quantity is below one
- **THEN** the system rejects the purchase

#### Scenario: Concurrent purchases do not over-purchase

- **WHEN** two simultaneous requests each try to purchase the last available unit of a gift
- **THEN** exactly one purchase succeeds and the other is rejected with a quantity-exceeded error

### Requirement: Owner purchase deletion

The system SHALL allow an authenticated wishlist owner to delete a purchase record for a gift they own, restoring that quantity to the gift's remaining quantity without requiring a guest undo token. The ownership check and delete SHALL be performed atomically within a single database transaction; a missing purchase at delete time SHALL be surfaced as a NOT_FOUND error.

#### Scenario: Owner deletes a purchase

- **WHEN** an authenticated owner deletes a purchase record for a gift in their wishlist
- **THEN** the system removes the purchase record and the gift's remaining quantity increases by the deleted purchase quantity

#### Scenario: Owner undo deletes a manual purchase

- **WHEN** an authenticated owner triggers undo for a just-created manual purchase
- **THEN** the system deletes that purchase through the owner deletion path without requiring an undo token

#### Scenario: Non-owner cannot delete a purchase

- **WHEN** an authenticated user tries to delete a purchase for a gift that belongs to another owner
- **THEN** the system rejects the request and keeps the purchase record

#### Scenario: Purchase deleted between auth check and delete

- **WHEN** the target purchase record no longer exists at delete time (concurrent deletion)
- **THEN** the system returns a NOT_FOUND error rather than an unhandled server error

## REMOVED Requirements

### Requirement: `createPurchase` internal export

**Reason**: Dead code — the public purchase flow uses `markGiftPurchasedPublic` exclusively. `createPurchase` was never called from the router and its behavior differs subtly (no wishlist status check), making it a correctness risk if called accidentally.
**Migration**: Use `markGiftPurchasedPublic` for public guest purchases or `createOwnerManualPurchase` for owner-initiated records.
