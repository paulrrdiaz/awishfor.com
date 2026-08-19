## Context

Ownership in this codebase is not a check applied at a boundary — it is a filter inlined into every query. The pattern is always some variant of:

```ts
const wishlist = await ctx.db.wishlist.findFirst({
  where: { id: input.id, ownerId },
});
if (!wishlist) throw new TRPCError({ code: "NOT_FOUND" });
```

`ownerId` and its helpers appear across **109 matched lines** in five routers, five services, and two server-action files. Not all 109 are authorization predicates — the count includes helper definitions and pass-through object literals — but the authorization-bearing subset is spread through all twelve files, and in each of those it does two jobs at once: it scopes the query, and it authorizes the caller. That conflation is why adding a second kind of access is a large change rather than a small one.

One category is different and must not be migrated: **creation**. `saveWishlistDraft` and `publishWishlistFromWizard` take `ownerId` to *establish* ownership on a row that does not exist yet. There is nothing to authorize against. The rule is that `ownerId` survives wherever it assigns ownership, and is replaced wherever it checks it.

Two properties of the existing code are worth preserving deliberately:

- **Unauthorized access returns `NOT_FOUND`, not `FORBIDDEN`.** A stranger cannot distinguish "this wishlist does not exist" from "this wishlist is not yours." That is the correct behavior and it must survive the refactor.
- **`assertOwnedWishlist` in `src/server/services/invite.service.ts` already has the right shape** — a named check that throws `NOT_FOUND` — it is simply not used universally.

Relevant existing infrastructure:

- `getOrCreateLocalUserId` (`src/server/services/local-user.service.ts`) maps a Clerk user to a local `User` row, upserting on demand. Its own comment records why: the Clerk webhook "can lag a session by a few seconds (or never fire in local dev without a tunnel)."
- `User.email` is `@unique` and mirrors Clerk.
- `Purchase.undoTokenHash` + `Purchase.undoExpiresAt` establish the tokened-link idiom: store a hash, never the token.
- `src/proxy.ts` protects only `/dashboard(.*)`; every other route is public by default.
- `resolveRedirectPath` (`src/lib/auth/safe-redirect.ts`) accepts any internal path, rejecting protocol-relative and absolute URLs.
- The sidebar (`src/components/features/dashboard/app-sidebar.tsx`) renders a `Mis wishlists` `SidebarGroup` from `api.wishlist.list()`, called in `src/app/(protected)/layout.tsx`.

## Goals / Non-Goals

**Goals**

- A wishlist can be edited by more than one person.
- Sharing costs the owner one email address and one confirmation.
- The recipient does nothing to gain access.
- Authorization lives in one place that is hard to bypass and easy to review.
- A solo user's experience is byte-for-byte unchanged.

**Non-Goals**

- Roles, permission matrices, or read-only viewers.
- Acceptance, approval, or decline flows.
- Activity logs or change attribution.
- Ownership transfer.
- Notifications beyond the single invitation email.

## Decisions

### 1. Keep `ownerId`; add membership alongside it

`Wishlist.ownerId` stays exactly as it is. `WishlistMember` rows are additive.

The alternative — dropping `ownerId` and making the owner a member with an `owner` role — is cleaner on paper and rejected on three grounds. It requires a data migration of every existing wishlist. It makes "the owner" a query rather than a column, when owner is genuinely distinct: it can never be removed, it is reserved for destructive operations, and it is what the wishlist would be orphaned without. And it would turn a 109-site refactor into a 109-site refactor *plus* a migration whose failure mode is losing track of who owns what.

### 2. One authorization seam, and the refactor is the change

```
BEFORE                                AFTER
────────────────────────────          ──────────────────────────────────
router  ─► where:{id, ownerId}        router  ─┐
service ─► where:{id, ownerId}        service ─┼─► assertWishlistAccess(
action  ─► where:{id, ownerId}        action  ─┘     db, { localUserId,
     × 109                                             wishlistId,
                                                       requireOwner? })
                                                            │
                                              ┌─────────────┴─────────────┐
                                              ▼                           ▼
                                        ownerId matches?          member row exists?
                                              └─────────────┬─────────────┘
                                                            ▼
                                                 returns, or throws NOT_FOUND
```

