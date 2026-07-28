## ADDED Requirements

### Requirement: Finder is available from the public not-found page

The guest list-finder SHALL be offered on the public not-found page at every breakpoint, so a guest who followed a broken or mistyped link can recover without first navigating to the landing page.

#### Scenario: Finder renders on the public not-found page

- **WHEN** the public not-found page renders
- **THEN** it presents the guest list-finder with the prompt `¿Buscas la lista de alguien?`

#### Scenario: Finder is present on small viewports

- **WHEN** the public not-found page renders below the `md` breakpoint
- **THEN** the guest list-finder is still present and usable

#### Scenario: Finder on the not-found page resolves identically

- **WHEN** a guest submits a link or bare slug from the public not-found page
- **THEN** the finder resolves and navigates using the same rules as the landing-page finder

### Requirement: Finder resolution behavior is shared across surfaces

The guest list-finder's input validation, slug extraction, navigation, and unrecognized-input feedback SHALL be defined once and reused by every surface that offers the finder, so the surfaces cannot diverge.

#### Scenario: Validation bounds match across surfaces

- **WHEN** a guest submits input on any surface offering the finder
- **THEN** the same minimum and maximum input-length rules apply

#### Scenario: Unrecognized input feedback matches across surfaces

- **WHEN** a guest submits input that resolves to no slug on any surface offering the finder
- **THEN** the finder does not navigate
- **AND** it shows the same Spanish unrecognized-input message

#### Scenario: Presentation may differ per surface

- **WHEN** the finder renders on the landing page and on the public not-found page
- **THEN** each may style its input and submit control with its own theme tokens
- **AND** the resolution behavior remains identical
