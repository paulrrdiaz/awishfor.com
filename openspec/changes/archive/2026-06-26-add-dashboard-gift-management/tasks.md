## 1. Service layer

- [x] 1.1 Add `listDashboardGifts(db, { ownerId, wishlistId })` to `gift.service.ts`: verify wishlist ownership, return non-deleted gifts (including hidden) with `include: { purchases: true }`, ordered by `sortOrder, createdAt`.
- [x] 1.2 Add an owner-authorization helper (`assertGiftOwner` / `getOwnedGift`) resolving a gift through its wishlist `ownerId`, throwing `NOT_FOUND` for missing or non-owned gifts.
- [x] 1.3 Add a pure grouping helper `groupDashboardGifts(rows)` returning `{ available, purchased, hidden }` per spec rules (hidden → hidden; else `remainingQuantity === 0` → purchased; else available).
- [x] 1.4 Add unit tests for `listDashboardGifts` ownership/filter behavior and for `groupDashboardGifts` bucket rules.

## 2. tRPC router

- [x] 2.1 Create `src/server/api/routers/gift.ts` with `getLocalUserId` (mirroring `category.ts`).
- [x] 2.2 Add `list` query (input wishlistId): authorize owner, call `listDashboardGifts`, map via `mapDashboardGift`, return grouped view models.
- [x] 2.3 Add `update` mutation using `updateGiftSchema`: authorize gift owner, call `updateGift`.
- [x] 2.4 Add `setVisibility` mutation (input giftId + visibilityStatus): authorize gift owner, toggle visibility via `updateGift`.
- [x] 2.5 Add `delete` mutation using `deleteGiftSchema`: authorize gift owner, call `softDeleteGift`.
- [x] 2.6 Register `gift: giftRouter` in `src/server/api/root.ts`.

## 3. UI primitives

- [x] 3.1 Add shadcn `badge` component (`base-nova`, neutral).
- [x] 3.2 Add shadcn `alert-dialog` component for delete confirmation.

## 4. Dashboard gifts page & components

- [x] 4.1 Create `src/app/(protected)/dashboard/wishlists/[id]/gifts/page.tsx` (RSC) fetching grouped gifts via `@/trpc/server`; handle empty and not-found/not-owner states.
- [x] 4.2 Create `src/components/features/dashboard/gifts/gift-group.tsx` rendering a labeled section (available/partial, purchased, hidden) with its gift rows.
- [x] 4.3 Create `src/components/features/dashboard/gifts/gift-row.tsx` showing name, image, price, quantity progress (purchased/needed), priority + visibility badges.
- [x] 4.4 Create `src/components/features/dashboard/gifts/gift-status-badges.tsx` mapping priority/visibility/purchase state to badge variants (hidden badge included).
- [x] 4.5 Create `src/components/features/dashboard/gifts/gift-row-actions.tsx` (client) with edit entry, hide/unhide toggle, and delete trigger using `@/trpc/react` mutations + refresh/invalidate.
- [x] 4.6 Create `src/components/features/dashboard/gifts/delete-gift-dialog.tsx` (client) using `alert-dialog`; show stronger warning when `purchasedQuantity > 0`.
- [x] 4.7 Wire the edit action to the existing wizard `gift-form` (dialog reuse) submitting the `gift.update` mutation.

## 5. Validation

- [x] 5.1 Run `pnpm check`, `pnpm test`, and `pnpm typecheck`; fix any failures.
- [x] 5.2 Manually verify owner sees grouped gifts; hide/unhide moves a gift between groups; delete with purchases shows the stronger warning and removes the gift.
