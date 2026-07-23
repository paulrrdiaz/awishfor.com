## MODIFIED Requirements

### Requirement: Event-type preset catalog

The system SHALL expose a hardcoded preset for every `EventType` enum value (`baby_shower`, `birthday`, `wedding`, `housewarming`, `general`) from `src/config/event-type-presets.ts`. Each preset SHALL include: a Spanish `label`, a `defaultHeroTitleTemplate`, a `defaultWelcomeMessage`, a `defaultThankYouMessage`, a `defaultCategories` string array, a `sampleGifts` array, a `defaultThemeId`, and a `defaultLayoutId`.

The `defaultThemeId` and `defaultLayoutId` per event type SHALL seed the new design-exploration layouts so no new wishlist starts on a deprecated layout:

- `baby_shower` → theme `cielo-suave`, layout `collage-staggered`
- `birthday` → theme `lavanda-fiesta`, layout `arch-split`
- `wedding` → theme `crema-elegante`, layout `hero-cinematic`
- `housewarming` → theme `jardin-verde`, layout `split-image-right`
- `general` → theme `clasico-minimal`, layout `magazine-editorial`

#### Scenario: Preset exists for every event type

- **WHEN** code looks up a preset by any `EventType` enum value
- **THEN** a fully populated preset object is returned with no missing fields

#### Scenario: Default IDs reference real presets

- **WHEN** a preset's `defaultThemeId` and `defaultLayoutId` are read
- **THEN** each value matches an existing id in `src/config/public-themes.ts` and `src/config/public-layouts.ts` respectively

#### Scenario: Default layouts avoid deprecated presets

- **WHEN** each event-type preset's `defaultLayoutId` is read
- **THEN** it matches the new default table above and none of them is `grid`, `editorial`, or `minimal`
