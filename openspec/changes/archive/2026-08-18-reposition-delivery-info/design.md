## Context

Today `DeliveryCard` (`src/components/shared/delivery-card.tsx`) is called from four places — `public-wishlist-body.tsx` (the shared body used by 6 of 9 layouts) and the three self-contained layouts (`arch-trio-layout.tsx`, `split-image-right-layout.tsx`, `collage-staggered-layout.tsx`) — always positioned beside the event-details cards, before the gift section, and gated by `!isCompact` so it never renders in compact mode. `GiftListBand` (`src/components/shared/gift-list-band.tsx`) is the one component every layout already uses to wrap its gift section, including all three self-contained layouts; its doc comment scopes it narrowly to "the card-colored surface treatment," nothing else. `ArchTrioLayout` additionally pairs `EventDetails` (via a `grouped` prop, used nowhere else) with `DeliveryCard` as one visually joined card. `composeDelivery()` (`lib/format/delivery.ts`) already produces the single-line string the new presentation needs, and `CopyButton` (`shared/copy-button.tsx`) already has a `treatment="button"` outline mode. See proposal.md for the motivation (design-file precedent, the four-file duplication) and the formal requirement changes (delta spec above).

## Goals / Non-Goals

**Goals:**
- Make "delivery info always renders after the gift list" true by construction, not by convention repeated in four files.
- Reuse existing formatting/clipboard logic (`composeDelivery`, `CopyButton`) rather than re-implementing it for the new bar.
- Keep `GiftListBand` scoped to its documented single purpose.
- Remove dead styling (`EventDetails`'s `grouped` prop) rather than leaving it unused.

**Non-Goals:**
- Changing the product departure drawer's delivery block (`DeliveryItems` inside `guest-gift-drawer.tsx`) — it keeps its itemized pictogram presentation; only the top-level page presentation moves and restyles.
- Changing `composeDelivery()`'s output shape or `delivery` field validation — both are unaffected.
- Adding a tenth layout or changing layout selection — this only changes how the existing nine compose delivery info.

## Decisions

**`GiftSection` wraps `GiftListBand`, rather than extending `GiftListBand` itself.** `GiftListBand` is an 18-line component whose doc comment says it exists for one thing: the card-colored surface treatment shared by every gift-section call site. Folding an unrelated concern (delivery info) into it would make the component's name and doc comment inaccurate. `GiftSection` becomes the new call site every layout uses instead of `GiftListBand` directly — it takes the same `children`/`className` shape `GiftListBand` already has, plus a `delivery` prop, and renders `GiftListBand` followed conditionally by `DeliveryBar`, applying the same `className` to both so their edge-to-edge breakout stays aligned (confirmed necessary: the four call sites use different breakout mechanics — full viewport `w-screen -translate-x-1/2` in `public-wishlist-body.tsx`, an outer wrapping div in `arch-trio-layout.tsx`, small negative-margin bleeds in the other two — so the delivery bar must inherit whichever one its layout already uses, not a single hardcoded value).

**`DeliveryBar` is new markup over existing logic, not a new subsystem.** `ComposedDelivery.line` already produces the exact single-line string the design wants; `CopyButton`'s existing `treatment="button"` mode already renders the outline button with Copy/Check icon toggle the design wants. The new component is: icon badge + eyebrow label + `{delivery.line}` + `<CopyButton treatment="button" value={delivery.line} />`. `DeliveryItems` (the pictogram-per-field list) is untouched and keeps serving the guest gift drawer.

**`composeDelivery()` stays computed once per layout file, feeding two consumers.** Each of the four files already calls `composeDelivery()` once and passes the result to `PublicGiftFilters` (for the drawer's copy-address gate). The same computed value now also passes to `GiftSection`. No duplication of the compose call, no new data plumbing.

**Compact mode inherits "always show" for free.** In every one of the four files, the gift-section call site (`GiftListBand`, soon `GiftSection`) already sits outside any `!isCompact` conditional — it's the one thing that renders in every mode today. Swapping that call site to `GiftSection` and deleting the old `!isCompact && <DeliveryCard .../>` block a few lines above it is the entire mechanism for the compact-mode behavior change; no new gating logic is introduced.

**`ArchTrioLayout`'s `EventDetails`/`DeliveryCard` joined-card styling is removed, not preserved elsewhere.** The `grouped` prop on `EventDetails` (`event-details.tsx:19,32,67`) exists solely so `EventDetails` can render with `rounded-b-none border-b-0` for `DeliveryCard` to sit flush beneath it. It has no other caller. Once delivery moves out of that hero row, `EventDetails` renders as a plain standalone card in `ArchTrioLayout`, and the `grouped` prop, the `hasEventDetails`-conditional width branching (`arch-trio-layout.tsx:146-167`), and the joined-corner classNames are deleted rather than left as dead code.

**Alternative considered and rejected**: keep the four `DeliveryCard` call sites and just move each one after its gift section by hand. Smaller diff today, but leaves the duplication risk alive — a future tenth layout could still get the placement wrong, which is the exact failure this change is meant to close off.

## Risks / Trade-offs

- [Two test files assert current behavior and will fail once this lands] → `event-details.test.tsx` (tests the `grouped` joining behavior being removed) and `public-wishlist-layout-rendering.test.tsx` (likely asserts delivery's current before-the-gift-list position) are updated as part of this change, not left red or silently deleted.
- [Compact mode showing delivery info for the first time is a visible behavior change for any wishlist currently relying on compact mode hiding it] → Covered explicitly by the delta spec's "Compact mode shows delivery when present" scenario; there's no known compact-mode use case that depends on delivery being hidden (compact mode is for landing-page embedding, where showing a real wishlist's delivery address is not desirable — see Open Questions).

## Migration Plan

No data migration — this is a presentation-layer change with no schema, API, or persisted-data impact. Deploy as a normal PR: build the new components additively (`GiftSection`, `DeliveryBar`), swap the four call sites, remove dead code (`DeliveryCard` + its stories/test, `EventDetails`'s `grouped` prop), update the two affected tests. Rollback is a plain revert; no forward-only state is created.

## Open Questions

- `compact` mode is documented (`public-wishlist-layout` spec) as "suitable for embedding as a landing-page example." Showing a real wishlist's home address in a landing-page embed may not be desirable even though the wishlist owner did add one. This wasn't raised during scoping and doesn't change the approach here (the delta spec's "always show when present" rule stands as the default) — flagging it so it can be revisited if the landing-page embedding use case turns out to need delivery suppressed specifically in `compact` mode, independent of whether the address is present.
