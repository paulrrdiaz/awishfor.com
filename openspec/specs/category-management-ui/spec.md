# category-management-ui Specification

## Purpose
Provides the dashboard UI for wishlist owners to view, add, rename, delete, and reorder categories for a single wishlist, including visibility into uncategorized gift counts. Also covers lightweight draft category management in the creation wizard.
## Requirements
### Requirement: Dashboard category management panel
The system SHALL provide a dashboard panel where a wishlist owner can view their categories in sort order and manage them, scoped to a single wishlist.

#### Scenario: Owner views the category panel
- **WHEN** an authenticated owner opens the categories panel for a wishlist they own
- **THEN** the system displays each category in ascending sort order with its name and its gift count

#### Scenario: Wishlist has no categories
- **WHEN** the owner opens the category panel for a wishlist with no categories
- **THEN** the system shows an empty state and an entry point to add the first category

#### Scenario: Non-owner cannot manage categories
- **WHEN** a user who does not own the wishlist attempts to load or mutate its categories
- **THEN** the system rejects the request and renders no category management controls

### Requirement: Add category from the dashboard
The system SHALL let an owner add a category from the panel using a name input.

#### Scenario: Owner adds a valid category
- **WHEN** the owner submits a non-empty trimmed category name that does not duplicate an existing one
- **THEN** the system creates the category, appends it to the end of the sort order, and shows it in the panel

#### Scenario: Owner submits an invalid or duplicate name
- **WHEN** the owner submits an empty, overlong, or duplicate category name
- **THEN** the system rejects the submission and surfaces an error without creating a category

### Requirement: Rename category from the dashboard
The system SHALL let an owner rename a category inline in the panel.

#### Scenario: Owner renames a category
- **WHEN** the owner edits a category name to a valid non-duplicate name and confirms
- **THEN** the system updates the category name and reflects it in the panel

### Requirement: Delete category from the dashboard
The system SHALL let an owner delete a category through a confirmation dialog that communicates assigned gifts become uncategorized.

#### Scenario: Owner confirms deletion of a category with gifts
- **WHEN** the owner deletes a category that has assigned gifts and confirms the dialog
- **THEN** the system removes the category, leaves the gifts intact and uncategorized, and updates the panel and the uncategorized count

#### Scenario: Delete dialog states gift impact
- **WHEN** the delete confirmation dialog is shown for a category with one or more gifts
- **THEN** the dialog states how many gifts will become uncategorized

### Requirement: Reorder categories from the dashboard
The system SHALL let an owner reorder categories from the panel and persist the new order.

#### Scenario: Owner moves a category up or down
- **WHEN** the owner moves a category up or down in the panel
- **THEN** the system submits the full ordered category list, persists the new sort order, and the public gift filters follow that order

### Requirement: Uncategorized gift visibility
The system SHALL show the owner how many gifts in the wishlist are uncategorized.

#### Scenario: Panel shows uncategorized count
- **WHEN** the owner views the category panel
- **THEN** the system displays the count of non-deleted gifts that have no category

### Requirement: Wishlist wizard lightweight category editing
The system SHALL let a wizard user manage the draft category list inline in the Gifts step without persisting to the database.

#### Scenario: User adds a draft category
- **WHEN** the wizard user adds a category name in the Gifts step
- **THEN** the system adds it to the draft category list (deduplicated, trimmed) and makes it selectable for draft gifts

#### Scenario: User removes a draft category
- **WHEN** the wizard user removes a category from the draft list
- **THEN** the system removes it from the draft list and clears that category from any draft gift assigned to it

### Requirement: Wizard category chip actions use icon buttons with tooltips

The wishlist wizard lightweight category editing UI SHALL present category chip actions as compact icon buttons instead of visible text labels for rename and remove. Each icon button SHALL remain accessible through an action-specific accessible name and a Spanish tooltip.

#### Scenario: Category chip shows icon actions

- **WHEN** the Gifts step displays a draft category chip in its non-editing state
- **THEN** the rename and remove actions are shown as icon buttons
- **AND** the chip does not show the visible text labels `Renombrar` or `Quitar`

#### Scenario: Rename icon is accessible

- **WHEN** the user focuses or hovers the rename icon button for a category
- **THEN** the system exposes a tooltip with the Spanish rename action
- **AND** the button has an accessible label that includes the category name

#### Scenario: Remove icon is accessible

- **WHEN** the user focuses or hovers the remove icon button for a category
- **THEN** the system exposes a tooltip with the Spanish remove action
- **AND** the button has an accessible label that includes the category name

#### Scenario: Icon actions preserve existing category behavior

- **WHEN** the user activates the rename or remove icon for a draft category
- **THEN** the system performs the same draft category rename or remove behavior as before

