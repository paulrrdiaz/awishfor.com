## REMOVED Requirements

### Requirement: Picker offers only motifs tagged for the event type

**Reason**: Its scenarios enumerate the catalog by count and by id ("all eight sets", exactly three birthday-tagged sets). Adding `bow-bloom` invalidates both counts, and scenario headers cannot be renamed in place, so the requirement is restated below with count-accurate scenarios.

**Migration**: None. Replaced one-for-one by "Picker lists motifs tagged for the event type" below, which keeps the same normative rule and only updates the enumerations. No behavior an owner or integrator depends on changes.

## ADDED Requirements

### Requirement: Picker lists motifs tagged for the event type

The picker SHALL list only catalog entries whose `eventTypes` array includes the wishlist's event type. The picker SHALL never present an empty gallery for a gated event type.

#### Scenario: Baby shower sees every set in the catalog

- **WHEN** the picker renders for a `baby_shower` wishlist
- **THEN** all nine motif sets are offered

#### Scenario: Birthday sees only its tagged sets

- **WHEN** the picker renders for a `birthday` wishlist
- **THEN** exactly `unicorn-rainbow`, `elephant-balloon`, `moon-stars` and `bow-bloom` are offered
