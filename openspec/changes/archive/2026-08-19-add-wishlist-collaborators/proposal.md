## Why

A wishlist has exactly one owner and no way to share control of it. `Wishlist.ownerId` is a single foreign key to `User`, and every read and write in the application scopes itself with `where: { id, ownerId }`.

That does not match how the lists are actually made. A baby shower list belongs to two parents; a wedding list belongs to two people getting married; a housewarming list belongs to a household. Today only one of them can add a gift, fix a price, add a guest, or correct the delivery address. The other watches over a shoulder or borrows the password — which is the outcome worth preventing, because a shared password puts the account itself at risk to solve a permissions problem.

`docs/FUTURE_IMPROVEMENTS.md` §Collaboration already names this: "Wishlist collaborators", "Invite co-owner by email", "Couple/family shared accounts". This change implements the smallest coherent version of that.

**This supersedes an explicit MVP non-goal.** `docs/PRD.md` §2 and §20 both list "Collaborators" as out of scope for the MVP. That decision was correct for launch and is being reversed deliberately here, not overlooked.

## What Changes

- Add a wishlist membership model so a wishlist can have collaborators alongside its single owner. The owner relationship is unchanged; membership is additive.
- Let an owner share a wishlist by typing an email address. **There is no acceptance step** — access is granted immediately and the wishlist appears in the recipient's dashboard.
- Show the recipient's account name in the share dialog before confirming, so a mistyped address is visible at the only moment it can be caught.
- Store a pending invitation when the address has no account yet, and convert it to membership when that person signs up.
- Send an invitation email in both cases — same trigger, differing only in copy and call to action — so a collaborator is never granted access they are never told about, and so the owner's confirmation wording does not differ based on whether an address has an account.
- Add a `Compartidas conmigo` group to the dashboard sidebar, listing wishlists shared with the signed-in user and labeling each with its owner. The group is hidden entirely when empty.
- Replace inline `ownerId` scoping with a single authorization helper covering both owner and collaborator access, and route every existing owner-scoped read and write through it.
- Reserve archive, restore, delete, and collaborator management to the owner. Everything else a collaborator can do.
- Give the owner a collaborator list with one-click removal, showing each collaborator's email and each pending invitation.
- Correct the guest-facing purchase consent copy, which currently promises purchase details are shared with "el creador de la lista" — singular, and no longer true once a list has collaborators.

## Capabilities

### New Capabilities

- `wishlist-collaboration`: Defines the membership model, sharing by email address, immediate access without acceptance, pending invitations and their conversion at signup, invitation expiry and revocation, owner-reserved capabilities, the unified authorization check, and the shared-wishlist dashboard surface.

### Modified Capabilities

- `public-wishlist-page`: The exact guest purchase consent copy changes from naming a single creator to naming the people organizing the list, because collaborators can now see purchase records.

## Impact

- **Depends on `add-transactional-email`.** That change must land first and its sending domain must be verified, or invitations to people without accounts are granted silently and never delivered.
- **Prisma schema and migration:** two new models, `WishlistMember` and `WishlistMemberInvitation`. No change to `Wishlist`, `User`, or any existing column.
- **Authorization refactor across the codebase.** `ownerId` currently appears in 109 places across `src/server/api/routers/` (category, gift, wishlist, purchase, invite), `src/server/services/` (category, gift, wishlist, purchase, invite), and two server-action files under `src/app/(protected)/dashboard/wishlists/[id]/`. This is the bulk of the work and the bulk of the risk.
- **Dashboard read path:** `wishlist.list` and `wishlist.summaryList` both filter by `ownerId` and must widen, or a collaborator gets full access and still sees an empty dashboard. Each has exactly one consumer — `src/app/(protected)/layout.tsx` and `src/app/(protected)/dashboard/wishlists/page.tsx` — so their return shapes can be changed safely.
- **Account claiming** hooks into `getOrCreateLocalUserId` in `src/server/services/local-user.service.ts` and the Clerk webhook at `src/app/api/webhooks/clerk/route.ts`.
- **New public route** `/invitations/[token]`. `src/proxy.ts` protects only `/dashboard(.*)`, so this is reachable while signed out with no middleware change, and `resolveRedirectPath` already permits it as a post-authentication redirect target.
- **New UI:** a `Colaboradores` section on the wishlist detail route, a share dialog, and the sidebar group in `src/components/features/dashboard/app-sidebar.tsx`.
- **Guest-facing copy change** in `src/components/features/wishlist/guest-gift-drawer.tsx` at two places, one of which is pinned by an exact-string requirement in the `public-wishlist-page` spec.
- **Data exposure:** collaborators can see `deliveryRecipientName`, `deliveryDocumentId`, `deliveryAddress`, `deliveryPhone`, gift `internalNote`, and every `Purchase` record including guest names, emails, and messages. This is intended — a co-organizer needs all of it — and is the reason for the consent copy correction and the confirmation step in the share dialog.
- `docs/PRD.md` §2 and §20 need updating to remove "No collaborators" and "Collaborators" from the non-goal lists, and `docs/FUTURE_IMPROVEMENTS.md` §Collaboration needs its implemented items marked.

## Non-Goals

- **No roles beyond owner and collaborator.** `docs/FUTURE_IMPROVEMENTS.md` names owner/editor/viewer, but every collaborator here has the same permissions. No `role` column is added; a read-only viewer is a separate change with its own reason to exist.
- **No acceptance, approval, or decline flow.** Access is immediate on both sides. The safeguard is the owner typing the correct address, confirmed against the recipient's account name in the dialog. This is a deliberate decision recorded in `design.md`.
- **No activity log or change attribution.** Two people editing one list makes "who changed this" a real question, and it is not answered here. Nothing in this change makes it harder to add later.
- **No ownership transfer.** The owner remains the owner.
- **No notifications beyond the invitation email.** A collaborator is not emailed about gifts added, guests invited, or purchases recorded.
- **No collaborator limit.** Nothing caps how many people a wishlist can be shared with. Add one if abuse appears.
- **No commenting or notes between collaborators**, also named in `docs/FUTURE_IMPROVEMENTS.md` and also out of scope.
