## MODIFIED Requirements

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
