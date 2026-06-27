## ADDED Requirements

### Requirement: Guest purchase success and undo state

After a guest's purchase is confirmed, the purchase modal SHALL replace its form with a success state that shows thank-you confirmation copy, a `Deshacer` action, and a `Cerrar` action. The `Deshacer` action SHALL undo the just-created purchase using the one-time undo token returned at purchase time. The `Cerrar` action SHALL dismiss the modal and keep the purchase.

#### Scenario: Success state shown after purchase

- **WHEN** a guest's purchase request succeeds
- **THEN** the modal shows thank-you confirmation copy with a `Deshacer` action and a `Cerrar` action instead of the form

#### Scenario: Guest undoes from the success state

- **WHEN** the guest activates `Deshacer` in the success state with a valid, unexpired undo token
- **THEN** the modal triggers the undo, the purchase is removed, and the modal reflects that the purchase was undone

#### Scenario: Guest closes the success state

- **WHEN** the guest activates `Cerrar` in the success state
- **THEN** the modal closes and the purchase is kept

#### Scenario: Undo failure is surfaced safely

- **WHEN** the undo request fails, for example because the window expired
- **THEN** the modal shows an error state and the purchase remains in place

### Requirement: Public page refresh after purchase or undo

After a guest's purchase succeeds and after a guest's undo succeeds, the public wishlist page SHALL refresh its server-rendered data so that affected gifts reflect their new status and per-gift quantity progress, fully purchased gifts move into the purchased grouping with their purchase action removed, and the progress summary reflects the updated purchased and remaining counts, all without requiring a manual full-page reload. The guest's active filter and sort selections SHALL be preserved across the refresh.

#### Scenario: Page reflects a completed purchase

- **WHEN** a guest completes a purchase that fully covers a gift's remaining quantity
- **THEN** after the refresh the gift appears as purchased, its purchase action is removed, it is grouped with purchased gifts, and the progress summary shows the increased purchased count

#### Scenario: Page reflects a partial purchase

- **WHEN** a guest completes a purchase that covers only part of a gift's remaining quantity
- **THEN** after the refresh the gift remains available with reduced remaining quantity and the progress summary shows the increased purchased count

#### Scenario: Page reflects an undo

- **WHEN** a guest undoes a just-created purchase
- **THEN** after the refresh the gift returns to its prior status with restored remaining quantity and the progress summary shows the decreased purchased count

#### Scenario: Filters survive the refresh

- **WHEN** the public page refreshes after a purchase or undo
- **THEN** the guest's active filter and sort selections remain applied
