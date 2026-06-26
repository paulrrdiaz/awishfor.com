## ADDED Requirements

### Requirement: Slug suggestion from title

The system SHALL derive a candidate slug from a wishlist title by lowercasing, transliterating accents, replacing non-alphanumeric runs with single hyphens, and trimming leading/trailing hyphens, producing a value that satisfies the slug format rules.

#### Scenario: Title is converted to a valid slug

- **WHEN** a title such as `Lista de Boda de Ana & Luis` is normalized
- **THEN** the system returns `lista-de-boda-de-ana-luis`

#### Scenario: Accented and non-Latin characters are normalized

- **WHEN** a title containing accents such as `Cumpleaños de Ámbar` is normalized
- **THEN** the system returns a slug with accents stripped, for example `cumpleanos-de-ambar`

#### Scenario: Title too short to slugify

- **WHEN** a title normalizes to fewer than 3 usable characters
- **THEN** the system returns no suggestion rather than an invalid slug

### Requirement: Slug format validation

The system SHALL validate a slug against the canonical format rules: lowercase letters, numbers, and hyphens only; length 3–60; and no leading or trailing hyphen.

#### Scenario: Valid slug passes

- **WHEN** a slug `lista-de-boda` is validated
- **THEN** validation succeeds

#### Scenario: Invalid slug returns a specific validation state

- **WHEN** a slug with uppercase, spaces, a leading/trailing hyphen, or out-of-range length is validated
- **THEN** validation fails with a message identifying the rule that was violated

### Requirement: Slug availability check

The system SHALL determine whether a format-valid slug is available by checking it against all persisted wishlists.

#### Scenario: Unused slug is available

- **WHEN** availability is checked for a slug not used by any wishlist
- **THEN** the system reports the slug as available

#### Scenario: Existing slug is unavailable

- **WHEN** availability is checked for a slug already used by another wishlist
- **THEN** the system reports the slug as unavailable

#### Scenario: Invalid slug is reported as unavailable with reason

- **WHEN** availability is checked for a slug that fails format validation
- **THEN** the system reports the slug as unavailable and surfaces the validation reason without querying for uniqueness

### Requirement: Slug self-exclusion when editing

The system SHALL accept an `excludeWishlistId` so that an owner editing an existing wishlist sees that wishlist's current slug as available.

#### Scenario: Current wishlist slug is available when editing the same wishlist

- **WHEN** availability is checked for a slug owned by the wishlist identified by `excludeWishlistId`
- **THEN** the system reports the slug as available

#### Scenario: Another wishlist's slug stays unavailable when editing

- **WHEN** availability is checked with an `excludeWishlistId` for a slug used by a different wishlist
- **THEN** the system reports the slug as unavailable

### Requirement: Slug availability endpoint

The system SHALL expose an authenticated tRPC procedure on the wishlist router that checks slug availability for the create and edit flows.

#### Scenario: Availability is checked before save and before publish

- **WHEN** the create/edit UI requests an availability check for a candidate slug
- **THEN** the procedure validates the input, runs the availability service, and returns whether the slug is available
