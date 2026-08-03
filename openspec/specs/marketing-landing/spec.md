## Purpose

The public marketing landing page at `/` — the top of the funnel. It explains the product, builds trust, and drives signed-out visitors to `/create`, in a self-contained light-green theme rendered faithfully from the Claude Design canvas (`A Wish For.dc.html` §5). It reuses the real public components for its example preview and uses GSAP for all motion.
## Requirements
### Requirement: Marketing landing route at `/`

The system SHALL serve a public marketing landing page at the root path `/`, rendered in a `(marketing)` route group, accessible without authentication, and indexable by search engines. The anonymous route shell and its initial content MUST be statically renderable and cacheable; request-time authentication, database access, and application client-provider initialization MUST NOT block its initial response.

#### Scenario: Signed-out visitor opens the site root

- **WHEN** a signed-out visitor navigates to `/`
- **THEN** the marketing landing page renders without redirecting to sign-in

#### Scenario: Landing is indexable

- **WHEN** a crawler requests `/`
- **THEN** the page is not marked `noindex` unlike `/w/[slug]` public wishlist pages
- **AND** the document exposes a descriptive `<title>` and meta description

#### Scenario: Production build classifies the landing as static

- **WHEN** the application completes a production build
- **THEN** `/` is reported as a static or prerendered route
- **AND** reading authentication state is not part of the route's server render

#### Scenario: Marketing bypasses unrelated providers

- **WHEN** an anonymous visitor loads `/`
- **THEN** Clerk, tRPC, React Query, nuqs, tooltip, and toaster client runtimes are absent from the initial marketing bundle unless a visible marketing feature directly requires them

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

### Requirement: Scoped light-green marketing theme

The landing SHALL use a self-contained light-green marketing theme whose CSS custom properties are scoped to a marketing wrapper and SHALL NOT modify the app `:root` tokens or any of the seven public wishlist theme presets.

#### Scenario: Theme tokens match the design

- **WHEN** the landing renders
- **THEN** the marketing background is `#EEF9E6`, ink `#173E29`, muted `#4E6E56`, lime `#BCE25A`, and sunshine accent `#F4C84A`

#### Scenario: No leakage into app or public themes

- **WHEN** the marketing theme is mounted
- **THEN** the dashboard/app chrome `:root` tokens are unchanged
- **AND** the public wishlist theme presets are unchanged

### Requirement: H2b photographic desktop first fold

At every viewport, the landing page SHALL render the Claude Design **H2b · Filete de luz** first fold instead of the green mesh and rotating wishlist-card hero. The H2b first fold SHALL preserve the exported photographic composition, exact copy hierarchy, contrast treatment, and CTA destinations while excluding the canvas annotation label. The photograph within that composition SHALL rotate through the four occasions defined by the `hero-occasion-rotation` capability only after its activity and visibility conditions are satisfied; the composition, overlays, copy, CTAs, and trust line SHALL NOT change as the photograph rotates.

#### Scenario: Desktop visitor sees H2b

- **WHEN** a visitor opens `/` at a viewport at least `lg`
- **THEN** the first fold uses the exported photographic composition in a 640px-high, maximum-1240px composition
- **AND** the photograph uses the exported brightened crop with horizontal, vertical, and header contrast gradients
- **AND** the header is drawn over the photograph with a one-pixel translucent white divider instead of a separate light-green navigation row
- **AND** the first photograph displayed is the exported wedding photograph

#### Scenario: H2b copy and actions match the source

- **WHEN** the H2b hero renders
- **THEN** its eyebrow reads “Wishlists para momentos importantes”
- **AND** its headline reads “Crea una wishlist hermosa para tus momentos especiales.” with “hermosa” in the lime-tinted italic treatment
- **AND** its body reads “Agrega regalos de cualquier tienda, comparte por enlace, WhatsApp o QR, y deja que tus invitados marquen lo que compran.”
- **AND** “Crear mi wishlist →” links to `/create`
- **AND** “Ver ejemplo” links to `#ejemplo`
- **AND** the trust line reads “Gratis · sin comisiones · +10 mil listas creadas”

