## ADDED Requirements

### Requirement: Motif catalog

The system SHALL expose a motif catalog of eight motif sets, each identified by an English kebab-case id (`bear-cloud`, `flower-bunny`, `unicorn-rainbow`, `forest-fox`, `duck-boat`, `elephant-balloon`, `moon-stars`, `dino-leaf`). Each entry SHALL declare a Spanish user-facing label, a primary (figurative) and secondary shape, an `eventTypes` array of the event types it suits, a fixed three-color palette (`m1` body, `m2` detail, `m3` features, plus an optional `mc1`), and a `suggestedThemeId` naming an existing theme preset.

A `resolveMotif(id)` function SHALL return `null` for a null, empty, or unrecognized id rather than throwing or substituting a default, because "no motif" is a valid wishlist state.

#### Scenario: Catalog exposes eight sets with array-valued event types

- **WHEN** the motif catalog is read
- **THEN** it contains exactly eight entries
- **AND** every entry's `eventTypes` is a non-empty array of valid `EventType` values
- **AND** every entry's `suggestedThemeId` matches an id in the public theme presets

#### Scenario: Unknown motif id resolves to null

- **WHEN** `resolveMotif` is called with `null`, `""`, or an id absent from the catalog
- **THEN** it returns `null` and does not throw

#### Scenario: Fixed palettes match the design source

- **WHEN** a catalog entry's fixed palette is read
- **THEN** its `m1`/`m2`/`m3` values equal the hex values specified for that set in `Motif Proposals.dc.html`
- **AND** `bear-cloud` additionally defines `mc1` as `#FFFFFF`

#### Scenario: Three sets are tagged for birthday

- **WHEN** the catalog is filtered to entries whose `eventTypes` includes `birthday`
- **THEN** the result is exactly `unicorn-rainbow`, `elephant-balloon` and `moon-stars`

### Requirement: Motif shapes render as inline SVG

Motif shapes SHALL render as a wrapper element containing a single inline `<svg>` illustration built from `<path>`, `<circle>`, `<ellipse>`, and gradient (`<linearGradient>`/`<radialGradient>`/`<stop>`) elements, using no external image, icon-font, or background-image asset. Every region's color — `fill`, `stroke`, and gradient `<stop>` color alike — SHALL derive from the `--m1`, `--m2` and `--m3` custom properties (and `--mc1` where the shape declares it), either directly via `fill="var(--m1)"` (etc.) or computed from one via `color-mix()` (e.g. a shading or highlight tone mixed from the region's own body token), rather than from an unconditional hardcoded color value. The shape SHALL be resizable through `transform: scale()` on its wrapper without altering its SVG markup. The SVG SHALL carry no `<title>` or `<desc>` child element.

#### Scenario: Shapes carry no external assets

- **WHEN** any motif shape renders
- **THEN** its markup contains an `<svg>` element
- **AND** its markup contains no `<img>` or background-image reference
- **AND** the `<svg>` contains no `<title>` or `<desc>` element

#### Scenario: Recoloring requires only variable changes

- **WHEN** the `--m1`, `--m2` or `--m3` value in scope changes
- **THEN** every `fill`, `stroke`, or gradient `<stop>` color that references that variable (directly or via `color-mix()`) renders the new color with no change to the SVG's markup or path data

#### Scenario: Scaling preserves proportions

- **WHEN** a shape instance is rendered at a scale other than 1
- **THEN** the SVG's viewBox and path geometry are unchanged, and the wrapper's `transform: scale()` proportionally resizes the entire illustration

### Requirement: Motifs are decorative and excluded from assistive technology

Every motif element rendered on a public wishlist SHALL carry `aria-hidden="true"`. Motifs SHALL NOT contain text, SHALL NOT serve as the accessible name or description of any control, and SHALL NOT change the accessible name of a component they decorate.

#### Scenario: Motif elements are hidden from the accessibility tree

- **WHEN** a public wishlist renders with a motif selected
- **THEN** every motif element carries `aria-hidden="true"`

#### Scenario: Decorated components keep their accessible names

- **WHEN** a gift card renders with a motif corner sticker
- **THEN** the gift card's accessible name is identical to its accessible name with no motif selected

### Requirement: Motifs are additive to existing components

Motifs SHALL decorate the public wishlist without altering the geometry, typography or color of any existing component. Specifically, adding a motif SHALL NOT change any existing element's font family, size or weight, its color or background, its padding, border or corner radius, or its horizontal placement within the layout.

Exactly one restyle is permitted: under the `band` treatment the countdown surface SHALL change from the card surface to a `--primary`-filled surface, as the design specifies. No other existing component may be restyled by any motif, treatment or palette.

