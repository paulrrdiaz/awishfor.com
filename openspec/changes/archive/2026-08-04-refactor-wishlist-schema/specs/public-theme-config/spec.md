## MODIFIED Requirements

### Requirement: Theme presets selectable by id

The system SHALL provide seven hardcoded public theme presets, each addressable by a stable id, and SHALL resolve a wishlist's `themeId` to its preset. The presets are `dulce-rosa`, `cielo-suave` (default), `cielo-suave-rosa`, `jardin-verde`, `crema-elegante`, `lavanda-fiesta`, and `clasico-minimal` — the catalog shipped by `Wishlist Wizard.dc.html`. Every preset SHALL follow the established palette system: near-white tinted background, tinted ink foreground, white card, soft primary whose foreground meets ≥ 4.5:1 contrast, and a soft accent.

#### Scenario: Theme id resolves to its preset

- **WHEN** a wishlist has a `themeId` matching a defined preset
- **THEN** the public page resolves and applies that theme preset

#### Scenario: Missing or unknown theme id falls back

- **WHEN** a wishlist's `themeId` is null or does not match any preset
- **THEN** the resolver returns the default theme preset rather than failing

#### Scenario: Niña variant is available as a matching set

- **WHEN** a wishlist uses `themeId` `cielo-suave-rosa`
- **THEN** the public page applies the rose-on-blush niña variant that shares the `cielo-suave` family's ivory accent

#### Scenario: Every preset meets the contrast rule

- **WHEN** any of the seven theme presets is applied
- **THEN** its foreground-on-background and primary-foreground-on-primary combinations meet at least 4.5:1 contrast

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
