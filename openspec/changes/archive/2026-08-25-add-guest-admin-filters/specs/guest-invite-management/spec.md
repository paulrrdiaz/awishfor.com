## MODIFIED Requirements

### Requirement: Invitados management UI

The wishlist detail SHALL provide an Invitados view at `/dashboard/wishlists/[id]/guests` that lists invites and supports adding, editing, and deleting an invite. The add/edit form SHALL capture the primary guest name (required), optional email and phone, up to 4 optional extra-guest names, and an editable slug. The list SHALL display each invite's party size and RSVP status and SHALL provide a control to copy that invite's personalized URL. For an invite that has responded, the row SHALL also display how many of the party are attending out of the party's total size. When at least one invitation exists, the view SHALL provide search across the primary guest name, named extra guests, primary email, and primary phone, plus invitation-level RSVP filters for all, pending, confirmed, and declined invitations. Search and status SHALL compose as an intersection, SHALL be represented in the page URL, and SHALL NOT replace the unfiltered person and invitation totals shown in the page header. Status-filter counts SHALL represent invitations in the complete unfiltered list. The view SHALL distinguish a wishlist with no invitations from an existing list with no matching filtered results.

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

#### Scenario: Search matches guest identity and contact fields
- **WHEN** the owner searches using part of a primary name, a named extra guest, a primary email address, or a primary phone number
- **THEN** the list shows invitations containing that value and excludes non-matching invitations

#### Scenario: Search tolerates accents, case, and phone formatting
- **WHEN** the owner enters a name or email with different case or without the stored accents, or enters phone digits without the stored formatting characters
- **THEN** the matching invitation remains visible

#### Scenario: RSVP filter uses the invitation status
- **WHEN** the owner selects `Pendientes`, `Confirmados`, or `No asistirán`
- **THEN** the list shows only invitations whose primary RSVP status is respectively `pending`, `confirmed`, or `declined`

#### Scenario: Search and RSVP filter compose
- **WHEN** the owner enters a search term and selects an RSVP status
- **THEN** the list shows only invitations that satisfy both controls

#### Scenario: Filter state survives navigation
- **WHEN** the owner changes the search term or RSVP filter
- **THEN** the page URL represents the active state
- **AND WHEN** the owner reloads that URL or navigates backward or forward
- **THEN** the controls and invitation results reflect the URL state

#### Scenario: Counts remain anchored to the complete list
- **WHEN** search or RSVP filtering hides one or more invitations
- **THEN** the page header continues to show the complete person and invitation totals
- **AND** each RSVP filter count continues to represent the complete invitation list rather than the currently visible intersection

#### Scenario: Active filters produce no matches
- **WHEN** invitations exist but no invitation matches the active search and RSVP filter
- **THEN** the view shows a filtered-results empty state with an action to clear both controls
- **AND** it does not show the zero-invitations onboarding empty state

#### Scenario: Owner clears all filters
- **WHEN** the owner activates the clear-filters action
- **THEN** the search becomes empty, the RSVP filter returns to all invitations, and every invitation is shown in its original order
