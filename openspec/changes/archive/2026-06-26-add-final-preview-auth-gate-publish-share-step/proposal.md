## Why

Creators can build and save a wishlist draft, but the creation wizard does not yet provide the final step that lets them validate readiness, authenticate if needed, publish, and immediately share the public wishlist. This blocks the MVP journey from unauthenticated creation through launchable public sharing.

## What Changes

- Add the fifth wizard step at `/create?step=publish` with an embedded final preview and a full-page owner preview link.
- Show a publish readiness checklist based on the existing publish-readiness rules and block publishing until all required items pass.
- Gate publish behind authentication while preserving the local draft for signed-out creators.
- Add a protected publish flow that persists the current wizard draft as an owner draft when needed, publishes the wishlist, and returns public share metadata.
- Add the publish success/share state with copy-link, WhatsApp share, QR download, public wishlist, and dashboard actions.
- Clear the local Zustand/localStorage wizard draft only after successful publish.
- Non-goals: payment or premium gates, dashboard share-panel work, public wishlist discovery, and full QR/share infrastructure outside this wizard step.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `creation-wizard`: Add the final publish step UX, auth gate, readiness checklist, publish success state, share actions, and local draft cleanup behavior.
- `wishlist-lifecycle`: Add the owner-scoped publish operation behavior needed by the wizard, including authenticated access, current-user ownership, draft persistence before publish, readiness failures, and public share metadata.

## Impact

- Affected UI: `src/app/create/page.tsx`, `src/components/features/wizard/*`, and new/updated `publish-step` components.
- Affected state: `src/stores/wishlist-wizard.store.ts` for publish-step routing metadata, success state, and post-publish reset behavior.
- Affected server code: `src/server/services/wishlist.service.ts`, `src/server/api/routers/wishlist.ts`, validators used for draft save/publish, and publish-readiness helpers.
- Affected public rendering: reuse existing public wishlist preview/layout components in preview mode; no guest purchase mutations from embedded previews.
- Affected sharing utilities: add or reuse small helpers for public wishlist URLs, clipboard, WhatsApp URL creation, and QR download.
- No new environment variables, database schema changes, or external services are expected.
