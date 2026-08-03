## MODIFIED Requirements

### Requirement: Landing section structure and order

The landing page SHALL render all sections from the design canvas (`A Wish For.dc.html` §5) in this exact order: navigation, hero, "Elige tu ocasión" occasion picker, "¿Por qué A Wish For?" benefits, "Cómo funciona", "Casos de uso", "Tiendas aliadas", "Temas" swatches, "Ejemplo real" preview, guest list-finder, FAQ, final CTA, footer.

#### Scenario: All sections present in order

- **WHEN** the landing renders
- **THEN** the sections appear top-to-bottom as: Nav → Hero → Elige tu ocasión → ¿Por qué? → Cómo funciona → Casos de uso → Tiendas aliadas → Temas → Ejemplo real → Buscar lista → FAQ → CTA final → Footer

#### Scenario: Occasion picker content

- **WHEN** the "Elige tu ocasión" section renders
- **THEN** it shows four occasion cards (Baby Shower, Boda, Cumpleaños, Nuevo hogar), each with its subtitle and a "Crear mi lista →" call to action
- **AND** a single "wishlist general" affordance is rendered as a grid child of the same card container
- **AND** at `lg` and above that affordance renders as the centered "¿Otra ocasión? Crea una wishlist general →" text link below the cards

#### Scenario: Occasion picker hosts the wishlist-card carousel

- **WHEN** the "Elige tu ocasión" section renders
- **THEN** it also renders the wishlist-card carousel previously shown inside the mobile hero
- **AND** the carousel retains its autoplay, looping, and position-dot controls
- **AND** no new top-level section is introduced to the landing section order

#### Scenario: Occasion picker CTA seeds the wizard

- **WHEN** a visitor clicks a "Crear mi lista →" card CTA
- **THEN** they navigate to `/create` with that event type pre-selected on step 1

#### Scenario: Benefits row content

- **WHEN** the "¿Por qué A Wish For?" section renders
- **THEN** it shows exactly four cards: "Todo en un lugar", "Gratis, sin comisiones", "Enlace y QR gratis", "Listas sugeridas"
- **AND** each card leads with a photographic header and an overlapping rounded icon badge

#### Scenario: How-it-works steps

- **WHEN** the "Cómo funciona" section renders
- **THEN** it shows five numbered steps in a vertical timeline: "Elige el tipo de evento", "Ponle nombre y elige tu enlace", "Elige tu tema y personalízalo", "Agrega tus regalos", "Publica y comparte"
- **AND** each step pairs its number with a thumbnail and a supporting line describing the matching wizard step

#### Scenario: Use-case pills

- **WHEN** the "Casos de uso" section renders
- **THEN** it shows five event cards: Baby Shower, Cumpleaños, Boda, Nuevo hogar, Wishlist general

#### Scenario: Theme swatches

- **WHEN** the "Temas" section renders
- **THEN** it shows a swatch for every entry in the shared public theme config (`src/config/public-themes.ts`), not a hardcoded subset

#### Scenario: FAQ question set

- **WHEN** the FAQ section renders
- **THEN** it shows exactly five questions: "¿Qué es A Wish For?", "¿Cuánto cuesta?", "¿Cómo se reciben los regalos?", "¿Funciona con cualquier tienda?", "¿Necesito crear una cuenta?"
- **AND** the first question is expanded on load
- **AND** a support panel offering "Contactar soporte" accompanies the question list

#### Scenario: Newsletter band

- **WHEN** the footer renders
- **THEN** an "Ideas para tu próximo evento" band with the subtitle "Un correo al mes, sin spam." precedes the footer body
- **AND** the band carries an email field and an "Unirme" submit control
- **AND** the footer body below it retains its existing light background, columns, and copyright line

### Requirement: Example preview reuses real public components

The "Ejemplo real" section SHALL render a lightweight, server-rendered marketing preview from `src/config/demo-wishlist.ts`. It SHALL reuse shared public-wishlist presentation contracts or server-safe presentational primitives where that prevents visual drift, but it MUST NOT import the full layout registry, purchase flows, modal code, or client-side gift-card behavior.

The shared presentation contract MAY carry gift purchase state, category, store, availability counts, countdown data and cover collage imagery as **data for static presentation**. Carrying that data SHALL NOT be read as permission to import purchase flows or interactive gift behaviour.

#### Scenario: Lightweight public preview is used

- **WHEN** the example section renders
- **THEN** it displays the configured demo title, event metadata, hero treatment, and representative gifts from `src/config/demo-wishlist.ts`
- **AND** it does not mount `PublicWishlistPage`

