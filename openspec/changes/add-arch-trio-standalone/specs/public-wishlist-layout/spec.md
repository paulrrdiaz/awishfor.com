## ADDED Requirements

### Requirement: Arch trio composition

The `arch-trio` layout SHALL render as a self-contained page rather than delegating its body to the shared public wishlist body component. It SHALL compose the shared page shell for its header, centered content wrapper and footer, and SHALL supply its own body content.

Its hero SHALL be arranged as a two-column grid at the `lg` breakpoint and above — a fixed-width 290px media column and a flexible text column — over a diagonal gradient from the theme's accent to its card surface, and SHALL NOT bleed beyond the shared shell's centered content wrapper. Below the `lg` breakpoint the grid SHALL collapse to a single column with the media column rendered first.

The media column SHALL present three circular cover-image slots in an overlapping arc: a large primary slot, a medium slot offset to the lower right, and a small slot offset to the upper right. The medium and small slots SHALL carry a ring in the theme's card color; the large slot SHALL NOT. The text column SHALL present, in order, the event-type eyebrow, the wishlist title, the event summary line, the guest welcome section, and the hero CTA group.

Below the hero the layout SHALL render, in the required section order: the event-details cards in their compact presentation, the countdown in the variant selected for the wishlist, the welcome message in its selected variant when one exists, a divider, the gift-list heading with an inline availability summary, the filtered gift list, and the thank-you message in its selected variant.

Its gift filter SHALL expose the status filters alone — all, available, purchased, and starred — without category filters, matching the design canvas.

#### Scenario: Layout renders through the shared shell

- **WHEN** the `arch-trio` layout renders a wishlist
- **THEN** its header, centered content wrapper and footer come from the shared page shell, and it does not delegate to the shared public wishlist body component

#### Scenario: Two-column hero at large breakpoints

- **WHEN** the `arch-trio` layout renders at the `lg` breakpoint or wider
- **THEN** the three arc images occupy a fixed 290px media column and the title and CTA content occupy a flexible text column beside it

#### Scenario: Single column below the large breakpoint

- **WHEN** the `arch-trio` layout renders below the `lg` breakpoint
- **THEN** the hero collapses to one column with the arc composition above the text content

#### Scenario: Hero stays within the shared content wrapper

- **WHEN** the `arch-trio` layout renders in any mode
- **THEN** its hero is bounded by the shell's centered content wrapper and does not extend to the full viewport width

#### Scenario: Gift filter exposes status filters only

- **WHEN** the `arch-trio` layout renders its gift section for a wishlist whose gifts span several categories
- **THEN** the filter row offers all, available, purchased and starred, and no category filters

### Requirement: Tilted gift card presentation

The system SHALL provide a `tilted` gift-card presentation, selectable through a layout preset's declared gift-card style, in which cards carry a heavier drop shadow than the default card presentation and are rotated by a small fixed angle that alternates by column position, with the middle column of each row offset vertically. The rotation SHALL be applied by the grid from each card's position rather than by passing a positional index into the card component, and SHALL leave every other gift-card presentation unchanged.

#### Scenario: Tilted cards alternate by column

- **WHEN** a layout whose preset declares the `tilted` gift-card style renders a full row of gifts
- **THEN** the three cards in that row are rotated by different fixed angles and the middle card is offset vertically from its neighbours

#### Scenario: Other presentations are unaffected

- **WHEN** a layout declaring the `card`, `collage`, `row`, `minimal`, or `collage-row` gift-card style renders its gift list
- **THEN** its cards render with no rotation or vertical stagger

#### Scenario: Short rows degrade cleanly

- **WHEN** a row contains fewer than three gifts
- **THEN** the present cards keep the rotation matching their column position and no empty slot is reserved

## MODIFIED Requirements

### Requirement: Layout variants

The system SHALL provide nine layout variants selected by the resolved `layoutId`: `carousel-hero`, `scrapbook-polaroids`, `portrait-frame-split`, `arch-hero-party`, `arch-trio`, `overlap-duo`, `split-image-right`, `collage-staggered`, and `magazine-editorial`. Every variant SHALL compose the shared section components, shared hero CTA behavior, and optional how-it-works drawer, and SHALL honor the required section order, render modes, and purchased-gift rules.

Variants exist in two generations while the layouts migrate. Variants that own their full page composition — currently `collage-staggered`, `split-image-right`, and `arch-trio` — SHALL compose a single shared page shell for their chrome rather than each inlining it, and SHALL be identified by one shared declaration rather than by per-layout conditionals scattered through the page shell. Variants not yet migrated SHALL continue to render through the shared public wishlist body.

The shared shell SHALL own the mode-dependent outer wrapper, the page header (brand isotype, published status badge, share control), the centered content wrapper, the compact footer, and a per-mode viewport top offset published for layouts that position content against the viewport. It SHALL NOT own section order or gift rendering; a layout SHALL supply its own body content.

#### Scenario: Layout selected by id

- **WHEN** the resolved layout id matches any of the nine variants
- **THEN** the corresponding layout component renders with its hero composition from the design canvas

#### Scenario: Every layout composes the shared drawer trigger

- **WHEN** any of the nine layout variants renders a non-compact wishlist with `showHowItWorks` enabled
- **THEN** its shared hero CTA group exposes the same “Cómo funciona” drawer interaction without an inline how-it-works section

#### Scenario: Retired layout ids fall back

- **WHEN** a wishlist references a retired layout id such as `grid` or `hero-cinematic`
- **THEN** the default layout renders without error

