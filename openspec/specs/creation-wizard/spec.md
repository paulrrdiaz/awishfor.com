# creation-wizard Specification

## Purpose
TBD - update purpose after archive.
## Requirements
### Requirement: Wizard route with step routing

The system SHALL serve the creation wizard at `/create` and render the active step based on a query parameter (e.g. `?step=event-type`). The route SHALL be publicly accessible without authentication.

#### Scenario: Unauthenticated user opens the wizard

- **WHEN** a signed-out user navigates to `/create`
- **THEN** the wizard shell renders without redirecting to sign-in

#### Scenario: Step selected by query param

- **WHEN** the URL contains a recognized `step` query param
- **THEN** the wizard renders that step; for a missing or unknown value it falls back to the first (event-type) step

### Requirement: Local draft store with persistence

The system SHALL hold the in-progress wishlist draft in a Zustand store (`src/stores/wishlist-wizard.store.ts`) and persist it to `localStorage`. The persisted draft SHALL be restored on reload.

#### Scenario: Draft survives reload

- **WHEN** the user edits the draft and reloads the page
- **THEN** the restored draft reflects the edits made before reload

#### Scenario: Reset clears the draft

- **WHEN** the user triggers reset / start over
- **THEN** the store and its persisted copy are cleared and the wizard returns to an empty first step

### Requirement: Stale draft recovery

The store SHALL record the draft's last-updated timestamp and treat a draft older than 30 days as stale. When a stale draft is detected on load, the system SHALL prompt the user to continue or start over rather than silently resuming.

#### Scenario: Old draft prompts before resuming

- **WHEN** a persisted draft older than 30 days is loaded
- **THEN** the user is shown a recovery prompt to continue or discard before editing proceeds

#### Scenario: Fresh draft resumes silently

- **WHEN** a persisted draft newer than 30 days is loaded
- **THEN** the draft resumes without a recovery prompt

### Requirement: Event Type selection step

The Event Type step SHALL present a selectable card per event type using the preset Spanish labels. Selecting an event type SHALL set the draft's `eventType` and seed default categories, default theme/layout, and default copy from the matching preset.

#### Scenario: Selecting an event type seeds defaults

- **WHEN** the user selects an event-type card
- **THEN** the draft's `eventType`, default categories, default theme/layout IDs, and untouched copy fields are populated from that preset

### Requirement: Preset copy does not overwrite user edits

The store SHALL track, local-only, whether each seeded copy field (hero title, welcome message, thank-you message) has been edited by the user (`copyTouched`). Changing the event type SHALL update only copy fields that are still untouched; edited copy SHALL be preserved.

#### Scenario: Edited copy is preserved on event-type change

- **WHEN** the user has edited the welcome message and then changes the event type
- **THEN** the edited welcome message is preserved while untouched copy fields update to the new preset

#### Scenario: Manual regeneration overwrites copy

- **WHEN** the user triggers "regenerate suggested copy"
- **THEN** copy fields are reset to the current preset defaults and their `copyTouched` flags are cleared

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

### Requirement: Event Details step

The Event Details step SHALL let the user edit the draft's title, display name, optional event date, optional event time, optional event location, and optional dress code ("Código de vestimenta"). The event date SHALL be chosen with a calendar in a popover, and the event time SHALL be normalized to `HH:mm`. Title, date, time, location, and dress code SHALL all persist to the draft store. When the selected event date is in the past, the step SHALL show the exact warning copy "Esta fecha ya pasó. Puedes continuar, pero el contador mostrará un mensaje de cierre." without blocking.

#### Scenario: Editing details persists to the draft

- **WHEN** the user enters a title, picks an event date, sets a time, types a location, and types a dress code
- **THEN** the draft store holds the title, the selected date, the time normalized to `HH:mm`, the location, and the dress code

#### Scenario: Event date, time, location, and dress code are optional

- **WHEN** the user leaves the event date, time, location, and dress code empty
- **THEN** the step is still valid and the draft stores null/empty for those fields

#### Scenario: Past event date warns without blocking

- **WHEN** the user selects an event date in the past
- **THEN** the step shows "Esta fecha ya pasó. Puedes continuar, pero el contador mostrará un mensaje de cierre." and the date is still accepted