Motif elements that overlay existing content — the gift-card corner sticker and the hero scatter — SHALL NOT obscure meaningful content. The sticker SHALL NOT cover the gift image, name, price or any badge, and hero scatter motifs SHALL render behind the hero's text content.

New motif elements that occupy layout flow — the divider row and the footer and header bands — MAY increase the page's vertical extent, but SHALL NOT displace any existing element horizontally or reorder existing content.

#### Scenario: Existing component styling is unchanged

- **WHEN** the same wishlist is rendered with and without a motif under the `scene` treatment
- **THEN** every existing element's computed font, color, background, padding, border and radius are identical between the two renders

#### Scenario: Band restyles only the countdown

- **WHEN** a wishlist is rendered under the `band` treatment
- **THEN** the countdown renders on a `--primary`-filled surface
- **AND** no other existing component's background or color differs from its appearance with no motif

#### Scenario: Gift sticker does not obscure gift content

- **WHEN** a gift card renders with a motif corner sticker
- **THEN** the gift image, name, price and any priority badge remain fully visible and unclipped

#### Scenario: Hero scatter renders behind hero text

- **WHEN** a hero renders with scattered motifs
- **THEN** the hero's eyebrow, title and subtitle paint above the motifs and remain fully legible

#### Scenario: Added rows do not reorder or shift content

- **WHEN** the divider row and footer band are added to a page
- **THEN** no existing element changes its horizontal position or its order relative to other content

### Requirement: Fixed and themed palettes

Each motif SHALL support two palettes. The `fixed` palette SHALL use the catalog entry's design hex values and SHALL be the default. The `themed` palette SHALL derive its tokens from theme tokens — `--m1` from `--primary`, `--m2` from `--accent`, `--m3` from `--foreground` — so that it contrasts with the active theme by construction.

Palette selection SHALL be a stored user choice. The system SHALL NOT compute contrast at selection time or at render time, so that a published page always matches what was previewed.

#### Scenario: Fixed is the default palette

- **WHEN** a motif is selected and no palette preference is stored
- **THEN** the motif renders with its catalog fixed palette

#### Scenario: Themed palette follows the active theme

- **WHEN** a wishlist stores the `themed` palette and its theme is changed
- **THEN** the motif's colors change with the theme, resolving from `--primary`, `--accent` and `--foreground`

#### Scenario: No contrast computation occurs

- **WHEN** a motif is rendered on any theme
- **THEN** the rendered palette depends only on the stored palette choice and the catalog entry, and no contrast calculation influences the result

### Requirement: Motif surfaces

The system SHALL support exactly two motif surfaces, declared through a `data-motif-surface` attribute. On `base`, motifs render with the resolved palette unchanged. On `primary` — used where a motif sits on a `--primary`-filled surface — motifs SHALL render inverted, with body and detail tokens forced to white and the feature token set to the motif's own `m3Inverted` value, which SHALL be declared per catalog entry rather than derived from a theme token.

#### Scenario: Base surface uses the resolved palette

- **WHEN** a motif renders inside an element marked `data-motif-surface="base"`
- **THEN** it uses the resolved palette without inversion

#### Scenario: Primary surface inverts the motif

- **WHEN** a motif renders inside an element marked `data-motif-surface="primary"`
- **THEN** its body and detail parts render white and its feature parts render in that motif's declared `m3Inverted` value

#### Scenario: The seal needs no dedicated surface

- **WHEN** a motif renders inside the band treatment's white seal
- **THEN** it uses the `base` surface and renders identically to the same motif on a card

### Requirement: Motif variables are provided by the public theme provider

The public theme provider SHALL write the resolved motif variables (`--m1`, `--m2`, `--m3`, and `--mc1` when the motif declares it) onto the same public theme wrapper that carries the theme, font and button-style variables, and SHALL expose `data-motif` and `data-motif-treatment` attributes. When no motif is selected, the provider SHALL write no motif variables and SHALL omit those attributes.

#### Scenario: Provider writes motif variables

- **WHEN** a wishlist with a selected motif renders its public page
- **THEN** the public theme wrapper carries the resolved `--m1`, `--m2` and `--m3` values and the matching `data-motif` and `data-motif-treatment` attributes

#### Scenario: Placement components inherit rather than receive colors

- **WHEN** a motif placement component renders
- **THEN** it resolves its colors through inheritance from the wrapper and requires no color props

#### Scenario: No motif selected leaves the wrapper unchanged

