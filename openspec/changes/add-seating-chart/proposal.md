## Why

Venues quote a host a fixed table configuration (e.g. 2×10, 1×8, 1×7, 3×5 = 50 seats for 50 guests) and the host then has to decide, person by person, who sits where — and hand the venue a sheet guests can read at the door. Today that happens in a spreadsheet or on paper, disconnected from the RSVP data the product already owns.

`Invite` + `InviteExtraGuest` already carry every eligible person and their RSVP status, so the guest pool needs no new concept. What is missing is a spatial floor plan, a per-person assignment, and a printable alphabetical lookup sheet. `docs/SEATING_CHART_PRD.md` briefs the feature and `Claude Design Output - Mesas.md` (Claude Design project `Mesas.dc.html`) supplies the visual and interaction direction, so the design gate the PRD set in §13 is cleared.

## What Changes

- Add a `SeatingTable` model (shape, capacity, canvas position) and a `SeatingAssignment` model (one eligible person → at most one table) scoped per wishlist, with the one-person-one-table invariant enforced in the database, not only in the UI.
- Add a `seating` tRPC router: list the board, create/update/move/delete tables, and assign/unassign/assign-party people, with capacity and wishlist scoping validated server-side inside a transaction.
- Add a **Mesas** tab (`seating` segment) to the wishlist detail navigation with a "sin mesa" warning badge, gated behind an empty state when the wishlist has no eligible invited guests.
- Build the floor-plan editor: a zoomable grid canvas with draggable round/rectangular tables sized by capacity, a 316px guest panel with search/filters and party grouping, and a single `@dnd-kit` `DndContext` spanning both so a person chip drags from the list onto a table.
- Block destructive edits instead of silently ejecting people: shrinking a capacity below its seated count is refused by name, and deleting a seated table confirms first and returns its people to "Sin mesa asignada".
- Add a print route rendering the alphabetical guest → table lookup sheet, with an on-screen-only warning naming every eligible guest who still has no table.
- Derive eligibility (`status !== declined`, at both invite and extra-guest level) at read time through one shared selector, so an RSVP change needs no write-side cascade into seating.

## Scope decisions

The PRD and the design output disagree in places, and the design output specifies work the PRD's v1 goals do not. Each is pinned here rather than silently adopted; every one of these is a one-line rescope.

| Item | PRD | Design output | Decision for this change |
|---|---|---|---|
| Route segment | `seating` | `/mesas` | **`seating`** — every existing segment is English (`gifts`, `guests`, `design`) with a Spanish label; label stays "Mesas". Print route is `seating/print`. |
| Undo of a table delete | open question (§12) | 10s toast restoring table + position + assignments | **Deferred.** v1 confirms by naming the seated people; no snapshot/restore. |
| Search + status filters in the guest panel | not listed | specified | **Included** — 50+ chips are unscannable without it, and it is local state over already-loaded data. |
| Batch table creation (`¿Cuántas iguales?`) | not listed | specified | **Included** — one count field; it is the literal shape of the PRD's motivating scenario (2×10, 1×8, 1×7, 3×5). |
| "Sentar juntos" per party | not listed | marked optional by the design itself | **Included, last task, explicitly droppable.** A server-side loop over the party's unseated members; the drag unit stays the person. |
| `<768px` assignment UI ("Sentar ▾" sheet per person) | only asks that the guest list and print view "work reasonably" (§11) | full alternate mobile assignment flow | **Deferred.** Mobile gets the amber "use a tablet" notice, the unassigned list, the table list with counters, and the print sheet — read-only for the canvas, which is what the PRD grants. |
| Freeing a seat when someone turns `declined` | not mentioned | write-time release + one-time notice | **Derive at read time.** The eligibility filter already drops declined people, so their seat stops counting with no cascade into `invite.service` / `public-invite.service` and no notification state. The row is left in place, so a reopened RSVP restores the seat. |
| Unnamed plus-one on the print sheet | indent under the party's primary guest (§10) | file under A as "Acompañante de…", but marked *pendiente de producto* | **Indent under the primary guest.** The design output does not claim to have settled this, and the PRD's reasoning holds: nobody scanning for their own name looks under "Acompañante". |
| Concurrent collaborator edits | not mentioned | "last movement wins" | **Last write wins, with a row lock.** The capacity check and the insert run in one transaction that first locks the table row `FOR UPDATE`, so two simultaneous drops cannot overfill a table. No presence, optimistic version, or conflict toast. |
| Mesas tab badge before any table exists | not specified | badge shown whenever people are unseated | **Suppressed until the wishlist has at least one table** — our own addition, in neither source doc. Before a floor plan exists *everyone* is unseated, so the badge would read as an error on a wishlist the host has not started. Drop this row to show it unconditionally. |

Access control: the tab is `ownerOnly: false` per PRD §11, so seating reads **and** mutations use `assertWishlistAccess` without `requireOwner`. This is a deliberate departure from `invite.ts`, where mutations go through the owner-only `getOwnedInvite` — collaborators are expected to help plan seating.

## Capabilities

### New Capabilities

- `event-seating-chart`: Owner/collaborator-facing floor plan for a wishlist — table configuration, per-person seat assignment derived from the existing RSVP pool, destructive-edit guards, and a printable guest → table lookup sheet.

### Modified Capabilities

- `dashboard-detail-chrome`: adds the `seating` section to the tab row between Invitados and Tema, labelled **Mesas**, with an unseated-guest warning badge that only appears once the wishlist has at least one table.

The `unseatedGuests` count that feeds that badge is added to the existing `wishlist.overview` payload. It adds no metric card to Resumen, so `dashboard-wishlist-overview` needs no spec delta.

## Impact

- **Database migration:** new `SeatingTable` and `SeatingAssignment` tables. The generated migration is hand-extended with two partial unique indexes so a primary guest cannot be seated twice — a plain `@@unique([inviteId, extraGuestId])` does not hold on Postgres, where `NULL`s compare as distinct.
- **Affected code:** `prisma/schema.prisma`; new `src/server/api/routers/seating.ts` registered in `root.ts`; new `src/server/services/seating.service.ts`, `src/server/validators/seating.schema.ts`, `src/server/mappers/seating.mapper.ts`; `src/components/layouts/dashboard/wishlist-sections.ts`; `src/app/(protected)/dashboard/wishlists/[id]/layout.tsx`; the wishlist overview metrics; new `src/app/(protected)/dashboard/wishlists/[id]/seating/` route plus `seating/print/`; new `src/components/features/dashboard/seating/`.
- **New dependencies:** none. `@dnd-kit/core` and `@dnd-kit/utilities` are already used for gift reordering; the canvas uses CSS transforms, no charting or PDF library.
- **Out of scope (deferred):** reusable venue templates, per-seat assignment, place cards, staff per-table rosters, large-format floor-plan export, automatic seating suggestions, multi-room layouts, and a guest-facing "tu mesa" surface on `Invite.slug`.
