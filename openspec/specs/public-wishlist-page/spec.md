# public-wishlist-page Specification

## Purpose
Defines public wishlist route resolution, visibility rules, indexing behavior, and guest purchase modal behavior.
## Requirements
### Requirement: Resolve a wishlist by slug

The system SHALL resolve a public slug to a single result describing how it may be shown: a published wishlist, an owner-only draft preview, an archived inactive state, or not found.

#### Scenario: Published wishlist resolves to a public result

- **WHEN** a slug maps to a wishlist with status `published`
- **THEN** the result is a published public wishlist view model

#### Scenario: Unknown slug resolves to not found

- **WHEN** a slug maps to no wishlist
- **THEN** the result is not found

### Requirement: Draft access is owner-only

The system SHALL return a draft wishlist only to its owner, as a preview, and SHALL return not found for any other viewer so that draft existence does not leak.

#### Scenario: Owner sees a draft preview

- **WHEN** the viewer's identity matches the wishlist owner and the wishlist status is `draft`
- **THEN** the result is an owner draft preview

#### Scenario: Non-owner cannot see a draft

- **WHEN** a wishlist has status `draft` and the viewer is signed out or is not the owner
- **THEN** the result is not found, indistinguishable from an unknown slug

### Requirement: Archived wishlists render an inactive state

The system SHALL resolve an archived wishlist to an inactive-state result rather than the full public gift list.

#### Scenario: Archived wishlist resolves to archived state

- **WHEN** a slug maps to a wishlist with status `archived`
- **THEN** the result is an archived inactive state and does not include the public gift list

### Requirement: Hidden and soft-deleted gifts never appear publicly

The system SHALL exclude every hidden gift and every soft-deleted gift from any public result, and SHALL exclude guest contact data and internal notes.

#### Scenario: Hidden gift is excluded

- **WHEN** a published wishlist contains a gift with visibility status `hidden`
- **THEN** the public result does not include that gift

#### Scenario: Soft-deleted gift is excluded

- **WHEN** a published wishlist contains a gift with `deletedAt` set
- **THEN** the public result does not include that gift

### Requirement: Public route at /w/[slug]

The system SHALL serve public wishlists at the URL path `/w/[slug]` and SHALL render the published wishlist, an owner preview with a preview banner, an archived message, or a not-found response according to the resolved result.

#### Scenario: Published wishlist is served at its slug

- **WHEN** a request reaches `/w/[slug]` for a published wishlist
- **THEN** the published wishlist is rendered

#### Scenario: Not-found result returns a 404

- **WHEN** the resolved result is not found
- **THEN** the route returns a 404 not-found response

#### Scenario: Owner preview shows a banner

- **WHEN** the resolved result is an owner draft preview
- **THEN** the page renders the wishlist with a preview banner indicating it is not yet public

### Requirement: Public wishlist pages are noindex

The system SHALL mark every `/w/[slug]` response as `noindex` so public wishlist pages are not indexed by search engines, while marketing pages remain indexable.

#### Scenario: Public wishlist page is not indexed

- **WHEN** metadata is generated for any `/w/[slug]` response
- **THEN** the metadata instructs search engines not to index the page

### Requirement: Guest purchase modal

The public wishlist page SHALL allow a guest to open a purchase modal from a non-purchased gift's primary action. The modal SHALL require a guest name of 2 to 80 characters; accept an optional email validated when present, an optional phone validated when present, and an optional message of at most 500 characters; show a quantity selector only when the gift's remaining quantity is greater than one, constrained between one and the remaining quantity; display the exact guest consent copy "Al marcar este regalo como comprado, compartiremos tu nombre y los datos opcionales que ingreses con el creador de la lista."; and surface loading and error states while submitting. The product link SHALL be disabled for gifts whose public status is purchased.

The modal SHALL render as a bottom sheet on mobile (below `md`) and as a centered dialog at `md` and above, with a sticky 48px footer holding the primary actions.

#### Scenario: Guest opens the purchase modal
- **WHEN** a guest activates the purchase action on a gift that is not fully purchased
- **THEN** the system opens the purchase modal showing the name field, optional contact and message fields, consent copy, and a submit action

#### Scenario: Responsive presentation
- **WHEN** the modal opens on a viewport below `md`
- **THEN** it renders as a bottom sheet with a sticky 48px footer
- **AND** at `md` and above it renders as a centered dialog with a sticky 48px footer

