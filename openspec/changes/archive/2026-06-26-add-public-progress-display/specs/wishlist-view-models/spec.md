## ADDED Requirements

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
