## MODIFIED Requirements

### Requirement: Multi-step wizard navigation
The wizard SHALL route between the steps `event-type`, `details`, `design`, `gifts`, and `publish` via the `?step=` query param, falling back to the first step for a missing or unknown value, and SHALL provide Back/Next controls that move between adjacent steps in that order.

#### Scenario: Navigating forward and back
- **WHEN** the user is on the `details` step and activates Next, then Back
- **THEN** the wizard renders the `design` step, then returns to the `details` step, with the `?step=` query param reflecting the active step

#### Scenario: Gifts step advances to publish
- **WHEN** the user is on the `gifts` step and activates Next
- **THEN** the wizard renders the `publish` step with `?step=publish`

#### Scenario: Publish step navigates back to gifts
- **WHEN** the user is on the `publish` step and activates Back
- **THEN** the wizard renders the `gifts` step with `?step=gifts`

#### Scenario: Unknown step falls back
- **WHEN** the URL contains a `step` value that is not one of the known steps
- **THEN** the wizard renders the first (`event-type`) step

## ADDED Requirements

### Requirement: Final publish step preview
The wizard SHALL provide a final publish step that renders an embedded preview of the current local draft using the public wishlist preview mode and SHALL provide a full-page owner preview action before publish.

#### Scenario: Final preview renders current draft
- **WHEN** the user opens `/create?step=publish` with a local draft
- **THEN** the step renders an embedded public wishlist preview using the current draft content, design selections, categories, and visible gifts

#### Scenario: Final preview disables guest actions
- **WHEN** the final embedded preview renders gifts
- **THEN** guest purchase actions are disabled and no purchase mutation can be triggered from the preview

#### Scenario: Full page preview is available before publish
- **WHEN** the user opens the final publish step before the wishlist is published
- **THEN** the step provides a full-page preview action for the owner without exposing the draft as a public wishlist to non-owners

### Requirement: Publish readiness checklist on final step
The final publish step SHALL show a checklist-friendly readiness result for title, event type, slug, language, currency, and at least one visible gift, and SHALL block publish while any required item is unsatisfied.

#### Scenario: Ready draft enables publish
- **WHEN** the local draft has a title, event type, valid available slug, language, currency, and at least one visible gift
- **THEN** the checklist shows every item satisfied and the publish action is enabled for an authenticated user

#### Scenario: Missing readiness item blocks publish
- **WHEN** any required readiness item is missing, invalid, unavailable, or unsatisfied
- **THEN** the checklist identifies the failed item and the publish action remains disabled

#### Scenario: Hidden gifts do not satisfy readiness
- **WHEN** the draft has gifts but all of them are hidden
- **THEN** the visible gift checklist item is unsatisfied and publish remains blocked

### Requirement: Publish authentication gate
The final publish step SHALL require authentication before sending a publish mutation. Signed-out users SHALL be prompted to sign in and the local draft SHALL remain intact.

#### Scenario: Signed-out user tries to publish
- **WHEN** a signed-out user activates the publish action from the final step
- **THEN** the wizard shows an authentication prompt and sends no publish mutation

#### Scenario: Signed-out draft is preserved through auth prompt
- **WHEN** a signed-out user is prompted to authenticate before publishing
- **THEN** the local wizard draft remains persisted so the user can return to `/create?step=publish`

#### Scenario: Signed-in user can publish
- **WHEN** a signed-in user activates publish for a ready draft
- **THEN** the wizard sends one publish request and prevents duplicate publish activation until the request finishes

### Requirement: Publish success and share state
After a successful publish, the wizard SHALL remain on the final step and render a success/share state containing the public wishlist URL and actions to copy the link, share by WhatsApp, download a QR code, view the public wishlist, and manage the wishlist in the dashboard.

#### Scenario: Successful publish stays on final step
- **WHEN** the publish request succeeds
- **THEN** the wizard remains on `/create?step=publish` and shows the published success/share state

#### Scenario: Share actions use public URL
- **WHEN** the success/share state renders
- **THEN** copy-link, WhatsApp, QR download, and public wishlist actions all use the canonical `/w/[slug]` public wishlist URL returned for the published wishlist

#### Scenario: WhatsApp share uses Spanish invitation copy
- **WHEN** the user activates the WhatsApp share action
- **THEN** the system opens a WhatsApp share URL containing Spanish invitation text and the public wishlist URL

### Requirement: Local draft clears after successful publish
The wizard SHALL clear the persisted local draft, saved draft metadata, stale recovery state, and wizard store content after a successful publish, while preserving the publish success/share state for the current page session.

#### Scenario: Local storage clears after publish
- **WHEN** a wishlist is successfully published from the wizard
- **THEN** the Zustand/localStorage draft data and saved-draft metadata are cleared

#### Scenario: Success state remains after clearing draft
- **WHEN** the local draft is cleared after publish
- **THEN** the user still sees the current publish success/share state until leaving or restarting the wizard
