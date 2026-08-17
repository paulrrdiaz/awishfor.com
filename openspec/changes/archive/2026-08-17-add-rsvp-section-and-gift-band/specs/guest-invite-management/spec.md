## MODIFIED Requirements

### Requirement: Invite data model

Each wishlist SHALL own zero or more invites. An invite SHALL have a required primary guest name, an optional primary email, an optional primary phone, a URL slug unique within its wishlist, an RSVP status of `pending`, `confirmed`, or `declined` (default `pending`), an optional `openedAt` timestamp, an optional `respondedAt` timestamp, and between 0 and 4 extra guests. Each extra guest SHALL have an optional name, a stable identifier, and its own RSVP status of `pending`, `confirmed`, or `declined` (default `pending`), and no other required data. Deleting a wishlist SHALL delete its invites and their extra guests.

#### Scenario: Invite belongs to one wishlist with one primary guest
- **WHEN** an invite is created for a wishlist
- **THEN** it stores exactly one primary guest name and is associated with that wishlist only

#### Scenario: Extra guests are limited to four and may be unnamed
- **WHEN** an invite is created or updated with more than 4 extra guests
- **THEN** the operation is rejected with a validation error
- **AND WHEN** an extra guest is provided without a name
- **THEN** it is stored as an unnamed extra guest that still counts toward the party size

#### Scenario: Extra guests start pending
- **WHEN** an invite is created with two extra guests
- **THEN** each extra guest is stored with RSVP status `pending`

### Requirement: Invitados management UI

The wishlist detail SHALL provide an Invitados view at `/dashboard/wishlists/[id]/guests` that lists invites and supports adding, editing, and deleting an invite. The add/edit form SHALL capture the primary guest name (required), optional email and phone, up to 4 optional extra-guest names, and an editable slug. The list SHALL display each invite's party size and RSVP status and SHALL provide a control to copy that invite's personalized URL. For an invite that has responded, the row SHALL also display how many of the party are attending out of the party's total size.

#### Scenario: Owner adds an invite with extra guests
- **WHEN** the owner submits the add form with a primary name and two extra-guest names
- **THEN** the invite is created with a party size of 3 and appears in the list

#### Scenario: Copy personalized URL
- **WHEN** the owner activates the copy control for an invite
- **THEN** the invite's personalized URL (`/w/<wishlist-slug>/<guest-slug>`) is copied to the clipboard

#### Scenario: RSVP status is visible to the owner
- **WHEN** an invite's status is `confirmed`
- **THEN** the list row shows a confirmed indicator for that invite

#### Scenario: Party confirmation count is visible to the owner
- **WHEN** an invite with a party size of 3 has responded with the primary guest and one extra guest attending
- **THEN** the list row shows that 2 of 3 are confirmed

#### Scenario: Pending invite shows no party count
- **WHEN** an invite has status `pending`
- **THEN** the list row shows the pending indicator and party size without a confirmation count
