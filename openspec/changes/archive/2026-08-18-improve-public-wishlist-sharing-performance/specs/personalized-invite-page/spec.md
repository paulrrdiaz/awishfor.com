## ADDED Requirements

### Requirement: Personalized metadata uses the parent wishlist identity

A valid personalized invite page SHALL use the parent published wishlist's title, description, preview image, and clean `/w/<slug>` canonical URL for social metadata. Invite resolution and first-open tracking SHALL remain personalized and dynamic, but guest-specific state SHALL NOT alter the shared social representation.

#### Scenario: Valid invite emits parent canonical metadata

- **WHEN** `/w/<slug>/<guestSlug>` resolves to a valid invite
- **THEN** its canonical URL is `/w/<slug>` on the configured public origin
- **AND** its Open Graph and Twitter identity matches the parent published wishlist

#### Scenario: Metadata generation does not record an open

- **WHEN** a crawler or metadata resolver reads the personalized page metadata without rendering the invite page
- **THEN** the invite's `openedAt` value is not created or changed by metadata generation alone

#### Scenario: Guest render still records first open

- **WHEN** the valid personalized invite page itself is rendered for the first time
- **THEN** its existing first-open tracking behavior remains in effect
