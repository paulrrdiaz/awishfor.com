## ADDED Requirements

### Requirement: Wizard provides authenticated manual draft saving

The hydrated creation wizard SHALL provide a `Guardar borrador` action on every
wizard step. It SHALL save only when a signed-in creator activates the action;
the wizard SHALL not autosave. Signed-out visitors SHALL be prompted to sign in
before saving and no save mutation SHALL be sent for them.

#### Scenario: Signed-in creator saves manually
- **WHEN** a signed-in creator activates `Guardar borrador`
- **THEN** the wizard submits the current complete local draft once and prevents duplicate save activation until the request finishes

#### Scenario: Signed-out visitor tries to save
- **WHEN** a signed-out visitor activates the save action
- **THEN** the wizard presents an authentication prompt and preserves the local draft without sending a save request

### Requirement: Wizard retains saved-draft identity and revision locally

The persisted wizard store SHALL retain `savedWishlistId` and `lastSavedAt` after
a successful save. Subsequent manual saves SHALL use those values to update the
same database draft and detect conflicts. Resetting the wizard SHALL clear both
values.

#### Scenario: Successful save enables a later update
- **WHEN** a manual save succeeds
- **THEN** the wizard stores the returned wishlist ID and server revision timestamp with the local draft

#### Scenario: Reset clears saved draft metadata
- **WHEN** the creator resets the wizard
- **THEN** the local draft, saved wishlist ID, and last saved timestamp are cleared

### Requirement: Wizard communicates save outcome and conflict options

The wizard SHALL show a Sonner success toast after a completed save and provide
a `Ver en dashboard` link to the authenticated dashboard. On a save conflict it
SHALL present options to load the current server draft or explicitly overwrite it
with the local draft; it SHALL not silently discard either version.

#### Scenario: Save success is confirmed
- **WHEN** the save-draft operation returns success
- **THEN** the wizard updates its saved-draft metadata, displays a success toast, and exposes `Ver en dashboard`

#### Scenario: Creator resolves a save conflict
- **WHEN** the save-draft operation returns a conflict
- **THEN** the wizard presents the server and local resolution choices before making another write