#### Scenario: Copy does not rotate with the photograph

- **WHEN** the hero photograph advances to a different occasion
- **THEN** the eyebrow, headline, body, CTA labels, and trust line remain unchanged

#### Scenario: Desktop hero geometry matches H2b

- **WHEN** the H2b hero is measured at the 1240px design width
- **THEN** the header has 44px horizontal insets and 22px/18px top/bottom padding
- **AND** the content is anchored 78px from the left and 110px from the bottom
- **AND** the headline uses a 52px Lora face with 1.04 line height and a maximum width of 700px
- **AND** the body uses 16px type with 1.62 line height and a maximum width of 480px

#### Scenario: Mobile first fold uses the same photographic hero

- **WHEN** the landing renders below `lg`
- **THEN** it renders the same photographic first fold, scaled for the viewport, with the activity-gated photograph and synchronized proof rail
- **AND** it renders the shorter mobile hero copy, the trust line, the mobile navigation drawer, and minimum touch targets
- **AND** the desktop-only H2b geometry does not force horizontal overflow

#### Scenario: Earlier hero decorations are absent

- **WHEN** the H2b first fold renders at any viewport
- **THEN** it does not show the mesh background, dot grid, floating blobs, floating emoji, three-column stats card, spinning accent, headline shimmer, bobbing teaser card, or the wishlist-card carousel
- **AND** the three-column stats card content is represented by the trust line instead

### Requirement: H2b hero proof rail

The H2b first fold SHALL include the exported overlapping “Ejemplo real” teaser rail as a compact proof point while retaining a faithful lightweight example preview later on the page. The rail's content SHALL rotate in step with the hero photograph, always showing the example belonging to the occasion currently displayed.

#### Scenario: Proof rail content matches the source

- **WHEN** the H2b proof rail renders its wedding occasion
- **THEN** it overlaps the bottom of the photograph by 54px
- **AND** it identifies “María & Tomás” as a wedding with 68 days remaining and 16 gifts
- **AND** it shows compact summaries for “Copas de cristal”, “Vajilla 12 pzs”, and “Set de mantelería”
- **AND** it displays `awishfor.com/w/maria-y-tomas`
- **AND** it provides a “Ver esta wishlist →” action

#### Scenario: Proof rail follows the rotating photograph

- **WHEN** the hero photograph advances to a different occasion
- **THEN** the rail shows that occasion's example name, event label, remaining days, gift count, and gift summaries
- **AND** the rail never shows an occasion different from the photograph behind it

#### Scenario: Proof rail leads to the real example

- **WHEN** a visitor activates “Ver esta wishlist →” in the proof rail
- **THEN** the page navigates to the existing `#ejemplo` section
- **AND** the downstream lightweight marketing preview remains present

### Requirement: Brand logo in nav and footer

The landing SHALL present an accessible “A Wish For” brand treatment in navigation and footer contexts. The H2b desktop navigation SHALL compose `public/assets/isotype.svg` with a visible Lora “A Wish For” wordmark; the default/mobile navigation and footer SHALL retain their established brand treatments.

#### Scenario: H2b lockup rendered

- **WHEN** the H2b desktop navigation renders over the photograph
- **THEN** it shows the gift isotype at 28px beside the white “A Wish For” wordmark
- **AND** the combined home link has the accessible name “A Wish For”

#### Scenario: Non-H2b brand contexts remain stable

- **WHEN** the mobile landing navigation, marketing 404 navigation, or footer renders
- **THEN** its established accessible A Wish For brand treatment remains available

### Requirement: Auth-aware navigation and CTAs

The landing navigation SHALL render an anonymous-safe account action in its static initial HTML, SHALL be usable at all viewport widths down to 390px, and the primary call-to-action SHALL drive visitors to the creation flow. After first paint, a small non-blocking session enhancement MAY replace the account action with “Dashboard” for an authenticated visitor without loading the full Clerk UI runtime or shifting navigation geometry. The H2b desktop navigation SHALL transition from its over-photo top state to the exported compact mint state after the visitor scrolls beyond the top portion of the hero.

