## MODIFIED Requirements

### Requirement: Layout image guidance metadata

Each `PublicLayoutPreset` SHALL carry recommended image-guidance metadata describing the shape its hero renderer crops cover images to: an aspect ratio, an orientation (`landscape`, `portrait`, or `square`), and, where applicable, flags for circle crops (centered subject) and mixed-shape compositions. The metadata SHALL be resolvable alongside the existing preset fields and SHALL match the actual crop applied by that layout's hero component.

The populated recommendations SHALL be: `carousel-hero` 16:9 landscape; `scrapbook-polaroids` 4:3 landscape; `split-image-right` 3:4 portrait; `portrait-frame-split` 3:4 portrait; `overlap-duo` 3:4 portrait; `arch-hero-party` 2:3 portrait; `magazine-editorial` 1:1 square; `arch-trio` 1:1 square (centered subject); `collage-staggered` mixed, recommending a safe 3:4.

#### Scenario: Preset exposes guidance for a layout

- **WHEN** a layout preset is resolved by id
- **THEN** its recommended aspect ratio and orientation are available and correspond to that layout's hero crop shape

#### Scenario: Circle-crop layout flags centered subject

- **WHEN** the resolved layout is `arch-trio`
- **THEN** its guidance indicates a circle crop that benefits from a centered subject

#### Scenario: Mixed-composition layout recommends a safe ratio

- **WHEN** the resolved layout is `collage-staggered`
- **THEN** its guidance recommends a single safe 3:4 rather than a per-slot ratio

### Requirement: Public wishlist page shell

The system SHALL provide a `PublicWishlistPage` component that takes a published or owner-preview wishlist view model and renders the full public page, resolving theme, layout, font, and button presets from the wishlist's `themeId`, `layoutId`, `headingFont`, `bodyFont`, and `buttonStyle` and applying them as scoped CSS variables that do not affect the dashboard. Null font fields SHALL resolve to the default fonts; there is no legacy pairing field to consult. The view model SHALL expose the ordered cover-image records — url, dimensions and orientation — to the layout.

#### Scenario: Page resolves presets from view model

- **WHEN** `PublicWishlistPage` receives a wishlist with a known `layoutId`, `themeId`, `headingFont`, `bodyFont`, and `buttonStyle`
- **THEN** it renders the matching layout variant with the matching theme variables, font variables, and button style applied within a scope that does not leak to the rest of the app

#### Scenario: Unknown or missing preset ids fall back to defaults

- **WHEN** a wishlist's preset id is null or does not match any preset
- **THEN** the page renders the default preset for that dimension without error

#### Scenario: Null fonts resolve to defaults

- **WHEN** a wishlist has null `headingFont` and `bodyFont`
- **THEN** the page resolves the default heading and body fonts without consulting any legacy pairing value

### Requirement: Layout variants

The system SHALL provide nine layout variants selected by the resolved `layoutId`: `carousel-hero`, `scrapbook-polaroids`, `portrait-frame-split`, `arch-hero-party`, `arch-trio`, `overlap-duo`, `split-image-right`, `collage-staggered`, and `magazine-editorial`. Every variant SHALL compose the shared section components and honor the required section order, render modes, and purchased-gift rules.

#### Scenario: Layout selected by id

- **WHEN** the resolved layout id matches any of the nine variants
- **THEN** the corresponding layout component renders with its hero composition from the design canvas

#### Scenario: Every layout composes shared sections

- **WHEN** any of the nine layout variants renders
- **THEN** event details, countdown, welcome message, gift list, how-it-works, thank-you, and footer render through the shared section components in the required order

#### Scenario: Retired layout ids fall back

- **WHEN** a wishlist references a retired layout id such as `grid` or `hero-cinematic`
- **THEN** the default layout renders without error

### Requirement: Event details section cards

The public wishlist page SHALL render an event-details section composed of up to three cards — Fecha (event date/time), Lugar (event location), and Código de vestimenta (dress code). Each card SHALL render only when its backing data is present; cards with empty data SHALL be omitted, and the whole section SHALL be omitted when all three are empty. Every one of the nine layout variants SHALL render this section, since it is the only surface carrying date, venue and dress code.

#### Scenario: All three cards render when data present

- **WHEN** a wishlist has an event date, an event location, and a dress code
- **THEN** the event-details section renders Fecha, Lugar, and Código de vestimenta cards

#### Scenario: Empty cards are hidden

- **WHEN** a wishlist has an event date but no event location and no dress code
- **THEN** only the Fecha card renders and the Lugar and Código de vestimenta cards are omitted

#### Scenario: Section omitted when no event details

- **WHEN** a wishlist has no event date, no event location, and no dress code
- **THEN** the event-details section is not rendered

#### Scenario: Every layout renders the section

- **WHEN** each of the nine layout variants renders a wishlist that has event details
- **THEN** the event-details section appears in all nine

### Requirement: Hero gallery with multiple cover images

Each layout preset SHALL declare `heroImageSlots` (how many cover images its hero composition displays) and `supportsCarousel`. A shared hero gallery SHALL render the wishlist's ordered cover-image records into the composition's slots, fill missing slots with the active theme's tinted placeholder, and, when the layout supports a carousel and 2 or more images exist, render prev/next controls with a "Galería · foto N/M" caption. With 0 or 1 images no carousel controls SHALL appear. Placeholder slots SHALL never be filled with stock or sample photography on a published page.

#### Scenario: Carousel activates at two or more images

- **WHEN** a carousel-supporting layout renders a wishlist with 2+ cover images
- **THEN** the hero shows prev/next controls and the "Galería · foto N/M" caption, cycling through the images in order

#### Scenario: Single image renders without carousel

- **WHEN** a carousel-supporting layout renders a wishlist with 0 or 1 cover images
- **THEN** no carousel controls or caption render

#### Scenario: Fixed-slot layouts fill gaps with placeholders

- **WHEN** a layout with `heroImageSlots` of 3 (e.g. `collage-staggered`, `arch-trio`) renders a wishlist with fewer images
- **THEN** the remaining slots render the theme's tinted placeholder instead of an empty gray box or a stock photo

## ADDED Requirements

### Requirement: Hero shows the wishlist title alone

Every layout's hero composition SHALL present the wishlist's `title` as its heading and SHALL NOT render a separate name or subtitle line beneath it. Contextual information that previously shared the hero — date, venue and dress code — reaches the guest through the event-details section instead.

#### Scenario: Hero renders the title

- **WHEN** any layout variant renders a wishlist
- **THEN** the hero heading is the wishlist's `title`

#### Scenario: No subtitle line under the hero heading

- **WHEN** any layout variant renders a wishlist that has an event location and a date
- **THEN** the hero renders no subtitle line, and the location and date appear in the event-details section

## REMOVED Requirements

### Requirement: HeroCinematic hero content and contrast

**Reason**: `hero-cinematic` is not part of the nine-layout catalog the design ships, and its component is deleted. Its subtitle rule also depended on `displayName`, a column this change drops.

**Migration**: Wishlists referencing `hero-cinematic` resolve to the default layout. The neutral on-photo CTA treatment it introduced is retained by the surviving photo-hero layouts.

### Requirement: Legacy layouts are deprecated

**Reason**: `grid`, `editorial`, and `minimal` are deleted rather than flagged, together with the `coverImageUrl` and `fontPairing` columns this requirement tracked as pre-PROD debt. Nothing remains to deprecate.

**Migration**: None needed — there is no production data. The matching entry is cleared from `docs/FUTURE_IMPROVEMENTS.md`, since this change discharges it.
