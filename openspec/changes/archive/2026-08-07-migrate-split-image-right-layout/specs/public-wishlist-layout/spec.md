## ADDED Requirements

### Requirement: Split image right composition

The `split-image-right` layout SHALL render as a self-contained page rather than delegating its body to the shared public wishlist body component. It SHALL provide its own page header (brand isotype, published status badge, share control), a centered content wrapper constrained to a maximum width, and its own compact footer, matching the composition pattern established by `collage-staggered`.

Its content SHALL be arranged as a two-column grid at the `lg` breakpoint and above: a flexible left column separated from the right column by a border, and a fixed-width right column of 340px. The left column SHALL present, in order, the event-type eyebrow, the wishlist title, the event summary line, the guest welcome section, the hero CTA group, a two-up event-details grid (date and location), a centered countdown chip, the quote block when a welcome message exists, a divider, the gift-list heading, and the filtered gift list. The right column SHALL hold exactly two cover-image slots.

Below the `lg` breakpoint the grid SHALL collapse to a single column with the two images rendered as a fixed-height stacked pair above the text content.

#### Scenario: Layout renders its own page chrome

- **WHEN** the `split-image-right` layout renders a wishlist
- **THEN** it renders its own header with the brand isotype, published badge and share control, and its own compact footer, without delegating to the shared public wishlist body component

#### Scenario: Two-column grid at large breakpoints

- **WHEN** the `split-image-right` layout renders at the `lg` breakpoint or wider
- **THEN** the text content occupies a flexible left column and the two cover images occupy a fixed 340px right column

#### Scenario: Single column below the large breakpoint

- **WHEN** the `split-image-right` layout renders below the `lg` breakpoint
- **THEN** the grid collapses to one column and the two cover images render as a fixed-height stacked pair above the text content

#### Scenario: Countdown appears in the left column

- **WHEN** the `split-image-right` layout renders a wishlist with a future event date
- **THEN** a centered countdown chip renders in the left column above the quote block, and no countdown is passed into the gift filter toolbar

### Requirement: Split image right sticky photo rail

At the `lg` breakpoint and above, the `split-image-right` layout's right column SHALL render as a sticky element that remains in view while the left column scrolls past it. The sticky element SHALL be sized to the available viewport height and SHALL divide that height evenly between its two cover-image slots. Below the `lg` breakpoint the rail SHALL NOT be sticky and SHALL NOT use viewport-derived heights.

The sticky offset and rail height SHALL account for whatever is actually pinned to the top of the viewport in each render mode: the layout's own fixed page header in `full` mode, the unpublished-preview banner alone in `preview` mode (where the page header scrolls away with the content), and nothing in `compact` mode. In `compact` mode the rail SHALL size to its embedded container rather than to the viewport, so that an embedded preview does not overflow its host box.

No ancestor of the sticky element SHALL apply an `overflow` value other than `visible`, and the image slots SHALL be permitted to shrink below their intrinsic content height so the even split is achievable.

#### Scenario: Rail stays in view while content scrolls

- **WHEN** a guest scrolls the `split-image-right` layout at the `lg` breakpoint or wider on a wishlist whose left column is taller than the viewport
- **THEN** the two cover images remain fixed in the viewport while the left column scrolls past them

#### Scenario: Rail is not sticky on small screens

- **WHEN** the `split-image-right` layout renders below the `lg` breakpoint
- **THEN** the cover images scroll with the rest of the page and are not pinned to the viewport

#### Scenario: Sticky offset clears the preview banner

- **WHEN** the `split-image-right` layout renders in `preview` mode, where the unpublished-preview banner is pinned to the top but the page header is not
- **THEN** the top of the sticky rail is positioned below the banner and the rail's height is reduced by the banner alone, leaving no dead gap above the first image

#### Scenario: Full mode offset clears the fixed header