#### Scenario: Initial desktop nav is static and safe

- **WHEN** any visitor receives the initial desktop marketing HTML
- **THEN** the H2b navigation shows “Cómo funciona”, “Ocasiones”, “Ejemplos”, “Iniciar sesión”, and “Crear mi wishlist”
- **AND** rendering that HTML does not require server-side authentication

#### Scenario: Signed-in account action enhances without blocking paint

- **WHEN** a signed-in visitor's session enhancement completes after first paint
- **THEN** “Iniciar sesión” is replaced by “Dashboard”
- **AND** the account slot keeps stable dimensions so the replacement does not cause layout shift
- **AND** the enhancement does not load Clerk's prebuilt UI bundle

#### Scenario: Signed-in visitor activates the static fallback

- **WHEN** a signed-in visitor activates “Iniciar sesión” before session enhancement completes or when JavaScript is unavailable
- **THEN** the existing auth-route redirect sends the visitor to the dashboard or configured safe redirect

#### Scenario: H2b desktop nav enters compact scrolled state

- **WHEN** a desktop visitor scrolls beyond the top portion of the H2b hero
- **THEN** the over-photo filete becomes a compact mint `#DCEFD0` navigation bar
- **AND** the compact bar retains the brand lockup, “Cómo funciona”, “Ocasiones”, “Ejemplos”, and “Crear mi wishlist”
- **AND** the account text is omitted in the compact state as specified by the export

#### Scenario: H2b desktop nav returns to top state

- **WHEN** the visitor scrolls back to the top of the H2b hero
- **THEN** the navigation returns to the transparent over-photo state with white text and divider

#### Scenario: Primary CTA target

- **WHEN** a visitor clicks "Crear mi wishlist" anywhere on the page
- **THEN** they navigate to `/create`

#### Scenario: Secondary CTA target

- **WHEN** a visitor clicks the hero "Ver ejemplo"
- **THEN** the page scrolls to the "Ejemplo real" block

#### Scenario: Mobile nav collapses to an accessible drawer

- **WHEN** the nav renders below the `md` breakpoint
- **THEN** it shows the logo, a condensed "Crear" CTA, and a menu trigger
- **AND** the full link set, including the current account action, is reachable by opening an accessible drawer or dialog

#### Scenario: Mobile nav drawer is dismissible

- **WHEN** the mobile nav drawer is open
- **THEN** it can be closed via an explicit close control, clicking outside it, or the Escape key
- **AND** focus returns to the trigger

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

### Requirement: Targeted hero and header motion with reduced-motion fallback

The landing SHALL preserve the required H2b header state and scroll-progress indicator and the required activity-gated hero rotation. GSAP MAY be used only for the hero and header when it provides these required behaviors; other marketing motion is optional and SHALL use CSS or small browser APIs rather than broad animation-runtime expansion. Motion SHALL use compositor-friendly transform and opacity changes, SHALL initialize only when its target approaches the viewport or the visitor activates the hero, and SHALL stop when hidden. Decorative infinite paint effects SHALL be replaced by static, hover/focus, or finite treatments. All content SHALL remain visible when JavaScript is unavailable, and non-structural motion SHALL be disabled when reduced motion is preferred.

#### Scenario: H2b header state follows scroll

- **WHEN** a desktop visitor crosses the H2b header trigger in either direction
- **THEN** the corresponding top or compact navigation state is applied
- **AND** the header exposes a visible progress indicator that advances with document scroll
- **AND** any GSAP use remains confined to the header implementation

#### Scenario: Scroll reveals enhance visible content

- **WHEN** a reveal target approaches the viewport with motion allowed
- **THEN** it animates through transform and opacity
- **AND** content is visible by default before enhancement is registered

