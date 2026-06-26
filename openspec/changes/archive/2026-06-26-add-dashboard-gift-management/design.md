## Context

Gifts are persisted (`gift-management` spec) and created via the wizard, but there is no read/manage surface once a wishlist exists. The data layer is mostly ready: `gift.service.ts` has `listGifts`, `updateGift`, `softDeleteGift`, `findActiveGift`; `dashboard-gift.mapper.ts` maps a `Gift & { purchases: Purchase[] }` into `DashboardGiftRowViewModel` (already computing `purchasedQuantity` / `remainingQuantity`). What is missing: (1) no `gift` tRPC router exists, (2) `listGifts` returns bare `Gift[]` without purchases and excludes hidden gifts by default, and (3) no dashboard page or components. The owner-authorization pattern is established in `wishlist.ts` / `category.ts` (`getLocalUserId` → `db.wishlist.findFirst({ id, ownerId })`).

Constraints: tRPC v11 with `protectedProcedure` (injects `ctx.userId` = Clerk id; must resolve local `User.id`). UI uses shadcn/Base UI (`base-nova`, neutral) — only `button`, `input`, `label` exist today. App Router RSC + `@/trpc/server` for server fetch, `@/trpc/react` for client mutations.

## Goals / Non-Goals

**Goals:**
- One owner-only dashboard page listing all non-deleted gifts (incl. hidden) of a wishlist, grouped available/partial · purchased · hidden.
- Per-gift status badges + quantity progress.
- Edit, hide/unhide, and soft-delete actions, each owner-authorized, with delete confirmation and a stronger warning when purchases exist.
- A reusable `gift` tRPC router that future tasks (4.5 ordering, 4.7 purchases) extend.

**Non-Goals:**
- Drag-and-drop ordering (task 4.5), category management UI (4.6), purchase drawer (4.7).
- Restore UI for soft-deleted gifts.
- Pagination / virtualization (gift counts per wishlist are small).

## Decisions

### Decision: Add a dashboard-specific service query rather than overloading `listGifts`
Add `listDashboardGifts(db, { ownerId, wishlistId })` that verifies ownership, then returns gifts with `include: { purchases: true }`, `where: { wishlistId, deletedAt: null }` (no visibility filter so hidden gifts are included), ordered by `sortOrder, createdAt`. Mapped through the existing `mapDashboardGift`.
- **Why over reusing `listGifts`**: `listGifts` is consumed by public/wizard paths with `includeHidden=false` and no purchases; changing its shape/return type would ripple. A separate function keeps the public contract stable and matches what the mapper already expects.

### Decision: Grouping happens in a presentation helper, not the DB
The service returns a flat ordered `DashboardGiftRowViewModel[]`; a pure helper buckets rows into `{ available, purchased, hidden }` using the spec rules (hidden → hidden; else `remainingQuantity === 0` → purchased; else available). 
- **Why**: grouping is derived from already-computed fields, is trivially unit-testable, and keeps the query single-pass. Order within a group is preserved from `sortOrder` so task 4.5 reordering "just works".

### Decision: Hide/unhide reuses the existing update path
Expose a focused `setVisibility` mutation (input: `giftId`, `visibilityStatus`) that funnels through `updateGift` after the ownership check, rather than a bespoke service function.
- **Why**: `updateGift` already handles the `visibilityStatus` cast; a narrow input keeps the client call cheap and intent explicit. Alternative (full update form for a toggle) is heavier on the client.

### Decision: Owner authorization via a shared `assertGiftOwner` helper in the router
Mutations (`update`, `setVisibility`, `delete`) first resolve `ownerId` (`getLocalUserId`), then assert the gift's wishlist belongs to that owner before calling the service. `list` asserts wishlist ownership directly.
- **Why**: mirrors `category.ts` (`getOwnedWishlist` / `getOwnedCategory`). `protectedProcedure` only proves *some* user; per-resource ownership must be checked explicitly (page-level proxy does not guard the API).

### Decision: Server Component page + thin client islands
`page.tsx` (RSC) fetches grouped gifts via `@/trpc/server`, renders the grouped list server-side; row action controls (hide toggle, delete dialog, edit entry) are client components using `@/trpc/react` mutations + `router.refresh()`/query invalidation.
- **Why**: keeps initial render fast and data on the server; only interactive bits ship JS. Consistent with the app's RSC-first approach.

### Decision: Add shadcn `badge` and `alert-dialog`; build the list with semantic markup
Pull in `badge` (status badges) and `alert-dialog` (delete confirmation) from shadcn. Render the gift list as a responsive list/table with existing primitives rather than adding the full `table` component unless needed.
- **Why**: minimizes new surface; `alert-dialog` gives accessible confirm + the stronger-warning variant.

## Risks / Trade-offs

- **Including purchases per gift could N+1 if done naively** → use a single `findMany` with `include: { purchases: true }`; Prisma batches the relation load.
- **Edit UX scope creep** (task wants an "edit action", not a full editor) → reuse the existing wizard `gift-form` component for editing in a dialog/route; if reuse is awkward, edit links to a dedicated edit surface deferred — keep this change's edit action minimal (open form, submit `update`).
- **Grouping drift vs. public page** → grouping rules live in one tested helper and use the same `remainingQuantity` the mapper computes, so dashboard and public stay consistent.
- **Stronger-delete-warning needs purchase count client-side** → `DashboardGiftRowViewModel.purchasedQuantity` already carries it; no extra fetch.

## Open Questions

- Edit action: reuse wizard `gift-form` in a dialog vs. dedicated `/gifts/[giftId]/edit` route? Lean toward dialog reuse; confirm during apply.
- Whether to add the shadcn `table` primitive or hand-roll the list — decide when building the row layout.
