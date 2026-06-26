## Context

The wizard currently supports local draft creation through `event-type`, `details`, `design`, and `gifts`, plus manual authenticated draft saving. Public preview components and publish-readiness helpers already exist, and the server has draft save and basic publish service functions. The missing piece is the final wizard step that turns the local draft into a published, shareable wishlist while preserving the unauthenticated-first creation flow.

## Goals / Non-Goals

**Goals:**

- Add `/create?step=publish` as the fifth wizard step.
- Reuse the existing public wishlist preview model and `PublicWishlistPage` preview mode for the embedded final preview.
- Evaluate publish readiness in the UI and enforce the same rules on the server before changing lifecycle state.
- Require Clerk authentication before publish and derive the local owner from the authenticated session, never from client input.
- Publish the current wizard draft through an owner-scoped server operation that can create/update the saved draft first.
- Return enough share metadata for copy-link, WhatsApp, QR download, public page, and dashboard actions.
- Clear persisted local wizard state only after a successful publish response.

**Non-Goals:**

- No schema migration or new environment variables.
- No payment, premium, or approval gate.
- No dashboard share panel implementation.
- No public discovery/search changes.
- No autosave behavior.

## Decisions

1. Add `publish` to the wizard step list and render a new `PublishStep`.

   Rationale: The PRD defines publish as Step 5 and `/create?step=publish`; this keeps route state consistent with existing query-param navigation. The existing Back/Next shell can move from `gifts` to `publish`, while the publish step owns its primary publish CTA.

   Alternative considered: Replace the disabled "Finalizar" state on `gifts` with inline publish controls. Rejected because it makes the share success state harder to preserve and breaks the documented step route.

2. Use local preview conversion for the embedded final preview.

   `PublishStep` should call the existing draft-to-preview mapper and render the public wishlist page in `preview` mode. This avoids database writes for preview and guarantees guest purchase actions remain disabled.

   Alternative considered: Require saving a DB draft before final preview and then render `/w/[slug]`. Rejected because signed-out creators must be able to inspect the final preview before auth.

3. Add a wizard publish mutation instead of chaining `saveDraft` and `publish` on the client.

   The mutation should accept the complete wizard draft payload plus saved-draft metadata, derive `ownerId` from Clerk, reuse the save-draft validation/replacement path, then publish the resulting owned draft if readiness passes. If save-draft conflict detection returns a conflict, the mutation returns the conflict without publishing.

   Alternative considered: Client calls `saveDraft`, then calls existing `publish` by `wishlistId`. Rejected because it creates a two-step failure surface and leaves the existing publish-by-ID path vulnerable unless every caller separately enforces ownership.

4. Make publishing owner-scoped.

   The server publish path used by tRPC must verify the wishlist belongs to the authenticated local owner and return a non-disclosing not-found result for missing/non-owned/non-draft wishlists. The service may keep a lower-level lifecycle helper, but exposed mutations must not publish by arbitrary ID.

   Alternative considered: Trust protected tRPC auth only. Rejected because authentication proves who the user is, not that they own the target wishlist.

5. Treat readiness as both UI guidance and server authority.

   The UI checklist should compute draft readiness using the same field set: title, event type, slug format/availability, language, currency, and at least one visible gift. The server remains authoritative after the draft is persisted and returns failed checklist details on `PRECONDITION_FAILED`.

   Alternative considered: Rely only on client readiness. Rejected because local state can be stale, invalid, or manipulated.

6. Keep share actions dependency-light.

   Copy link uses the Clipboard API with a fallback-visible URL. WhatsApp share is a URL helper that builds a Spanish message with the public wishlist URL. QR download can use an existing lightweight QR approach if present, or add a small client-side QR utility/component if needed; it must not require a server-side external service.

   Alternative considered: Add a backend QR image endpoint. Rejected for this step because the QR is a client share affordance and does not need persistent storage.

## Risks / Trade-offs

- Owner-scoping gap in the existing `publish` mutation -> Replace or wrap it with owner-derived service input before wiring the wizard CTA.
- Conflict handling during publish can interrupt a creator at the final step -> Reuse the save-draft conflict response shape and let the user choose server version or local overwrite before retrying.
- Clipboard and QR APIs vary by browser -> Provide visible public URL fallback and keep QR generation client-only.
- Local draft reset after publish can erase recovery data -> Reset only after a successful published response and after share metadata is stored in component state.
- Slug may become unavailable between UI readiness and publish -> Recheck on the server through persistence/unique constraints and return a clear blocking error.

## Migration Plan

- No database migration is required.
- Implement behind the existing `/create?step=` flow.
- Existing saved drafts remain valid.
- Rollback is code-only: remove the `publish` step route and wizard publish mutation wiring if needed; persisted draft data is unaffected.

## Open Questions

- None blocking. QR implementation can choose the smallest compatible client-side approach during apply work.
