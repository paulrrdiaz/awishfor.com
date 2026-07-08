# event-datetime-picker Specification

## Purpose
Defines the shared `DateTimePicker` component that lets users pick a combined date and time through a single trigger and popover, used across the creation wizard and dashboard settings.

## Requirements

### Requirement: Combined date and time selection

The system SHALL provide a `DateTimePicker` component that lets the user select a date and a time through a single trigger control. Activating the trigger SHALL open a Radix `Popover` containing the shadcn `Calendar` for date selection and a time input for time selection. The trigger SHALL display the formatted date and time once a date is selected, and a placeholder label when no date is selected.

#### Scenario: Selecting a date and time updates the trigger label

- **WHEN** the user opens the picker, selects a day on the calendar, and enters a time
- **THEN** the trigger button displays the formatted date and time
- **AND** the underlying date and time values are reported to the consumer via `onChange`

#### Scenario: No date selected shows a placeholder

- **WHEN** the picker has no selected date
- **THEN** the trigger button shows the placeholder label instead of a formatted date

### Requirement: Optional field with clear affordance

The `DateTimePicker` SHALL support an optional mode where the field may be left empty, and SHALL expose a way to clear a previously selected date and time back to empty.

#### Scenario: Clearing an optional field

- **WHEN** the user has selected a date/time and then clears the field
- **THEN** the trigger returns to the placeholder state
- **AND** the consumer receives `null` for both date and time

### Requirement: Time input independent of date selection

The `DateTimePicker` SHALL allow setting a time only after a date is selected, defaulting to the existing time (or an empty/00:00 default) when the calendar selection changes, and SHALL normalize the time value to `HH:mm`.

#### Scenario: Changing the date preserves an already-set time

- **WHEN** the user has already set a time and then picks a different day on the calendar
- **THEN** the previously entered time is preserved and only the date portion changes
