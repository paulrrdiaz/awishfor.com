## ADDED Requirements

### Requirement: Seating pass placement by viewport

When the seating pass (see `guest-seating-pass`) is visible, below the `lg` breakpoint every public layout SHALL render it directly below its hero image area and before the welcome message ("Para ti"), so it appears in the first screens; the RSVP section SHALL keep its existing position and behavior. At the `lg` breakpoint and above, the seating pass SHALL be rendered in the RSVP section's position (immediately before the gift list) and the RSVP section SHALL be hidden. When the pass is not visible, the RSVP section SHALL render exactly as without this capability at every viewport.

#### Scenario: Mobile shows the pass beside the hero

- **WHEN** a personalized page with a visible seating pass renders below the `lg` breakpoint
- **THEN** the pass appears directly below the hero, before the welcome message, and the RSVP section is still shown before the gift list

#### Scenario: Desktop shows only the pass in the RSVP position

- **WHEN** the same page renders at the `lg` breakpoint or wider
- **THEN** the seating pass appears where the RSVP section normally sits and the RSVP section is hidden

#### Scenario: No pass, no change

- **WHEN** the seating pass is not visible
- **THEN** the RSVP section renders in its usual position at every viewport
