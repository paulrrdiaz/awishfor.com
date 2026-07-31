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
- **THEN** it shows four occasion cards (Baby Shower, Boda, Cumpleaños, Nuevo hogar), each with a "Crear mi lista →" call to action
- **AND** a "¿Otra ocasión? Crea una wishlist general →" link is shown below the cards

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

#### Scenario: How-it-works steps

- **WHEN** the "Cómo funciona" section renders
- **THEN** it shows four numbered steps (01–04): "Elige tu ocasión", "Crea y personaliza", "Agrega tus regalos", "Comparte tu enlace"

#### Scenario: Use-case pills

- **WHEN** the "Casos de uso" section renders
- **THEN** it shows five event cards: Baby Shower, Cumpleaños, Boda, Nuevo hogar, Wishlist general

#### Scenario: Theme swatches

- **WHEN** the "Temas" section renders
- **THEN** it shows a swatch for every entry in the shared public theme config (`src/config/public-themes.ts`), not a hardcoded subset

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

#### Scenario: Lightweight public preview is used

- **WHEN** the example section renders
- **THEN** it displays the configured demo title, event metadata, hero treatment, and representative gifts from `src/config/demo-wishlist.ts`
- **AND** it does not mount `PublicWishlistPage`

#### Scenario: Preview remains non-interactive

- **WHEN** a visitor inspects or activates a gift in the marketing preview
- **THEN** no purchase modal or reservation mutation is available
- **AND** no purchase-flow JavaScript is loaded for the preview

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

Landing sections whose canvas mobile frame specifies shorter heading/body copy than the desktop frame SHALL render that shorter copy below the `lg` breakpoint without client-side viewport detection or hydration-dependent copy swaps.

At `lg` and above, the hero SHALL use the exact H2b desktop copy while all later sections retain the approved desktop copy from the existing fidelity pass.

#### Scenario: Shorter mobile copy renders server-side

- **WHEN** a section with distinct mobile copy such as hero, benefits, how-it-works, or final CTA renders below `lg`
- **THEN** the shorter copy is present in the initial server-rendered HTML and is not swapped after hydration

#### Scenario: H2b desktop hero copy renders server-side

- **WHEN** the hero renders at `lg` or above
- **THEN** the exact H2b eyebrow, headline, body, CTA, and trust-line copy is present in the initial server-rendered HTML

#### Scenario: Initial occasion rail copy renders server-side

- **WHEN** the hero renders at any viewport
- **THEN** the first occasion's proof-rail copy is present in the initial server-rendered HTML
- **AND** later occasion data does not create additional initial image requests or duplicate accessible rails

#### Scenario: Later desktop copy remains unchanged

- **WHEN** the same sections render at `lg` and above
- **THEN** their desktop copy remains unchanged from the existing marketing-landing fidelity pass

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

Ambient decorative effects in later sections SHALL remain static on viewports below `md` and SHALL initialize at larger viewports only while their section is visible. Scroll reveals MAY play at every viewport after their target approaches the viewport, while hero occasion rotation SHALL remain subject to visitor activity, visibility, page lifecycle, and reduced-motion conditions.

#### Scenario: Ambient effects are static on small viewports

- **WHEN** the landing renders below `md` with motion allowed
- **THEN** floating blob and emoji loops do not run
- **AND** viewport-triggered scroll reveals may still run
- **AND** the hero remains static until the visitor activity condition is satisfied

#### Scenario: Offscreen ambient effects pause

- **WHEN** an animated later section leaves the viewport
- **THEN** its decorative transform timeline pauses
- **AND** it performs no continuous per-frame work while hidden

#### Scenario: Reduced motion still wins

- **WHEN** `prefers-reduced-motion: reduce` is set at any viewport width
- **THEN** no non-structural marketing animations play

### Requirement: Marketing typography is route-scoped

The marketing route SHALL load only the font families and weights used by the approved landing design. The public-wishlist font catalog and application monospace font SHALL NOT be imported or preloaded by the anonymous marketing route.

#### Scenario: Marketing font resources are isolated

- **WHEN** the anonymous `/` route loads
- **THEN** its font requests are limited to the Lora and Inter resources required by visible marketing content
- **AND** no Playfair Display, Cormorant Garamond, DM Serif Display, Nunito, Figtree, Source Serif 4, Karla, or JetBrains Mono resource is preloaded

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
