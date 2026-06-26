# wishlist-lifecycle Specification

## Purpose
TBD - created by archiving change add-core-enums-wishlist-lifecycle. Update Purpose after archive.
## Requirements
### Requirement: Core wishlist domain enums

The system SHALL define canonical enum values for wishlist status, event type, locale, currency, gift priority, and gift visibility so database, validation, and service code use the same domain vocabulary.

#### Scenario: Enum values are available

- **WHEN** application code imports the wishlist lifecycle domain types
- **THEN** `WishlistStatus` includes `draft`, `published`, and `archived`; `EventType` includes `baby_shower`, `birthday`, `wedding`, `housewarming`, and `general`; `Locale` includes `es` and `en`; `Currency` includes `PEN`, `USD`, `EUR`, `MXN`, `COP`, `CLP`, and `ARS`; `GiftPriority` includes `low`, `medium`, and `high`; and `GiftVisibilityStatus` includes `available` and `hidden`

### Requirement: Draft wishlist creation

The system SHALL create new wishlists in `draft` status unless a valid lifecycle transition explicitly changes the status.

#### Scenario: Wishlist is created as draft

- **WHEN** a wishlist is created without a lifecycle override
- **THEN** the persisted wishlist has status `draft`, `publishedAt` is null, and `archivedAt` is null

### Requirement: Wishlist publishing
The system SHALL publish a wishlist by setting status to `published` and recording `publishedAt`, only when the authenticated owner requests publication for an owned draft wishlist that satisfies the publish-readiness requirements; an unready, missing, non-owned, or non-draft wishlist SHALL be rejected without changing its status.

#### Scenario: Ready owner draft wishlist is published
- **WHEN** an authenticated owner publishes an owned draft wishlist that satisfies publish readiness
- **THEN** the persisted wishlist has status `published`, `publishedAt` is set, and `archivedAt` is null

#### Scenario: Unready wishlist is rejected
- **WHEN** publishing is requested for a wishlist that fails one or more publish-readiness requirements
- **THEN** the system rejects the request, surfaces the failed checklist, and leaves the wishlist status unchanged

#### Scenario: Signed-out publish is rejected
- **WHEN** a signed-out user invokes the publish operation
- **THEN** the system rejects the request as unauthenticated and does not publish any wishlist

#### Scenario: Non-owner publish is rejected
- **WHEN** an authenticated user requests publication for a wishlist owned by another user
- **THEN** the system returns a non-disclosing not-found result and leaves that wishlist unchanged

#### Scenario: Non-draft wishlist publish is rejected
- **WHEN** an authenticated owner requests wizard publication for a wishlist that is already published or archived
- **THEN** the system rejects the request and leaves the wishlist status unchanged

### Requirement: Wishlist archival

The system SHALL archive a wishlist by setting status to `archived` and recording `archivedAt` without hard deleting the wishlist.

#### Scenario: Wishlist is archived

- **WHEN** a draft or published wishlist is archived
- **THEN** the persisted wishlist has status `archived` and `archivedAt` is set

### Requirement: Wishlist restoration

The system SHALL restore an archived wishlist to either `draft` or `published` and clear `archivedAt`.

#### Scenario: Archived wishlist is restored to draft

- **WHEN** an archived wishlist is restored with target status `draft`
- **THEN** the persisted wishlist has status `draft`, `archivedAt` is null, and `publishedAt` is unchanged

#### Scenario: Archived wishlist is restored to published

- **WHEN** an archived wishlist is restored with target status `published`
- **THEN** the persisted wishlist has status `published`, `archivedAt` is null, and `publishedAt` is set

### Requirement: Wishlist ownership

The system SHALL associate each wishlist with exactly one local user owner.

#### Scenario: Wishlist is created for an owner

- **WHEN** a wishlist is created with a valid local user owner
- **THEN** the persisted wishlist references that owner and the owner can be queried with their wishlists

#### Scenario: Wishlist creation requires an owner

- **WHEN** wishlist creation is requested without a valid owner
- **THEN** the system rejects the request and does not create an orphan wishlist

### Requirement: Wishlist public identity fields

The system SHALL persist the required public identity fields for a wishlist: title, globally unique slug, and event type.

#### Scenario: Wishlist identity is stored

- **WHEN** a wishlist is created with title, slug, and event type
- **THEN** the persisted wishlist stores those values with lifecycle status `draft`

#### Scenario: Slug is globally unique

- **WHEN** a wishlist is created or updated with a slug already used by another wishlist
- **THEN** the system rejects the duplicate slug

### Requirement: Wishlist localization and currency defaults

The system SHALL store wishlist language and currency using the canonical locale and currency values, defaulting to Spanish and Peruvian sol when omitted.

