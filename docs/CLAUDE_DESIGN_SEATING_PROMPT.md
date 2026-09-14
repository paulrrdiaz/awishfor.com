# CLAUDE_DESIGN_SEATING_PROMPT.md — "Mesas" seating chart

Copy-paste prompts for Claude Design to explore the seating-chart feature described in
`docs/SEATING_CHART_PRD.md`. This is a **design exploration**, not a build — nothing here is
a locked data model or implementation commitment yet.

## How to use this

1. Paste **Prompt 1** first — it's the full feature brief, mirrors the structure of
   `docs/CLAUDE_DESIGN_PROMPT.md`, and asks for a complete implementation-ready brief.
2. If you want to go deeper on one part after seeing the first pass, paste any of
   **Prompts 2–4** in the same conversation — they ask Claude Design to iterate specifically
   on the canvas, the guest-assignment panel, or the print sheet.
3. Bring back whatever Claude Design produces and we'll fold the finalized direction into
   `docs/SEATING_CHART_PRD.md` and a proper OpenSpec change before writing any code.

---

## Prompt 1 — Full feature brief

You are a senior product designer and design engineer.

Design a **seating chart tool** ("Mesas") for **A Wish For**, a Spanish-first event
wishlist/RSVP product. This is a new **owner-facing dashboard tool**, not a guest-facing
page — guests never open this UI; they only benefit later from a printed lookup sheet.

### What the feature does

An event host has a fixed venue table configuration (the venue tells them, e.g.: 2 tables of
10, 1 of 8, 1 of 7, 3 tables of 5 — 50 seats for 50 guests). The host needs to:

1. Recreate that table layout **spatially** — add tables (round or rectangular, each with a
   capacity), and freely drag/arrange them on a canvas representing the actual room.
2. Assign **individual invited guests** (not whole parties) to tables via drag-and-drop, with
   a live seat counter per table (e.g. `7/10`).
3. Print a simple **alphabetical guest → table lookup sheet** so guests can find their table
   at check-in.

### Guest data source

Guests come from the product's existing RSVP system, not a new guest list:

- `Invite` — one row per invited party: `primaryName`, RSVP `status`
  (`pending | confirmed | declined`).
- `InviteExtraGuest` — named plus-ones within an invite, each with their own `name` (optional
  — may be null) and `status`.

**Only `pending` and `confirmed` guests are eligible for seating — exclude every `declined`
("No asistirá") guest, at both the invite level and the extra-guest level.** Each eligible
person (primary or extra guest) is one draggable chip. Show party context on the chip (e.g.
"María Torres — con Familia Torres") so the host can see who's grouped together, but the
drag/drop unit is always one person — parties are frequently split across tables because
capacities (5, 7, 8, 10) rarely divide evenly, and the tool must make that easy, not fight it.

### Stack constraints

Use the existing stack — do not propose a different frontend framework, UI library, or
component system:

- Next.js 16, React 19, Tailwind CSS v4, Shadcn/Radix UI primitives, tRPC, Prisma.
- Drag-and-drop should be implementable with `@dnd-kit` (already a project dependency, used
  elsewhere for gift reordering).
- The dashboard uses the app's default (non-public-themed) design tokens — this tool should
  look like the rest of the dashboard (clean, functional, less decorative than the public
  guest-facing pages), not like a public wishlist page.

### Product style

- Practical and information-dense first — this is a working tool for a stressful planning
  task, not a moodboard moment.
- Spanish-first UI copy.
- Should still feel like the same product family as the dashboard (warm but restrained,
  trustworthy), not a generic enterprise floor-planning SaaS.
- Desktop/tablet-first: precise canvas drag-and-drop is not expected to work well on small
  phones, and that's an accepted, deliberate exception to this product's usual mobile-first
  rule. The unassigned-guest list and the print view should still be reasonably usable on
  larger phones/tablets.

### Required output format

```md
# Claude Design Output — Mesas

## 1. Visual design direction
## 2. Design principles
## 3. Floor-plan canvas design (empty state, populated state, table shapes, positioning)
## 4. Table component design (round + rectangular, capacity, seat counter, states)
## 5. Guest-assignment panel design (unassigned list, party grouping, drag interaction)
## 6. Drag-and-drop interaction notes (chip → table, table repositioning, invalid drop states)
## 7. Printable lookup sheet design
## 8. Empty and edge states
## 9. Component inventory
## 10. Tablet/desktop layout notes
## 11. Spanish UI copy suggestions
## 12. Tailwind/Shadcn implementation notes
```

Be specific enough for an engineer to translate directly into components. Avoid vague
moodboard-only advice.

### Required states to design