#### Scenario: Preview composition matches the canvas

- **WHEN** the example section renders at `lg` and above
- **THEN** it shows a status topbar, a gradient event header, a staggered three-photograph collage, a countdown block, an availability summary, and a vertically scrolling gift grid with a fade mask
- **AND** a "Ver ejemplo completo →" action follows the card

#### Scenario: Gift cards show purchase state statically

- **WHEN** the preview's gift grid renders
- **THEN** gifts display their priority, availability, partial-purchase and purchased states, with purchased gifts struck through and dimmed
- **AND** those states are rendered from fixture data with no client-side purchase behavior attached

#### Scenario: Preview remains non-interactive

- **WHEN** a visitor inspects or activates a gift in the marketing preview
- **THEN** no purchase modal or reservation mutation is available
- **AND** no purchase-flow JavaScript is loaded for the preview

#### Scenario: Preview prices follow the product currency

- **WHEN** gift prices render in the preview
- **THEN** they are formatted through the shared money formatter in the currency the creation wizard produces
- **AND** they are not hardcoded to the currency shown in the design canvas

#### Scenario: Preview remains visually faithful

- **WHEN** shared public presentation fields or tokens change
- **THEN** the marketing preview consumes the same server-safe contract where applicable
- **AND** a focused visual or component test detects unintended divergence

### Requirement: Section content adapts per breakpoint

The hero and its occasion proof rail SHALL render the shorter canvas mobile copy below the `lg` breakpoint and the exact H2b desktop copy at `lg` and above, in both cases server-rendered without client-side viewport detection or hydration-dependent copy swaps.

All sections below the first fold SHALL render a single copy set — the approved desktop strings — at every viewport. Paired visibility-toggled copy nodes SHALL NOT be used to vary their text by breakpoint.

Structural omissions specified by the canvas mobile frame, such as tiles that drop a subtitle or an inline call to action, are layout decisions and are not governed by this requirement.

#### Scenario: H2b desktop hero copy renders server-side

- **WHEN** the hero renders at `lg` or above
- **THEN** the exact H2b eyebrow, headline, body, CTA, and trust-line copy is present in the initial server-rendered HTML

#### Scenario: Shorter mobile hero copy renders server-side

- **WHEN** the hero renders below `lg`
- **THEN** its shorter copy is present in the initial server-rendered HTML and is not swapped after hydration

#### Scenario: Initial occasion rail copy renders server-side

- **WHEN** the hero renders at any viewport
- **THEN** the first occasion's proof-rail copy is present in the initial server-rendered HTML
- **AND** later occasion data does not create additional initial image requests or duplicate accessible rails

#### Scenario: Later sections carry one copy set

- **WHEN** a section below the first fold renders at any viewport
- **THEN** each heading, body and call-to-action string appears exactly once in the server-rendered HTML
- **AND** no duplicate string is present behind a breakpoint visibility utility

### Requirement: Marketing typography is route-scoped

The marketing route SHALL load only the font families and weights used by the approved landing design: Lora for headings, Inter for body copy, and JetBrains Mono for eyebrow and label treatments. The public-wishlist font catalog SHALL NOT be imported or preloaded by the anonymous marketing route.

#### Scenario: Marketing font resources are isolated

- **WHEN** the anonymous `/` route loads
- **THEN** its font requests are limited to the Lora, Inter and JetBrains Mono resources required by visible marketing content
- **AND** no Playfair Display, Cormorant Garamond, DM Serif Display, Nunito, Figtree, Source Serif 4, or Karla resource is preloaded

#### Scenario: Eyebrows use the monospace treatment

- **WHEN** a section eyebrow or footer column label renders
- **THEN** it uses the JetBrains Mono family with the canvas letter-spacing and uppercase transform

#### Scenario: Added family does not become a critical resource

- **WHEN** the initial document head is inspected
- **THEN** the monospace family is declared as a self-hosted subset `@font-face` with a non-blocking display strategy
- **AND** the route's preloaded font count remains within the landed performance budget

#### Scenario: Public wishlist typography remains available

- **WHEN** a public wishlist uses a configured font pair outside the marketing route
- **THEN** that route can still render the selected public font family
- **AND** marketing font isolation does not remove a supported wishlist option

### Requirement: Decorative animation gating on small viewports

