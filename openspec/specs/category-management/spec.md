# category-management Specification

## Purpose
TBD - created by syncing change add-category-model. Update Purpose after sync.
## Requirements
### Requirement: Wishlist category persistence
The system SHALL persist categories as ordered records owned by exactly one wishlist.

#### Scenario: Category is stored for a wishlist
- **WHEN** a category is created with a valid wishlist owner, wishlist ID, name, and sort order
- **THEN** the system persists the category with that wishlist relation, name, sort order, created timestamp, and updated timestamp

#### Scenario: Categories are read in sort order
- **WHEN** categories are fetched for a wishlist
- **THEN** the system returns them ordered by ascending `sortOrder` and then by creation time for ties

### Requirement: Category ownership authorization
The system SHALL allow only the owning authenticated user to mutate categories for a wishlist.

#### Scenario: Owner mutates a category
- **WHEN** the authenticated user owns the wishlist that contains the category
- **THEN** the system allows add, rename, delete, and reorder category operations

#### Scenario: Non-owner mutates a category
- **WHEN** the authenticated user does not own the wishlist that contains the category
- **THEN** the system rejects the mutation and does not change category data

### Requirement: Category creation
The system SHALL allow wishlist owners to add categories with valid names.

#### Scenario: Owner adds a category
- **WHEN** a wishlist owner adds a category with a non-empty trimmed name
- **THEN** the system persists the category for that wishlist using the requested name and a deterministic `sortOrder`

#### Scenario: Invalid category name is submitted
- **WHEN** a category name is empty after trimming or exceeds the allowed length
- **THEN** the system rejects the request and does not create a category

#### Scenario: Duplicate category name is submitted
- **WHEN** a wishlist owner adds or renames a category to a name that already exists in the same wishlist after trimming and case-folding
- **THEN** the system rejects the request and does not create or rename the category

### Requirement: Category rename
The system SHALL allow wishlist owners to rename existing categories.

#### Scenario: Owner renames a category
- **WHEN** a wishlist owner renames a category with a valid non-empty trimmed name
- **THEN** the system updates the category name and `updatedAt` timestamp without changing its wishlist relation

### Requirement: Category deletion
The system SHALL allow wishlist owners to delete categories without deleting the wishlist or any gifts assigned to the category.

#### Scenario: Owner deletes a category
- **WHEN** a wishlist owner deletes a category
- **THEN** the system removes the category and preserves the parent wishlist

#### Scenario: Gifts exist for a deleted category
- **WHEN** gifts are assigned to a category that is deleted
- **THEN** the system keeps those gifts and leaves them uncategorized

### Requirement: Category reorder
The system SHALL allow wishlist owners to reorder categories for one wishlist.

#### Scenario: Owner reorders all categories
- **WHEN** a wishlist owner submits the complete ordered list of category IDs for a wishlist
- **THEN** the system updates each category `sortOrder` to match the submitted order

#### Scenario: Reorder payload has invalid category IDs
- **WHEN** the submitted category IDs are missing categories from the wishlist, include duplicates, or include categories from another wishlist
- **THEN** the system rejects the reorder and does not change category ordering

### Requirement: Default category seeding
The system SHALL support creating ordered default categories for a wishlist from event preset category names.

#### Scenario: Default categories are seeded
- **WHEN** default category names are provided for a newly created wishlist
- **THEN** the system creates categories for that wishlist in the provided order using sequential `sortOrder` values

#### Scenario: Default category list is empty
- **WHEN** no default category names are provided for a wishlist
- **THEN** the system does not create categories and the wishlist remains valid
