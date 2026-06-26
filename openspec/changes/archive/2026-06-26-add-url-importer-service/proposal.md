## Why

Adding gifts by hand is slow and error-prone: owners must copy a name, price, image, and store from a product page into the wizard. A server-side URL importer lets them paste a product link and get a pre-filled gift draft, while manual entry always remains available as a fallback.

## What Changes

- Add a server-side importer that fetches a product URL and extracts a best-effort `ImportedGiftDraft` (name, image, price, currency, store name).
- Add URL safety validation: reject non-`http(s)` URLs and block private/internal hosts (localhost, loopback, link-local, RFC-1918, metadata endpoints) to prevent SSRF.
- Harden fetching: timeout via `AbortController`, cap redirects at 5, cap HTML body at 2MB, and re-validate the final URL after redirects.
- Extract metadata with a priority chain: JSON-LD `Product` → Open Graph → Twitter Card → HTML `<title>`, with a domain-name fallback for the store name.
- Expose the importer through a `protectedProcedure` tRPC endpoint with input validation.
- Always return a usable draft (even sparse) so the wizard/dashboard can fall back to manual editing; surface a friendly error state on timeout/failure.

Non-goals:

- No JavaScript execution; no headless browser (Puppeteer/Playwright).
- No persistence — the importer returns a draft only; saving the gift is out of scope (handled by existing gift-management).
- No tracking-param cleanup or store display-name mapping (that is task 4.2).
- No rate limiting (that is the dedicated abuse-protection milestone).

## Capabilities

### New Capabilities
- `url-import`: Server-side fetching and parsing of a product URL into a structured gift draft, including SSRF-safe URL validation, hardened fetch limits, a metadata extraction priority chain, and a tRPC entry point.

### Modified Capabilities
<!-- None — gift-management consumes the draft but its requirements do not change in this proposal. -->

## Impact

- New code:
  - `src/server/services/importer.service.ts` — fetch + parse pipeline, URL safety, `ImportedGiftDraft`.
  - `src/server/api/routers/importer.ts` — `protectedProcedure` endpoint.
  - `src/server/validators/importer.schema.ts` — input/URL validation.
  - Tests alongside each (`*.test.ts`) plus HTML fixtures.
- `src/server/api/root.ts` — register the new `importer` router.
- Maps extracted fields onto existing `Gift` columns (`name`, `productUrl`, `imageUrl`, `storeName`, `priceAmount`, `priceCurrency`).
- No schema/migration changes. No new env vars expected (timeout/limit constants live in code).
