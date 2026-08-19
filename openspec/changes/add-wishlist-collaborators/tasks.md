## 1. Schema and migration

- [x] 1.1 Add the `WishlistMember` model to `prisma/schema.prisma` with `wishlistId`, `userId`, optional `invitedById`, `createdAt`, `@@unique([wishlistId, userId])`, and `@@index([userId])`
- [x] 1.2 Add the `WishlistMemberInvitation` model with `wishlistId`, normalized `email`, unique `tokenHash`, `invitedById`, `expiresAt`, optional `lastSentAt`, `createdAt`, `@@unique([wishlistId, email])`, and `@@index([email])`
- [x] 1.3 Add the relations with explicit deletion behavior: `wishlist` on both models `onDelete: Cascade`; `WishlistMember.user` `onDelete: Cascade`; `invitedById` on both models optional and `onDelete: SetNull` so deleting the inviter does not revoke access
- [x] 1.4 Verify the Clerk webhook's `db.user.deleteMany({ where: { clerkId } })` on `user.deleted` still succeeds for an account that collaborates on someone else's wishlist, and add a test covering it — without the cascade on `WishlistMember.user` this throws and Clerk retries forever
- [x] 1.5 Run `pnpm db:migrate` and confirm `pnpm prisma generate` regenerates the client into `src/generated/prisma`
- [x] 1.6 Confirm no existing column or model was altered by the migration

## 2. The authorization seam

- [x] 2.1 Create the collaboration service exposing `assertWishlistAccess(db, { localUserId, wishlistId, requireOwner? })`, granting access to the owner and to collaborators, throwing `NOT_FOUND` otherwise and returning `{ wishlistId, isOwner }`
- [x] 2.2 Add unit tests covering owner access, collaborator access, unrelated-account rejection, removed-collaborator rejection, and `requireOwner` rejecting a collaborator
- [x] 2.3 Add a unit test asserting an unauthorized caller receives `NOT_FOUND` and never `FORBIDDEN`, so existence is not leaked

## 3. Migrate every ownership check to the seam

- [x] 3.1 Migrate `src/server/services/invite.service.ts`, replacing `assertOwnedWishlist` and `getOwnedInvite` with the seam while preserving their `NOT_FOUND` behavior
- [x] 3.2 Migrate `src/server/services/gift.service.ts`
- [x] 3.3 Migrate `src/server/services/category.service.ts`
- [x] 3.4 Migrate `src/server/services/purchase.service.ts`, reshaping `listOwnerWishlistRecentPurchases` from "purchases on wishlists owned by X" to "purchases on this wishlist, caller already authorized" — the seam returns `{ wishlistId, isOwner }` and no `ownerId`, so its signature changes
- [x] 3.5 Migrate `src/server/services/wishlist.service.ts`, marking archive and restore as owner-reserved
- [x] 3.6 Migrate `src/server/api/routers/gift.ts`, `category.ts`, `invite.ts`, and `purchase.ts`
- [x] 3.7 Migrate the update-by-id procedures in `src/server/api/routers/wishlist.ts` — `getById`, `overview`, `updateDesign`, `updateSettings`, `publish` — to the seam, with `archive` and `restore` passing `requireOwner`
- [x] 3.8 Handle the create-or-update wizard paths separately and do **not** apply the seam to creation: `saveDraft` and `publishWizard` reach `saveWishlistDraft` and `publishWishlistFromWizard`, where `ownerId` *establishes* ownership on a row that does not exist yet. Creation keeps `ownerId` as the ownership assignment; the update branch of those same paths authorizes through the seam so a collaborator can save a draft on a shared list
- [x] 3.9 Migrate the server actions in `src/app/(protected)/dashboard/wishlists/[id]/gifts/actions.ts` and `.../guests/actions.ts`
- [x] 3.10 Search the codebase for any remaining `ownerId` authorization predicate and confirm the only survivors are inside the seam, the two dashboard list queries, and the creation paths from task 3.8
- [x] 3.11 Run the existing test suite and confirm every owner-path test still passes unchanged — a solo owner's behavior must be identical to before

## 4. Dashboard read path

- [x] 4.1 Change `wishlist.list` to return `{ owned, shared }`, where each shared entry carries its owner's display name
- [x] 4.2 Change `wishlist.summaryList` the same way, so shared wishlists appear on `/dashboard/wishlists` with an owner label
- [x] 4.3 Update `src/app/(protected)/layout.tsx` for the new `list` shape
- [x] 4.4 Update `src/app/(protected)/dashboard/wishlists/page.tsx` for the new `summaryList` shape
- [x] 4.5 Add the `Compartidas conmigo` `SidebarGroup` to `src/components/features/dashboard/app-sidebar.tsx`, mirroring the `Mis wishlists` group without its `Nueva wishlist` row, using `Users` from lucide and the existing `getStatusMeta` pill
- [x] 4.6 Render each shared entry with its owner label
- [x] 4.7 Ensure the group is not rendered at all when no wishlists are shared, and add a test asserting a solo user's sidebar is unchanged
- [x] 4.8 Add tests asserting shared wishlists appear for a collaborator and are absent for an unrelated account

## 5. Sharing

