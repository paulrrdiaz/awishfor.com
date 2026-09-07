## ADDED Requirements

### Requirement: Declined RSVP status treatment

The design system SHALL define a dedicated declined-status surface token and foreground token and SHALL expose a declined badge variant that consumes them. The treatment SHALL use a muted red family appropriate for a negative attendance response, SHALL remain legible in light and dark themes, and SHALL be visually distinct from confirmed, pending, archived, and destructive-action treatments. RSVP indicators with status `declined` SHALL use this variant instead of the archived variant.

#### Scenario: Declined RSVP is visually meaningful
- **WHEN** a declined RSVP badge renders beside a guest name
- **THEN** it uses the declined-status surface and foreground tokens
- **AND** it is distinguishable from the neutral pending and archived treatments

#### Scenario: Declined status does not change destructive actions
- **WHEN** the declined badge variant is introduced
- **THEN** destructive buttons, alerts, and menu items retain their existing destructive treatment

#### Scenario: Existing status badges remain stable
- **WHEN** published, draft, archived, confirmed, or pending badges render
- **THEN** their existing semantic treatments remain unchanged
