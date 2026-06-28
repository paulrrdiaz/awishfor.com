## Context

A production code review identified 12 confirmed bugs across correctness, security, and reliability. The issues span the purchase service (race condition, dead code, non-transactional delete), wishlist service (missing ownership checks, inconsistent filtering), HTTP layer (no security headers), test infra (broken env import), validators (missing protocol checks), image config (missing UploadThing domain), and the share utility (hardcoded origin).

All fixes are surgical and isolated to their respective files — no schema changes, no new dependencies (except one env var), no frontend rework.

## Goals / Non-Goals

**Goals:**
- Eliminate the TOCTOU race in all three purchase creation paths
- Add `ownerId` enforcement to `archiveWishlist` and `restoreWishlist`
- Emit HTTP security headers from `next.config.ts`
- Fix the `wishlist.test.ts` suite so 0 tests don't silently pass
- Restrict `productUrl` / `imageUrl` to `http`/`https` schemes
- Add UploadThing hostname to `next.config.ts` image remotePatterns
- Exclude archived wishlists from `summaryList` to match `list`
- Replace hardcoded `awishfor.com` origin with `NEXT_PUBLIC_APP_URL` env var
- Wrap `deleteOwnerPurchase` in a transaction and map P2025 to `NOT_FOUND`
- Remove dead `createPurchase` export
- Log a warning when `user.deleted` webhook event carries no `clerkId`

**Non-Goals:**
- Application-level rate limiting on public purchase endpoints (infrastructure concern)
- DNS rebinding mitigation for URL importer (network/egress policy concern)
- Timing-safe comparison for undo token verification (not a practical threat for this threat model)
- Content Security Policy (requires separate audit of all inline scripts and styles)
- Any Prisma schema changes or new migrations

## Decisions

### 1. TOCTOU fix: `$transaction` wrapping purchase creation

Wrap the entire `getRemainingQuantity` check + `db.purchase.create` call in a `db.$transaction` callback for all three functions: `createPurchase`, `markGiftPurchasedPublic`, and `createOwnerManualPurchase`.

**Why**: Prisma interactive transactions in Postgres use `SERIALIZABLE` isolation by default, serializing concurrent writes to the same rows. Two concurrent transactions that read the same `_sum` and then try to insert will serialize — the second will re-read the sum after the first commits and correctly see the updated total.

