## Why

Milestone 3 builds the unauthenticated-first wishlist creation flow. Before any wizard step can render, it needs (1) hardcoded event-type presets to seed default content and (2) the wizard route, local draft state, and the first step where the user picks an event type. This change lays that foundation so later steps (details, design, gifts, auth gate, publish) can build on a working store and seeded draft.

## What Changes

- Add `src/config/event-type-presets.ts` with a preset per `EventType` (baby_shower, birthday, wedding, housewarming, general): label, default hero-title template, welcome/thank-you copy, default categories, sample gifts, and default theme/layout IDs.
- Add the `/create` route that renders the wizard shell and routes between steps via a query param.
- Add a Zustand draft store (`src/stores/wishlist-wizard.store.ts`) holding the in-progress wishlist, persisted to `localStorage`, with 30-day stale-draft detection, a signed-out recovery prompt, and reset/start-over behavior.
- Add the Event Type step: selectable event-type cards that seed default categories, design, and copy into the draft — without overwriting copy the user has already edited (tracked via local-only `copyTouched` flags), with a manual "regenerate suggestions" action.
- Add `zustand` as a dependency.

## Capabilities

### New Capabilities
- `event-type-presets`: Hardcoded per-event-type defaults (label, categories, copy templates, sample gifts, theme/layout IDs) that seed a new wishlist draft.
- `creation-wizard`: The `/create` wizard shell — query-param step routing, local draft store with persistence and stale-draft recovery, and the Event Type selection step.

### Modified Capabilities
<!-- None: no existing spec requirements change. -->

## Impact

- New code: `src/config/event-type-presets.ts`, `src/app/create/page.tsx`, `src/components/features/wizard/*`, `src/stores/wishlist-wizard.store.ts`.
- New dependency: `zustand`.
- Reuses existing preset IDs from `src/config/public-themes.ts` and `src/config/public-layouts.ts`, and the `EventType` enum / Spanish labels from `prisma/schema.prisma` + `docs/PRD.md`.
- No DB schema, tRPC, or env changes (no DB autosave in this slice).
