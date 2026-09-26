## 1. Schema & settings plumbing

- [x] 1.1 Add `seatingPassVariant String @default("pass")`, `seatingPassShowMates Boolean @default(true)`, `seatingPassShowMap Boolean @default(true)` to `Wishlist` in `prisma/schema.prisma`; run `pnpm prisma migrate dev --name add_guest_seating_pass` and `pnpm prisma generate`
- [x] 1.2 Add `seatingPassVariantSchema = z.enum(["pass","ring"])` and the three fields to the `wishlist.updateSettings` input in `src/server/validators/wishlist.schema.ts`; unit-test that an unknown variant is rejected
- [x] 1.3 Persist the fields in the settings service/router path and include them in the owner detail view model used by the settings page; confirm `updateSettings` still invalidates the public wishlist cache
- [x] 1.4 Add `seatingPassVariant`, `seatingPassShowMates`, `seatingPassShowMap` to `PublicWishlistViewModel` and its mapper so the cached public wishlist load carries them; update affected fixtures/test factories

## 2. Pass derivation (pure, tested)

- [x] 2.1 Make `calendarDaysUntil` importable from a public-safe module (move to `src/lib/dates/` and re-export from `invite-follow-up.ts`, or import directly if no dashboard deps leak); ensure `tableLabel` is importable from client-safe code (move to `src/lib/seating/table-label.ts` if needed)
- [x] 2.2 Define `SeatingPassViewModel` (members with label or "Mesa por confirmar", party tables with capacity/label/numeral/members, optional tablemates per table, daysAway, event date/time, location) in `src/server/mappers/view-models.ts`
- [x] 2.3 Implement `buildSeatingPass(input, now)` in `src/lib/seating/seating-pass.ts` with `SEATING_PASS_WINDOW_DAYS = 5`, the gate from design D1, confirmed-only party members, "Acompañante" for unnamed, table numeral extraction (D4), `shortName` tablemates (D3)
- [x] 2.4 Unit tests for `buildSeatingPass`: 6/5/0/−1 days, no event date, pending/declined invite, nobody seated, partial seating ("Mesa por confirmar"), declined companion with stale row, unnamed companion, split tables ordered by `sortOrder`, tablemates exclude own party + pending, `showMates=false` yields no tablemates, countdown label ("Faltan N días"/"Mañana"/"Hoy"/none after)

## 3. Loading on the personalized route

- [x] 3.1 Extend `PublicInviteDatabase` with the `seatingTable.findMany` slice and `resolvePersonalizedInvite` with `{ eventDate, showMates, showMap, eventLocation, now }`; run phase-1 gates on the loaded invite, and only then the single table+assignments query from design D2
- [x] 3.2 Strip other invites' rows server-side when `showMates` is false; return `seatingPass` on the `found` result
- [x] 3.3 Service tests: no seating query outside the window or for non-confirmed invites; payload contains no other-invite names when `showMates` is false
- [x] 3.4 Add a confirmed, seated audit guest with an in-window event date to `src/server/fixtures/public-wishlist-audit.ts` (and its test)

## 4. SeatingPass component

- [x] 4.1 Create `src/components/shared/seating-pass/` with shared pieces: `party-list`, `tablemates`, `venue-links` (Google Maps + Waze deep links, new tab, D7), countdown pill
- [x] 4.2 Implement `pass-variant.tsx` (1a Pase de mesa): header with large numeral/label + countdown pill + date/time, perforated divider, "Tu grupo" list, tablemates line, venue block; theme tokens only
- [x] 4.3 Implement `ring-variant.tsx` (1f Anillo de asientos): "Sus lugares" header + pill, one row per table with dot ring (`min(capacity,12)` dots, party filled, "Mesa de N" caption above 12, `role="img"` + aria-label), trailing "Mesa por confirmar" row, tablemates, Maps/Waze buttons
- [x] 4.4 `seating-pass.tsx` switches on variant
- [x] 4.5 Component tests: both variants render party/labels, tablemates hidden when absent, venue hidden without location or toggle off, ring dot count capped at 12; check 320px legibility manually

## 5. Page integration

- [x] 5.1 Add an optional `seatingPassSection` slot to `PublicWishlistPage`, every layout, and `PublicWishlistBody`, rendered directly below the hero; `RsvpSection` stays unchanged
- [x] 5.2 In `src/app/w/[slug]/[guestSlug]/page.tsx`, pass wishlist settings/event info into `resolvePersonalizedInvite` and fill `seatingPassSection` with `SeatingPass` when `seatingPass` is present; `rsvpSection` always renders `RsvpSection` as today
- [x] 5.3 Update `src/app/w/public-personalized-route.test.tsx`: pass slot filled inside the window with RSVP untouched; no pass outside it

## 6. Settings UI

- [x] 6.1 Add `SAMPLE_SEATING_PASS` fixture (Lady/Marco at Mesa 4, Sofía at "Mesa 7 · niños", sample tablemates) for the preview
- [x] 6.2 Add the "Mesa asignada" section to `wishlist-settings-form.tsx`: variant radio cards ("Pase de mesa" / "Anillo de asientos"), switches "Mostrar compañeros de mesa" and "Mostrar cómo llegar", helper copy about the 5-day window
- [x] 6.3 Render a live `SeatingPass` preview from the sample fixture merged with the form's watched event date/time/location, inside the wishlist theme scope; updates before save
- [x] 6.4 Extend `wishlist-settings-form.test.tsx`: defaults shown, variant change updates preview, toggles hide tablemates/venue, values submitted to `updateSettings`

## 7. Validation

- [x] 7.1 Run `pnpm check`, `pnpm test`, `pnpm typecheck`; fix findings
- [x] 7.2 Manually verify on `pnpm dev` (port 4005) with a seated confirmed invite: both variants, a split party, a companion without table, tablemates toggle, and an event date 6 days out (no pass) vs. past (pass without RSVP)
