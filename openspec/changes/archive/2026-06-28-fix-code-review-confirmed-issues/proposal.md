## Why

A production code review identified confirmed correctness, security, and reliability bugs spanning the purchase flow, authorization layer, HTTP security posture, test infrastructure, and image configuration. These must be resolved before the app handles real users and real money.

## What Changes

- **Fix TOCTOU race condition** in `createPurchase`, `markGiftPurchasedPublic`, and `createOwnerManualPurchase`: wrap the quantity-check + create step in a single Prisma `$transaction` to prevent concurrent over-purchasing.
- **Add ownership guard** to `archiveWishlist` and `restoreWishlist` service functions: accept `ownerId` and filter by it, preventing IDOR when these are eventually exposed via the router.
- **Add HTTP security headers** in `next.config.ts`: `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`.
- **Fix broken `wishlist.test.ts` suite**: add `SKIP_ENV_VALIDATION=true` to the Vitest setup so the env import no longer throws and the 0-test-run suite executes.
- **Restrict `productUrl` and `imageUrl` to http/https** in gift and importer validators to prevent `javascript:` or `data:` URIs being stored as link/image sources.
- **Add UploadThing hostname** to `next.config.ts` `images.remotePatterns` so cover and gift images render via `next/image`.
- **Fix `summaryList` to exclude archived wishlists** matching the behaviour of `list`.
- **Move hardcoded `PUBLIC_WISHLIST_ORIGIN`** to `NEXT_PUBLIC_APP_URL` env var with a local fallback.
- **Wrap `deleteOwnerPurchase`** in a transaction and handle the P2025 Prisma error as a clean `NOT_FOUND`.
- **Remove dead `createPurchase`** function from `purchase.service.ts`.
- **Log warning in `user.deleted` webhook** when `clerkId` is missing instead of silently no-oping.

## Capabilities

### New Capabilities

- `http-security-headers`: Security response headers applied globally via Next.js config (X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy).

### Modified Capabilities

- `purchase-management`: Race condition fix — quantity check and purchase creation are now atomic per gift. `deleteOwnerPurchase` is transactional. Dead `createPurchase` export removed.
- `wishlist-lifecycle`: `archiveWishlist` and `restoreWishlist` now require and enforce `ownerId`. `summaryList` excludes archived wishlists.
- `user-data-sync`: `user.deleted` webhook logs a warning when the Clerk event carries no `id`.
- `url-import`: `productUrl` and `imageUrl` fields validated to `http`/`https` only.
- `image-upload`: UploadThing hostname added to `next.config.ts` `remotePatterns`.
- `wishlist-settings`: `PUBLIC_WISHLIST_ORIGIN` moved to `NEXT_PUBLIC_APP_URL` env var.

## Impact

- **`src/server/services/purchase.service.ts`**: transaction wrapping, dead-code removal, P2025 error handling.
- **`src/server/services/wishlist.service.ts`**: `archiveWishlist`/`restoreWishlist` signature change (adds `ownerId`), `summaryList` query change.
- **`src/server/api/routers/wishlist.ts`**: `summaryList` query filter.
- **`src/app/api/webhooks/clerk/route.ts`**: missing-id warning log.
- **`src/server/validators/gift.schema.ts`** / **`src/server/validators/importer.schema.ts`**: URL protocol restrictions.
- **`src/lib/wishlist/share.ts`**: replace hardcoded string with env var.
- **`src/env.ts`** + **`.env.example`**: add `NEXT_PUBLIC_APP_URL`.
- **`next.config.ts`**: security headers + UploadThing remotePattern.
- **`vitest.config.ts`** (or new `vitest.setup.ts`): env validation bypass for tests.
- **Breaking** (internal): callers of `archiveWishlist`/`restoreWishlist` must pass `ownerId` — currently no callers exist in the router, so no external breakage.
