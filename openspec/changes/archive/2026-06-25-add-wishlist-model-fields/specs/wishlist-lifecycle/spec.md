## ADDED Requirements

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
