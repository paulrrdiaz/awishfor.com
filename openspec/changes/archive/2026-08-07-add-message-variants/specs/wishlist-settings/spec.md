## MODIFIED Requirements

### Requirement: Edit core wishlist content

The settings form SHALL allow the owner to edit a single wishlist name (`title`), event date and time (chosen through a single `DateTimePicker` field combining a calendar popover and time input), event location, dress code, welcome and thank-you copy, the message signature, the presentation variant for the countdown, welcome message, and thank-you message, language, currency, and the How-it-works toggle, and persist them via an owner-scoped mutation. The form SHALL NOT expose a separate display name or hero title, since the wishlist has one name that serves both the owner's dashboard and the public page.

The message signature field SHALL be presented as a single page-wide signature that appears beneath both the welcome and thank-you messages.

#### Scenario: Save content changes

- **WHEN** the owner edits content fields and submits
- **THEN** the `wishlist.updateSettings` mutation validates and persists the changes for that owner's wishlist
- **AND** the public wishlist page path is revalidated

#### Scenario: Validation blocks invalid input

- **WHEN** the owner submits a value that fails its field validator (e.g. an empty title)
- **THEN** the mutation rejects and the form surfaces the validation error

#### Scenario: Editing event date and time uses the combined picker

- **WHEN** the owner opens the event date/time field
- **THEN** a popover with a calendar and a time input opens
- **AND** selecting a date and time updates the same `eventDate`/`eventTime` values previously edited via native inputs

#### Scenario: One name field only

- **WHEN** the settings form renders
- **THEN** it shows a single name field bound to `title` and no display-name or hero-title field

#### Scenario: Renaming updates the public page

- **WHEN** the owner changes the wishlist name and saves
- **THEN** the public page's hero heading reflects the new name after revalidation

#### Scenario: Saving a variant selection

- **WHEN** the owner changes a message variant selection and submits
- **THEN** the mutation validates the id against the variant catalog and persists it
- **AND** the public wishlist page renders the selected variant after revalidation

#### Scenario: Signature applies to both messages

- **WHEN** the owner sets the message signature and saves
- **THEN** it appears beneath both the welcome message and the thank-you message on the public page
