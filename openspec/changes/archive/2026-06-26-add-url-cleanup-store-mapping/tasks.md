## 1. Tracking-param cleanup helper

- [x] 1.1 Create `src/lib/url/clean-url.ts` with `cleanProductUrl(url: string): string`.
- [x] 1.2 Define the tracking-param denylist (`utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`, `gclid`, `fbclid`, `msclkid`, `dclid`, `mc_eid`, and related click IDs).
- [x] 1.3 Parse with the WHATWG `URL` API, delete denylisted params via `searchParams`, preserve all other params, path, host, and fragment.
- [x] 1.4 Return the original input unchanged for no-query and malformed-input cases (try/catch, no throw).
- [x] 1.5 Add `src/lib/url/clean-url.test.ts` covering: strip UTM, strip click IDs, preserve unknown params, preserve path/host/fragment, no-query no-op, malformed input.

## 2. Store display-name mapping

- [x] 2.1 Create `src/config/store-display-names.ts` exporting a domain → friendly-name map.
- [x] 2.2 Add Peru/LatAm store mappings.
- [x] 2.3 Add international store mappings (e.g. Amazon, eBay, AliExpress).
- [x] 2.4 Add `resolveStoreDisplayName(url)` to `src/lib/format/strings.ts`: normalize host (lowercase, strip `www.`), look up the map, fall back to `formatStoreDomain` for unknown stores, return empty string for empty/malformed input.
- [x] 2.5 Extend `src/lib/format/strings.test.ts` covering: known store, `www.`/subdomain normalization, unknown-store clean-domain fallback, Peru/LatAm entry, international entry, empty/malformed input.

## 3. Validation

- [x] 3.1 Run `pnpm test` (cleanup + mapping suites green).
- [x] 3.2 Run `pnpm check` and `pnpm typecheck`.
