## MODIFIED Requirements

### Requirement: Dashboard view models include management-ready derived fields

The dashboard wishlist and dashboard gift mappers SHALL include owner-facing derived fields such as wishlist status, visible gift count, and per-gift purchased and remaining quantities, while still serializing `Decimal` and `Date` values. A wishlist overview for its owner SHALL additionally include total recorded public views, approximate unique visitors, and the latest recorded view time. A dashboard invite for its owner SHALL additionally include its personalized-link view count and latest recorded view time. These analytics fields SHALL be absent from view models returned to non-owner collaborators.

#### Scenario: Dashboard card derived counts
- **WHEN** a wishlist with a mix of visible and hidden gifts is mapped to the dashboard card view model
- **THEN** the view model includes the wishlist status and a count of visible non-deleted gifts

#### Scenario: Dashboard gift row remaining quantity
- **WHEN** a gift with quantity needed of 3 and purchased quantity of 1 is mapped to a dashboard gift row
- **THEN** the row includes purchased quantity 1 and remaining quantity 2

#### Scenario: Owner overview contains serializable analytics
- **WHEN** an owner retrieves a wishlist overview with view analytics
- **THEN** it includes numeric total and approximate-unique counts plus an ISO 8601 latest-view time or null

#### Scenario: Collaborator view model omits analytics
- **WHEN** a non-owner collaborator retrieves a dashboard wishlist overview or invite list
- **THEN** those view models omit view analytics fields
