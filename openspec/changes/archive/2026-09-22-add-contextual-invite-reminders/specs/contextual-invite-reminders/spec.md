## Purpose

Defines privacy-friendly, WhatsApp-ready follow-up recommendations and copy for personalized invitations based on RSVP state, view recency, and event proximity.

## ADDED Requirements

### Requirement: Contextual follow-up state

The system SHALL derive at most one recommended follow-up for an invitation from the primary guest's RSVP status, whether and when the personalized link was last viewed, the RSVP deadline, the event calendar date, and the current time. A pending invitation that has never been viewed SHALL recommend a first-touch invitation; a pending invitation that has been viewed SHALL recommend an RSVP reminder. A confirmed invitation SHALL recommend an event reminder only when the event is 1 through 14 calendar days away. A declined invitation, an invitation for a past or same-day event, and a confirmed invitation without an event date SHALL NOT recommend a follow-up.

Confirmed-event reminders SHALL have three stages: a friendly heads-up 8 through 14 calendar days before the event, a practical reminder 2 through 7 calendar days before the event, and a tomorrow reminder 1 calendar day before the event. Event-day calculations SHALL preserve the stored event calendar date rather than shifting it through the viewer's local timezone.

#### Scenario: Pending personalized link was never viewed
- **WHEN** a pending invitation has no recorded personalized-link view
- **THEN** its recommended follow-up is a first-touch invitation

#### Scenario: Pending personalized link was viewed
- **WHEN** a pending invitation has a latest recorded view time
- **THEN** its recommended follow-up is an RSVP reminder

#### Scenario: Confirmed guest reaches the fourteen-day stage
- **WHEN** a confirmed invitation's event is between 8 and 14 calendar days away
- **THEN** its recommended follow-up is the friendly event heads-up stage

#### Scenario: Confirmed guest reaches the seven-day stage
- **WHEN** a confirmed invitation's event is between 2 and 7 calendar days away
- **THEN** its recommended follow-up is the practical event-reminder stage

#### Scenario: Confirmed guest reaches the tomorrow stage
- **WHEN** a confirmed invitation's event is 1 calendar day away
- **THEN** its recommended follow-up is the tomorrow event-reminder stage

#### Scenario: Confirmed event is not yet near
- **WHEN** a confirmed invitation's event is more than 14 calendar days away
- **THEN** no event follow-up is recommended

#### Scenario: Reminder is inappropriate
- **WHEN** an invitation is declined, its event has passed or is today, or it is confirmed without an event date
- **THEN** no follow-up is recommended

### Requirement: View-recency guidance

The system SHALL classify an invite's last view as never viewed, recent when it occurred within the preceding 48 hours, intermediate when it occurred more than 48 hours and no more than 14 days ago, or stale when it occurred more than 14 days ago. The recommendation presentation SHALL identify a never-viewed or stale link as more in need of follow-up and SHALL de-emphasize a recommendation after a recent view. A recent view SHALL NOT disable or remove an otherwise eligible copy action.

#### Scenario: Recently viewed invitation remains actionable
- **WHEN** an otherwise eligible invitation was viewed within the preceding 48 hours
- **THEN** its indicator says that the details were viewed recently
- **AND** its follow-up copy action remains available in a de-emphasized treatment

#### Scenario: Stale confirmed invitation is highlighted
- **WHEN** a confirmed invitation is in an event-reminder stage and its latest view was more than 14 days ago
- **THEN** its indicator recommends reminding that guest

#### Scenario: Invitation has no view record
- **WHEN** an eligible invitation has never recorded a view
- **THEN** its indicator explicitly says that no view has been recorded

### Requirement: Friendly adaptive message copy

The system SHALL generate a friendly message addressed to the primary guest and containing that guest's personalized invitation URL. A first-touch message SHALL present the invitation without suggesting that it was previously sent. An RSVP reminder SHALL ask the guest to confirm without revealing that link views are tracked. When the RSVP deadline has passed but the event has not, the RSVP reminder SHALL ask the guest to reply directly to the host and SHALL NOT claim that the expired personalized page can accept the response.

