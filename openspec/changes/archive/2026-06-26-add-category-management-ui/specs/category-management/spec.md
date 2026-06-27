## ADDED Requirements

### Requirement: Category gift counts
The system SHALL return, for each category in a wishlist, the count of its non-deleted assigned gifts when listing categories.

#### Scenario: Categories are listed with gift counts
- **WHEN** an owner lists categories for a wishlist
- **THEN** each returned category includes a gift count that excludes soft-deleted gifts

#### Scenario: Category with no gifts
- **WHEN** a category has no assigned non-deleted gifts
- **THEN** its returned gift count is zero

### Requirement: Uncategorized gift count
The system SHALL expose the count of a wishlist's non-deleted gifts that have no category assignment to the owning user.

#### Scenario: Owner requests the uncategorized count
- **WHEN** the wishlist owner requests the uncategorized gift count
- **THEN** the system returns the number of non-deleted gifts in that wishlist whose category is null

#### Scenario: Non-owner requests the uncategorized count
- **WHEN** a user who does not own the wishlist requests the uncategorized gift count
- **THEN** the system rejects the request and returns no count
