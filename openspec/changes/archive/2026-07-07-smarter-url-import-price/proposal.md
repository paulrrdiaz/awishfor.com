## Why

URL importer misses price on real stores. Root cause confirmed on `https://infanti.com.pe/products/b-005s-silla-de-comer-feed?variant=50394283770156`: site (Shopify) emits JSON-LD `ProductGroup` w/ `hasVariant` array, each variant own `Offer`/price (Pink 279.20 PEN vs Blue 244.30 PEN) — current `findJsonLdProducts` only match top-level `@type: "Product"` or flat `@graph`, so `ProductGroup` skip entirely and price fall through to nothing. Same page also carry `og:price:amount`/`og:price:currency` meta tags that current OG extractor never read. Importer smarter here = fewer manual price fill-ins for users building wishlists.

## What Changes

- `extractJsonLd` (src/server/services/importer.service.ts) recognize `ProductGroup` type: read `hasVariant` array, pick variant matching `variant` query param on submitted/final URL (via each variant's `@id`/`offers.url` containing that id), else first variant with resolvable price.
- `extractJsonLd` recognize `AggregateOffer` shape (`offers.@type === "AggregateOffer"` with `lowPrice`/`price`) as price fallback when no single `Offer`.
- `extractOpenGraph` read `og:price:amount` + `og:price:currency` meta tags into `priceAmount`/`priceCurrency`.
- Metadata priority chain unchanged in order (JSON-LD > OG > Twitter > title/domain) — new sources just fill previously-empty price fields at their existing tier.

## Capabilities

### New Capabilities
(none)

### Modified Capabilities
- `url-import`: "Metadata extraction priority chain" requirement gains variant-aware JSON-LD `ProductGroup`/`AggregateOffer` price resolution and OG price meta tags as an explicit price source.

## Impact

- Code: `src/server/services/importer.service.ts` (`extractJsonLd`, `extractOpenGraph`, `findJsonLdProducts` or new helper), fixtures in `src/test/fixtures/importer-html-fixtures.ts`, tests in `src/server/services/importer.service.test.ts`.
- No API/schema/env changes — `ImportedGiftDraft` shape unchanged, only how fields get populated.
