## Context

`extractJsonLd` in `src/server/services/importer.service.ts` walks parsed `ld+json` blocks via `findJsonLdProducts`, which only matches `obj["@type"] === "Product"` at top level or inside `@graph`. Shopify (and other variant-based catalogs) instead emit:

```json
{
  "@type": "ProductGroup",
  "hasVariant": [
    { "@type": "Product", "@id": ".../products/x?variant=46836689895724#variant",
      "offers": { "@type": "Offer", "price": "244.30", "priceCurrency": "PEN", "url": ".../products/x?variant=46836689895724" } },
    { "@type": "Product", "@id": ".../products/x?variant=50394283770156#variant",
      "offers": { "@type": "Offer", "price": "279.20", "priceCurrency": "PEN", "url": ".../products/x?variant=50394283770156" } }
  ]
}
```

Each variant carries a different price, so picking "the first variant" silently returns the wrong price when the submitted URL pins a specific `?variant=<id>`. Confirmed live: Infanti chair page, `variant=50394283770156` (Pink, out of stock) = PEN 279.20 vs `variant=46836689895724` (Blue) = PEN 244.30.

Separately, the same page carries `og:price:amount` / `og:price:currency` meta tags that `extractOpenGraph` currently ignores — a zero-risk fallback source for stores that skip JSON-LD entirely or omit `offers`.

## Goals / Non-Goals

**Goals:**
- Resolve correct variant-specific price from JSON-LD `ProductGroup` when the submitted URL carries a `variant` query param.
- Fall back sensibly (first variant with a price) when no `variant` param is present or none match.
- Support `AggregateOffer` (`lowPrice`/`price` instead of a single `Offer.price`) as a JSON-LD price source.
- Read `og:price:amount`/`og:price:currency` as an Open Graph price source.
- Keep existing priority chain (JSON-LD > OG > Twitter > title/domain) and existing `ImportedGiftDraft` shape unchanged — this only fills previously-blank fields.

**Non-Goals:**
- No headless-browser rendering / JS execution for stores that inject price client-side only (out of scope; HTML-only parsing stays the constraint).
- No currency conversion or normalization beyond what the source already provides.
- No UI changes to the import form — this is extraction-logic only.
- No change to safety/fetch hardening (redirects, timeouts, SSRF guards) — untouched.

## Decisions

**Variant matching strategy**: extract the `variant` query param from the *final* URL (post-redirect) using `URL`/`URLSearchParams`, then scan `hasVariant` entries for one whose `@id` or `offers.url` contains that id as a substring/query match. Rationale: Shopify's `@id`/`offers.url` embed the variant id directly (`?variant=<id>#variant`), so string containment is reliable and avoids over-engineering a generic ID-matching scheme. If no `variant` param exists or no entry matches, fall back to the first `hasVariant` entry that resolves a price — better to show *a* price than none, consistent with existing best-effort philosophy (`ImportedGiftDraft` already tolerates partial data).

Rejected alternative: always take the cheapest/first variant regardless of URL param — rejected because it can silently show the wrong variant's price (e.g., showing Blue's 244.30 when the user linked the out-of-stock Pink at 279.20), which is worse than a blank field since it's confidently wrong.

**`ProductGroup` detection**: extend `findJsonLdProducts` (or a sibling helper) to recognize `@type === "ProductGroup"` and flatten `hasVariant` into candidate product objects, reusing the existing per-product `name`/`image`/`offers` extraction so `Offer` and `AggregateOffer` parsing logic isn't duplicated per variant.

**`AggregateOffer` support**: when `offers["@type"] === "AggregateOffer"`, read `price` if present, else `lowPrice`. Rationale: `lowPrice` is the schema.org-correct field for a range; using the low end is the conservative/best-effort choice consistent with "show something over nothing."

**OG price tags**: add `og:price:amount` → `priceAmount` (via `Number(...)`, discard `NaN`) and `og:price:currency` → `priceCurrency` in `extractOpenGraph`, mirroring the existing `og:title`/`og:image`/`og:site_name` pattern (first-match-wins, no overwrite).

## Risks / Trade-offs

- [Risk] Substring match on `@id`/`offers.url` could theoretically false-positive if a shorter variant id is a substring of a longer one → Mitigation: variant ids observed are long numeric Shopify IDs (16 digits), collision probability negligible; match against the full `?variant=<id>` query segment, not a bare substring, to reduce risk further.
- [Risk] Some stores' `ProductGroup` may omit `hasVariant` or nest differently → Mitigation: existing merge/fallback chain (OG, Twitter, title, domain) still applies if JSON-LD yields nothing; no regression versus current behavior, only additive.
- [Trade-off] Not handling JS-rendered prices (client-side hydration) — accepted, matches existing HTML-only fetch model and keeps fetch cheap/fast (5s timeout, 2MB cap already in place).

## Open Questions

None — scope confirmed against a live repro URL; no ambiguity blocking implementation.
