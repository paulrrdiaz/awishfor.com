## Context

Wishlists are published at `/w/<slug>` and rendered by `PublicWishlistPage`, which dispatches to one of 17 layout components (`src/components/layouts/public-wishlist/`) by `layoutId`. Owner-facing management lives under `/dashboard/wishlists/[id]/*` with a tab nav (`wishlist-detail-nav.tsx`, `NAV_ITEMS`). The only guest data today is `Purchase` rows captured at buy time. There is no invite list and no personalized landing.

This change adds an owner-built invite list, personalized guest URLs (`/w/<slug>/<guestSlug>`), and RSVP. It touches the schema, a new tRPC router, one new dashboard route + tab, one new public route, the view-model mapper, and all 17 layouts.

## Goals / Non-Goals

**Goals:**
- One invite per guest per wishlist: primary name required, optional email/phone, 0–4 optional-name extra guests, editable unique slug, RSVP status.
- Personalized route reusing the existing designed layout, with a guest section native to each layout.
- Public RSVP confirm/decline; owner sees status.
- Plain `/w/<slug>` behavior unchanged.

**Non-Goals:**
- Invite delivery (email/WhatsApp) — owner copies links manually.
- Guest authentication/accounts.
- Per-extra-guest RSVP (RSVP is invite-level).
- Analytics beyond stored `openedAt`/`respondedAt`.

## Decisions

### Data model: `Invite` + `InviteExtraGuest`
Two tables. `Invite` holds primary fields, `slug`, `status` (`RsvpStatus` enum), `openedAt`, `respondedAt`, `wishlistId`. `InviteExtraGuest` holds `inviteId` + optional `name` + `sortOrder`. Both cascade-delete with the wishlist/invite.

- **Why relational extra guests over an `extraGuests Int` count or a JSON column:** the owner may name them ("if the owner set it up") *or* leave them blank, and the guest section renders names when present. A relational child models "0–4 slots, name optional each" directly and stays queryable/orderable. A bare Int can't hold names; JSON loses type safety and Prisma ergonomics. The 0–4 cap is enforced in the router (Zod), not the DB.
- Uniqueness: `@@unique([wishlistId, slug])`.

### Slug: editable, derived-by-default, reserved-word guarded
On create, if no slug given, derive from `primaryName` via the existing slug helper (lowercase/hyphenate). Owner can override. Validate against `@@unique([wishlistId, slug])` and a small **reserved-segment denylist** so a `guestSlug` can never shadow a future static child of `/w/[slug]/` (e.g. `rsvp`, `edit`). Alternatives: auto-suffix on collision (rejected — user chose explicit editable slug for control); block duplicate names (rejected — too rigid).

### Routing: nested dynamic segment `/w/[slug]/[guestSlug]`
New `src/app/w/[slug]/[guestSlug]/page.tsx`. It fetches the wishlist view model plus the invite, builds the `guest` field, records `openedAt`, and renders `PublicWishlistPage`. The existing `/w/[slug]/page.tsx` is untouched. Next.js resolves `[guestSlug]` only when the path has a second segment, so no conflict.

### View model: optional `guest` field threaded through
`PublicWishlistViewModel` gains `guest?: { primaryName; extraGuests: { name: string | null }[]; status }`. `PublicWishlistPage` passes `wishlist` (which carries `guest`) to the layout as today — layouts read `wishlist.guest`. This keeps the dispatch signature stable; only the type widens.

- **Why on the existing view model rather than a new prop:** every layout already receives `wishlist`; branching on `wishlist.guest` avoids changing 17 component signatures and the dispatcher.

### Guest section: shared component + per-layout placement
Build one presentational `GuestWelcomeSection` (greeting, extra-guest list/"+N", RSVP control) and place it inside each of the 17 layouts where it fits that composition (hero, band, etc.), styled to the layout. This satisfies "full per-layout custom section" while keeping the RSVP logic/markup in one component. The RSVP control is a client component posting to the public `invite.respond` procedure.

### tRPC `invite` router
`protectedProcedure`s: `list`, `create`, `update`, `delete` — all assert wishlist ownership via `ctx.userId`. One `publicProcedure` `respond({ wishlistSlug, guestSlug, status })` restricted to `confirmed|declined`, sets `respondedAt`. Registered in `root.ts`. `openedAt` is written from the RSC page load (server mapper), not a client call.

## Risks / Trade-offs

- **17 layouts × bespoke section = broad surface, easy to miss one** → shared `GuestWelcomeSection` centralizes logic; a Storybook story / checklist per layout; tasks list each layout explicitly.
- **`openedAt` write on RSC render adds a mutation to a read path** → guard with "only when null" so it's a single write per invite; tolerate best-effort (don't block render on failure).
- **Public `respond` procedure is unauthenticated** → knowledge of the guest slug is the capability (same trust model as the public wishlist link); only allows toggling that invite's status, no data disclosure. Rate-limiting is out of scope but noted.
- **Slug collisions with future static segments** → reserved-word denylist added now; cheap insurance.
- **Extra-guest cap enforced only in app layer** → acceptable; DB stays simple. Router Zod caps at 4.

## Migration Plan

1. Add `RsvpStatus` enum + `Invite`/`InviteExtraGuest` models to `prisma/schema.prisma`; `pnpm prisma migrate dev` (additive, no backfill — existing wishlists simply have zero invites).
2. Ship router + dashboard tab/route (owner can manage invites) before the public page is linked anywhere, so it's safe to deploy incrementally.
3. Ship public route + per-layout sections.
- **Rollback:** feature is additive; revert code and the migration (tables are empty of production data until owners use it).

## Open Questions

- Should the guest section also surface on the owner's *preview* (`mode: "preview"`) with a sample guest, or only on live personalized URLs? (Leaning: live only; preview stays generic.)
- Copy tone/wording per layout comes from the `A Wish For.dc.html` design pass — final Spanish strings TBD there.
