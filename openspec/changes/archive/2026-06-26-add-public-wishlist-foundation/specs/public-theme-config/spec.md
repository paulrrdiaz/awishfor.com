## ADDED Requirements

### Requirement: Theme presets selectable by id

The system SHALL provide six hardcoded public theme presets, each addressable by a stable id, and SHALL resolve a wishlist's `themeId` to its preset.

#### Scenario: Theme id resolves to its preset

- **WHEN** a wishlist has a `themeId` matching a defined preset
- **THEN** the public page resolves and applies that theme preset

#### Scenario: Missing or unknown theme id falls back

- **WHEN** a wishlist's `themeId` is null or does not match any preset
- **THEN** the resolver returns the default theme preset rather than failing

### Requirement: Layout presets selectable by id

The system SHALL provide three hardcoded public layout presets, each addressable by a stable id, and SHALL resolve a wishlist's `layoutId` to its preset with a default fallback.

#### Scenario: Layout id resolves to its preset

- **WHEN** a wishlist has a `layoutId` matching a defined preset
- **THEN** the public page resolves and applies that layout preset

#### Scenario: Missing or unknown layout id falls back

- **WHEN** a wishlist's `layoutId` is null or does not match any preset
- **THEN** the resolver returns the default layout preset

### Requirement: Font pairing and button style presets

The system SHALL provide font-pairing presets wired through `next/font` and button-style presets, each selectable by id with a default fallback, and SHALL NOT include a square button style.

#### Scenario: Font pairing resolves to a next/font pairing

- **WHEN** a wishlist references a font pairing id
- **THEN** the resolver returns the matching `next/font` pairing, or the default when null or unknown

#### Scenario: Button style resolves by id

- **WHEN** a wishlist references a button style id
- **THEN** the resolver returns the matching button style preset, or the default when null or unknown

### Requirement: Theme styling is scoped to public pages

The system SHALL expose theme styling as scoped CSS variables applied only to the public wishlist page, so that selecting a public theme does not affect the dashboard.

#### Scenario: Public theme does not alter the dashboard

- **WHEN** a public page applies a theme preset's CSS variables
- **THEN** the variables are scoped to the public page wrapper and the dashboard theme is unchanged
