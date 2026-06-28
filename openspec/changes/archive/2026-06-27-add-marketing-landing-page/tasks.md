## 1. Foundation: deps, theme, route, fonts

- [x] 1.1 Add `gsap` to dependencies (`pnpm add gsap`) and verify `ScrollTrigger` import path.
- [x] 1.2 Register `JetBrains Mono` via `next/font` for eyebrow labels; expose a CSS var/class (reuse existing `Lora`/`Inter`).
- [x] 1.3 Add scoped `.marketing-theme` tokens to `src/styles/globals.css` using exact canvas values (`--mbg #EEF9E6`, `--mink #173E29`, `--mmut #4E6E56`, `--mline #CCE8BE`, `--mrose #7FB069`, `--msky #56A86B`, `--mlime #BCE25A`, `--msun #F4C84A`); confirm no overlap with app/public tokens.
- [x] 1.4 Create `src/app/(marketing)/layout.tsx` mounting the `.marketing-theme` wrapper and the GSAP provider; delete placeholder `src/app/page.tsx`.
- [x] 1.5 Create `src/app/(marketing)/page.tsx` shell composing section components in order, with indexable `metadata` (title + description).
- [x] 1.6 Add `/` to public routes in `src/proxy.ts` and confirm marketing pages stay indexable.

## 2. GSAP infrastructure

- [x] 2.1 Add `src/lib/gsap/gsap-provider.tsx` (client) registering `ScrollTrigger` once.
- [x] 2.2 Add `useReducedMotion` guard + `useScrollReveal` hook using `gsap.context()` scoped to a ref for cleanup.
- [x] 2.3 Add ambient/loop helpers (float, bob, shimmer, marquee, mesh-shift, pulse-dot, spin, btn-glow) honoring reduced-motion; ensure all content renders at final state when motion is disabled or JS is absent.

## 3. Nav, hero, footer

- [x] 3.1 `marketing-nav` (client): logo (`/assets/awishfor-logo.svg`, alt "A Wish For"), links, Clerk `<SignedIn>` (Dashboard + Crear) / `<SignedOut>` (Iniciar sesión + Crear); CTAs → `/create`.
- [x] 3.2 `marketing-hero`: two-column grid (`1.1fr .9fr`), badge with pulsing dot, shimmer headline "Crea una wishlist hermosa…", subcopy, CTAs (Crear → `/create`, Ver ejemplo → scroll to example), stats strip (+10 mil / 4.9★ / 100%); ambient blurred blobs + dot grid + floating emoji; right-side bobbing public-card mock + floating toast + spinning sun chip.
- [x] 3.3 `final-cta`: dark-green gradient band with blobs/emoji, white serif headline, lime CTA → `/create`.
- [x] 3.4 `marketing-footer`: ink (`--mink`) bar with wordmark and "awishfor.com · Hecho con cariño 🌿".

## 4. Content sections

- [x] 4.1 `benefits-section` ("¿Por qué?"): eyebrow + serif H2 + 4 `card-lift` cards (Todo en un lugar / Gratis sin comisiones / Enlace y QR gratis / Listas sugeridas) with colored top borders + gradient icon chips.
- [x] 4.2 `how-it-works-section`: 3 numbered steps (01/02/03) on a connecting gradient line.
- [x] 4.3 `use-cases-section`: 5 event cards (Baby Shower, Cumpleaños, Boda, Nuevo hogar, Wishlist general).
- [x] 4.4 `partners-marquee`: masked auto-scroll strip of store placeholders + "y cualquier tienda con enlace web".
- [x] 4.5 `theme-previews`: 7 gradient swatches (Dulce Rosa, Cielo Suave, Cielo Rosa, Jardín Verde, Crema Elegante, Lavanda Fiesta, Clásico Minimal) with labels.
- [x] 4.6 `guest-finder`: heading + search input + "Buscar" button (visual; behavior deferred to 8.2).
- [x] 4.7 `faq-section`: eyebrow + H2 + question cards (first expanded, rest collapsed visual).

## 5. Example preview (real components)

- [x] 5.1 Add `src/config/demo-wishlist.ts` exporting a `PublicWishlistViewModel` fixture (Crema Elegante wedding "María & Tomás" with available/partial/purchased gifts).
- [x] 5.2 `example-preview` section renders `PublicWishlistPage` in `compact` mode from the fixture; confirm purchase actions are non-interactive.

## 6. Polish, docs, validation

- [x] 6.1 Verify visual parity against `A Wish For.dc.html` §5 (spacing, type scale, alternating backgrounds, colors).
- [x] 6.2 Verify reduced-motion: all animations off, content fully visible; verify no FOUC / no content gated behind JS.
- [x] 6.3 Confirm scoping: app `:root` and seven public themes unchanged when landing is mounted.
- [x] 6.4 Update `docs/TASKS.md` Milestone 8.1 to reflect implemented landing, GSAP + logo decisions, canvas palette, and the folded-in FAQ/guest-finder (8.2) sections.
- [x] 6.5 Run `pnpm check`, `pnpm typecheck`, and `pnpm test`; fix issues.
