## 1. Env & Config

- [x] 1.1 Add `NEXT_PUBLIC_APP_URL: z.string().url()` to the client block in `src/env.ts` and add `NEXT_PUBLIC_APP_URL=http://localhost:4000` to `.env.example`
- [x] 1.2 Add UploadThing hostname to `next.config.ts` `images.remotePatterns`: `{ protocol: "https", hostname: "utfs.io" }`
- [x] 1.3 Add HTTP security headers to `next.config.ts` via an async `headers()` function: `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy: camera=(), microphone=(), geolocation=()`

## 2. Test Infrastructure

- [x] 2.1 Create `vitest.setup.ts` at project root that sets `process.env.SKIP_ENV_VALIDATION = "true"` before any module evaluation
- [x] 2.2 Add `test.setupFiles: ["./vitest.setup.ts"]` to `vitest.config.ts`
- [x] 2.3 Run `pnpm test` and confirm `wishlist.test.ts` suite now executes (all previously-passing 463 tests still pass)

## 3. Share URL Origin

- [x] 3.1 Replace the hardcoded `PUBLIC_WISHLIST_ORIGIN = "https://awishfor.com"` in `src/lib/wishlist/share.ts` with `env.NEXT_PUBLIC_APP_URL` imported from `@/env`

## 4. Purchase Service — Race Condition & Dead Code

- [x] 4.1 Remove the `createPurchase` export from `src/server/services/purchase.service.ts`
- [x] 4.2 Wrap the `getRemainingQuantity` check + `db.purchase.create` in `markGiftPurchasedPublic` inside a `db.$transaction` callback so the read and write are atomic
- [x] 4.3 Wrap the same check + create in `createOwnerManualPurchase` inside a `db.$transaction` callback
- [x] 4.4 Update `PublicPurchaseDatabase` and `OwnerPurchaseDatabase` types to include a `$transaction` method if not already present, to allow transaction usage inside the service

## 5. Purchase Service — `deleteOwnerPurchase`

- [x] 5.1 Add `$transaction` to `OwnerPurchaseDatabase` type (if not done in 4.4)
- [x] 5.2 Wrap the find-purchase → find-gift → delete-purchase flow in `deleteOwnerPurchase` inside a single `$transaction`
- [x] 5.3 Catch `PrismaClientKnownRequestError` with code `P2025` in the delete step and re-throw as `TRPCError({ code: "NOT_FOUND" })`

## 6. Wishlist Service — Ownership Guards

- [x] 6.1 Add `ownerId: number` parameter to `archiveWishlist` in `src/server/services/wishlist.service.ts`; add a `findFirst({ where: { id: wishlistId, ownerId } })` guard before the update and throw `TRPCError({ code: "UNAUTHORIZED" })` if not found
- [x] 6.2 Add `ownerId: number` parameter to `restoreWishlist` in the same file; apply the same ownership guard before the update

## 7. Wishlist Router — `summaryList` Filter

- [x] 7.1 Add `status: { not: WishlistStatus.archived }` to the `findMany` where clause in `wishlistRouter.summaryList` in `src/server/api/routers/wishlist.ts`

## 8. Webhook — Missing clerkId Warning

- [x] 8.1 In `src/app/api/webhooks/clerk/route.ts`, replace the silent `if (clerkId) { ... }` guard with a branch that calls `console.warn("user.deleted event received without clerkId")` when `clerkId` is falsy

## 9. Validators — URL Protocol Restrictions

- [x] 9.1 In `src/server/validators/gift.schema.ts`, add an `http`/`https` protocol `.refine()` to the `productUrl` and `imageUrl` fields (wherever they are defined as optional URL strings)
- [x] 9.2 In `src/server/validators/importer.schema.ts`, add the same `http`/`https` protocol `.refine()` to the `url` input field
- [x] 9.3 Update any tests in `gift.schema.test.ts` and `importer.schema.test.ts` that test URL validation to cover `javascript:` and `data:` rejection cases

## 10. Validation

- [x] 10.1 Run `pnpm check` and fix any Biome lint or format issues
- [x] 10.2 Run `pnpm test` and confirm all suites pass including `wishlist.test.ts`
- [x] 10.3 Run `pnpm typecheck` and confirm zero TypeScript errors
