## ADDED Requirements

### Requirement: Event details section cards

The public wishlist page SHALL render an event-details section composed of up to three cards — Fecha (event date/time), Lugar (event location), and Código de vestimenta (dress code). Each card SHALL render only when its backing data is present; cards with empty data SHALL be omitted, and the whole section SHALL be omitted when all three are empty.

#### Scenario: All three cards render when data present

- **WHEN** a wishlist has an event date, an event location, and a dress code
- **THEN** the event-details section renders Fecha, Lugar, and Código de vestimenta cards

#### Scenario: Empty cards are hidden

- **WHEN** a wishlist has an event date but no event location and no dress code
- **THEN** only the Fecha card renders and the Lugar and Código de vestimenta cards are omitted

#### Scenario: Section omitted when no event details

- **WHEN** a wishlist has no event date, no event location, and no dress code
- **THEN** the event-details section is not rendered

### Requirement: Purchased gift de-emphasis and ordering

The public wishlist SHALL visually de-emphasize fully purchased gifts by rendering them at approximately 60% opacity with a line-through on the gift name, and SHALL sort purchased gifts below gifts that still have remaining units within the default order.

#### Scenario: Purchased gift is de-emphasized

- **WHEN** a gift's public status is `purchased`
- **THEN** its card renders at ~60% opacity with the gift name struck through

#### Scenario: Purchased gifts sort below available gifts

- **WHEN** the gift list renders in the default recommended order
- **THEN** fully purchased gifts appear after gifts that still have remaining units

## MODIFIED Requirements

### Requirement: Countdown formatting

The system SHALL format the countdown from an event date into guest-facing copy: `Faltan N días` for more than one day remaining, `Falta 1 día` for exactly one day, `Es hoy` for the event day, and the post-event message `Gracias por celebrar con nosotros.` for past events. The countdown SHALL recompute client-side and flip to the post-event message at T-0.

#### Scenario: Future event shows day count

- **WHEN** an event date is 44 days in the future
- **THEN** the countdown shows `Faltan 44 días`

#### Scenario: One day remaining is singular

- **WHEN** an event date is exactly one day away
- **THEN** the countdown shows `Falta 1 día`

#### Scenario: Event day shows today copy

- **WHEN** the event date is the current day
- **THEN** the countdown shows `Es hoy`

#### Scenario: Past event shows post-event message

- **WHEN** the event date has passed
- **THEN** the countdown shows `Gracias por celebrar con nosotros.` rather than a negative day count
