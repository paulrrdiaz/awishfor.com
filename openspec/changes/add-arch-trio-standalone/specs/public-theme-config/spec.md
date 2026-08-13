## MODIFIED Requirements

### Requirement: Layout presets selectable by id

The system SHALL provide nine hardcoded public layout presets — `carousel-hero`, `scrapbook-polaroids`, `portrait-frame-split`, `arch-hero-party`, `arch-trio`, `overlap-duo`, `split-image-right`, `collage-staggered`, and `magazine-editorial` (default) — each addressable by a stable id, and SHALL resolve a wishlist's `layoutId` to its preset with a default fallback. Each preset SHALL declare `heroImageSlots`, `supportsCarousel`, its gift-card style, and its image guidance. No preset SHALL be flagged deprecated.

The `arch-trio` preset SHALL declare `supportsCarousel` true: its largest arc cycles through the wishlist's cover images while its two smaller arcs stay static. Its `heroImageSlots` SHALL remain 3 and its image guidance SHALL remain a 1:1 circle crop recommending a centered subject, since the arcs still crop to circles. Its gift-card style SHALL be `tilted`.

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

#### Scenario: Arch trio declares a carousel over three fixed slots

- **WHEN** the `arch-trio` layout preset is resolved
- **THEN** its `supportsCarousel` is true, its `heroImageSlots` is 3, and its image guidance is a 1:1 crop flagged for a centered subject

#### Scenario: Arch trio declares the tilted gift-card style

- **WHEN** the `arch-trio` layout preset is resolved
- **THEN** its gift-card style is `tilted`, and `collage-staggered`'s remains `collage`
