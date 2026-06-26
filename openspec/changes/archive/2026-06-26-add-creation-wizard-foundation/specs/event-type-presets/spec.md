## ADDED Requirements

### Requirement: Event-type preset catalog

The system SHALL expose a hardcoded preset for every `EventType` enum value (`baby_shower`, `birthday`, `wedding`, `housewarming`, `general`) from `src/config/event-type-presets.ts`. Each preset SHALL include: a Spanish `label`, a `defaultHeroTitleTemplate`, a `defaultWelcomeMessage`, a `defaultThankYouMessage`, a `defaultCategories` string array, a `sampleGifts` array, a `defaultThemeId`, and a `defaultLayoutId`.

#### Scenario: Preset exists for every event type

- **WHEN** code looks up a preset by any `EventType` enum value
- **THEN** a fully populated preset object is returned with no missing fields

#### Scenario: Default IDs reference real presets

- **WHEN** a preset's `defaultThemeId` and `defaultLayoutId` are read
- **THEN** each value matches an existing id in `src/config/public-themes.ts` and `src/config/public-layouts.ts` respectively

### Requirement: Spanish labels and default categories match the PRD

The preset `label` and `defaultCategories` values SHALL match the Spanish labels and category lists defined in `docs/PRD.md` (e.g. baby_shower label "Baby shower" with categories Pañales, Ropa, Lactancia, Baño, Dormitorio, Juguetes, Otros).

#### Scenario: Baby shower preset content

- **WHEN** the `baby_shower` preset is read
- **THEN** its `label` is the PRD Spanish label and its `defaultCategories` are the PRD baby-shower categories in order

### Requirement: Sample gifts for empty-state preview

Each preset SHALL provide at least one `sampleGift` containing the fields needed to render a gift card placeholder (name, and where applicable image/price hints), so the wizard preview can show representative gifts before the user adds real gifts.

#### Scenario: Sample gifts available before real gifts exist

- **WHEN** a draft has selected an event type but has no user-created gifts
- **THEN** the preset's `sampleGifts` are available to render as preview placeholders
