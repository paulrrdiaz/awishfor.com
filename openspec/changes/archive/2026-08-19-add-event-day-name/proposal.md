## Why

Public wishlist pages show the event date ("Fecha") without the day of the week, so guests have to look up a calendar to know if an event lands on a weekday or weekend. Adding the day name to the existing date string closes that gap with a small, localized formatting change.

## What Changes

- `formatEventDate` (`src/lib/format/dates.ts`) gains the weekday name in its output, for both `es` and `en` locales, via `Intl.DateTimeFormat`'s `weekday: "long"` option — preserving the existing `timeZone: "UTC"` handling so the displayed calendar day does not shift.
- The weekday name is capitalized (`Sábado, 26 de septiembre de 2026` / `Saturday, December 25, 2026`), since `Intl.DateTimeFormat` returns a lowercase weekday for `es-PE` by default and needs explicit capitalization to match the desired display.
- No new dependency: `date-fns` was considered but rejected because its `format()` reads local time by default and has no built-in UTC-safe equivalent to Intl's `timeZone` option, which would risk reintroducing the off-by-one-day bug the current UTC handling guards against.
- Both existing "Fecha" render sites (`EventDetails` in `src/components/shared/event-details.tsx`, and the duplicate inline field in `src/components/layouts/public-wishlist/split-image-right-layout.tsx`) already call `formatEventDate`, so both pick up the change automatically — no separate edit needed there.

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `formatting-helpers`: the "Event date formatting respects locale" requirement gains day-name (weekday) output for both locales.

## Impact

- Code: `src/lib/format/dates.ts` (`formatEventDate`), and its existing test coverage in `src/lib/format/dates.test.ts`.
- No schema, API, or env changes. No new dependencies.
- Downstream: `EventDetails` and `split-image-right-layout.tsx` display strings change (additive — the "Fecha" label and surrounding layout are untouched), plus `collage-staggered-layout.tsx`'s `eventSummary`, which also calls `formatEventDate`.
