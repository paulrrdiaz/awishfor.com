## Why

Components currently would consume raw Prisma models, which leak private guest data (email, phone, message), internal notes, and non-serializable types (`Decimal`, `Date`) into client components. We need a safe boundary that produces serializable, presentation-ready view models, plus shared locale-aware formatters so display logic is not duplicated across the UI.

## What Changes

- Add server-side view model mappers in `src/server/mappers/`:
  - `public-wishlist.mapper.ts` — maps a wishlist (with categories, gifts, purchases) to a public view model that excludes hidden/soft-deleted gifts and all private/internal fields.
  - `dashboard-wishlist.mapper.ts` — maps a wishlist to an owner-facing dashboard card/detail view model with management-ready derived fields.
  - `dashboard-gift.mapper.ts` — maps gifts to dashboard gift-row view models including derived quantity/status fields.
- Add view model types: public wishlist, public gift, dashboard card, dashboard gift row.
- Serialize `Decimal` → string and `Date` → ISO string at the mapper boundary so client components receive only serializable primitives.
- Add shared formatting helpers in `src/lib/format/`:
  - `money.ts` (`formatMoney`), `dates.ts` (`formatEventDate`, `formatRelativeDate`), `strings.ts` (`formatStoreDomain`).
  - Locale/currency aware (PEN/es-PE, USD/en-US, and the other supported currencies/locales).
- Add unit tests for mappers and formatters.

Non-goals:

- Mappers do **not** perform localization/formatting (that is the formatters' job; mappers emit raw serializable values).
- No advanced timezone support beyond MVP app needs.
- No new tRPC endpoints or service fetch logic (the public wishlist service is a separate task; this change only provides the mapping boundary it will consume).

## Capabilities

### New Capabilities

- `wishlist-view-models`: Server mappers that transform Prisma wishlist/gift/purchase models into safe, serializable public and dashboard view models, enforcing public/private data boundaries and exposing derived management fields.
- `formatting-helpers`: Shared locale-aware formatting utilities for money, event dates, relative dates, and store domains.

### Modified Capabilities

<!-- None: no existing spec requirements change. -->

## Impact

- New code: `src/server/mappers/*`, `src/lib/format/*`, plus colocated tests.
- Consumers (later tasks): `src/server/services/public-wishlist.service.ts`, `src/server/services/wishlist.service.ts`, dashboard/public UI components.
- Depends on existing models/enums (`Wishlist`, `Gift`, `Purchase`, `Category`, `Currency`, `Locale`) and purchase quantity helpers (`getPurchasedQuantity`, `deriveGiftPublicStatus`) in `src/server/services/purchase.service.ts`.
- No schema, env, or config changes.
