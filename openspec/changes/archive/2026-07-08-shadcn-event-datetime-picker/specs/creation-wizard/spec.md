## MODIFIED Requirements

### Requirement: Event Details step

The Event Details step SHALL let the user edit the draft's title, display name, an optional combined event date and time, optional event location, and optional dress code ("Código de vestimenta"). The event date and time SHALL be chosen through a single `DateTimePicker` field (a calendar in a popover plus a time input), with the time normalized to `HH:mm`. Title, date, time, location, and dress code SHALL all persist to the draft store as before (`eventDate` and `eventTime` remain separate draft fields). When the selected event date is in the past, the step SHALL show the exact warning copy "Esta fecha ya pasó. Puedes continuar, pero el contador mostrará un mensaje de cierre." without blocking.

#### Scenario: Editing details persists to the draft

- **WHEN** the user enters a title, picks an event date and time in the combined picker, types a location, and types a dress code
- **THEN** the draft store holds the title, the selected date, the time normalized to `HH:mm`, the location, and the dress code

#### Scenario: Event date, time, location, and dress code are optional

- **WHEN** the user leaves the combined date/time field, location, and dress code empty
- **THEN** the step is still valid and the draft stores null/empty for those fields

#### Scenario: Past event date warns without blocking

- **WHEN** the user selects an event date in the past through the combined picker
- **THEN** the step shows "Esta fecha ya pasó. Puedes continuar, pero el contador mostrará un mensaje de cierre." and the date is still accepted
