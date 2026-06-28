## MODIFIED Requirements

### Requirement: Wishlist archival

The system SHALL archive a wishlist by setting status to `archived` and recording `archivedAt` without hard deleting the wishlist. The operation SHALL verify that the caller is the owner of the targeted wishlist and SHALL reject the request if the wishlist does not belong to the caller.

#### Scenario: Wishlist is archived by its owner

- **WHEN** the owner of a draft or published wishlist requests archival
- **THEN** the persisted wishlist has status `archived` and `archivedAt` is set

#### Scenario: Non-owner archival is rejected

- **WHEN** an authenticated user requests archival for a wishlist they do not own
- **THEN** the system rejects the request and does not change the wishlist status

### Requirement: Wishlist restoration

The system SHALL restore an archived wishlist to either `draft` or `published` and clear `archivedAt`. The operation SHALL verify that the caller is the owner of the targeted wishlist and SHALL reject the request if the wishlist does not belong to the caller.

#### Scenario: Archived wishlist is restored to draft by its owner

- **WHEN** the owner of an archived wishlist restores it with target status `draft`
- **THEN** the persisted wishlist has status `draft`, `archivedAt` is null, and `publishedAt` is unchanged

#### Scenario: Archived wishlist is restored to published by its owner

- **WHEN** the owner of an archived wishlist restores it with target status `published`
- **THEN** the persisted wishlist has status `published`, `archivedAt` is null, and `publishedAt` is set

#### Scenario: Non-owner restoration is rejected

- **WHEN** an authenticated user requests restoration for a wishlist they do not own
- **THEN** the system rejects the request and does not change the wishlist status

### Requirement: Authenticated wishlist summary list

The system SHALL return a summary list of the authenticated owner's wishlists excluding archived wishlists, consistent with the behaviour of the basic wishlist list endpoint.

#### Scenario: Summary list excludes archived wishlists

- **WHEN** an authenticated owner requests the summary list
- **THEN** the system returns only wishlists with status `draft` or `published` and excludes any with status `archived`

#### Scenario: Summary list is owner-scoped

- **WHEN** an authenticated owner requests the summary list
- **THEN** the system returns only wishlists belonging to that owner