An event reminder SHALL match its 14-day, 7-day, or 1-day stage and SHALL include the event date plus the configured event time, location, and personalized URL when available. Missing optional details SHALL be omitted without leaving broken punctuation or placeholder text. No generated message SHALL state or imply that the host can see when the guest opened the invitation.

#### Scenario: First-touch invitation is copied for an unopened link
- **WHEN** the host requests copy for a pending invitation that has never been viewed
- **THEN** the message greets the guest, presents the invitation as a first touch, and includes the personalized URL

#### Scenario: Viewed pending guest receives a private reminder
- **WHEN** the host requests copy for a pending invitation that has been viewed
- **THEN** the message asks for an RSVP and does not mention view tracking or the last-view time

#### Scenario: RSVP deadline has passed
- **WHEN** the host requests copy for a pending invitation after its RSVP deadline but before the event
- **THEN** the message asks the guest to respond directly to the host and uses the personalized URL only for event details

#### Scenario: Event reminder includes available logistics
- **WHEN** the host copies an event reminder for a confirmed guest and date, time, and location are configured
- **THEN** the copied message contains all three details and the personalized URL

#### Scenario: Optional logistics are missing
- **WHEN** an event reminder is generated without a configured time or location
- **THEN** the message omits those details cleanly and still includes the event date and personalized URL

### Requirement: Clipboard copy recording

The system SHALL copy the derived message to the clipboard and SHALL record the successful follow-up's kind and copy time against the invitation only after the clipboard write succeeds. The interface SHALL describe this state as copied, never sent or delivered. A failed clipboard write SHALL show retryable failure feedback and SHALL NOT update follow-up metadata. Only the wishlist owner SHALL be allowed to record follow-up copy metadata.

Previously copied metadata SHALL de-emphasize repeated copies within the same follow-up stage, while progression to a later event-reminder stage SHALL create a new recommendation. Copy metadata SHALL NOT suppress an action that the host chooses to repeat.

#### Scenario: Successful copy is recorded accurately
- **WHEN** the owner's clipboard write succeeds for a contextual follow-up
- **THEN** the invitation records that follow-up kind and the current copy time
- **AND** the interface reports that the reminder was copied

#### Scenario: Clipboard write fails
- **WHEN** the clipboard rejects a contextual follow-up write
- **THEN** the interface explains that the message could not be copied and offers retry
- **AND** the invitation's follow-up metadata remains unchanged

#### Scenario: Later event stage becomes eligible
- **WHEN** a 14-day event heads-up was previously copied and the event later enters the 7-day stage
- **THEN** the practical event reminder is recommended as a new stage

#### Scenario: Collaborator attempts to record a copy
- **WHEN** a non-owner collaborator attempts to record follow-up copy metadata
- **THEN** the operation is rejected and the invitation remains unchanged

### Requirement: Event-proximity indicator

The Invitados view SHALL show one event-level proximity indicator when a future event is within 14 calendar days, is today, or has passed. It SHALL distinguish the 14-day, 7-day, tomorrow, today, and past-event states in plain language and SHALL omit itself when no event date is configured or a future event is more than 14 calendar days away. Per-invite cards SHALL use the shared event state rather than repeating the full event countdown as a competing primary signal.

#### Scenario: Event enters reminder window
- **WHEN** the event is 8 calendar days away
- **THEN** the Invitados view shows that 8 days remain

#### Scenario: Event is tomorrow
- **WHEN** the event is 1 calendar day away
- **THEN** the Invitados view clearly says that the event is tomorrow

#### Scenario: Event is today
- **WHEN** the stored event calendar date is today
- **THEN** the Invitados view clearly says that the event is today

#### Scenario: Event date is absent
- **WHEN** the wishlist has no event date
- **THEN** no event-proximity indicator is shown
