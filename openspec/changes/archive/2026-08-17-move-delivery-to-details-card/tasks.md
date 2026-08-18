## 1. Shared copy action

- [x] 1.1 Add a `treatment?: "button" | "link"` prop to `src/components/shared/copy-button.tsx`, defaulting to `"button"` and preserving today's `variant="outline"` + `Copy`/`Check` icon rendering exactly
- [x] 1.2 Implement the `"link"` treatment: Button `link` variant, no icon, mono micro-type, sharing the existing clipboard write, `copied` state, and `COPIED_REVERT_MS` revert. Keep the same `label` / `copiedLabel` defaults (`Copiar` / `Copiado`) — the screenshot's `COPIAR` is a CSS `uppercase` treatment, not a different string, so the spec's "labelling identical across surfaces" holds
- [x] 1.3 Cover both treatments in `src/components/shared/copy-button.test.tsx` — same clipboard value, same confirmation label change, same revert — creating the test file if absent

## 2. Delivery card component

- [x] 2.1 Create `src/components/shared/delivery-card.tsx` taking `delivery: ComposedDelivery | null` and `className`, returning `null` when `delivery` is null
- [x] 2.2 Render the eyebrow `ENVÍO A DOMICILIO` in the same mono uppercase treatment as the `EventDetails` compact cells, then the line `Si prefieres enviarlo a casa`, then `DeliveryItems`, then `CopyButton` with `treatment="link"` and `value={delivery.line}`
- [x] 2.3 Style as a peer of the detail cards — matching radius and padding scale, primary-tinted border, left-aligned content
- [x] 2.4 Add `src/components/shared/delivery-card.test.tsx`: renders nothing without an address; renders the exact eyebrow and intro line; shows only the address row when name and phone are absent; copy action writes the composed `line`, not the itemized text
- [x] 2.5 Add `src/components/shared/delivery-card.stories.tsx` covering all-three-fields, address-only, and address-plus-phone

## 3. Remove the welcome-message postscript

- [x] 3.1 Delete `DeliveryPostscript` from `src/components/shared/wishlist-message.tsx`, including the copy `P.D. — si prefieres enviarlo a casa:`, and remove its render from `Postcard`, `Handwritten`, and `Avatars`
- [x] 3.2 Remove `delivery` from `WishlistMessage`'s `Props` and `VariantProps` and from the three variant call sites
- [x] 3.3 Drop the delivery assertions and fixtures from `src/components/shared/wishlist-message.test.tsx`
- [x] 3.4 Remove the delivery-bearing stories from `src/components/shared/wishlist-message.stories.tsx` (their coverage now lives in `delivery-card.stories.tsx` from 2.5)

## 4. Wire the card into every layout

- [x] 4.1 `src/components/shared/public-wishlist-body.tsx` — drop `delivery` from the `WishlistMessage` call and render `DeliveryCard` full-width between `EventDetails` and `Countdown` (covers the 6 shared-body layouts); keep passing `delivery` to `PublicGiftFilters`
- [x] 4.2 `src/components/layouts/public-wishlist/collage-staggered-layout.tsx` — same treatment: `DeliveryCard` full-width after the `EventDetails` band, `delivery` removed from `WishlistMessage`
- [x] 4.3 `src/components/layouts/public-wishlist/arch-trio-layout.tsx` — wrap `EventDetails` and `DeliveryCard` in the left column so the card is the panel's last item at `sm:w-72`; remove `delivery` from `WishlistMessage`
- [x] 4.4 `src/components/layouts/public-wishlist/split-image-right-layout.tsx` — this layout has no `EventDetails`; render `DeliveryCard` directly after its inlined `grid-cols-2` `Fecha`/`Lugar` band (`split-image-right-layout.tsx:77-107`) and before `Countdown`, matching that band's card tokens; remove `delivery` from `WishlistMessage`
- [x] 4.5 Confirm `DeliveryCard` renders on a wishlist with a delivery address and no event date, location, or dress code — the case where `EventDetails` returns `null` and where `split-image-right`'s inlined band renders nothing
- [x] 4.6 Grep for any remaining `delivery={delivery}` passed to `WishlistMessage` to confirm all four call sites are converted
- [x] 4.7 Confirm `src/lib/wishlist/draft-to-preview.ts` still surfaces the delivery fields to the wizard preview path

## 5. Verify

- [x] 5.1 Check `src/components/shared/event-details.test.tsx` still passes and add a case asserting the detail cards are unchanged by the neighboring card
- [x] 5.2 Confirm the purchase drawer's delivery block is untouched — `guest-gift-drawer.tsx` still renders `DeliveryItems` and the default `CopyButton` treatment
- [x] 5.3 Visually check `arch-trio` at desktop and at the `sm` breakpoint for the `sm:items-center` alignment shift called out in `design.md`; adjust the wrapper alignment only if the message column visibly drops
- [x] 5.4 Spot-check one shared-body layout, `collage-staggered`, and `split-image-right` in the browser for card placement and spacing
- [x] 5.5 Run `pnpm check`, `pnpm test`, and `pnpm typecheck`
