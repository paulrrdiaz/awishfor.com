## MODIFIED Requirements

### Requirement: Preset copy does not overwrite user edits

The store SHALL track, local-only, whether each seeded copy field (welcome message, thank-you message) has been edited by the user (`copyTouched`). Changing the event type SHALL update only copy fields that are still untouched; edited copy SHALL be preserved. The wishlist name is never seeded from a preset and therefore is never tracked or overwritten by an event-type change.

#### Scenario: Edited copy is preserved on event-type change

- **WHEN** the user has edited the welcome message and then changes the event type
- **THEN** the edited welcome message is preserved while untouched copy fields update to the new preset

#### Scenario: Manual regeneration overwrites copy

- **WHEN** the user triggers "regenerate suggested copy"
- **THEN** copy fields are reset to the current preset defaults and their `copyTouched` flags are cleared

#### Scenario: Event-type change never rewrites the name

- **WHEN** the user has typed a wishlist name and then changes the event type
- **THEN** the typed name is untouched

### Requirement: Event Details step

The Event Details step SHALL let the user edit the draft's name (`title`), an optional combined event date and time, optional event location, and optional dress code ("Código de vestimenta"). There SHALL be a single name field: the value identifies the wishlist in the owner's dashboard and is the heading guests see, so no separate display name is collected. The event date and time SHALL be chosen through a single `DateTimePicker` field (a calendar in a popover plus a time input), with the time normalized to `HH:mm`. Name, date, time, location, and dress code SHALL all persist to the draft store (`eventDate` and `eventTime` remain separate draft fields). When the selected event date is in the past, the step SHALL show the exact warning copy "Esta fecha ya pasó. Puedes continuar, pero el contador mostrará un mensaje de cierre." without blocking.

#### Scenario: Editing details persists to the draft

- **WHEN** the user enters a name, picks an event date and time in the combined picker, types a location, and types a dress code
- **THEN** the draft store holds the name as `title`, the selected date, the time normalized to `HH:mm`, the location, and the dress code

#### Scenario: One name field only

- **WHEN** the Event Details step renders
- **THEN** it shows a single name field and no display-name or hero-title field

#### Scenario: The name is described as guest-facing

- **WHEN** the name field renders its help text
- **THEN** the text states that this is both how the creator identifies the list and how guests see it, rather than describing it as internal-only

#### Scenario: Event date, time, location, and dress code are optional

- **WHEN** the user leaves the combined date/time field, location, and dress code empty
- **THEN** the step is still valid and the draft stores null/empty for those fields

#### Scenario: Past event date warns without blocking

- **WHEN** the user selects an event date in the past through the combined picker
- **THEN** the step shows "Esta fecha ya pasó. Puedes continuar, pero el contador mostrará un mensaje de cierre." and the date is still accepted

### Requirement: Design & Preview step

The Design & Preview step SHALL let the user select a theme, layout, heading font, body font, and button style from the public config presets, manage up to six cover images, write each selection to the draft, and render a live preview using the public wishlist layout in preview mode with purchase actions disabled. Layout selection SHALL use the modal layout picker: a compact trigger showing the current layout that opens a dialog of all layout thumbnails, rather than an inline grid. The "Imágenes de portada" section SHALL appear directly below the "Disposición" selection and SHALL display the selected layout's cover-image guidance. The embedded preview SHALL be labeled "Vista previa con ejemplos".

The controls SHALL be:

- **Tema de color**: a fixed-column swatch grid (6 columns on desktop, 4 on mobile) showing all seven theme swatches.
- **Disposición**: a compact trigger that displays the selected layout's thumbnail and Spanish label, opens a modal grid of the nine active layouts with no legacy grouping, and updates the draft when a layout is selected.
- **Imágenes de portada**: the multi-image manager (add, remove, reorder, max six) directly below the layout trigger, persisting each image with its dimensions and orientation, with selected-layout guidance showing the recommended photo count, orientation, aspect ratio, and any circle-crop centering advice.
- **Tipografía**: two selects — heading font ("Títulos") and body font ("Texto") — listing the heading/body font presets, each option rendered in its own font.
- **Estilo de botón**: four chips where each chip renders in its own preset's shape (radius, border, weight) as a live self-preview.

#### Scenario: Selecting design options updates the preview

- **WHEN** the user selects a different theme, layout, heading font, body font, or button style
- **THEN** the draft stores the selected ids and the embedded preview re-renders with those choices

#### Scenario: All seven theme swatches are shown in a grid

- **WHEN** the Design & Preview step renders the theme selector
- **THEN** all seven theme swatches are shown in the fixed-column grid

#### Scenario: Layout is chosen through the modal picker

- **WHEN** the user opens the layout picker and selects a layout in the modal
- **THEN** the draft's `layoutId` updates, the modal closes, and the trigger reflects the new selection

#### Scenario: Cover images follow the layout selection

- **WHEN** the Design & Preview step renders
- **THEN** the "Imágenes de portada" section appears directly below the layout selection and shows the selected layout's image guidance

#### Scenario: Added cover image records its orientation

- **WHEN** the user adds a cover image in this step
- **THEN** the draft holds that image with its url, dimensions and derived orientation

#### Scenario: Button style chips preview themselves

- **WHEN** the Design & Preview step renders the Estilo de botón options
- **THEN** each chip renders with its own preset's radius, border, and weight (e.g. the Contorno chip renders as an outline pill)

#### Scenario: Embedded preview is labeled

- **WHEN** the Design & Preview step renders the embedded preview
- **THEN** the preview is labeled "Vista previa con ejemplos"

#### Scenario: Preview does not mutate purchase state

- **WHEN** the preview renders gifts
- **THEN** purchase actions are disabled and no purchase state can be changed from the preview

### Requirement: Draft store holds detail, design, and gift fields

The wizard draft store SHALL persist the detail fields (name, slug, event date, event time, event location, dress code), the design fields (theme, layout, heading font, body font, button style, ordered cover images with dimensions and orientation), and a local `gifts` array, alongside the existing event-type and copy fields, and SHALL survive reload via `localStorage`. The store SHALL NOT carry a display name, a hero title, or a font pairing. A draft persisted under an earlier store version SHALL rehydrate without throwing, dropping values that no longer have a home.

#### Scenario: Extended draft survives reload

- **WHEN** the user fills in details, picks design options including fonts and multiple cover images, adds a gift, and reloads
- **THEN** the restored draft reflects the name, slug, design selections, cover images in order with their orientation, and the added gift

#### Scenario: Earlier persisted draft rehydrates safely

- **WHEN** a draft persisted before this change — carrying a display name, hero title, font pairing, and plain cover image URLs — is rehydrated
- **THEN** the store migrates it to the current shape without throwing and without retaining the removed fields

#### Scenario: Reset clears the extended draft

- **WHEN** the user triggers reset / start over
- **THEN** the detail, design (including cover images and fonts), and gift fields are cleared along with the rest of the draft
