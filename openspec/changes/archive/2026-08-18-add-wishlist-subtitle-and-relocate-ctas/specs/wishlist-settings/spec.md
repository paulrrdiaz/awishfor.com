## ADDED Requirements

### Requirement: Owner can edit the optional wishlist subtitle

The wishlist Settings form SHALL present an optional subtitle field prefilled with the wishlist's current value. The owner-scoped settings mutation SHALL normalize an empty or whitespace-only subtitle to absent, SHALL reject values longer than 160 characters, and SHALL persist valid changes before revalidating the public page.

#### Scenario: Settings shows current subtitle

- **WHEN** an owner opens Settings for a wishlist with a subtitle
- **THEN** the subtitle field is prefilled with the stored value

#### Scenario: Owner updates subtitle

- **WHEN** the owner submits a valid changed subtitle
- **THEN** the owner-scoped mutation persists it
- **AND** the revalidated public page renders the new subtitle beneath the title

#### Scenario: Owner clears subtitle

- **WHEN** the owner submits an empty or whitespace-only subtitle
- **THEN** the mutation stores the subtitle as absent
- **AND** the revalidated public page omits the subtitle and its spacing

#### Scenario: Settings rejects an overlong subtitle

- **WHEN** the owner submits a subtitle longer than 160 characters
- **THEN** the form surfaces a subtitle validation error and does not persist the value
