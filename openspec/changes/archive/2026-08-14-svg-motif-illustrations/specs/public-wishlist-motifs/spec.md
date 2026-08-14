## MODIFIED Requirements

<!-- Supersedes "Motif shapes render as CSS primitives" in add-motif-gallery/specs/public-wishlist-motifs/spec.md (unarchived baseline — see proposal.md). Renamed to match the new rendering mechanism. -->

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
