## MODIFIED Requirements

### Requirement: Wizard route with step routing

The system SHALL serve the creation wizard at `/create` and render the active step based on a query parameter (e.g. `?step=event-type`). The recognized steps SHALL be `event-type`, `details`, `layout`, `theme`, `images`, `gifts`, `review`, and `published`, in that order. The route SHALL be publicly accessible without authentication.

#### Scenario: Unauthenticated user opens the wizard

- **WHEN** a signed-out user navigates to `/create`
- **THEN** the wizard shell renders without redirecting to sign-in

#### Scenario: Step selected by query param

- **WHEN** the URL contains a recognized `step` query param
- **THEN** the wizard renders that step; for a missing or unknown value it falls back to the first (event-type) step

#### Scenario: Retired step ids fall back

- **WHEN** the URL carries a step id from the previous flow such as `design` or `publish`
- **THEN** the wizard treats it as unknown and renders the first step rather than erroring

### Requirement: Multi-step wizard navigation

The wizard SHALL route between the steps `event-type`, `details`, `layout`, `theme`, `images`, `gifts`, `review`, and `published` via the `?step=` query param, falling back to the first step for a missing or unknown value, and SHALL provide Back/Next controls that move between adjacent steps in that order. The `published` step SHALL be terminal: it SHALL offer no Back control and SHALL NOT be reachable by forward navigation from `review` except as the result of a successful publish.

#### Scenario: Navigating forward and back

- **WHEN** the user is on the `details` step and activates Next, then Back
- **THEN** the wizard renders the `layout` step, then returns to the `details` step, with the `?step=` query param reflecting the active step

#### Scenario: Gifts step advances to review

- **WHEN** the user is on the `gifts` step and activates Next
- **THEN** the wizard renders the `review` step with `?step=review`

#### Scenario: Review step navigates back to gifts

- **WHEN** the user is on the `review` step and activates Back
- **THEN** the wizard renders the `gifts` step with `?step=gifts`

#### Scenario: Published step offers no back navigation

- **WHEN** the `published` step renders after a successful publish
- **THEN** no Back control is presented and the footer offers only the forward actions

#### Scenario: Direct visit to published without a publish redirects

- **WHEN** a user navigates to `?step=published` with no publish success in the wizard store
- **THEN** the wizard redirects to the `review` step instead of rendering an empty success screen

### Requirement: Gifts step with local draft gifts

The Gifts step SHALL let the user import, add, and remove gifts that are stored in the wizard draft store as local draft gifts (no database write). Each gift SHALL support a name, optional product URL, optional image, optional price, a category assignment, a quantity, a priority, and public and internal notes. The step SHALL provide a URL-import entry point, category management, and a manual add action, and SHALL offer a delete action for each gift. Editing an existing gift, toggling its visibility, and reordering gifts SHALL NOT be offered in the wizard; those actions live in `/dashboard/wishlists/[id]/gifts` after the wishlist exists.

#### Scenario: Add a manual gift without a product URL

- **WHEN** the user fills in a gift name (and no product URL) and saves
- **THEN** a draft gift is added to the store and appears in the gift list

#### Scenario: Assign category and quantity

- **WHEN** the user assigns a gift to one of the draft categories and sets a quantity
- **THEN** the draft gift stores that category and quantity

#### Scenario: Remove a gift

- **WHEN** the user activates delete for a gift in the Gifts step
- **THEN** the gift is removed from the draft store and disappears from the list and the preview

#### Scenario: No edit affordance in the wizard

- **WHEN** the Gifts step renders its gift list
- **THEN** it offers no edit, hide, or reorder control for an existing gift

### Requirement: Final publish step preview

The `review` step SHALL render an embedded preview of the current local draft using the public wishlist preview mode, labeled "Así lo verán tus invitados", together with a banner marking the list as not yet public, and SHALL provide a full-page owner preview action before publish.

#### Scenario: Review preview renders current draft

- **WHEN** the user opens `/create?step=review` with a local draft
- **THEN** the step renders an embedded public wishlist preview labeled "Así lo verán tus invitados" using the current draft content, design selections, categories, and visible gifts

#### Scenario: Preview is marked as not public

- **WHEN** the review preview renders
- **THEN** a banner states that the list is not yet public

#### Scenario: Review preview disables guest actions

- **WHEN** the review embedded preview renders gifts
- **THEN** guest purchase actions are disabled and no purchase mutation can be triggered from the preview

#### Scenario: Full page preview is available before publish

- **WHEN** the user opens the review step before the wishlist is published
- **THEN** the step provides a full-page preview action for the owner without exposing the draft as a public wishlist to non-owners

### Requirement: Publish readiness checklist on final step

The `review` step SHALL show a checklist-friendly readiness result grouped into the four items the design presents — name and occasion, cover images, layout and theme, and visible gifts — and SHALL block publish while any required item is unsatisfied. Each item SHALL name the specific value or shortfall rather than only its state.