Signature:

```ts
assertWishlistAccess(db, {
  localUserId: number;
  wishlistId: string;
  requireOwner?: boolean;   // default false
}): Promise<{ wishlistId: string; isOwner: boolean }>
```

The rejected alternative is widening each query in place with `OR: [{ ownerId }, { members: { some: { userId } } }]`. It avoids a refactor and it is the wrong call: 109 hand-edited authorization predicates cannot be reviewed with confidence, and a single missed site is either a data leak or a silent loss of access. One helper is reviewable in one sitting; that is the entire argument.

A boolean rather than a capability enum, because there are exactly two tiers. A `capability: "read" | "write" | "manage"` parameter would be modeling permissions this change explicitly does not have.

**Migrate every call site in this change.** A half-migrated authorization layer, where some paths check membership and others do not, is worse than either end state — it produces access that works on one screen and fails on the next, which reads as a bug rather than a permission.

### 3. No acceptance step

Access is granted the moment the owner confirms. If the address has an account, the member row is written immediately and the wishlist appears in their sidebar. If it does not, a pending invitation waits and converts at signup.

This is a deliberate product decision. The trust model is the same as sharing a document by address: **the safeguard is the owner typing the correct email.** The consequence is real and worth stating plainly — a typo that lands on another real account silently exposes delivery address, document ID, phone, gift internal notes, and every purchase record to a stranger, with no notification to anyone.

Three mitigations, none of which add a step for the recipient:

1. **Echo the recipient back before confirming.** When the address matches an account, the dialog shows that account's name. "Ana Torres" appearing when the owner meant to invite Ana Tejada is the cheapest possible typo catch, at the only moment it is catchable.
2. **Removal is one click** and takes effect immediately.
3. **The collaborator list shows every email address**, so a mistake stays visible after the fact rather than only at the moment it is made.

Mitigation 1 confirms to the owner that an address has an account, which is a mild account-enumeration signal. Accepted: it requires already knowing the address, it reveals nothing beyond existence, and the typo protection is worth more than the leak costs at this product's scale and threat model.

The rejected alternative — requiring the recipient to accept — closes the typo hole properly, and was rejected because it puts a step between the two people who most want this to just work, and because the overwhelmingly common case is two people in the same household who have already discussed it out loud.

### 4. Two tables, no status enum

```prisma
model WishlistMember {
  id          String   @id @default(cuid())
  wishlistId  String
  userId      Int
  invitedById Int?
  createdAt   DateTime @default(now())

  @@unique([wishlistId, userId])
  @@index([userId])
}

model WishlistMemberInvitation {
  id          String   @id @default(cuid())
  wishlistId  String
  email       String
  tokenHash   String   @unique
  invitedById Int
  expiresAt   DateTime
  lastSentAt  DateTime?
  createdAt   DateTime @default(now())

  @@unique([wishlistId, email])
  @@index([email])
}
```

Because there is no acceptance step, there is no state machine and therefore no status enum. **A row's existence is the state.** A `WishlistMember` row means access; deleting it revokes access. A `WishlistMemberInvitation` row means an address is waiting for an account; it is deleted when converted or revoked.

`WishlistMemberInvitation` is a waiting room for addresses with no account — nothing more. An address that already has an account never gets one.

**Deletion behavior is load-bearing, not boilerplate.** The Clerk webhook runs `db.user.deleteMany({ where: { clerkId } })` on `user.deleted` (`src/app/api/webhooks/clerk/route.ts`). If `WishlistMember.user` is a required relation with no cascade, that delete throws for any account collaborating on someone else's list: the webhook returns 500, Clerk retries it forever, and the local user is never removed. So:

- `WishlistMember.wishlist` and `WishlistMemberInvitation.wishlist` → `Cascade`. Deleting a wishlist removes its access rows.
- `WishlistMember.user` → `Cascade`. Deleting an account removes its memberships.
- `invitedById` on both models → `SetNull`, and therefore optional. Deleting the person who did the inviting must not revoke a collaborator's access or void a pending invitation — the grant belongs to the wishlist, not to whoever happened to extend it.



