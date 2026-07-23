## Purpose

Define the public wishlist preset configuration for themes, layouts, fonts, button styles, and public-theme scoping.
## Requirements
### Requirement: Theme presets selectable by id

The system SHALL provide twelve hardcoded public theme presets, each addressable by a stable id, and SHALL resolve a wishlist's `themeId` to its preset. The presets are `dulce-rosa`, `cielo-suave` (default), `cielo-suave-rosa`, `jardin-verde`, `crema-elegante`, `lavanda-fiesta`, `clasico-minimal`, `terracota-calida`, `menta-fresca`, `noche-azul`, `sol-dorado`, and `coral-vivo`. The five new presets SHALL follow the established palette system: near-white tinted background, tinted ink foreground, white card, soft primary whose foreground meets ≥ 4.5:1 contrast, and a soft accent.

#### Scenario: Theme id resolves to its preset

- **WHEN** a wishlist has a `themeId` matching a defined preset
- **THEN** the public page resolves and applies that theme preset

#### Scenario: Missing or unknown theme id falls back

- **WHEN** a wishlist's `themeId` is null or does not match any preset
- **THEN** the resolver returns the default theme preset rather than failing

#### Scenario: Niña variant is available as a matching set

- **WHEN** a wishlist uses `themeId` `cielo-suave-rosa`
- **THEN** the public page applies the rose-on-blush niña variant that shares the `cielo-suave` family's ivory accent

#### Scenario: New presets meet the contrast rule

- **WHEN** any of the five new theme presets is applied
- **THEN** its foreground-on-background and primary-foreground-on-primary combinations meet at least 4.5:1 contrast

### Requirement: Layout presets selectable by id

The system SHALL provide seventeen hardcoded public layout presets (fourteen new design-exploration layouts plus the deprecated `grid`, `editorial`, and `minimal`), each addressable by a stable id, and SHALL resolve a wishlist's `layoutId` to its preset with a default fallback. Each preset SHALL declare `heroImageSlots`, `supportsCarousel`, and (for the legacy three) a `deprecated` flag.

#### Scenario: Layout id resolves to its preset

- **WHEN** a wishlist has a `layoutId` matching a defined preset
- **THEN** the public page resolves and applies that layout preset

#### Scenario: Missing or unknown layout id falls back

- **WHEN** a wishlist's `layoutId` is null or does not match any preset
- **THEN** the resolver returns the default layout preset

#### Scenario: Deprecated presets are flagged

- **WHEN** the layout preset list is read
- **THEN** `grid`, `editorial`, and `minimal` carry `deprecated: true` and sort after the fourteen new presets

### Requirement: Font pairing and button style presets

The system SHALL provide independent heading-font and body-font presets wired through `next/font`, each selectable by id with a default fallback: heading fonts `lora` (default), `playfair-display`, `cormorant-garamond`, `dm-serif-display`, `inter`, `nunito`; body fonts `inter` (default), `nunito`, `figtree`, `source-serif-4`, `karla`. Legacy `fontPairing` values SHALL resolve through the mapping `serif-soft` → Lora+Inter, `sans-modern` → Inter+Inter, `rounded-friendly` → Nunito+Nunito when the explicit font fields are null.

The system SHALL provide four button-style presets selectable by id with a default fallback: `pill` (default, 9999px radius), `rounded` (0.75rem), `square` (0.25rem, weight 600), and `outline` (pill radius, transparent background, 1.5px primary border).

#### Scenario: Heading and body fonts resolve independently

- **WHEN** a wishlist references a heading font id and a body font id
- **THEN** the resolver returns the matching `next/font` families, or the defaults when null or unknown

#### Scenario: Legacy pairing id maps to font pair

- **WHEN** a wishlist has null font fields and legacy `fontPairing` `rounded-friendly`
- **THEN** the resolver returns Nunito for headings and Nunito for body

#### Scenario: Button style resolves by id

- **WHEN** a wishlist references a button style id
- **THEN** the resolver returns the matching button style preset, or the default when null or unknown

#### Scenario: Outline style declares its variant

- **WHEN** the `outline` button preset is resolved
- **THEN** it declares the `outline` variant with a non-zero border width

### Requirement: Theme styling is scoped to public pages

The system SHALL expose theme styling through a `PublicThemeProvider` that writes a preset's CSS variables as inline styles onto a single `.public-theme` wrapper carrying a `data-theme` attribute, applying a `--radius: 18px` public override, and SHALL additionally write the resolved heading/body font variables (`--public-font-heading`, `--public-font-body`) and button-style variables, so that selecting a public theme does not affect the dashboard.

#### Scenario: Provider scopes variables to the wrapper

- **WHEN** the `PublicThemeProvider` mounts for a resolved theme
- **THEN** the preset's CSS variables, `--radius: 18px`, and the font/button variables are applied only to the `.public-theme` wrapper, which carries the matching `data-theme`

#### Scenario: Public theme does not alter the dashboard

- **WHEN** a public page applies a theme preset's CSS variables
- **THEN** the variables are scoped to the public page wrapper and the dashboard `:root` theme is unchanged

#### Scenario: Semantic utilities resolve per theme

- **WHEN** a descendant of the `.public-theme` wrapper uses a semantic utility such as `bg-background` or `text-foreground`
- **THEN** it resolves to the active theme's value through Tailwind v4 `@theme inline`, with no per-theme class names

### Requirement: Button style applies to all public buttons

All public-page button surfaces — hero CTAs, gift card actions, purchase modal actions, and empty-state CTAs — SHALL consume the button-style variables (radius, border width, weight, variant) through a shared `.public-btn` treatment, so that changing the wishlist's `buttonStyle` visibly restyles every public button. The `outline` variant SHALL render a transparent background with a primary-colored border and text.

#### Scenario: Hero CTA reflects the button style

- **WHEN** a wishlist uses the `square` button style
- **THEN** the hero's "Ver regalos disponibles" CTA renders with the square radius and weight 600, not only the gift card buttons

#### Scenario: Outline style renders transparent buttons

- **WHEN** a wishlist uses the `outline` button style
- **THEN** public buttons render transparent backgrounds with a 1.5px primary border and primary text