- **WHEN** the `split-image-right` layout renders in `full` mode, where its own page header is fixed to the top
- **THEN** the top of the sticky rail is positioned below that header and the rail's height is reduced by it

#### Scenario: Compact mode does not use viewport height

- **WHEN** the `split-image-right` layout renders in `compact` mode inside an embedded host box
- **THEN** the rail sizes to that container rather than to the viewport, and does not overflow it

#### Scenario: Both slots split the rail evenly

- **WHEN** the sticky rail renders at the `lg` breakpoint or wider
- **THEN** each of the two cover-image slots occupies half the rail's height regardless of the intrinsic dimensions of the source images

## MODIFIED Requirements

### Requirement: Hero gallery with multiple cover images

Each layout preset SHALL declare `heroImageSlots` (how many cover images its hero composition displays) and `supportsCarousel`. A shared hero gallery SHALL render the wishlist's ordered cover-image records into the composition's slots, fill missing slots with the active theme's tinted placeholder, and, when the layout supports a carousel and 2 or more images exist, render prev/next controls with a "Galería · foto N/M" caption. With 0 or 1 images no carousel controls SHALL appear. Placeholder slots SHALL never be filled with stock or sample photography on a published page.

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

#### Scenario: Split image right declares two slots without a carousel

- **WHEN** the `split-image-right` layout preset is resolved
- **THEN** its `heroImageSlots` is 2 and `supportsCarousel` is false

#### Scenario: Split image right with one image fills the second slot with a placeholder

- **WHEN** the `split-image-right` layout renders a wishlist with exactly one cover image
- **THEN** the first rail slot shows that image and the second shows the theme's tinted placeholder, with no carousel controls

### Requirement: Hero shows the wishlist title alone

Every layout's hero composition SHALL present the wishlist's `title` as its heading and SHALL NOT render a second heading or a duplicate name line beneath it. A layout MAY render a single muted event summary line under the title, combining the host name and formatted event date (date only, no time), when its design calls for one; event location, event time and dress code SHALL reach the guest only through the event-details section, not the hero summary line.

#### Scenario: Hero renders the title

- **WHEN** any layout variant renders a wishlist
- **THEN** the hero heading is the wishlist's `title`

#### Scenario: No second heading under the hero title

- **WHEN** any layout variant renders a wishlist
- **THEN** no second heading or duplicate name line renders beneath the hero title

#### Scenario: Summary line permitted where the design calls for one

- **WHEN** a layout whose design includes a summary line, such as `collage-staggered` or `split-image-right`, renders a wishlist that has a host name and event date
- **THEN** a single muted line combining the host name and date (no time, no location) renders beneath the title, and the date still appears in the event-details section alongside location, time and dress code

### Requirement: Layout variants

The system SHALL provide nine layout variants selected by the resolved `layoutId`: `carousel-hero`, `scrapbook-polaroids`, `portrait-frame-split`, `arch-hero-party`, `arch-trio`, `overlap-duo`, `split-image-right`, `collage-staggered`, and `magazine-editorial`. Every variant SHALL compose the shared section components, shared hero CTA behavior, and optional how-it-works drawer, and SHALL honor the required section order, render modes, and purchased-gift rules.

Variants exist in two generations while the layouts migrate. Variants that own their full page composition — currently `collage-staggered` and `split-image-right` — SHALL compose a single shared page shell for their chrome rather than each inlining it, and SHALL be identified by one shared declaration rather than by per-layout conditionals scattered through the page shell. Variants not yet migrated SHALL continue to render through the shared public wishlist body.

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

- **WHEN** `collage-staggered` and `split-image-right` each render in the same mode
- **THEN** their header, centered content wrapper and footer come from the shared shell and are identical, differing only in the body content each supplies

#### Scenario: Unmigrated variants keep the shared body

- **WHEN** any of the seven variants that have not yet migrated renders a wishlist
- **THEN** it continues to render through the shared public wishlist body, unaffected by the shell
