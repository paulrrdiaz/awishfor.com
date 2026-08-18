## ADDED Requirements

### Requirement: Shared chrome for non-landing marketing pages

The system SHALL apply a shared header and footer to every marketing page other than the landing page, owned by a nested route group inside `(marketing)` so the chrome is declared once. The route group MUST NOT alter the public URL of any page it contains.

#### Scenario: Subpages render chrome

- **WHEN** a visitor opens `/blog`, `/blog/[slug]`, `/terms`, or `/privacy`
- **THEN** the shared header renders above the page content
- **AND** the marketing footer renders below it

#### Scenario: URLs are unchanged

- **WHEN** the route group is introduced
- **THEN** `/terms`, `/privacy`, and `/blog` resolve at exactly those paths

#### Scenario: Landing page keeps its own navigation

- **WHEN** a visitor opens `/`
- **THEN** the landing page renders its own hero navigation
- **AND** the shared header does not also render, so no page shows two navigations

### Requirement: Site header composition

The shared header SHALL render on the marketing dark green surface as a static (non-fixed) bar, presenting the A Wish For brand mark linking to `/`, navigation to `Inicio`, `Blog`, and `Contacto`, an account link, and a primary call to action leading to the wishlist creation flow.

#### Scenario: Header destinations

- **WHEN** the shared header renders
- **THEN** the brand mark and "Inicio" link to `/`
- **AND** "Blog" links to `/blog`
- **AND** "Contacto" opens an email draft to the configured support address
- **AND** the primary call to action links to `/create`

#### Scenario: Active destination is marked

- **WHEN** the visitor is on a blog page
- **THEN** the "Blog" navigation entry is visually marked as active
- **AND** the active state is conveyed to assistive technology, not by color alone

#### Scenario: Header is static

- **WHEN** a visitor scrolls a page carrying the shared header
- **THEN** the header scrolls with the content rather than pinning to the viewport

### Requirement: Account link enhancement is preserved

The shared header's account link SHALL carry the marketing account-link data attribute so the existing anonymous-safe enhancement can retarget it for signed-in visitors without introducing an authentication client runtime into the page bundle.

#### Scenario: Signed-out visitor

- **WHEN** a signed-out visitor loads a page carrying the shared header
- **THEN** the account link reads "Iniciar sesión" and points to `/sign-in`

#### Scenario: Signed-in visitor

- **WHEN** a signed-in visitor loads a page carrying the shared header and the enhancement runs
- **THEN** the account link is retargeted to `/dashboard`

#### Scenario: No authentication runtime in the bundle

- **WHEN** a page carrying the shared header loads
- **THEN** no authentication provider client runtime is present in its initial bundle

### Requirement: Shared header is a distinct component

The shared header SHALL be implemented as its own component and MUST NOT be produced by restyling the existing default marketing navigation, which is also rendered by the not-found page and serves as the landing page's small-viewport navigation.

#### Scenario: Not-found page is unaffected

- **WHEN** the shared header is introduced
- **THEN** the not-found page's navigation renders unchanged

#### Scenario: Landing small-viewport navigation is unaffected

- **WHEN** the shared header is introduced
- **THEN** the landing page's small-viewport navigation renders unchanged

### Requirement: Subpages reuse the landing footer

Pages carrying the shared chrome SHALL render the same marketing footer component the landing page renders, including its newsletter band, so subpage chrome is visually identical to the landing surface it matches.

#### Scenario: Footer parity

- **WHEN** a visitor compares the footer on `/blog` with the footer on `/`
- **THEN** both render the same footer composition, including the newsletter band and the brand, navigation, and legal columns

### Requirement: Shared chrome is responsive

The shared header SHALL remain usable at small viewport widths, presenting its navigation and call to action without overflow or clipping.

#### Scenario: Small viewport

- **WHEN** a page carrying the shared header renders below the small-viewport breakpoint
- **THEN** every navigation destination remains reachable
- **AND** the header does not overflow horizontally
