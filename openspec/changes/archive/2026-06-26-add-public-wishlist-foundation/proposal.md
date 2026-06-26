## Why

Milestone 1 produced the data model, the public view-model mapper (`mapPublicWishlist`), and publish readiness — but there is still no public page. A published wishlist is reachable at `/w/[slug]` per the PRD, yet that route does not exist, no server service resolves a slug to a safe public view model, and there is no theme/layout config to render it. This change builds the public wishlist foundation: a slug-resolution service that enforces access rules, the `/w/[slug]` route with SEO/noindex behavior, and the hardcoded theme/layout/font/button presets the public components will consume.

## What Changes

- Add `src/server/services/public-wishlist.service.ts`: fetch a wishlist by slug with categories, gifts, and purchases, and resolve it to a discriminated result based on lifecycle status and viewer identity.
  - `published` → return the public view model via `mapPublicWishlist`.
  - `draft` → `notFound` for anyone except the owner; owner gets a `preview` result.
  - `archived` → return an `archived` result (inactive state), not the full list.
  - Unknown slug → `notFound`.
  - Soft-deleted and hidden gifts are never exposed (already enforced by the mapper; the service must not reintroduce them via counts/progress).
- Add the public route `src/app/w/[slug]/page.tsx`:
  - `generateMetadata` producing title/description from the wishlist and **`robots: noindex`** for all public wishlist pages (marketing pages stay indexable).
  - Render published wishlists, an archived message state, and an owner preview banner; call `notFound()` for the not-found result.
  - Register `/w/[slug]` as a public route in `src/proxy.ts`.
- Add public design config under `src/config/`:
  - `public-themes.ts` — six theme presets exposing scoped CSS variables (no dashboard-theme bleed).
  - `public-layouts.ts` — three layout presets.
  - `public-fonts.ts` — font pairings wired through `next/font`.
  - `public-button-styles.ts` — button style presets (no square style).
  - Resolvers that map a wishlist's `themeId`/`layoutId`/`fontPairing`/`buttonStyle` to a preset, falling back to a default when null/unknown.

Non-goals: the public layout components themselves (task 2.4), gift filters/sorting (2.5), progress display UI (2.6), the guest purchase flow (Milestone 5), any public search/discovery, locale URL prefixes, and a custom color picker.

## Capabilities

### New Capabilities
- `public-wishlist-page`: resolving a slug to a safe public result under draft/published/archived access rules (including owner draft preview), and serving it at `/w/[slug]` with noindex metadata and 404/archived/preview states.
- `public-theme-config`: hardcoded theme, layout, font-pairing, and button-style presets selectable by id with safe fallbacks and scoped CSS variables.

## Impact

- New: `src/server/services/public-wishlist.service.ts` (+ tests), `src/app/w/[slug]/page.tsx`, `src/config/public-themes.ts`, `src/config/public-layouts.ts`, `src/config/public-fonts.ts`, `src/config/public-button-styles.ts`.
- Modified: `src/proxy.ts` (add `/w/[slug]` to public routes).
- Reuses: `mapPublicWishlist` and the public view models (`src/server/mappers`), `deriveGiftPublicStatus` (`purchase.service`), Clerk `auth()` for owner identification.
- Depends on Wishlist fields `status`, `slug`, `userId`/owner relation, and the design fields (`themeId`, `layoutId`, `fontPairing`, `buttonStyle`) already in the schema.
- No env or migration changes.
