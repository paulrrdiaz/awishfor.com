## ADDED Requirements

### Requirement: How-it-works drawer interaction

When `showHowItWorks` is enabled, the public wishlist SHALL expose a “Cómo funciona” button in the shared hero CTA group. Activating it SHALL open a ShadCN/Vaul bottom drawer at every viewport width without changing the page URL or scroll position. The drawer SHALL be full-width on narrow screens, centered with a constrained width on wider screens, and SHALL include a drag handle, close control, accessible title and description, three numbered instruction rows, and a full-width `Entendido` close action.

The drawer SHALL be dismissible through its close control, `Entendido` action, Escape key, backdrop interaction, and downward swipe. Focus SHALL move into the modal interaction while open and return to the triggering “Cómo funciona” button after dismissal.

#### Scenario: Hero control opens the drawer

- **WHEN** a guest activates the “Cómo funciona” button
- **THEN** a bottom drawer opens over the current wishlist without hash navigation or page scrolling

#### Scenario: Drawer presents the approved guest steps

- **WHEN** the how-it-works drawer is open for a Spanish wishlist
- **THEN** it shows “¿Cómo funciona?” and the three steps “Elige un regalo”, “Márcalo como regalado”, and “¡Listo!” with the approved descriptions

#### Scenario: Guest acknowledges the guidance

- **WHEN** the guest activates `Entendido`
- **THEN** the drawer closes and focus returns to the “Cómo funciona” trigger

#### Scenario: Standard modal dismissal works

- **WHEN** the guest uses the close control, Escape key, backdrop, or downward swipe
- **THEN** the drawer closes without navigating or changing wishlist data

#### Scenario: Desktop retains bottom-drawer presentation

- **WHEN** the drawer opens at a desktop viewport width
- **THEN** it remains bottom-anchored and centered with a constrained width rather than changing into a centered dialog

### Requirement: How-it-works drawer preserves public theme scope

The how-it-works drawer portal SHALL mount within the `.public-theme` instance that contains its trigger. Its surface, typography, border, numbered markers, closing action, and focus treatment SHALL resolve from that wishlist’s scoped semantic theme variables and SHALL NOT fall back to the dashboard/root palette or another public preview’s theme.

#### Scenario: Drawer inherits the triggering wishlist theme

- **WHEN** a how-it-works drawer opens from a themed public wishlist
- **THEN** its portalled content is contained by that wishlist’s `.public-theme` scope and uses that theme’s semantic colors and fonts

#### Scenario: Multiple previews remain isolated

- **WHEN** two differently themed public wishlist previews exist on the same page and the second preview opens its drawer
- **THEN** the drawer inherits only the second preview’s theme and does not mutate global or first-preview theme values

## MODIFIED Requirements

### Requirement: Required section order

The system SHALL render the public page sections in this order: hero, event details, countdown, welcome message, gift list, thank-you message, footer. Sections whose backing data is absent SHALL be omitted, preserving the relative order of the remaining sections. How-it-works guidance SHALL be drawer content opened from the hero and SHALL NOT occupy an inline position in the document section order.

#### Scenario: All inline sections render in order

- **WHEN** a wishlist has hero, event details, event date, welcome message, gifts, and a thank-you message
- **THEN** the inline sections appear in the required order from hero through footer without a how-it-works section between gifts and thank-you content

#### Scenario: Optional sections omitted when data absent

- **WHEN** a wishlist has no event date and no welcome message
- **THEN** the countdown and welcome-message sections are omitted and the remaining sections keep their order

#### Scenario: How it works respects its toggle

- **WHEN** a wishlist has `showHowItWorks` set to false
- **THEN** neither the “Cómo funciona” hero control nor how-it-works drawer content is rendered

### Requirement: Layout variants

The system SHALL provide nine layout variants selected by the resolved `layoutId`: `carousel-hero`, `scrapbook-polaroids`, `portrait-frame-split`, `arch-hero-party`, `arch-trio`, `overlap-duo`, `split-image-right`, `collage-staggered`, and `magazine-editorial`. Every variant SHALL compose the shared section components, shared hero CTA behavior, and optional how-it-works drawer, and SHALL honor the required section order, render modes, and purchased-gift rules.

#### Scenario: Layout selected by id

- **WHEN** the resolved layout id matches any of the nine variants
- **THEN** the corresponding layout component renders with its hero composition from the design canvas

#### Scenario: Every layout composes the shared drawer trigger

- **WHEN** any of the nine layout variants renders a non-compact wishlist with `showHowItWorks` enabled
- **THEN** its shared hero CTA group exposes the same “Cómo funciona” drawer interaction without an inline how-it-works section

#### Scenario: Retired layout ids fall back

- **WHEN** a wishlist references a retired layout id such as `grid` or `hero-cinematic`
- **THEN** the default layout renders without error

### Requirement: Shared section components

The system SHALL provide reusable `WishlistHero`, `Countdown`, `GiftCard`, `GiftGrid`/`GiftList`, `HowItWorksDrawer`, and `WishlistFooter` components consumed by every layout variant, each driven by the public wishlist view model. The `Countdown` component SHALL render its label and remaining-time text inside a tinted, rounded accent-card container rather than as plain unstyled text. The welcome-message block SHALL render `wishlist.welcomeMessage` in italic styling.

#### Scenario: Gift card reflects status

- **WHEN** a `GiftCard` receives a gift with public status `available`, `partial`, or `purchased`
- **THEN** it renders the matching visual state, showing a `Comprado` badge and de-emphasized styling for purchased gifts

#### Scenario: How it works uses default copy

- **WHEN** `HowItWorksDrawer` opens for a Spanish wishlist
- **THEN** it shows the approved default three-step guest instructions

#### Scenario: Countdown renders as a boxed accent card

- **WHEN** a wishlist has an event date and the `Countdown` section renders
- **THEN** the countdown label and remaining-time text render inside a tinted rounded accent-card container, not as a bare line of text

### Requirement: Render modes

The system SHALL support three render modes — `full`, `preview`, and `compact`. In `full` mode the page renders all inline sections with active guest actions and exposes the optional informational how-it-works drawer. In `preview` mode the page renders an owner preview banner, disables guest purchase actions, and allows the optional informational drawer to be previewed. In `compact` mode the page renders a trimmed version suitable for embedding as a landing-page example and omits hero CTAs and drawer content.

#### Scenario: Preview mode shows banner and disables actions

- **WHEN** `PublicWishlistPage` renders in `preview` mode for an owner draft
- **THEN** it shows the preview banner, gift actions are disabled, and an enabled how-it-works drawer remains informationally interactive

#### Scenario: Full mode enables actions

- **WHEN** the page renders in `full` mode for a published wishlist
- **THEN** no preview banner is shown, gift actions are enabled, and the enabled how-it-works drawer can open from the hero

#### Scenario: Compact mode trims sections

- **WHEN** the page renders in `compact` mode
- **THEN** it renders a reduced set of sections without guest actions, hero CTAs, or how-it-works drawer content
