# public-wishlist-page Specification

## Purpose
Defines public wishlist route resolution, visibility rules, indexing behavior, and guest gift drawer behavior.
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

### Requirement: Product departure drawer

For an available or partially purchased gift with a product URL, the public wishlist page SHALL replace direct product navigation with a modal bottom drawer. The drawer SHALL warn that the guest is leaving A Wish For, identify the departure action, show delivery details and one copy action when the wishlist has a delivery address, remind the guest to return and mark the gift as purchased, and expose an `Ir a la tienda` action that opens the product URL in a new browser tab. Opening the drawer SHALL NOT itself navigate away from the wishlist.

The drawer SHALL use the same bottom-drawer presentation at every viewport width: full-width on narrow screens and centered with a constrained width on wider screens. It SHALL remain dismissible through an explicit close affordance, Escape, backdrop interaction, and downward swipe.

#### Scenario: Product action opens departure drawer

- **WHEN** a guest activates `Ver producto` for an available or partially purchased gift with a product URL
- **THEN** the product departure drawer opens over the current wishlist without navigating away
- **AND** the drawer shows `Vas a salir de A Wish For`, the return-and-mark reminder, and an `Ir a la tienda` action

#### Scenario: Store action opens a new tab

- **WHEN** the guest activates `Ir a la tienda` in the product departure drawer
- **THEN** the gift's product URL opens in a new browser tab with safe external-link behavior
- **AND** the A Wish For wishlist remains available in its original tab

#### Scenario: Store action returns a form-origin drawer to the purchase form

- **GIVEN** the guest entered purchase-form values and opened the product view through its `Ver producto` helper
- **WHEN** the guest activates `Ir a la tienda`
- **THEN** the gift's product URL opens in a new browser tab
- **AND** the original tab's same drawer returns to the purchase form with every entered value and selected quantity preserved

#### Scenario: Store action keeps a direct product drawer open

- **GIVEN** the guest opened the product view directly from a gift card's `Ver producto` action
- **WHEN** the guest activates `Ir a la tienda`
- **THEN** the product view remains open in the original tab until the guest explicitly closes it

#### Scenario: Product drawer shows delivery details

- **WHEN** the product departure drawer opens for a wishlist with a delivery address
- **THEN** it shows the composed delivery details in a contained block with one copy action

#### Scenario: Product drawer works without delivery details

- **WHEN** the product departure drawer opens for a wishlist without a delivery address
- **THEN** it omits the delivery introduction, delivery block, and copy action
- **AND** the departure warning, return-and-mark reminder, store action, and close affordance remain available

#### Scenario: Purchased gift has no departure action

- **WHEN** a gift is fully purchased
- **THEN** neither `Ver producto` nor the product departure drawer is available for that gift

#### Scenario: Purchase form helper switches drawer view

- **WHEN** a guest activates the small `Ver producto` helper from the purchase form
- **THEN** the same open drawer switches to the product departure view without nesting another drawer
- **AND** the guest can return to the purchase form with all entered values and selected quantity preserved

### Requirement: Guest purchase drawer

The public wishlist page SHALL allow a guest to open a modal purchase drawer from a non-purchased gift's primary action. The drawer SHALL require a guest name of 2 to 80 characters; accept an optional email validated when present and an optional message of at most 500 characters; omit phone collection; show a quantity selector only when the gift's remaining quantity is greater than one, constrained between one and the remaining quantity; display the exact guest consent copy "Al marcar este regalo como comprado, compartiremos tu nombre y los datos opcionales que ingreses con el creador de la lista."; and surface loading and error states while submitting.

The purchase view SHALL NOT show delivery details. When the gift has a product URL, it SHALL show a small `Ver producto` helper that switches the same drawer to the product departure view. The drawer SHALL use a bottom-drawer presentation at every viewport width, full-width on narrow screens and centered with a constrained width on wider screens, with a scrollable form body and a sticky primary action area.

#### Scenario: Guest opens the purchase drawer

- **WHEN** a guest activates the purchase action on a gift that is not fully purchased
- **THEN** the system opens the purchase drawer showing the required name field, optional email and message fields, consent copy, and a submit action
- **AND** no phone field or delivery block is shown

#### Scenario: Drawer presentation is consistent across viewports

- **WHEN** the purchase interaction opens at any supported viewport width
- **THEN** it renders as a bottom drawer rather than a centered dialog
- **AND** wider viewports constrain and center the drawer content while retaining its bottom edge

#### Scenario: Consent copy is exact

- **WHEN** the purchase drawer renders
- **THEN** it shows the consent copy "Al marcar este regalo como comprado, compartiremos tu nombre y los datos opcionales que ingreses con el creador de la lista."

#### Scenario: Guest name is required

- **WHEN** the guest submits the drawer with an empty name or a name outside 2 to 80 characters
- **THEN** the drawer shows a validation error and does not submit the purchase

#### Scenario: Optional fields are validated

- **WHEN** the guest provides an invalid email or a message longer than 500 characters
- **THEN** the drawer shows a validation error and does not submit the purchase

#### Scenario: Quantity selector visibility

- **WHEN** the gift's remaining quantity is greater than one
- **THEN** the drawer shows a quantity selector constrained between one and the remaining quantity

#### Scenario: Quantity selector hidden for single-unit gifts

- **WHEN** the gift's remaining quantity is one
- **THEN** the drawer does not show a quantity selector and submits a quantity of one

#### Scenario: Product helper is conditional

- **WHEN** the purchase drawer opens for a gift with a product URL
- **THEN** it shows a small `Ver producto` helper
- **AND WHEN** the gift has no product URL
- **THEN** the helper is absent and the rest of the form is unchanged

