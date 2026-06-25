## ADDED Requirements

### Requirement: Wishlist category relation
The system SHALL associate each wishlist with zero or more ordered categories.

#### Scenario: Wishlist has categories
- **WHEN** categories are created for a wishlist
- **THEN** the wishlist can be queried with those categories ordered by `sortOrder`

#### Scenario: Wishlist has no categories
- **WHEN** a wishlist is created without categories
- **THEN** the wishlist remains valid and can be queried with an empty category list
