## 1. Shared components (affect all 14 consuming layouts)

- [x] 1.1 Restyle `src/components/shared/countdown.tsx` into a tinted, rounded accent-card container with an uppercase eyebrow label ("La cuenta regresiva") above the existing countdown text; keep `formatCountdown` and its returned strings unchanged
- [x] 1.2 In `src/components/shared/public-wishlist-body.tsx`, restyle the welcome-message block: italic styling on `wishlist.welcomeMessage`, plus a separate `— {wishlist.displayName}` attribution line rendered only when `displayName` is present
- [x] 1.3 Add a `variant?: "default" | "on-photo"` prop to `src/components/shared/hero-ctas.tsx`; default preserves current `bg-primary`/`border-primary` styling, `"on-photo"` renders a hardcoded white/glass treatment (solid white + dark text primary button; translucent-white border + white text secondary button) independent of theme CSS variables

## 2. HeroCinematicLayout hero fidelity

- [x] 2.1 In `src/components/layouts/public-wishlist/hero-cinematic-layout.tsx`, change the desktop hero height from `lg:h-[460px]` to `lg:h-[440px]` (leave `h-80`/`sm:h-96` untouched)
- [x] 2.2 Replace the gradient overlay with `bg-gradient-to-b from-[rgba(20,10,5,.04)] via-[rgba(20,10,5,.44)] to-[rgba(20,10,5,.82)]`
- [x] 2.3 Update the eyebrow to show `${eventLabel} · ${formattedDate}` when `wishlist.eventDate` is present (using `formatEventDate` from `@/lib/format/dates` with `locale: "es"`), falling back to `eventLabel` alone when absent
- [x] 2.4 Change the hero subtitle to read `wishlist.eventLocation`, falling back to `wishlist.displayName` when `eventLocation` is null, rendering nothing when both are null
- [x] 2.5 Pass `variant="on-photo"` to `<HeroCtas />` in this layout

## 3. Verification

- [x] 3.1 Run `pnpm check`, `pnpm test`, and `pnpm typecheck`; fix any failures
- [x] 3.2 Update or add Storybook stories / existing tests covering `Countdown`, `HeroCtas` variants, and the welcome-message block if existing test files assert on the old plain-text markup
- [c] 3.3 Note as a manual-verify reminder (do not attempt automatically): visually compare the `/w/[slug]` page for a Crema Elegante wedding wishlist against the design mock, and spot-check the dashboard live preview for 2-3 other themes/layouts to confirm the shared Countdown/welcome-message changes don't regress elsewhere
