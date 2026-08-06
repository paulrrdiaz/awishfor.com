## MODIFIED Requirements

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

## ADDED Requirements

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
