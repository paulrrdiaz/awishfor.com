## ADDED Requirements

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

The system SHALL provide reusable `WishlistHero`, `Countdown`, `GiftCard`, `GiftGrid`/`GiftList`, `HowItWorks`, and `WishlistFooter` components consumed by every layout variant, each driven by the public wishlist view model.

#### Scenario: Gift card reflects status

- **WHEN** a `GiftCard` receives a gift with public status `available`, `partial`, or `purchased`
- **THEN** it renders the matching visual state, showing a `Comprado` badge and de-emphasized styling for purchased gifts

#### Scenario: How it works uses default copy

- **WHEN** `HowItWorks` renders for a Spanish wishlist
- **THEN** it shows the default three-step guest instructions

### Requirement: Countdown formatting

The system SHALL format the countdown from an event date into guest-facing copy: `Faltan N días` for more than one day remaining, `Falta 1 día` for exactly one day, `Es hoy` for the event day, and a closed message for past events.

#### Scenario: Future event shows day count

- **WHEN** an event date is 44 days in the future
- **THEN** the countdown shows `Faltan 44 días`

#### Scenario: One day remaining is singular

- **WHEN** an event date is exactly one day away
- **THEN** the countdown shows `Falta 1 día`

#### Scenario: Event day shows today copy

- **WHEN** the event date is the current day
- **THEN** the countdown shows `Es hoy`

#### Scenario: Past event shows closed message

- **WHEN** the event date has passed
- **THEN** the countdown shows the closed message rather than a negative day count

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
