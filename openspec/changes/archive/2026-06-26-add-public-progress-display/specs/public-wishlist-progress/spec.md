## ADDED Requirements

### Requirement: Public wishlist shows a quantity-based progress summary

The public wishlist page SHALL display a progress summary that combines the count of gifts still available with the purchased-of-total unit totals, derived only from the visible gifts in the public view model.

#### Scenario: Summary text format
- **WHEN** a published wishlist has 8 gifts that are available or partially purchased, 7 purchased units, and 16 total units
- **THEN** the progress summary renders the available gift count and the purchased-of-total units, e.g. `8 disponibles · 7 de 16 unidades compradas`

#### Scenario: Partial purchases counted
- **WHEN** a gift needs 3 units and has 1 purchased unit
- **THEN** that gift contributes 1 to purchased units and 3 to total units, and still counts toward the available gift count

#### Scenario: Hidden and deleted gifts excluded
- **WHEN** a wishlist contains hidden or soft-deleted gifts
- **THEN** those gifts contribute nothing to the available gift count, purchased units, or total units

### Requirement: Progress summary handles the zero-state safely

The progress summary SHALL render without errors when the wishlist has no visible gifts, no purchases, or zero total units, and SHALL NOT perform any division by zero.

#### Scenario: No visible gifts
- **WHEN** a wishlist has zero visible gifts
- **THEN** the summary reports zero available gifts and zero of zero units without throwing

#### Scenario: No purchases yet
- **WHEN** a wishlist has visible gifts but no purchases
- **THEN** the summary reports the available gift count and `0` purchased of the total units

### Requirement: Progress summary appears only in full render mode

The progress summary SHALL be shown only in the public page's `full` render mode and SHALL be omitted from `preview` and `compact` render modes.

#### Scenario: Hidden in preview and compact
- **WHEN** the public wishlist page renders in `preview` or `compact` mode
- **THEN** the progress summary is not rendered

#### Scenario: Shown in full mode
- **WHEN** the public wishlist page renders in `full` mode
- **THEN** the progress summary is rendered
