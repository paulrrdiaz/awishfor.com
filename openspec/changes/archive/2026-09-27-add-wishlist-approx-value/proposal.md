## Why

Hosts can see how many gift units guests marked as bought, but not roughly how much those gifts are worth. A gut-check figure ("≈ S/ 1,240 of S/ 3,800 received") answers the question hosts actually ask after the event. No money moves through the app — guests buy elsewhere and mark the gift — so the figure is an estimate derived from the gifts' current listed prices.

## What Changes

- Derive an approximate received value and an approximate goal for each wishlist from visible, non-deleted gifts: `min(quantityNeeded, purchased units) × priceAmount` and `quantityNeeded × priceAmount`, summed in the wishlist's currency.
- Gifts with no price are left out of both sums; the count of priced vs. total visible gifts is reported so the host can see coverage.
- Gifts priced in a currency other than the wishlist's (only possible via URL import) are left out of the headline and summed per currency for a footnote. A gift with no price currency counts as the wishlist's currency.
- Owner-recorded manual purchases count toward the received value.
- Add a `Valor aproximado recibido` panel to the Resumen right column, below `Progreso de compras`: received of goal, progress bar, coverage line when some gifts lack a price, foreign-currency footnote when present, and an empty state (never `S/ 0`) when no visible gift has a usable price.
- Visible to owner and collaborators; never exposed on public or invite pages.

### Non-goals

- No real payments, cash funds, or contribution tracking.
- No FX conversion; foreign-currency gifts are never merged into the headline.
- No price snapshot on `Purchase`; editing a gift's price changes the estimate retroactively. Accepted for an approximate figure.
- No value on dashboard wishlist cards, dashboard home, or the wishlist switcher.
- No change to the six metric cards or the unit-based purchase progress.

## Capabilities

### New Capabilities

_None._

### Modified Capabilities

- `dashboard-wishlist-overview`: adds an approximate received-value panel to Resumen, with its derivation rules (pricing coverage, currency handling, capping, visibility) and who may see it.

## Impact

- **Code**: `src/server/mappers/dashboard-wishlist.mapper.ts` (aggregate + overview mapping), `src/server/mappers/view-models.ts` (`DashboardWishlistOverviewViewModel` gains currency + value fields), `src/components/features/dashboard/overview/progress-panels.tsx` (new panel), `src/app/(protected)/dashboard/wishlists/[id]/page.tsx` (render it), related tests.
- **Schema / migrations**: none.
- **API**: `wishlist` overview procedure output gains fields; additive, no input changes.
- **Env / dependencies**: none.
- **Design**: the Claude Design file has no such panel; follows existing progress-panel styling.
