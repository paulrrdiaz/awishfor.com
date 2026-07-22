# public-wishlist-layout Specification

## Purpose
Defines public wishlist page layout composition, shared section components, section order, countdown behavior, render modes, and responsive layout behavior.
## Requirements
### Requirement: Public wishlist page shell

The system SHALL provide a `PublicWishlistPage` component that takes a published or owner-preview wishlist view model and renders the full public page, resolving theme, layout, font, and button presets from the wishlist's `themeId`, `layoutId`, `fontPairing`, and `buttonStyle` and applying them as scoped CSS variables that do not affect the dashboard.

#### Scenario: Page resolves presets from view model

- **WHEN** `PublicWishlistPage` receives a wishlist with a known `layoutId`, `themeId`, `fontPairing`, and `buttonStyle`
- **THEN** it renders the matching layout variant with the matching theme variables, font classes, and button style applied within a scope that does not leak to the rest of the app

#### Scenario: Unknown or missing preset ids fall back to defaults

- **WHEN** a wishlist's preset id is null or does not match any preset
- **THEN** the page renders the default preset for that dimension without error

### Requirement: Required section order

The system SHALL render the public page sections in this order: hero, event details, countdown, welcome message, gift list, how it works, thank-you message, footer. Sections whose backing data is absent SHALL be omitted, preserving the relative order of the remaining sections.

#### Scenario: All sections render in order

- **WHEN** a wishlist has hero, event details, event date, welcome message, gifts, how-it-works enabled, and a thank-you message
- **THEN** the sections appear in the required order from hero through footer

#### Scenario: Optional sections omitted when data absent

- **WHEN** a wishlist has no event date and no welcome message
- **THEN** the countdown and welcome-message sections are omitted and the remaining sections keep their order

#### Scenario: How it works respects its toggle

- **WHEN** a wishlist has `showHowItWorks` set to false
- **THEN** the how-it-works section is not rendered

### Requirement: Layout variants

The system SHALL provide `GridWishlistLayout`, `EditorialWishlistLayout`, and `MinimalWishlistLayout`, selected by the resolved `layoutId`, that arrange the shared section components according to the layout preset's gift columns and gift card style.

#### Scenario: Layout selected by id

- **WHEN** the resolved layout id is `grid`, `editorial`, or `minimal`
- **THEN** the corresponding layout variant renders the gift list with that preset's column count and card style

#### Scenario: Minimal layout renders gifts as a list

- **WHEN** the resolved layout is `minimal`
- **THEN** gifts render as single-column rows without category dividers

### Requirement: Shared section components

The system SHALL provide reusable `WishlistHero`, `Countdown`, `GiftCard`, `GiftGrid`/`GiftList`, `HowItWorks`, and `WishlistFooter` components consumed by every layout variant, each driven by the public wishlist view model. The `Countdown` component SHALL render its label and remaining-time text inside a tinted, rounded accent-card container rather than as plain unstyled text. The welcome-message block SHALL render `wishlist.welcomeMessage` in italic styling and, when `wishlist.displayName` is present, SHALL render a separate attribution line below it reading `— {displayName}`.

#### Scenario: Gift card reflects status

- **WHEN** a `GiftCard` receives a gift with public status `available`, `partial`, or `purchased`
- **THEN** it renders the matching visual state, showing a `Comprado` badge and de-emphasized styling for purchased gifts

#### Scenario: How it works uses default copy

- **WHEN** `HowItWorks` renders for a Spanish wishlist
- **THEN** it shows the default three-step guest instructions

#### Scenario: Countdown renders as a boxed accent card

- **WHEN** a wishlist has an event date and the `Countdown` section renders
- **THEN** the countdown label and remaining-time text render inside a tinted rounded accent-card container, not as a bare line of text

#### Scenario: Welcome message renders with attribution

- **WHEN** a wishlist has a `welcomeMessage` and a `displayName`
- **THEN** the welcome-message block renders the message in italic styling followed by a separate `— {displayName}` attribution line

#### Scenario: Welcome message renders without attribution when displayName is absent

- **WHEN** a wishlist has a `welcomeMessage` but no `displayName`
- **THEN** the welcome-message block renders the italic message with no attribution line

### Requirement: Countdown formatting

The system SHALL format the countdown from an event date into guest-facing copy: `Faltan N días` for more than one day remaining, `Falta 1 día` for exactly one day, `Es hoy` for the event day, and the post-event message `Gracias por celebrar con nosotros.` for past events. The countdown SHALL recompute client-side and flip to the post-event message at T-0.

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

