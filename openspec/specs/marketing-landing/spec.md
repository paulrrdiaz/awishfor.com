## Purpose

The public marketing landing page at `/` — the top of the funnel. It explains the product, builds trust, and drives signed-out visitors to `/create`, in a self-contained light-green theme rendered faithfully from the Claude Design canvas (`A Wish For.dc.html` §5). It reuses the real public components for its example preview and uses GSAP for all motion.

## Requirements

### Requirement: Marketing landing route at `/`

The system SHALL serve a public marketing landing page at the root path `/`, rendered server-side in a `(marketing)` route group, accessible without authentication, and indexable by search engines.

#### Scenario: Signed-out visitor opens the site root

- **WHEN** a signed-out visitor navigates to `/`
- **THEN** the marketing landing page renders without redirecting to sign-in

#### Scenario: Landing is indexable

- **WHEN** a crawler requests `/`
- **THEN** the page is not marked `noindex` (unlike `/w/[slug]` public wishlist pages)
- **AND** the document exposes a descriptive `<title>` and meta description

### Requirement: Landing section structure and order

The landing page SHALL render all sections from the design canvas (`A Wish For.dc.html` §5) in this exact order: navigation, hero, "Elige tu ocasión" occasion picker, "¿Por qué A Wish For?" benefits, "Cómo funciona", "Casos de uso", "Tiendas aliadas", "Temas" swatches, "Ejemplo real" preview, guest list-finder, FAQ, final CTA, footer.

#### Scenario: All sections present in order

- **WHEN** the landing renders
- **THEN** the sections appear top-to-bottom as: Nav → Hero → Elige tu ocasión → ¿Por qué? → Cómo funciona → Casos de uso → Tiendas aliadas → Temas → Ejemplo real → Buscar lista → FAQ → CTA final → Footer

#### Scenario: Occasion picker content

- **WHEN** the "Elige tu ocasión" section renders
- **THEN** it shows four occasion cards (Baby Shower, Boda, Cumpleaños, Nuevo hogar), each with a "Crear mi lista →" call to action
- **AND** a "¿Otra ocasión? Crea una wishlist general →" link is shown below the cards

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

### Requirement: Brand logo in nav and footer

The landing SHALL display the brand logo asset `public/assets/awishfor-logo.svg` in the navigation and footer rather than a plain text wordmark.

#### Scenario: Logo rendered

- **WHEN** the nav and footer render
- **THEN** the `awishfor-logo.svg` asset is used as the brand mark with accessible alt text "A Wish For"

### Requirement: Auth-aware navigation and CTAs

The landing navigation SHALL reflect authentication state, SHALL be usable at all viewport widths down to 390px, and the primary call-to-action SHALL drive visitors to the creation flow.

#### Scenario: Signed-out nav

- **WHEN** a signed-out visitor views the nav
- **THEN** it shows "Iniciar sesión" and a primary "Crear mi wishlist" button (plus any links added by other landing requirements) at desktop widths

#### Scenario: Signed-in nav

- **WHEN** a signed-in visitor views the nav
- **THEN** it shows "Dashboard" and "Crear mi wishlist" (via Clerk `<SignedIn>/<SignedOut>`) at desktop widths

#### Scenario: Primary CTA target

- **WHEN** a visitor clicks "Crear mi wishlist" anywhere on the page
- **THEN** they navigate to `/create`

#### Scenario: Secondary CTA target

- **WHEN** a visitor clicks the hero "Ver ejemplo"
- **THEN** the page scrolls to the "Ejemplo real" block

#### Scenario: Mobile nav collapses to a drawer

- **WHEN** the nav renders below the `md` breakpoint
- **THEN** it shows the logo, a condensed "Crear" CTA, and a "≡" trigger
- **AND** the full link set (including any anchor links and the auth-aware Iniciar sesión/Dashboard link) is only reachable by opening a shadcn `Sheet` drawer from the trigger

#### Scenario: Mobile nav drawer is dismissible

- **WHEN** the mobile nav drawer is open
- **THEN** it can be closed via an explicit close control, clicking outside it, or the Escape key, returning focus to the trigger

### Requirement: Example preview reuses real public components

The "Ejemplo real" section SHALL render the production `PublicWishlistPage` component in `compact` mode, fed by a static demo fixture, so the marketing preview stays a single source of truth with the live public page.

#### Scenario: Compact public page used

