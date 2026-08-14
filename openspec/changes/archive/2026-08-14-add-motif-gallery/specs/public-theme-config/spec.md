## MODIFIED Requirements

### Requirement: Theme styling is scoped to public pages

The system SHALL expose theme styling through a `PublicThemeProvider` that writes a preset's CSS variables as inline styles onto a single `.public-theme` wrapper carrying a `data-theme` attribute, applying a `--radius: 18px` public override, and SHALL additionally write the resolved heading/body font variables (`--public-font-heading`, `--public-font-body`), button-style variables, and — when the wishlist has a motif selected — the resolved motif variables (`--m1`, `--m2`, `--m3`, and `--mc1` when the motif declares it) together with `data-motif` and `data-motif-treatment` attributes, so that selecting a public theme does not affect the dashboard.

When no motif is selected the provider SHALL write no motif variables and SHALL omit the motif attributes.

#### Scenario: Provider scopes variables to the wrapper

- **WHEN** the `PublicThemeProvider` mounts for a resolved theme
- **THEN** the preset's CSS variables, `--radius: 18px`, and the font/button variables are applied only to the `.public-theme` wrapper, which carries the matching `data-theme`

#### Scenario: Public theme does not alter the dashboard

- **WHEN** a public page applies a theme preset's CSS variables
- **THEN** the variables are scoped to the public page wrapper and the dashboard `:root` theme is unchanged

#### Scenario: Semantic utilities resolve per theme

- **WHEN** a descendant of the `.public-theme` wrapper uses a semantic utility such as `bg-background` or `text-foreground`
- **THEN** it resolves to the active theme's value through Tailwind v4 `@theme inline`, with no per-theme class names

#### Scenario: Motif variables join the theme scope

- **WHEN** the provider mounts for a wishlist with a selected motif
- **THEN** the `.public-theme` wrapper additionally carries the resolved `--m1`, `--m2` and `--m3` values and the matching `data-motif` and `data-motif-treatment` attributes

#### Scenario: Themed motif palette resolves through the same wrapper

- **WHEN** a wishlist stores the `themed` motif palette
- **THEN** the wrapper assigns `--m1`, `--m2` and `--m3` from `--primary`, `--accent` and `--foreground`, resolved in the same element that defines those theme tokens

#### Scenario: No motif leaves the wrapper unchanged

- **WHEN** the provider mounts for a wishlist with no motif selected
- **THEN** the wrapper carries no motif variables and no `data-motif` attribute