#### Scenario: Hero rotation is activated lazily

- **WHEN** the landing has loaded, motion is allowed, the hero is visible, and the visitor provides a meaningful activity signal
- **THEN** the hero rotation controller starts
- **AND** it was not running during idle first paint
- **AND** any GSAP use remains confined to the hero implementation

#### Scenario: Paint-heavy loops are absent

- **WHEN** the landing animations initialize
- **THEN** no continuous box-shadow, filter, gradient, mesh-drift, bob, pulse, spin, or headline-shimmer loop runs
- **AND** any marquee or decorative transform loop pauses while outside the viewport

#### Scenario: Reduced motion disables animation

- **WHEN** the user has `prefers-reduced-motion: reduce` set
- **THEN** decorative animations do not play
- **AND** the hero photograph does not rotate
- **AND** the structural H2b header state still changes without an animated transition

#### Scenario: No layout shift or content gating

- **WHEN** JavaScript is disabled or an enhancement fails to load
- **THEN** all landing content remains visible and readable
- **AND** the hero shows its first occasion photograph, copy, trust line, and proof rail
- **AND** the H2b top header scrolls away with the first fold instead of remaining transparent over later content

### Requirement: Shadcn-first, Tailwind-fallback implementation

The landing page SHALL select the lightest accessible implementation that preserves the design and behavior contract. Existing shadcn primitives MAY be used when their client runtime is already required by the same interaction, but native HTML, CSS scroll snap, and small progressive-enhancement controllers SHALL be preferred for isolated marketing disclosures, forms, drawers, and carousels. Presentational styling SHALL use Tailwind utility classes rather than inline `style` objects or bespoke CSS wherever a Tailwind utility can express the same value. Scoped marketing theme properties, per-occasion hero scrim values, responsive picture attributes, and values updated by a small animation controller are permitted exceptions.

#### Scenario: FAQ works without a component runtime

- **WHEN** the FAQ section renders
- **THEN** every question and answer is present in server HTML
- **AND** disclosure behavior remains keyboard and screen-reader accessible without requiring a general-purpose UI library

#### Scenario: Guest finder avoids form-framework overhead

- **WHEN** the guest list-finder section renders
- **THEN** its simple slug or URL input uses native form semantics and the established button/input appearance
- **AND** React Hook Form, its resolver, and Zod are not loaded solely for this field

#### Scenario: Occasion carousel is progressively enhanced

- **WHEN** the wishlist-card carousel renders inside the occasion picker
- **THEN** all cards remain readable and horizontally reachable without JavaScript
- **AND** autoplay, looping, and dots are initialized only when the section approaches the viewport and motion is allowed

#### Scenario: Non-interactive hero rotation avoids carousel semantics

- **WHEN** the hero occasion rotation renders
- **THEN** it exposes no carousel interaction semantics or controls
- **AND** its lightweight crossfade controller is loaded only under the hero activation conditions

#### Scenario: Layout and spacing prefer Tailwind utilities

- **WHEN** a landing section needs spacing, sizing, or color that Tailwind utilities, including arbitrary values, can express
- **THEN** the component uses a Tailwind class rather than an inline `style` object or a new custom CSS rule

### Requirement: Desktop landing verified against design canvas

The landing first fold SHALL be verified against `A Wish For.dc.html` §14, **H2b · Filete de luz**, for image crop, filters, gradients, layout, typography, copy, spacing, proof-rail overlap, and navigation states. The rotating occasion photographs are an approved departure from the canvas's single exported photograph; every other aspect of the composition SHALL match. Existing sections below the first fold SHALL continue to follow the applicable §5 landing frames.

#### Scenario: H2b visual parity

- **WHEN** the desktop first fold is compared at the 1240px source artboard and the supplied 1302×739 reference viewport
- **THEN** the image focal point, header divider, copy block, CTA row, trust line, and overlapping proof rail match the exported H2b frame within normal browser font-rendering tolerance

#### Scenario: First paint matches the canvas photograph

