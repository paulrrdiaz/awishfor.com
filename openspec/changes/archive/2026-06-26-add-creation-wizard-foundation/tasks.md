## 1. Event-type presets config (3.1)

- [x] 1.1 Add `EventTypePreset` and `SampleGift` types in `src/config/event-type-presets.ts`
- [x] 1.2 Add presets for baby_shower, birthday, wedding, housewarming, general keyed by `EventType`
- [x] 1.3 Fill Spanish `label` and `defaultCategories` per `docs/PRD.md`
- [x] 1.4 Add `defaultHeroTitleTemplate`, `defaultWelcomeMessage`, `defaultThankYouMessage` per preset
- [x] 1.5 Add `sampleGifts` per preset for preview placeholders
- [x] 1.6 Set `defaultThemeId`/`defaultLayoutId` to existing ids from `public-themes.ts`/`public-layouts.ts`
- [x] 1.7 Add a unit test asserting every preset is complete and its theme/layout ids resolve

## 2. Wizard draft store (3.2)

- [x] 2.1 Add `zustand` dependency
- [x] 2.2 Define the draft state shape (wishlist fields + `copyTouched` + `updatedAt`) in `src/stores/wishlist-wizard.store.ts`
- [x] 2.3 Create the Zustand store with `persist` to `localStorage` and SSR-safe hydration
- [x] 2.4 Add actions: set field, set event type (seed defaults), regenerate copy, reset/start over
- [x] 2.5 Add 30-day stale-draft detection and a `needsRecovery` flag on hydration
- [x] 2.6 Add unit tests for seed-on-event-type, copy preserve vs. regenerate, and stale detection

## 3. Wizard route + shell (3.2)

- [x] 3.1 Add `/create` page (`src/app/create/page.tsx`) as the client wizard entry
- [x] 3.2 Add step routing from the `?step=` query param with first-step fallback
- [x] 3.3 Add the wizard shell (`src/components/features/wizard/*`) hosting the shared store and step slot
- [x] 3.4 Add the stale-draft / signed-out recovery prompt (continue vs. discard) driven by `needsRecovery`
- [x] 3.5 Verify `/create` loads for a signed-out user without redirect

## 4. Event Type step (3.3)

- [x] 4.1 Add `event-type-step.tsx` with a selectable card per event type using preset Spanish labels
- [x] 4.2 On select, apply default categories and default theme/layout to the draft
- [x] 4.3 On select, apply default copy only to untouched fields (respect `copyTouched`)
- [x] 4.4 Wire a manual "regenerate suggested copy" action to the store
- [x] 4.5 Confirm Spanish labels render and changing event type preserves edited copy

## 5. Validation

- [x] 5.1 `pnpm check`
- [x] 5.2 `pnpm test`
- [x] 5.3 `pnpm typecheck`
