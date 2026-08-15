## REMOVED Requirements

### Requirement: Motif catalog

**Reason**: The requirement text fixes the catalog at eight named sets, and three of its scenarios enumerate the catalog by count ("exactly eight entries"), by birthday-tagged ids (exactly three), and by design source (every entry's palette must match a row in `Motif Proposals.dc.html`). Adding `bow-bloom` — a ninth set, tagged for birthday, with no row in that file — invalidates all three. Scenario headers cannot be renamed in place, so the requirement is restated below.

**Migration**: None. Replaced one-for-one by "Motif catalog contents" below, which keeps every normative rule unchanged — the per-entry field contract and the `resolveMotif` null behavior are carried over verbatim — and only updates the enumerations and the design-source scope.

## ADDED Requirements

### Requirement: Motif catalog contents

The system SHALL expose a motif catalog of nine motif sets, each identified by an English kebab-case id (`bear-cloud`, `flower-bunny`, `unicorn-rainbow`, `forest-fox`, `duck-boat`, `elephant-balloon`, `moon-stars`, `dino-leaf`, `bow-bloom`). Each entry SHALL declare a Spanish user-facing label, a primary (figurative) and secondary shape, an `eventTypes` array of the event types it suits, a fixed three-color palette (`m1` body, `m2` detail, `m3` features, plus an optional `mc1`), and a `suggestedThemeId` naming an existing theme preset.

An entry MAY additionally declare a `secondaryColors` partial palette, giving its secondary shape a color identity independent of the set's ambient palette. When declared, it SHALL apply only under the `fixed` palette and only on the `base` surface.

A `resolveMotif(id)` function SHALL return `null` for a null, empty, or unrecognized id rather than throwing or substituting a default, because "no motif" is a valid wishlist state.

#### Scenario: Catalog exposes every set with array-valued event types

- **WHEN** the motif catalog is read
- **THEN** it contains exactly nine entries
- **AND** every entry's `eventTypes` is a non-empty array of valid `EventType` values
- **AND** every entry's `suggestedThemeId` matches an id in the public theme presets

#### Scenario: Unknown motif id resolves to null

- **WHEN** `resolveMotif` is called with `null`, `""`, or an id absent from the catalog
- **THEN** it returns `null` and does not throw

#### Scenario: Fixed palettes match their source of record

- **WHEN** the fixed palette is read for a catalog entry that originates from `Motif Proposals.dc.html` — `bear-cloud`, `flower-bunny`, `unicorn-rainbow`, `forest-fox`, `duck-boat`, `elephant-balloon`, `moon-stars`, `dino-leaf`
- **THEN** its `m1`/`m2`/`m3` values equal the hex values specified for that set in that file
- **AND** `bear-cloud` additionally defines `mc1` as `#FFFFFF`

#### Scenario: Entries with no design-source row carry their own palette

- **WHEN** the fixed palette is read for a catalog entry with no row in `Motif Proposals.dc.html` — `bow-bloom`
- **THEN** its `m1`/`m2`/`m3` values equal the hex values specified for that set by the change that introduced it
- **AND** the entry is not required to appear in `Motif Proposals.dc.html`

#### Scenario: Birthday-tagged sets

- **WHEN** the catalog is filtered to entries whose `eventTypes` includes `birthday`
- **THEN** the result is exactly `unicorn-rainbow`, `elephant-balloon`, `moon-stars` and `bow-bloom`

### Requirement: Newly authored motif shapes remain legible across every placement scale

Every motif shape authored from this requirement onward SHALL remain recognizable at the full range of scales the placement components apply to it, from the largest hero-scatter instance down to the smallest band instance for the role that shape occupies. A shape assigned as a set's primary SHALL be legible at the smallest scale any primary placement uses; a shape assigned as a set's secondary SHALL be legible at the smallest scale any secondary placement uses.

Interior negative space that distinguishes one shape from another — an open loop, a gap, a pierced region — SHALL remain visible at that shape's smallest rendered size. A shape whose distinguishing detail collapses at its own floor SHALL be redrawn with that detail proportionally enlarged rather than assigned to a placement role that renders it larger.

Fine detail SHALL be sized as a proportion of the shape's own viewBox rather than in fixed units, so that shrinking the shape shrinks its detail proportionally instead of dropping it.

Shapes that predate this requirement are NOT retroactively bound by it, because several of them do not satisfy it: at the smallest secondary placement scale, `star` renders at under 2px and `leaf` at around 4px. They SHALL be brought into conformance when they are next re-authored, not before.

#### Scenario: A primary shape reads at its smallest placement

- **WHEN** a set's primary shape authored under this requirement renders at the smallest scale any primary placement applies
- **THEN** its silhouette and any interior negative space that identifies it remain visible

#### Scenario: A secondary shape reads at its smallest placement

- **WHEN** a set's secondary shape authored under this requirement renders at the smallest scale any secondary placement applies
- **THEN** its silhouette remains recognizable as that shape

#### Scenario: Detail scales with the shape

- **WHEN** a shape authored under this requirement renders at its largest and smallest placement scales
- **THEN** its detail elements occupy the same proportion of the shape at both sizes, with no detail present at the larger size and absent at the smaller

#### Scenario: Pre-existing shapes are not made non-conformant

- **WHEN** a shape that predates this requirement renders at a scale where its detail is no longer distinguishable
- **THEN** the catalog is still considered conformant, and the shape is recorded as owing conformance at its next re-authoring