- **WHEN** the first fold is compared against the canvas before any rotation has occurred
- **THEN** the displayed photograph is the exported wedding photograph from the canvas

#### Scenario: Mobile first fold is a scaled H2b, not a separate design

- **WHEN** the first fold is compared below `lg`
- **THEN** it is the same H2b composition adapted to the viewport, with mobile photograph crops and shorter mobile copy
- **AND** it is no longer treated as a separate breakpoint-specific hero design

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

### Requirement: Footer collapses to a single column on mobile

The footer SHALL render as a single flat link list below the `md` breakpoint and as the existing 3-column grid (Producto / Ocasiones / Legal) at `md` and above.

#### Scenario: Mobile footer layout

- **WHEN** the footer renders below `md`
- **THEN** links render in one column in this order: Cómo funciona, Temas, Ejemplos, FAQ, Términos, Privacidad
- **AND** the copyright line omits the `awishfor.com` domain mention shown at desktop widths

### Requirement: Mobile touch targets meet minimum size

All interactive elements on the landing page (buttons, links, nav items, accordion triggers, the mobile nav trigger and drawer items, carousel dots) SHALL have a minimum touch target of 44×44px on viewports below `md`.

#### Scenario: Touch target size

- **WHEN** an interactive element is measured on a viewport below `md`
- **THEN** its hit area is at least 44×44px, even if its visible/rendered size is smaller

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

### Requirement: Marketing media follows viewport and visibility priority

The marketing route SHALL request only one optimized local first hero image at high priority. Images outside the first fold SHALL use explicit dimensions and deferred loading, and a compact example SHALL NOT cause its hero or gift imagery to be preloaded.

#### Scenario: Initial hero does not duplicate downloads

- **WHEN** the first fold loads at any supported viewport
- **THEN** only one optimized first-occasion hero image is requested
- **AND** a duplicate hidden breakpoint image is not downloaded

#### Scenario: Example imagery is below-the-fold

- **WHEN** the initial document is loading and the example section is outside the viewport
- **THEN** the example hero and gift images are not assigned high priority
- **AND** they do not produce image preload links

#### Scenario: Media reserves layout space

- **WHEN** a marketing image has not completed loading
- **THEN** its rendered container has a deterministic aspect ratio or intrinsic dimensions
- **AND** loading the image does not shift surrounding content

### Requirement: Below-the-fold sections verified against the §5 desktop frame

The eight sections named below SHALL be verified against `A Wish For.dc.html` §5 at both source artboards — frame "Marketing / landing · desktop · light green theme · v2 fotográfica" at 1240px, and frame "Marketing / landing · móvil · 390px" below the `lg` breakpoint — for layout, spacing, typography, colour, imagery treatment, and composition: "¿Qué estás celebrando?", "Todo lo que necesitas, sin complicaciones", "Del primer clic a tu lista publicada", "Así se ve una wishlist publicada", "¿Buscas la lista de alguien?", "Resolvemos tus dudas", "Tu próximo momento especial merece una página hermosa", and "Ideas para tu próximo evento".

Two departures from the mobile frame are approved: prices inside the example preview render in the product currency rather than the canvas currency, and every section renders the single desktop copy set rather than the canvas's shorter mobile strings and alternate mobile headings.

#### Scenario: Desktop visual parity

- **WHEN** each named section is compared at the 1240px artboard width
- **THEN** its section padding, background, dividers, grid geometry, type scale, colour values and imagery treatment match the exported desktop frame within normal browser font-rendering tolerance

#### Scenario: Mobile visual parity

- **WHEN** each named section is compared at the 390px artboard width
- **THEN** its section padding, background, grid geometry, card and thumbnail dimensions, type scale, colour values and control layout match the exported mobile frame within normal browser font-rendering tolerance
- **AND** the difference from the desktop composition is achieved without client-side viewport detection

#### Scenario: Structural facts are asserted automatically