- **WHEN** the example section renders
- **THEN** it mounts `PublicWishlistPage` in `compact` mode using `src/config/demo-wishlist.ts`
- **AND** purchase actions are non-interactive in the preview

### Requirement: GSAP-driven animations with reduced-motion fallback

The landing SHALL use GSAP (with ScrollTrigger) for its animations — scroll-reveal rises, floating ambient blobs/emoji, hero card bob, headline shimmer, partner-logo marquee, animated mesh gradient, pulsing badge dot, slow-spin accent, and button glow — and SHALL disable all of them when the user prefers reduced motion.

#### Scenario: Scroll reveals on enter

- **WHEN** a section scrolls into the viewport
- **THEN** its content animates in via a GSAP scroll-triggered reveal

#### Scenario: Reduced motion disables animation

- **WHEN** the user has `prefers-reduced-motion: reduce` set
- **THEN** no GSAP animations play and all content is shown in its final state

#### Scenario: No layout shift or content gating

- **WHEN** JavaScript is disabled or GSAP fails to load
- **THEN** all landing content remains visible and readable

### Requirement: Shadcn-first, Tailwind-fallback implementation

The landing page's interactive UI patterns SHALL use existing shadcn primitives where one exists for the pattern (accordion disclosure, search input, carousel), and presentational styling SHALL use Tailwind utility classes rather than inline `style` objects or bespoke CSS wherever a Tailwind utility can express the same value. The scoped `marketing-theme` CSS custom properties (`--mbg`, `--mink`, `--mmut`, `--mline`, `--mrose`, `--msky`, `--mlime`, `--msun`) and GSAP animation target styles are the only exceptions, since Tailwind's default theme cannot express a self-contained, non-leaking marketing palette.

#### Scenario: FAQ uses shadcn Accordion

- **WHEN** the FAQ section renders
- **THEN** each question/answer pair is a shadcn `Accordion` item rather than custom disclosure markup

#### Scenario: Guest finder uses shadcn form primitives

- **WHEN** the guest list-finder section renders
- **THEN** its search input and submit action use shadcn `Input`/`Button` (or `Command` if the canvas specifies typeahead results)

#### Scenario: Layout/spacing prefers Tailwind utilities

- **WHEN** a landing section needs spacing, sizing, or color that Tailwind's utility classes (including arbitrary values) can express
- **THEN** the component uses a Tailwind class rather than an inline `style` object or a new custom CSS rule

### Requirement: Desktop landing verified against design canvas

The desktop landing implementation SHALL be verified against the Claude Design canvas (`A Wish For.dc.html` §5, "Marketing / landing · desktop") for copy, spacing, color tokens, and animation choreography before this change is considered complete.

#### Scenario: Section content matches canvas

- **WHEN** a landing section's rendered copy, imagery, or example data is compared against the canvas desktop frame
- **THEN** it matches, or any intentional deviation (e.g. the hero carousel, the full shared-config theme count) is called out explicitly rather than left as unverified drift

### Requirement: Section content adapts per breakpoint

Landing sections whose canvas mobile frame specifies shorter heading/body copy than the desktop frame SHALL render that shorter copy below the `lg` breakpoint, without client-side viewport detection or hydration-dependent copy swaps.

#### Scenario: Shorter mobile copy renders server-side

- **WHEN** a section with distinct mobile copy (e.g. hero, benefits, how-it-works, final CTA) renders below `lg`
- **THEN** the shorter copy is present in the initial server-rendered HTML, not swapped in after hydration

#### Scenario: Desktop copy unaffected

- **WHEN** the same sections render at `lg` and above
- **THEN** the full desktop copy renders unchanged from the `marketing-landing-desktop` fidelity pass

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

Ambient decorative GSAP effects (mesh-gradient drift, floating blob/emoji loops) SHALL be simplified or skipped on viewports below `md` independent of the `prefers-reduced-motion` setting, while scroll-reveals, the headline shimmer, and stat count-up SHALL still play at every viewport (subject to `prefers-reduced-motion` as already specified).

#### Scenario: Ambient effects skipped on small viewports

- **WHEN** the landing renders below `md` with motion allowed (`prefers-reduced-motion` not set)
- **THEN** mesh-gradient drift and floating blob/emoji loops do not run
- **AND** scroll-reveal, shimmer, and count-up animations still run

#### Scenario: Reduced motion still wins

- **WHEN** `prefers-reduced-motion: reduce` is set, at any viewport width
- **THEN** no GSAP animations play, per the existing reduced-motion requirement
