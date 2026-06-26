## Context

The public `/create` wizard keeps a complete draft in a persisted Zustand store,
but the draft has no database identity. `Wishlist` already has draft lifecycle
status, categories, gifts, and an `updatedAt` timestamp. The wishlist tRPC router
currently exposes only public slug checks and protected publishing; protected
routers resolve the authenticated Clerk ID to a local `User` before owner-scoped
writes.

## Goals / Non-Goals

**Goals:**

- Let a signed-in creator explicitly save and re-save the complete local draft.
- Make saving atomic, owner-scoped, and safe against overwriting a newer server
  revision.
- Give a clear success confirmation and dashboard path without changing wizard
  navigation or publishing behavior.

**Non-Goals:**

- Autosave, background synchronization, cross-device draft discovery, or
  field-level merges.
- Publication, share UI, final preview, or authentication-gate routing.
- Preserving database IDs for draft categories or gifts between saves.

## Decisions

### Explicit protected mutation

Add `wishlist.saveDraft` as a `protectedProcedure`. It resolves `ctx.userId` to
the local `User` record, and accepts the complete normalized wizard payload plus
optional `savedWishlistId`, `lastSavedAt`, and `force` fields. The route validates
all persisted wishlist, category, and gift values with Zod before calling the
service.

The service will only create drafts for the resolved owner and only update a
wishlist whose ID, owner, and status are `draft`. It will never trust an owner ID
from the browser. This follows the category router's local-user lookup pattern.

Alternative: expose separate create and update mutations. Rejected because the
client's save action needs one stable operation and server-side ownership/status
checks regardless of which path it takes.

### Replace draft collections transactionally

On first save, a Prisma transaction creates the wishlist, ordered categories,
and ordered gifts, mapping each local gift's category name to its newly-created
category ID. On later saves, the same transaction conditionally updates the
wishlist and replaces its draft-only categories and gifts in order. It deletes
gifts before categories, then recreates both collections so category references
remain valid.

This is safe because only `draft` wishlists can be saved and drafts cannot have
guest purchases. Inputs must contain unique, trimmed category names; every
non-empty gift category must be present in that category list. Gift local IDs are
not persisted as database IDs.

Alternative: reconcile rows using local IDs or add a separate draft-table
model. Rejected because local IDs are browser-only, reconciliation adds a large
mapping surface, and the existing wishlist model already captures the required
draft lifecycle.

### Optimistic concurrency and conflict resolution

The mutation returns `{ status: "saved", wishlistId, lastSavedAt }` after every
successful write, where `lastSavedAt` is the server `updatedAt` timestamp in
milliseconds. The Zustand store persists `savedWishlistId` and `lastSavedAt`
alongside the local draft.

For an update, `lastSavedAt` is the expected server revision. The service uses a
conditional owner-and-draft update inside the transaction; if its revision no
longer matches, it returns `{ status: "conflict", serverDraft }` without writing.
The client presents a modal that lets the creator load the server draft or keep
the local draft and retry with `force: true`. Forced saves remain owner-scoped
and draft-only. The server response includes a complete mapped wizard draft so
the load-server path has no follow-up request.

If a persisted local ID is missing or not owned by the current user, the server
returns a non-disclosing not-found result. The client clears only the saved-draft
metadata and prompts the creator to save the local content as a new draft; it
must not silently attach one user's browser draft to another account.

Alternative: last-write-wins updates or automatic merging. Rejected because
both can silently discard edits and exceed the MVP's manual-save scope.

### Wizard UI and feedback

The shell owns a `Guardar borrador` action so it is available on every wizard
step after the store hydrates. It maps the store draft to the mutation input,
disables itself during a request, and changes no data until the creator presses
it. Signed-out users see an authentication prompt rather than a mutation call.
Successful saves update local metadata, show a Sonner success toast, and reveal
`Ver en dashboard` linking to `/dashboard`. Add Sonner and a single root toaster
provider if the application does not already have one.

## Risks / Trade-offs

- [Replacing collections removes draft row IDs] -> Restrict the operation to
  unpublishable drafts and preserve every user-visible field and sort order.
- [Timestamp precision can produce a false conflict] -> Send the exact server
  `updatedAt` value returned by the prior save through SuperJSON and use it only
  as an optimistic revision token; the modal lets the creator retry intentionally.
- [A shared browser retains another account's local metadata] -> Resolve every
  update through the current local owner, return no resource details on mismatch,
  and require an explicit save-as-new decision.
- [A conflict response can be large] -> Bound category and gift arrays in the
  validator; this is a manual, user-initiated operation rather than a polling
  path.

## Migration Plan

1. Add the validation, service transaction, protected tRPC mutation, and tests.
2. Add the persisted store metadata and wizard save/conflict UI.
3. Add Sonner/provider and validate the complete flow.

No migration is required because `Wishlist.updatedAt`, categories, and gifts
already exist. Rollback removes the client action and mutation; saved wishlists
remain valid draft records that can be managed or removed through later owner
tools.

## Open Questions

None. The conflict modal provides the MVP's intentional overwrite decision; more
advanced merge and account-switch UX remain out of scope.
