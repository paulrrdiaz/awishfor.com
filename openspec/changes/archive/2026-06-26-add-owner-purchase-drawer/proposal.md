## Why

Owners can see aggregate purchase progress in the dashboard, but they cannot inspect or correct the individual purchase records behind that progress. This blocks Milestone 4.7 and leaves owners without a way to manually register offline purchases or undo mistaken guest/manual purchase records.

## What Changes

- Add a gift-level purchase drawer in the owner dashboard gift row actions.
- Show purchase records for the selected gift, including guest name, optional email/phone/message, quantity, and created timestamp.
- Add an authenticated owner manual purchase form with default name `Registrado por el creador` and remaining-quantity validation.
- Add an authenticated owner delete purchase action guarded by a confirmation dialog.
- Add an owner undo toast after manual purchase creation that can delete the just-created purchase without using a guest undo token.
- Keep purchase management scoped to each gift; no standalone purchases page is added.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `purchase-management`: add owner-scoped list, manual-create, and delete behavior for purchase records, including manual purchase validation and owner undo semantics.
- `dashboard-gift-management`: add a gift-level owner purchase drawer entry point and dashboard behavior for viewing and managing a gift's purchase records.

## Impact

- Server services: extend `src/server/services/purchase.service.ts` for owner-scoped purchase listing, manual creation, and owner deletion.
- tRPC API: add/register `src/server/api/routers/purchase.ts` with protected owner procedures.
- Validation: extend `src/server/validators/purchase.schema.ts` with owner-management inputs where needed.
- UI: add `src/components/features/dashboard/purchases/*` and wire it into `src/components/features/dashboard/gifts/gift-row-actions.tsx`.
- Data/view models: add a dashboard-safe purchase record view model that can expose guest contact details only to the authenticated owner.
- Tests: add focused service/router tests for owner authorization, quantity limits, delete restore behavior, and UI-level form/confirmation behavior where practical.
