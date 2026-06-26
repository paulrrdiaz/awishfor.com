## ADDED Requirements

### Requirement: Multi-step wizard navigation

The wizard SHALL route between the steps `event-type`, `details`, `design`, and `gifts` via the `?step=` query param, falling back to the first step for a missing or unknown value, and SHALL provide Back/Next controls that move between adjacent steps in that order.

#### Scenario: Navigating forward and back

- **WHEN** the user is on the `details` step and activates Next, then Back
- **THEN** the wizard renders the `design` step, then returns to the `details` step, with the `?step=` query param reflecting the active step

#### Scenario: Unknown step falls back

- **WHEN** the URL contains a `step` value that is not one of the known steps
- **THEN** the wizard renders the first (`event-type`) step

### Requirement: Event Details step

The Event Details step SHALL let the user edit the draft's title, display name, optional event date, optional event time, and optional event location. The event date SHALL be chosen with a calendar in a popover, and the event time SHALL be normalized to `HH:mm`. Title, date, time, and location SHALL all persist to the draft store.

#### Scenario: Editing details persists to the draft

- **WHEN** the user enters a title, picks an event date, sets a time, and types a location
- **THEN** the draft store holds the title, the selected date, the time normalized to `HH:mm`, and the location

#### Scenario: Event date, time, and location are optional

- **WHEN** the user leaves the event date, time, and location empty
- **THEN** the step is still valid and the draft stores null/empty for those fields

#### Scenario: Past event date warns without blocking

- **WHEN** the user selects an event date in the past
- **THEN** a warning is shown but the date is still accepted

### Requirement: Slug generation and editable slug

The Event Details step SHALL auto-generate the slug from the title using the shared `slugify` helper until the user manually edits the slug; after a manual edit the slug SHALL stop tracking the title. The slug field SHALL be editable directly.

#### Scenario: Slug auto-fills from title

- **WHEN** the user types a title and has not edited the slug
- **THEN** the slug field updates to the slugified title

#### Scenario: Manual slug edit stops auto-tracking

- **WHEN** the user edits the slug field and then changes the title
- **THEN** the manually edited slug is preserved and does not get overwritten by the new title

### Requirement: Slug availability check for signed-out users

The system SHALL expose the slug-availability check as a publicly callable procedure so that an unauthenticated wizard user can verify a slug. The Event Details step SHALL validate the slug client-side and check availability with a debounced request, surfacing Checking, Available, Taken, and Invalid states.

#### Scenario: Signed-out user checks an available slug

- **WHEN** a signed-out user enters a syntactically valid, unused slug
- **THEN** an availability request is made and the slug is reported Available

#### Scenario: Taken slug is reported

- **WHEN** the user enters a slug that already belongs to an existing wishlist
- **THEN** the slug is reported Taken

#### Scenario: Invalid slug is rejected client-side

- **WHEN** the user enters a slug that fails client-side validation
- **THEN** the slug is reported Invalid and no availability request is required

### Requirement: Design & Preview step

The Design & Preview step SHALL let the user select a theme, layout, font pairing, and button style from the existing public config presets, writing each selection to the draft, and SHALL render a live preview using the public wishlist layout in preview mode with purchase actions disabled.

#### Scenario: Selecting design options updates the preview

- **WHEN** the user selects a different theme, layout, font pairing, or button style
- **THEN** the draft stores the selected ids and the embedded preview re-renders with those choices

#### Scenario: Preview does not mutate purchase state

- **WHEN** the preview renders gifts
- **THEN** purchase actions are disabled and no purchase state can be changed from the preview

### Requirement: Preview uses sample gifts before real gifts exist

The Design & Preview step SHALL render the selected event type's preset `sampleGifts` as placeholder gifts when the draft has no visible user-created gifts, so the preview is never empty.

#### Scenario: Sample gifts shown when draft has no gifts

- **WHEN** the draft has an event type selected but no visible gifts
- **THEN** the preview renders the preset `sampleGifts` as placeholders

#### Scenario: Real gifts replace samples

- **WHEN** the draft has at least one visible user-created gift
- **THEN** the preview renders the user's gifts instead of the sample gifts

### Requirement: Gifts step with local draft gifts

The Gifts step SHALL let the user add, edit, and remove gifts that are stored in the wizard draft store as local draft gifts (no database write). Each gift SHALL support a name, optional product URL, optional image, optional price, a category assignment, a quantity, a priority, public and internal notes, and a hide toggle. A URL-import entry point SHALL be present as a placeholder.

#### Scenario: Add a manual gift without a product URL

- **WHEN** the user fills in a gift name (and no product URL) and saves
- **THEN** a draft gift is added to the store and appears in the gift list

#### Scenario: Assign category and quantity

- **WHEN** the user assigns a gift to one of the draft categories and sets a quantity
- **THEN** the draft gift stores that category and quantity

#### Scenario: Hidden gifts are excluded from the visible list and preview

- **WHEN** the user toggles a gift to hidden
- **THEN** that gift is excluded from the public preview and does not count toward visible-gift readiness

#### Scenario: Remove a gift

- **WHEN** the user removes a gift
- **THEN** the gift is deleted from the draft store and the list

### Requirement: Draft store holds detail, design, and gift fields

The wizard draft store SHALL persist the detail fields (title, slug, display name, event date, event time, event location, cover image), the design fields (theme, layout, font pairing, button style), and a local `gifts` array, alongside the existing event-type and copy fields, and SHALL survive reload via `localStorage`.

#### Scenario: Extended draft survives reload

- **WHEN** the user fills in details, picks design options, adds a gift, and reloads
- **THEN** the restored draft reflects the title, slug, design selections, and the added gift

#### Scenario: Reset clears the extended draft

- **WHEN** the user triggers reset / start over
- **THEN** the detail, design, and gift fields are cleared along with the rest of the draft
