## ADDED Requirements

### Requirement: Branded not-found boundary for public wishlist routes

The system SHALL render a branded, Spanish-language not-found page for requests to public wishlist routes that do not resolve, styled with the default public theme (Cielo Suave) and offering the guest a path back into the product.

#### Scenario: Unknown slug renders the public not-found page

- **WHEN** a guest requests `/w/<slug>` for a slug that resolves to a not-found result
- **THEN** the public not-found page renders with the heading `Este regalo se nos escapó`
- **AND** it shows the message `No encontramos la lista que buscas. Puede que el enlace haya cambiado o que la wishlist ya no esté disponible.`
- **AND** it offers a `Volver al inicio` action linking to `/` and a `Crear mi wishlist` action linking to `/create`

#### Scenario: Personalized invite routes reuse the public not-found page

- **WHEN** a request to `/w/<slug>/<guestSlug>` resolves to a not-found result
- **THEN** the public not-found page renders

#### Scenario: Public not-found page carries public chrome

- **WHEN** the public not-found page renders
- **THEN** it displays the isotype and the `awishfor.com` wordmark
- **AND** its surfaces use the Cielo Suave theme tokens rather than the marketing or app palettes

### Requirement: Branded not-found boundary for unmatched site routes

The system SHALL render a branded, Spanish-language not-found page in the marketing theme for requests to URLs that match no route.

#### Scenario: Unmatched URL renders the marketing not-found page

- **WHEN** a visitor requests a URL that matches no route
- **THEN** the marketing not-found page renders with the heading `Se nos escapó esta página`
- **AND** it shows the message `Buscamos por todas partes y no dimos con ella. Puede que el enlace esté incompleto o que la página se haya mudado.`
- **AND** it offers a `Volver al inicio` action and a `Ver un ejemplo` action

#### Scenario: Marketing not-found page carries marketing chrome

- **WHEN** the marketing not-found page renders
- **THEN** it displays the full logo and the marketing navigation
- **AND** its surfaces use the marketing theme tokens

### Requirement: Branded not-found boundary for dashboard wishlist routes

The system SHALL render a branded, Spanish-language not-found page in the application theme when an authenticated owner requests a wishlist detail route that does not resolve, and that page SHALL remain within the dashboard shell.

#### Scenario: Unknown wishlist id renders the dashboard not-found page

- **WHEN** an authenticated owner requests a route under `/dashboard/wishlists/<id>` for an id they do not own or that does not exist
- **THEN** the dashboard not-found page renders with Spanish copy indicating the wishlist was not found
- **AND** it offers an action returning the owner to their wishlist list

#### Scenario: Dashboard not-found page keeps the dashboard shell

- **WHEN** the dashboard not-found page renders
- **THEN** the dashboard sidebar remains visible
- **AND** the page does not display marketing navigation or marketing CTAs

#### Scenario: Boundary covers the detail layout

- **WHEN** the wishlist detail layout itself fails to resolve the wishlist and triggers a not-found
- **THEN** the dashboard not-found page renders without attempting to render the wishlist detail navigation

### Requirement: Shared escaped-gift illustration

The system SHALL render a shared illustration on every not-found page consisting of the digits `4` and `4` flanking a gift box suspended from a string, surrounded by confetti and sparkle elements, whose fill and ribbon colors are configurable per surface.

#### Scenario: Illustration adopts the surrounding theme

- **WHEN** the illustration renders on a not-found page
- **THEN** its gift-box fill and ribbon colors resolve from the values supplied by that page
- **AND** the same component is used across the public, marketing, and dashboard not-found pages

#### Scenario: Illustration is decorative for assistive technology

- **WHEN** a screen reader traverses a not-found page
- **THEN** the illustration is not announced as meaningful content
- **AND** the heading and message convey the not-found state

### Requirement: Looping motion on the escaped-gift illustration

The system SHALL animate the escaped-gift illustration as a continuous loop: the gift box drifting vertically while rotating slightly, its string swaying, confetti falling and rotating, and sparkles twinkling.

#### Scenario: Motion loops without user interaction

- **WHEN** a not-found page loads with motion enabled
- **THEN** the gift box, string, confetti, and sparkles animate continuously
- **AND** the loop requires no scrolling, hovering, or clicking to begin

#### Scenario: Confetti timing is deterministic across renders

- **WHEN** the illustration renders on the server and hydrates on the client
- **THEN** each confetti element's position and timing values are identical between the two renders

### Requirement: Legible resting state without motion

The system SHALL render every not-found page fully legible and visually complete when motion does not run, whether because the visitor prefers reduced motion or because client-side scripting is unavailable.

#### Scenario: Reduced-motion preference suppresses the loop

- **WHEN** a visitor with `prefers-reduced-motion: reduce` opens a not-found page
- **THEN** no looping animation runs

#### Scenario: Decorative elements remain visible at rest

- **WHEN** motion does not run on a not-found page
- **THEN** the confetti and sparkle elements are visible at their resting positions rather than hidden
- **AND** the heading, message, and all recovery actions are visible and usable

### Requirement: Not-found responses carry a 404 status

The system SHALL return HTTP status 404 for every request that renders a not-found page.

#### Scenario: Public not-found response status

- **WHEN** a request to `/w/<slug>` resolves to a not-found result
- **THEN** the response status is 404

#### Scenario: Unmatched route response status

- **WHEN** a request matches no route
- **THEN** the response status is 404

#### Scenario: Dashboard not-found response status

- **WHEN** a request to a wishlist detail route resolves to a not-found result
- **THEN** the response status is 404
