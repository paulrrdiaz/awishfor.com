## MODIFIED Requirements

### Requirement: How-it-works drawer interaction

When `showHowItWorks` is enabled, the public wishlist SHALL expose a “Cómo funciona” button in the shared CTA group positioned with the welcome-message content rather than in the hero title block. Activating it SHALL open a ShadCN/Vaul bottom drawer at every viewport width without changing the page URL or scroll position. The drawer SHALL be full-width on narrow screens, centered with a constrained width on wider screens, and SHALL include a drag handle, close control, accessible title and description, three numbered instruction rows, and a full-width `Entendido` close action.

The drawer SHALL be dismissible through its close control, `Entendido` action, Escape key, backdrop interaction, and downward swipe. Focus SHALL move into the modal interaction while open and return to the triggering “Cómo funciona” button after dismissal.

#### Scenario: Hero control opens the drawer

- **WHEN** a guest activates the “Cómo funciona” button beside the welcome-message content
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

### Requirement: Required section order

The system SHALL render the public page sections in this order: hero, event details, countdown, welcome-message content, shared CTA group, RSVP, gift list, thank-you message, footer. Layout-specific composition MAY colocate the countdown with the welcome-message content; in that case the shared CTA group SHALL follow both. The RSVP section SHALL be present only on a personalized render (one carrying guest context) and SHALL be absent otherwise. Sections whose backing data is absent SHALL be omitted, preserving the relative order of the remaining sections. How-it-works guidance SHALL be drawer content opened from the shared CTA group and SHALL NOT occupy an inline position in the document section order.

#### Scenario: All inline sections render in order

- **WHEN** a wishlist has hero, event details, event date, welcome message, gifts, and a thank-you message
- **THEN** the inline sections appear in the required order from hero through footer
- **AND** the shared CTA group appears after the welcome-message content and any countdown colocated with it
- **AND** no how-it-works section appears between gifts and thank-you content

#### Scenario: Personalized render places RSVP directly before the gift list

- **WHEN** the public wishlist view model carries guest context
- **THEN** the RSVP section renders after the shared CTA group and immediately before the gift list

#### Scenario: Plain render omits the RSVP section

- **WHEN** the public wishlist view model has no guest context
- **THEN** no RSVP section renders and the gift list follows the shared CTA group

#### Scenario: Optional sections omitted when data absent

- **WHEN** a wishlist has no event date
- **THEN** the countdown is omitted and the remaining sections keep their order

#### Scenario: How it works respects its toggle

- **WHEN** a wishlist has `showHowItWorks` set to false
- **THEN** the shared CTA group omits the “Cómo funciona” control and no how-it-works drawer content is rendered

### Requirement: Layout variants

The system SHALL provide nine layout variants selected by the resolved `layoutId`: `carousel-hero`, `scrapbook-polaroids`, `portrait-frame-split`, `arch-hero-party`, `arch-trio`, `overlap-duo`, `split-image-right`, `collage-staggered`, and `magazine-editorial`. Every variant SHALL compose the shared section components, shared CTA behavior, and optional how-it-works drawer, and SHALL honor the required section order, render modes, and purchased-gift rules.

Variants exist in two generations while the layouts migrate. Variants that own their full page composition — currently `collage-staggered`, `split-image-right`, and `arch-trio` — SHALL compose a single shared page shell for their chrome rather than each inlining it, and SHALL be identified by one shared declaration rather than by per-layout conditionals scattered through the page shell. Variants not yet migrated SHALL continue to render through the shared public wishlist body.

The shared shell SHALL own the mode-dependent outer wrapper, the page header (brand isotype, published status badge, share control), the centered content wrapper, the compact footer, and a per-mode viewport top offset published for layouts that position content against the viewport. It SHALL NOT own section order or gift rendering; a layout SHALL supply its own body content.

#### Scenario: Layout selected by id

- **WHEN** the resolved layout id matches any of the nine variants
- **THEN** the corresponding layout component renders with its hero composition from the design canvas

#### Scenario: Every layout composes the shared drawer trigger

- **WHEN** any of the nine layout variants renders a non-compact wishlist
- **THEN** `Ver regalos disponibles` appears after the welcome-message content and any countdown colocated with it rather than in the hero title block
- **AND** `Cómo funciona` appears in the same group when enabled

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

### Requirement: Hero shows the wishlist title alone

Every layout's hero composition SHALL present the wishlist's `title` as its only heading and MAY render the wishlist's optional `subtitle` as supporting text directly beneath it. The subtitle SHALL NOT be marked up as a second heading or repeat the wishlist name. When the subtitle is null or empty, the hero SHALL omit the subtitle element and its reserved spacing. A layout MAY additionally render a single muted event summary line under the title block, combining the host name and formatted event date (date only, no time), when its design calls for one; event location, event time and dress code SHALL reach the guest only through the event-details section, not the hero summary line.

#### Scenario: Hero renders the title

- **WHEN** any layout variant renders a wishlist with a subtitle in full, preview, or compact mode
- **THEN** the hero heading is the wishlist's `title`
- **AND** the subtitle renders as supporting text directly beneath the heading

#### Scenario: No second heading under the hero title

- **WHEN** a layout renders a subtitle
- **THEN** the subtitle is not a heading and does not duplicate the wishlist title

#### Scenario: Missing subtitle leaves no gap

- **WHEN** any layout variant renders a wishlist without a subtitle
- **THEN** no subtitle element or subtitle-specific spacing is rendered

#### Scenario: Summary line permitted where the design calls for one

- **WHEN** a layout whose design includes a summary line, such as `collage-staggered` or `split-image-right`, renders a wishlist that has a host name and event date
- **THEN** a single muted line combining the host name and date (no time, no location) renders beneath the title block, and the date still appears in the event-details section alongside location, time and dress code