- **WHEN** the marketing test suite runs
- **THEN** it asserts the five-item FAQ set, the five-step timeline, the four benefit cards, the single "wishlist general" affordance node, the preview's gift-state coverage, and the absence of orphaned motion hook attributes

#### Scenario: Copy does not vary by breakpoint

- **WHEN** a named section is compared between the two artboard widths
- **THEN** its headings, body copy and calls to action are identical strings
- **AND** neither composition introduces a breakpoint-duplicated copy node

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

### Requirement: Occasion picker uses the canvas mosaic below the breakpoint

Below the `lg` breakpoint the "Elige tu ocasión" cards SHALL render as the canvas mosaic: a promoted full-width lead card above a two-column grid, with the "wishlist general" affordance rendering as a solid dark tile in that grid rather than as the desktop text link.

The promoted lead card SHALL retain its call to action. The four smaller tiles SHALL omit their subtitle and inline call to action while remaining complete links to their seeded wizard destination.

#### Scenario: Mosaic composition below the breakpoint

- **WHEN** the occasion picker renders below `lg`
- **THEN** one occasion card spans the full column width above a two-column grid of the remaining occasion tiles
- **AND** the "wishlist general" affordance renders as a dark tile occupying the final grid position

#### Scenario: Reduced tiles remain fully operable

- **WHEN** a visitor activates one of the smaller occasion tiles
- **THEN** they navigate to `/create` with that event type pre-selected
- **AND** the tile exposes an accessible name despite omitting its visible subtitle and inline call to action

#### Scenario: Desktop composition is unaffected

- **WHEN** the occasion picker renders at `lg` and above
- **THEN** it shows the same mosaic — the promoted lead card with subtitle and call to action beside the three smaller tiles with subtitles, and the "wishlist general" affordance as the dark grid tile (not a text link) — unchanged from the pre-mobile-change composition

### Requirement: FAQ scales to its mobile type and spacing

The FAQ SHALL render as a single accordion question list at every viewport — the canvas defines no split layout or dark support panel at either the desktop or the mobile frame. Below the `lg` breakpoint it SHALL use the mobile section padding, row padding, icon size and type scale from the canvas mobile frame. The question set SHALL remain the same five questions at every viewport.

#### Scenario: Mobile scale below the breakpoint

- **WHEN** the FAQ renders below `lg`
- **THEN** its section padding, row padding, icon size and type scale match the canvas mobile frame
- **AND** the question list is not restructured into a split or panel layout

#### Scenario: Question set does not vary by viewport

- **WHEN** the FAQ renders at any viewport
- **THEN** the same five questions are present in the server-rendered HTML
- **AND** no question is hidden by a breakpoint visibility utility

### Requirement: Photographic bands and forms adapt below the breakpoint

Below the `lg` breakpoint the guest list-finder and final call-to-action bands SHALL use their mobile geometry, and every band form SHALL stack its controls to full width.

#### Scenario: Bands use mobile geometry

- **WHEN** either photographic band renders below `lg`
- **THEN** it uses the mobile minimum height, padding, overlay treatment and type scale from the canvas mobile frame

#### Scenario: Band forms stack

- **WHEN** the guest list-finder or newsletter form renders below `lg`
- **THEN** its field and submit control stack vertically at full width
- **AND** the guest list-finder message slot remains reserved and announced, and the band height does not change when a message appears

### Requirement: Example preview uses its mobile composition

Below the `lg` breakpoint the example preview SHALL use the canvas mobile composition: no status topbar, the tighter collage proportions, no availability summary row, the reduced scroll region, and a two-column gift grid.

#### Scenario: Mobile preview composition

- **WHEN** the example preview renders below `lg`
- **THEN** the status topbar and availability summary row are absent, the collage uses the mobile heights, the scroll region uses the mobile maximum height, and gifts render in two columns

#### Scenario: Gift state survives the narrower composition

- **WHEN** the mobile gift grid renders
- **THEN** priority, availability, partial-purchase and purchased states remain distinguishable
- **AND** purchased gifts remain struck through and dimmed

