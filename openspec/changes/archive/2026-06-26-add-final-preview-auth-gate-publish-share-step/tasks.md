## 1. Server Publish Flow

- [x] 1.1 Add owner-scoped publish service behavior that verifies the wishlist belongs to the authenticated local owner before publishing.
- [x] 1.2 Add a wizard publish service operation that saves or updates the submitted wizard draft, respects save-draft conflict handling, then publishes the resulting owned draft.
- [x] 1.3 Return publish share metadata from the wizard publish operation, including wishlist ID, slug, public URL path, and dashboard URL path.
- [x] 1.4 Update wishlist tRPC procedures so wizard publish derives the local owner from Clerk and never accepts owner identity from the client.
- [x] 1.5 Add or update service/router tests for ready publish, unready publish, signed-out rejection, non-owner rejection, non-draft rejection, unsaved draft publish, saved draft publish, and conflict-blocked publish.

## 2. Wizard Routing And State

- [x] 2.1 Extend the wizard step model, labels, indicator, and Back/Next navigation to include `publish` after `gifts`.
- [x] 2.2 Add publish success session state handling so the page can show share metadata after the local draft store is cleared.
- [x] 2.3 Ensure reset/clear behavior removes the local draft, saved draft metadata, stale recovery state, and localStorage data only after successful publish.
- [x] 2.4 Add or update wizard navigation/store tests for `gifts -> publish`, `publish -> gifts`, unknown-step fallback, and post-publish local draft cleanup.

## 3. Publish Step UI

- [x] 3.1 Create `src/components/features/wizard/publish-step.tsx` and render the current draft with the existing public wishlist preview in `preview` mode.
- [x] 3.2 Add a full-page owner preview action for the current saved draft when a saved draft exists, and keep embedded preview available for unsaved local drafts.
- [x] 3.3 Render a publish readiness checklist for title, event type, slug, language, currency, and visible gifts, including slug availability/current-slug handling.
- [x] 3.4 Gate publish behind Clerk auth with a Spanish sign-in prompt that preserves the local draft and returns users to `/create?step=publish`.
- [x] 3.5 Wire the publish CTA to the wizard publish mutation, prevent duplicate submissions, and surface validation/conflict/server errors clearly.

## 4. Share Success Actions

- [x] 4.1 Render the Spanish publish success copy and canonical public wishlist URL after publish succeeds.
- [x] 4.2 Add copy-link behavior with success/error feedback and a visible URL fallback.
- [x] 4.3 Add WhatsApp share URL generation with Spanish invitation copy and the public wishlist URL.
- [x] 4.4 Add QR download behavior for the public wishlist URL without relying on an external server service.
- [x] 4.5 Add `Ver lista pública` and `Gestionar en dashboard` actions using the returned share metadata.

## 5. Validation And Milestone Tracking

- [x] 5.1 Add focused unit/component tests for publish readiness UI, auth gate behavior, publish success state, share actions, and preview purchase-action disabling where testable.
- [x] 5.2 Run `pnpm check` and fix reported Biome issues.
- [x] 5.3 Run `pnpm test` and fix regressions.
- [x] 5.4 Run `pnpm typecheck` and fix type errors.
- [x] 5.5 Mark docs milestone 3.8 tasks complete in `docs/TASKS.md` after implementation and validation results are known.