**Alternative rejected**: Database-level `CHECK` constraint on quantity sum. This would be more robust but requires a migration and a PostgreSQL function (aggregation constraints can't be expressed as simple column checks). Overkill for this scale.

**Alternative rejected**: Optimistic concurrency via a `version` counter on the `Gift` row. Requires schema change and retry logic in the caller.

### 2. Ownership guard on `archiveWishlist` / `restoreWishlist`

Add `ownerId: number` to both service function signatures. Before the `update`, add a `db.wishlist.findFirst({ where: { id: wishlistId, ownerId } })` guard, throwing `UNAUTHORIZED` if the wishlist is not found for that owner. Mirror the pattern used in `publishWishlist`.

**Why**: These functions are exported from the service module. As soon as a tRPC procedure calls them (which the existing schema types anticipate), any authenticated user can mutate any wishlist. The guard must live at the service layer, not only the router.

### 3. Security headers: `headers()` in `next.config.ts`

Add a `headers()` async function that returns a single catch-all `source: '/(.*)'` rule with:
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`

**Why not CSP**: CSP requires a separate audit of all inline scripts, GSAP CDN usage, and shadcn/radix components. Adding a restrictive CSP without that audit would break the app. Ship basic headers now; CSP in a dedicated follow-up.

### 4. Vitest env fix: `setupFiles` with `SKIP_ENV_VALIDATION`

Add `vitest.setup.ts` that sets `process.env.SKIP_ENV_VALIDATION = "true"` before any module is loaded. Reference it in `vitest.config.ts` under `test.setupFiles`.

**Why**: The `wishlist.test.ts` imports `wishlistRouter` → `@/server/api/trpc` → `@/server/db` → `@/env.ts`. The `createEnv` call validates environment variables at module evaluation time. Setting `SKIP_ENV_VALIDATION` is the prescribed escape hatch from `@t3-oss/env-nextjs`.

**Alternative rejected**: Mock `@/env.ts` in the test file. This works but requires each affected test file to repeat the mock. The `setupFiles` approach fixes it globally for all test files.

### 5. URL protocol restriction in validators

In `gift.schema.ts`, change `productUrl` and `imageUrl` from `z.string().url().optional()` to `z.string().url().refine(val => val.startsWith('https://') || val.startsWith('http://'), 'URL must use http or https').optional()` — or equivalently use `z.url()` combined with `.refine()`.

Same change in `importer.schema.ts` for the input `url` field.

**Why**: React does not sanitize `href` for `javascript:` URIs in all contexts. Blocking at the validator boundary prevents storage of unsafe URLs regardless of rendering context.

### 6. UploadThing in `remotePatterns`

Add `{ protocol: "https", hostname: "utfs.io" }` to `images.remotePatterns` in `next.config.ts`. UploadThing serves files from `utfs.io`.

### 7. `summaryList` excludes archived

Add `status: { not: WishlistStatus.archived }` to the `findMany` in `wishlistRouter.summaryList`. This matches `list` behavior and prevents unbounded growth on the summary query.

### 8. `PUBLIC_WISHLIST_ORIGIN` → `NEXT_PUBLIC_APP_URL` env var

Add `NEXT_PUBLIC_APP_URL: z.string().url()` to `src/env.ts` client block. Add `NEXT_PUBLIC_APP_URL=http://localhost:4000` to `.env.example`. Replace the hardcoded string in `src/lib/wishlist/share.ts` with `env.NEXT_PUBLIC_APP_URL`.

**Why**: Share URLs generated during local development or in staging environments currently point to the production domain. This breaks QR codes, WhatsApp links, and any preview share in non-prod environments.

### 9. `deleteOwnerPurchase`: transaction + P2025 handling

Wrap the find-purchase → find-gift-for-auth → delete-purchase sequence in a `$transaction`. Add a try/catch around the delete that maps `PrismaClientKnownRequestError` with code `P2025` to `TRPCError({ code: "NOT_FOUND" })`.

**Why**: Without a transaction, a concurrent delete between the auth check and the actual delete emits an unhandled Prisma error surfaced as a 500. The transaction serializes the delete and the catch converts the edge-case error to a user-facing shape.

**Note**: `PurchaseDatabase` (and its sub-types) must expose `$transaction` for this to work inside the service. Alternatively, run the find+delete in the router where `ctx.db.$transaction` is available. Given the service already uses typed database ports, the simplest fix is to perform both queries inside a single Prisma `$transaction` callback passed the real `db` at the router call site, or to upgrade `OwnerPurchaseDatabase` to include `$transaction`.

### 10. Dead code: remove `createPurchase`

Delete the `createPurchase` function from `purchase.service.ts`. It is not called anywhere in the router or any other service. The public purchase flow uses `markGiftPurchasedPublic` instead.

### 11. Webhook: log missing `clerkId`

Replace the silent `if (clerkId)` guard with a branch that logs a `console.warn` when `clerkId` is falsy.

## Risks / Trade-offs

- **Transaction overhead**: Wrapping purchase creation in a `$transaction` adds a round-trip to start the transaction. For a low-concurrency app this is negligible; at scale a queue-based approach is more robust.
- **`SKIP_ENV_VALIDATION` in tests**: All test files now skip env validation. A misconfigured env will not be caught in tests. Acceptable trade-off since the test environment intentionally does not have real secrets.
- **`NEXT_PUBLIC_APP_URL` must be set in Vercel/production**: Forgetting to set this env var will cause `createEnv` to throw at startup. Adding it to `.env.example` and the proposal's Impact section makes it visible.
- **UploadThing hostname `utfs.io` is not versioned**: If UploadThing changes CDN domains, images will break again. This is an external dependency risk.
