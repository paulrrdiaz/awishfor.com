## MODIFIED Requirements

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
