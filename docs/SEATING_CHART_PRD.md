# Seating Chart PRD — "Mesas" (A Wish For)

## Status

**Implemented (v1).** The design pass is done (`Mesas.dc.html` / `Claude Design Output —
Mesas.md` in the Claude Design project) and v1 shipped through the OpenSpec change
`add-seating-chart`. The `SeatingTable` / `SeatingAssignment` models, the `seating` tRPC
router, the Mesas tab, the floor-plan editor, and the print sheet are all in the codebase;
§8's data-model sketch is superseded by `prisma/schema.prisma` and the change's `design.md`.

Several items this document left open were decided during that change — see §12, and
"Deferred from v1" below for what was consciously left out.

## 1. Feature summary

Venues quote the host a fixed set of tables and a capacity per table (e.g. 2 tables of 10,
1 of 8, 1 of 7, 3 tables of 5 — 50 seats for 50 guests). The host needs to:

1. Recreate that table layout spatially, as it will sit in the actual room.
2. Assign invited guests to tables via drag-and-drop.
3. Print a simple sheet so guests can find their table at check-in.

## 2. Relationship to the existing RSVP system

`prisma/schema.prisma` already implements RSVP: `Invite` (`primaryName`, `primaryEmail`,
`primaryPhone`, `slug`, `status: RsvpStatus`) plus `InviteExtraGuest` (`name?`, `status`,
`sortOrder`) for named plus-ones, each with independent `pending | confirmed | declined`
status. The dashboard already has an **Invitados** tab (`guests` segment).

**Note:** `docs/PRD.md` §2 still lists "No RSVP" as an MVP non-goal. That line is stale —
the schema and dashboard already implement RSVP. Not corrected in this document; flag for a
future PRD cleanup pass (a pointer to this doc has been added near that non-goal).

Seating draws its entire guest pool from `Invite` + `InviteExtraGuest`, scoped to one
wishlist, **excluding `declined`** ("No asistirá") at both levels. No new guest-list concept
is introduced.

## 3. Goals (v1)

- Owner configures venue tables: shape (round or rectangular), capacity, freely arranged on
  a spatial canvas representing the room.
- Owner assigns individual invited guests — not whole parties — to tables via
  drag-and-drop; a guest can be moved between tables or back to "unassigned" at any time.
- Guest pool = every `Invite.primaryName` + every `InviteExtraGuest` with
  `status != declined`, rendered as one chip per person, labeled with its party for context.
- Live per-table seat count (e.g. `7/10`) as guests are assigned.
- Printable alphabetical guest → table lookup sheet.
- Layout is saved per wishlist and remains editable indefinitely (not a one-time wizard step).

## 4. Non-goals / explicitly deferred (v2+)

- Reusable venue templates shared across wishlists/events.
- Per-seat (as opposed to per-table) assignment.
- Individual printable place cards.
- Per-table roster sheet (staff-facing).
- Large-format floor-plan poster export.
- Automatic/optimized seating suggestions.
- Multi-room layouts.
- Bespoke permission rules for seating beyond existing `WishlistMember` owner/collaborator
  access.
- A guest-facing "your table" surface (e.g. showing the assigned table on the guest's own
  `Invite.slug` RSVP page) — plausible zero-new-infrastructure addition later since every
  invite already has a personal URL, but the print sheet is the only required guest-facing
  channel for v1. See open question in §12.

## 5. Primary user

Same as the main PRD — the wishlist owner, or a collaborator (`WishlistMember`). Guests never
interact with the seating tool; they only benefit from the printed lookup sheet at the venue.

## 6. Core user journey

1. Owner opens the wishlist dashboard → **Mesas** tab.
2. If the wishlist has zero non-declined invites, show an empty state pointing to the
   **Invitados** tab ("Agrega invitados antes de armar las mesas").
3. Owner adds a table: pick shape (round/rectangular) + capacity, it appears on the canvas;
   owner drags it to position/arranges the room freely.
4. An unassigned-guest panel lists every eligible guest chip, grouped/labeled by party
   (e.g. "María Torres — con Familia Torres").
5. Owner drags a guest chip onto a table. The table's seat counter updates
   (`7/10`); the chip renders inside/attached to the table shape.
6. Owner can drag a guest between tables, or back to "Sin mesa asignada".
7. Owner can edit an existing table's shape/capacity, or delete it, at any time — including
   after guests are already seated there (see §7).
8. At any point, owner can open the print view: an alphabetical name → table sheet, print via
   the browser.

## 7. Editing/deleting a table with guests already seated

Because tables get edited after the fact, not just created once, two conflict cases need an
explicit answer from the design pass — not just table creation/positioning:

- **Reducing a table's capacity below its current seated count** — block the change with an
  inline message naming the guests who'd need to move first, rather than silently ejecting
  someone.
- **Deleting a table that has guests seated** — its guests return to "Sin mesa asignada"
  (never silently dropped from the guest pool), with a confirmation step before delete.

## 8. Data model sketch (non-binding)

```ts
type SeatingTable = {
  id: string;
  wishlistId: string;
  label: string; // "Mesa 1"
  shape: "round" | "rectangular";
  capacity: number;
  positionX: number;
  positionY: number;
  rotation?: number;
  sortOrder: number;
};

type TableGuestAssignment = {
  id: string;
  tableId: string;
  wishlistId: string;
  inviteId: string; // Invite.id — always set, identifies the party
  extraGuestId: string | null; // InviteExtraGuest.id, or null when assigning the primary guest
};
```

