## MODIFIED Requirements

### Requirement: H2b photographic desktop first fold

At every viewport, the landing page SHALL render the Claude Design **H2b · Filete de luz** first fold instead of the green mesh and rotating wishlist-card hero. The H2b first fold SHALL preserve the exported photographic composition, exact copy hierarchy, contrast treatment, and CTA destinations while excluding the canvas annotation label. The photograph within that composition SHALL rotate automatically through the four occasions defined by the `hero-occasion-rotation` capability; the composition, overlays, copy, CTAs, and trust line SHALL NOT change as the photograph rotates.

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
- **THEN** it renders the same photographic first fold, scaled for the viewport, with the rotating photograph and synchronized proof rail
- **AND** it renders the shorter mobile hero copy, the trust line, the mobile navigation drawer, and minimum touch targets
- **AND** the desktop-only H2b geometry does not force horizontal overflow

#### Scenario: Earlier hero decorations are absent

- **WHEN** the H2b first fold renders at any viewport
- **THEN** it does not show the mesh background, dot grid, floating blobs, floating emoji, three-column stats card, spinning accent, headline shimmer, bobbing teaser card, or the wishlist-card carousel
- **AND** the three-column stats card content is represented by the trust line instead

### Requirement: H2b hero proof rail

The H2b first fold SHALL include the exported overlapping “Ejemplo real” teaser rail as a compact proof point while retaining the existing full example preview later on the page. The rail's content SHALL rotate in step with the hero photograph, always showing the example belonging to the occasion currently displayed.

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
- **AND** the downstream `PublicWishlistPage` compact preview remains present and unchanged

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

### Requirement: GSAP-driven animations with reduced-motion fallback

The landing SHALL use GSAP with ScrollTrigger for scroll reveals, the H2b header-state transition, the hero occasion rotation, the partner marquee, and CTA glow. It SHALL NOT register mesh-drift, bob, pulse, spin, or headline-shimmer loops, since no markup consumes them after the mesh hero is removed. It SHALL retain the floating blob and emoji loops that later sections still use. It SHALL disable non-structural motion when the visitor prefers reduced motion.

#### Scenario: H2b header state follows scroll

- **WHEN** a desktop visitor crosses the H2b header trigger in either direction
- **THEN** ScrollTrigger applies the corresponding top or compact navigation state

#### Scenario: Scroll reveals on enter

- **WHEN** a section scrolls into the viewport
- **THEN** its content animates in via a GSAP scroll-triggered reveal

#### Scenario: Hero rotation is registered

- **WHEN** the landing animations initialize with motion allowed
- **THEN** the hero occasion rotation timeline is registered and running

#### Scenario: Retired loops are not registered

- **WHEN** the landing animations initialize
- **THEN** no mesh-drift, bob, pulse, spin, or headline-shimmer animation is registered
- **AND** the floating blob and emoji loops used by the final CTA and guest-finder sections are still registered

#### Scenario: Reduced motion disables animation

- **WHEN** the user has `prefers-reduced-motion: reduce` set
- **THEN** decorative GSAP animations do not play
- **AND** the hero photograph does not rotate
- **AND** the structural H2b header state still changes without an animated transition

#### Scenario: No layout shift or content gating

- **WHEN** JavaScript is disabled or GSAP fails to load
- **THEN** all landing content remains visible and readable
- **AND** the hero shows its first occasion photograph, copy, trust line, and proof rail
- **AND** the H2b top header scrolls away with the first fold instead of remaining transparent over later content

### Requirement: Decorative animation gating on small viewports

Ambient decorative GSAP effects (floating blob and emoji loops in later sections) SHALL be simplified or skipped on viewports below `md` independent of the `prefers-reduced-motion` setting, while scroll-reveals and the hero occasion rotation SHALL still play at every viewport (subject to `prefers-reduced-motion` as already specified).

#### Scenario: Ambient effects skipped on small viewports

- **WHEN** the landing renders below `md` with motion allowed (`prefers-reduced-motion` not set)
- **THEN** floating blob and emoji loops do not run
- **AND** scroll-reveal animations still run
- **AND** the hero occasion rotation still runs

#### Scenario: Reduced motion still wins

- **WHEN** `prefers-reduced-motion: reduce` is set, at any viewport width
- **THEN** no GSAP animations play, per the existing reduced-motion requirement

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

Landing sections whose canvas mobile frame specifies shorter heading/body copy than the desktop frame SHALL render that shorter copy below the `lg` breakpoint, without client-side viewport detection or hydration-dependent copy swaps.

At `lg` and above, the hero SHALL use the exact H2b desktop copy while all later sections retain the approved desktop copy from the existing fidelity pass.

#### Scenario: Shorter mobile copy renders server-side

- **WHEN** a section with distinct mobile copy (e.g. hero, benefits, how-it-works, final CTA) renders below `lg`
- **THEN** the shorter copy is present in the initial server-rendered HTML, not swapped in after hydration

#### Scenario: H2b desktop hero copy renders server-side

- **WHEN** the hero renders at `lg` or above
- **THEN** the exact H2b eyebrow, headline, body, CTA, and trust-line copy is present in the initial server-rendered HTML

#### Scenario: All occasions' rail copy renders server-side

- **WHEN** the hero renders at any viewport
- **THEN** every occasion's proof-rail copy is present in the initial server-rendered HTML
- **AND** none of it is fetched or assembled after hydration

#### Scenario: Later desktop copy remains unchanged

- **WHEN** the same sections render at `lg` and above
- **THEN** their desktop copy remains unchanged from the existing marketing-landing fidelity pass

### Requirement: Shadcn-first, Tailwind-fallback implementation

The landing page's interactive UI patterns SHALL use existing shadcn primitives where one exists for the pattern (accordion disclosure, search input, carousel), and presentational styling SHALL use Tailwind utility classes rather than inline `style` objects or bespoke CSS wherever a Tailwind utility can express the same value. The scoped `marketing-theme` CSS custom properties (`--mbg`, `--mink`, `--mmut`, `--mline`, `--mrose`, `--msky`, `--mlime`, `--msun`), the per-occasion hero scrim custom property, and GSAP animation target styles are the only exceptions, since Tailwind's default theme cannot express a self-contained, non-leaking marketing palette or a value that changes per active occasion.

#### Scenario: FAQ uses shadcn Accordion

- **WHEN** the FAQ section renders
- **THEN** each question/answer pair is a shadcn `Accordion` item rather than custom disclosure markup

#### Scenario: Guest finder uses shadcn form primitives

- **WHEN** the guest list-finder section renders
- **THEN** its search input and submit action use shadcn `Input`/`Button` (or `Command` if the canvas specifies typeahead results)

#### Scenario: Interactive card carousel uses the shadcn primitive

- **WHEN** the wishlist-card carousel renders inside the occasion picker
- **THEN** it uses the existing shadcn `Carousel` primitive with its autoplay plugin

#### Scenario: Non-interactive hero rotation does not use the carousel primitive

- **WHEN** the hero occasion rotation renders
- **THEN** it is implemented as a GSAP-driven crossfade rather than the shadcn `Carousel` primitive
- **AND** this is treated as intentional, because the hero exposes no gestures, controls, or carousel semantics

#### Scenario: Layout/spacing prefers Tailwind utilities

- **WHEN** a landing section needs spacing, sizing, or color that Tailwind's utility classes (including arbitrary values) can express
- **THEN** the component uses a Tailwind class rather than an inline `style` object or a new custom CSS rule