Index rationale: `@@index([userId])` powers the `Compartidas conmigo` query, which runs in the dashboard layout on every protected page load. `@@index([email])` powers the claim lookup at signup. Both `@@unique` constraints make re-sharing an idempotent upsert rather than a duplicate.

`expiresAt` is checked at claim time and never swept. There is no cron in this repository, so a stored `expired` status would go stale and lie. **30 days**, chosen because 7 is the security convention and is hostile for a spouse who reads email weekly, while unbounded leaves a live credential in an inbox forever.

### 5. Two claim paths, because the invited address is often not the signup address

The failure this prevents: the owner invites `husband@work.com`; he signs up with `husband@gmail.com`; nothing matches; he lands in an empty dashboard with no explanation and no error to search for.

```
PATH A — token (authoritative)
  clicks the email link → /invitations/<token>
  → signs up with ANY address
  → redirected back to /invitations/<token>
  → claim by invitation id; email mismatch is irrelevant

PATH B — email match (safety net)
  never clicks; signs up because someone told him to
  → on local user creation, find pending invitations
    WHERE email = his verified address
  → claim them
```

Both are required. They cover disjoint behaviors, and each alone leaves a plausible person with no access.

**Path B must live in `getOrCreateLocalUserId`, not only in the Clerk webhook.** The service's own comment explains why: the webhook lags in production and never fires in local development without a tunnel. Putting the sweep only in the webhook makes the flow untestable locally and racy in production. Adding it to the webhook as well is harmless — both paths are idempotent against the `@@unique([wishlistId, userId])` constraint.

**Path B matches verified addresses only.** Matching an unverified address would let anyone claim invitations by typing a stranger's email at signup. Clerk owns verification; the claim reads the verified primary address.

Path A stores `tokenHash`, never the token, following `Purchase.undoTokenHash`.

### 6. Email in both branches, differing only in copy

The rule "email only when there is no account" was considered and rejected. It leaves the account-holder branch with no notification at all — a person is granted edit access to a list containing someone's home address and finds out only if they happen to open a dashboard they may not visit weekly. It also makes the owner's confirmation UI branch on account existence, which is a louder enumeration signal than decision 3's name echo.

```
NO ACCOUNT                          HAS ACCOUNT
────────────────────────            ────────────────────────
"Ana te invitó a colaborar"         "Ana te invitó a colaborar"
CTA → Crear cuenta                  CTA → Ver la lista
   → /invitations/<token>              → /dashboard/wishlists/<id>/gifts
   → sign-up → claim (Path A)          → membership already exists;
                                          sign-in redirect if needed
```

**Only the no-account branch uses a token.** Per decision 4, an address that already has an account never gets a `WishlistMemberInvitation` row, so there is no token to mint for it — its membership was written directly and its link goes straight to the wishlist. Routing both branches through `/invitations/<token>` would require inventing an invitation row purely to carry a link, which is exactly the state the no-acceptance model exists to avoid.

One trigger, one template with two call-to-action variants. The owner's UI says the same thing either way.

### 7. `/invitations/[token]` is public and does the routing

The route is publicly reachable with no middleware change — `src/proxy.ts` matches only `/dashboard(.*)`.

Everyone who reaches this route arrived from a no-account invitation email — an existing account's email links straight to the wishlist (decision 6). The signed-in branch below therefore fires for someone who was invited without an account and then signed up, either through this link or independently before returning to it. It is not the primary path for existing collaborators, who never see this route at all.

```
GET /invitations/<token>
  │
  ├─ signed in?
  │    ├─ yes → claim if pending → redirect to the wishlist
  │    └─ no  → render a minimal page naming the wishlist and its owner,
  │             linking to sign-up with redirect_url=/invitations/<token>
  │
  ├─ token unknown or already claimed → friendly page, link to /dashboard
  └─ token expired → friendly page explaining it lapsed and to ask for a new one
```

