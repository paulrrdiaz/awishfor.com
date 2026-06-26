## ADDED Requirements

### Requirement: Category gift relation
The system SHALL associate each category with zero or more gifts in the same wishlist, and SHALL clear the gift's category assignment when the category is deleted rather than deleting the gift.

#### Scenario: Category has gifts
- **WHEN** gifts are assigned to a category
- **THEN** the category can be queried with those gifts

#### Scenario: Category with gifts is deleted
- **WHEN** a category that has assigned gifts is deleted
- **THEN** the system keeps those gifts and clears their category assignment via `onDelete: SetNull`

## MODIFIED Requirements

### Requirement: Category deletion
The system SHALL allow wishlist owners to delete categories without deleting the wishlist or any gifts assigned to the category, clearing the assigned gifts' category through the database `onDelete: SetNull` relation.

#### Scenario: Owner deletes a category
- **WHEN** a wishlist owner deletes a category
- **THEN** the system removes the category and preserves the parent wishlist

#### Scenario: Gifts exist for a deleted category
- **WHEN** gifts are assigned to a category that is deleted
- **THEN** the system keeps those gifts and leaves them uncategorized by setting their category reference to null