- **WHEN** a wishlist has no motif selected
- **THEN** the public theme wrapper carries no motif variables and no `data-motif` attribute
- **AND** the page renders identically to its appearance before motifs existed

### Requirement: Scene and band treatments

The system SHALL support two structurally distinct treatments. The `scene` treatment SHALL render scattered absolutely-positioned motifs in the hero, a motif divider row between sections, a single footer band at reduced opacity, and stickers on card surfaces. The `band` treatment SHALL render an accent-filled band above and below the content at full opacity, a white circular seal containing the primary motif in place of the hero scatter, no divider row, and countdown and sticker motifs on `--primary` surfaces.

#### Scenario: Scene renders scatter and divider

- **WHEN** a wishlist uses the `scene` treatment
- **THEN** the hero renders scattered motifs and a motif divider row appears between sections
- **AND** no seal is rendered

#### Scenario: Band renders seal and paired bands

- **WHEN** a wishlist uses the `band` treatment
- **THEN** a white circular seal containing the primary motif replaces the hero scatter
- **AND** accent-filled motif bands render both above and below the content
- **AND** no divider row is rendered

#### Scenario: Band inverts motifs on filled surfaces

- **WHEN** a wishlist uses the `band` treatment
- **THEN** its countdown chip and gift sticker render on `--primary` with inverted motifs

### Requirement: Motif placements

Motifs SHALL appear at five placements. The countdown icon, gift-card corner sticker, footer band and section divider SHALL be provided by shared components and SHALL therefore appear in every public layout. The hero scatter/seal SHALL be provided per layout and SHALL render in the `collage-staggered` and `arch-hero-party` layouts.

When a wishlist uses a layout without hero motif support, the four shared placements SHALL still render.

#### Scenario: Shared placements render in every layout

- **WHEN** a wishlist with a motif renders in any of the nine public layouts
- **THEN** the countdown icon, gift sticker and footer band motifs render

#### Scenario: Hero motifs render in the supported layouts

- **WHEN** a wishlist with a motif uses `collage-staggered` or `arch-hero-party`
- **THEN** the hero renders the treatment's scatter or seal

#### Scenario: Unsupported layout degrades to shared placements

- **WHEN** a wishlist with a motif uses a layout without hero motif support
- **THEN** the hero renders without motifs
- **AND** the four shared placements still render

### Requirement: Motif tilt effect

Motif containers SHALL support a hover tilt driven by a single pointer listener on the container that writes normalized `--tilt-x` and `--tilt-y` custom properties consumed by descendant motifs. The system SHALL NOT attach a pointer listener per motif instance.

Tilt SHALL be disabled when the user prefers reduced motion and SHALL NOT be bound on coarse-pointer (touch) devices. Motifs SHALL return to rest when the pointer leaves the container.

#### Scenario: One listener serves all motifs in a container

- **WHEN** a container with multiple motifs mounts on a fine-pointer device
- **THEN** exactly one pointer-move listener is attached to the container regardless of motif count

#### Scenario: Reduced motion disables tilt

- **WHEN** the user's system reports `prefers-reduced-motion: reduce`
- **THEN** no tilt listener is attached and motifs render at rest

#### Scenario: Touch devices receive no tilt

- **WHEN** a public wishlist loads on a coarse-pointer device
- **THEN** no tilt listener is attached and motifs render statically

#### Scenario: Pointer leaving returns motifs to rest

- **WHEN** the pointer leaves a tilting motif container
- **THEN** the motifs ease back to their untilted transform

#### Scenario: Listeners are removed on unmount

- **WHEN** a motif container unmounts
- **THEN** its pointer listeners are removed

### Requirement: Motif persistence

The `Wishlist` record SHALL store `motifId`, `motifTreatment` and `motifPalette` as nullable strings. A null `motifId` SHALL mean motifs are disabled; the system SHALL NOT introduce a separate enabled flag. `motifTreatment` SHALL accept `scene` or `band`; `motifPalette` SHALL accept `fixed` or `themed`.

Existing wishlists SHALL be unaffected: the migration SHALL be additive with no backfill.

#### Scenario: Null motif id disables motifs

- **WHEN** a wishlist has a null `motifId`
- **THEN** its public page renders no motifs regardless of the stored treatment or palette

#### Scenario: Existing wishlists are unchanged

- **WHEN** the migration is applied to a database with existing wishlists
- **THEN** every existing wishlist has null motif columns and its public page renders exactly as before

#### Scenario: Invalid stored values fall back safely

- **WHEN** a wishlist stores a `motifTreatment` or `motifPalette` value outside the accepted set
- **THEN** the page renders with the default treatment and the fixed palette rather than throwing
