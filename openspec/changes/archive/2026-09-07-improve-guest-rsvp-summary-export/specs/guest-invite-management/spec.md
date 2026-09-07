## MODIFIED Requirements

### Requirement: Invitados management UI

The wishlist detail SHALL provide an Invitados view at `/dashboard/wishlists/[id]/guests` that lists invites and supports adding, editing, and deleting an invite. The add/edit form SHALL capture the primary guest name (required), optional email and phone, up to 4 optional extra-guest names, and an editable slug. The list SHALL display each invite's party size and RSVP status and SHALL provide a control to copy that invite's personalized URL. For an invite that has responded, the row SHALL also display how many of the party are attending out of the party's total size. When the authenticated user is the wishlist owner, each row SHALL additionally display that personalized link's total recorded views and latest recorded view time, using an explicit empty state when it has never been viewed. When at least one invitation exists, the view SHALL provide search across the primary guest name, named extra guests, primary email, and primary phone, plus invitation-level RSVP filters for all, pending, confirmed, and declined invitations. Search and status SHALL compose as an intersection, SHALL be represented in the page URL, and SHALL NOT replace the unfiltered attendance summary shown in the page header. The header summary SHALL report total people, confirmed people, and pending invitations. Total and confirmed people SHALL count primary and extra guests individually; pending invitations SHALL count invitations whose primary RSVP status is `pending`. Status-filter counts SHALL represent invitations in the complete unfiltered list. The view SHALL distinguish a wishlist with no invitations from an existing list with no matching filtered results.

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

#### Scenario: Owner sees invitation-view metrics
- **WHEN** an owner opens the guest list and an invite has recorded three personalized-link views, the latest at a known time
- **THEN** that invite's row displays three views and that latest view time

#### Scenario: Unviewed invitation is explicit
- **WHEN** an owner opens the guest list and an invite has no recorded personalized-link views
- **THEN** its row displays zero views and an explicit no-views-yet state instead of a misleading date

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

#### Scenario: Attendance summary uses people and invitations deliberately
- **WHEN** the complete list contains six people, two people with status `confirmed`, and one invitation whose primary status is `pending`
- **THEN** the header reports `6 personas`, `2 confirmadas`, and `1 invitación pendiente`

#### Scenario: Counts remain anchored to the complete list
- **WHEN** search or RSVP filtering hides one or more invitations
- **THEN** the page header continues to show total people, confirmed people, and pending invitations from the complete list
- **AND** each RSVP filter count continues to represent the complete invitation list rather than the currently visible intersection

#### Scenario: Active filters produce no matches
- **WHEN** invitations exist but no invitation matches the active search and RSVP filter
- **THEN** the view shows a filtered-results empty state with an action to clear both controls
- **AND** it does not show the zero-invitations onboarding empty state

#### Scenario: Owner clears all filters
- **WHEN** the owner activates the clear-filters action
- **THEN** the search becomes empty, the RSVP filter returns to all invitations, and every invitation is shown in its original order

## ADDED Requirements

### Requirement: Copy complete confirmed-person roster

The Invitados view SHALL provide users with wishlist access a responsive `Copiar confirmados` control. The control SHALL copy a plain-text roster derived from the complete unfiltered invitation list and SHALL include only primary and extra guests whose individual RSVP status is `confirmed`. The roster SHALL include the wishlist title, the confirmed-person total, and one compact entry per invitation, grouped by primary name in alphabetical order. A primary guest name SHALL appear no more than once in its entry; named confirmed companions SHALL be joined inline, and unnamed confirmed companions SHALL be represented as `+ N` when the primary is confirmed. The roster SHALL omit email addresses, phone numbers, personalized URLs, and pending or declined people. The interface SHALL expose success and failure feedback after a clipboard attempt, and SHALL keep the control visible but unavailable when no people are confirmed.

#### Scenario: Copy a mixed-status roster
- **WHEN** the complete guest list contains confirmed, pending, and declined primary and extra guests
- **AND** a user activates `Copiar confirmados`
- **THEN** the copied text contains every confirmed person exactly once
- **AND** it contains no pending or declined person
- **AND** its displayed total equals the number of copied people

#### Scenario: Copy ignores active filters
- **WHEN** search or an RSVP filter hides one or more confirmed people from the visible list
- **AND** a user activates `Copiar confirmados`
- **THEN** the copied roster still contains all confirmed people from the complete invitation list

#### Scenario: Copy keeps a compact party entry
- **WHEN** a confirmed invitation contains a named companion and an unnamed companion
- **THEN** the roster contains one entry such as `- Ana y Luis + 1`
- **AND** the primary guest name is not repeated within that entry

#### Scenario: Copy omits contact data
- **WHEN** confirmed invitations include email addresses, phone numbers, or personalized URLs
- **THEN** none of those values appears in the copied roster

#### Scenario: Clipboard write succeeds
- **WHEN** the browser accepts the confirmed-roster clipboard write
- **THEN** the control reports `Lista copiada`

#### Scenario: Clipboard write fails
- **WHEN** the browser rejects the confirmed-roster clipboard write
- **THEN** the interface reports that the list could not be copied and invites the user to retry

#### Scenario: No confirmed people
- **WHEN** the confirmed-person count is zero
- **THEN** `Copiar confirmados` remains visible but unavailable
- **AND** its accessible description explains that no people are confirmed yet