#### Scenario: Submission states

- **WHEN** the guest submits a valid purchase
- **THEN** the drawer shows a loading state while the request is in flight and an inline retryable error state if the request fails

#### Scenario: Drawer dismissal is accessible

- **WHEN** the guest dismisses the purchase drawer through its close control, Escape, backdrop interaction, or downward swipe
- **THEN** the drawer closes without submitting a purchase and focus returns to the action that opened it

### Requirement: Guest purchase success and undo drawer

After a guest's purchase is confirmed, the same drawer SHALL replace its form with a compact success state showing the eyebrow `ÉXITO`, the personalized headline `¡Gracias, {nombre}! Tu regalo quedó marcado.`, the supporting copy `Gracias por ser parte de este momento`, a plain `Deshacer` action, and an accessible drawer close affordance. This drawer success state SHALL be the only purchase-success feedback and SHALL NOT be duplicated by a separate success toast.

The `Deshacer` action SHALL remain available for the server-backed 60-second undo window without displaying a countdown. It SHALL undo the just-created purchase using the one-time undo token returned at purchase time. When the 60-second window elapses, the drawer SHALL remove the `Deshacer` action while keeping the success state dismissible.

#### Scenario: Success state replaces the form

- **WHEN** a guest's purchase request succeeds
- **THEN** the open drawer replaces the form with the compact personalized success treatment
- **AND** no separate purchase-success toast is shown

#### Scenario: Undo remains available without countdown

- **WHEN** the success state is shown during the first 60 seconds after purchase
- **THEN** it shows a plain `Deshacer` action without countdown text or a countdown ring

#### Scenario: Guest undoes from the success state

- **WHEN** the guest activates `Deshacer` within the 60-second window with a valid, unexpired undo token
- **THEN** the system removes the just-created purchase, refreshes the public gift state, and dismisses the drawer

#### Scenario: Undo window expires

- **WHEN** 60 seconds elapse without the guest activating `Deshacer`
- **THEN** the drawer removes the `Deshacer` action
- **AND** the personalized success state remains dismissible

#### Scenario: Guest closes the success state

- **WHEN** the guest dismisses the success drawer
- **THEN** the drawer closes and the purchase is kept

#### Scenario: Undo failure is surfaced safely

- **WHEN** the undo request fails, for example because the server window expired
- **THEN** the drawer shows an inline error and the purchase remains in place

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

### Requirement: Gift status badge colors are theme-independent

The gift status badge on the public wishlist page SHALL render each purchase status in a fixed colour pair that does not change with the active theme, because status is information the guest must read identically on every wishlist. The pairs are available `#E4F3E8` on `#2F7D43`, partially funded `#FBF1DC` on `#9A6F1E`, and purchased `#EAECEF` on `#71798A`, as specified by the design handoff.

The "★ Infaltable" priority badge is explicitly excluded and SHALL continue to resolve from the active theme's `--accent` / `--accent-foreground` pair.

#### Scenario: Status colours are identical across themes

- **WHEN** the same gift status is rendered under two different theme presets
- **THEN** the badge's background and text colours are identical in both

#### Scenario: Must-have badge stays theme-tinted

- **WHEN** a gift marked "Infaltable" is rendered
- **THEN** its badge resolves from the active theme's accent pair, not from the fixed status colours

### Requirement: Published wishlist snapshot consistency

The metadata and visible page body for one published-wishlist request SHALL be derived from one consistent public wishlist snapshot so that the title, description, cover image, gift statuses, and progress cannot disagree within the same response.

#### Scenario: Wishlist changes during rendering

- **WHEN** a published wishlist changes while a request is producing metadata and page content
- **THEN** the response uses one internally consistent snapshot rather than mixing values from separate reads

### Requirement: Published wishlist cache safety and freshness

Published wishlist presentation data SHALL be reusable across anonymous requests. Draft owner previews, personalized invite state, and inaccessible lifecycle states MUST NOT be stored in the shared published-data cache. A successful mutation that changes public content, design, images, gifts, purchases, purchase undo state, slug, or lifecycle SHALL invalidate every affected published-wishlist cache entry before subsequent page refreshes are served.

#### Scenario: Repeated anonymous published request

- **WHEN** multiple anonymous guests request the same unchanged published wishlist
- **THEN** the system may reuse its public presentation snapshot without reloading an identical complete relation graph for every request

#### Scenario: Purchase invalidates public progress

- **WHEN** a guest successfully purchases or undoes a purchase for a published wishlist
- **THEN** the next refreshed public snapshot reflects the new gift status and progress totals

#### Scenario: Owner changes public presentation

- **WHEN** an owner successfully changes public content, design, cover images, gifts, slug, or lifecycle
- **THEN** affected public URLs do not continue serving the stale cached presentation

#### Scenario: Draft preview is isolated

- **WHEN** an owner views a draft wishlist preview
- **THEN** that owner-specific result is not written to or served from the shared published-data cache

### Requirement: Public interaction behavior survives delivery optimization

Performance optimization SHALL preserve filtering, sorting, product departure, purchase, undo, progress refresh, share, and RSVP behavior. Deferring non-critical client code SHALL NOT prevent the first user interaction from completing or make keyboard focus restoration inaccessible.

#### Scenario: Deferred purchase interaction is activated

- **WHEN** a guest activates a gift purchase action before its non-critical drawer code has loaded
- **THEN** the system loads and opens the purchase interaction from that activation without requiring a second click

#### Scenario: Purchase refresh keeps filter state

- **WHEN** a purchase or undo refreshes an optimized public page
- **THEN** the active gift filter and sort selection remain applied as already specified
