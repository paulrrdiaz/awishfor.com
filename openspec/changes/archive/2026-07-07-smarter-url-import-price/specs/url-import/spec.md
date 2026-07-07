## MODIFIED Requirements

### Requirement: Metadata extraction priority chain

The importer SHALL extract gift metadata from fetched HTML using a defined priority order and SHALL fall back gracefully when higher-priority sources are absent. Within JSON-LD, when the product is represented as a `ProductGroup` with `hasVariant`, the importer SHALL resolve price from the variant matching the submitted URL's `variant` query parameter when present, and SHALL support `AggregateOffer` (`price` or `lowPrice`) as a price source. Open Graph extraction SHALL also read `og:price:amount`/`og:price:currency` meta tags as a price source.

#### Scenario: JSON-LD Product takes precedence
- **WHEN** the HTML contains a JSON-LD `Product` object with name, image, and price
- **THEN** those values are used for the draft over Open Graph, Twitter Card, or title

#### Scenario: JSON-LD ProductGroup resolves the URL-selected variant's price
- **WHEN** the HTML contains a JSON-LD `ProductGroup` with a `hasVariant` array and the submitted/final URL has a `variant` query parameter matching one variant's `@id` or `offers.url`
- **THEN** that variant's `offers.price` and `offers.priceCurrency` are used for the draft

#### Scenario: JSON-LD ProductGroup falls back to first priced variant
- **WHEN** the HTML contains a JSON-LD `ProductGroup` with a `hasVariant` array but the URL has no `variant` query parameter, or it matches no variant
- **THEN** the first `hasVariant` entry with a resolvable price is used for the draft

#### Scenario: JSON-LD AggregateOffer used as price source
- **WHEN** a JSON-LD product's `offers` is an `AggregateOffer` (no single `Offer.price`)
- **THEN** `price` is used if present, else `lowPrice`, as the draft's `priceAmount`

#### Scenario: Open Graph price meta tags populate price
- **WHEN** the HTML contains `og:price:amount` and/or `og:price:currency` meta tags and no JSON-LD price was resolved
- **THEN** those values populate `priceAmount`/`priceCurrency` in the draft

#### Scenario: Open Graph used when JSON-LD absent
- **WHEN** no JSON-LD Product is present but Open Graph tags exist
- **THEN** Open Graph values populate the draft

#### Scenario: Twitter Card used when OG absent
- **WHEN** neither JSON-LD nor Open Graph provide a field but Twitter Card tags do
- **THEN** Twitter Card values populate that field

#### Scenario: HTML title fallback
- **WHEN** no structured metadata provides a name but the document has a `<title>`
- **THEN** the title is used as the draft name

#### Scenario: Domain fallback for store name
- **WHEN** no store name is found in metadata
- **THEN** the host domain is used as the store name
