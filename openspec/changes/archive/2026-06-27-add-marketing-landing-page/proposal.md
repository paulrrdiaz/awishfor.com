## Why

The site root (`/`) is still the scaffold placeholder. We need the public marketing landing page that explains the product, builds trust, and drives signed-out visitors to `/create` — the top of the funnel for the whole app. The Claude Design brief now has a finished desktop landing in a fresh light-green theme (`A Wish For.dc.html`, §5), so we can implement it pixel-faithfully instead of guessing.

## What Changes

- Replace the placeholder `src/app/page.tsx` with a real marketing landing at `/` in its own `(marketing)` route group, rendering all sections from the design canvas in order: Nav → Hero → ¿Por qué? → Cómo funciona → Casos de uso → Tiendas aliadas → Temas (7 swatches) → Ejemplo real → Buscar lista (guest finder) → FAQ → CTA final → Footer.
- Add a self-contained **light-green marketing theme** scoped to the landing only (`--mbg #EEF9E6`, `--mink #173E29`, `--mlime #BCE25A`, `--msun #F4C84A`, …) — it must not touch app `:root` or the seven public wishlist themes.
- Use the brand logo (`public/assets/awishfor-logo.svg`) in the nav and footer instead of the plain text wordmark.
- Add **GSAP** (with `ScrollTrigger`) as the animation engine, replacing the design's raw CSS keyframes: scroll-reveal rises, floating ambient blobs/emoji, hero stat bob, headline shimmer, partner-logo marquee, animated mesh gradient, pulsing badge dot, slow-spin accent, and button glow — all gated behind `prefers-reduced-motion`.
- Render the "Ejemplo real" block with the **real** `PublicWishlistPage` in `compact` mode (single source of truth) fed by a new `src/config/demo-wishlist.ts` fixture.
- Make `/` a public route in `src/proxy.ts` and keep marketing pages indexable; nav swaps Iniciar sesión/Crear vs Dashboard/Crear via Clerk `<SignedIn>/<SignedOut>`.
- Update `docs/TASKS.md` Milestone 8.1 (and note the FAQ/guest-finder sections that the design folds in from 8.2) to reflect the implemented landing and the GSAP + logo decisions.

## Capabilities

### New Capabilities
- `marketing-landing`: The public `/` landing page — its sections, content, light-green theme scoping, logo usage, signed-in/out nav behavior, GSAP-driven animations with reduced-motion fallback, and the reuse of real public components for the example preview.

### Modified Capabilities
<!-- No existing capability's requirements change. The landing reuses public-wishlist-page/-layout and design-system in compact mode without altering their specs. -->

## Impact

- **New code**: `src/app/(marketing)/layout.tsx`, `src/app/(marketing)/page.tsx`, `src/components/layouts/marketing/*` (section components), `src/config/demo-wishlist.ts`, GSAP setup/hooks (`src/lib/gsap/*` or a marketing-scoped provider).
- **Modified**: `src/app/page.tsx` removed/replaced by the marketing route; `src/proxy.ts` (public route `/`); `src/styles/globals.css` (scoped `.marketing-theme` tokens); `docs/TASKS.md`.
- **Dependencies**: add `gsap`.
- **Assets**: `public/assets/awishfor-logo.svg`.
- **Reuses**: `PublicWishlistPage` (compact), shared design-system components, Clerk `<SignedIn>/<SignedOut>`.
