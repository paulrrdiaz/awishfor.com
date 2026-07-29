## ADDED Requirements

### Requirement: H2b photographic desktop first fold
At `lg` viewports and above, the landing page SHALL render the Claude Design **H2b · Filete de luz** first fold instead of the green mesh and rotating wishlist-card desktop hero. The H2b first fold SHALL preserve the exported photographic composition, exact copy hierarchy, contrast treatment, and CTA destinations while excluding the canvas annotation label.

#### Scenario: Desktop visitor sees H2b
- **WHEN** a visitor opens `/` at a viewport at least `lg`
- **THEN** the first fold uses the exported wedding photograph in a 640px-high, maximum-1240px composition
- **AND** the photograph uses the exported brightened crop with horizontal, vertical, and header contrast gradients
- **AND** the header is drawn over the photograph with a one-pixel translucent white divider instead of a separate light-green navigation row

#### Scenario: H2b copy and actions match the source
- **WHEN** the H2b desktop hero renders
- **THEN** its eyebrow reads “Wishlists para momentos importantes”
- **AND** its headline reads “Crea una wishlist hermosa para tus momentos especiales.” with “hermosa” in the lime-tinted italic treatment
- **AND** its body reads “Agrega regalos de cualquier tienda, comparte por enlace, WhatsApp o QR, y deja que tus invitados marquen lo que compran.”
- **AND** “Crear mi wishlist →” links to `/create`
- **AND** “Ver ejemplo” links to `#ejemplo`
- **AND** the trust line reads “Gratis · sin comisiones · +10 mil listas creadas”

#### Scenario: Desktop hero geometry matches H2b
- **WHEN** the H2b hero is measured at the 1240px design width
- **THEN** the header has 44px horizontal insets and 22px/18px top/bottom padding
- **AND** the content is anchored 78px from the left and 110px from the bottom
- **AND** the headline uses a 52px Lora face with 1.04 line height and a maximum width of 700px
- **AND** the body uses 16px type with 1.62 line height and a maximum width of 480px

#### Scenario: Existing mobile first fold is preserved
- **WHEN** the landing renders below `lg`
- **THEN** it retains the existing responsive mobile hero, shorter mobile copy, carousel, navigation drawer, and minimum touch targets
- **AND** H2b’s desktop-only geometry does not force horizontal overflow

#### Scenario: Earlier desktop hero decorations are absent
- **WHEN** the H2b desktop first fold renders
- **THEN** it does not show the mesh background, floating emoji, three-column stats card, spinning accent, or rotating wishlist-card carousel

### Requirement: H2b hero proof rail
The H2b desktop first fold SHALL include the exported overlapping “Ejemplo real” teaser rail as a compact proof point while retaining the existing full example preview later on the page.

#### Scenario: Proof rail content matches the source
- **WHEN** the H2b proof rail renders
- **THEN** it overlaps the bottom of the photograph by 54px
- **AND** it identifies “María & Tomás” as a wedding with 68 days remaining and 16 gifts
- **AND** it shows compact summaries for “Copas de cristal”, “Vajilla 12 pzs”, and “Set de mantelería”
- **AND** it displays `awishfor.com/w/maria-y-tomas`
- **AND** it provides a “Ver esta wishlist →” action

#### Scenario: Proof rail leads to the real example
- **WHEN** a visitor activates “Ver esta wishlist →” in the proof rail
- **THEN** the page navigates to the existing `#ejemplo` section
- **AND** the downstream `PublicWishlistPage` compact preview remains present and unchanged

## MODIFIED Requirements

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
The landing navigation SHALL reflect authentication state in the initial desktop and mobile navigation, SHALL be usable at all viewport widths down to 390px, and the primary call-to-action SHALL drive visitors to the creation flow. The H2b desktop navigation SHALL transition from its over-photo top state to the exported compact mint state after the visitor scrolls beyond the top portion of the hero.

#### Scenario: Signed-out initial desktop nav
- **WHEN** a signed-out visitor views the landing at the top of a desktop viewport
- **THEN** the H2b navigation shows “Cómo funciona”, “Ocasiones”, “Ejemplos”, “Iniciar sesión”, and “Crear mi wishlist”

#### Scenario: Signed-in initial desktop nav
- **WHEN** a signed-in visitor views the landing at the top of a desktop viewport
- **THEN** the H2b navigation shows “Dashboard” instead of “Iniciar sesión”
- **AND** it shows “Crear mi wishlist”

