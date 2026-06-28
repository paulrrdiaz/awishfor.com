## MODIFIED Requirements

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
