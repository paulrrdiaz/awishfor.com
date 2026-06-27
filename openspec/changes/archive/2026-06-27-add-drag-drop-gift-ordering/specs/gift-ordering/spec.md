## ADDED Requirements

### Requirement: Owner reorders gifts
The system SHALL allow a wishlist owner to assign a new ordering to the non-deleted gifts of a wishlist they own, persisting the result as each gift's `sortOrder`.

#### Scenario: Owner submits a new order
- **WHEN** the owner submits an ordered list of gift ids for a wishlist they own
- **THEN** the system persists `sortOrder` for each listed gift to match its position in the submitted list

#### Scenario: Non-owner attempts reorder
- **WHEN** a user submits a reorder for a wishlist they do not own
- **THEN** the system rejects the request with a not-found/unauthorized error and leaves all `sortOrder` values unchanged

#### Scenario: Submitted ids do not match the wishlist
- **WHEN** the submitted list omits a non-deleted gift, includes a deleted gift, or includes a gift from another wishlist
- **THEN** the system rejects the request and leaves all `sortOrder` values unchanged

### Requirement: Shared sort order across views
The system SHALL apply a single shared `sortOrder` per gift so that both the dashboard and the public page order gifts consistently within their own groupings.

#### Scenario: Dashboard respects order within groups
- **WHEN** gifts are listed in the dashboard and grouped into available, purchased, and hidden
- **THEN** gifts within each group appear in ascending `sortOrder`

#### Scenario: Public page respects order within groups
- **WHEN** gifts are listed on the public page within their status or category groupings
- **THEN** gifts within each grouping appear in ascending `sortOrder`