#### Scenario: Self-contained layouts share the shell's wrapper treatment

- **WHEN** the page shell renders a self-contained layout in a non-full render mode
- **THEN** the same wrapper styling applies to every self-contained layout, resolved from the shared declaration rather than from a check against one layout id

#### Scenario: Self-contained layouts render identical chrome

- **WHEN** `collage-staggered`, `split-image-right`, and `arch-trio` each render in the same mode
- **THEN** their header, centered content wrapper and footer come from the shared shell and are identical, differing only in the body content each supplies

#### Scenario: Unmigrated variants keep the shared body

- **WHEN** any of the six variants that have not yet migrated renders a wishlist
- **THEN** it continues to render through the shared public wishlist body, unaffected by the shell

### Requirement: Event details section cards

The public wishlist page SHALL render an event-details section composed of up to three cards — Fecha (event date/time), Lugar (event location), and the dress code. Each card SHALL render only when its backing data is present; cards with empty data SHALL be omitted, and the whole section SHALL be omitted when all three are empty.

The section SHALL be provided by one shared component in two presentations, so that no layout reimplements the row: a default block presentation labelling the third card `Código de vestimenta` and owning its own centered section wrapper, and a compact presentation labelling it `Dresscode`, rendering the cards centered with a mono uppercase micro-label, and leaving positioning to the calling layout. Self-contained layouts SHALL consume the compact presentation rather than inlining their own copy of the row.

#### Scenario: All three cards render when data present

- **WHEN** a wishlist has an event date, an event location, and a dress code
- **THEN** the event-details section renders Fecha, Lugar, and dress-code cards

#### Scenario: Empty cards are hidden

- **WHEN** a wishlist has an event date but no event location and no dress code
- **THEN** only the Fecha card renders and the Lugar and dress-code cards are omitted

#### Scenario: Section omitted when no event details

- **WHEN** a wishlist has no event date, no event location, and no dress code
- **THEN** the event-details section is not rendered

#### Scenario: Every layout renders the section

- **WHEN** each of the nine layout variants renders a wishlist that has event details
- **THEN** the event-details section appears in all nine

#### Scenario: Presentations differ only as specified

- **WHEN** the block presentation and the compact presentation each render the same wishlist
- **THEN** the block presentation labels the third card `Código de vestimenta` and the compact presentation labels it `Dresscode`
- **AND** both render the same three cards from the same data with the same omission rules

#### Scenario: Self-contained layouts share one implementation

- **WHEN** `collage-staggered` and `arch-trio` each render their event-details row
- **THEN** both render through the shared component's compact presentation rather than through their own inlined copies

### Requirement: Hero gallery with multiple cover images

Each layout preset SHALL declare `heroImageSlots` (how many cover images its hero composition displays) and `supportsCarousel`. A shared hero gallery SHALL render the wishlist's ordered cover-image records into the composition's slots, fill missing slots with the active theme's tinted placeholder, and, when the layout supports a carousel and 2 or more images exist, render prev/next controls with a "Galería · foto N/M" caption. With 0 or 1 images no carousel controls SHALL appear. Placeholder slots SHALL never be filled with stock or sample photography on a published page.

A layout MAY scope the carousel to a single slot of a multi-slot composition, leaving its remaining slots static. In that case the shared hero gallery SHALL allow the clipping window the images cycle within to be positioned and shaped independently of the element the gallery controls are positioned against, so that controls and caption can be placed against a container larger than that window. The window SHALL stay stationary while the images move through it. A layout that specifies no separate clipping window SHALL render exactly as before, with controls positioned against the same element the images are clipped to.

The `split-image-right` layout SHALL declare `heroImageSlots` of 2 and SHALL NOT support a carousel: its composition is a fixed two-photo rail, not a gallery.

#### Scenario: Carousel activates at two or more images

- **WHEN** a carousel-supporting layout renders a wishlist with 2+ cover images
- **THEN** the hero shows prev/next controls and the "Galería · foto N/M" caption, cycling through the images in order

#### Scenario: Single image renders without carousel

- **WHEN** a carousel-supporting layout renders a wishlist with 0 or 1 cover images
- **THEN** no carousel controls or caption render

#### Scenario: Fixed-slot layouts fill gaps with placeholders

- **WHEN** a layout with `heroImageSlots` of 3 (e.g. `collage-staggered`, `arch-trio`) renders a wishlist with fewer images
- **THEN** the remaining slots render the theme's tinted placeholder instead of an empty gray box or a stock photo

#### Scenario: Carousel scoped to one slot of a composition

- **WHEN** the `arch-trio` layout renders a wishlist with 2+ cover images
- **THEN** only its largest arc cycles through the images while the other two arcs remain static
- **AND** the arc itself stays in place while the images move within it
- **AND** the prev/next controls and the "Galería · foto N/M" caption are positioned against the media column rather than clipped inside the cycling arc

#### Scenario: Unscoped consumers are unaffected

- **WHEN** a carousel-supporting layout that specifies no separate clipping window renders a wishlist with 2+ cover images
- **THEN** its gallery renders exactly as it did before scoped clipping was available, with controls positioned against the clipped image element

#### Scenario: Split image right declares two slots without a carousel

- **WHEN** the `split-image-right` layout preset is resolved
- **THEN** its `heroImageSlots` is 2 and `supportsCarousel` is false

#### Scenario: Split image right with one image fills the second slot with a placeholder

- **WHEN** the `split-image-right` layout renders a wishlist with exactly one cover image
- **THEN** the first rail slot shows that image and the second shows the theme's tinted placeholder, with no carousel controls