The landing SHALL carry no ambient decorative motion loops. The only permitted non-hero marketing animation is a compositor-only glow on primary lime calls to action. Hero occasion rotation SHALL remain subject to visitor activity, visibility, page lifecycle, and reduced-motion conditions.

#### Scenario: Ambient effects are absent

- **WHEN** the landing renders at any viewport with motion allowed
- **THEN** no floating blob, floating emoji, or scroll-reveal timeline runs
- **AND** the hero remains static until the visitor activity condition is satisfied

#### Scenario: CTA glow is compositor-only

- **WHEN** a primary lime call to action renders with motion allowed
- **THEN** its glow animates only properties that do not trigger layout or repaint of surrounding content

#### Scenario: Reduced motion still wins

- **WHEN** `prefers-reduced-motion: reduce` is set at any viewport width
- **THEN** no non-structural marketing animations play, including the call-to-action glow

#### Scenario: No orphaned motion hooks remain

- **WHEN** the marketing markup is inspected
- **THEN** no animation hook attribute is present without a stylesheet rule or controller that consumes it

## ADDED Requirements

### Requirement: Below-the-fold sections verified against the §5 desktop frame

The eight sections named below SHALL be verified at the 1240px source artboard against `A Wish For.dc.html` §5, frame "Marketing / landing · desktop · light green theme · v2 fotográfica", for layout, spacing, typography, colour, imagery treatment, and copy: "¿Qué estás celebrando?", "Todo lo que necesitas, sin complicaciones", "Del primer clic a tu lista publicada", "Así se ve una wishlist publicada", "¿Buscas la lista de alguien?", "Resolvemos tus dudas", "Tu próximo momento especial merece una página hermosa", and "Ideas para tu próximo evento".

Prices inside the example preview are an approved departure, rendering in the product currency rather than the canvas currency.

#### Scenario: Desktop visual parity

- **WHEN** each named section is compared at the 1240px artboard width
- **THEN** its section padding, background, dividers, grid geometry, type scale, colour values and imagery treatment match the exported frame within normal browser font-rendering tolerance

#### Scenario: Structural facts are asserted automatically

- **WHEN** the marketing test suite runs
- **THEN** it asserts the five-item FAQ set, the five-step timeline, the four benefit cards, the single "wishlist general" affordance node, the preview's gift-state coverage, and the absence of orphaned motion hook attributes

#### Scenario: Sections reflow safely below the breakpoint

- **WHEN** a rebuilt section renders below `lg`
- **THEN** its content is legible, its interactive elements meet the minimum touch target, and it introduces no layout instability
- **AND** canvas-accurate mobile composition is not required by this requirement

### Requirement: Photographic bands are self-hosted and deferred

The full-bleed photographic backgrounds behind the guest list-finder and the final call to action SHALL be served as optimized local assets with explicit geometry, lazy loading, and no priority or preload hint.

#### Scenario: Band photographs are local and optimized

- **WHEN** either photographic band enters the viewport
- **THEN** its background photograph is requested from the application's own asset path in an optimized encoding
- **AND** its transferred size is consistent with the route's initial-payload budget

#### Scenario: Bands never compete with the hero

- **WHEN** the landing route begins loading
- **THEN** neither band photograph is preloaded or marked high priority
- **AND** the first fold hero remains the sole high-priority content image

### Requirement: Guest finder validation is legible over photography

The guest list-finder SHALL present validation messages legibly against its photographic background and SHALL reserve their space so that displaying a message does not change the band's height.

#### Scenario: Message space is reserved

- **WHEN** the guest list-finder renders with no validation error
- **THEN** the space its message occupies is already allocated
- **AND** submitting an invalid query does not change the height of the band

#### Scenario: Message is legible and announced

- **WHEN** a validation message appears over the photographic background
- **THEN** it meets contrast requirements against that background
- **AND** it is announced to assistive technology

### Requirement: Newsletter band collects intent without a persistence contract

The "Ideas para tu próximo evento" band SHALL render an accessible, labelled email form. Until a subscription capability exists, submission SHALL resolve to a friendly acknowledgement without claiming that an address was stored.

#### Scenario: Form is accessible and operable

- **WHEN** a visitor reaches the newsletter band by keyboard
- **THEN** the email field is labelled and focusable and the submit control is operable
- **AND** the control is not rendered in a permanently disabled state

#### Scenario: Submission does not overpromise

- **WHEN** a visitor submits an address before the subscription capability exists
- **THEN** they receive a friendly acknowledgement that does not assert a completed subscription
- **AND** no persistence, mutation, or third-party request is performed