#### Scenario: Ready draft enables publish

- **WHEN** the local draft satisfies every readiness requirement including its layout's cover-image slots
- **THEN** the checklist shows every item satisfied and the publish action is enabled for an authenticated user

#### Scenario: Missing readiness item blocks publish

- **WHEN** any required readiness item is missing, invalid, unavailable, or unsatisfied
- **THEN** the checklist identifies the failed item and the publish action remains disabled

#### Scenario: Checklist items are specific

- **WHEN** the checklist renders a satisfied name-and-occasion item
- **THEN** it shows the draft's name and occasion rather than a bare check

#### Scenario: Insufficient images block publish

- **WHEN** the draft has fewer cover images than the selected layout renders
- **THEN** the cover-images checklist item is unsatisfied and publish remains blocked

#### Scenario: Hidden gifts do not satisfy readiness

- **WHEN** the draft has gifts but all of them are hidden
- **THEN** the visible gift checklist item is unsatisfied and publish remains blocked

### Requirement: Publish authentication gate

The `review` step SHALL require authentication before sending a publish mutation. Signed-out users SHALL be prompted to sign in with reassurance copy that "tu progreso ya está guardado", and the local draft SHALL remain intact.

#### Scenario: Signed-out user tries to publish

- **WHEN** a signed-out user activates the publish action from the review step
- **THEN** the wizard shows an authentication prompt including the copy "tu progreso ya está guardado" and sends no publish mutation

#### Scenario: Signed-out draft is preserved through auth prompt

- **WHEN** a signed-out user is prompted to authenticate before publishing
- **THEN** the local wizard draft remains persisted so the user can return to `/create?step=review`

#### Scenario: Signed-in user can publish

- **WHEN** a signed-in user activates publish for a ready draft
- **THEN** the wizard sends one publish request and prevents duplicate publish activation until the request finishes

### Requirement: Publish success and share state

After a successful publish the wizard SHALL advance to the `published` step and render a confirmation containing the public wishlist URL with a copy action, three share actions labeled "WhatsApp", "QR" and "Email", a primary "Ver mi página" action, and a secondary action leading to the wishlist's dashboard. The dashboard action SHALL be present because the published step is terminal and gift editing lives in the dashboard.

#### Scenario: Successful publish advances to the published step

- **WHEN** the publish request succeeds
- **THEN** the wizard navigates to `/create?step=published` and shows the confirmation

#### Scenario: Confirmation shows the URL and its actions

- **WHEN** the published step renders
- **THEN** it shows the public URL with a copy action, the "WhatsApp", "QR" and "Email" share actions, a primary "Ver mi página" action, and a secondary action to manage the wishlist in the dashboard

#### Scenario: Share actions use public URL

- **WHEN** the published step renders
- **THEN** copy-link, WhatsApp, QR download, email, and public wishlist actions all use the canonical `/w/[slug]` public wishlist URL returned for the published wishlist

#### Scenario: WhatsApp share uses Spanish invitation copy

- **WHEN** the user activates the WhatsApp share action
- **THEN** the system opens a WhatsApp share URL containing Spanish invitation text and the public wishlist URL

#### Scenario: Email share opens a prefilled message

- **WHEN** the user activates the Email share action
- **THEN** the system opens a mail composition URL with Spanish invitation text and the public wishlist URL

### Requirement: Local draft clears after successful publish

The wizard SHALL clear the persisted local draft, saved draft metadata, stale recovery state, and wizard store content after a successful publish, while preserving the publish success state that the `published` step renders for the current page session.

#### Scenario: Local storage clears after publish

- **WHEN** a wishlist is successfully published from the wizard
- **THEN** the Zustand/localStorage draft data and saved-draft metadata are cleared

#### Scenario: Published step survives the clearing

- **WHEN** the local draft is cleared after publish
- **THEN** the `published` step still renders its confirmation and share actions until the user leaves or restarts the wizard

### Requirement: Desktop wizard header shows the product wordmark

The desktop (`lg` and up) wizard card header SHALL display the `isotype.svg` mark on its left and the "Guardar borrador" action on its right, on every step except `published`. The header SHALL NOT render the "A Wish For" serif wordmark alongside the mark. The mobile wizard chrome SHALL NOT show the mark.

#### Scenario: Desktop header shows the isotype and save action

- **WHEN** the wizard is viewed at a desktop viewport width (`lg` and up) on any step before `published`
- **THEN** the card header's left side shows the isotype mark (26px tall) with no wordmark text, and the right side shows the "Guardar borrador" action

#### Scenario: Published step drops the save action

- **WHEN** the `published` step renders
- **THEN** the header shows no "Guardar borrador" action, because the draft has already been published and cleared

#### Scenario: Mobile header has no mark

- **WHEN** the wizard is viewed at a mobile viewport width
- **THEN** the sticky mobile chrome does not render the isotype mark or "A Wish For" wordmark

