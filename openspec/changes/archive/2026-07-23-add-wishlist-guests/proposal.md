## Why

Owners can publish a wishlist but have no way to build an invite list or give each guest a personal way in. They want to create a named invite per person (e.g. Pedro Castillo), optionally note who comes with them, share a personalized URL (`/w/<slug>/pedro-castillo`), and track who has confirmed. Today the only guest data captured is opportunistic (a `Purchase` at buy time) — there is no pre-event guest list and no personalized landing.

## What Changes

- Add an **Invitados** tab to the wishlist detail nav with a full guest/invite manager (list + add/edit/delete).
- Introduce an **Invite** per wishlist: one primary guest (name required, optional email/phone), **0–4 extra guests** each with an *optional* name, an **editable URL slug** (unique per wishlist), and an **RSVP status** (`pending | confirmed | declined`) with `openedAt` / `respondedAt` timestamps.
- Add a new tRPC `invite` router: owner-scoped CRUD (list, create, update, delete) plus a **public** procedure for a guest to confirm/decline from their landing.
- Add a personalized public route `/w/<slug>/<guestSlug>` that resolves the invite, renders the same designed wishlist, records `openedAt` on first open, and injects a **bespoke guest welcome section into each of the 17 public layouts** greeting the named guest, listing extra guests (names or a "+N" count), and exposing an RSVP control.
- Extend `PublicWishlistViewModel` with an optional `guest` field so layouts can branch on personalized vs. plain renders. Plain `/w/<slug>` continues to work with no guest section.

Non-goals: email/WhatsApp invite delivery (owner shares links manually for now); guest accounts/auth; per-extra-guest RSVP (RSVP is at the invite level); analytics dashboards beyond the stored `openedAt`/`respondedAt`.

## Capabilities

### New Capabilities
- `guest-invite-management`: Owner-facing invite list under the wishlist detail — data model, `invite` tRPC router (owner CRUD), the Invitados dashboard tab, add/edit form (primary guest, 0–4 optional extra guests, editable unique slug), status display, and copy-personalized-URL.
- `personalized-invite-page`: Public `/w/<slug>/<guestSlug>` route — invite resolution, `openedAt` tracking, the per-layout guest welcome section rendered across all public layouts, the optional `guest` view-model field, and the public RSVP confirm/decline procedure.

### Modified Capabilities
- `dashboard-detail-tabs`: The enumerated tab set (`Resumen · Regalos · Diseño · Configuración`) gains an `Invitados` segment, so the nav's `NAV_ITEMS` contract and mobile `Select` fallback change.

## Impact

- **Schema**: new `Invite` and `InviteExtraGuest` models (or `extraGuests` as embedded rows) + `RsvpStatus` enum in `prisma/schema.prisma`; new migration.
- **API**: `src/server/api/routers/invite.ts` (new), registered in `src/server/api/root.ts`; view-model mapper in `src/server/mappers/view-models` gains optional `guest`.
- **Routes**: `src/app/w/[slug]/[guestSlug]/page.tsx` (new, public); `src/app/(protected)/dashboard/wishlists/[id]/guests/` (new). `guestSlug` denylist to avoid future static-segment collisions.
- **UI**: `src/components/layouts/dashboard/wishlist-detail-nav.tsx` (`NAV_ITEMS`); new guest-manager components; all 17 layout components under `src/components/layouts/public-wishlist/` each gain a guest section; `PublicWishlistPage` passes `guest` through.
- **Design**: guest welcome section to be designed in the `A Wish For.dc.html` Claude Design project and adapted per layout.
