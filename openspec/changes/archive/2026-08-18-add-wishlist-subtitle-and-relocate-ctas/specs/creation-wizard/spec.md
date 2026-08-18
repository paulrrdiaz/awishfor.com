## ADDED Requirements

### Requirement: Wizard provides an optional wishlist subtitle

The Event Details step SHALL present an optional subtitle field associated with the wishlist title. The subtitle SHALL accept at most 160 characters, SHALL persist as `subtitle` in the local draft, and SHALL appear beneath the title in live public-page previews. The field SHALL explain that the host can personalize it now, change it later from Settings, or clear it.

A brand-new wizard draft SHALL begin with the generic subtitle `Una lista creada con cariño para celebrar juntos.` Existing persisted local drafts created before subtitle support SHALL migrate with an empty subtitle rather than silently gaining public copy. Clearing the subtitle SHALL remain valid and SHALL cause previews and the eventual public page to omit the subtitle without leaving reserved space.

#### Scenario: New draft receives generic subtitle

- **WHEN** a host starts a brand-new wizard draft
- **THEN** its subtitle is `Una lista creada con cariño para celebrar juntos.`
- **AND** the Event Details input and live preview show that value

#### Scenario: Host personalizes subtitle

- **WHEN** the host edits the subtitle with a value of at most 160 characters
- **THEN** the draft persists the edited value across wizard navigation and reload
- **AND** every live public-page preview renders it beneath the wishlist title

#### Scenario: Host clears optional subtitle

- **WHEN** the host clears the subtitle and advances through the wizard
- **THEN** validation does not block progress or publishing
- **AND** previews omit the subtitle and its spacing

#### Scenario: Subtitle exceeds limit

- **WHEN** the host attempts to save or publish a subtitle longer than 160 characters
- **THEN** the value is rejected with a field-specific validation error

#### Scenario: Earlier local draft migrates without injected copy

- **WHEN** a locally persisted wizard draft from before subtitle support rehydrates
- **THEN** it receives an empty subtitle and all of its existing fields remain intact

#### Scenario: Wizard explains later editability

- **WHEN** the Event Details subtitle field renders
- **THEN** its help text states that the subtitle can be personalized now and changed or removed later from Settings
