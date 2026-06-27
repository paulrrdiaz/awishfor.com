## Context

Purchase persistence and quantity helpers already exist in `src/server/services/purchase.service.ts`, and dashboard gift rows already expose aggregate `purchasedQuantity` and `remainingQuantity` from loaded purchase records. The current dashboard only renders those aggregates; individual purchaser details are not exposed to any owner UI, and there is no registered `purchase` tRPC router.

The purchase drawer is an authenticated owner workflow. Unlike the future public guest purchase flow, it can expose guest contact details and can undo/delete records through owner authorization instead of a token.

## Goals / Non-Goals

**Goals:**

- Let a wishlist owner inspect purchase records for a single gift from the dashboard gift row.
- Let the owner manually create a purchase record with `Registrado por el creador` as the default name.
- Enforce ownership and remaining-quantity validation on every owner purchase operation.
- Let the owner delete any purchase record for an owned gift, including the just-created manual purchase from an undo toast.
- Refresh dashboard gift grouping/progress after create/delete operations.

**Non-Goals:**

- No separate purchases page or global purchase table UI.
- No new Prisma model fields or migration.
- No guest public purchase modal, public mutation, rate limiting, or guest undo-token UI.
- No purchase history/audit log after deletion.

## Decisions

1. Add owner-specific service functions instead of overloading the guest purchase path.

   Add functions such as `listOwnerGiftPurchases`, `createOwnerManualPurchase`, and `deleteOwnerPurchase` to `purchase.service.ts`. Each function verifies that the target gift/purchase belongs to a wishlist owned by the local authenticated user and ignores soft-deleted gifts. Manual creation stores a normal `Purchase` row but does not need an undo token because owner undo uses the authenticated delete path.

   Rationale: the existing `createPurchase` returns a raw guest undo token and is shaped for public purchase flows. Reusing it directly would create unnecessary token records for owner-created purchases and blur public/private semantics. Alternative considered: extend `createPurchase` with options for owner mode; rejected because it makes the public purchase helper carry owner authorization concerns.

2. Register a protected `purchase` tRPC router.

   Add `src/server/api/routers/purchase.ts` and register it in `src/server/api/root.ts`. Procedures:

   - `purchase.listForGift({ giftId })`
   - `purchase.createManual({ giftId, guestName?, guestEmail?, guestPhone?, message?, quantity })`
   - `purchase.delete({ purchaseId })`

   Each procedure derives the local `ownerId` from Clerk `ctx.userId`, matching the existing `giftRouter` pattern, and returns dashboard-safe purchase view models rather than raw Prisma rows.

   Rationale: purchase management is a distinct server capability and will later host public purchase procedures without coupling them to gift CRUD. Alternative considered: add purchase procedures to `giftRouter`; rejected because delete/list/create purchase operations are not gift update operations and will grow with Milestone 5.

3. Use a dashboard purchase view model that is private to owner surfaces.

   Add a serializable owner-facing purchase record shape with `id`, `giftId`, `guestName`, optional contact/message fields, `quantity`, and ISO timestamps. Keep this separate from public wishlist view models, which must not expose guest contact data.

   Rationale: the existing mapper boundary prevents raw Prisma rows crossing into UI and avoids accidentally leaking purchase PII into public paths. Alternative considered: append `purchases` to `DashboardGiftRowViewModel`; rejected for first paint because most rows do not need full PII until the drawer opens.

4. Fetch purchase records when the drawer opens.

   Add `src/components/features/dashboard/purchases/*` with a drawer component opened from `GiftRowActions`. The drawer uses client-side tRPC queries/mutations, invalidates the gift purchase query after mutations, and calls `router.refresh()` so server-rendered dashboard gift groups and aggregate counts update.

   Rationale: purchase details include private data and can be loaded only when needed, keeping dashboard rows lighter. Alternative considered: include all purchase records in `gift.list`; rejected because the dashboard list would carry all guest contact details even when the owner never opens a drawer.

5. Keep owner undo as a delete mutation.

   After `purchase.createManual` succeeds, show the PRD success toast text `Compra agregada` with a `Deshacer` action. The action calls `purchase.delete` with the created purchase ID. No raw token is generated or required for owner undo.

   Rationale: owner identity is already authenticated and authorized, and the PRD explicitly says owner undo does not need a token. Alternative considered: reuse guest undo tokens for all purchases; rejected because it adds token lifetime semantics to an owner-only convenience action.

## Risks / Trade-offs

- [Concurrent purchase writes can oversell] -> Recalculate remaining quantity server-side immediately before create; if the implementation touches both owner and guest create paths, prefer a transaction that reads current purchases and creates only when quantity remains.
- [Private purchase details leak into public UI] -> Keep owner purchase view models and tRPC procedures separate from public wishlist mappers and public routes.
- [Dashboard aggregates go stale after drawer mutations] -> Invalidate drawer queries and call `router.refresh()` after create/delete.
- [Delete is destructive because MVP has no purchase history] -> Require a confirmation dialog before deleting existing records; use undo toast only for just-created manual purchases.

## Migration Plan

No database migration is required. Ship service/router/UI changes together. Rollback removes the router registration and drawer UI; existing purchase records remain valid because the schema is unchanged.

## Open Questions

None.
