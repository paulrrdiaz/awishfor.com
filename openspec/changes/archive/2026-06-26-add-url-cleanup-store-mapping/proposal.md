## Why

Product URLs pasted by owners are noisy: they carry tracking params (UTM, click IDs) that bloat the stored link, leak campaign data, and make links look untrustworthy on the public page. Store names derived from a raw domain (e.g. `falabella.com`) read worse than a curated brand name (e.g. `Falabella`). This is the explicit follow-on (`task 4.2`) deferred out of the URL importer change.

## What Changes

- Add a tracking-param cleanup helper that strips known UTM/click-ID params from a product URL while preserving unknown (potentially meaningful) params and the rest of the URL untouched.
- Add a store display-name mapping that resolves a known domain to a curated friendly brand name, covering Peru/LatAm and international stores, and falls back to the clean domain for unknown stores.
- Keep both helpers pure and framework-agnostic so the importer, gift-management, and the public page can all reuse them.

Non-goals:

- No affiliate-link rewriting or param injection.
- No network calls — these are pure string/URL transforms.
- No schema/migration changes; storage continues to use existing `Gift.productUrl` / `Gift.storeName`.

## Capabilities

### New Capabilities
- `url-cleanup`: Pure helpers that strip known tracking params from a product URL (preserving unknown params) and map a store domain to a curated friendly display name with a clean-domain fallback.

### Modified Capabilities
<!-- None — formatting-helpers' formatStoreDomain is consumed as the fallback but its requirements do not change. -->

## Impact

- New code:
  - `src/lib/url/clean-url.ts` — tracking-param cleanup helper (+ `*.test.ts`).
  - `src/config/store-display-names.ts` — domain → friendly-name map (Peru/LatAm + international).
  - `src/lib/format/strings.ts` — add `resolveStoreDisplayName` building on existing `formatStoreDomain` (+ tests).
- Consumes existing `formatStoreDomain` (formatting-helpers) as the unknown-store fallback.
- No env vars. No DB changes. Callers (importer / gift create-edit) adopt the helpers in their own flows.
