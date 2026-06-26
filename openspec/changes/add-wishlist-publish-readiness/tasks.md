## 1. Readiness evaluator (`src/lib/wishlist/publish-readiness.ts`)

- [ ] 1.1 Define the input shape (required identity fields + visible-gift signal) and the result type `{ ready: boolean; checks: {...} }`
- [ ] 1.2 Implement `evaluatePublishReadiness(input)` — title, eventType, slug (format-valid via shared validator), language, currency present, and `visibleGift` true when ≥1 gift is `available` and not soft-deleted; `ready` = AND of all checks
- [ ] 1.3 Export the result type from `src/server/validators/wishlist.schema.ts` (or re-export) for the router/UI contract
- [ ] 1.4 Add unit tests: complete → ready; each missing required field → that check false + not ready; hidden-only gifts → visibleGift false; soft-deleted-only gifts → visibleGift false; missing design settings → still ready

## 2. Gate the publish transition (`src/server/services/wishlist.service.ts`)

- [ ] 2.1 Extend the `WishlistDatabase` port to read the wishlist's required fields and count visible non-deleted gifts (or accept a readiness result from the caller)
- [ ] 2.2 In `publishWishlist`, evaluate readiness before the status update and throw a typed error carrying the failed checklist when not ready
- [ ] 2.3 Map the readiness error to a `TRPCError` at the wishlist router boundary so the checklist reaches the client (superjson-safe)
- [ ] 2.4 Update existing `publishWishlist` tests to seed a publish-ready wishlist and add a test asserting an unready wishlist is rejected with status unchanged

## 3. Validation

- [ ] 3.1 Run `pnpm check`, `pnpm test`, and `pnpm typecheck` and resolve any failures
