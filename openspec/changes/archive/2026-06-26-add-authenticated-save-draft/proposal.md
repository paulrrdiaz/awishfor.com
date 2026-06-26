## Why

Creators can currently lose access to an in-progress wishlist when they change
browsers or devices because the wizard stores it only in local storage. Signed-in
creators need an explicit way to persist their work without publishing it, while
being protected from accidentally overwriting a newer saved version.

## What Changes

- Add a signed-in `Guardar borrador` action to the creation wizard; it saves only
  when explicitly activated and does not introduce autosave.
- Persist the complete wizard draft, including wishlist fields, categories, and
  gifts, as an owner-scoped database wishlist in `draft` status.
- Create a database draft on the first save and update the same draft on later
  saves, recording its ID and server revision timestamp in the local wizard state.
- Detect a stale local revision before an update and require the creator to
  choose whether to replace it with their local draft or keep the server version.
- Confirm successful saves with a Sonner toast and provide a dashboard link.

## Capabilities

### New Capabilities
- `authenticated-draft-saving`: Explicit, owner-scoped persistence and conflict
  handling for a complete creation-wizard draft.

### Modified Capabilities
- `creation-wizard`: Add the authenticated manual-save control, save state, and
  locally persisted saved-draft metadata to the wizard experience.

## Impact

- Affects `src/stores/wishlist-wizard.store.ts` and wizard client components.
- Adds a protected `wishlist.saveDraft` tRPC mutation plus request validation and
  local-user ownership resolution.
- Extends wishlist persistence services to atomically create or replace draft
  categories and gifts, using the existing `updatedAt` field for optimistic
  concurrency. No Prisma schema migration, environment variable, or dependency
  change is expected.
- Adds Sonner and its application-level toaster provider, plus focused service,
  router/validator, store, and component tests.

## Non-Goals

- Autosave, cross-device automatic draft restoration, and advanced merge UI.
- Publishing, final preview, authentication-gate routing, sharing, or clearing
  local state after publish; those belong to task 3.8.