#### Scenario: Defaults are applied

- **WHEN** a wishlist is created without language or currency values
- **THEN** the persisted wishlist has language `es` and currency `PEN`

#### Scenario: Explicit localization values are stored

- **WHEN** a wishlist is created with supported language and currency values
- **THEN** the persisted wishlist stores the provided language and currency

### Requirement: Wishlist public page content

The system SHALL store public page copy and display identity fields for a wishlist.

#### Scenario: Public page content is stored

- **WHEN** a wishlist is created or updated with hero title, welcome message, thank-you message, and display name
- **THEN** the persisted wishlist stores those public page content values

### Requirement: Wishlist event details

The system SHALL store optional event date, event time, and event location fields for a wishlist.

#### Scenario: Event details are optional

- **WHEN** a wishlist is created without event date, event time, or event location
- **THEN** the persisted wishlist is valid and stores those event detail fields as empty

#### Scenario: Past event dates are allowed

- **WHEN** a wishlist is created or updated with an event date in the past
- **THEN** the system accepts and persists that date

#### Scenario: Event time uses HH:mm format

- **WHEN** a wishlist is created or updated with an event time
- **THEN** the system accepts only a valid 24-hour `HH:mm` value

### Requirement: Wishlist design settings

The system SHALL store optional design settings and media references for a wishlist.

#### Scenario: Design settings are stored

- **WHEN** a wishlist is created or updated with cover image URL, theme ID, layout ID, button style, and font pairing
- **THEN** the persisted wishlist stores those design setting values

#### Scenario: Missing design settings can fall back to presets

- **WHEN** a wishlist is read with missing design setting values
- **THEN** the system can derive display settings from the wishlist event type presets

### Requirement: Wishlist how-it-works visibility

The system SHALL store whether the public wishlist page should show the how-it-works section and default it to visible.

#### Scenario: How-it-works defaults to visible

- **WHEN** a wishlist is created without a how-it-works visibility value
- **THEN** the persisted wishlist has `showHowItWorks` set to true

#### Scenario: How-it-works visibility can be disabled

- **WHEN** a wishlist is created or updated with how-it-works visibility disabled
- **THEN** the persisted wishlist has `showHowItWorks` set to false

### Requirement: Wishlist category relation

The system SHALL associate each wishlist with zero or more ordered categories.

#### Scenario: Wishlist has categories

- **WHEN** categories are created for a wishlist
- **THEN** the wishlist can be queried with those categories ordered by `sortOrder`

#### Scenario: Wishlist has no categories

- **WHEN** a wishlist is created without categories
- **THEN** the wishlist remains valid and can be queried with an empty category list

### Requirement: Wishlist gift relation

The system SHALL associate each wishlist with zero or more gifts, and SHALL cascade-delete those gifts if the wishlist is deleted.

#### Scenario: Wishlist has gifts

- **WHEN** gifts are created for a wishlist
- **THEN** the wishlist can be queried with those gifts

#### Scenario: Wishlist has no gifts

- **WHEN** a wishlist is created without gifts
- **THEN** the wishlist remains valid and can be queried with an empty gift list

### Requirement: Wizard publish persists current draft before publishing
The system SHALL provide an authenticated wizard publish operation that accepts the complete local wizard draft, saves it as the authenticated owner's draft using the same validation and replacement rules as manual draft saving, and then publishes that saved draft if it is publish-ready.

#### Scenario: Unsaved local draft is created and published
- **WHEN** an authenticated creator publishes a ready local draft with no saved wishlist ID
- **THEN** the system creates an owner-scoped draft with its categories and gifts, publishes it, and returns published wishlist share metadata

#### Scenario: Existing saved draft is updated and published
- **WHEN** an authenticated creator publishes a ready local draft with a matching saved wishlist ID and current revision timestamp
- **THEN** the system updates that same draft content, publishes it, and returns published wishlist share metadata

#### Scenario: Draft save conflict blocks publish
- **WHEN** the submitted saved draft revision conflicts with the server revision and overwrite is not explicitly confirmed
- **THEN** the system returns the current server draft conflict response and does not publish either version

#### Scenario: Invalid draft content blocks publish
- **WHEN** the submitted wizard draft fails draft validation before the lifecycle transition
- **THEN** the system rejects the request and does not create, update, or publish a wishlist

### Requirement: Publish operation returns share metadata
After a wizard publish succeeds, the system SHALL return the published wishlist ID, slug, public URL path, and dashboard URL path needed by the client publish success/share state.

#### Scenario: Published response includes share targets
- **WHEN** a wishlist is successfully published from the wizard
- **THEN** the response includes the wishlist ID, slug, `/w/[slug]` public URL path, and a dashboard management URL path for the published wishlist

