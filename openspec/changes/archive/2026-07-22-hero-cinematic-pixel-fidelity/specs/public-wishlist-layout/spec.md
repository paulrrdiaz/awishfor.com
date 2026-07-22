## MODIFIED Requirements

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

## ADDED Requirements

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
