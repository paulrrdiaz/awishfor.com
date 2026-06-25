## ADDED Requirements

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

The system SHALL publish a wishlist by setting status to `published` and recording `publishedAt`.

#### Scenario: Draft wishlist is published

- **WHEN** a draft wishlist is published
- **THEN** the persisted wishlist has status `published`, `publishedAt` is set, and `archivedAt` is null

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
