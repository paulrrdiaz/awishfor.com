## 1. Public wishlist service (`src/server/services/public-wishlist.service.ts`)

- [x] 1.1 Define the `PublicWishlistResult` discriminated union (`published` | `preview` with a `PublicWishlistViewModel`; `archived` with a minimal inactive-state payload; `notFound`) and the `PublicArchivedViewModel` type
- [x] 1.2 Define a narrow `PublicWishlistDatabase` port (structural type) exposing the single `wishlist.findUnique` with the categories/gifts/purchases include and `owner: { select: { clerkId: true } }`, mirroring the `WishlistDatabase` pattern
- [x] 1.3 Implement `getPublicWishlistBySlug(db, { slug, viewerClerkId })`: load by slug; `published` → map via `mapPublicWishlist`; `archived` → archived payload (no gift list); `draft` → `preview` only when `owner.clerkId === viewerClerkId`, else `notFound`; no row → `notFound`
- [x] 1.4 Delegate all gift/visibility/progress to `mapPublicWishlist` (do not recompute or expose hidden/soft-deleted gifts, guest contact data, or internal notes)
- [x] 1.5 Add unit tests: published → published; draft + matching viewer → preview; draft + non-owner/signed-out → notFound; archived → archived (no gifts); unknown slug → notFound; hidden gift excluded; soft-deleted gift excluded

## 2. Public route and metadata (`src/app/w/[slug]/page.tsx`)

- [x] 2.1 Add the `/w/[slug]` route; read `viewerClerkId` from Clerk `auth()` and call `getPublicWishlistBySlug` with the real `db`
- [x] 2.2 Switch on the result: render published; render preview with a not-yet-public banner; render the archived message state; call `notFound()` for the not-found result
- [x] 2.3 Implement `generateMetadata` deriving title/description from the resolved wishlist and returning `robots: { index: false, follow: false }` for all `/w/[slug]` responses
- [x] 2.4 Add `/w/[slug]` to the public-route matcher in `src/proxy.ts`

## 3. Public theme and layout config (`src/config/`)

- [x] 3.1 Add `public-themes.ts`: six theme presets keyed by id, each exposing scoped CSS variables, plus `resolveTheme(id)` with a default fallback for null/unknown ids
- [x] 3.2 Add `public-layouts.ts`: three layout presets keyed by id plus `resolveLayout(id)` with a default fallback
- [x] 3.3 Add `public-fonts.ts`: font pairings wired through `next/font`, exposed as CSS variables, plus `resolveFontPairing(id)` with a default fallback
- [x] 3.4 Add `public-button-styles.ts`: button-style presets (no square style) plus `resolveButtonStyle(id)` with a default fallback
- [x] 3.5 Ensure theme CSS variables are scoped to a public page wrapper (never `:root`) so the dashboard theme is unaffected

## 4. Validation

- [x] 4.1 Run `pnpm check`, `pnpm test`, and `pnpm typecheck` and resolve any failures
