## MODIFIED Requirements

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

### Requirement: Auth-aware navigation and CTAs

The landing navigation SHALL reflect authentication state, SHALL include an anchor link to the occasion picker, and the primary call-to-action SHALL drive visitors to the creation flow.

#### Scenario: Signed-out nav

- **WHEN** a signed-out visitor views the nav
- **THEN** it shows "Cómo funciona", "Ocasiones", "Iniciar sesión", and a primary "Crear mi wishlist" button

#### Scenario: Signed-in nav

- **WHEN** a signed-in visitor views the nav
- **THEN** it shows "Cómo funciona", "Ocasiones", "Dashboard", and "Crear mi wishlist" (via Clerk `<SignedIn>/<SignedOut>`)

#### Scenario: Primary CTA target

- **WHEN** a visitor clicks "Crear mi wishlist" anywhere on the page
- **THEN** they navigate to `/create`

#### Scenario: Secondary CTA target

- **WHEN** a visitor clicks the hero "Ver ejemplo"
- **THEN** the page scrolls to the "Ejemplo real" block

#### Scenario: Ocasiones nav target

- **WHEN** a visitor clicks "Ocasiones" in the nav
- **THEN** the page scrolls to the "Elige tu ocasión" section

## ADDED Requirements

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
