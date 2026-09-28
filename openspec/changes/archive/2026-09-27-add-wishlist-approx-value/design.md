## Context

See proposal.md for motivation and specs for the behavior contract.

- `Gift.priceAmount` is `Decimal(10,2)?`; `Gift.priceCurrency` is `Currency?` and is only set by the URL importer (the manual gift form never sets it). `Wishlist.currency` defaults to PEN.
- `Purchase` stores quantity only, no price.
- The Resumen page (`src/app/(protected)/dashboard/wishlists/[id]/page.tsx`) renders from `DashboardWishlistOverviewViewModel`, built by `mapDashboardWishlistOverview` in `src/server/mappers/dashboard-wishlist.mapper.ts`. The overview query already loads all gifts with their purchases, so no new DB access is needed.
- `getVisibleGiftAggregates` already filters visible/non-deleted gifts and caps purchased units per gift. It feeds both the overview and `mapDashboardWishlistSummary` (dashboard cards).
- `formatMoney(amount, { currency, locale })` in `src/lib/format/money.ts` accepts `number | string`.
- The view model does not carry the wishlist currency today.

## Goals / Non-Goals

**Goals:**
- Exact decimal sums computed server-side in the mapper, where the other aggregates live, and serialized as strings.
- A pure, unit-testable helper for the value computation.
- UI that follows the existing progress panel styling.

**Non-Goals:**
- Changing `getVisibleGiftAggregates` return shape for the dashboard summary/cards.
- Any schema, migration, or new query.

## Decisions

### 1. A dedicated pure helper instead of widening `getVisibleGiftAggregates`

Add `computeApproxGiftValue(gifts, wishlistCurrency)` in a new module `src/server/mappers/gift-value.ts`, called only from `mapDashboardWishlistOverview`. It applies the same visibility filter (reuse `isVisibleAndNotDeleted`; export it or move it next to the helper) and the same per-gift cap.

- *Why*: the summary mapper (dashboard cards) must not gain money fields. A separate helper keeps the card path untouched and gives a small surface for tests.
- *Alternative*: add money fields to `getVisibleGiftAggregates`. Rejected because both callers would pay for it, and the extra fields would tempt card usage, which is out of scope.

### 2. Integer-cent arithmetic

Convert each price to integer cents (`Math.round(Number(priceAmount.toString()) * 100)` is safe for `Decimal(10,2)`: max 99,999,999.99 fits well within 2^53), multiply by integer units, and sum as integers. Format back to a fixed two-decimal string (`(cents / 100).toFixed(2)`).

- *Why*: no dependency, exact for 2-decimal inputs, and trivially serializable.
- *Alternative*: `Prisma.Decimal` math. Also exact, but it couples the helper to the Prisma runtime and makes tests build Decimal fixtures. Rejected on simplicity. Floats were rejected for drift (the spec requires 0.10 + 0.20 + 0.30 = 0.60).

### 3. Output shape

Add to `DashboardWishlistOverviewViewModel`:

```ts
currency: string; // wishlist currency
approxValue: {
  receivedAmount: string;   // "1240.00", wishlist currency
  goalAmount: string;       // "3800.00"
  pricedGiftCount: number;  // visible gifts priced in wishlist currency
  visibleGiftCount: number;
  foreignReceived: { currency: string; amount: string }[]; // received > 0 only, sorted by currency
};
```

Gifts count as priced when `priceAmount != null && (priceCurrency ?? wishlistCurrency) === wishlistCurrency`. A foreign gift contributes to `foreignReceived[currency]` only when its capped purchased units are greater than 0. `approxValue` is always present; the panel decides empty vs. filled from `pricedGiftCount === 0`. It is not gated on `isOwner`, because collaborators see it.

- *Alternative*: nullable `approxValue` when nothing is priced. Rejected because the empty state still needs `foreignReceived`.

### 4. UI: `ApproxValuePanel` in `progress-panels.tsx`

- New exported component in `src/components/features/dashboard/overview/progress-panels.tsx`, rendered in the right column between `PurchaseProgressPanel` and `InvitationProgressPanel`. It receives `approxValue`, `currency`, and `language`.
- Filled state: title `Valor aproximado recibido`, headline `formatMoney(received)` with the muted `de {formatMoney(goal)}`, and a bar at `Math.round(received / goal * 100)`, using the same markup as `PurchaseProgressPanel`.
  - Coverage line `{priced} de {visible} regalos con precio` when `priced < visible`.
  - Footnote `+ {formatMoney(amount, currency)} en otra moneda (no incluido)`, one line per foreign currency, joined with ` · `.
- Empty state (`pricedGiftCount === 0`): `Agrega precios a tus regalos para ver el valor aproximado.` The foreign footnote is still shown if present.
- A goal greater than 0 is guaranteed whenever `pricedGiftCount > 0`, because the price is required and `quantityNeeded ≥ 1`. A price of `0` is possible, so guard the percent with `goal > 0 ? … : 0`.
- Copy is Spanish only, matching the rest of the dashboard.

### 5. Public surfaces untouched

`public-wishlist.mapper.ts` and the invite mappers are not modified. The spec's public scenario is verified by the absence of the new fields in the public view models (type-level) and a mapper test assertion.

## Risks / Trade-offs

- [The host edits a price after purchase, which changes the "received" figure retroactively] → Accepted for an approximate figure. The label says "aproximado". A price snapshot on `Purchase` is a possible follow-up.
- [Hosts misread the figure as cash received] → The wording "Valor aproximado recibido" avoids "recaudado".
- [Zero-price gifts count as priced but add nothing] → Acceptable. The host explicitly set 0.
- [`isVisibleAndNotDeleted` is currently module-private] → Export it from the mapper, or colocate the helper in the same file if exporting feels leaky. Either works, so decide at apply time with no spec impact.

## Migration Plan

Additive only. No migration, no flag. Rollback means reverting the commit.

## Validation

- Unit tests for `computeApproxGiftValue`, covering every spec scenario: basic, capping, hidden/deleted, manual purchase, null currency, decimal exactness, partial/full coverage, no gifts, foreign single/multiple/unpurchased, foreign-only.
- A mapper test asserting that `mapDashboardWishlistOverview` includes `currency` + `approxValue` for both `isOwner: true` and `false`.
- Component tests for `ApproxValuePanel` covering the filled, coverage note, foreign footnote, and empty (no `S/ 0`) states.
- `pnpm check`, `pnpm test`, and `pnpm typecheck`.
