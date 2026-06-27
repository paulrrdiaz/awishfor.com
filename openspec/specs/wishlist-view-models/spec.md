## Requirements

### Requirement: Public wishlist view model excludes non-visible gifts

The public wishlist mapper SHALL produce a view model whose gifts exclude any gift that is soft-deleted (`deletedAt` set) or hidden (`visibilityStatus = hidden`).

#### Scenario: Hidden gift omitted
- **WHEN** a wishlist containing a gift with `visibilityStatus = hidden` is mapped to the public view model
- **THEN** that gift does not appear in the public view model's gifts

#### Scenario: Soft-deleted gift omitted
- **WHEN** a wishlist containing a gift with a non-null `deletedAt` is mapped to the public view model
- **THEN** that gift does not appear in the public view model's gifts and is excluded from any derived counts

### Requirement: Public view model excludes private and internal data

The public wishlist view model SHALL NOT include guest contact data (email, phone), guest messages, or internal notes for any gift or purchase.

#### Scenario: Guest PII excluded
- **WHEN** a wishlist with purchases that have `guestEmail`, `guestPhone`, and `message` is mapped to the public view model
- **THEN** the public view model exposes no guest email, phone, or message fields

#### Scenario: Internal notes excluded
- **WHEN** a gift has a non-empty `internalNote`
- **THEN** the public gift view model exposes no internal note field

### Requirement: View models expose only serializable primitives

All mappers SHALL serialize `Decimal` price values to strings and `Date` values to ISO 8601 strings so that client components receive only serializable primitives.

#### Scenario: Decimal serialized to string
- **WHEN** a gift with a `priceAmount` of `199.90` is mapped
- **THEN** the view model's price amount equals the string `"199.90"`

#### Scenario: Null price preserved
- **WHEN** a gift has a null `priceAmount`
- **THEN** the view model's price amount is `null`

#### Scenario: Date serialized to ISO string
- **WHEN** a wishlist with an `eventDate` is mapped
- **THEN** the view model's event date is that date's ISO 8601 string, and a null `eventDate` maps to `null`

### Requirement: Public gift view model exposes derived purchase status

The public gift view model SHALL include a derived public status of `available`, `partial`, or `purchased` computed from quantity needed and purchased quantity, without exposing individual purchaser identities.

#### Scenario: Fully purchased gift
- **WHEN** a gift's purchased quantity is greater than or equal to its quantity needed
- **THEN** the public gift view model status is `purchased`

#### Scenario: Partially purchased gift
- **WHEN** a gift has at least one purchase but purchased quantity is below quantity needed
- **THEN** the public gift view model status is `partial`

### Requirement: Public gift view model exposes remaining quantity

The public gift view model SHALL include the gift's remaining quantity, computed as quantity needed minus purchased quantity and never below zero, without exposing individual purchaser identities.

#### Scenario: Partially purchased gift remaining quantity
- **WHEN** a gift with quantity needed of 3 and purchased quantity of 1 is mapped to the public gift view model
- **THEN** the view model includes a remaining quantity of 2

#### Scenario: Fully purchased gift remaining quantity
- **WHEN** a gift's purchased quantity is greater than or equal to its quantity needed
- **THEN** the view model includes a remaining quantity of 0

### Requirement: Dashboard view models include management-ready derived fields

The dashboard wishlist and dashboard gift mappers SHALL include owner-facing derived fields such as wishlist status, visible gift count, and per-gift purchased and remaining quantities, while still serializing `Decimal` and `Date` values.

#### Scenario: Dashboard card derived counts
- **WHEN** a wishlist with a mix of visible and hidden gifts is mapped to the dashboard card view model
- **THEN** the view model includes the wishlist status and a count of visible non-deleted gifts

#### Scenario: Dashboard gift row remaining quantity
- **WHEN** a gift with quantity needed of 3 and purchased quantity of 1 is mapped to a dashboard gift row
- **THEN** the row includes purchased quantity 1 and remaining quantity 2

### Requirement: Public wishlist view model exposes an aggregate progress summary

The public wishlist mapper SHALL include an aggregate progress summary on the view model, computed from the visible gifts only, containing the available gift count, purchased units, and total units. Purchased units SHALL be capped at each gift's needed quantity so that over-purchase cannot inflate the totals, and the available gift count SHALL count gifts whose derived status is `available` or `partial`.

#### Scenario: Aggregate computed from visible gifts
- **WHEN** a wishlist with a mix of available, partial, and fully purchased visible gifts is mapped to the public view model
- **THEN** the progress summary reports the available gift count (available plus partial), the sum of purchased units, and the sum of needed quantities as total units

#### Scenario: Hidden and deleted gifts excluded from aggregate
- **WHEN** a wishlist contains hidden or soft-deleted gifts
- **THEN** those gifts contribute nothing to the progress summary's available gift count, purchased units, or total units

#### Scenario: Purchased units capped at needed quantity
- **WHEN** a gift needs 2 units but has 5 purchased units recorded
- **THEN** the gift contributes 2 purchased units and 2 total units to the progress summary

#### Scenario: Empty wishlist progress
- **WHEN** a wishlist has no visible gifts
- **THEN** the progress summary reports zero available gifts, zero purchased units, and zero total units
