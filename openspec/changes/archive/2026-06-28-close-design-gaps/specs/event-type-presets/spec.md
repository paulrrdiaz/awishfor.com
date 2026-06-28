## MODIFIED Requirements

### Requirement: Event-type preset catalog

The system SHALL expose a hardcoded preset for every `EventType` enum value (`baby_shower`, `birthday`, `wedding`, `housewarming`, `general`) from `src/config/event-type-presets.ts`. Each preset SHALL include: a Spanish `label`, a `defaultHeroTitleTemplate`, a `defaultWelcomeMessage`, a `defaultThankYouMessage`, a `defaultCategories` string array, a `sampleGifts` array, a `defaultThemeId`, and a `defaultLayoutId`.

The `defaultThemeId` and `defaultLayoutId` per event type SHALL match the brief's default-by-event-type table:

- `baby_shower` → theme `cielo-suave`, layout `editorial`
- `birthday` → theme `lavanda-fiesta`, layout `grid`
- `wedding` → theme `crema-elegante`, layout `editorial`
- `housewarming` → theme `jardin-verde`, layout `minimal`
- `general` → theme `clasico-minimal`, layout `grid`

#### Scenario: Preset exists for every event type

- **WHEN** code looks up a preset by any `EventType` enum value
- **THEN** a fully populated preset object is returned with no missing fields

#### Scenario: Default IDs reference real presets

- **WHEN** a preset's `defaultThemeId` and `defaultLayoutId` are read
- **THEN** each value matches an existing id in `src/config/public-themes.ts` and `src/config/public-layouts.ts` respectively

#### Scenario: Default theme and layout match the brief table

- **WHEN** each event-type preset's `defaultThemeId` and `defaultLayoutId` are read
- **THEN** they match the brief default-by-event-type pairing for that event type (e.g. `baby_shower` resolves to `cielo-suave` + `editorial`, `wedding` to `crema-elegante` + `editorial`, `housewarming` to `jardin-verde` + `minimal`)
