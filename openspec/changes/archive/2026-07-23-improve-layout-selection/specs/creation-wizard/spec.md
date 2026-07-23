## MODIFIED Requirements

### Requirement: Design & Preview step

The Design & Preview step SHALL let the user select a theme, layout, font pairing, and button style from the existing public config presets, writing each selection to the draft, and SHALL render a live preview using the public wishlist layout in preview mode with purchase actions disabled. Layout selection SHALL use the modal layout picker: a compact trigger showing the current layout that opens a dialog of all layout thumbnails, rather than an inline grid. The "Imágenes de portada" section SHALL appear directly below the "Disposición" (layout) selection and SHALL display the selected layout's cover-image guidance. The theme selector SHALL show all seven theme swatches including `cielo-suave-rosa`, and the embedded preview SHALL be labeled "Vista previa con ejemplos".

#### Scenario: Selecting design options updates the preview

- **WHEN** the user selects a different theme, layout, font pairing, or button style
- **THEN** the draft stores the selected ids and the embedded preview re-renders with those choices

#### Scenario: Layout is chosen through the modal picker

- **WHEN** the user opens the layout picker and selects a layout in the modal
- **THEN** the draft's `layoutId` updates, the modal closes, and the trigger reflects the new selection

#### Scenario: Cover images follow the layout selection

- **WHEN** the Design & Preview step renders
- **THEN** the "Imágenes de portada" section appears directly below the layout selection and shows the selected layout's image guidance

#### Scenario: All seven theme swatches are shown

- **WHEN** the Design & Preview step renders the theme selector
- **THEN** all seven theme swatches are shown, including `cielo-suave-rosa`

#### Scenario: Embedded preview is labeled

- **WHEN** the Design & Preview step renders the embedded preview
- **THEN** the preview is labeled "Vista previa con ejemplos"

#### Scenario: Preview does not mutate purchase state

- **WHEN** the preview renders gifts
- **THEN** purchase actions are disabled and no purchase state can be changed from the preview
