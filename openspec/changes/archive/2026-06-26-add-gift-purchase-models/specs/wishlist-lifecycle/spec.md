## ADDED Requirements

### Requirement: Wishlist gift relation
The system SHALL associate each wishlist with zero or more gifts, and SHALL cascade-delete those gifts if the wishlist is deleted.

#### Scenario: Wishlist has gifts
- **WHEN** gifts are created for a wishlist
- **THEN** the wishlist can be queried with those gifts

#### Scenario: Wishlist has no gifts
- **WHEN** a wishlist is created without gifts
- **THEN** the wishlist remains valid and can be queried with an empty gift list