### Requirement: Slug generation and editable slug

The Event Details step SHALL auto-generate the slug from the title using the shared `slugify` helper until the user manually edits the slug; after a manual edit the slug SHALL stop tracking the title. The slug field SHALL be editable directly.

#### Scenario: Slug auto-fills from title

- **WHEN** the user types a title and has not edited the slug
- **THEN** the slug field updates to the slugified title

#### Scenario: Manual slug edit stops auto-tracking

- **WHEN** the user edits the slug field and then changes the title
- **THEN** the manually edited slug is preserved and does not get overwritten by the new title

### Requirement: Slug availability check for signed-out users

The system SHALL expose the slug-availability check as a publicly callable procedure so that an unauthenticated wizard user can verify a slug. The Event Details step SHALL validate the slug client-side and check availability with a debounced request, surfacing the exact states: `◌ Verificando…` while checking, `✓ Disponible` (with a green ring) when available, `✕ Ya está en uso` when taken, and `✕ Solo letras, números y guiones` when invalid.

#### Scenario: Signed-out user checks an available slug

- **WHEN** a signed-out user enters a syntactically valid, unused slug
- **THEN** an availability request is made and the slug shows `✓ Disponible` with a green ring

#### Scenario: Checking state is shown during the request

- **WHEN** the debounced availability request is in flight
- **THEN** the slug field shows `◌ Verificando…`

#### Scenario: Taken slug is reported

- **WHEN** the user enters a slug that already belongs to an existing wishlist
- **THEN** the slug shows `✕ Ya está en uso`

#### Scenario: Invalid slug is rejected client-side

- **WHEN** the user enters a slug that fails client-side validation
- **THEN** the slug shows `✕ Solo letras, números y guiones` and no availability request is required

### Requirement: Design & Preview step

The Design & Preview step SHALL let the user select a theme, layout, font pairing, and button style from the existing public config presets, writing each selection to the draft, and SHALL render a live preview using the public wishlist layout in preview mode with purchase actions disabled. The theme selector SHALL show all seven theme swatches including `cielo-suave-rosa`, and the embedded preview SHALL be labeled "Vista previa con ejemplos".

#### Scenario: Selecting design options updates the preview

- **WHEN** the user selects a different theme, layout, font pairing, or button style
- **THEN** the draft stores the selected ids and the embedded preview re-renders with those choices

#### Scenario: All seven theme swatches are shown

- **WHEN** the Design & Preview step renders the theme selector
- **THEN** all seven theme swatches are shown, including `cielo-suave-rosa`

#### Scenario: Embedded preview is labeled

- **WHEN** the Design & Preview step renders the embedded preview
- **THEN** the preview is labeled "Vista previa con ejemplos"

#### Scenario: Preview does not mutate purchase state

- **WHEN** the preview renders gifts
- **THEN** purchase actions are disabled and no purchase state can be changed from the preview

### Requirement: Preview uses sample gifts before real gifts exist

The Design & Preview step SHALL render the selected event type's preset `sampleGifts` as placeholder gifts when the draft has no visible user-created gifts, so the preview is never empty.

#### Scenario: Sample gifts shown when draft has no gifts

- **WHEN** the draft has an event type selected but no visible gifts
- **THEN** the preview renders the preset `sampleGifts` as placeholders

#### Scenario: Real gifts replace samples

- **WHEN** the draft has at least one visible user-created gift
- **THEN** the preview renders the user's gifts instead of the sample gifts

### Requirement: Gifts step with local draft gifts

The Gifts step SHALL let the user add, edit, and remove gifts that are stored in the wizard draft store as local draft gifts (no database write). Each gift SHALL support a name, optional product URL, optional image, optional price, a category assignment, a quantity, a priority, public and internal notes, and a hide toggle. The edit action SHALL open a drawer for the selected draft gift while preserving the Gifts step list and preview context. The selected draft gift id SHALL be represented in the URL query string so the drawer state is addressable and clearable. A URL-import entry point SHALL be present as a placeholder.

#### Scenario: Add a manual gift without a product URL

- **WHEN** the user fills in a gift name (and no product URL) and saves
- **THEN** a draft gift is added to the store and appears in the gift list

