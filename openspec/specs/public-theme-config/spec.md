## Purpose

Define the public wishlist preset configuration for themes, layouts, fonts, button styles, and public-theme scoping.
## Requirements
### Requirement: Theme presets selectable by id

The system SHALL provide seven hardcoded public theme presets, each addressable by a stable id, and SHALL resolve a wishlist's `themeId` to its preset. The presets are `dulce-rosa`, `cielo-suave` (default), `cielo-suave-rosa`, `jardin-verde`, `crema-elegante`, `lavanda-fiesta`, and `clasico-minimal` — the catalog shipped by `Wishlist Wizard.dc.html`.

Each preset's base, surface, primary, muted, border, and placeholder values SHALL be those defined by the design system — the theme classes in `PublicWishlistPages.dc.html` and the token table in `design_handoff_public_wishlist_page/README.md`. The preset ids map to the design theme classes as: `dulce-rosa`→`rosa`, `cielo-suave`→`cielo`, `cielo-suave-rosa`→`cielorosa`, `jardin-verde`→`verde`, `crema-elegante`→`crema`, `lavanda-fiesta`→`lavanda`, `clasico-minimal`→`clasico`.

Every preset SHALL follow the approved tonal palette system: near-white tinted background, tinted ink foreground, white card, a **soft pastel primary paired with a dark primary foreground**, and an accent pair drawn from the same hue family as the primary. Tokens the design system does not define SHALL be derived rather than invented: `--popover` from `--card`, `--popover-foreground` from `--card-foreground`, `--input` from `--border`, and `--ring` from `--primary`. `--secondary` and `--secondary-foreground` have no design counterpart and SHALL retain their existing values.

#### Scenario: Theme id resolves to its preset

- **WHEN** a wishlist has a `themeId` matching a defined preset
- **THEN** the public page resolves and applies that theme preset

#### Scenario: Missing or unknown theme id falls back

- **WHEN** a wishlist's `themeId` is null or does not match any preset
- **THEN** the resolver returns the default theme preset rather than failing

#### Scenario: Niña variant is available as a matching set

- **WHEN** a wishlist uses `themeId` `cielo-suave-rosa`
- **THEN** the public page applies the rose-on-blush niña variant with a tonal rose accent (`#F5E2E9`)

#### Scenario: Every preset meets the contrast rule

- **WHEN** any of the seven theme presets is applied
- **THEN** its foreground-on-background, primary-foreground-on-primary, and accent-foreground-on-accent combinations meet at least 4.5:1 contrast

#### Scenario: Primary foregrounds are dark on pastel primaries

- **WHEN** any preset other than `clasico-minimal` is applied
- **THEN** its `--primary` is a pastel tint and its `--primary-foreground` is a dark ink drawn from the same hue family, not a near-white

#### Scenario: Core token values match the design system exactly

- **WHEN** a preset's `vars` are compared against its design theme class
- **THEN** `--background`, `--foreground`, `--card`, `--card-foreground`, `--primary`, `--primary-foreground`, `--muted`, `--muted-foreground`, and `--border` are byte-equal to the design values, case-insensitively

#### Scenario: Accent stays in the primary hue family

- **WHEN** any theme preset is applied
- **THEN** its accent is a light tonal variant of its primary rather than an unrelated warm, beige, pink, or gold hue

#### Scenario: Retired themes are gone

- **WHEN** the theme preset list is read
- **THEN** it contains exactly seven presets and none of `terracota-calida`, `menta-fresca`, `noche-azul`, `sol-dorado`, or `coral-vivo`

### Requirement: Layout presets selectable by id

The system SHALL provide nine hardcoded public layout presets — `carousel-hero`, `scrapbook-polaroids`, `portrait-frame-split`, `arch-hero-party`, `arch-trio`, `overlap-duo`, `split-image-right`, `collage-staggered`, and `magazine-editorial` (default) — each addressable by a stable id, and SHALL resolve a wishlist's `layoutId` to its preset with a default fallback. Each preset SHALL declare `heroImageSlots`, `supportsCarousel`, and its image guidance. No preset SHALL be flagged deprecated.

#### Scenario: Layout id resolves to its preset

- **WHEN** a wishlist has a `layoutId` matching a defined preset
- **THEN** the public page resolves and applies that layout preset

#### Scenario: Missing or unknown layout id falls back

- **WHEN** a wishlist's `layoutId` is null or does not match any preset
- **THEN** the resolver returns the default layout preset

#### Scenario: Retired layouts are gone

- **WHEN** the layout preset list is read
- **THEN** it contains exactly the nine design layouts and none of `hero-cinematic`, `arch-split`, `wedding-formal`, `panoramic-band`, `diagonal-duo`, `grid`, `editorial`, or `minimal`

#### Scenario: Default layout resolves within the catalog

- **WHEN** the default layout id is resolved
- **THEN** it matches one of the nine presets

### Requirement: Font pairing and button style presets

The system SHALL provide independent heading-font and body-font presets wired through `next/font`, each selectable by id with a default fallback: heading fonts `lora` (default), `playfair-display`, `cormorant-garamond`, `dm-serif-display`, `inter`, `nunito`; body fonts `inter` (default), `nunito`, `figtree`, `source-serif-4`, `karla`. There SHALL be no legacy `fontPairing` field and no pairing-to-font mapping; a wishlist with null font fields SHALL resolve to the defaults.

The system SHALL provide four button-style presets selectable by id with a default fallback: `pill` (default, 9999px radius), `rounded` (0.75rem), `square` (0.25rem, weight 600), and `outline` (pill radius, transparent background, 1.5px primary border).

#### Scenario: Heading and body fonts resolve independently

- **WHEN** a wishlist references a heading font id and a body font id
- **THEN** the resolver returns the matching `next/font` families, or the defaults when null or unknown

#### Scenario: Null font fields resolve to defaults

- **WHEN** a wishlist has null heading and body font fields
- **THEN** the resolver returns Lora for headings and Inter for body, consulting no pairing field

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

### Requirement: Placeholder tint token

Every theme preset SHALL define a `--ph-tint` token — the design system's photo-slot placeholder tint — and the public theme scope SHALL expose it to Tailwind as `--color-ph-tint`. Hero image slots with no image SHALL render on this tint rather than on a transparency of the theme accent, so that an empty slot reads as a neutral photo-shaped placeholder on every theme instead of a wash of the accent colour.

#### Scenario: Every preset defines a placeholder tint

- **WHEN** the theme preset list is read
- **THEN** all seven presets define a non-empty `--ph-tint` matching their design theme class

#### Scenario: Empty hero slot uses the placeholder tint

- **WHEN** a hero image slot resolves to no image
- **THEN** the placeholder renders on the active theme's `--ph-tint`, not on a transparency of `--accent`

### Requirement: Preview swatches reflect preset tokens

Each theme preset SHALL expose `preview.background`, `preview.primary`, and `preview.accent` values that are consistent with that preset's `vars`, so that the theme swatch picker and the marketing theme preview represent the theme a host will actually get.

#### Scenario: Swatch matches the preset it advertises

- **WHEN** a preset's `preview` values are compared against its `vars`
- **THEN** `preview.background` equals `--background`, `preview.primary` equals `--primary`, and `preview.accent` equals `--accent`

#### Scenario: Marketing preview keeps pastel primaries legible

- **WHEN** the marketing theme preview renders a preset's primary
- **THEN** the primary remains distinguishable from the preview background rather than being lightened into it

