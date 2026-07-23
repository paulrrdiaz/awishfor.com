# layout-picker Specification

## Purpose
Defines the shared compact layout picker and the image guidance it exposes to wishlist design surfaces.

## Requirements
### Requirement: Compact layout trigger

The layout picker SHALL render, in place of an inline grid, a single compact trigger that displays the currently selected layout's thumbnail and label together with a "Cambiar" affordance. The same picker component SHALL be used by both the dashboard design editor and the wizard's Design & Preview step, keeping its public props (`options`, `selected`, `onSelect`) unchanged.

#### Scenario: Trigger reflects current selection

- **WHEN** the layout picker renders with a selected layout id
- **THEN** it shows that layout's thumbnail and label and a control to change it, without rendering the full grid inline

#### Scenario: Falls back to default when selection is missing

- **WHEN** the layout picker renders with a null or unknown selected id
- **THEN** it displays the resolved default layout as the current selection

### Requirement: Modal layout selection

Activating the trigger SHALL open a modal dialog containing the full grid of layout thumbnails, including the active layouts and the deprecated "Clásico" group. Selecting a layout inside the dialog SHALL invoke `onSelect` with that layout id and close the dialog. The dialog SHALL be dismissible without changing the selection (escape, backdrop, or close control).

#### Scenario: Opening the picker shows all layouts

- **WHEN** the user activates the layout trigger
- **THEN** a modal opens showing every active layout thumbnail and the deprecated "Clásico" group

#### Scenario: Selecting a layout updates and closes

- **WHEN** the user clicks a layout thumbnail inside the modal
- **THEN** `onSelect` is called with that layout id and the modal closes

#### Scenario: Dismissing keeps the current selection

- **WHEN** the user dismisses the modal without clicking a layout
- **THEN** the previously selected layout id is unchanged

### Requirement: Per-layout cover-image guidance

The cover-images section SHALL display guidance derived from the selected layout's recommended image shape: the number of photos, the recommended orientation and aspect ratio in text, and an orientation glyph (`▭` landscape, `▯` portrait, `◻` square). For layouts that crop images into circles (`arch-trio`, `diagonal-duo`), the guidance SHALL additionally advise centering the subject.

#### Scenario: Landscape layout guidance

- **WHEN** the selected layout recommends a landscape ratio (e.g. `hero-cinematic` 16:9)
- **THEN** the cover-images hint states the photo count with "horizontal 16:9" and shows the landscape glyph

#### Scenario: Portrait layout guidance

- **WHEN** the selected layout recommends a portrait ratio (e.g. `split-image-right` 3:4)
- **THEN** the hint states "vertical 3:4" and shows the portrait glyph

#### Scenario: Circle-crop layout advises centering

- **WHEN** the selected layout crops images into circles (`arch-trio` or `diagonal-duo`)
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
