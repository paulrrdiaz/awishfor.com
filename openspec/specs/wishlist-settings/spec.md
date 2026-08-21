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

The settings form SHALL allow the owner to edit a single wishlist name (`title`), event date and time (chosen through a single `DateTimePicker` field combining a calendar popover and time input), an optional RSVP deadline date, event location, dress code, welcome and thank-you copy, an optional gift list message, the message signature, optional delivery details (recipient name, delivery address, delivery phone), the presentation variant for the countdown, welcome message, and thank-you message, the motif selection (motif, treatment and palette) when the event type permits it, language, currency, and the How-it-works toggle, and persist them via an owner-scoped mutation. The form SHALL NOT expose a separate display name or hero title, since the wishlist has one name that serves both the owner's dashboard and the public page.

The RSVP deadline SHALL be optional and SHALL be presented adjacent to the event date and time field. When an event date is set, the mutation SHALL reject an RSVP deadline that falls after it.

The message signature field SHALL be presented as a single page-wide signature that appears beneath both the welcome and thank-you messages.

The gift list message field SHALL be grouped with the welcome and thank-you copy fields, since it is another optional piece of public-page copy rather than a delivery or motif setting.

The delivery detail fields SHALL be grouped together immediately after the message signature field, since they decorate the same welcome message card. They SHALL be the only place the owner edits delivery details; the creation wizard SHALL NOT collect them.

The welcome message SHALL be required; every other content field named here that is not already required SHALL remain optional, including the gift list message.

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

#### Scenario: Setting an RSVP deadline

- **WHEN** the owner picks an RSVP deadline date and submits
- **THEN** the mutation persists it and the personalized invite page shows the deadline in its RSVP section after revalidation

#### Scenario: Clearing the RSVP deadline

- **WHEN** the owner clears the RSVP deadline and submits
- **THEN** the mutation persists a null deadline and the RSVP section renders without deadline copy

#### Scenario: RSVP deadline after the event date is rejected

- **WHEN** the owner submits an RSVP deadline later than the wishlist's event date
- **THEN** the mutation rejects and the form surfaces the validation error

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

#### Scenario: Saving a motif selection

- **WHEN** the owner changes the motif, treatment or palette on a wishlist whose event type permits motifs and submits
- **THEN** the mutation validates the ids against the motif catalog and the accepted treatment and palette values, and persists them

#### Scenario: Editing delivery details

- **WHEN** the owner fills the delivery recipient name, address, and phone and submits
- **THEN** the mutation persists all three and the public wishlist page renders the delivery postscript after revalidation

#### Scenario: Clearing delivery details

- **WHEN** the owner clears the delivery address and submits
- **THEN** the mutation persists it as absent and the public wishlist page renders no delivery postscript

#### Scenario: Delivery fields sit beside the signature

- **WHEN** the settings form renders
- **THEN** the three delivery fields appear grouped immediately after the message signature field

#### Scenario: Setting a gift list message

- **WHEN** the owner types a gift list message and saves
- **THEN** the mutation persists it and the public wishlist page renders it above the gift list after revalidation

#### Scenario: Clearing the gift list message

- **WHEN** the owner clears the gift list message and saves
- **THEN** the mutation persists it as absent and the public wishlist page renders no line above the gift list

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

### Requirement: Welcome message is required

The welcome message SHALL be required on every wishlist. The settings form SHALL block submission when the welcome message is empty and SHALL surface a visible validation error naming the field, so the host learns the field is required rather than having a value substituted silently. When a write reaches the server with an empty or whitespace-only welcome message, the server SHALL store the event type's preset welcome copy instead of rejecting, so partial draft saves continue to succeed.

#### Scenario: Clearing the welcome message is blocked in the form

- **WHEN** the owner clears the welcome message and submits the settings form
- **THEN** the form shows a validation error on the welcome message field and does not submit

#### Scenario: Server substitutes the preset for an empty value

- **WHEN** a write reaches the server with an empty or whitespace-only welcome message
- **THEN** the wishlist is stored with the preset welcome copy for its event type rather than with an empty value

#### Scenario: Partial draft saves still succeed

- **WHEN** a draft is saved before the host has typed a welcome message
- **THEN** the save succeeds and the stored welcome message is the event type's preset copy

#### Scenario: Every wishlist has a welcome message

- **WHEN** any wishlist is read back after being written
- **THEN** its welcome message is a non-empty value