### Requirement: Render modes

The system SHALL support three render modes — `full`, `preview`, and `compact`. In `full` mode the page renders all sections with active guest actions. In `preview` mode the page renders an owner preview banner and disables guest purchase actions. In `compact` mode the page renders a trimmed version suitable for embedding as a landing-page example.

#### Scenario: Preview mode shows banner and disables actions

- **WHEN** `PublicWishlistPage` renders in `preview` mode for an owner draft
- **THEN** it shows the preview banner and gift actions are disabled

#### Scenario: Full mode enables actions

- **WHEN** the page renders in `full` mode for a published wishlist
- **THEN** no preview banner is shown and gift actions are enabled

#### Scenario: Compact mode trims sections

- **WHEN** the page renders in `compact` mode
- **THEN** it renders a reduced set of sections suitable for a landing-page preview without guest actions

### Requirement: Mobile-first rendering

The system SHALL render the public page mobile-first, with multi-column gift layouts applying only at larger breakpoints.

#### Scenario: Single column on small screens

- **WHEN** the public page renders at a mobile viewport width
- **THEN** gifts stack in a single column regardless of the layout preset's desktop column count

### Requirement: Event details section cards

The public wishlist page SHALL render an event-details section composed of up to three cards — Fecha (event date/time), Lugar (event location), and Código de vestimenta (dress code). Each card SHALL render only when its backing data is present; cards with empty data SHALL be omitted, and the whole section SHALL be omitted when all three are empty.

#### Scenario: All three cards render when data present

- **WHEN** a wishlist has an event date, an event location, and a dress code
- **THEN** the event-details section renders Fecha, Lugar, and Código de vestimenta cards

#### Scenario: Empty cards are hidden

- **WHEN** a wishlist has an event date but no event location and no dress code
- **THEN** only the Fecha card renders and the Lugar and Código de vestimenta cards are omitted

#### Scenario: Section omitted when no event details

- **WHEN** a wishlist has no event date, no event location, and no dress code
- **THEN** the event-details section is not rendered

### Requirement: Purchased gift de-emphasis and ordering

The public wishlist SHALL visually de-emphasize fully purchased gifts by rendering them at approximately 60% opacity with a line-through on the gift name, and SHALL sort purchased gifts below gifts that still have remaining units within the default order.

#### Scenario: Purchased gift is de-emphasized

- **WHEN** a gift's public status is `purchased`
- **THEN** its card renders at ~60% opacity with the gift name struck through

#### Scenario: Purchased gifts sort below available gifts

- **WHEN** the gift list renders in the default recommended order
- **THEN** fully purchased gifts appear after gifts that still have remaining units

### Requirement: HeroCinematic hero content and contrast

The `HeroCinematicLayout` hero SHALL show an eyebrow combining the event type label and the formatted event date (joined by ` · `) when an event date is present, falling back to the event type label alone when it is not. The hero subtitle line SHALL show `wishlist.eventLocation` when present, falling back to `wishlist.displayName` when `eventLocation` is absent, and SHALL render nothing when both are absent. The hero's call-to-action buttons SHALL render in a neutral on-photo treatment (legible over arbitrary cover photography) independent of the active theme's primary color.

#### Scenario: Eyebrow includes event date

- **WHEN** `HeroCinematicLayout` renders for a wishlist with an event type and an event date
- **THEN** the eyebrow shows the event type label and the formatted date joined by ` · `

#### Scenario: Eyebrow omits date when absent

- **WHEN** `HeroCinematicLayout` renders for a wishlist with no event date
- **THEN** the eyebrow shows only the event type label

#### Scenario: Subtitle prefers event location

- **WHEN** `HeroCinematicLayout` renders for a wishlist with both `eventLocation` and `displayName` set
- **THEN** the hero subtitle shows `eventLocation`

#### Scenario: Subtitle falls back to display name

- **WHEN** `HeroCinematicLayout` renders for a wishlist with no `eventLocation` but a `displayName`
- **THEN** the hero subtitle shows `displayName`

#### Scenario: Subtitle omitted when both fields absent

- **WHEN** `HeroCinematicLayout` renders for a wishlist with no `eventLocation` and no `displayName`
- **THEN** no hero subtitle line renders

#### Scenario: Hero CTAs stay legible over photography

- **WHEN** `HeroCinematicLayout` renders its call-to-action buttons over a cover photo
- **THEN** the buttons render in the neutral on-photo treatment regardless of the wishlist's active theme

