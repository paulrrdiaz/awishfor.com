## Why

The wizard already lets owners create gifts, but once a wishlist exists there is no place to see or manage them. Owners need a single dashboard view to review every gift, understand purchase progress, and edit, hide, or remove gifts without re-running the wizard.

## What Changes

- Add a dashboard gifts page at `/dashboard/wishlists/[id]/gifts` that lists all of a wishlist's non-deleted gifts (including hidden ones), scoped to the signed-in owner.
- Group gifts into **Available/partial**, **Purchased**, and **Hidden** sections derived from purchase progress and visibility status.
- Show per-gift status badges (priority, visibility, purchase state) and quantity progress (purchased vs. needed).
- Add management actions per gift: edit, hide/unhide, and soft delete with a confirmation step. A gift that already has purchases shows a stronger delete warning.
- Add a `gift` tRPC router (list-for-dashboard, update, set-visibility, soft-delete) with owner authorization, plus a service query that returns gifts with their purchases for dashboard mapping.
- Soft-deleted gifts disappear from the dashboard (no restore UI in this change).

## Capabilities

### New Capabilities
- `dashboard-gift-management`: How an authenticated owner lists, groups, and manages (edit / hide / unhide / soft delete) the gifts of a wishlist from the dashboard, including authorization, grouping rules, progress display, and delete-confirmation behavior.

### Modified Capabilities
<!-- No spec-level requirement changes to existing capabilities; gift persistence, visibility, and soft-delete behavior in `gift-management` are reused as-is. -->

## Impact

- **New page**: `src/app/(protected)/dashboard/wishlists/[id]/gifts/page.tsx`.
- **New components**: `src/components/features/dashboard/gifts/*` (grouped list, gift row, status badges, delete confirmation).
- **New API**: `src/server/api/routers/gift.ts`, registered in `src/server/api/root.ts`.
- **Service**: extend `src/server/services/gift.service.ts` with a dashboard listing (gifts + purchases, includes hidden, excludes deleted) and an owner-authorization helper.
- **Reuses**: `src/server/mappers/dashboard-gift.mapper.ts`, `DashboardGiftRowViewModel`, existing `gift.schema.ts` validators.
- **UI primitives**: may add shadcn `badge` / `table` / `alert-dialog` components (style `base-nova`).
- No schema migration, no new env vars.
