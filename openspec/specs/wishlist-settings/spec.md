# wishlist-settings Specification

## Purpose
TBD - created by archiving change add-dashboard-settings-page. Update Purpose after archive.
## Requirements
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

### Requirement: Share URL generation uses configurable origin

The system SHALL generate canonical wishlist share URLs using the `NEXT_PUBLIC_APP_URL` environment variable as the origin rather than a hardcoded production domain. In local and staging environments the configured origin SHALL be used so share links, WhatsApp messages, and QR codes point to the correct environment.

#### Scenario: Share URL uses configured origin in production

- **WHEN** a wishlist share URL is generated in production
- **THEN** the URL uses the `NEXT_PUBLIC_APP_URL` origin (e.g. `https://awishfor.com/w/<slug>`)

#### Scenario: Share URL uses localhost in development

- **WHEN** a wishlist share URL is generated in a local development environment with `NEXT_PUBLIC_APP_URL=http://localhost:4000`
- **THEN** the generated URL points to `http://localhost:4000/w/<slug>` rather than the production domain

#### Scenario: Missing NEXT_PUBLIC_APP_URL prevents app startup

- **WHEN** the application starts without `NEXT_PUBLIC_APP_URL` set in the environment
- **THEN** the `createEnv` validation throws and the app does not start, surfacing the missing variable
