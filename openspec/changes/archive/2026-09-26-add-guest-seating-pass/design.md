## Context

The seating chart (`add-seating-chart`) gave hosts `SeatingTable` + `SeatingAssignment` rows keyed per person (`inviteId` + nullable `extraGuestId`), with eligibility derived at read time by `toEligiblePeople` (drops `declined` invites and extra guests) and table labels from `tableLabel` (`name` or `Mesa {sortOrder + 1}`). It explicitly deferred a guest-facing "tu mesa" surface.

The personalized invite route `src/app/w/[slug]/[guestSlug]/page.tsx` loads the published wishlist through the tag-cached `getPublicWishlistBySlug` (`unstable_cache`, invalidated by `public-wishlist-cache.ts`) and the invite through the uncached `resolvePersonalizedInvite`, then passes `<RsvpSection>` into `PublicWishlistPage`'s `rsvpSection` slot. `RsvpSection` is a client component that owns a `mode: "auto" | "form"` state and the calendar-save control.

Design source: Claude Design `Mesa Asignada Proposals.dc.html`, proposals **1a Pase de mesa** and **1f Anillo de asientos**, with `showMates` / `showMap` toggles. The design says "2–3 días antes"; the product decision is **5 days**.

## Goals / Non-Goals

**Goals:**
- One pure, unit-tested function decides visibility and builds the pass payload.
- Seating data is fresh on every request and loaded only when the pass can show.
- Owner controls variant + two toggles in settings, with a sample-data preview.
- No names from other invites leave the server unless the owner allows it.

**Non-Goals:**
- Per-seat positions, table kinds, static maps, notifications, other design proposals (see proposal).

## Decisions

### D1. Gate: one pure function over already-loaded rows

`src/lib/seating/seating-pass.ts` exports `buildSeatingPass(input, now): SeatingPassViewModel | null`.

```
eventDate null ─────────────────────────────▶ null
daysAway = calendarDaysUntil(eventDate, now)
daysAway > 5 ───────────────────────────────▶ null
invite.status !== "confirmed" ──────────────▶ null
confirmed members (primary + extras with status confirmed)
none of them seated ────────────────────────▶ null
otherwise ▶ { daysAway, eventDate/time, members[], tables[], mates?, location? }
```

`calendarDaysUntil` (Lima calendar) is reused from `src/lib/dashboard/invite-follow-up.ts` rather than duplicated; if importing from `lib/dashboard` into a public path feels wrong, move it to `src/lib/dates/` in the same change (it has no dashboard dependencies). Threshold is a named constant `SEATING_PASS_WINDOW_DAYS = 5`.

*Alternative:* gate inside the page component. Rejected — untestable without rendering and would mix date math into JSX.

### D2. Loading: extend `resolvePersonalizedInvite`, two-phase

The invite row already arrives with `extraGuests`. Phase 1 (no extra query) evaluates the cheap gates: event date window + `invite.status === "confirmed"`. Only if they pass, phase 2 runs **one** query:

```ts
db.seatingTable.findMany({
  where: { wishlistId, assignments: { some: { inviteId } } },
  orderBy: { sortOrder: "asc" },
  select: { id, name, sortOrder, capacity,
    assignments: { select: { inviteId, extraGuestId,
      invite: { select: { status, primaryName } },
      extraGuest: { select: { status, name } } } } },
})
```

This returns only the party's tables, with every assignment at them, so both the party's seats and tablemates come from one round trip. When `seatingPassShowMates` is false the service drops the other invites' rows before building the view model, so they never reach the client payload (spec: "page payload SHALL NOT carry them").

`resolvePersonalizedInvite` gains `{ eventDate, showMates, now }` inputs and returns `seatingPass?: SeatingPassViewModel`. `PublicInviteDatabase` gets the `seatingTable.findMany` slice. The query is uncached, like the invite lookup, so a host reseating someone shows on the next load — no cache-tag work needed for seating.

*Alternative:* a separate tRPC `publicProcedure`. Rejected — the page is a server component that already has the invite; a second round trip and a new public API surface buy nothing.

### D3. Eligibility of tablemates

Tablemates = assignment rows at the party's tables where `inviteId !== viewer.inviteId`, invite status `confirmed`, and (for extra guests) extra-guest status `confirmed`. This is stricter than `toEligiblePeople` (which keeps `pending`) on purpose: the pass announces who *will* be there. Names are formatted `first + " " + lastInitial + "."` via a small `shortName` helper; a single-token name is kept whole; unnamed companions are skipped.

### D4. Table label and numeral

Label = `tableLabel(table)` (shared with the print sheet). The `pass` header and `ring` center need a short mark: if label matches `/^Mesa\s+(\d+)\b/i` use the number, else use the label (the center font steps down for long labels). `tableLabel` moves from `seating.service.ts` to `src/lib/seating/table-label.ts` if importing the service (which pulls tRPC/Prisma types) into a client-safe module causes bundling issues; otherwise imported as-is.