#### Scenario: Consent copy is exact
- **WHEN** the purchase modal renders
- **THEN** it shows the consent copy "Al marcar este regalo como comprado, compartiremos tu nombre y los datos opcionales que ingreses con el creador de la lista."

#### Scenario: Guest name is required
- **WHEN** the guest submits the modal with an empty name or a name outside 2 to 80 characters
- **THEN** the modal shows a validation error and does not submit the purchase

#### Scenario: Optional contact and message validation
- **WHEN** the guest provides an invalid email, an invalid phone, or a message longer than 500 characters
- **THEN** the modal shows a validation error and does not submit the purchase

#### Scenario: Quantity selector visibility
- **WHEN** the gift's remaining quantity is greater than one
- **THEN** the modal shows a quantity selector constrained between one and the remaining quantity

#### Scenario: Quantity selector hidden for single-unit gifts
- **WHEN** the gift's remaining quantity is one
- **THEN** the modal does not show a quantity selector and submits a quantity of one

#### Scenario: Submission states
- **WHEN** the guest submits a valid purchase
- **THEN** the modal shows a loading state while the request is in flight and shows an error state if the request fails

#### Scenario: Purchased gift product link disabled
- **WHEN** a gift's public status is purchased
- **THEN** the gift's product link is disabled

### Requirement: Guest purchase success and undo state

After a guest's purchase is confirmed, the purchase modal SHALL replace its form with a success state that shows the personalized thank-you copy "¡Gracias, {nombre}! Tu regalo fue marcado como comprado. Gracias por tu cariño y por ser parte de este momento." (interpolating the guest's entered name, with a non-personalized fallback when the name is unavailable), a `Deshacer` action, and a `Cerrar` action. The `Deshacer` action SHALL display a live countdown over an 8-second undo window and SHALL undo the just-created purchase using the one-time undo token returned at purchase time. When the 8-second window elapses, the modal SHALL replace the `Deshacer` action with the message "el tiempo para deshacer expiró" while keeping `Cerrar`. The `Cerrar` action SHALL dismiss the modal and keep the purchase.

#### Scenario: Success state shown after purchase

- **WHEN** a guest's purchase request succeeds
- **THEN** the modal shows the personalized thank-you copy including the guest's name with a `Deshacer` action and a `Cerrar` action instead of the form

#### Scenario: Undo countdown ticks down

- **WHEN** the success state is shown
- **THEN** the `Deshacer` action displays a countdown that decrements from 8 seconds toward 0

#### Scenario: Guest undoes from the success state

- **WHEN** the guest activates `Deshacer` within the countdown window with a valid, unexpired undo token
- **THEN** the modal triggers the undo, the purchase is removed, and the modal reflects that the purchase was undone

#### Scenario: Undo window expires

- **WHEN** the 8-second undo window elapses without the guest activating `Deshacer`
- **THEN** the modal replaces the `Deshacer` action with the message "el tiempo para deshacer expiró"
- **AND** the `Cerrar` action remains available

#### Scenario: Guest closes the success state

- **WHEN** the guest activates `Cerrar` in the success state
- **THEN** the modal closes and the purchase is kept

#### Scenario: Undo failure is surfaced safely

- **WHEN** the undo request fails, for example because the window expired
- **THEN** the modal shows an error state and the purchase remains in place

### Requirement: Public page refresh after purchase or undo

After a guest's purchase succeeds and after a guest's undo succeeds, the public wishlist page SHALL refresh its server-rendered data so that affected gifts reflect their new status and per-gift quantity progress, fully purchased gifts move into the purchased grouping with their purchase action removed, and the progress summary reflects the updated purchased and remaining counts, all without requiring a manual full-page reload. The guest's active filter and sort selections SHALL be preserved across the refresh.

#### Scenario: Page reflects a completed purchase

- **WHEN** a guest completes a purchase that fully covers a gift's remaining quantity
- **THEN** after the refresh the gift appears as purchased, its purchase action is removed, it is grouped with purchased gifts, and the progress summary shows the increased purchased count

#### Scenario: Page reflects a partial purchase

- **WHEN** a guest completes a purchase that covers only part of a gift's remaining quantity
- **THEN** after the refresh the gift remains available with reduced remaining quantity and the progress summary shows the increased purchased count

#### Scenario: Page reflects an undo

- **WHEN** a guest undoes a just-created purchase
- **THEN** after the refresh the gift returns to its prior status with restored remaining quantity and the progress summary shows the decreased purchased count

#### Scenario: Filters survive the refresh

- **WHEN** the public page refreshes after a purchase or undo
- **THEN** the guest's active filter and sort selections remain applied

