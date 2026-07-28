# guest-list-finder Specification

## Purpose
Defines the guest-facing list-finder that resolves a pasted link or bare slug to a public wishlist, the surfaces that offer it (landing page and public not-found page), and the shared resolution behavior those surfaces must not diverge on.

## Requirements

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

### Requirement: Finder is available from the public not-found page

The guest list-finder SHALL be offered on the public not-found page at every breakpoint, so a guest who followed a broken or mistyped link can recover without first navigating to the landing page.

#### Scenario: Finder renders on the public not-found page

- **WHEN** the public not-found page renders
- **THEN** it presents the guest list-finder with the prompt `¿Buscas la lista de alguien?`

#### Scenario: Finder is present on small viewports

- **WHEN** the public not-found page renders below the `md` breakpoint
- **THEN** the guest list-finder is still present and usable

#### Scenario: Finder on the not-found page resolves identically

- **WHEN** a guest submits a link or bare slug from the public not-found page
- **THEN** the finder resolves and navigates using the same rules as the landing-page finder

### Requirement: Finder resolution behavior is shared across surfaces

The guest list-finder's input validation, slug extraction, navigation, and unrecognized-input feedback SHALL be defined once and reused by every surface that offers the finder, so the surfaces cannot diverge.

#### Scenario: Validation bounds match across surfaces

- **WHEN** a guest submits input on any surface offering the finder
- **THEN** the same minimum and maximum input-length rules apply

#### Scenario: Unrecognized input feedback matches across surfaces

- **WHEN** a guest submits input that resolves to no slug on any surface offering the finder
- **THEN** the finder does not navigate
- **AND** it shows the same Spanish unrecognized-input message

#### Scenario: Presentation may differ per surface

- **WHEN** the finder renders on the landing page and on the public not-found page
- **THEN** each may style its input and submit control with its own theme tokens
- **AND** the resolution behavior remains identical
