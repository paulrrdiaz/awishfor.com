## MODIFIED Requirements

### Requirement: Arch trio composition

The `arch-trio` layout SHALL render as a self-contained page rather than delegating its body to the shared public wishlist body component. It SHALL compose the shared page shell for its header, centered content wrapper and footer, and SHALL supply its own body content.

Its hero SHALL be arranged as a two-column grid at the `lg` breakpoint and above — a fixed-width 290px media column and a flexible text column — over a diagonal gradient from the theme's accent to its card surface, and SHALL NOT bleed beyond the shared shell's centered content wrapper. Below the `lg` breakpoint the grid SHALL collapse to a single column with the media column rendered first.

The media column SHALL present three circular cover-image slots in an overlapping arc: a large primary slot, a medium slot offset to the lower right, and a small slot offset to the upper right. The medium and small slots SHALL carry a ring in the theme's card color. The large carousel frame SHALL carry a white ring whose responsive thickness matches the medium and small rings. The text column SHALL present, in order, the event-type eyebrow, the wishlist title, the event summary line, the guest welcome section, and the hero CTA group.

Below the hero the layout SHALL render, in the required section order: the event-details cards in their compact presentation, the countdown in the variant selected for the wishlist, the welcome message in its selected variant when one exists, a divider, the gift list message when one exists, the gift-list heading with an inline availability summary, the filtered gift list, and the thank-you message in its selected variant.

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

#### Scenario: Large frame has a white ring

- **WHEN** the `arch-trio` hero renders with either one carousel-eligible image or multiple carousel slides
- **THEN** the large circular frame has a white ring that matches the responsive thickness of the two smaller frame rings

#### Scenario: Gift filter exposes status filters only

- **WHEN** the `arch-trio` layout renders its gift section for a wishlist whose gifts span several categories
- **THEN** the filter row offers all, available, purchased and starred, and no category filters

#### Scenario: Gift list message renders before the heading

- **WHEN** the `arch-trio` layout renders a wishlist with a gift list message
- **THEN** the message renders immediately above the "Lista de regalos" heading

### Requirement: Split image right composition

The `split-image-right` layout SHALL render as a self-contained page rather than delegating its body to the shared public wishlist body component. It SHALL provide its own page header (brand isotype, published status badge, share control), a centered content wrapper constrained to a maximum width, and its own compact footer, matching the composition pattern established by `collage-staggered`.

Its content SHALL be arranged as a two-column grid at the `lg` breakpoint and above: a flexible left column separated from the right column by a border, and a fixed-width right column of 340px. The left column SHALL present, in order, the event-type eyebrow, the wishlist title, the event summary line, the guest welcome section, the hero CTA group, a two-up event-details grid (date and location), the countdown in the variant selected for the wishlist, the welcome message in its selected variant when one exists, a divider, the gift list message when one exists, the gift-list heading, and the filtered gift list. The right column SHALL hold exactly two cover-image slots.

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
- **THEN** the countdown renders in the left column above the welcome message in the variant selected for that wishlist, and no countdown is passed into the gift filter toolbar

#### Scenario: Gift list message renders before the heading

- **WHEN** the `split-image-right` layout renders a wishlist with a gift list message
- **THEN** the message renders immediately above the "Lista de regalos" heading

### Requirement: Required section order

The system SHALL render the public page sections in this order: hero, event details, countdown, welcome-message content, shared CTA group, RSVP, gift list message, gift list, thank-you message, footer. Layout-specific composition MAY colocate the countdown with the welcome-message content; in that case the shared CTA group SHALL follow both. The RSVP section SHALL be present only on a personalized render (one carrying guest context) and SHALL be absent otherwise. Sections whose backing data is absent SHALL be omitted, preserving the relative order of the remaining sections. How-it-works guidance SHALL be drawer content opened from the shared CTA group and SHALL NOT occupy an inline position in the document section order.

#### Scenario: All inline sections render in order

- **WHEN** a wishlist has hero, event details, event date, welcome message, a gift list message, gifts, and a thank-you message
- **THEN** the inline sections appear in the required order from hero through footer
- **AND** the shared CTA group appears after the welcome-message content and any countdown colocated with it
- **AND** no how-it-works section appears between gifts and thank-you content

#### Scenario: Personalized render places RSVP directly before the gift list

- **WHEN** the public wishlist view model carries guest context
- **THEN** the RSVP section renders after the shared CTA group and immediately before the gift list message (or the gift list itself, when no message is set)

#### Scenario: Plain render omits the RSVP section

- **WHEN** the public wishlist view model has no guest context
- **THEN** no RSVP section renders and the gift list message (or the gift list itself, when no message is set) follows the shared CTA group

#### Scenario: Optional sections omitted when data absent

- **WHEN** a wishlist has no event date
- **THEN** the countdown is omitted and the remaining sections keep their order

#### Scenario: How it works respects its toggle

- **WHEN** a wishlist has `showHowItWorks` set to false
- **THEN** the shared CTA group omits the "Cómo funciona" control and no how-it-works drawer content is rendered

#### Scenario: Gift list message omitted when absent

- **WHEN** a wishlist has no gift list message
- **THEN** no gift list message section renders and the gift list keeps its position in the order

### Requirement: Shared section components

The system SHALL provide reusable `WishlistHero`, `Countdown`, `GiftCard`, `GiftGrid`/`GiftList`, `HowItWorksDrawer`, and `WishlistFooter` components consumed by every layout variant, each driven by the public wishlist view model. The `Countdown`, welcome-message, and thank-you-message components SHALL each render the presentation variant selected for the wishlist rather than a single fixed appearance, and SHALL derive all color from the active theme's tokens. A shared gift-list-message component SHALL render immediately before the gift list in every layout variant, including the `collage-staggered` layout and the layouts composed through the shared public wishlist body, regardless of whether that layout also prints a "Lista de regalos" heading; it SHALL render nothing when the wishlist has no gift list message.

#### Scenario: Gift card reflects status

- **WHEN** a `GiftCard` receives a gift with public status `available`, `partial`, or `purchased`
- **THEN** it renders the matching visual state, showing a `Comprado` badge and de-emphasized styling for purchased gifts

#### Scenario: How it works uses default copy

- **WHEN** `HowItWorksDrawer` opens for a Spanish wishlist
- **THEN** it shows the default three-step guest instructions

#### Scenario: Countdown renders its selected variant

- **WHEN** a wishlist has an event date and the `Countdown` section renders
- **THEN** it renders the countdown variant selected for that wishlist, not a fixed accent-card container

#### Scenario: Welcome message renders its selected variant

- **WHEN** a wishlist has a welcome message
- **THEN** it renders the welcome variant selected for that wishlist, not a fixed italic block

#### Scenario: Gift list message renders in every layout

- **WHEN** a wishlist has a gift list message and renders in the `collage-staggered` layout or any layout composed through the shared public wishlist body
- **THEN** the message renders above the gift list even though that layout has no "Lista de regalos" heading

#### Scenario: Gift list message renders nothing when absent

- **WHEN** a wishlist has no gift list message
- **THEN** the shared gift-list-message component renders nothing in any layout