### D5. Rendering: responsive placement via two slots

`RsvpSection` is unchanged. `PublicWishlistPage` and every layout accept an optional `seatingPassSection` node next to `rsvpSection`; the page fills both from one server component:

```
page.tsx (server)
  seatingPassSection = <div class="lg:hidden"><SeatingPass/></div>        (mobile: under the hero)
  rsvpSection        = <div class="hidden lg:block"><SeatingPass/></div>   (desktop: RSVP position)
                       <RsvpSection className="lg:hidden"/>                (RSVP hidden on desktop only while a pass exists)
```

Layouts render `seatingPassSection` directly under their hero image area and before the welcome message: `PublicWishlistBody`-based layouts and `collage-staggered` first in the body, `arch-trio` between hero and its details/message row, `split-image-right` as a mobile-ordered grid child between the image and text columns. Both copies are server-rendered and CSS picks one, so there is no client state.

`SeatingPass` (`src/components/shared/seating-pass/`) is presentational: `seating-pass.tsx` switches on `variant` to `pass-variant.tsx` / `ring-variant.tsx`, sharing `party-list`, `tablemates`, `venue-links`. It uses only public theme tokens and is reused by the settings preview. There is no change-answer control on the pass; on mobile the RSVP section keeps that job.

### D6. Ring geometry

Dots are placed with `cos/sin` on a fixed radius in an absolutely positioned box (as in the design: 120px box, 14px dots). Dot count = `min(capacity, 12)`; the first `min(partyAtTable, 12)` dots are filled. When capacity exceeds 12 a caption shows the real size ("Mesa de 20") — keeps dots from overlapping at capacity 20 without pretending to know seat positions. Rectangular tables render as rings too (the pass is about "which table", not shape). The ring has `role="img"` and an `aria-label` like "Mesa 4: 2 de 8 lugares son de tu grupo".

### D7. Venue links

`https://www.google.com/maps/search/?api=1&query=<encoded eventLocation>` and `https://waze.com/ul?q=<encoded>&navigate=yes`, `target="_blank" rel="noopener noreferrer"`. `pass` shows the location text + two text links (design 1a); `ring` shows a primary button "Abrir en Google Maps" + secondary "Waze" (design 1f). The design's map thumbnail is dropped (no Maps key); `pass` uses no placeholder block.

### D8. Settings storage

```prisma
seatingPassVariant   String  @default("pass")
seatingPassShowMates Boolean @default(true)
seatingPassShowMap   Boolean @default(true)
```

`String` + Zod enum (`z.enum(["pass","ring"])`), matching how `countdownVariant` etc. are stored; non-null with defaults so existing wishlists need no backfill. The fields are added to the `wishlist.updateSettings` input schema, the owner detail view model, and `PublicWishlistViewModel` (so the page gets them through the existing cached wishlist load; `updateSettings` already invalidates the public cache). They are **not** added to the creation wizard or `saveDraft`.

### D9. Settings section + preview

A "Mesa asignada" fieldset in `wishlist-settings-form.tsx`: a two-option radio card group (thumbnail + name), two switches, helper text ("Tus invitados confirmados verán su mesa en su enlace personal desde 5 días antes del evento."), and a preview that renders `SeatingPass` from a `SAMPLE_SEATING_PASS` fixture (Lady/Marco/Sofía, sample tablemates) merged with the form's current event date/time/location, wrapped in the wishlist's theme scope. Preview state reads the form's watched values, so it updates before save.

### D10. Audit fixtures

`src/server/fixtures/public-wishlist-audit.ts` gains a seated, confirmed audit guest with a fixed event date inside the window so the public audit/visual routes exercise the pass.

## Risks / Trade-offs

- **Tablemate names on a public link** → first name + initial only, confirmed-only, owner toggle, and stripped server-side when off.
- **Stale assignment for a now-declined companion** → filtered by status at read time; no write cascade (same principle as the seating board).
- **Extra query on every personalized load** → runs only inside the 5-day window for confirmed invites, one indexed query (`SeatingAssignment.inviteId`/`tableId` indexes exist).
- **Time zone edge** → `calendarDaysUntil` already pins "today" to Lima; the countdown label and gate use the same `daysAway`, so they never disagree.
- **Guest reopens the form, declines, then the page refreshes** → pass disappears and declined summary shows; intended.
- **Long custom table names in the ring center** → numeral only when label is "Mesa N"; otherwise truncate center text with the full label beside the ring.

## Migration Plan

1. Prisma migration adding the three columns with defaults (additive, no backfill).
2. Deploy; existing wishlists behave as `pass` + both toggles on. Rollback = revert code; columns are harmless if left.

## Open Questions

None blocking. Copy for the countdown pill uses "Faltan N días" / "Mañana" / "Hoy", consistent with `getEventProximity` wording.
