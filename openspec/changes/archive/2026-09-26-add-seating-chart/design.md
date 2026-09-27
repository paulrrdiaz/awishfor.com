## Context

The guest pool already exists: `Invite` (one row per invited party, `primaryName` + `RsvpStatus`) and `InviteExtraGuest` (`name String?`, `RsvpStatus`, `sortOrder`). Seating adds no guest concept — it adds tables, an assignment edge, and a projection of both onto a canvas.

Design source of truth: `Claude Design Output - Mesas.md` and the artboards in `Mesas.dc.html` (Claude Design project `10380ffb-0586-4cc7-aa3b-862f4fb0ab17`). Product brief: `docs/SEATING_CHART_PRD.md`. Scope deltas between the two are resolved in `proposal.md` → *Scope decisions*.

```
  Invite ──1:N──> InviteExtraGuest
     │                    │
     └────────┬───────────┘
              │  eligibility filter: status !== declined   (read-time, shared selector)
              ▼
          Person[]  { personId, displayName, partyLabel, status, isUnnamed, inviteId, extraGuestId }
              │
              │  SeatingAssignment  (0..1 per person)
              ▼
        SeatingTable  { shape, capacity, x, y }  ──> rendered on FloorCanvas
```

## Goals / Non-Goals

**Goals**

- One person is the unit of assignment; a party is context on the chip, never the drag unit.
- The one-person-one-table invariant survives a concurrent write, not just a correct UI.
- Capacity is enforced server-side; the UI block is the second line of defence, not the only one.
- No silent ejection: every destructive edit either refuses by name or confirms by name.
- An RSVP status change needs zero seating writes.

**Non-Goals**

