## 1. Shared formatting helpers (Task 1.9)

- [x] 1.1 Add `src/lib/format/money.ts` exporting `formatMoney(amount, { currency, locale })`, mapping `Currency`/`Locale` to `Intl.NumberFormat` locales and accepting number or string input.
- [x] 1.2 Add `src/lib/format/dates.ts` exporting `formatEventDate(date, locale)` and `formatRelativeDate(date, locale)` built on `Intl.DateTimeFormat`/`Intl.RelativeTimeFormat`, accepting Date or ISO string.
- [x] 1.3 Add `src/lib/format/strings.ts` exporting `formatStoreDomain(url)` that strips `www.`, lowercases the host, and returns a clean fallback for missing/invalid URLs.
- [x] 1.4 Add tests `money.test.ts`, `dates.test.ts`, `strings.test.ts` covering PEN/es-PE, USD/en-US, Spanish/English dates, future/past relative dates, and domain fallback.

## 2. View model types (Task 1.8)

- [x] 2.1 Define public wishlist and public gift view model types (serializable: price as `string | null`, dates as ISO `string | null`, no PII/internal fields).
- [x] 2.2 Define dashboard card and dashboard gift row view model types (include status, counts, purchased/remaining quantities; still serialized).

## 3. Public wishlist mapper (Task 1.8)

- [x] 3.1 Add `src/server/mappers/public-wishlist.mapper.ts` mapping a wishlist with categories, gifts, and purchases to the public view model.
- [x] 3.2 Exclude soft-deleted (`deletedAt`) and hidden (`visibilityStatus = hidden`) gifts from output and derived counts.
- [x] 3.3 Exclude guest email/phone/message and internal notes; serialize `Decimal`→string and `Date`→ISO string.
- [x] 3.4 Derive each public gift's status via `deriveGiftPublicStatus` using purchased totals from loaded purchases.

## 4. Dashboard mappers (Task 1.8)

- [x] 4.1 Add `src/server/mappers/dashboard-gift.mapper.ts` mapping a gift (+ purchases) to a dashboard gift row with purchased and remaining quantities and serialized price.
- [x] 4.2 Add `src/server/mappers/dashboard-wishlist.mapper.ts` mapping a wishlist to a dashboard card view model with status and visible non-deleted gift count, reusing the dashboard gift mapper.

## 5. Tests

- [x] 5.1 Add `public-wishlist.mapper.test.ts` asserting hidden/deleted exclusion, absent PII/internal fields, serialized primitives, and derived public status.
- [x] 5.2 Add `dashboard-wishlist.mapper.test.ts` and `dashboard-gift.mapper.test.ts` asserting derived counts, remaining quantity, and serialization.

## 6. Validation

- [x] 6.1 Run `pnpm check`, `pnpm test`, and `pnpm typecheck`; fix issues.
- [x] 6.2 Mark tasks 1.8 and 1.9 complete in `docs/TASKS.md`.