#### Scenario: Assign category and quantity

- **WHEN** the user assigns a gift to one of the draft categories and sets a quantity
- **THEN** the draft gift stores that category and quantity

#### Scenario: Edit a draft gift from the list

- **WHEN** the user activates `Editar` for a draft gift in the Gifts step list
- **THEN** the system opens a drawer containing that gift's editable fields without replacing the whole Gifts step
- **AND** the URL contains the selected draft gift id as a query param

#### Scenario: Save edited draft gift from the drawer

- **WHEN** the user changes draft gift fields in the drawer and saves
- **THEN** the wizard draft store updates that gift
- **AND** the drawer closes
- **AND** the gift id query param is cleared
- **AND** the list and guest preview reflect the updated values

#### Scenario: Close edit drawer without saving

- **WHEN** the edit drawer is open and the user cancels or dismisses it
- **THEN** the drawer closes
- **AND** the gift id query param is cleared
- **AND** the draft gift remains unchanged

#### Scenario: Open drawer from gift id query param

- **WHEN** the user is on the Gifts step with a gift id query param matching an existing draft gift
- **THEN** the edit drawer opens for that gift

#### Scenario: Unknown gift id query param

- **WHEN** the user is on the Gifts step with a gift id query param that does not match an existing draft gift
- **THEN** no edit drawer opens
- **AND** no draft gift is modified

#### Scenario: Hidden gifts are excluded from the visible list and preview

- **WHEN** the user toggles a gift to hidden
- **THEN** that gift is excluded from the public preview and does not count toward visible-gift readiness

#### Scenario: Remove a gift

- **WHEN** the user removes a gift
- **THEN** the gift is deleted from the draft store and the list

### Requirement: Draft store holds detail, design, and gift fields

The wizard draft store SHALL persist the detail fields (title, slug, display name, event date, event time, event location, cover image), the design fields (theme, layout, font pairing, button style), and a local `gifts` array, alongside the existing event-type and copy fields, and SHALL survive reload via `localStorage`.

#### Scenario: Extended draft survives reload

- **WHEN** the user fills in details, picks design options, adds a gift, and reloads
- **THEN** the restored draft reflects the title, slug, design selections, and the added gift

#### Scenario: Reset clears the extended draft

- **WHEN** the user triggers reset / start over
- **THEN** the detail, design, and gift fields are cleared along with the rest of the draft

### Requirement: Wizard provides authenticated manual draft saving

The hydrated creation wizard SHALL provide a `Guardar borrador` action on every
wizard step. It SHALL save only when a signed-in creator activates the action;
the wizard SHALL not autosave. Signed-out visitors SHALL be prompted to sign in
before saving and no save mutation SHALL be sent for them.

#### Scenario: Signed-in creator saves manually
- **WHEN** a signed-in creator activates `Guardar borrador`
- **THEN** the wizard submits the current complete local draft once and prevents duplicate save activation until the request finishes

#### Scenario: Signed-out visitor tries to save
- **WHEN** a signed-out visitor activates the save action
- **THEN** the wizard presents an authentication prompt and preserves the local draft without sending a save request

### Requirement: Wizard retains saved-draft identity and revision locally

The persisted wizard store SHALL retain `savedWishlistId` and `lastSavedAt` after
a successful save. Subsequent manual saves SHALL use those values to update the
same database draft and detect conflicts. Resetting the wizard SHALL clear both
values.

#### Scenario: Successful save enables a later update
- **WHEN** a manual save succeeds
- **THEN** the wizard stores the returned wishlist ID and server revision timestamp with the local draft

#### Scenario: Reset clears saved draft metadata
- **WHEN** the creator resets the wizard
- **THEN** the local draft, saved wishlist ID, and last saved timestamp are cleared

### Requirement: Wizard communicates save outcome and conflict options

The wizard SHALL show a Sonner success toast after a completed save and provide
a `Ver en dashboard` link to the authenticated dashboard. On a save conflict it
SHALL present options to load the current server draft or explicitly overwrite it
with the local draft; it SHALL not silently discard either version.

#### Scenario: Save success is confirmed
- **WHEN** the save-draft operation returns success
- **THEN** the wizard updates its saved-draft metadata, displays a success toast, and exposes `Ver en dashboard`

