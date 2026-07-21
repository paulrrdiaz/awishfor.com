## MODIFIED Requirements

### Requirement: Public wishlist page shell

The system SHALL provide a `PublicWishlistPage` component that takes a published or owner-preview wishlist view model and renders the full public page, resolving theme, layout, font, and button presets from the wishlist's `themeId`, `layoutId`, `headingFont`, `bodyFont`, and `buttonStyle` (falling back to the legacy `fontPairing` mapping when the font fields are null) and applying them as scoped CSS variables that do not affect the dashboard. The view model SHALL expose the ordered `coverImageUrls` list to the layout.

#### Scenario: Page resolves presets from view model

- **WHEN** `PublicWishlistPage` receives a wishlist with a known `layoutId`, `themeId`, `headingFont`, `bodyFont`, and `buttonStyle`
- **THEN** it renders the matching layout variant with the matching theme variables, font variables, and button style applied within a scope that does not leak to the rest of the app

#### Scenario: Unknown or missing preset ids fall back to defaults

- **WHEN** a wishlist's preset id is null or does not match any preset
- **THEN** the page renders the default preset for that dimension without error

#### Scenario: Legacy font pairing still resolves

- **WHEN** a wishlist has null `headingFont`/`bodyFont` but a legacy `fontPairing` value
- **THEN** the page resolves the fonts through the legacy mapping (`serif-soft` → Lora+Inter, `sans-modern` → Inter+Inter, `rounded-friendly` → Nunito+Nunito)

### Requirement: Layout variants

The system SHALL provide seventeen layout variants selected by the resolved `layoutId`: fourteen new variants implemented from the Claude Design explorations (`hero-cinematic`, `split-image-right`, `arch-split`, `collage-staggered`, `magazine-editorial`, `overlap-duo`, `arch-hero-party`, `arch-trio`, `wedding-formal`, `panoramic-band`, `carousel-hero`, `diagonal-duo`, `scrapbook-polaroids`, `portrait-frame-split`) plus the legacy `grid`, `editorial`, and `minimal` variants. Every variant SHALL compose the shared section components and honor the required section order, render modes, and purchased-gift rules.

#### Scenario: Layout selected by id

- **WHEN** the resolved layout id matches any of the seventeen variants
- **THEN** the corresponding layout component renders with its hero composition from the design canvas

#### Scenario: New layout composes shared sections

- **WHEN** any of the fourteen new layout variants renders
- **THEN** event details, countdown, welcome message, gift list, how-it-works, thank-you, and footer render through the shared section components in the required order

#### Scenario: Minimal layout renders gifts as a list

- **WHEN** the resolved layout is `minimal`
- **THEN** gifts render as single-column rows without category dividers

## ADDED Requirements

### Requirement: Hero gallery with multiple cover images

Each layout preset SHALL declare `heroImageSlots` (how many cover images its hero composition displays) and `supportsCarousel`. A shared hero gallery SHALL render the wishlist's ordered `coverImageUrls` into the composition's slots, fill missing slots with the active theme's tinted placeholder, and, when the layout supports a carousel and 2 or more images exist, render prev/next controls with a "Galería · foto N/M" caption. With 0 or 1 images no carousel controls SHALL appear.

#### Scenario: Carousel activates at two or more images

- **WHEN** a carousel-supporting layout renders a wishlist with 2+ cover images
- **THEN** the hero shows prev/next controls and the "Galería · foto N/M" caption, cycling through the images in order

#### Scenario: Single image renders without carousel

- **WHEN** a carousel-supporting layout renders a wishlist with 0 or 1 cover images
- **THEN** no carousel controls or caption render

#### Scenario: Fixed-slot layouts fill gaps with placeholders

- **WHEN** a layout with `heroImageSlots` of 3 (e.g. `collage-staggered`, `arch-trio`) renders a wishlist with fewer images
- **THEN** the remaining slots render the theme's tinted placeholder instead of an empty gray box

### Requirement: Legacy layouts are deprecated

The `grid`, `editorial`, and `minimal` layout presets SHALL be flagged deprecated. They SHALL continue to render for wishlists that reference them, SHALL appear last in layout pickers under a muted legacy grouping, and their removal (with data migration) SHALL be recorded as pre-PROD tech debt in `docs/FUTURE_IMPROVEMENTS.md`.

#### Scenario: Existing wishlist on a legacy layout still renders

- **WHEN** a published wishlist has `layoutId` `grid`, `editorial`, or `minimal`
- **THEN** the public page renders that legacy layout without error

#### Scenario: Tech debt is recorded

- **WHEN** `docs/FUTURE_IMPROVEMENTS.md` is read after this change
- **THEN** it contains an entry to remove the legacy layouts, `coverImageUrl`, and `fontPairing` before PROD launch
