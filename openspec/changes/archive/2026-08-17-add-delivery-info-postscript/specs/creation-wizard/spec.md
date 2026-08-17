## MODIFIED Requirements

### Requirement: Event Details step

The Event Details step SHALL let the user edit the draft's name (`title`), an optional combined event date and time, an optional RSVP deadline date, optional event location, and optional dress code ("Código de vestimenta"). There SHALL be a single name field: the value identifies the wishlist in the owner's dashboard and is the heading guests see, so no separate display name is collected. The event date and time SHALL be chosen through a single `DateTimePicker` field (a calendar in a popover plus a time input), with the time normalized to `HH:mm`. The RSVP deadline SHALL be presented adjacent to the event date and time field, SHALL be optional, and SHALL NOT be accepted when it falls after the selected event date. Name, date, time, RSVP deadline, location, and dress code SHALL all persist to the draft store (`eventDate` and `eventTime` remain separate draft fields). When the selected event date is in the past, the step SHALL show the exact warning copy "Esta fecha ya pasó. Puedes continuar, pero el contador mostrará un mensaje de cierre." without blocking.

The welcome message SHALL be required. The step SHALL surface a visible validation error when the welcome message is empty and SHALL NOT advance past the step until it holds a value. Because selecting an event type seeds the field with that event type's preset copy, this error is reached only when the user deliberately clears it.

The step SHALL NOT collect delivery details; those are edited only in wishlist settings.

#### Scenario: Editing details persists to the draft

- **WHEN** the user enters a name, picks an event date and time in the combined picker, types a location, and types a dress code
- **THEN** the draft store holds the name as `title`, the selected date, the time normalized to `HH:mm`, the location, and the dress code

#### Scenario: RSVP deadline persists to the draft

- **WHEN** the user picks an RSVP deadline date
- **THEN** the draft store holds that deadline and it is carried through to the published wishlist

#### Scenario: RSVP deadline after the event date is rejected

- **WHEN** the user picks an RSVP deadline later than the selected event date
- **THEN** the step surfaces a validation error and the deadline is not accepted

#### Scenario: One name field only

- **WHEN** the Event Details step renders
- **THEN** it shows a single name field and no display-name or hero-title field

#### Scenario: The name is described as guest-facing

- **WHEN** the name field renders its help text
- **THEN** the text states that this is both how the creator identifies the list and how guests see it, rather than describing it as internal-only

#### Scenario: Event date, time, location, and dress code are optional

- **WHEN** the user leaves the combined date/time field, the RSVP deadline, location, and dress code empty
- **THEN** the step is still valid and the draft stores null/empty for those fields

#### Scenario: Past event date warns without blocking

- **WHEN** the user selects an event date in the past through the combined picker
- **THEN** the step shows "Esta fecha ya pasó. Puedes continuar, pero el contador mostrará un mensaje de cierre." and the date is still accepted

#### Scenario: Cleared welcome message blocks the step

- **WHEN** the user clears the welcome message and tries to advance
- **THEN** the step shows a validation error on the welcome message field and does not advance

#### Scenario: Preset copy keeps the field valid by default

- **WHEN** the user selects an event type and does not touch the welcome message
- **THEN** the field holds that event type's preset copy and the step is valid

#### Scenario: No delivery fields in the wizard

- **WHEN** the Event Details step renders
- **THEN** it shows no delivery recipient, address, or phone field
