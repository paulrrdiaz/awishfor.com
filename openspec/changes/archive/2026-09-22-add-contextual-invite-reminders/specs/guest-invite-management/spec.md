## ADDED Requirements

### Requirement: Contextual follow-up controls in Invitados

The owner-facing Invitados view SHALL present at most one contextual follow-up control on each eligible invitation row or card. The control SHALL use the recommendation defined by `contextual-invite-reminders`, SHALL be available at desktop and mobile widths, and SHALL copy the generated message directly without requiring the host to open WhatsApp or navigate to a separate share screen. Existing personalized-URL copy access SHALL remain available independently.

Each owner-visible invitation SHALL retain its RSVP badge and view count and SHALL add a concise, human-readable view/recommendation indicator. A recently viewed invitation or a same-stage follow-up already copied SHALL use a de-emphasized action treatment without making the action unavailable. Declined invitations and invitations with no currently eligible follow-up SHALL show no contextual follow-up action. Collaborators SHALL NOT receive the follow-up control or its copy metadata.

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
- **WHEN** a collaborator with wishlist access opens Invitados
- **THEN** contextual follow-up controls, recommendations, and copy metadata are absent

