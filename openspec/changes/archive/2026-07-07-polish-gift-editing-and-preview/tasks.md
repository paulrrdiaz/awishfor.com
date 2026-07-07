## 1. Query State and Dependency Setup

- [x] 1.1 Add `nuqs` to the web app dependencies and ensure install artifacts are updated.
- [x] 1.2 Wire Gifts step edit state to a `giftId` query param while preserving the existing `step` query param.
- [x] 1.3 Handle stale or unknown `giftId` values without opening the drawer or mutating draft gifts.

## 2. Gift Edit Drawer

- [x] 2.1 Replace the current full-step edit replacement with an edit drawer opened from each gift row's `Editar` action.
- [x] 2.2 Render `GiftForm` inside the drawer with the selected draft gift's current values and existing category options.
- [x] 2.3 Save drawer edits through the existing `updateGift` store action, close the drawer, and clear `giftId`.
- [x] 2.4 Cancel or dismiss the drawer without saving, close it, and clear `giftId`.
- [x] 2.5 Keep the gift list and guest preview visible behind the drawer while editing.

## 3. Gifts Step Preview Layout

- [x] 3.1 Update preview gift cards so image media uses `object-contain` with stable dimensions and a neutral background.
- [x] 3.2 Adjust the Gifts step preview grid to use three columns on sufficiently wide desktop panes and fewer columns on narrower panes.
- [x] 3.3 Verify long names, missing images, missing prices, and category labels remain readable without overlap.

## 4. Category Chip Actions

- [x] 4.1 Replace visible `Renombrar` and `Quitar` chip action text with lucide icon buttons.
- [x] 4.2 Add Spanish tooltips and category-specific accessible labels to rename and remove icon buttons.
- [x] 4.3 Preserve the existing inline rename form behavior and draft category removal behavior.

## 5. Tests and Validation

- [x] 5.1 Add or update focused tests for gift edit drawer open/save/cancel/query-param behavior where practical.
- [x] 5.2 Add or update focused tests for icon-only category actions and accessible labels where practical.
- [x] 5.3 Run `pnpm check`.
- [x] 5.4 Run `pnpm test`.
- [x] 5.5 Run `pnpm typecheck`.
