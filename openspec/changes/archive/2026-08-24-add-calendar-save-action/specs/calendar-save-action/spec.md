## Purpose

Lets confirmed invitees save an event to the calendar application that best fits their device, without manually recreating the invitation details.

## ADDED Requirements

### Requirement: Confirmed guests can access calendar-save actions
The system SHALL present a compact, fixed bottom-right calendar-save control on a personalized invite page only when the primary guest's RSVP status is `confirmed` and the wishlist has an event date. The control SHALL remain available when that confirmed guest revisits the page, SHALL not be shown to pending or declined guests, and SHALL not be shown when the event date is absent.

#### Scenario: Confirmed guest with an event date sees the action
- **WHEN** a confirmed guest opens their personalized invite page for a wishlist with an event date
- **THEN** the page displays the calendar-save control

#### Scenario: Pending or declined guest does not see the action
- **WHEN** a pending or declined guest opens their personalized invite page
- **THEN** the page does not display the calendar-save control

#### Scenario: Confirmed guest without an event date does not see the action
- **WHEN** a confirmed guest opens their personalized invite page for a wishlist without an event date
- **THEN** the page does not display the calendar-save control

#### Scenario: Changed RSVP removes the action
- **WHEN** a previously confirmed guest changes their RSVP to declined and the page refreshes
- **THEN** the calendar-save control is no longer displayed

### Requirement: Calendar actions preserve event details
The calendar-save control SHALL offer a Google Calendar action and a downloadable iCalendar (`.ics`) action. The iCalendar action SHALL describe its compatibility with Apple Calendar, Outlook, and other calendar apps rather than a single device brand. Each action SHALL represent the wishlist title followed by the host name when available, event date, optional start and end times, optional location, welcome message, and the guest's personalized invite URL. Timed events SHALL use the `America/Lima` timezone; when a timed event has no end time, each action SHALL use a one-hour editable event duration. Events without a start time SHALL be represented as all-day events. The iCalendar download SHALL include display reminders one week, one day, and three hours before the event. Google Calendar template links use the invitee's calendar defaults because they cannot configure per-event reminders without a connected Google account.

#### Scenario: Timed event is saved in Lima time
- **WHEN** a wishlist has an event date and start time
- **THEN** both calendar actions represent the event at that date and time in `America/Lima`

#### Scenario: End time is included when present
- **WHEN** a wishlist has an event date, start time, and end time
- **THEN** both calendar actions include the supplied end time

#### Scenario: Timed event without an end time gets a compatible duration
- **WHEN** a wishlist has an event date and start time but no end time
- **THEN** both calendar actions represent an editable event lasting one hour

#### Scenario: Date-only event is saved as all-day
- **WHEN** a wishlist has an event date but no start time
- **THEN** both calendar actions represent an all-day event on that calendar date

#### Scenario: Optional location is carried to the calendar
- **WHEN** a wishlist has an event location
- **THEN** both calendar actions include that location in the calendar event

#### Scenario: Calendar description carries the invitation context
- **WHEN** a guest saves an event with a welcome message
- **THEN** both actions include the welcome message followed by the personalized invitation URL in the event details

#### Scenario: iCalendar download has portable reminders
- **WHEN** a guest downloads the iCalendar file
- **THEN** the event contains display reminders one week, one day, and three hours before its start

### Requirement: Calendar-save control inherits the public theme
The calendar-save control SHALL be delivered as a reusable shared public component and SHALL derive its surfaces, borders, text, icons, focus treatment, and interactive states from the active public theme tokens. It SHALL not introduce fixed color values that prevent it from inheriting the configured layout theme.

#### Scenario: Component repaints under another public theme
- **WHEN** the same confirmed personalized invitation is rendered under two different public themes
- **THEN** the calendar-save control adopts each theme's token-based palette without a component-specific color override

#### Scenario: Fixed placement remains usable on mobile
- **WHEN** a confirmed guest opens the personalized invite page on a mobile viewport
- **THEN** the fixed control remains reachable without obscuring primary page actions or the device safe area

#### Scenario: Menu closes after an outside interaction
- **WHEN** a guest opens the calendar-save actions and interacts outside the control
- **THEN** the action menu closes
