## MODIFIED Requirements

### Requirement: Theme presets selectable by id

The system SHALL provide seven hardcoded public theme presets, each addressable by a stable id, and SHALL resolve a wishlist's `themeId` to its preset. The presets are `dulce-rosa`, `cielo-suave` (default), `cielo-suave-rosa`, `jardin-verde`, `crema-elegante`, `lavanda-fiesta`, and `clasico-minimal`.

#### Scenario: Theme id resolves to its preset

- **WHEN** a wishlist has a `themeId` matching a defined preset
- **THEN** the public page resolves and applies that theme preset

#### Scenario: Missing or unknown theme id falls back

- **WHEN** a wishlist's `themeId` is null or does not match any preset
- **THEN** the resolver returns the default theme preset rather than failing

#### Scenario: Niña variant is available as a matching set

- **WHEN** a wishlist uses `themeId` `cielo-suave-rosa`
- **THEN** the public page applies the rose-on-blush niña variant that shares the `cielo-suave` family's ivory accent

### Requirement: Theme styling is scoped to public pages

The system SHALL expose theme styling through a `PublicThemeProvider` that writes a preset's CSS variables as inline styles onto a single `.public-theme` wrapper carrying a `data-theme` attribute, applying a `--radius: 18px` public override, so that selecting a public theme does not affect the dashboard.

#### Scenario: Provider scopes variables to the wrapper

- **WHEN** the `PublicThemeProvider` mounts for a resolved theme
- **THEN** the preset's CSS variables and `--radius: 18px` are applied only to the `.public-theme` wrapper, which carries the matching `data-theme`

#### Scenario: Public theme does not alter the dashboard

- **WHEN** a public page applies a theme preset's CSS variables
- **THEN** the variables are scoped to the public page wrapper and the dashboard `:root` theme is unchanged

#### Scenario: Semantic utilities resolve per theme

- **WHEN** a descendant of the `.public-theme` wrapper uses a semantic utility such as `bg-background` or `text-foreground`
- **THEN** it resolves to the active theme's value through Tailwind v4 `@theme inline`, with no per-theme class names
