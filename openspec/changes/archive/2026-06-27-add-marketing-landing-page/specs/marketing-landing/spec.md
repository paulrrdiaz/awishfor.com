## ADDED Requirements

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

The landing page SHALL render all sections from the design canvas (`A Wish For.dc.html` §5) in this exact order: navigation, hero, "¿Por qué A Wish For?" benefits, "Cómo funciona", "Casos de uso", "Tiendas aliadas", "Temas" swatches, "Ejemplo real" preview, guest list-finder, FAQ, final CTA, footer.

#### Scenario: All sections present in order

- **WHEN** the landing renders
- **THEN** the sections appear top-to-bottom as: Nav → Hero → ¿Por qué? → Cómo funciona → Casos de uso → Tiendas aliadas → Temas → Ejemplo real → Buscar lista → FAQ → CTA final → Footer

#### Scenario: Benefits row content

- **WHEN** the "¿Por qué A Wish For?" section renders
- **THEN** it shows exactly four cards: "Todo en un lugar", "Gratis, sin comisiones", "Enlace y QR gratis", "Listas sugeridas"

#### Scenario: How-it-works steps

- **WHEN** the "Cómo funciona" section renders
- **THEN** it shows three numbered steps (01, 02, 03): "Crea y personaliza", "Comparte el enlace", "Recibe sin duplicados"

#### Scenario: Use-case pills

- **WHEN** the "Casos de uso" section renders
- **THEN** it shows five event cards: Baby Shower, Cumpleaños, Boda, Nuevo hogar, Wishlist general

#### Scenario: Theme swatches

- **WHEN** the "Temas" section renders
- **THEN** it shows all seven theme swatches: Dulce Rosa, Cielo Suave, Cielo Rosa, Jardín Verde, Crema Elegante, Lavanda Fiesta, Clásico Minimal

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

The landing navigation SHALL reflect authentication state, and the primary call-to-action SHALL drive visitors to the creation flow.

#### Scenario: Signed-out nav

- **WHEN** a signed-out visitor views the nav
- **THEN** it shows "Iniciar sesión" and a primary "Crear mi wishlist" button

#### Scenario: Signed-in nav

- **WHEN** a signed-in visitor views the nav
- **THEN** it shows "Dashboard" and "Crear mi wishlist" (via Clerk `<SignedIn>/<SignedOut>`)

#### Scenario: Primary CTA target

- **WHEN** a visitor clicks "Crear mi wishlist" anywhere on the page
- **THEN** they navigate to `/create`

#### Scenario: Secondary CTA target

- **WHEN** a visitor clicks the hero "Ver ejemplo"
- **THEN** the page scrolls to the "Ejemplo real" block

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