- Per-seat (chair-level) assignment. The occupancy ring represents a count, not numbered chairs.
- Undo/redo, multi-room layouts, venue templates, automatic seating.
- Mobile canvas editing (deliberate exception to the product's mobile-first rule, granted by PRD §11).

## Decisions

### 1. Person identity: composite FK pair, not an opaque string

```prisma
model SeatingTable {
  id         String       @id @default(cuid())
  wishlistId String
  wishlist   Wishlist     @relation(fields: [wishlistId], references: [id], onDelete: Cascade)
  name       String?      // null → rendered as "Mesa {sortOrder + 1}"
  shape      SeatingTableShape
  capacity   Int
  x          Int
  y          Int
  sortOrder  Int          @default(0)
  assignments SeatingAssignment[]
  createdAt  DateTime     @default(now())
  updatedAt  DateTime     @updatedAt

  @@index([wishlistId])
}

model SeatingAssignment {
  id           String            @id @default(cuid())
  wishlistId   String
  tableId      String
  table        SeatingTable      @relation(fields: [tableId], references: [id], onDelete: Cascade)
  inviteId     String
  invite       Invite            @relation(fields: [inviteId], references: [id], onDelete: Cascade)
  extraGuestId String?
  extraGuest   InviteExtraGuest? @relation(fields: [extraGuestId], references: [id], onDelete: Cascade)
  createdAt    DateTime          @default(now())

  @@index([wishlistId])
  @@index([tableId])
}

enum SeatingTableShape { round rectangular }
```

A person is addressed by `(inviteId, extraGuestId)` where `extraGuestId IS NULL` means the primary guest. The alternative — a single opaque `personId` string — was rejected because it loses the FK cascade, and the design requires that deleting a guest in **Invitados** removes them from their table with no cleanup step.

`wishlistId` is denormalised onto both models (the PRD §8 sketch has it; the design output dropped it from the assignment). It lets `assertWishlistAccess` and every list query run without a join, and lets the service assert `table.wishlistId === invite.wishlistId` before writing.

### 2. The unique constraint must be two partial indexes

`@@unique([inviteId, extraGuestId])` **does not enforce the invariant on Postgres.** `NULL`s compare as distinct in a unique index, so two rows with the same `inviteId` and `extraGuestId = NULL` both insert — meaning the primary guest, the most common case, can be seated at two tables at once. The generated migration is therefore hand-extended:

```sql
CREATE UNIQUE INDEX "SeatingAssignment_primary_key"
  ON "SeatingAssignment" ("inviteId")
  WHERE "extraGuestId" IS NULL;

CREATE UNIQUE INDEX "SeatingAssignment_extra_key"
  ON "SeatingAssignment" ("inviteId", "extraGuestId")
  WHERE "extraGuestId" IS NOT NULL;
```

If the installed Prisma 7.8 supports `@@unique([inviteId, extraGuestId], nulls: "not distinct")`, prefer that and drop the raw SQL — verify at implementation time rather than assuming. Either way the index is declared in `schema.prisma` as a plain `@@index` so `prisma migrate diff` stays clean.

### 3. Assignment is an upsert inside one transaction

```
assign(personId, tableId)
  │
  ├─ assertWishlistAccess(wishlistId)                     ← outside the tx
  │
  └─ $transaction:
       ├─ SELECT id FROM "SeatingTable" WHERE id = $1 FOR UPDATE   ← serialises writers
       ├─ table = findUniqueOrThrow(tableId)              ← assert table.wishlistId matches
       ├─ seated = count(assignments where tableId, joined to eligible people)
       ├─ if seated >= table.capacity  → throw CONFLICT "table_full"
       └─ upsert assignment on the person key             ← moves between tables in one write
```

**The transaction alone is not enough.** Prisma's `$transaction` inherits the Postgres default isolation level, READ COMMITTED, and a `count()` over rows that do not exist yet takes no lock — so two concurrent drops can both read `seated = capacity - 1` and both insert, overfilling the table. The explicit `SELECT … FOR UPDATE` on the table row is what actually serialises the two writers.

`Serializable` plus serialization-failure retry would also work, but the row lock is the smaller change and matches the "last write wins beyond capacity" stance: there is no presence, no optimistic version, and no conflict toast — just a guarantee that occupancy never exceeds capacity.

`unassign` deletes on the person key. Dropping a chip on the canvas background or the panel header is an `unassign`, not a no-op.

### 4. Eligibility is one shared selector, applied at read time

```ts
// src/server/services/seating.service.ts
export function toEligiblePeople(invites: InviteWithExtras[]): SeatingPerson[]
```

Flattens each non-declined invite into its primary person plus its non-declined extra guests, producing a stable `personId` of `extraGuestId ?? \`invite:${inviteId}\`` for the DnD layer. Every seat count, the print sheet, the panel, and the `unseatedGuests` badge metric derive from this one list.

Consequence: when someone turns `declined` their assignment row is *ignored*, not deleted — the seat stops counting immediately, with no write-side cascade into `invite.service` / `public-invite.service`, and a reopened RSVP silently restores their seat. The design output's one-time "se liberó su lugar en Mesa 5" notice is deferred with the rest of the notification work.

### 5. One `DndContext` over panel + canvas

`SeatingBoard` owns the single context. Tables are simultaneously `useDraggable` (reposition) and `useDroppable` (receive a person).

| Concern | Choice | Why |
|---|---|---|
| Drag payload | `{type:'person', personId}` / `{type:'table', tableId}` | one `onDragEnd` switch |
| Collision | `pointerWithin` for people, `closestCenter` for tables | a chip must land *inside* a table, a table only needs a nearest slot |
| Activation | `{distance: 4}` pointer, `{delay: 160, tolerance: 8}` touch | matches `SortableGiftRow` behaviour; keeps click and scroll usable |
| Validation | in `onDragOver` | a full table paints red and `onDragEnd` ignores it — never accept a drop in order to undo it |
| Persistence | optimistic per move, invalidate on error | ~50 consecutive drags; a Save button would be the wrong shape |
| Position maths | `delta.x / zoom` before persisting; `createSnapModifier(26)` when snap is on | the canvas is `transform: scale(zoom)`, so raw delta is in screen px |

Zoom and snap are local UI state, not persisted per wishlist.

### 6. Table geometry is derived from capacity, not stored

Round: `diameter = 72 + capacity * 5.6`. Rectangular: `width = 96 + capacity * 11`, height fixed 100px. Occupancy is a `conic-gradient` ring on round tables and a 4px bar on rectangular ones — no SVG, no canvas element, so it animates with a plain `transition` and prints. Capacity is capped at 1–20.

State is also written in the subtitle (`redonda` / `completa` / `sin lugares`) and in `aria-label`, so nothing depends on colour alone.

### 7. Destructive-edit guards

```
capacity edit:  next < seated  →  REFUSE
                └─ name the (seated - next) most recently seated people,
                   offer "Quitar de la mesa" per person, Save stays disabled

table delete:   seated > 0     →  AlertDialog naming all seated people,
                                  explains they return to "Sin mesa asignada"
                seated === 0   →  delete with no dialog

                assignments are removed by FK cascade; no orphan rows, no undo in v1
```

Both rules are enforced in the service, not only the dialog.

### 8. Print is a sibling route, not a modal

`/dashboard/wishlists/[id]/seating/print` renders a Letter-sized (`@page { size: letter; margin: 14mm }`) alphabetical **flat** list — not grouped by table, because the reader is looking for their own name. Three columns, letter dividers with `break-inside: avoid`, table label right-aligned in mono.

Unnamed extras are **sorted with their party's primary guest and indented beneath them**, not filed under A. The design output explicitly leaves this open ("*Pendiente de producto: ¿se imprime un acompañante sin nombre?*"), so PRD §10 decides it: a placeholder alphabetised on its own text fails the one job the sheet has, because someone scanning for their own name will never look under "Acompañante". Indenting under "María Torres" at least puts the row where the party would think to look.

The unassigned warning and the column/paper controls are `print:hidden`. No PDF service, no cutting guides.

## Risks / Trade-offs

- **Hand-written SQL in a generated migration** — a later `prisma migrate dev` will not regenerate the partial indexes. Mitigation: a service-level guard is not enough here, so the migration carries a comment, and `SeatingAssignment` gets a test asserting a double-seat attempt fails.
- **Optimistic assignment with no Save** — a failed mutation must visibly return the chip. Mitigation: invalidate the board query and toast on error; the test covers the rollback path.
- **Mobile is read-only for the canvas** — a deliberate exception. Mitigation: the amber notice states *why* and names the fix ("abre Mesas en una tablet o computadora") rather than silently degrading; the tab is never hidden or disabled.
- **`unseatedGuests` in `wishlist.overview`** — the layout badge needs the metric on every wishlist detail page load, including pages that never show seating. It is one `groupBy`; if it shows up in query timings, move the badge to a dedicated lightweight query.

## Migration Plan

Additive only. Two new tables, one new enum, one new nav segment, one new overview metric. No backfill: a wishlist with no `SeatingTable` rows renders the "Tu salón está vacío" first-run state. Rolling back means dropping the two tables — no other model changes shape.

## Open Questions

- Does the installed Prisma 7.8 support `nulls: "not distinct"` on `@@unique`? Resolve before hand-writing the migration SQL (decision 2).
- Should a table's `name` be free text from the start, or auto-`Mesa N` only until someone renames it? Current plan: nullable, auto-labelled from `sortOrder`, renameable in the detail popover.
