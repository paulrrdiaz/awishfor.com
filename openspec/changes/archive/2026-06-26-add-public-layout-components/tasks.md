## 1. Formatting helper

- [x] 1.1 Add `formatCountdown(eventDate, now?)` in `src/lib/format/countdown.ts` returning `Faltan N días` / `Falta 1 día` / `Es hoy` / closed message, computed at local midnight
- [x] 1.2 Add `src/lib/format/countdown.test.ts` covering future (44 days), one day, today, and past-event cases

## 2. Shared section components

- [x] 2.1 Add `src/components/features/wishlist/wishlist-hero.tsx` (hero title/display name, cover image, event details block)
- [x] 2.2 Add `src/components/features/wishlist/countdown.tsx` wrapping `formatCountdown`
- [x] 2.3 Add `src/components/features/wishlist/gift-card.tsx` with available/partial/purchased states, price, store, priority `Infaltable` badge, public note, quantity progress, `Comprado` badge, and a `mode`/`actionsEnabled` prop (actions inert this change)
- [x] 2.4 Add `src/components/features/wishlist/gift-grid.tsx` and `gift-list.tsx` taking `giftColumns`/`giftCardStyle`, using static mobile-first column class lookup
- [x] 2.5 Add `src/components/features/wishlist/how-it-works.tsx` with default Spanish three-step copy, gated on `showHowItWorks`
- [x] 2.6 Add `src/components/features/wishlist/wishlist-footer.tsx`

## 3. Layout variants

- [x] 3.1 Add `src/components/layouts/public-wishlist/grid-wishlist-layout.tsx`
- [x] 3.2 Add `src/components/layouts/public-wishlist/editorial-wishlist-layout.tsx`
- [x] 3.3 Add `src/components/layouts/public-wishlist/minimal-wishlist-layout.tsx` (single-column rows, no category dividers)
- [x] 3.4 Ensure all three compose sections in required order: hero, event details, countdown, welcome, gift list, how it works, thank-you, footer — omitting empty sections

## 4. Page shell

- [x] 4.1 Add `src/components/layouts/public-wishlist/public-wishlist-page.tsx` resolving theme/layout/font/button presets, applying scoped `--public-*` vars + font classes on a wrapper, and selecting the layout variant by `layoutId`
- [x] 4.2 Thread `mode: "full" | "preview" | "compact"`: preview banner + disabled actions for `preview`; trimmed sections for `compact`
- [x] 4.3 Verify dashboard styling is unaffected (vars scoped to the wrapper, not `:root`)

## 5. Wire public route

- [x] 5.1 Update `src/app/w/[slug]/page.tsx` to render `PublicWishlistPage` in `full` mode for published and `preview` mode for owner draft results
- [x] 5.2 Keep existing archived/notFound handling intact

## 6. Validation

- [x] 6.1 Run `pnpm check`, `pnpm test`, and `pnpm typecheck`; fix any failures
- [x] 6.2 Manually verify section order, preview banner, and compact trimming render correctly
