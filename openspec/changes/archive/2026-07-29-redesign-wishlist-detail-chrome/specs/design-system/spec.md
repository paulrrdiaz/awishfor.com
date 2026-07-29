## ADDED Requirements

### Requirement: Status color tokens

The system SHALL define app-theme status color tokens in `src/styles/globals.css` for the published, draft, and archived states — each a surface value and a foreground value — and SHALL expose them through the existing Tailwind v4 `@theme inline` mapping. Components conveying wishlist, gift, or RSVP status SHALL consume these tokens rather than inline hex values.

#### Scenario: Tokens are defined and mapped

- **WHEN** the stylesheet loads
- **THEN** surface and foreground tokens exist for the published, draft, and archived states and are reachable as Tailwind color utilities

#### Scenario: Status surfaces stop using inline hex

- **WHEN** a component renders a wishlist, gift, or RSVP status indicator
- **THEN** its colors resolve from the status tokens, and no inline hex literal is used for them

#### Scenario: Draft and archived stay distinguishable

- **WHEN** a draft indicator and an archived indicator render together
- **THEN** they are visually distinct from each other

### Requirement: Badge status variants

The `Badge` component SHALL provide variants for the published, draft, and archived states that resolve their colors from the status tokens. Existing badge variants SHALL keep their current rendering so that surfaces outside this change are unaffected.

#### Scenario: Status variant renders from tokens

- **WHEN** a badge is rendered with a status variant
- **THEN** its background and text colors resolve from the matching status tokens

#### Scenario: Existing variants are unchanged

- **WHEN** a badge is rendered with a variant that existed before this change
- **THEN** its rendered appearance is identical to before

### Requirement: Monospace token resolves to the loaded typeface

The monospace design token SHALL resolve to the typeface loaded by the application's font pipeline rather than to a family name the pipeline does not expose, so that monospace surfaces render in the intended face.

#### Scenario: Monospace utilities use the loaded face

- **WHEN** an element using the monospace token renders
- **THEN** it is displayed in the application's loaded monospace typeface, not the generic system fallback
