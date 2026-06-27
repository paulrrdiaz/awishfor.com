## ADDED Requirements

### Requirement: Gift-level purchase drawer
The dashboard SHALL provide a gift-level purchase drawer that lets the wishlist owner view and manage purchase records for that gift without navigating to a separate purchases page.

#### Scenario: Owner opens purchase drawer from gift row
- **WHEN** the owner opens purchase management for a dashboard gift
- **THEN** the dashboard displays a drawer containing that gift's purchase records and manual purchase form

#### Scenario: Drawer shows owner-visible purchase details
- **WHEN** the drawer renders purchase records for a gift
- **THEN** each record shows guest name, quantity, optional email, optional phone, optional message, and purchase timestamp when those fields exist

#### Scenario: Owner creates manual purchase from drawer
- **WHEN** the owner submits a valid manual purchase from the drawer
- **THEN** the drawer shows the new purchase, the dashboard gift progress updates, and the system shows a `Compra agregada` toast with a `Deshacer` action

#### Scenario: Owner deletes purchase from drawer
- **WHEN** the owner chooses to delete an existing purchase from the drawer
- **THEN** the dashboard requires confirmation before deletion and updates the drawer records and gift progress after deletion

#### Scenario: No separate purchases page is added
- **WHEN** the owner manages purchases for a gift
- **THEN** the workflow remains inside the gift-level drawer rather than linking to or requiring a standalone purchases page