**Floor-plan canvas:**
- Empty canvas (no tables yet) — first-run state with a clear "add table" call to action.
- Populated canvas with a mix of round and rectangular tables at different capacities.
- Table being dragged/repositioned (in-motion state).
- A table at full capacity vs. a table with open seats — should be visually distinguishable
  at a glance.
- **Editing an existing table's capacity down below its current seated count** — this must
  be blocked with an inline message naming the guests who'd need to move first, not a
  silent ejection. Design that blocked/warning state.
- **Deleting a table that already has guests seated** — design the confirmation step, and
  where those guests land afterward (back into "Sin mesa asignada," not dropped).

**Guest-assignment panel:**
- Unassigned-guest list, grouped by party, before any assignment.
- A guest chip mid-drag.
- A table receiving a drop (valid target highlight).
- Attempting to drop a guest onto a table that's already full (invalid-drop feedback).
- All guests assigned (empty unassigned list — a small "all done" acknowledgment, not a
  generic empty state).

**Gating / entry state:**
- Wishlist with zero eligible (non-declined) invited guests — empty state directing the host
  to the existing **Invitados** tab before they can use Mesas.

**Print view:**
- Alphabetical guest → table lookup sheet, print-ready layout.
- A visible (non-printed, on-screen only) warning listing any eligible guest who is not yet
  assigned to a table, shown above the print view before printing.

### Navigation context

This tool is a new tab in the existing wishlist detail navigation, alongside Resumen /
Regalos / **Invitados** / Tema / Colaboradores / Ajustes. Propose an icon and short Spanish
label (current working suggestion: **"Mesas"**). Design it to sit naturally in that same tab
row/mobile-select pattern already used by the other tabs.

### Explicitly out of scope for this design pass

Do not design any of the following — they're deferred to a later version:

- Reusable venue templates across multiple wishlists/events.
- Per-seat (as opposed to per-table) assignment.
- Individual printable place cards.
- A staff-facing per-table roster sheet.
- Large-format floor-plan poster printing/export.
- Automatic or AI-assisted seating suggestions.
- Multi-room layouts.

---

## Prompt 2 — Follow-up: floor-plan canvas deep dive

Focus only on the **floor-plan canvas** from the Mesas brief above. Go deeper on:

- How a host adds a new table (modal? inline toolbar? drag-from-palette?) and picks shape
  (round/rectangular) and capacity.
- Visual differentiation between round and rectangular tables at a glance, including at
  different capacities (a 5-seat round table vs. a 20-seat rectangular table should read
  clearly differently in size/shape).
- How free positioning works: grid-snap vs. freeform, canvas panning/zooming if the room has
  many tables, and how a table reads when selected vs. idle.
- How the live seat counter (`7/10`) is shown on the table itself without cluttering it.
- Editing an already-placed table (change shape/capacity) and deleting one, including the
  two conflict states: shrinking capacity below the current seated count (block + name the
  guests who'd need to move), and deleting a table with guests seated (confirm, then return
  those guests to "Sin mesa asignada").

Keep the same stack constraints, dashboard-style visual language, and desktop/tablet-first
framing as Prompt 1.

---

## Prompt 3 — Follow-up: guest-assignment interaction deep dive

Focus only on the **guest-assignment panel and drag interaction** from the Mesas brief above.
Go deeper on:

- Layout of the unassigned-guest list: how party grouping reads (visually grouped chips vs.
  a label per chip), and how a long guest list (50+ people) stays scannable — search/filter?
  collapse by party?
- The exact drag affordance from list → canvas table, including what happens mid-drag (does
  the target table preview the new seat count before drop?) and on an invalid drop (table
  already full).
- How a seated guest is shown once assigned — chip attached to/inside the table shape, with an
  easy way to drag them back out or to another table.
- Any lightweight bulk action worth considering (e.g., "seat whole party together where
  possible") as an optional affordance — note it as optional, not required.

Keep the same stack constraints and dashboard-style visual language as Prompt 1.

---

## Prompt 4 — Follow-up: printable lookup sheet deep dive

Focus only on the **printable output** from the Mesas brief above. Go deeper on:

- Page layout for the alphabetical guest → table lookup sheet: single column vs. multi-column
  for a long guest list, header/footer content (event title, date), and how it should look
  when printed on standard paper (A4/Letter).
- The on-screen (non-printed) pre-print state: how the "guests not yet assigned" warning is
  shown above the print view, and what the print trigger looks like.
- Confirm this is a plain browser-print HTML/CSS view — no PDF generation service, no cutting
  guides, no per-guest cards. Keep it deliberately simple.

Keep the same stack constraints and dashboard-style visual language as Prompt 1.