#### Scenario: Creator resolves a save conflict
- **WHEN** the save-draft operation returns a conflict
- **THEN** the wizard presents the server and local resolution choices before making another write

### Requirement: Final publish step preview
The wizard SHALL provide a final publish step that renders an embedded preview of the current local draft using the public wishlist preview mode, labeled "Vista previa de tu wishlist", and SHALL provide a full-page owner preview action before publish.

#### Scenario: Final preview renders current draft
- **WHEN** the user opens `/create?step=publish` with a local draft
- **THEN** the step renders an embedded public wishlist preview labeled "Vista previa de tu wishlist" using the current draft content, design selections, categories, and visible gifts

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
The final publish step SHALL require authentication before sending a publish mutation. Signed-out users SHALL be prompted to sign in with reassurance copy that "tu progreso ya está guardado", and the local draft SHALL remain intact.

#### Scenario: Signed-out user tries to publish
- **WHEN** a signed-out user activates the publish action from the final step
- **THEN** the wizard shows an authentication prompt including the copy "tu progreso ya está guardado" and sends no publish mutation

#### Scenario: Signed-out draft is preserved through auth prompt
- **WHEN** a signed-out user is prompted to authenticate before publishing
- **THEN** the local wizard draft remains persisted so the user can return to `/create?step=publish`

#### Scenario: Signed-in user can publish
- **WHEN** a signed-in user activates publish for a ready draft
- **THEN** the wizard sends one publish request and prevents duplicate publish activation until the request finishes

### Requirement: Publish success and share state
After a successful publish, the wizard SHALL remain on the final step and render a success/share state containing the public wishlist URL and five actions with the exact labels: "Copiar enlace", "Compartir por WhatsApp", "Descargar QR", "Ver lista pública", and "Gestionar en dashboard".

#### Scenario: Successful publish stays on final step
- **WHEN** the publish request succeeds
- **THEN** the wizard remains on `/create?step=publish` and shows the published success/share state

#### Scenario: Success state shows the five labeled actions
- **WHEN** the success/share state renders
- **THEN** it shows the actions "Copiar enlace", "Compartir por WhatsApp", "Descargar QR", "Ver lista pública", and "Gestionar en dashboard"

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

### Requirement: Wizard renders with app theme tokens

The creation wizard shell and all five steps SHALL render exclusively with the app design-system theme tokens (`background`, `foreground`, `card`, `card-foreground`, `muted`, `muted-foreground`, `primary`, `primary-foreground`, `accent`, `accent-foreground`, `border`, `input`, `ring`, `destructive`) via their Tailwind semantic utilities. The wizard SHALL NOT use hardcoded color utilities (`gray-*`, `red-*`, `green-*`, `amber-*`, `bg-white`, `text-white`) for chrome, surfaces, text, borders, or states.

#### Scenario: Wizard chrome uses theme tokens

- **WHEN** the wizard renders any step at `/create`
- **THEN** surfaces use `bg-background`/`bg-card`, text uses `text-foreground`/`text-muted-foreground`, borders use `border-border`, and the active/primary affordances use `bg-primary`/`text-primary-foreground`
- **AND** no element uses a hardcoded `gray-*`, `red-*`, `green-*`, `amber-*`, `bg-white`, or `text-white` utility

#### Scenario: Status colors map to semantic tokens

- **WHEN** the Event Details step shows slug availability or the past-date warning
- **THEN** the available state uses primary/accent tokens with a `ring` affordance, the taken/invalid and past-date states use `text-destructive`, and the checking/hint states use `text-muted-foreground`
- **AND** the exact Spanish strings (`◌ Verificando…`, `✓ Disponible`, `✕ Ya está en uso`, `✕ Solo letras, números y guiones`, and the past-date warning) remain unchanged

### Requirement: Wizard uses ShadCN and shared primitives

The wizard shell and steps SHALL be composed from ShadCN UI primitives (`Button`, `Input`, `Label`, `Field`, `Textarea`, `Badge`, `Separator`, `Progress`, `Card`) and shared design-system components rather than raw `<button>`, `<input>`, or `<textarea>` markup with bespoke classes.

#### Scenario: Form controls are ShadCN primitives

