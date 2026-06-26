## Context

Milestone 3 builds the unauthenticated-first creation wizard. This slice covers the foundation: preset config, the `/create` route, the local draft store, and the Event Type step. No DB persistence yet — drafts live only in `localStorage`. The app has no i18n library; Spanish copy is authored inline (as in the public layout components), so preset labels/copy are hardcoded Spanish strings. Existing design presets (`public-themes.ts`, `public-layouts.ts`) define the theme/layout IDs presets must reference. Zustand is not yet a dependency.

## Goals / Non-Goals

**Goals:**
- A typed `EventTypePreset` catalog keyed by the `EventType` enum.
- `/create` route rendering a step shell driven by a `?step=` query param.
- A persisted Zustand draft store with stale-draft (30-day) recovery and reset.
- Event Type step that seeds defaults without clobbering user-edited copy.

**Non-Goals:**
- DB autosave / tRPC mutations (later milestone slice).
- Details, design, gifts, auth-gate, publish steps (later 3.x tasks).
- Custom event types, AI copy generation, category drag-and-drop.

## Decisions

- **Preset shape follows the PRD `EventTypePreset` type** (`docs/PRD.md`). Add a local `SampleGift` type for preview cards. Presets are a `Record<EventType, EventTypePreset>` so lookup is total and type-checked against the enum. Alternative (array + find) rejected — weaker exhaustiveness guarantees.
- **Reference existing IDs, don't invent.** `defaultThemeId`/`defaultLayoutId` use ids already in `public-themes.ts` (`linen|midnight|sky|rose|sage|gold`) and `public-layouts.ts` (`grid|editorial|minimal`).
- **State: Zustand + `persist` middleware** to `localStorage`. Chosen because tasks specify Zustand and it keeps draft state out of URL while step lives in URL. The persisted payload stores the draft plus an `updatedAt` timestamp; `copyTouched` flags are persisted so edit-protection survives reload. Alternative (React context + manual localStorage) rejected — more boilerplate, no devtools.
- **Step routing via query param, not nested routes.** `/create?step=event-type`. A single client page reads `useSearchParams`, maps to a step component, falls back to the first step for missing/unknown values. Keeps shared store/layout mounted across steps (no remount, no draft flash). Nested routes rejected for this slice — would fragment the shared shell.
- **Copy-touched tracking is local-only and field-level.** Editing hero/welcome/thank-you marks that field touched; changing event type re-seeds only untouched fields; "regenerate" clears touched flags and re-applies preset copy. This satisfies the spec's preserve-vs-regenerate scenarios.
- **Stale detection on hydration.** On load, compare persisted `updatedAt` against now − 30 days; if stale, set a `needsRecovery` flag the shell reads to show a continue/discard prompt before editing proceeds. Signed-out recovery prompt reuses the same flag.
- **`localStorage` access is client-only.** The `/create` page and store usage are client components; persistence is guarded for SSR (no `window` on server) per Zustand `persist` defaults.

## Risks / Trade-offs

- **Hydration mismatch from persisted state** → use Zustand `persist` with `skipHydration`/store-ready gating so the first client render matches server output before applying the stored draft.
- **Preset IDs drift from design configs** → spec requires `defaultThemeId`/`defaultLayoutId` to match real ids; add a unit test asserting every preset's ids resolve against the theme/layout configs.
- **Copy-overwrite bugs** → field-level `copyTouched` plus unit tests for the change-event-type and regenerate scenarios.
- **localStorage unavailable (private mode / disabled)** → store still works in-memory for the session; persistence silently no-ops, draft simply won't survive reload.

## Migration Plan

Additive only — new files plus a `zustand` dependency. No schema/env/API changes, no data migration. Rollback = revert the change and remove `zustand`.

## Open Questions

- Exact sample-gift fields needed by the preview card (finalize against the gift card component when the design/preview step lands; this slice ships representative fields: name, optional image, optional price).
