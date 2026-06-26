## ADDED Requirements

### Requirement: Owner-scoped dashboard gift listing
The system SHALL allow an authenticated owner to list all non-deleted gifts of a wishlist they own, including hidden gifts, each carrying the data needed for management (purchase progress, priority, visibility, notes presence).

#### Scenario: Owner lists their wishlist gifts
- **WHEN** an authenticated owner requests the dashboard gifts of a wishlist they own
- **THEN** the system returns every gift of that wishlist that has no deletion timestamp, including gifts whose visibility status is hidden

#### Scenario: Soft-deleted gifts are excluded
- **WHEN** a gift of the wishlist has a deletion timestamp
- **THEN** the system omits that gift from the dashboard listing

#### Scenario: Non-owner is rejected
- **WHEN** a signed-in user requests the dashboard gifts of a wishlist they do not own, or the wishlist does not exist
- **THEN** the system denies the request and returns no gifts

#### Scenario: Unauthenticated request is rejected
- **WHEN** an unauthenticated request asks for dashboard gifts
- **THEN** the system rejects the request as unauthorized

### Requirement: Dashboard gift grouping
The system SHALL present dashboard gifts in three groups derived from visibility status and purchase progress: available/partial, purchased, and hidden.

#### Scenario: Hidden gift is grouped as hidden
- **WHEN** a gift has hidden visibility status
- **THEN** the system places it in the hidden group regardless of its purchase progress

#### Scenario: Fully purchased gift is grouped as purchased
- **WHEN** a non-hidden gift has no remaining quantity because purchases meet or exceed the quantity needed
- **THEN** the system places it in the purchased group

#### Scenario: Available or partially purchased gift is grouped as available
- **WHEN** a non-hidden gift has remaining quantity greater than zero
- **THEN** the system places it in the available/partial group

### Requirement: Dashboard gift status and progress display
The system SHALL display, for each dashboard gift, its purchase progress as purchased units against needed units and status badges reflecting visibility and purchase state.

#### Scenario: Progress is shown per gift
- **WHEN** a dashboard gift is rendered
- **THEN** the system shows the purchased quantity relative to the quantity needed

#### Scenario: Hidden gift shows a hidden badge
- **WHEN** a gift has hidden visibility status
- **THEN** the system shows a badge indicating the gift is hidden from the public page

### Requirement: Owner gift management actions
The system SHALL allow the owner to edit a gift, toggle its visibility between available and hidden, and soft delete a gift, with every action authorized against the gift's wishlist ownership.

#### Scenario: Owner edits a gift
- **WHEN** the owner submits valid changes for one of their gifts
- **THEN** the system updates the gift and the dashboard reflects the new values

#### Scenario: Owner hides a visible gift
- **WHEN** the owner hides an available gift they own
- **THEN** the system sets the gift visibility to hidden and excludes it from public display while keeping it in the dashboard hidden group

#### Scenario: Owner unhides a hidden gift
- **WHEN** the owner unhides a hidden gift they own
- **THEN** the system sets the gift visibility back to available

#### Scenario: Management action on a non-owned gift is rejected
- **WHEN** a signed-in user attempts to edit, change visibility of, or delete a gift that does not belong to a wishlist they own
- **THEN** the system denies the action and does not modify the gift

### Requirement: Dashboard gift delete confirmation
The system SHALL require explicit confirmation before soft deleting a gift, and SHALL present a stronger warning when the gift already has purchases.

#### Scenario: Delete requires confirmation
- **WHEN** the owner triggers delete on a gift
- **THEN** the system asks for confirmation and only soft deletes the gift after the owner confirms

#### Scenario: Gift with purchases shows stronger warning
- **WHEN** the owner triggers delete on a gift that already has one or more purchases
- **THEN** the system shows a stronger warning that highlights the existing purchases before allowing confirmation

#### Scenario: Confirmed delete removes the gift from the dashboard
- **WHEN** the owner confirms deletion of a gift
- **THEN** the system records the deletion timestamp and the gift no longer appears in the dashboard listing