- **WHEN** a user edits fields on the Event Details or Gifts step
- **THEN** the inputs, labels, and buttons are rendered by the ShadCN `Input`/`Label`/`Field`/`Button` components

#### Scenario: Step surfaces use the Card primitive

- **WHEN** the Gifts, Design, or Publish step renders a panel, gift entry, or preview frame
- **THEN** the panel is rendered with the ShadCN `Card` primitive (token-based border/radius/elevation) rather than hand-rolled `rounded-* border bg-white` markup

### Requirement: Responsive mobile-first and desktop wizard layouts

The wizard SHALL provide a deliberate mobile-first layout and a distinct desktop layout for the shell and every step, pixel-matching the DesignSync canvas (`A Wish For.dc.html`) frames `Desktop Step 1`–`4`/`4b` (desktop) and `Step 1` (mobile stepper markup). On mobile the shell SHALL present a single full-bleed column with a segmented 5-bar step indicator sticky at the top and a sticky action bar at the bottom. On desktop (`lg` breakpoint and up) the shell SHALL present a centered `max-w-[1200px]` card containing its own logo header, full labeled stepper, two-pane step content, and footer action bar — not a wider version of the mobile full-bleed shell.

#### Scenario: Mobile layout

- **WHEN** the wizard is viewed at a mobile viewport width
- **THEN** content is a single full-width column, the step indicator is a 5-segment bar (`.wbar`/`.wseg`-equivalent: fixed segments, no continuous percentage fill) fixed to the top, the Back/Save/Next controls are a sticky bottom action bar, and interactive targets are at least 44px tall

#### Scenario: Desktop layout

- **WHEN** the wizard is viewed at a desktop viewport width (`lg` and up)
- **THEN** the wizard renders as a centered card (`bg-card`, `border-border`, `rounded-[18px]`) containing an in-card logo header (isotype + "A Wish For" wordmark, left; "Guardar borrador", right), an in-card full stepper with 26px done/active/upcoming nodes and connecting lines, a fixed-height two-pane content area (fixed-width left pane + flex-1 right pane, per-step widths as specified in design.md D7), and an in-card footer nav (outline "← Atrás" + primary "Continuar →")
- **AND** the Design step's right pane renders its live preview on the canvas-specified `#E6EBF0` backdrop, not the app background

#### Scenario: Completed-step navigation preserved across layouts

- **WHEN** a user taps or clicks a completed step in the stepper on either mobile or desktop
- **THEN** the wizard navigates to that step via the `?step=` query param, and upcoming (incomplete) steps remain non-interactive

### Requirement: Desktop wizard header shows the product wordmark

The desktop (`lg` and up) wizard card header SHALL display the `isotype.svg` mark together with the "A Wish For" serif wordmark, matching every `Desktop Step` canvas frame. The mobile wizard chrome SHALL NOT show this wordmark (not present in any mobile canvas frame).

#### Scenario: Desktop header wordmark

- **WHEN** the wizard is viewed at a desktop viewport width (`lg` and up)
- **THEN** the card header's left side shows the isotype mark (26px tall) followed by "A Wish For" in the serif font, and the right side shows the "Guardar borrador" action

#### Scenario: Mobile header has no wordmark

- **WHEN** the wizard is viewed at a mobile viewport width
- **THEN** the sticky mobile chrome does not render the isotype mark or "A Wish For" wordmark

### Requirement: Gifts step preview shows complete product images

The Gifts step guest preview SHALL render gift images so the complete product image is visible within a stable card media area. The preview layout SHALL use the available desktop width efficiently, including a three-column gift card layout on wide viewports when space allows.

#### Scenario: Product image is not cropped in preview

- **WHEN** a visible draft gift has an image URL
- **THEN** the Gifts step guest preview shows the complete image within the card media area without cropping off product edges

#### Scenario: Preview uses three columns when space allows

- **WHEN** the Gifts step preview pane has enough horizontal space for three gift cards
- **THEN** visible preview gifts render in a three-column grid

#### Scenario: Preview remains responsive when narrow

- **WHEN** the Gifts step preview pane is too narrow for three gift cards
- **THEN** the preview falls back to fewer columns without overlapping card content or clipping text