`resolveRedirectPath` already permits `/invitations/<token>` as a redirect target and rejects protocol-relative and absolute URLs, so the post-signup return works with no change to the auth flow.

The signed-out page names the wishlist and owner but shows **no wishlist contents** — the token is in an email that may have been forwarded, and delivery addresses are behind it.

### 8. `Compartidas conmigo` is a second sidebar group, hidden when empty

A new `SidebarGroup` mirroring `Mis wishlists` (`app-sidebar.tsx:139`): same `SidebarMenuButton` classes, same status pill via `getStatusMeta`, no `+ Nueva wishlist` row, `Users` from lucide.

**The group is not rendered at all when there are no shared wishlists.** Solo users — nearly all of them — see no change whatsoever.

Each entry is labeled with its owner. Without that label a shared "Boda de Ana" is indistinguishable from a list of the user's own, and the ambiguity compounds as soon as someone collaborates on two.

`api.wishlist.list()` returns `{ owned, shared }` rather than a flat array. It has exactly one consumer (`src/app/(protected)/layout.tsx:18`), so the reshape is contained.

`summaryList` gets the same treatment and shared lists **do** appear on `/dashboard/wishlists` carrying the same owner label. The alternative — sidebar only — was rejected for producing a list that is visible in the sidebar and absent from the page that claims to show all wishlists, which reads as a bug.

### 9. Owner-reserved: archive, restore, delete, and collaborator management

Collaborators can do everything else: gifts, categories, guests, design, settings, publish, unpublish, and viewing purchases.

The line is drawn at destructive and structural operations. A collaborator accidentally archiving a wedding list a week before the wedding is a bad afternoon that no undo fully repairs, and collaborator management must be owner-reserved or a collaborator could remove the owner's other collaborators — or, worse, be socially pressured into it.

Publishing is *not* owner-reserved. It is reversible, and a co-organizer who cannot publish the list they built has not really been given access.

### 10. Guest consent copy must change

`src/components/features/wishlist/guest-gift-drawer.tsx:410` currently reads:

> "Al marcar este regalo como comprado, compartiremos tu nombre y los datos opcionales que ingreses con el creador de la lista."

This is pinned by an exact-string requirement in `openspec/specs/public-wishlist-page/spec.md` with a dedicated "Consent copy is exact" scenario, and echoed by `docs/PRD.md:2113`. Once a list has collaborators the promise is false: purchase records, including guest names, emails, and messages, are visible to every collaborator.

The copy changes to name the organizers rather than a single creator, which is accurate whether or not a given list has collaborators. `guest-gift-drawer.tsx:240` carries the same singular framing and changes with it.

This is not optional cleanup. It is a promise made to guests who are not users of this product and never agreed to anything, and shipping collaborators without it makes the product's own consent statement untrue.

## Risks

- **The 109-site refactor is the whole risk of this change.** A missed site either leaks data or silently denies a collaborator access. Mitigations: migrate every site in one change rather than staging it; after migration, assert no `ownerId` predicate remains outside the seam and the two list queries; keep `NOT_FOUND` semantics so a mistake does not become an existence oracle.
- **A typo grants a stranger access to real PII.** Accepted per decision 3, mitigated by the name echo, one-click removal, and a visible collaborator list. Revisit if it happens in practice.
- **Depends on `add-transactional-email` and on a verified sending domain.** If invitations go to spam or are not delivered, the no-account branch grants access nobody learns about. The domain verification task in that change is a hard prerequisite, not a formality.
- **`after()` is not durable, so an invitation email can be lost.** The collaborator list must show pending invitations with a resend control; that control is the retry mechanism, since there is no queue.
- **Purchase visibility may surprise an owner.** A collaborator can see who bought what — intended for a co-organizer, but it also means the surprise is spoiled for a collaborator who might have preferred not to know. Not solved here; noted because someone will ask.
- **`getOrCreateLocalUserId` runs on effectively every authenticated request.** Adding a claim sweep puts an extra indexed query on that path. `@@index([email])` keeps it cheap, but it should be measured rather than assumed, and skipped entirely when the local user already exists — which is the overwhelming majority of calls.
