## 1. Schema & migration

- [x] 1.1 Add `RsvpStatus` enum (`pending | confirmed | declined`) to `prisma/schema.prisma`
- [x] 1.2 Add `Invite` model (id, wishlistId, primaryName, primaryEmail?, primaryPhone?, slug, status default pending, openedAt?, respondedAt?, timestamps) with `@@unique([wishlistId, slug])` and `@@index([wishlistId])`; relation to `Wishlist` with `onDelete: Cascade`
- [x] 1.3 Add `InviteExtraGuest` model (id, inviteId, name?, sortOrder) with `onDelete: Cascade` to `Invite`; add `invites` relation to `Wishlist`
- [x] 1.4 Run `pnpm prisma migrate dev` and `pnpm prisma generate`

## 2. Slug helper & reserved segments

- [x] 2.1 Add a guest-slug util: derive from primaryName (reuse existing slug helper), plus a reserved-segment denylist (e.g. `rsvp`, `edit`) covering current/likely `/w/[slug]/` children
- [x] 2.2 Unit test slug derivation, uniqueness-conflict detection, and reserved-word rejection

## 3. invite tRPC router

- [x] 3.1 Create `src/server/api/routers/invite.ts` with `protectedProcedure` `list`, `create`, `update`, `delete`, each asserting wishlist ownership via `ctx.userId`
- [x] 3.2 Zod input: primaryName required, optional email/phone, `extraGuests` array capped at 4 (optional names), optional explicit slug; enforce per-wishlist slug uniqueness + reserved-word check server-side
- [x] 3.3 Add public `respond` procedure (`wishlistSlug`, `guestSlug`, `status` restricted to `confirmed|declined`) setting status + `respondedAt`
- [x] 3.4 Register `invite` router in `src/server/api/root.ts`
- [x] 3.5 Router tests: ownership rejection, extra-guest cap, slug uniqueness/reserved, respond happy paths + invalid status

## 4. View model & open tracking

- [x] 4.1 Extend `PublicWishlistViewModel` in `src/server/mappers/view-models` with optional `guest` (primaryName, extraGuests[{name|null}], status)
- [x] 4.2 Add a resolver/mapper that loads an invite by wishlist slug + guest slug and builds the `guest` field
- [x] 4.3 Set `openedAt` on first resolve only (guard when null; best-effort, non-blocking)

## 5. Public personalized route

- [x] 5.1 Create `src/app/w/[slug]/[guestSlug]/page.tsx`: resolve wishlist + invite, record open, render `PublicWishlistPage` with `guest`; render existing not-found when wishlist unpublished or invite missing
- [x] 5.2 Confirm `/w/[slug]/page.tsx` (no guest) still renders with no guest section

## 6. Shared guest section component

- [x] 6.1 Build `GuestWelcomeSection` (greeting by primaryName; list named extra guests, else "+N" companion count; omit companions when none)
- [x] 6.2 Build the client RSVP control calling public `invite.respond`, reflecting `pending → confirmed/declined`
- [x] 6.3 Add a Storybook story covering named/unnamed/no-extra-guest and each status

## 7. Per-layout integration (17 layouts)

- [x] 7.1 Thread `wishlist.guest` from `PublicWishlistPage` (no dispatcher signature change; layouts read `wishlist.guest`)
- [x] 7.2 hero-cinematic
- [x] 7.3 split-image-right
- [x] 7.4 arch-split
- [x] 7.5 collage-staggered
- [x] 7.6 magazine-editorial
- [x] 7.7 overlap-duo
- [x] 7.8 arch-hero-party
- [x] 7.9 arch-trio
- [x] 7.10 wedding-formal
- [x] 7.11 panoramic-band
- [x] 7.12 carousel-hero
- [x] 7.13 diagonal-duo
- [x] 7.14 scrapbook-polaroids
- [x] 7.15 portrait-frame-split
- [x] 7.16 editorial
- [x] 7.17 minimal
- [x] 7.18 grid
- [x] 7.19 Each layout: render `GuestWelcomeSection` when `wishlist.guest` present, omit when absent, styled native to the layout

## 8. Dashboard Invitados tab & manager

- [x] 8.1 Add `Invitados` (`guests` segment) to `NAV_ITEMS` in `wishlist-detail-nav.tsx`, positioned after `Regalos`; verify indicator + mobile `Select`
- [x] 8.2 Create `src/app/(protected)/dashboard/wishlists/[id]/guests/page.tsx` listing invites (party size, status, copy-URL)
- [x] 8.3 Add/edit form: primaryName (required), optional email/phone, up to 4 optional extra-guest name inputs, editable slug with uniqueness feedback
- [x] 8.4 Copy-personalized-URL control (`/w/<wishlist-slug>/<guest-slug>`)
- [x] 8.5 Delete invite with confirmation

## 9. Design pass

- [x] 9.1 Design the guest welcome section in the `A Wish For.dc.html` Claude Design project (per-layout variants, Spanish copy) using the `claude_design` MCP; reconcile implemented sections with the design output — **deferred, do manually; prompt below**

## 10. Validation

- [x] 10.1 `pnpm check`, `pnpm test`, `pnpm typecheck` pass
- [x] 10.2 Manual pass: personalized URL renders guest section in a sample layout, RSVP confirm/decline updates owner-visible status, `openedAt` set once, plain public page unchanged
