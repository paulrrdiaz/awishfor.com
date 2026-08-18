## MODIFIED Requirements

### Requirement: Auth-aware navigation and CTAs

The landing navigation SHALL render an anonymous-safe account action in its static initial HTML, SHALL be usable at all viewport widths down to 390px, and the primary call-to-action SHALL drive visitors to the creation flow. After first paint, a small non-blocking session enhancement MAY replace the account action with “Dashboard” for an authenticated visitor without loading the full Clerk UI runtime or shifting navigation geometry. The H2b desktop navigation SHALL transition from its over-photo top state to the exported compact mint state after the visitor scrolls beyond the top portion of the hero. The navigation SHALL additionally offer a "Blog" destination linking to `/blog`; because that destination is a route rather than an on-page section, it MUST be excluded from scroll-position tracking rather than left permanently unhighlighted.

#### Scenario: Initial desktop nav is static and safe

- **WHEN** any visitor receives the initial desktop marketing HTML
- **THEN** the H2b navigation shows “Cómo funciona”, “Ocasiones”, “Ejemplos”, “Blog”, “Iniciar sesión”, and “Crear mi wishlist”
- **AND** rendering that HTML does not require server-side authentication

#### Scenario: Blog destination navigates rather than scrolling

- **WHEN** a visitor activates the "Blog" navigation entry
- **THEN** they navigate to `/blog`
- **AND** the entry is never marked active by scroll position while the visitor is on the landing page

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
- **AND** the compact bar retains the brand lockup, “Cómo funciona”, “Ocasiones”, “Ejemplos”, “Blog”, and “Crear mi wishlist”
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
- **AND** the full link set, including "Blog" and the current account action, is reachable by opening an accessible drawer or dialog

#### Scenario: Mobile nav drawer section links work from any route

- **WHEN** the mobile nav drawer renders on a route other than `/`, including the not-found page
- **THEN** its section links resolve against the landing page rather than the current route

#### Scenario: Mobile nav drawer is dismissible

- **WHEN** the mobile nav drawer is open
- **THEN** it can be closed via an explicit close control, clicking outside it, or the Escape key
- **AND** focus returns to the trigger

## ADDED Requirements

### Requirement: Landing-only assets are preloaded by the landing page

Asset preload hints specific to the landing page — its hero imagery and marketing fonts — SHALL be issued by the landing page itself rather than by a shared layout, so that sibling marketing routes do not inherit high-priority fetches for assets they never render.

#### Scenario: Landing preloads its hero

- **WHEN** a visitor loads `/`
- **THEN** the landing hero image and marketing fonts are preloaded as before

#### Scenario: Sibling routes do not inherit landing preloads

- **WHEN** a visitor loads a non-landing marketing page such as `/blog`, `/terms`, or `/privacy`
- **THEN** no preload hint is issued for the landing hero image
