## 1. Draft Save API

- [x] 1.1 Add bounded Zod schemas and TypeScript types for a complete save-draft payload, including normalized categories, gifts, optional saved-draft identity, revision, and explicit overwrite confirmation.
- [x] 1.2 Implement transactional create and owner-scoped conditional-update draft persistence in `wishlist.service`, including category-to-gift mapping, ordered collection replacement, and discriminated success/conflict results.
- [x] 1.3 Add the protected `wishlist.saveDraft` mutation, resolving the Clerk user to the local owner and returning non-disclosing errors for missing, non-owned, or non-draft IDs.
- [x] 1.4 Add validator, service, and router tests for first save, same-draft update, collection replacement, invalid category references, authorization, draft status restrictions, and revision conflicts/forced overwrite.

## 2. Wizard Save Experience

- [x] 2.1 Add the Sonner dependency and render a single application-level toaster provider.
- [x] 2.2 Extend the persisted wizard store with `savedWishlistId` and `lastSavedAt`, server-draft replacement support, and reset behavior; add store tests.
- [x] 2.3 Add client mapping between local wizard draft fields and the save-draft API payload/result, preserving date, nullable fields, category assignments, gift visibility, priority, and order.
- [x] 2.4 Add a signed-in `Guardar borrador` action to the hydrated wizard shell with pending-state protection, successful-save toast, persisted metadata update, and `Ver en dashboard` link.
- [x] 2.5 Add signed-out save prompting, conflict resolution UI for loading server content or explicitly overwriting it, and save-as-new handling for stale/non-owned local metadata.
- [x] 2.6 Add focused wizard UI tests for manual saving, no duplicate requests while pending, success feedback, and each conflict-resolution path.

## 3. Documentation And Verification

- [x] 3.1 Mark task 3.7 complete in `docs/TASKS.md` only after the implementation and required validation pass, reporting any validation failure if applicable.
- [x] 3.2 Run `pnpm check`, `pnpm test`, and `pnpm typecheck` and resolve or report failures.
