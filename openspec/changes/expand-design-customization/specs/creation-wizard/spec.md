## MODIFIED Requirements

### Requirement: Design & Preview step

The Design & Preview step SHALL let the user select a theme, layout, heading font, body font, and button style from the public config presets, manage up to six cover images, write each selection to the draft, and render a live preview using the public wishlist layout in preview mode with purchase actions disabled. The embedded preview SHALL be labeled "Vista previa con ejemplos".

The controls SHALL be:

- **Tema de color**: a fixed-column swatch grid (6 columns on desktop, 4 on mobile) showing all twelve theme swatches.
- **Disposición**: a 2-column thumbnail grid where each option renders an abstract skeleton preview of that layout's hero composition plus its Spanish label; the fourteen new layouts appear first and the deprecated `grid`/`editorial`/`minimal` appear last under a muted legacy grouping.
- **Tipografía**: two selects — heading font ("Títulos") and body font ("Texto") — listing the heading/body font presets, each option rendered in its own font.
- **Estilo de botón**: four chips where each chip renders in its own preset's shape (radius, border, weight) as a live self-preview.
- **Imágenes de portada**: the multi-image manager (add, remove, reorder, max six) with a layout-aware hint showing how many photos the selected layout displays.

#### Scenario: Selecting design options updates the preview

- **WHEN** the user selects a different theme, layout, heading font, body font, or button style
- **THEN** the draft stores the selected ids and the embedded preview re-renders with those choices

#### Scenario: All twelve theme swatches are shown in a grid

- **WHEN** the Design & Preview step renders the theme selector
- **THEN** all twelve theme swatches are shown in the fixed-column grid

#### Scenario: Layout picker shows thumbnails with legacy group last

- **WHEN** the Design & Preview step renders the Disposición picker
- **THEN** seventeen options render as thumbnail cards in a 2-column grid, with the fourteen new layouts first and `grid`/`editorial`/`minimal` last under a muted legacy grouping

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

The wizard draft store SHALL persist the detail fields (title, slug, display name, event date, event time, event location, dress code), the design fields (theme, layout, heading font, body font, button style, ordered cover image URLs), and a local `gifts` array, alongside the existing event-type and copy fields, and SHALL survive reload via `localStorage`. A persisted draft from before this change SHALL migrate on rehydrate: `coverImageUrls` seeds from the legacy single cover image and the font fields seed from the legacy `fontPairing` mapping.

#### Scenario: Extended draft survives reload

- **WHEN** the user fills in details, picks design options including fonts and multiple cover images, adds a gift, and reloads
- **THEN** the restored draft reflects the title, slug, design selections, cover images in order, and the added gift

#### Scenario: Legacy persisted draft migrates

- **WHEN** a persisted draft containing a single legacy cover image URL and a `fontPairing` value is rehydrated after this change
- **THEN** the draft exposes that image as the first element of `coverImageUrls` and heading/body fonts derived from the pairing mapping, without data loss

#### Scenario: Reset clears the extended draft

- **WHEN** the user triggers reset / start over
- **THEN** the detail, design (including cover images and fonts), and gift fields are cleared along with the rest of the draft
