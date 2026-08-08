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

### Requirement: Standalone wishlist branded footer

The system SHALL end every standalone published wishlist, personalized guest wishlist, and owner draft-preview wishlist with the reusable A Wish For footer body from the marketing page. The body SHALL include the established brand logo and description, product and occasion navigation, legal and contact navigation, free-service callout, and copyright treatment. It SHALL NOT include the marketing newsletter band, email field, or newsletter submit action.

#### Scenario: Published wishlist shows branded body without newsletter

- **WHEN** a published wishlist renders as a standalone page
- **THEN** the A Wish For logo/navigation/legal footer body appears after the wishlist content
- **AND** no "Ideas para tu próximo evento" newsletter band, email field, or "Unirme" action appears

#### Scenario: Personalized wishlist uses the same footer

- **WHEN** a personalized `/w/[slug]/[guestSlug]` wishlist renders
- **THEN** it ends with the same branded footer body as the non-personalized public route

#### Scenario: Owner draft preview uses the standalone footer

- **WHEN** a wishlist owner opens an unpublished wishlist at its standalone public URL
- **THEN** the preview banner and disabled guest actions remain
- **AND** the page ends with the expanded branded footer body

#### Scenario: Thank-you message remains before the footer

- **WHEN** a standalone wishlist has a thank-you message
- **THEN** the thank-you message renders after the gift list and immediately before the branded footer

### Requirement: Wishlist footer inherits the selected public theme

The standalone wishlist footer SHALL render inside the wishlist's `PublicThemeProvider` scope and SHALL derive its surfaces, foregrounds, borders, focus treatments, and typography from the selected public theme's semantic variables and resolved public fonts. It SHALL NOT depend on the fixed `.marketing-theme` palette, global app tokens outside the scope, or per-theme footer class names.

#### Scenario: Footer changes with selected theme

- **WHEN** two standalone wishlists use different `themeId` values
- **THEN** each footer resolves its accent surface, foreground, border, and font styling from its own `.public-theme` wrapper

#### Scenario: Theme scope does not leak

- **WHEN** a themed wishlist footer renders
- **THEN** it does not mutate `:root`, the dashboard theme, the marketing theme, or another public preview's variables

#### Scenario: Missing theme uses the default palette

- **WHEN** a standalone wishlist has a null or unknown `themeId`
- **THEN** its footer uses the same default resolved public theme as the rest of that wishlist

### Requirement: Footer presentation follows render surface

The public wishlist shell SHALL distinguish standalone pages from embedded previews independently of its full, preview, and compact interaction modes. Standalone full and standalone owner-preview pages SHALL render the expanded branded footer. Embedded wizard and dashboard previews SHALL retain a compact footer presentation suitable for their constrained pane. Compact marketing-demo rendering SHALL omit the footer. All nine public layout variants SHALL receive footer presentation from the shared page shell rather than rendering independent footer implementations.

#### Scenario: Embedded preview stays compact

- **WHEN** a wishlist renders inside a wizard or dashboard preview pane
- **THEN** it does not render the expanded logo/navigation/legal footer body
- **AND** it retains a compact public footer treatment

#### Scenario: Compact demo omits footer

- **WHEN** a wishlist renders in compact marketing-demo mode
- **THEN** neither the expanded nor compact wishlist footer renders

#### Scenario: Every layout receives the standalone footer

- **WHEN** each of the nine public layout variants renders on a standalone wishlist route
- **THEN** the shared page shell appends the same expanded footer after the layout content

#### Scenario: Collage layout does not keep a bespoke footer

- **WHEN** `collage-staggered` renders in any public-page surface
- **THEN** its footer behavior is selected by the shared public page shell identically to the other eight layouts

### Requirement: Wishlist footer navigation resolves outside the wishlist route

Links in the shared footer body that target marketing-page sections SHALL use root-qualified fragments, while creation and legal links SHALL retain absolute application paths, so every destination works when activated from `/w/*`.

#### Scenario: Product navigation reaches the marketing page

- **WHEN** a guest activates a footer link for "Cómo funciona", "Temas y estilos", "Ver ejemplos", or "Preguntas frecuentes" from a wishlist route
- **THEN** navigation targets the matching section on `/` rather than a nonexistent fragment within `/w/*`

#### Scenario: Occasion and legal navigation retains working routes

- **WHEN** a guest activates an occasion, privacy, terms, or contact destination from the wishlist footer
- **THEN** occasion links target `/create`, legal links target `/privacy` or `/terms`, and contact opens the configured support-email draft

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

