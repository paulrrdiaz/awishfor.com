## MODIFIED Requirements

### Requirement: Event date formatting respects locale

`formatEventDate` SHALL format a date (Date or ISO string) into a human-readable event date in the given locale, prefixed with the capitalized day-of-week name for that date, and SHALL preserve the calendar day regardless of the viewer's local timezone.

#### Scenario: Spanish event date

- **WHEN** `formatEventDate` is called with a date and locale `es`
- **THEN** the output is a Spanish-language formatted date beginning with the capitalized Spanish weekday name (e.g. `Sábado, 26 de septiembre de 2026`)

#### Scenario: English event date

- **WHEN** `formatEventDate` is called with a date and locale `en`
- **THEN** the output is an English-language formatted date beginning with the capitalized English weekday name (e.g. `Saturday, December 25, 2026`)

#### Scenario: Weekday name does not shift with viewer timezone

- **WHEN** `formatEventDate` is called with a UTC-midnight date and the viewer's local timezone is behind UTC
- **THEN** the weekday name and calendar date both reflect the stored calendar day, not a day shifted backward by local time conversion
