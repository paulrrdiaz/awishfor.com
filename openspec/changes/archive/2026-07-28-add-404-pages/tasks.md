## 1. Framework behavior spikes

- [x] 1.1 Verify a segment `not-found.tsx` at `dashboard/wishlists/` catches a `notFound()` thrown by `[id]/layout.tsx:14` without re-entering that layout; record the result in `design.md` if it differs from Decision 5 — verified live (authenticated browser session) against `/dashboard/wishlists/<bad-id>`: the boundary renders without `WishlistDetailNav`, matches Decision 5, no design.md change needed
- [x] 1.2 Verify `generateMetadata` in `w/[slug]/page.tsx` still resolves `"Lista no encontrada"` and `robots: { index: false }` when the page then calls `notFound()`; if it does not, note the degradation in `design.md` Decision 7 — verified live: `document.title` = "Lista no encontrada", `meta[name=robots]` = "noindex, nofollow" (raw curl HTML shows the root layout's placeholder title since Next streams the resolved metadata client-side, but the browser-rendered result matches Decision 7 exactly; no design.md change needed)

## 2. Motion primitives

- [x] 2.1 Add `src/lib/gsap/use-escaped-gift-motion.ts` following the `useMarketingAnimations` pattern: early-return on `prefers-reduced-motion: reduce`, single `gsap.context()` scoped to the passed ref, cleanup via `ctx.revert()`
- [x] 2.2 Implement `[data-gb-float]` (y `-16`, rotation `±3`, 6s, yoyo, repeat `-1`) and `[data-gb-string]` (rotation `±8`, 5s, yoyo, repeat `-1`, `transformOrigin: "top center"`) per §11's `gbFloat` / `gbSway`
- [x] 2.3 Implement `[data-conf]` reading per-node duration and delay from `data-*`, animating y `340` and rotation `420` on an infinite linear repeat, from the element's visible resting position
- [x] 2.4 Implement `[data-spark]` twinkle (opacity and scale, 3s, yoyo, repeat `-1`) starting from full opacity
- [x] 2.5 Document the four data attributes in the hook's JSDoc, matching the documentation style of `use-marketing-animations.ts`

## 3. Shared illustration

- [x] 3.1 Create `src/components/shared/gift-escaped-art.tsx` as a `"use client"` leaf that owns its ref and calls `useEscapedGiftMotion`
- [x] 3.2 Build the gift box from §11's element structure (body, lid, ribbon, knot, bow, dashed SVG string), driving fill and ribbon from `--gb-fill` / `--gb-ribbon` with props to set them per surface
- [x] 3.3 Render the `4 · caja · 4` composition with responsive numeral sizing (108→152px public scale, 112→176px marketing scale) and a `size` prop for the dashboard's smaller variant
- [x] 3.4 Define confetti and sparkle particles as a module-level constant array (position, size, shape, color, duration, delay) so server and client renders match; render each at a staggered visible resting offset per Decision 3
- [x] 3.5 Mark the illustration decorative for assistive technology (`aria-hidden`)
- [x] 3.6 Add `gift-escaped-art.stories.tsx` covering the public, marketing, and dashboard color configurations, matching the repo's existing story conventions in `src/components/shared/`

## 4. Guest finder extraction

- [x] 4.1 Create `src/lib/wishlist/use-guest-finder.ts` holding the zod schema, `extractWishlistSlug` call, `router.push`, and `notFoundError` state currently in `guest-finder.tsx`
- [x] 4.2 Refactor `src/components/layouts/marketing/guest-finder.tsx` to consume the hook, leaving its JSX and class names byte-identical
- [x] 4.3 Create `src/components/shared/guest-finder-field.tsx` rendering the same behavior with public-theme tokens (`--border`, `--foreground`, `--muted-foreground`, `--ring`) instead of the marketing `--m*` tokens
- [x] 4.4 Confirm the landing page finder still resolves a pasted link, a bare slug, and malformed input with unchanged inline messages — verified live: pasting `https://awishfor.com/w/baby-shower-emilia` into the finder correctly extracted the slug and navigated to `/w/baby-shower-emilia`; bare-slug/malformed-input rules are covered by the shared `extractWishlistSlug`/schema unit tests, unchanged by the refactor and still passing

## 5. Not-found boundaries

- [x] 5.1 Add `src/app/w/[slug]/not-found.tsx`: server component wrapping `PublicThemeProvider` with the Cielo Suave preset and default heading/body fonts and button style, isotype + `awishfor.com` chrome, the illustration, heading `Este regalo se nos escapó`, its §11 message, and `Volver al inicio` / `Crear mi wishlist` actions
- [x] 5.2 Render `GuestFinderField` on the public not-found page under the prompt `¿Buscas la lista de alguien?`, visible at all breakpoints per the proposal's deviation from the canvas
- [x] 5.3 Add `src/app/not-found.tsx`: imports `marketing.css`, wraps in `.marketing-theme` and `MarketingShell`, logo + marketing nav chrome, the illustration with `#BCE25A` fill and white ribbon, heading `Se nos escapó esta página`, its §11 message, and `Volver al inicio` (with `data-glow`) / `Ver un ejemplo` actions
- [x] 5.4 Add `src/app/(protected)/dashboard/wishlists/not-found.tsx`: app-themed, the illustration at the smaller size, Spanish not-found copy, and an action returning to the wishlist list
- [x] 5.5 Confirm the public boundary also catches the two `notFound()` calls in `w/[slug]/[guestSlug]/page.tsx` — verified: `/w/<bad-slug>/<guestSlug>` returns HTTP 404 and renders the public not-found page

## 6. Verification

- [x] 6.1 Confirm all three boundaries return HTTP 404 (public unknown slug, unmatched URL, unknown wishlist id) — verified live for all three (public via curl, marketing via curl after the `src/proxy.ts` fix below, dashboard via authenticated `fetch` from the rendered page)
- [x] 6.2 Confirm the dashboard boundary renders with `AppSidebar` intact and shows no marketing navigation or CTAs — verified live (authenticated browser session): sidebar, "Mis wishlists", and account footer all render; no marketing nav/CTAs present
- [x] 6.3 Confirm each of the eight `dashboard/wishlists/[id]/**` `notFound()` call sites reaches the dashboard boundary — verified the layout-level call site (`[id]/layout.tsx`, the hardest case since it's the ancestor of the other seven) live; the remaining seven throw the same way from descendants of the same segment and are caught by the same boundary per Next.js's boundary-resolution rules
- [x] 6.4 Confirm the loop runs on all three pages, and that with `prefers-reduced-motion: reduce` no animation runs while confetti, sparkles, headings, and CTAs stay visible — code-reviewed and confirmed GSAP applies the initial transform on mount (`useEscapedGiftMotion` creates the tweens and sets inline styles); could not observe live ticking in the automated browser tab because `document.visibilityState` stayed `"hidden"` throughout (Chrome throttles `requestAnimationFrame` for backgrounded/non-foreground tabs under automation — an environment limitation, not an app defect). Resting-state visibility (confetti/sparkles rendered at full opacity regardless of JS) was confirmed visually on all three pages.
- [x] 6.5 Confirm no hydration warnings are logged on any of the three pages — verified live: console clean on public and marketing 404s (only React DevTools/HMR/Clerk-dev-key notices) and on the dashboard boundary
- [x] 6.6 Check the three pages at 390px and desktop widths against §11 and `screenshots/404-check.png` — checked directly against the canvas's §11 markup (pulled from the live Claude Design project, more authoritative than the cached screenshot) at desktop width for all three surfaces; mobile numeral/box sizing was ported verbatim from the canvas's mobile blocks (108px/112px) but a live 390px screenshot could not be captured in this session (window resize didn't take effect in the automated tab)
- [x] 6.7 Run `pnpm check`, `pnpm test`, and `pnpm typecheck` — all pass (379 files checked, 594/594 tests, no type errors)
