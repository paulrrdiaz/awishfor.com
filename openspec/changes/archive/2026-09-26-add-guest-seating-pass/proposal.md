## Why

Hosts now seat every guest in the **Mesas** floor plan, but a guest only learns their table at the door by scanning the printed sheet. The personalized invite link (`/w/[slug]/[guestSlug]`) already knows who the guest is and whether they confirmed, so in the last days before the event it can tell each confirmed party exactly where they sit — "Mesa asignada". The seating-chart change explicitly deferred this guest-facing "tu mesa" surface; this change delivers it.

## What Changes

- Add a **seating pass** to the personalized invite page. It appears directly below the hero (first screens on mobile), alongside the untouched RSVP section, when the invite is confirmed, the event is **5 calendar days away or less** (Lima calendar, same day math as the invite follow-up reminders), and at least one confirmed member of the party has a table.
- The pass lists every confirmed member of the party with their table label; confirmed members without a table read **"Mesa por confirmar"**. Pending and declined members are not listed.
- Two visual variants from the Claude Design file `Mesa Asignada Proposals.dc.html`:
  - **`pass` — 1a Pase de mesa (default):** a ticket with the guest's table as a large numeral, a countdown pill, the event date/time, a perforated divider and a "Tu grupo" stub.
  - **`ring` — 1f Anillo de asientos:** one ring per table the party uses; dots stand for the table's capacity and the party's seats are filled.
- Optional **tablemates** line ("En la Mesa 4 también: …"): other confirmed people at the same table, shown as first name + last-name initial.
- Optional **venue** block: Google Maps and Waze deep links built from `eventLocation`. No static map image (no Maps API key).
- **Placement:** on mobile the pass sits directly under the hero, before the welcome message, and the RSVP section is untouched; on desktop (`lg`+) the pass takes the RSVP section's position and the RSVP section is hidden.
- The **owner** configures the pass in **wishlist settings**: variant (`pass` | `ring`), show tablemates (default on), show venue (default on), with a live preview that renders the chosen variant from sample data.
- Database: three new `Wishlist` columns — `seatingPassVariant`, `seatingPassShowMates`, `seatingPassShowMap`.

### Non-goals

- Per-seat assignment or seat numbers — the ring fills the first N dots; it does not claim a seat position.
- A "kids table" flag or any other table kind — the pass shows the table's own label (`tableLabel`), so a host who names a table "Mesa 7 · niños" gets exactly that.
- Static map thumbnails, venue name/address split, or host arrival notes (proposal 1d).
- The other design proposals (1b Arco, 1c Tarjetas de lugar, 1d Tu recorrido, 1e Cuenta regresiva + lista).
- Notifying guests (email/WhatsApp) that their table is ready; the pass only appears when they open their link.
- Showing the pass on the plain (non-personalized) wishlist page.

## Capabilities

### New Capabilities
- `guest-seating-pass`: The guest-facing "Mesa asignada" pass on the personalized invite page — visibility window and gating, party and tablemate content, the `pass` and `ring` variants, venue links, and the owner-controlled display settings with preview.

### Modified Capabilities
- `personalized-invite-page`: layouts gain a slot that renders the seating pass directly below the hero. The RSVP section is unchanged.
- `wishlist-settings`: the settings form adds the seating pass variant, tablemates toggle, venue toggle, and a preview, persisted through `wishlist.updateSettings`.

## Impact

- **Schema / migration:** `Wishlist.seatingPassVariant String @default("pass")`, `seatingPassShowMates Boolean @default(true)`, `seatingPassShowMap Boolean @default(true)`.
- **Server:** `src/server/services/public-invite.service.ts` (`resolvePersonalizedInvite` loads the party's seating when the gate passes); reuses `toEligiblePeople`, `personIdFor` and `tableLabel` from `seating.service.ts`; `calendarDaysUntil` from `src/lib/dashboard/invite-follow-up.ts`. `PublicWishlistViewModel` / `PublicGuestViewModel` gain the pass payload and settings. Public wishlist audit fixtures (`src/server/fixtures/public-wishlist-audit.ts`) gain a seated guest.
- **API:** `wishlist.updateSettings` input (`src/server/validators/wishlist.schema.ts`) accepts the three new fields; owner-scoped as today.
- **UI:** new `SeatingPass` component (both variants) in `src/components/shared/`; every public layout renders a new `seatingPassSection` slot below its hero; `src/app/w/[slug]/[guestSlug]/page.tsx` fills it; `wishlist-settings-form.tsx` gains a "Mesa asignada" section with preview.
- **Privacy:** tablemate names from other invites are exposed on a link anyone holding it can open — limited to first name + initial and switchable off by the owner.
- No new env vars or dependencies.
