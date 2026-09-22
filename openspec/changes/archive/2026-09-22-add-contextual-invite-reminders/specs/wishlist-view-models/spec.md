## ADDED Requirements

### Requirement: Owner dashboard invite exposes follow-up metadata

An owner-facing dashboard invite view model SHALL include the latest successfully copied follow-up kind and an ISO 8601 copy time or null values when none has been copied. These fields SHALL be absent from non-owner collaborator and public view models. The owner-facing Invitados page SHALL receive the wishlist's event date, event time, event location, and RSVP deadline needed to derive contextual follow-ups, serialized consistently with the existing dashboard wishlist fields.

#### Scenario: Owner invite includes copied follow-up state
- **WHEN** an owner lists an invitation with recorded follow-up metadata
- **THEN** its dashboard invite view model includes the stored follow-up kind and ISO 8601 copy time

#### Scenario: Owner invite has no copied follow-up
- **WHEN** an owner lists an invitation that has never had a contextual follow-up copied
- **THEN** its dashboard invite view model contains null follow-up kind and copy time values

#### Scenario: Collaborator view omits follow-up metadata
- **WHEN** a non-owner collaborator retrieves dashboard invitation data
- **THEN** the follow-up kind and copy time fields are omitted

#### Scenario: Public invite omits follow-up metadata
- **WHEN** a guest opens a personalized public invitation
- **THEN** no follow-up recommendation or copy metadata appears in the public view model

