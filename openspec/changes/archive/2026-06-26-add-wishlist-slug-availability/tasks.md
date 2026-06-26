## 1. Slug helper (`src/lib/slug.ts`)

- [x] 1.1 Export `wishlistSlugPattern` from `src/server/validators/wishlist.schema.ts` so the helper reuses a single source of truth
- [x] 1.2 Implement `slugify(title: string): string | null` — NFKD-normalize, strip diacritics, lowercase, collapse non-alphanumeric runs to single hyphens, trim leading/trailing hyphens; return `null` when fewer than 3 usable characters
- [x] 1.3 Implement `isValidSlug(slug: string): boolean` using the shared pattern
- [x] 1.4 Add unit tests for `slugify` (accents, ampersands, short titles → null) and `isValidSlug` (valid + each invalid rule)

## 2. Availability service (`src/server/services/slug.service.ts`)

- [x] 2.1 Define a narrow `SlugDatabase` port (structural typing over a wishlist `findFirst` delegate) mirroring `WishlistDatabase`
- [x] 2.2 Implement `checkSlugAvailability(db, { slug, excludeWishlistId? })` returning `{ available: boolean; reason?: "invalid" | "taken" }`
- [x] 2.3 Short-circuit to `{ available: false, reason: "invalid" }` when the slug fails format validation, before any DB query
- [x] 2.4 Apply `excludeWishlistId` as `NOT: { id: excludeWishlistId }` so the owner's current slug reads as available
- [x] 2.5 Add unit tests: unused → available, taken by other → unavailable, taken by self (excluded) → available, invalid → invalid reason

## 3. Validation schema (`src/server/validators/wishlist.schema.ts`)

- [x] 3.1 Add `checkSlugAvailabilitySchema` ({ slug: reuse `wishlistSlugSchema`, excludeWishlistId: optional `wishlistIdSchema` }) and export its inferred input type

## 4. tRPC endpoint

- [x] 4.1 Add/confirm `src/server/api/routers/wishlist.ts` and register it in `src/server/api/root.ts`
- [x] 4.2 Add `checkSlugAvailability` as a `protectedProcedure` query that validates input and calls the availability service with `ctx.db`

## 5. Validation

- [x] 5.1 Run `pnpm check`, `pnpm test`, and `pnpm typecheck` and resolve any failures
