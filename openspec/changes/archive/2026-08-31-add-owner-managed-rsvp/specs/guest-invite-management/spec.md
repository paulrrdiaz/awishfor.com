## MODIFIED Requirements

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

## ADDED Requirements

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
