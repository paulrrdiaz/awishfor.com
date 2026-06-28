## ADDED Requirements

### Requirement: Owner-scoped wishlist list

The dashboard SHALL provide a list view at `/dashboard/wishlists` that shows only the wishlists owned by the signed-in user, each rendered as a card with title, event type, status, and quantity-based purchase progress.

#### Scenario: Owner sees only their own wishlists

- **WHEN** a signed-in owner opens `/dashboard/wishlists`
- **THEN** the page SHALL display a card for each wishlist whose `ownerId` matches the signed-in user
- **AND** SHALL NOT display wishlists belonging to other users

#### Scenario: Card shows status and progress

- **WHEN** a wishlist card renders
- **THEN** it SHALL show the wishlist title, an event-type label, a status badge, and a quantity-based progress indicator computed as purchased units over total units across visible, non-deleted gifts

#### Scenario: Card links to the overview

- **WHEN** the owner activates a wishlist card
- **THEN** they SHALL be navigated to that wishlist's overview at `/dashboard/wishlists/[id]`

### Requirement: Status filters

The list view SHALL provide filters for Activas, Borradores, Publicadas, and Archivadas, and SHALL hide archived wishlists from the default view.

#### Scenario: Default view hides archived

- **WHEN** the owner opens `/dashboard/wishlists` without choosing a filter
- **THEN** archived wishlists SHALL NOT appear in the default (Activas) view

#### Scenario: Borradores filter

- **WHEN** the owner selects the Borradores filter
- **THEN** only wishlists with status `draft` SHALL be shown

#### Scenario: Publicadas filter

- **WHEN** the owner selects the Publicadas filter
- **THEN** only wishlists with status `published` SHALL be shown

#### Scenario: Archivadas filter

- **WHEN** the owner selects the Archivadas filter
- **THEN** only wishlists with status `archived` SHALL be shown

### Requirement: Empty states

The list view SHALL show an empty state when the owner has no wishlists, and a per-filter empty state when a selected filter matches none.

#### Scenario: No wishlists at all

- **WHEN** a signed-in owner who has created no wishlists opens `/dashboard/wishlists`
- **THEN** the page SHALL show an empty state whose call to action links to `/create`
- **AND** the copy SHALL communicate "Aún no tienes wishlists / Crea tu primera wishlist…"

#### Scenario: Filter matches no wishlists

- **WHEN** the owner selects a filter that matches none of their wishlists
- **THEN** the page SHALL show a message indicating there are no wishlists for that filter
