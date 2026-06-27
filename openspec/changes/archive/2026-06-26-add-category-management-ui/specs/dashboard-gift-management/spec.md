## ADDED Requirements

### Requirement: Owner assigns a gift category from the dashboard
The system SHALL let a wishlist owner change a gift's category assignment from the dashboard gift edit action, including clearing it.

#### Scenario: Owner assigns a gift to a category
- **WHEN** the owner edits a gift and selects one of the wishlist's categories
- **THEN** the system updates the gift's category assignment to that category

#### Scenario: Owner clears a gift's category
- **WHEN** the owner edits a gift and selects the uncategorized option
- **THEN** the system clears the gift's category assignment

#### Scenario: Category options are scoped to the wishlist
- **WHEN** the owner opens the gift edit action
- **THEN** the selectable categories are exactly the categories belonging to that gift's wishlist
