## ADDED Requirements

### Requirement: Gift list section band

The gift list section SHALL render as a full-bleed horizontal band spanning the viewport width, painted with the active theme's card surface color and separated from the section above it by a single top border in the theme's border color. The band SHALL have square corners and no side or bottom border. The section's content SHALL remain inside the layout's existing constrained content column, centered within the band.

#### Scenario: Gift list renders as a full-width card band

- **WHEN** a public wishlist page renders its gift list section
- **THEN** the section's background spans the full viewport width in the theme's card color, with a top border and square corners, and no side or bottom border

#### Scenario: Content stays in the constrained column

- **WHEN** the gift list band renders on a viewport wider than the layout's content column
- **THEN** the gift list content stays within that content column, centered inside the full-width band

#### Scenario: Band applies to every layout

- **WHEN** a public wishlist renders in any configured layout, including the layouts that compose their own page rather than sharing the common body
- **THEN** the gift list section uses the same full-bleed card band treatment

#### Scenario: Band follows the selected theme

- **WHEN** the same wishlist renders under two different public themes
- **THEN** the band's background and top border take their colors from each theme's card and border tokens

## MODIFIED Requirements

### Requirement: Required section order

The system SHALL render the public page sections in this order: hero, event details, countdown, welcome message, RSVP, gift list, thank-you message, footer. The RSVP section SHALL be present only on a personalized render (one carrying guest context) and SHALL be absent otherwise. Sections whose backing data is absent SHALL be omitted, preserving the relative order of the remaining sections. How-it-works guidance SHALL be drawer content opened from the hero and SHALL NOT occupy an inline position in the document section order.

#### Scenario: All inline sections render in order

- **WHEN** a wishlist has hero, event details, event date, welcome message, gifts, and a thank-you message
- **THEN** the inline sections appear in the required order from hero through footer without a how-it-works section between gifts and thank-you content

#### Scenario: Personalized render places RSVP directly before the gift list

- **WHEN** a wishlist renders with guest context
- **THEN** the RSVP section appears after the welcome message and immediately before the gift list section

#### Scenario: Plain render omits the RSVP section

- **WHEN** a wishlist renders without guest context
- **THEN** no RSVP section is rendered and the remaining sections keep their order

#### Scenario: Optional sections omitted when data absent

- **WHEN** a wishlist has no event date and no welcome message
- **THEN** the countdown and welcome-message sections are omitted and the remaining sections keep their order

#### Scenario: How it works respects its toggle

- **WHEN** a wishlist has `showHowItWorks` set to false
- **THEN** neither the “Cómo funciona” hero control nor how-it-works drawer content is rendered
