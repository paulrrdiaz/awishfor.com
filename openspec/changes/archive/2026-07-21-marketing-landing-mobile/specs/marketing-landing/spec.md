## MODIFIED Requirements

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

## ADDED Requirements

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
