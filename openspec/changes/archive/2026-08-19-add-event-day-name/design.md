## Context

`formatEventDate` (`src/lib/format/dates.ts:32-50`) builds its output with a single `Intl.DateTimeFormat(INTL_LOCALE[locale], { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" })` call, then optionally appends a time suffix. `timeZone: "UTC"` is deliberate: event dates are stored as UTC-midnight calendar days, and formatting in the viewer's local timezone can shift the displayed day backward. See proposal.md - Why.

Verified empirically (Node, `Intl.DateTimeFormat` with `weekday: "long"` added to the existing options, same `d = 2026-09-26T00:00:00.000Z`):
- `es-PE` → `"sábado, 26 de setiembre de 2026"` (weekday lowercase, leads the string, comma-separated)
- `en-US` → `"Saturday, September 26, 2026"` (weekday already capitalized, leads the string, comma-separated)

Both target locales place the weekday name first, followed by a comma. This is CLDR's standard "full date" ordering for `es-PE` and `en-US` and is not expected to change.

## Goals / Non-Goals

**Goals:**
- Add the capitalized weekday name to `formatEventDate`'s output for both `es` and `en`, without altering the UTC-safety behavior.
- Keep the change to a single function; no new dependency.

**Non-Goals:**
- Supporting locales beyond `es`/`en` (the `Locale` type is a closed union of these two; not addressed here).
- Changing `formatEventTime`, the `EventDetails` component, or the "Fecha" label/layout — the weekday name flows through the existing string output unchanged.
- Deduplicating the `EventDetails` vs. `split-image-right-layout.tsx` inline "Fecha" implementations — out of scope, both already share `formatEventDate` and both benefit automatically.

## Decisions

**Add `weekday: "long"` to the existing `Intl.DateTimeFormat` options object**, rather than introducing a second formatting call or a new library.
- Alternatives considered: `date-fns` `format()` with `EEEE` token — rejected (see proposal.md) because it reads local time by default and would need `date-fns-tz` or manual UTC reconstruction to match the current UTC-safety guarantee, adding a dependency and risk for no behavioral gain over the native API already in use.

**Capitalize the first character of the whole formatted string**, rather than formatting the weekday separately and splicing it in.
- Rationale: verified both `es-PE` and `en-US` full-date output always places the weekday first. Capitalizing index 0 of the final string is sufficient and is a no-op for `en-US` (already capitalized), fixing only `es-PE`'s lowercase weekday.
- Alternative considered: format weekday alone via a second `Intl.DateTimeFormat({ weekday: "long" })` call, capitalize it, then interpolate into a manually-built string (`"${Weekday}, ${monthDayYear}"`). Rejected as unnecessary complexity — it duplicates locale-mapping logic and hardcodes the comma-separator assumption explicitly instead of relying on CLDR's own ordering, without buying any additional safety.
- Trade-off accepted: this relies on weekday leading the formatted string for whichever locales `INTL_LOCALE` maps to. Since `Locale` is closed to `es`/`en` today, this is safe; if a future locale is added where CLDR doesn't put the weekday first, this capitalization approach would need revisiting (documented as an inline comment at the call site).

**Apply to both `es` and `en`** — confirmed with the user in exploration; consistency across locales was preferred over scoping to `es` only.

## Risks / Trade-offs

- [Risk] A future added locale places the weekday elsewhere in the string, so blind first-character capitalization capitalizes the wrong token → Mitigation: `Locale` is a closed `es`/`en` union enforced by TypeScript; adding a third locale is itself a deliberate change that should re-check this assumption. A one-line comment at the capitalization call site flags the assumption for that future editor.
- [Risk] `dates.test.ts`'s existing regex-based assertions (e.g. `/diciembre/i`) may need loosening/updating since the full string now starts with a weekday name → Mitigation: covered explicitly in tasks.md; existing tests must be updated to match the new leading weekday, not just left passing by accident.
