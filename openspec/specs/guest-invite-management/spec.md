# guest-invite-management Specification

## Purpose
Defines the owner-facing invite list for a wishlist: the `Invite`/extra-guest data model, the owner-scoped `invite` tRPC router (list, create, update, delete), the editable unique guest slug, and the Invitados dashboard tab (`/dashboard/wishlists/[id]/guests`) for adding, editing, and deleting invites and copying each guest's personalized URL.
## Requirements
### Requirement: Invite data model

Each wishlist SHALL own zero or more invites. An invite SHALL have a required primary guest name, an optional primary email, an optional primary phone, a URL slug unique within its wishlist, an RSVP status of `pending`, `confirmed`, or `declined` (default `pending`), an optional `openedAt` timestamp, an optional `respondedAt` timestamp, an optional RSVP response source of `guest` or `owner`, an optional response-lock timestamp, and between 0 and 4 extra guests. A new invitation SHALL have neither response source nor response-lock timestamp. A guest-submitted response SHALL set its source to `guest` and remain unlocked; an owner-recorded response SHALL set its source to `owner` and create a lock. Each extra guest SHALL have an optional name, a stable identifier, and its own RSVP status of `pending`, `confirmed`, or `declined` (default `pending`), and no other required data. Deleting a wishlist SHALL delete its invites and their extra guests.

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

#### Scenario: Owner-recorded response is marked and locked
- **WHEN** the owner records an RSVP for an invite
- **THEN** the invite stores `owner` as its response source and a response-lock timestamp

### Requirement: Owner-managed RSVP responses

The actual wishlist owner SHALL be able to record an attendance response for an invitation from the Invitados dashboard, including the primary guest and every extra guest. The owner SHALL be able to correct a locked response without unlocking it and SHALL be able to deliberately reopen it. Collaborators SHALL NOT be allowed to record, correct, or reopen RSVP responses. Recording or correcting a response SHALL set the RSVP status of the primary guest and every extra guest, set `respondedAt` to the current time, retain or set the response source to `owner`, and lock the personalized invite. Reopening SHALL clear the response lock and source while preserving the most recently recorded attendance statuses and response timestamp.

#### Scenario: Owner records an offline response
- **WHEN** the wishlist owner receives an RSVP by phone or WhatsApp and records the primary guest as attending with one companion not attending
- **THEN** the dashboard shows the resulting party count and the personalized link is locked

#### Scenario: Owner records a response after the guest deadline
- **WHEN** the wishlist owner records an RSVP after the self-service RSVP deadline
- **THEN** the response is accepted and the personalized link is locked

#### Scenario: Collaborator cannot manage RSVP locks
- **WHEN** a collaborator attempts to record, correct, or reopen an RSVP response
- **THEN** the operation is rejected and the invitation is unchanged

#### Scenario: Owner corrects a locked response
- **WHEN** the wishlist owner changes an already locked RSVP response
- **THEN** the corrected statuses and a new `respondedAt` timestamp are saved and the personalized link remains locked

#### Scenario: Owner reopens a response
- **WHEN** the wishlist owner deliberately reopens a locked RSVP response
- **THEN** the personalized link is eligible for guest self-service RSVP again

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

### Requirement: RSVP management controls in the guest dashboard

The Invitados dashboard SHALL provide the actual wishlist owner a control to record or correct an invitation's RSVP and a separate, deliberate control to reopen a locked invitation. The response control SHALL let the owner choose attending or not attending for the primary guest and, when the primary guest is attending, for every extra guest. A locked invitation SHALL clearly indicate that its response was registered by the owner. Collaborators may continue to view invitation RSVP status but SHALL NOT be shown controls that record, correct, or reopen RSVP responses.

#### Scenario: Owner sees response actions for a pending invitation
- **WHEN** the owner views a pending invitation
- **THEN** they can open a response control and record attendance for the party

#### Scenario: Owner sees a locked response state
- **WHEN** the owner views an invitation whose response is locked
- **THEN** the row identifies it as owner-registered and offers controls to correct or reopen it

#### Scenario: Companion choices are omitted for a declining primary guest
- **WHEN** the owner chooses not attending for the primary guest
- **THEN** companion choices are not required and all companions are recorded as not attending

### Requirement: Contextual follow-up controls in Invitados

The Invitados view SHALL present at most one contextual follow-up control on each eligible invitation row or card, for both the wishlist owner and wishlist collaborators. The control SHALL use the recommendation defined by `contextual-invite-reminders`, SHALL be available at desktop and mobile widths, and SHALL copy the generated message directly without requiring the host or collaborator to open WhatsApp or navigate to a separate share screen. Existing personalized-URL copy access SHALL remain available independently.

Each owner-visible invitation SHALL retain its RSVP badge and view count and SHALL add a concise, human-readable view/recommendation indicator. Collaborators SHALL see the same RSVP badge and the same concise view/recommendation indicator, but SHALL NOT see the exact view count or exact last-viewed timestamp, consistent with the owner-only analytics boundary defined in `wishlist-view-models`. A recently viewed invitation or a same-stage follow-up already copied SHALL use a de-emphasized action treatment without making the action unavailable. Declined invitations and invitations with no currently eligible follow-up SHALL show no contextual follow-up action, for owner and collaborator alike.

#### Scenario: Pending unopened invitation has a first-touch action
- **WHEN** the owner views a pending invitation whose personalized link has never been viewed
- **THEN** its card offers `Copiar invitación` and identifies that the invitation has not been opened

#### Scenario: Pending viewed invitation has an RSVP action
- **WHEN** the owner views a pending invitation with a recorded latest view
- **THEN** its card offers an RSVP-reminder copy action and shows the latest view in human-readable form

#### Scenario: Confirmed guest has an approaching-event action
- **WHEN** the owner views a confirmed invitation while the event is within an eligible reminder stage
- **THEN** its card offers the corresponding event-reminder copy action

#### Scenario: Recent view de-emphasizes the action
- **WHEN** an eligible invitation was viewed within the preceding 48 hours
- **THEN** the card reports the recent view and renders the copy action with lower visual emphasis
- **AND** the action remains operable

#### Scenario: Desktop and mobile use the same recommendation
- **WHEN** the owner opens the same invitation at desktop and mobile widths
- **THEN** both presentations derive the same label, message kind, and indicator from the same invitation and event state

#### Scenario: Copy succeeds from an invite card
- **WHEN** the owner activates a contextual copy control and the clipboard write succeeds
- **THEN** the control reports success and the invite card reflects that the follow-up was copied

#### Scenario: Declined guest has no reminder action
- **WHEN** an invitation's primary RSVP status is declined
- **THEN** its card retains the declined status treatment and offers no contextual follow-up action

#### Scenario: Collaborator sees no owner follow-up state
- **WHEN** a non-owner collaborator with wishlist access opens Invitados
- **THEN** eligible invitation rows or cards offer the same contextual follow-up control, recommendation, and indicator text the owner would see
- **AND** the control is available at desktop and mobile widths

#### Scenario: Collaborator copy succeeds from an invite card
- **WHEN** a collaborator activates a contextual copy control and the clipboard write succeeds
- **THEN** the control reports success and the invite card reflects that the follow-up was copied

#### Scenario: Collaborator does not see exact view analytics
- **WHEN** a collaborator with wishlist access opens Invitados
- **THEN** invitation rows or cards show no exact view count and no exact last-viewed timestamp
