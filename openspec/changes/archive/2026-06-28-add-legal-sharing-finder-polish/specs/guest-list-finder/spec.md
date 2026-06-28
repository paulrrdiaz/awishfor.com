## ADDED Requirements

### Requirement: Resolve a pasted link to the public wishlist

The guest list-finder SHALL extract a wishlist slug from a pasted public link and navigate the guest to the corresponding public wishlist page.

#### Scenario: Pasted public link resolves

- **WHEN** a guest submits a value containing a `/w/<slug>` path (a full URL or path)
- **THEN** the finder navigates to `/w/<slug>`

#### Scenario: Unknown or draft slug yields the public 404

- **WHEN** the resolved slug does not correspond to a published wishlist
- **THEN** the public wishlist route renders its existing not-found state

### Requirement: Resolve a bare slug

The guest list-finder SHALL accept a bare slug that satisfies the slug rules and navigate to its public page.

#### Scenario: Valid bare slug resolves

- **WHEN** a guest submits a value matching the slug format (lowercase letters, numbers, and hyphens, length 3–60, no leading or trailing hyphen)
- **THEN** the finder navigates to `/w/<slug>`

### Requirement: Unrecognized input feedback

The guest list-finder SHALL keep the guest on the page and show Spanish feedback when the input cannot be resolved to a slug.

#### Scenario: Malformed input is rejected before navigation

- **WHEN** a guest submits a value that is neither a `/w/<slug>` link nor a valid bare slug
- **THEN** the finder does not navigate
- **AND** it shows an inline Spanish message indicating the link or list name was not recognized

#### Scenario: No name-based search

- **WHEN** a guest submits arbitrary free-text that is not a link or slug
- **THEN** the finder does not query any name-search index
- **AND** it shows the unrecognized-input feedback