#### Scenario: H2b desktop nav enters compact scrolled state
- **WHEN** a desktop visitor scrolls beyond the top portion of the H2b hero
- **THEN** the over-photo filete becomes a compact mint `#DCEFD0` navigation bar
- **AND** the compact bar retains the brand lockup, “Cómo funciona”, “Ocasiones”, “Ejemplos”, and “Crear mi wishlist”
- **AND** the account text is omitted in the compact state as specified by the export

#### Scenario: H2b desktop nav returns to top state
- **WHEN** the visitor scrolls back to the top of the H2b hero
- **THEN** the navigation returns to the transparent over-photo state with white text and divider

#### Scenario: Primary CTA target
- **WHEN** a visitor clicks “Crear mi wishlist” anywhere on the page
- **THEN** they navigate to `/create`

#### Scenario: Secondary CTA target
- **WHEN** a visitor clicks the hero “Ver ejemplo”
- **THEN** the page scrolls to the “Ejemplo real” block

#### Scenario: Mobile nav collapses to a drawer
- **WHEN** the nav renders below the `md` breakpoint
- **THEN** it shows the logo, a condensed “Crear” CTA, and a “≡” trigger
- **AND** the full link set, including the auth-aware Iniciar sesión/Dashboard link, is reachable by opening a shadcn `Sheet` drawer

#### Scenario: Mobile nav drawer is dismissible
- **WHEN** the mobile nav drawer is open
- **THEN** it can be closed via an explicit close control, clicking outside it, or the Escape key
- **AND** focus returns to the trigger

### Requirement: GSAP-driven animations with reduced-motion fallback
The landing SHALL use GSAP with ScrollTrigger for scroll reveals, the H2b desktop header-state transition, the mobile hero’s retained decorative motion, the partner marquee, headline shimmer where rendered, and CTA glow. It SHALL NOT register obsolete desktop mesh, bob, float, pulse, or spin loops for elements removed by H2b, and SHALL disable non-structural motion when the visitor prefers reduced motion.

#### Scenario: H2b header state follows scroll
- **WHEN** a desktop visitor crosses the H2b header trigger in either direction
- **THEN** ScrollTrigger applies the corresponding top or compact navigation state

#### Scenario: Scroll reveals on enter
- **WHEN** a section scrolls into the viewport with motion allowed
- **THEN** its content animates in via a GSAP scroll-triggered reveal

#### Scenario: Reduced motion disables decorative animation
- **WHEN** the user has `prefers-reduced-motion: reduce` set
- **THEN** decorative GSAP animations do not play
- **AND** the structural H2b header state still changes without an animated transition

#### Scenario: No layout shift or content gating
- **WHEN** JavaScript is disabled or GSAP fails to load
- **THEN** all landing content remains visible and readable
- **AND** the H2b top header scrolls away with the first fold instead of remaining transparent over later content

### Requirement: Desktop landing verified against design canvas
The desktop landing first fold SHALL be verified against `A Wish For.dc.html` §14, **H2b · Filete de luz**, for image crop, filters, gradients, layout, typography, copy, spacing, proof-rail overlap, and navigation states. Existing sections below the first fold SHALL continue to follow the applicable §5 landing frames.

#### Scenario: H2b visual parity
- **WHEN** the desktop first fold is compared at the 1240px source artboard and the supplied 1302×739 reference viewport
- **THEN** the image focal point, header divider, copy block, CTA row, trust line, and overlapping proof rail match the exported H2b frame within normal browser font-rendering tolerance

#### Scenario: Intentional responsive boundary is documented
- **WHEN** the first fold is compared below `lg`
- **THEN** the retained mobile design is treated as an intentional breakpoint-specific implementation rather than unverified desktop drift

### Requirement: Section content adapts per breakpoint
Landing sections whose canvas mobile frame specifies shorter heading/body copy than the desktop frame SHALL render that shorter copy below `lg`, without client-side viewport detection or hydration-dependent copy swaps. At `lg` and above, the hero SHALL use the exact H2b desktop copy while all later sections retain the approved desktop copy from the existing fidelity pass.

#### Scenario: Shorter mobile copy renders server-side
- **WHEN** a section with distinct mobile copy renders below `lg`
- **THEN** the shorter copy is present in the initial server-rendered HTML
- **AND** it is not swapped in after hydration

#### Scenario: H2b desktop hero copy renders server-side
- **WHEN** the hero renders at `lg` or above
- **THEN** the exact H2b eyebrow, headline, body, CTA, and trust-line copy is present in the initial server-rendered HTML

#### Scenario: Later desktop copy remains unchanged
- **WHEN** sections after the H2b first fold render at `lg` or above
- **THEN** their desktop copy remains unchanged from the existing marketing-landing fidelity pass