Guest chip label source:

- Primary guest → `Invite.primaryName`.
- Extra guest → `InviteExtraGuest.name`, falling back to a placeholder when `name` is null
  (schema allows `name: String?`) — e.g. `"Acompañante de {primaryName}"`.

Eligible pool query shape: `Invite.status != "declined"` (primary) and, per invite,
`InviteExtraGuest.status != "declined"` (extras) — each surfaced as one row/chip.

## 9. Table shapes

- **Round** — typical capacity 5–10 seats, the common case in your own example (5s, 7s, 8s,
  10s).
- **Rectangular** — typical capacity 8–20 seats (long tables).

Shape is an explicit choice per table at creation time; it is not derived from capacity.

## 10. Printable output (v1 — single deliverable)

- **Alphabetical guest → table lookup sheet**, sorted by full name.
- Columns: guest name, table label.
- Only guests actually assigned to a table appear on the printed sheet.
- Before printing, the owner sees an inline warning listing any eligible (non-declined) guest
  who is **not yet assigned** to a table — printing is still allowed, but the gap is visible
  so it's not accidentally missed.
- **Unnamed extra guests on an alphabetical sheet:** a placeholder like "Acompañante de
  María" doesn't alphabetize the way a self-lookup sheet needs — a guest scanning for their
  own name won't find "Acompañante de...". Sort/group these under their party's primary
  guest (e.g. indented beneath "María Torres") rather than alphabetizing the placeholder text
  on its own.
- Implementation shape: a print-friendly HTML/CSS view using the browser's native print (no
  PDF generation service, no cutting guides, no per-card layout in v1).

## 11. Placement in the app

- New tab in the existing wishlist detail nav (`src/components/layouts/dashboard/wishlist-sections.ts`
  `NAV_ITEMS`), alongside Resumen / Regalos / **Invitados** / Tema / Colaboradores / Ajustes.
  Suggested label **"Mesas"**, segment `seating`, `ownerOnly: false` (consistent with
  Regalos/Invitados — collaborators can help plan seating too).
- Tab shows an empty state (not a 404/hidden tab) when the wishlist has zero non-declined
  invites, linking to the Invitados tab (`hrefFor(wishlistId, "guests")`).
- **Desktop/tablet-first editor.** Spatial drag-and-drop of tables on a canvas is unwieldy on
  small phone screens; expect the floor-plan canvas to target desktop/tablet. The unassigned-
  guest list and the print view should still work reasonably on larger phones, but precision
  canvas editing is not a mobile-first requirement here (a deliberate exception to the rest of
  the product's mobile-first convention).

## 12. Open questions — resolved

Settled while implementing the `add-seating-chart` change:

- **Table shape/capacity input UI** — both. `AddTablePopover` offers preset capacity chips
  (5/6/7/8/10/12) *and* a 1–20 numeric input; shape is an explicit radio pair, never inferred
  from capacity.
- **Who can edit seating** — all `WishlistMember` collaborators, reads and writes alike
  (`ownerOnly: false`, `assertWishlistAccess` without `requireOwner`). A deliberate departure
  from `invite.ts`, where mutations are owner-only: collaborators are expected to help plan
  seating.
- **Undo/redo for canvas edits** — none in v1. Instead of undoing damage, destructive edits
  are blocked or confirmed *by name*: a capacity below the seated count is refused and names
  who must move; deleting a seated table confirms and names everyone who returns to "Sin mesa
  asignada". The design output's 10-second undo toast is deferred.
- **Autosave vs. explicit save** — autosave, per movement. There is no Save button; each drag
  writes immediately and a failed write invalidates the board and toasts "No se pudo guardar.
  Intenta de nuevo".
- **Venue templates** — still deferred (§4); nothing in the v1 schema forecloses them.
- **"Tu mesa" on the guest's `Invite.slug` page** — still deferred (§4). The print sheet is
  the only v1 delivery channel.

### Deferred from v1

Recorded in the change's `proposal.md` → *Scope decisions*; each is a one-line rescope:

- Undo of a table delete (no snapshot/restore).
- The `<768px` per-person "Sentar ▾" assignment sheet. Mobile gets the amber notice, the
  unassigned list, the table list with occupancy, and the print sheet — the canvas is not
  offered for editing, the exception §11 grants.
- The one-time "se liberó su lugar en Mesa 5" notice when a seated guest declines. Eligibility
  is filtered at read time instead, so the seat stops counting with no write and no
  notification state — and a reopened RSVP silently restores it.
- Presence / conflict UI for simultaneous collaborators. Last write wins, with a row lock so
  occupancy can never exceed capacity.

### Decided beyond both source documents

- The Mesas tab's unseated-guest badge is **suppressed until the wishlist has at least one
  table**. Before a floor plan exists everyone is unseated, so the badge would read as an
  error on a wishlist the host has not started.

## 13. Next step

v1 is implemented. The remaining work is the deferred list in §12 — most usefully the mobile
assignment flow, since the print sheet is already mobile-first but the editor is not.

`docs/CLAUDE_DESIGN_SEATING_PROMPT.md` is kept for reference: it is the brief that produced
`Mesas.dc.html`, which remains the visual source of truth for this surface.
