## MODIFIED Requirements

### Requirement: Below-the-fold sections verified against the §5 desktop frame

The eight sections named below SHALL be verified against `A Wish For.dc.html` §5 at both source artboards — frame "Marketing / landing · desktop · light green theme · v2 fotográfica" at 1240px, and frame "Marketing / landing · móvil · 390px" below the `lg` breakpoint — for layout, spacing, typography, colour, imagery treatment, and composition: "¿Qué estás celebrando?", "Todo lo que necesitas, sin complicaciones", "Del primer clic a tu lista publicada", "Así se ve una wishlist publicada", "¿Buscas la lista de alguien?", "Resolvemos tus dudas", "Tu próximo momento especial merece una página hermosa", and "Ideas para tu próximo evento".

Two departures from the mobile frame are approved: prices inside the example preview render in the product currency rather than the canvas currency, and every section renders the single desktop copy set rather than the canvas's shorter mobile strings and alternate mobile headings.

#### Scenario: Desktop visual parity

- **WHEN** each named section is compared at the 1240px artboard width
- **THEN** its section padding, background, dividers, grid geometry, type scale, colour values and imagery treatment match the exported desktop frame within normal browser font-rendering tolerance

#### Scenario: Mobile visual parity

- **WHEN** each named section is compared at the 390px artboard width
- **THEN** its section padding, background, grid geometry, card and thumbnail dimensions, type scale, colour values and control layout match the exported mobile frame within normal browser font-rendering tolerance
- **AND** the difference from the desktop composition is achieved without client-side viewport detection

#### Scenario: Structural facts are asserted automatically

- **WHEN** the marketing test suite runs
- **THEN** it asserts the five-item FAQ set, the five-step timeline, the four benefit cards, the single "wishlist general" affordance node, the preview's gift-state coverage, and the absence of orphaned motion hook attributes

#### Scenario: Copy does not vary by breakpoint

- **WHEN** a named section is compared between the two artboard widths
- **THEN** its headings, body copy and calls to action are identical strings
- **AND** neither composition introduces a breakpoint-duplicated copy node

## ADDED Requirements

### Requirement: Occasion picker uses the canvas mosaic below the breakpoint

Below the `lg` breakpoint the "Elige tu ocasión" cards SHALL render as the canvas mosaic: a promoted full-width lead card above a two-column grid, with the "wishlist general" affordance rendering as a solid dark tile in that grid rather than as the desktop text link.

The promoted lead card SHALL retain its call to action. The four smaller tiles SHALL omit their subtitle and inline call to action while remaining complete links to their seeded wizard destination.

#### Scenario: Mosaic composition below the breakpoint

- **WHEN** the occasion picker renders below `lg`
- **THEN** one occasion card spans the full column width above a two-column grid of the remaining occasion tiles
- **AND** the "wishlist general" affordance renders as a dark tile occupying the final grid position

#### Scenario: Reduced tiles remain fully operable

- **WHEN** a visitor activates one of the smaller occasion tiles
- **THEN** they navigate to `/create` with that event type pre-selected
- **AND** the tile exposes an accessible name despite omitting its visible subtitle and inline call to action

#### Scenario: Desktop composition is unaffected

- **WHEN** the occasion picker renders at `lg` and above
- **THEN** it shows the same mosaic — the promoted lead card with subtitle and call to action beside the three smaller tiles with subtitles, and the "wishlist general" affordance as the dark grid tile (not a text link) — unchanged from the pre-mobile-change composition

### Requirement: FAQ scales to its mobile type and spacing

The FAQ SHALL render as a single accordion question list at every viewport — the canvas defines no split layout or dark support panel at either the desktop or the mobile frame. Below the `lg` breakpoint it SHALL use the mobile section padding, row padding, icon size and type scale from the canvas mobile frame. The question set SHALL remain the same five questions at every viewport.

#### Scenario: Mobile scale below the breakpoint

- **WHEN** the FAQ renders below `lg`
- **THEN** its section padding, row padding, icon size and type scale match the canvas mobile frame
- **AND** the question list is not restructured into a split or panel layout

#### Scenario: Question set does not vary by viewport

- **WHEN** the FAQ renders at any viewport
- **THEN** the same five questions are present in the server-rendered HTML
- **AND** no question is hidden by a breakpoint visibility utility

### Requirement: Photographic bands and forms adapt below the breakpoint

Below the `lg` breakpoint the guest list-finder and final call-to-action bands SHALL use their mobile geometry, and every band form SHALL stack its controls to full width.

#### Scenario: Bands use mobile geometry

- **WHEN** either photographic band renders below `lg`
- **THEN** it uses the mobile minimum height, padding, overlay treatment and type scale from the canvas mobile frame

#### Scenario: Band forms stack

- **WHEN** the guest list-finder or newsletter form renders below `lg`
- **THEN** its field and submit control stack vertically at full width
- **AND** the guest list-finder message slot remains reserved and announced, and the band height does not change when a message appears

### Requirement: Example preview uses its mobile composition

Below the `lg` breakpoint the example preview SHALL use the canvas mobile composition: no status topbar, the tighter collage proportions, no availability summary row, the reduced scroll region, and a two-column gift grid.

#### Scenario: Mobile preview composition

- **WHEN** the example preview renders below `lg`
- **THEN** the status topbar and availability summary row are absent, the collage uses the mobile heights, the scroll region uses the mobile maximum height, and gifts render in two columns

#### Scenario: Gift state survives the narrower composition

- **WHEN** the mobile gift grid renders
- **THEN** priority, availability, partial-purchase and purchased states remain distinguishable
- **AND** purchased gifts remain struck through and dimmed
