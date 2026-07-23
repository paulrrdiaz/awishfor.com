# guest-invite-management Specification

## Purpose
Defines the owner-facing invite list for a wishlist: the `Invite`/extra-guest data model, the owner-scoped `invite` tRPC router (list, create, update, delete), the editable unique guest slug, and the Invitados dashboard tab (`/dashboard/wishlists/[id]/guests`) for adding, editing, and deleting invites and copying each guest's personalized URL.

## Requirements

### Requirement: Invite data model

Each wishlist SHALL own zero or more invites. An invite SHALL have a required primary guest name, an optional primary email, an optional primary phone, a URL slug unique within its wishlist, an RSVP status of `pending`, `confirmed`, or `declined` (default `pending`), an optional `openedAt` timestamp, an optional `respondedAt` timestamp, and between 0 and 4 extra guests. Each extra guest SHALL have an optional name and no other required data. Deleting a wishlist SHALL delete its invites and their extra guests.

#### Scenario: Invite belongs to one wishlist with one primary guest
- **WHEN** an invite is created for a wishlist
- **THEN** it stores exactly one primary guest name and is associated with that wishlist only

#### Scenario: Extra guests are limited to four and may be unnamed
- **WHEN** an invite is created or updated with more than 4 extra guests
- **THEN** the operation is rejected with a validation error
- **AND WHEN** an extra guest is provided without a name
- **THEN** it is stored as an unnamed extra guest that still counts toward the party size

### Requirement: Owner-only invite management

The `invite` tRPC router SHALL expose list, create, update, and delete procedures as `protectedProcedure`s scoped to the authenticated owner, and SHALL reject any operation on a wishlist the caller does not own.

#### Scenario: Non-owner cannot read or mutate invites
- **WHEN** a signed-in user requests or mutates invites for a wishlist they do not own
- **THEN** the procedure throws an authorization error and no data is returned or changed

#### Scenario: Owner lists invites for their wishlist
- **WHEN** the owner calls the list procedure for their wishlist
- **THEN** it returns that wishlist's invites with primary guest, party size, slug, and RSVP status

### Requirement: Editable unique guest slug

An invite's slug SHALL be editable by the owner and SHALL be unique within its wishlist. When the owner does not supply a slug, the system SHALL derive one from the primary guest name (lowercase, hyphenated). The system SHALL reject a slug that collides with another invite in the same wishlist or with a reserved route segment.

#### Scenario: Slug derived from name on create
- **WHEN** an invite is created with primary name "Pedro Castillo" and no explicit slug
- **THEN** the invite receives the slug `pedro-castillo`

#### Scenario: Duplicate slug within a wishlist is rejected
- **WHEN** the owner sets an invite slug that already belongs to another invite in the same wishlist
- **THEN** the operation is rejected with a validation error and the slug is unchanged

#### Scenario: Reserved segment rejected
- **WHEN** the owner sets an invite slug equal to a reserved public route segment
- **THEN** the operation is rejected with a validation error

### Requirement: Invitados management UI

The wishlist detail SHALL provide an Invitados view at `/dashboard/wishlists/[id]/guests` that lists invites and supports adding, editing, and deleting an invite. The add/edit form SHALL capture the primary guest name (required), optional email and phone, up to 4 optional extra-guest names, and an editable slug. The list SHALL display each invite's party size and RSVP status and SHALL provide a control to copy that invite's personalized URL.

#### Scenario: Owner adds an invite with extra guests
- **WHEN** the owner submits the add form with a primary name and two extra-guest names
- **THEN** the invite is created with a party size of 3 and appears in the list

#### Scenario: Copy personalized URL
- **WHEN** the owner activates the copy control for an invite
- **THEN** the invite's personalized URL (`/w/<wishlist-slug>/<guest-slug>`) is copied to the clipboard

#### Scenario: RSVP status is visible to the owner
- **WHEN** an invite's status is `confirmed`
- **THEN** the list row shows a confirmed indicator for that invite
