# public-wishlist-layout Specification

## Purpose
Defines public wishlist page layout composition, shared section components, section order, countdown behavior, render modes, and responsive layout behavior.
## Requirements
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
- **THEN** it shows the default three-step guest instructions

#### Scenario: Countdown renders as a boxed accent card

- **WHEN** a wishlist has an event date and the `Countdown` section renders
- **THEN** the countdown label and remaining-time text render inside a tinted rounded accent-card container, not as a bare line of text

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

#### Scenario: Every layout renders the section

- **WHEN** each of the nine layout variants renders a wishlist that has event details
- **THEN** the event-details section appears in all nine

### Requirement: Purchased gift de-emphasis and ordering

The public wishlist SHALL visually de-emphasize fully purchased gifts by rendering them at approximately 60% opacity with a line-through on the gift name, and SHALL sort purchased gifts below gifts that still have remaining units within the default order.

#### Scenario: Purchased gift is de-emphasized

- **WHEN** a gift's public status is `purchased`
- **THEN** its card renders at ~60% opacity with the gift name struck through

#### Scenario: Purchased gifts sort below available gifts

- **WHEN** the gift list renders in the default recommended order
- **THEN** fully purchased gifts appear after gifts that still have remaining units

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

### Requirement: Hero shows the wishlist title alone

Every layout's hero composition SHALL present the wishlist's `title` as its heading and SHALL NOT render a separate name or subtitle line beneath it. Contextual information that previously shared the hero — date, venue and dress code — reaches the guest through the event-details section instead.

#### Scenario: Hero renders the title

- **WHEN** any layout variant renders a wishlist
- **THEN** the hero heading is the wishlist's `title`

#### Scenario: No subtitle line under the hero heading

- **WHEN** any layout variant renders a wishlist that has an event location and a date
- **THEN** the hero renders no subtitle line, and the location and date appear in the event-details section
