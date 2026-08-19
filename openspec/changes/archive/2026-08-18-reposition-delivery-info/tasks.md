## 1. New components

- [x] 1.1 Create `src/components/shared/delivery-bar.tsx`: icon badge (📦), eyebrow label `Envíos a domicilio`, `{delivery.line}` rendered as a single bold line, and `<CopyButton treatment="button" value={delivery.line} />`. Props: `delivery: ComposedDelivery`, `className?: string`.
- [x] 1.2 Create `src/components/shared/gift-section.tsx`: wraps `GiftListBand` with `children`/`className` unchanged, adds a `delivery?: ComposedDelivery | null` prop, and renders `DeliveryBar` after `GiftListBand` when `delivery` is present, applying the same `className` to both so their breakout width stays aligned.

## 2. Migrate call sites to GiftSection

- [x] 2.1 In `src/components/shared/public-wishlist-body.tsx`: replace the `GiftListBand` call with `GiftSection`, pass `delivery`, and delete the `!isCompact && <DeliveryCard .../>` block and its now-unused `DeliveryCard` import.
- [x] 2.2 In `src/components/layouts/public-wishlist/split-image-right-layout.tsx`: replace the `GiftListBand` call with `GiftSection`, pass `delivery`, and delete the `<DeliveryCard className="mt-4" delivery={delivery} />` call and its now-unused import.
- [x] 2.3 In `src/components/layouts/public-wishlist/collage-staggered-layout.tsx`: replace the `GiftListBand` call with `GiftSection`, pass `delivery`, and delete the `<DeliveryCard className="mx-5 mb-5" delivery={delivery} />` call and its now-unused import.
- [x] 2.4 In `src/components/layouts/public-wishlist/arch-trio-layout.tsx`: replace the `GiftListBand` call with `GiftSection`, pass `delivery`, and delete the `<DeliveryCard .../>` call in the hero row and its now-unused import.

## 3. Remove dead ArchTrio/EventDetails grouping

- [x] 3.1 In `arch-trio-layout.tsx`: remove the `hasEventDetails`-conditional wrapper classNames and the `grouped` prop passed to `EventDetails` in the hero row (lines ~146-167 today), leaving `EventDetails` rendered as a plain standalone card.
- [x] 3.2 In `src/components/shared/event-details.tsx`: remove the `grouped` prop, its type, and the `rounded-b-none border-b-0` branch it drives (confirm via `grep -rn "grouped"` that `arch-trio-layout.tsx` was its only caller before deleting).

## 4. Delete DeliveryCard

- [x] 4.1 Confirm no remaining references to `DeliveryCard` outside its own files (`grep -rn "DeliveryCard" src`).
- [x] 4.2 Delete `src/components/shared/delivery-card.tsx`, `src/components/shared/delivery-card.stories.tsx`, and `src/components/shared/delivery-card.test.tsx`.

## 5. Update affected tests

- [x] 5.1 Update `src/components/shared/event-details.test.tsx` to remove assertions on the removed `grouped` prop/joined-card styling.
- [x] 5.2 Update `src/components/layouts/public-wishlist/public-wishlist-layout-rendering.test.tsx` to assert the new delivery position (after the gift list, in every render mode including `compact`) instead of the old before-the-gift-list placement.
- [x] 5.3 Add or update coverage for `DeliveryBar` and `GiftSection` (composed-line rendering, absent-delivery omission, breakout `className` applied to both children) — colocate with the existing shared-component test conventions.

## 6. Validation

- [x] 6.1 Run `pnpm check`, `pnpm test`, and `pnpm typecheck`; resolve or explicitly report any failures before closing the session.
- [x] 6.2 Reminder (manual, skip during apply): visually verify the delivery bar's breakout width matches the gift band's edges in at least one full-viewport layout (e.g. `public-wishlist-body`-based) and one bounded layout (e.g. `split-image-right`), in both `full` and `compact` mode.
