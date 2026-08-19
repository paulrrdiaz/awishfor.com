## 1. Implementation

- [x] 1.1 In `src/lib/format/dates.ts`, add `weekday: "long"` to the `Intl.DateTimeFormat` options object inside `formatEventDate`.
- [x] 1.2 Capitalize the first character of the resulting formatted date string (no-op for `en-US`, fixes lowercase weekday for `es-PE`), before the existing time-suffix concatenation.

## 2. Tests

- [x] 2.1 Update `src/lib/format/dates.test.ts` assertions for `formatEventDate` that check exact/partial output (e.g. the `/diciembre/i`-style regex and the UTC-preservation test) to account for the leading weekday name.
- [x] 2.2 Add a test asserting the `es` output begins with a capitalized Spanish weekday (e.g. `Sábado, ...`).
- [x] 2.3 Add a test asserting the `en` output begins with a capitalized English weekday (e.g. `Saturday, ...`).
- [x] 2.4 Confirm the existing UTC-preservation test still passes with the weekday included (viewer-timezone-behind-UTC case does not shift the weekday or the date).

## 3. Verification

- [x] 3.1 Run `pnpm test`, `pnpm check`, and `pnpm typecheck`; report and fix any failures before closing the session.
- [x] 3.2 Note as a session-end reminder: manually verify the "Fecha" field in `EventDetails` and in the `split-image-right-layout.tsx` "Fecha" field render the weekday correctly in the browser (skip automated attempt per workflow rules).
