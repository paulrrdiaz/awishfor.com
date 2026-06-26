## ADDED Requirements

### Requirement: Resolve a wishlist by slug

The system SHALL resolve a public slug to a single result describing how it may be shown: a published wishlist, an owner-only draft preview, an archived inactive state, or not found.

#### Scenario: Published wishlist resolves to a public result

- **WHEN** a slug maps to a wishlist with status `published`
- **THEN** the result is a published public wishlist view model

#### Scenario: Unknown slug resolves to not found

- **WHEN** a slug maps to no wishlist
- **THEN** the result is not found

### Requirement: Draft access is owner-only

The system SHALL return a draft wishlist only to its owner, as a preview, and SHALL return not found for any other viewer so that draft existence does not leak.

#### Scenario: Owner sees a draft preview

- **WHEN** the viewer's identity matches the wishlist owner and the wishlist status is `draft`
- **THEN** the result is an owner draft preview

#### Scenario: Non-owner cannot see a draft

- **WHEN** a wishlist has status `draft` and the viewer is signed out or is not the owner
- **THEN** the result is not found, indistinguishable from an unknown slug

### Requirement: Archived wishlists render an inactive state

The system SHALL resolve an archived wishlist to an inactive-state result rather than the full public gift list.

#### Scenario: Archived wishlist resolves to archived state

- **WHEN** a slug maps to a wishlist with status `archived`
- **THEN** the result is an archived inactive state and does not include the public gift list

### Requirement: Hidden and soft-deleted gifts never appear publicly

The system SHALL exclude every hidden gift and every soft-deleted gift from any public result, and SHALL exclude guest contact data and internal notes.

#### Scenario: Hidden gift is excluded

- **WHEN** a published wishlist contains a gift with visibility status `hidden`
- **THEN** the public result does not include that gift

#### Scenario: Soft-deleted gift is excluded

- **WHEN** a published wishlist contains a gift with `deletedAt` set
- **THEN** the public result does not include that gift

### Requirement: Public route at /w/[slug]

The system SHALL serve public wishlists at the URL path `/w/[slug]` and SHALL render the published wishlist, an owner preview with a preview banner, an archived message, or a not-found response according to the resolved result.

#### Scenario: Published wishlist is served at its slug

- **WHEN** a request reaches `/w/[slug]` for a published wishlist
- **THEN** the published wishlist is rendered

#### Scenario: Not-found result returns a 404

- **WHEN** the resolved result is not found
- **THEN** the route returns a 404 not-found response

#### Scenario: Owner preview shows a banner

- **WHEN** the resolved result is an owner draft preview
- **THEN** the page renders the wishlist with a preview banner indicating it is not yet public

### Requirement: Public wishlist pages are noindex

The system SHALL mark every `/w/[slug]` response as `noindex` so public wishlist pages are not indexed by search engines, while marketing pages remain indexable.

#### Scenario: Public wishlist page is not indexed

- **WHEN** metadata is generated for any `/w/[slug]` response
- **THEN** the metadata instructs search engines not to index the page
