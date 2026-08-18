## ADDED Requirements

### Requirement: Wishlist view models expose the optional subtitle

Owner-facing and public wishlist view models SHALL expose the wishlist subtitle as a serializable string or `null`. Public mapping SHALL include the subtitle because it is intentional guest-facing presentation copy; an absent database value SHALL remain `null` rather than being replaced with wizard default copy.

#### Scenario: Public view model includes subtitle

- **WHEN** a stored wishlist has a subtitle and is mapped for public rendering
- **THEN** the public wishlist view model contains the same subtitle string

#### Scenario: Owner view model includes subtitle

- **WHEN** a stored wishlist is loaded for owner Settings or preview
- **THEN** the owner-facing view model contains its current subtitle value

#### Scenario: Absent subtitle remains absent

- **WHEN** an existing wishlist with no subtitle is mapped
- **THEN** its owner-facing and public view models expose `subtitle` as `null`
- **AND** no generic subtitle is injected during mapping
