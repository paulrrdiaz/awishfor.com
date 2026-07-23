## ADDED Requirements

### Requirement: Layout image guidance metadata

Each `PublicLayoutPreset` SHALL carry recommended image-guidance metadata describing the shape its hero renderer crops cover images to: an aspect ratio, an orientation (`landscape`, `portrait`, or `square`), and, where applicable, flags for circle crops (centered subject) and mixed-shape compositions. The metadata SHALL be resolvable alongside the existing preset fields and SHALL match the actual crop applied by that layout's hero component.

The populated recommendations SHALL be: `hero-cinematic` 16:9 landscape; `carousel-hero` 16:9 landscape; `panoramic-band` 16:9 (panoramic) landscape; `scrapbook-polaroids` 4:3 landscape; `split-image-right` 3:4 portrait; `portrait-frame-split` 3:4 portrait; `overlap-duo` 3:4 portrait; `arch-split` 2:3 portrait; `arch-hero-party` 2:3 portrait; `magazine-editorial` 1:1 square; `arch-trio` 1:1 square (centered subject); `diagonal-duo` 3:4 portrait (one circle crop); `collage-staggered` mixed, recommending a safe 3:4.

#### Scenario: Preset exposes guidance for a layout

- **WHEN** a layout preset is resolved by id
- **THEN** its recommended aspect ratio and orientation are available and correspond to that layout's hero crop shape

#### Scenario: Circle-crop layouts flag centered subject

- **WHEN** the resolved layout is `arch-trio` or `diagonal-duo`
- **THEN** its guidance indicates a circle crop that benefits from a centered subject

#### Scenario: Mixed-composition layout recommends a safe ratio

- **WHEN** the resolved layout is `collage-staggered`
- **THEN** its guidance recommends a single safe 3:4 rather than a per-slot ratio
