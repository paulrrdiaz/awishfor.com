## ADDED Requirements

### Requirement: Settings route renders for the owner

The system SHALL serve a settings page at `/dashboard/wishlists/[id]/settings` that loads the owner's wishlist and renders an editable settings form.

#### Scenario: Owner opens settings

- **WHEN** the wishlist owner navigates to `/dashboard/wishlists/<id>/settings`
- **THEN** the page loads the wishlist via the owner-scoped detail query
- **AND** renders the settings form prefilled with current values

#### Scenario: Non-owner or missing wishlist

- **WHEN** the requested wishlist does not exist or is not owned by the current user
- **THEN** the page renders the not-found state

### Requirement: Edit core wishlist content

The settings form SHALL allow the owner to edit the title, display name, event date, event time, event location, dress code, hero/welcome/thank-you copy, language, currency, and the How-it-works toggle, and persist them via an owner-scoped mutation.

#### Scenario: Save content changes

- **WHEN** the owner edits content fields and submits
- **THEN** the `wishlist.updateSettings` mutation validates and persists the changes for that owner's wishlist
- **AND** the public wishlist page path is revalidated

#### Scenario: Validation blocks invalid input

- **WHEN** the owner submits a value that fails its field validator (e.g. an empty title)
- **THEN** the mutation rejects and the form surfaces the validation error

### Requirement: Slug editing with availability and published warning

The settings form SHALL let the owner edit the slug with a debounced availability check, and SHALL warn before changing the slug of a published wishlist.

#### Scenario: Availability check excludes current wishlist

- **WHEN** the owner edits the slug field
- **THEN** availability is checked via `checkSlugAvailability` excluding the current wishlist id
- **AND** the current saved slug reports as available

#### Scenario: Published slug change warning

- **WHEN** the wishlist status is `published` and the entered slug differs from the saved slug
- **THEN** the form shows a warning that existing links and QR codes will stop working before allowing the change to save

#### Scenario: Taken slug is rejected

- **WHEN** the owner tries to save a slug already used by another wishlist
- **THEN** the save is rejected and the conflict is surfaced

### Requirement: Archive a wishlist

The settings page SHALL let the owner archive a wishlist through a confirmation, making the public page inactive.

#### Scenario: Archive with confirmation

- **WHEN** the owner confirms archiving
- **THEN** `wishlist.archive` sets the wishlist status to `archived` with an `archivedAt` timestamp
- **AND** the public page path is revalidated so it renders the inactive state

### Requirement: Restore an archived wishlist

The settings page SHALL let the owner restore an archived wishlist, choosing whether it returns as published or as a draft.

#### Scenario: Restore dialog offers both targets

- **WHEN** the wishlist status is `archived`
- **THEN** the settings page offers `Restaurar publicada` and `Restaurar como borrador`

#### Scenario: Restore applies the chosen status

- **WHEN** the owner restores with a chosen target status of draft or published
- **THEN** `wishlist.restore` clears `archivedAt` and sets the wishlist to the chosen status
- **AND** the public page path is revalidated
