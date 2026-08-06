# layout-picker Specification

## Purpose

Defines the shared compact layout picker and the image guidance it exposes to wishlist design surfaces.
## Requirements
### Requirement: Compact layout trigger

The layout picker SHALL offer two presentations over one selection model, keeping its public props (`options`, `selected`, `onSelect`) unchanged. The dashboard design editor SHALL use the compact presentation: a single trigger displaying the currently selected layout's thumbnail and label together with a "Cambiar" affordance, opening the modal grid. The wizard's Layout step SHALL use the inline presentation: the full grid of layout thumbnails rendered in place, with no trigger and no modal, because choosing a layout is that step's entire purpose.

#### Scenario: Trigger reflects current selection

- **WHEN** the compact presentation renders with a selected layout id
- **THEN** it shows that layout's thumbnail and label and a control to change it, without rendering the full grid inline

#### Scenario: Falls back to default when selection is missing

- **WHEN** the picker renders with a null or unknown selected id
- **THEN** it displays the resolved default layout as the current selection

#### Scenario: Wizard renders the grid inline

- **WHEN** the wizard's Layout step renders the picker
- **THEN** all nine layout thumbnails render in place and no trigger or modal is involved

#### Scenario: Both presentations report selection identically

- **WHEN** a layout is chosen in either presentation
- **THEN** `onSelect` is invoked with that layout id in the same way

### Requirement: Modal layout selection

Activating the trigger SHALL open a modal dialog containing the full grid of the nine layout thumbnails. There SHALL be no deprecated or legacy grouping, since every listed layout is active. Selecting a layout inside the dialog SHALL invoke `onSelect` with that layout id and close the dialog. The dialog SHALL be dismissible without changing the selection (escape, backdrop, or close control).

#### Scenario: Opening the picker shows all layouts

- **WHEN** the user activates the layout trigger
- **THEN** a modal opens showing all nine layout thumbnails with no legacy grouping

#### Scenario: Selecting a layout updates and closes

- **WHEN** the user clicks a layout thumbnail inside the modal
- **THEN** `onSelect` is called with that layout id and the modal closes

#### Scenario: Dismissing keeps the current selection

- **WHEN** the user dismisses the modal without clicking a layout
- **THEN** the previously selected layout id is unchanged

### Requirement: Per-layout cover-image guidance

The cover-images section SHALL display guidance derived from the selected layout's recommended image shape: the number of photos, the recommended orientation and aspect ratio in text, and an orientation glyph (`▭` landscape, `▯` portrait, `◻` square). For the layout that crops images into circles (`arch-trio`), the guidance SHALL additionally advise centering the subject.

#### Scenario: Landscape layout guidance

- **WHEN** the selected layout recommends a landscape ratio (e.g. `carousel-hero` 16:9)
- **THEN** the cover-images hint states the photo count with "horizontal 16:9" and shows the landscape glyph

#### Scenario: Portrait layout guidance

- **WHEN** the selected layout recommends a portrait ratio (e.g. `split-image-right` 3:4)
- **THEN** the hint states "vertical 3:4" and shows the portrait glyph

#### Scenario: Circle-crop layout advises centering

- **WHEN** the selected layout is `arch-trio`
- **THEN** the guidance includes a "centra el sujeto" note

### Requirement: Soft aspect-ratio warning

When an uploaded cover image's detected aspect ratio disagrees with the selected layout's recommended orientation beyond a tolerance, the cover-images section SHALL display a gentle, non-blocking note describing the mismatch. The warning SHALL NOT prevent adding, removing, or reordering images, and SHALL NOT gate saving or publishing.

#### Scenario: Mismatched orientation warns softly

- **WHEN** the user uploads a portrait image while the selected layout recommends a landscape shape
- **THEN** an advisory note is shown (e.g. "Esta foto es vertical; este diseño luce mejor en horizontal") and the image is still accepted

#### Scenario: Matching orientation shows no warning

- **WHEN** the uploaded image's orientation matches the layout recommendation within tolerance
- **THEN** no mismatch warning is shown

#### Scenario: Warning never blocks

- **WHEN** a mismatch warning is displayed
- **THEN** the user can still save, publish, and add or remove images without resolving it

