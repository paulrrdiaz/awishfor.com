## Context

Milestone 1 introduced the `Wishlist`, `Category`, `Gift`, and `Purchase` Prisma models plus purchase-quantity helpers (`getPurchasedQuantity`, `getRemainingQuantity`, `deriveGiftPublicStatus`) in `src/server/services/purchase.service.ts`. Upcoming UI work (public `/w/[slug]` page and the owner dashboard) must not receive raw Prisma rows: they contain private guest data, internal notes, and non-serializable types (`Decimal`, `Date`) that break the RSC → client boundary.

This change adds a pure mapping layer and shared formatters. It introduces no DB, env, or API changes. Mappers are pure functions over already-fetched data; the fetching/service logic lands in later tasks (e.g. `public-wishlist.service.ts`).

## Goals / Non-Goals

**Goals:**

- Provide pure, synchronous mapper functions that convert Prisma models (with relations already loaded) into serializable view models.
- Enforce the public/private boundary: public view models exclude hidden gifts, soft-deleted gifts, guest PII (email/phone/message), and internal notes.
- Serialize `Decimal` → `string` and `Date` → ISO `string` so client components receive only primitives.
- Expose dashboard derived fields (e.g. visible gift count, purchased/remaining quantity, gift public status, publish readiness summary inputs).
- Provide locale/currency-aware formatters (`formatMoney`, `formatEventDate`, `formatRelativeDate`, `formatStoreDomain`) usable by both server and client components.

**Non-Goals:**

- No localization inside mappers — mappers emit raw serializable values; formatting is the formatters' job.
- No data fetching, tRPC routers, or service changes in this change.
- No advanced timezone handling beyond `Intl` defaults for MVP.

## Decisions

### Mappers are pure functions taking pre-loaded models

Each mapper accepts a Prisma model with its required relations as a typed input and returns a view model. No `db` access inside mappers. This keeps them trivially unit-testable and lets callers control the query shape.

- Alternative (rejected): mappers fetch their own data. Couples mapping to query strategy, harder to test, risks N+1.

Quantity derivation needs purchased totals. Rather than querying, the public mapper accepts purchases (or a pre-computed purchased quantity) loaded by the caller and reuses `deriveGiftPublicStatus` from `purchase.service.ts` to avoid duplicating status logic.

### Serialization at the mapper boundary

`Decimal` → `string` via `.toString()` (preserves precision; avoids float drift). `Date` → ISO via `.toISOString()`. View model types use `string` for these fields so downstream code never touches Prisma `Decimal`/`Date`. Nullable price fields map to `string | null`.

- Alternative (rejected): pass `Decimal`/`Date` through and serialize in superjson. tRPC superjson handles transport, but client components and tests still benefit from plain primitives, and public view models should be explicit about shape.

### Two view model surfaces: public vs dashboard

Public view models are minimal and safe-by-construction (no PII, no internal notes, hidden/deleted gifts filtered out). Dashboard view models are owner-facing and include management fields (status, counts, remaining quantity, internal note presence) but still serialize `Decimal`/`Date`. Separate files (`public-wishlist.mapper.ts`, `dashboard-wishlist.mapper.ts`, `dashboard-gift.mapper.ts`) keep the boundary obvious; sharing a single mapper risks accidentally leaking private fields into the public path.

### Formatters built on `Intl`

`formatMoney` uses `Intl.NumberFormat` keyed by currency + locale (PEN→es-PE, USD→en-US, etc.). `formatEventDate`/`formatRelativeDate` use `Intl.DateTimeFormat`/`Intl.RelativeTimeFormat` with the wishlist `Locale`. `formatStoreDomain` derives a clean hostname from a URL (strip `www.`, lowercase) with a safe fallback when the URL is missing/invalid. Formatters accept a `Locale` (and `Currency` where relevant) argument rather than reading global state.

- Alternative (rejected): a heavy i18n library. Overkill for MVP; `Intl` is built-in and sufficient.

## Risks / Trade-offs

- [Private data leak via public mapper] → Public mapper type intentionally omits PII fields so a leak is a type error; add explicit tests asserting excluded fields are absent.
- [Decimal precision loss] → Use `.toString()` not `Number()`; test PEN/USD amounts including decimals.
- [`Intl` locale data gaps in Node] → Modern Node ships full ICU; pin expected outputs in tests and accept minor formatting variance across runtimes.
- [Status derivation drift] → Reuse `deriveGiftPublicStatus` rather than reimplementing in the mapper.
