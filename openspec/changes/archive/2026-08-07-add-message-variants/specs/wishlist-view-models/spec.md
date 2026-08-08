## ADDED Requirements

### Requirement: Public view model exposes a contributor summary

The public wishlist view model SHALL expose a contributor summary containing a distinct-contributor count and a capped list of contributor initials, computed on the server so that raw guest names never reach the client.

Contributors SHALL be deduplicated by guest name, compared case- and whitespace-insensitively, so a guest who purchased several gifts counts once. Purchases recorded by the owner without a named buyer SHALL be excluded so the owner is never counted as a contributor to their own list. Purchases still inside their undo window SHALL be counted.

The initials list SHALL be capped at four entries; the count remains the authoritative total.

#### Scenario: One guest buying several gifts counts once

- **WHEN** a wishlist has three purchases all recorded under `María Gómez`
- **THEN** the contributor count is 1
- **AND** the initials list contains a single entry

#### Scenario: Guest names differing only by case or padding are one contributor

- **WHEN** a wishlist has purchases under `Ana` and `ana `
- **THEN** the contributor count is 1

#### Scenario: Owner-registered purchases are excluded

- **WHEN** a wishlist has a purchase whose guest name is the owner manual-purchase default
- **THEN** that purchase contributes neither to the count nor to the initials

#### Scenario: Purchases inside the undo window are counted

- **WHEN** a purchase's undo window has not yet expired
- **THEN** its guest is included in the contributor summary

#### Scenario: Initials are capped

- **WHEN** a wishlist has twelve distinct contributors
- **THEN** the contributor count is 12
- **AND** the initials list contains at most four entries

#### Scenario: No purchases yields an empty summary

- **WHEN** a wishlist has no qualifying purchases
- **THEN** the contributor count is 0
- **AND** the initials list is empty

### Requirement: Public view model exposes the wishlist creation date

The public wishlist view model SHALL expose the wishlist's creation timestamp as a serialized ISO string, so time-elapsed presentations can anchor to it.

#### Scenario: Creation date is serialized

- **WHEN** a wishlist is mapped to the public view model
- **THEN** the view model exposes its creation timestamp as an ISO string

## MODIFIED Requirements

### Requirement: Public view model excludes private and internal data

The public wishlist view model SHALL NOT include guest contact data (email, phone), guest messages, or internal notes for any gift or purchase.

Guest initials MAY be exposed through the contributor summary as an explicit product decision; full guest names SHALL NOT be exposed.

#### Scenario: Guest PII excluded
- **WHEN** a wishlist with purchases that have `guestEmail`, `guestPhone`, and `message` is mapped to the public view model
- **THEN** the public view model exposes no guest email, phone, or message fields

#### Scenario: Internal notes excluded
- **WHEN** a gift has a non-empty `internalNote`
- **THEN** the public gift view model exposes no internal note field

#### Scenario: Full guest names excluded
- **WHEN** a wishlist with purchases is mapped to the public view model
- **THEN** the view model exposes contributor initials but no full guest name for any purchase
