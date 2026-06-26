## Context

Owners paste product URLs that carry tracking params and yield ugly store names. The URL importer change (`add-url-importer-service`) explicitly deferred this work as `task 4.2`. The repo already has `formatStoreDomain(url)` in `src/lib/format/strings.ts` (cleans `www.` off a host) and stores links/names on `Gift.productUrl` / `Gift.storeName`. There is no `src/lib/url/` dir or `src/config/store-display-names.ts` yet. Helpers must be pure (no network, no framework) so the importer, gift create/edit, and the public page can share them.

## Goals / Non-Goals

**Goals:**
- A `cleanProductUrl(url)` helper that strips a curated list of tracking params and preserves everything else.
- A `resolveStoreDisplayName(url)` helper that maps known domains to friendly names and falls back to the clean domain.
- A maintainable domain→name config covering Peru/LatAm and international stores.
- Full unit-test coverage of both helpers and the config fallback.

**Non-Goals:**
- Affiliate-link rewriting or param injection.
- Network calls, redirect-following, or canonicalization beyond param stripping.
- Wiring helpers into UI/importer callers (adopted by those flows separately).

## Decisions

- **Denylist, not allowlist, for tracking params.** Strip a known set (`utm_*`, `gclid`, `fbclid`, `msclkid`, `dclid`, `mc_eid`, etc.) and preserve everything else. Rationale: product params (`variant`, `size`, `color`, `sku`) are unbounded and store-specific — an allowlist would silently break product links. Trade-off: new tracking params need a config bump, which is acceptable and low-risk (extra params are cosmetic, not breaking).
- **Use the WHATWG `URL` API** for parse + `searchParams.delete()`. Rationale: built-in, correct param/encoding handling, no dependency. Malformed input returns the original string unchanged (try/catch) so callers never get a throw.
- **Mapping keyed by registrable domain.** Normalize host by lowercasing and stripping a leading `www.`; match against the config map. Rationale: covers `www.` and most regional subdomains without per-subdomain entries. Alternative (full-host keys) rejected as noisier and harder to maintain.
- **`resolveStoreDisplayName` lives in `src/lib/format/strings.ts`** next to and reusing `formatStoreDomain` as its fallback, keeping store-name formatting in one module. The domain→name data lives in `src/config/store-display-names.ts` so adding stores is a data-only edit.
- **Helpers are independent.** Cleaning and naming are separate functions with separate inputs/outputs; callers compose them. Keeps each trivially testable and reusable.

## Risks / Trade-offs

- [Stripping a param that a store treats as functional] → Keep the denylist to well-known analytics/click IDs only; never strip ambiguous params. Covered by a "preserve unknown params" test.
- [Tracking-param landscape drifts over time] → Config is a single exported array; adding entries is a one-line change with no logic change.
- [Display-name map goes stale or has wrong casing] → Unknown/again-unknown stores fall back to the clean domain (always correct-ish); map is data-only and easy to extend. Fallback path is unit-tested.

## Migration Plan

Pure additive helpers + config; no schema, env, or runtime migration. Existing stored URLs/names are untouched; cleanup applies going forward at the call sites that adopt the helpers.

## Open Questions

- None blocking. Exact initial store list can grow over time; the spec only requires representative Peru/LatAm and international coverage plus the clean-domain fallback.
