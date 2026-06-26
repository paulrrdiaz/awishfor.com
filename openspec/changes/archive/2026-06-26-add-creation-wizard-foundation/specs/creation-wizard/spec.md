## ADDED Requirements

### Requirement: Wizard route with step routing

The system SHALL serve the creation wizard at `/create` and render the active step based on a query parameter (e.g. `?step=event-type`). The route SHALL be publicly accessible without authentication.

#### Scenario: Unauthenticated user opens the wizard

- **WHEN** a signed-out user navigates to `/create`
- **THEN** the wizard shell renders without redirecting to sign-in

#### Scenario: Step selected by query param

- **WHEN** the URL contains a recognized `step` query param
- **THEN** the wizard renders that step; for a missing or unknown value it falls back to the first (event-type) step

### Requirement: Local draft store with persistence

The system SHALL hold the in-progress wishlist draft in a Zustand store (`src/stores/wishlist-wizard.store.ts`) and persist it to `localStorage`. The persisted draft SHALL be restored on reload.

#### Scenario: Draft survives reload

- **WHEN** the user edits the draft and reloads the page
- **THEN** the restored draft reflects the edits made before reload

#### Scenario: Reset clears the draft

- **WHEN** the user triggers reset / start over
- **THEN** the store and its persisted copy are cleared and the wizard returns to an empty first step

### Requirement: Stale draft recovery

The store SHALL record the draft's last-updated timestamp and treat a draft older than 30 days as stale. When a stale draft is detected on load, the system SHALL prompt the user to continue or start over rather than silently resuming.

#### Scenario: Old draft prompts before resuming

- **WHEN** a persisted draft older than 30 days is loaded
- **THEN** the user is shown a recovery prompt to continue or discard before editing proceeds

#### Scenario: Fresh draft resumes silently

- **WHEN** a persisted draft newer than 30 days is loaded
- **THEN** the draft resumes without a recovery prompt

### Requirement: Event Type selection step

The Event Type step SHALL present a selectable card per event type using the preset Spanish labels. Selecting an event type SHALL set the draft's `eventType` and seed default categories, default theme/layout, and default copy from the matching preset.

#### Scenario: Selecting an event type seeds defaults

- **WHEN** the user selects an event-type card
- **THEN** the draft's `eventType`, default categories, default theme/layout IDs, and untouched copy fields are populated from that preset

### Requirement: Preset copy does not overwrite user edits

The store SHALL track, local-only, whether each seeded copy field (hero title, welcome message, thank-you message) has been edited by the user (`copyTouched`). Changing the event type SHALL update only copy fields that are still untouched; edited copy SHALL be preserved.

#### Scenario: Edited copy is preserved on event-type change

- **WHEN** the user has edited the welcome message and then changes the event type
- **THEN** the edited welcome message is preserved while untouched copy fields update to the new preset

#### Scenario: Manual regeneration overwrites copy

- **WHEN** the user triggers "regenerate suggested copy"
- **THEN** copy fields are reset to the current preset defaults and their `copyTouched` flags are cleared
