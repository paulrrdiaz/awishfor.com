## MODIFIED Requirements

### Requirement: Shared section components

The system SHALL provide reusable `WishlistHero`, `Countdown`, `GiftCard`, `GiftGrid`/`GiftList`, `HowItWorksDrawer`, and `WishlistFooter` components consumed by every layout variant, each driven by the public wishlist view model. The `Countdown`, welcome-message, and thank-you-message components SHALL each render the presentation variant selected for the wishlist rather than a single fixed appearance, and SHALL derive all color from the active theme's tokens.

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

### Requirement: Countdown formatting

The system SHALL format the countdown from an event date into guest-facing copy: `Faltan N días` for more than one day remaining, `Falta 1 día` for exactly one day, `Es hoy` for the event day, and the post-event message `Gracias por celebrar con nosotros.` for past events. The countdown SHALL recompute client-side and flip to the post-event message at T-0.

Because the post-event message is a full sentence rather than a short day count, it SHALL render in a variant-neutral container instead of being placed inside a pill or progress-bar presentation. A negative day count SHALL never be displayed in any variant.

#### Scenario: Future event shows day count

- **WHEN** an event date is 44 days in the future
- **THEN** the countdown shows `Faltan 44 días`

#### Scenario: One day remaining is singular

- **WHEN** an event date is exactly one day away
- **THEN** the countdown shows `Falta 1 día`

#### Scenario: Event day shows today copy

- **WHEN** the event date is the current day
- **THEN** the countdown shows `Es hoy`

#### Scenario: Past event shows post-event message

- **WHEN** the event date has passed
- **THEN** the countdown shows `Gracias por celebrar con nosotros.` rather than a negative day count

#### Scenario: Post-event message is not forced into a pill

- **WHEN** the event date has passed and the selected variant is `filled-pill`, `outline-pill`, or `progress-bar`
- **THEN** the post-event message renders in a variant-neutral container rather than inside the pill or progress bar

### Requirement: Split image right composition

The `split-image-right` layout SHALL render as a self-contained page rather than delegating its body to the shared public wishlist body component. It SHALL provide its own page header (brand isotype, published status badge, share control), a centered content wrapper constrained to a maximum width, and its own compact footer, matching the composition pattern established by `collage-staggered`.

Its content SHALL be arranged as a two-column grid at the `lg` breakpoint and above: a flexible left column separated from the right column by a border, and a fixed-width right column of 340px. The left column SHALL present, in order, the event-type eyebrow, the wishlist title, the event summary line, the guest welcome section, the hero CTA group, a two-up event-details grid (date and location), the countdown in the variant selected for the wishlist, the welcome message in its selected variant when one exists, a divider, the gift-list heading, and the filtered gift list. The right column SHALL hold exactly two cover-image slots.

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
