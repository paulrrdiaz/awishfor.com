## 1. Value computation

- [x] 1.1 Make `isVisibleAndNotDeleted` reusable (export it from `dashboard-wishlist.mapper.ts` or colocate the new helper) without changing its behavior
- [x] 1.2 Add `computeApproxGiftValue(gifts, wishlistCurrency)` in `src/server/mappers/gift-value.ts`: filter to visible and non-deleted gifts, resolve currency (`priceCurrency ?? wishlistCurrency`), use integer-cent sums, cap units at `quantityNeeded`, return `{ receivedAmount, goalAmount, pricedGiftCount, visibleGiftCount, foreignReceived }` with fixed two-decimal strings and `foreignReceived` sorted by currency, keeping only amounts greater than 0
- [x] 1.3 Add `src/server/mappers/gift-value.test.ts` covering these cases: basic received/goal, over-purchase cap, hidden/deleted exclusion, manual purchase included, null currency, 0.10+0.20+0.30 = "0.60", partial and full coverage, no gifts, single and multiple foreign currencies, unpurchased foreign gift, foreign-only

## 2. View model and mapping

- [x] 2.1 Add `currency` and `approxValue` to `DashboardWishlistOverviewViewModel` in `src/server/mappers/view-models.ts`
- [x] 2.2 Populate both fields in `mapDashboardWishlistOverview` for owners and collaborators alike
- [x] 2.3 Extend `dashboard-wishlist.mapper.test.ts` to assert that `currency` and `approxValue` are present for both `isOwner: true` and `false`, and that the public wishlist view model has no value fields
- [x] 2.4 Update any fixtures or test doubles that construct `DashboardWishlistOverviewViewModel` (e.g. `page.test.tsx`, story data) so typecheck passes

## 3. UI

- [x] 3.1 Add `ApproxValuePanel` to `src/components/features/dashboard/overview/progress-panels.tsx`, with a filled state (received de goal, bar, coverage line when priced < visible), a foreign footnote, and an empty state with no zero amount, formatting through `formatMoney`
- [x] 3.2 Render `ApproxValuePanel` in `src/app/(protected)/dashboard/wishlists/[id]/page.tsx` between `PurchaseProgressPanel` and `InvitationProgressPanel`
- [x] 3.3 Extend `progress-panels.test.tsx` to cover the filled, coverage note, foreign footnote, empty, and foreign-only empty states

## 4. Verification

- [x] 4.1 Run `pnpm check`, `pnpm test`, and `pnpm typecheck`, and fix or report any failures
- [x] 4.2 Sync the matching items in `docs/TASKS.md`, if any exist
