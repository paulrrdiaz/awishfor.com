## MODIFIED Requirements

### Requirement: Event-type preset catalog

The system SHALL expose a hardcoded preset for every `EventType` enum value (`baby_shower`, `birthday`, `wedding`, `housewarming`, `general`) from `src/config/event-type-presets.ts`. Each preset SHALL include: a Spanish `label`, a `defaultWelcomeMessage`, a `defaultThankYouMessage`, a `defaultCategories` string array, a `sampleGifts` array, a `sampleCoverImages` collection, a `defaultThemeId`, and a `defaultLayoutId`. Presets SHALL NOT carry a hero-title template: the wishlist name is typed by the creator and is never generated from the occasion.

The `defaultThemeId` and `defaultLayoutId` per event type SHALL resolve within the trimmed nine-layout and seven-theme catalogs:

- `baby_shower` → theme `cielo-suave`, layout `collage-staggered`
- `birthday` → theme `lavanda-fiesta`, layout `arch-hero-party`
- `wedding` → theme `crema-elegante`, layout `carousel-hero`
- `housewarming` → theme `jardin-verde`, layout `split-image-right`
- `general` → theme `clasico-minimal`, layout `magazine-editorial`

#### Scenario: Preset exists for every event type

- **WHEN** code looks up a preset by any `EventType` enum value
- **THEN** a fully populated preset object is returned with no missing fields

#### Scenario: Default IDs reference real presets

- **WHEN** a preset's `defaultThemeId` and `defaultLayoutId` are read
- **THEN** each value matches an existing id in `src/config/public-themes.ts` and `src/config/public-layouts.ts` respectively

#### Scenario: Default layouts avoid retired presets

- **WHEN** each event-type preset's `defaultLayoutId` is read
- **THEN** it matches the table above and none of them is a retired layout such as `arch-split`, `hero-cinematic`, or `grid`

#### Scenario: No hero-title template

- **WHEN** any event-type preset is read
- **THEN** it exposes no hero-title template and selecting an occasion never writes a wishlist name

## ADDED Requirements

### Requirement: Sample cover images per event type

Each preset SHALL provide a `sampleCoverImages` collection of representative photographs for its occasion, grouped so that landscape and portrait samples can be requested independently, with each sample carrying the same url/width/height/orientation shape as a real cover image. The samples SHALL be hosted on an origin already permitted by the Next.js image configuration, and SHALL cover enough of each orientation to fill the largest `heroImageSlots` among the nine layouts.

#### Scenario: Samples exist for every event type

- **WHEN** any event-type preset's `sampleCoverImages` is read
- **THEN** it contains landscape and portrait samples, each with url, width, height and orientation

#### Scenario: Samples suit the occasion

- **WHEN** the `wedding` preset's samples are read
- **THEN** they depict wedding imagery rather than generic or baby-shower photography

#### Scenario: Samples can fill any layout's slots

- **WHEN** the layout with the largest `heroImageSlots` requests samples of its recommended orientation
- **THEN** the preset supplies at least that many samples in that orientation

#### Scenario: Sample hosts are already configured

- **WHEN** a sample cover image renders through the Next.js image pipeline
- **THEN** its host is present in the configured remote patterns and no "unconfigured host" error occurs
