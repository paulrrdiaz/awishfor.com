## ADDED Requirements

### Requirement: Standalone wishlist branded footer

The system SHALL end every standalone published wishlist, personalized guest wishlist, and owner draft-preview wishlist with the reusable A Wish For footer body from the marketing page. The body SHALL include the established brand logo and description, product and occasion navigation, legal and contact navigation, free-service callout, and copyright treatment. It SHALL NOT include the marketing newsletter band, email field, or newsletter submit action.

#### Scenario: Published wishlist shows branded body without newsletter

- **WHEN** a published wishlist renders as a standalone page
- **THEN** the A Wish For logo/navigation/legal footer body appears after the wishlist content
- **AND** no "Ideas para tu próximo evento" newsletter band, email field, or "Unirme" action appears

#### Scenario: Personalized wishlist uses the same footer

- **WHEN** a personalized `/w/[slug]/[guestSlug]` wishlist renders
- **THEN** it ends with the same branded footer body as the non-personalized public route

#### Scenario: Owner draft preview uses the standalone footer

- **WHEN** a wishlist owner opens an unpublished wishlist at its standalone public URL
- **THEN** the preview banner and disabled guest actions remain
- **AND** the page ends with the expanded branded footer body

#### Scenario: Thank-you message remains before the footer

- **WHEN** a standalone wishlist has a thank-you message
- **THEN** the thank-you message renders after the gift list and immediately before the branded footer

### Requirement: Wishlist footer inherits the selected public theme

The standalone wishlist footer SHALL render inside the wishlist's `PublicThemeProvider` scope and SHALL derive its surfaces, foregrounds, borders, focus treatments, and typography from the selected public theme's semantic variables and resolved public fonts. It SHALL NOT depend on the fixed `.marketing-theme` palette, global app tokens outside the scope, or per-theme footer class names.

#### Scenario: Footer changes with selected theme

- **WHEN** two standalone wishlists use different `themeId` values
- **THEN** each footer resolves its accent surface, foreground, border, and font styling from its own `.public-theme` wrapper

#### Scenario: Theme scope does not leak

- **WHEN** a themed wishlist footer renders
- **THEN** it does not mutate `:root`, the dashboard theme, the marketing theme, or another public preview's variables

#### Scenario: Missing theme uses the default palette

- **WHEN** a standalone wishlist has a null or unknown `themeId`
- **THEN** its footer uses the same default resolved public theme as the rest of that wishlist

### Requirement: Footer presentation follows render surface

The public wishlist shell SHALL distinguish standalone pages from embedded previews independently of its full, preview, and compact interaction modes. Standalone full and standalone owner-preview pages SHALL render the expanded branded footer. Embedded wizard and dashboard previews SHALL retain a compact footer presentation suitable for their constrained pane. Compact marketing-demo rendering SHALL omit the footer. All nine public layout variants SHALL receive footer presentation from the shared page shell rather than rendering independent footer implementations.

#### Scenario: Embedded preview stays compact

- **WHEN** a wishlist renders inside a wizard or dashboard preview pane
- **THEN** it does not render the expanded logo/navigation/legal footer body
- **AND** it retains a compact public footer treatment

#### Scenario: Compact demo omits footer

- **WHEN** a wishlist renders in compact marketing-demo mode
- **THEN** neither the expanded nor compact wishlist footer renders

#### Scenario: Every layout receives the standalone footer

- **WHEN** each of the nine public layout variants renders on a standalone wishlist route
- **THEN** the shared page shell appends the same expanded footer after the layout content

#### Scenario: Collage layout does not keep a bespoke footer

- **WHEN** `collage-staggered` renders in any public-page surface
- **THEN** its footer behavior is selected by the shared public page shell identically to the other eight layouts

### Requirement: Wishlist footer navigation resolves outside the wishlist route

Links in the shared footer body that target marketing-page sections SHALL use root-qualified fragments, while creation and legal links SHALL retain absolute application paths, so every destination works when activated from `/w/*`.

#### Scenario: Product navigation reaches the marketing page

- **WHEN** a guest activates a footer link for "Cómo funciona", "Temas y estilos", "Ver ejemplos", or "Preguntas frecuentes" from a wishlist route
- **THEN** navigation targets the matching section on `/` rather than a nonexistent fragment within `/w/*`

#### Scenario: Occasion and legal navigation retains working routes

- **WHEN** a guest activates an occasion, privacy, terms, or contact destination from the wishlist footer
- **THEN** occasion links target `/create`, legal links target `/privacy` or `/terms`, and contact opens the configured support-email draft
