## 1. Fixtures

- [x] 1.1 Add HTML fixtures to `src/test/fixtures/importer-html-fixtures.ts`: `HTML_WITH_JSON_LD_PRODUCT_GROUP` (two `hasVariant` entries with different `Offer` prices, mirroring the Infanti repro shape), `HTML_WITH_JSON_LD_AGGREGATE_OFFER` (`offers.@type: "AggregateOffer"` with `lowPrice`), `HTML_WITH_OG_PRICE` (`og:price:amount`/`og:price:currency` meta tags, no JSON-LD price).

## 2. Extraction logic

- [x] 2.1 In `src/server/services/importer.service.ts`, extend `findJsonLdProducts` (or a sibling helper) to flatten `ProductGroup.hasVariant` into candidate product objects alongside existing `Product`/`@graph` handling.
- [x] 2.2 Add variant selection: derive `variant` query param from the URL being parsed, match against each candidate's `@id`/`offers.url`; when matched use that variant's offer, else fall back to first candidate with a resolvable price. Thread the URL into `extractJsonLd`'s call site (`importGiftFromUrl` already has `finalUrl`).
- [x] 2.3 Add `AggregateOffer` handling in the existing offer-parsing branch: read `price`, else `lowPrice`.
- [x] 2.4 Extend `extractOpenGraph` to read `og:price:amount` → `priceAmount` (via `Number(...)`, drop `NaN`) and `og:price:currency` → `priceCurrency`, following the existing first-match-wins pattern.

## 3. Tests

- [x] 3.1 Add `extractJsonLd` test: resolves the matching variant's price when a `variant` query param is passed.
- [x] 3.2 Add `extractJsonLd` test: falls back to first priced variant when no `variant` param matches.
- [x] 3.3 Add `extractJsonLd` test: reads `AggregateOffer.lowPrice` when no single `Offer.price`.
- [x] 3.4 Add `extractOpenGraph` test: reads `og:price:amount`/`og:price:currency`.
- [x] 3.5 Add `importGiftFromUrl` integration test using the Infanti-shaped fixture end-to-end (URL with `?variant=...` → correct price in the returned draft).

## 4. Validation

- [x] 4.1 Run `pnpm test`, `pnpm typecheck`, `pnpm check` and report results.
- [x] 4.2 Manually verify against the live repro URL (`https://infanti.com.pe/products/b-005s-silla-de-comer-feed?variant=50394283770156`) that the importer now returns PEN 279.20 — note as a manual-verify reminder, not auto-attempted during apply.