- [x] 5.1 Add validators for the share input: normalize the address by trimming and lowercasing, and reject the owner's own address
- [x] 5.2 Add a lookup returning the display name of the account matching an address, or absence, for the confirmation step
- [x] 5.3 Implement sharing: create membership when the address has an account, otherwise upsert a pending invitation with a fresh token, storing only its hash and an `expiresAt` 30 days out
- [x] 5.4 Make repeat sharing idempotent, reporting that the person already has access rather than erroring
- [x] 5.5 Implement listing collaborators and pending invitations for a wishlist, owner-reserved
- [x] 5.6 Implement removing a collaborator and revoking a pending invitation, both owner-reserved and both taking effect immediately
- [x] 5.7 Implement resending a pending invitation, updating `lastSentAt` and throttling repeat sends
- [x] 5.8 Register the collaboration router in `src/server/api/root.ts`
- [x] 5.9 Add unit tests for normalization, self-sharing rejection, idempotent re-sharing, revocation, and owner-reserved enforcement on every management operation

## 6. Invitation email

- [x] 6.1 Add the invitation template in `src/lib/email/templates/` producing subject, HTML, and text, with two call-to-action variants for existing and non-existing accounts
- [x] 6.2 Ensure the template names the wishlist and the person who shared it, and that the invitation URL appears in the plain-text body
- [x] 6.3 Send through `after()` from `next/server` after the membership or invitation row is committed, never before
- [x] 6.4 Ensure a send failure leaves the grant intact and still reports success to the owner
- [x] 6.5 Ensure the owner-facing confirmation wording is identical whether or not the address had an account
- [x] 6.6 Add tests asserting the email is triggered in both branches, that the correct variant is chosen, and that a failed send does not fail the mutation

## 7. Invitation link and claiming

- [x] 7.1 Add the public route `/invitations/[token]`, confirming `src/proxy.ts` requires no change
- [x] 7.2 Signed in with a valid pending invitation: claim it, create membership, delete the invitation, redirect to the wishlist
- [x] 7.3 Signed out: render a minimal page naming the wishlist and its owner, linking to sign-up and sign-in with `redirect_url` back to the invitation, and revealing no gifts, guests, delivery details, or purchases
- [x] 7.4 Handle unknown, already-claimed, and expired tokens with distinct friendly pages that do not reveal whether the wishlist exists
- [x] 7.5 Implement claim path A: claiming by token succeeds regardless of which address the account was created with
- [x] 7.6 Implement claim path B: sweep pending invitations matching the new user's **verified** address inside `getOrCreateLocalUserId`, skipping the sweep when the local user already exists
- [x] 7.7 Add the same sweep to the `user.created` branch of `src/app/api/webhooks/clerk/route.ts`
- [x] 7.8 Make claiming idempotent against `@@unique([wishlistId, userId])` so both paths can run without error
- [x] 7.9 Add tests for: signup with a different address than invited, signup without following the link, claiming before any webhook fires, unverified addresses not claiming, expired tokens not claiming, and double claiming producing one membership
- [x] 7.10 Verify `resolveRedirectPath` accepts `/invitations/<token>` and add a test pinning it

## 8. Collaborator management UI

- [x] 8.1 Add the `Colaboradores` section to the wishlist detail route, visible to the owner only
- [x] 8.2 Add the share dialog with address entry and a confirmation step showing the matched account's name, or stating the person will be invited to create an account
- [x] 8.3 Ensure cancelling at confirmation creates nothing and sends nothing
- [x] 8.4 List collaborators and pending invitations with their email addresses, showing when each pending invitation was last sent
- [x] 8.5 Add one-click removal for collaborators and revocation for pending invitations, each with a confirmation
- [x] 8.6 Add the resend control for pending invitations
- [x] 8.7 Hide owner-reserved controls — archive, restore, delete, and the `Colaboradores` section itself — when the viewer is a collaborator

## 9. Guest consent copy

- [x] 9.1 Update the consent copy in `src/components/features/wishlist/guest-gift-drawer.tsx:410` to "Al marcar este regalo como comprado, compartiremos tu nombre y los datos opcionales que ingreses con quienes organizan la lista."
- [x] 9.2 Update the singular framing at `src/components/features/wishlist/guest-gift-drawer.tsx:240` to match
- [x] 9.3 Update any test pinning the previous exact string
- [x] 9.4 Update `docs/PRD.md:2113`, which states purchase details are shared with the wishlist creator only

## 10. Documentation

- [x] 10.1 Remove "No collaborators" from `docs/PRD.md` §2 and "Collaborators" from §20, noting that the MVP non-goal was deliberately superseded
- [x] 10.2 Mark the implemented items in `docs/FUTURE_IMPROVEMENTS.md` §Collaboration and leave roles, activity log, and commenting listed as still future
- [x] 10.3 Sync the corresponding milestone items in `docs/TASKS.md`

## 11. Close out

- [x] 11.1 Confirm every wishlist-scoped route authorizes through the seam, by inspection and by test
- [x] 11.2 Confirm a collaborator is denied archive, restore, delete, and collaborator management, and receives `NOT_FOUND` rather than `FORBIDDEN` where the wishlist is not theirs
- [x] 11.3 Confirm a solo owner's dashboard, sidebar, and permissions are unchanged from before this change
- [x] 11.4 Run `pnpm check`
- [x] 11.5 Run `pnpm test`
- [x] 11.6 Run `pnpm typecheck`
