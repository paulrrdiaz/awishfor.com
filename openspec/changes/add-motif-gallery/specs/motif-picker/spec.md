## ADDED Requirements

### Requirement: Motif picker is gated by event type

The motif picker SHALL render only when the wishlist's event type is `baby_shower` or `birthday`. For every other event type the picker SHALL be absent, and the wishlist SHALL retain a null `motifId`.

#### Scenario: Picker appears for gated event types

- **WHEN** a wishlist's event type is `baby_shower` or `birthday`
- **THEN** the motif picker renders among the presentation options

#### Scenario: Picker is hidden for other event types

- **WHEN** a wishlist's event type is `wedding`, `housewarming` or `general`
- **THEN** the motif picker does not render

#### Scenario: Changing to an ungated event type clears the motif

- **WHEN** a wishlist with a selected motif has its event type changed to one outside the gate
- **THEN** the motif is cleared so the public page does not render a motif the owner can no longer edit

### Requirement: Picker offers only motifs tagged for the event type

The picker SHALL list only catalog entries whose `eventTypes` array includes the wishlist's event type. The picker SHALL never present an empty gallery for a gated event type.

#### Scenario: Baby shower sees all eight sets

- **WHEN** the picker renders for a `baby_shower` wishlist
- **THEN** all eight motif sets are offered

#### Scenario: Birthday sees only its tagged sets

- **WHEN** the picker renders for a `birthday` wishlist
- **THEN** exactly `unicorn-rainbow`, `elephant-balloon` and `moon-stars` are offered

### Requirement: Motif selection is optional and reversible

The picker SHALL present "no motif" as an explicit, selectable option and SHALL default to it for wishlists with no stored motif. Clearing the selection SHALL set `motifId` to null and SHALL remove all motifs from the public page.

#### Scenario: No motif is the default

- **WHEN** the picker renders for a wishlist with a null `motifId`
- **THEN** the "no motif" option is selected

#### Scenario: Clearing a motif removes it from the public page

- **WHEN** the owner selects "no motif" and saves
- **THEN** `motifId` is persisted as null and the public page renders no motifs after revalidation

### Requirement: Treatment and palette are selectable per wishlist

When a motif is selected, the picker SHALL offer a treatment choice between Escena (`scene`) and Banda (`band`), and a palette choice between the motif's fixed palette and the themed palette. Treatment SHALL default to `scene` and palette SHALL default to `fixed`.

User-facing labels SHALL be Spanish while stored ids remain English kebab-case.

#### Scenario: Selecting a motif reveals treatment and palette controls

- **WHEN** the owner selects a motif from the gallery
- **THEN** treatment and palette controls become available with `scene` and `fixed` preselected

#### Scenario: Labels are Spanish and ids are English

- **WHEN** the picker renders the treatment options
- **THEN** the visible labels read "Escena" and "Banda"
- **AND** the persisted values are `scene` and `band`

#### Scenario: Palette choice is persisted

- **WHEN** the owner selects the themed palette and saves
- **THEN** `motifPalette` persists as `themed` and the public page renders theme-derived motif colors after revalidation

### Requirement: Picker previews the real result

Each option in the picker SHALL preview the motif using the wishlist's currently selected theme, treatment and palette, so that the preview matches what the public page will render.

#### Scenario: Preview reflects the active theme

- **WHEN** the owner changes the wishlist theme and returns to the motif picker
- **THEN** each motif preview renders against the newly selected theme

#### Scenario: Preview reflects the palette choice

- **WHEN** the owner toggles between the fixed and themed palettes
- **THEN** the preview updates to the corresponding colors

### Requirement: Picker surfaces the suggested theme

When the wishlist's selected theme differs from the chosen motif's `suggestedThemeId`, the picker SHALL surface a non-blocking hint naming the suggested theme and pointing to the themed palette as an alternative. The hint SHALL NOT prevent saving, and no combination of motif and theme SHALL be rejected.

#### Scenario: Hint appears on a non-suggested theme

- **WHEN** the owner selects a motif whose `suggestedThemeId` differs from the wishlist's theme
- **THEN** a non-blocking hint names the suggested theme and mentions the themed palette

#### Scenario: Any combination remains saveable

- **WHEN** the owner saves a motif and theme combination that triggers the hint
- **THEN** the mutation succeeds and the combination is persisted

#### Scenario: No hint on the suggested theme

- **WHEN** the wishlist's theme matches the selected motif's `suggestedThemeId`
- **THEN** no hint is shown

### Requirement: Motif ids are validated on save

The mutation persisting a motif selection SHALL validate `motifId` against the catalog, `motifTreatment` against `scene`/`band`, and `motifPalette` against `fixed`/`themed`, and SHALL additionally reject a `motifId` whose `eventTypes` does not include the wishlist's event type.

#### Scenario: Unknown motif id is rejected

- **WHEN** a save request carries a `motifId` absent from the catalog
- **THEN** the mutation rejects with a validation error and persists nothing

#### Scenario: Motif not tagged for the event type is rejected

- **WHEN** a save request assigns a `baby_shower`-only motif to a `birthday` wishlist
- **THEN** the mutation rejects with a validation error

#### Scenario: Valid selection is persisted and revalidated

- **WHEN** a save request carries a valid motif, treatment and palette
- **THEN** the values persist for that owner's wishlist and the public wishlist path is revalidated
