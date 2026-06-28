## Context

`/` is still the create-t3 placeholder (`src/app/page.tsx`). The Claude Design brief now ships a finished desktop landing — `A Wish For.dc.html` §5, "Marketing / landing · desktop · light green theme" — that we will implement faithfully. The design is delivered as static HTML/CSS using raw CSS keyframes; we convert structure to React (RSC + client islands) and animations to GSAP, the user's requested engine.

Existing building blocks we reuse:
- `PublicWishlistPage` (`src/components/layouts/public-wishlist/public-wishlist-page.tsx`) already supports a `compact` mode → powers the "Ejemplo real" block.
- The seven public themes, fonts (`Lora`/`Inter` via `next/font`), and shared DS components already exist.
- Clerk `<SignedIn>/<SignedOut>` for auth-aware nav.

Constraint from CLAUDE.md: middleware is `src/proxy.ts`; env vars go through `src/env.ts`; pnpm + Biome; Prisma client at `@/generated/prisma/client` (not relevant here).

### Design source — exact values (from the canvas)

Marketing theme tokens (scope to wrapper, NOT `:root`):
```
--mbg:#EEF9E6; --mink:#173E29; --mmut:#4E6E56; --mline:#CCE8BE;
--mrose:#7FB069; --msky:#56A86B; --mlime:#BCE25A; --msun:#F4C84A;
```
Buttons: `.mbtn` pill (`radius 999px`, `padding 14px 26px`, weight 600). Variants: `mbtn-lime` (lime bg, ink `#1B3A12`, glow shadow), `mbtn-pri` (ink bg, white), `mbtn-out` (transparent, `--mline` border).
Section rhythm: most sections `padding:76px 44px`, alternating backgrounds `#fff` / `#F0FAE8` / `#E8F5DC`, separated by `1px solid var(--mline)`. Serif headings (`Lora`) at 40px for section H2, 62px hero H1; eyebrows in `JetBrains Mono`, letter-spacing `.16em`, uppercase.
Hero: two-column grid `1.1fr .9fr`; left = badge ("Wishlists con buena vibra ✨") + shimmer headline ("Crea una wishlist hermosa…") + subcopy + CTAs + stats strip (+10 mil / 4.9★ / 100%); right = rotated/bobbing public-card mock with a floating "¡Set de pañales marcado!" toast and spinning sun chip. Ambient: blurred lime/green blobs + radial dot grid + floating emoji 🎁🌿✨🎉.
Final CTA: dark-green band `linear-gradient(150deg,#1B4A30,#0F3320 60%,#0A2218)` with blurred blobs + floating emoji, white serif headline, lime CTA, then footer bar `background:var(--mink)`.

### Design animations → GSAP mapping

| Design CSS keyframe | GSAP equivalent |
|---|---|
| `.rise/.rise2/.rise3` (staggered fade-up) | `ScrollTrigger` batch, `y:22→0, opacity:0→1`, stagger via delay |
| `.floaty/.floaty2/.floaty3` (blob/emoji float) | looping `gsap.to(y, {yoyo, repeat:-1})` |
| `.bob` (hero card) | yoyo y + slight rotation `1.2deg` |
| `.shimmer` (headline gradient sweep) | animate `background-position` on the gradient-clipped text |
| `.mq` (partner marquee) | `gsap.to(x, -50%)` linear repeat |
| `.mgrad` (mesh gradient shift) | animate `background-position` 0%→100% yoyo |
| `.pulse-dot` | scale/opacity yoyo |
| `.spin-slow` | `rotation:360` linear repeat |
| `.btn-glow` | box-shadow pulse yoyo |

## Goals / Non-Goals

**Goals:**
- Pixel-faithful desktop landing matching `A Wish For.dc.html` §5.
- GSAP + ScrollTrigger as the single animation engine, fully gated by `prefers-reduced-motion`.
- Light-green theme scoped so it cannot leak into app or public-wishlist themes.
- Example block reuses the real `PublicWishlistPage` (single source of truth).
- Logo asset used in nav/footer.

**Non-Goals:**
- Mobile-perfect responsive polish beyond a reasonable stack-down (design is desktop; responsive is a follow-up — keep markup fluid but don't chase the mobile comp).
- Functional guest list-finder search and functional FAQ accordion logic (render the UI; wiring search/accordion behavior can be a thin follow-up — FAQ first item open, rest static is acceptable for MVP visuals).
- Pricing/testimonials (explicitly out per TASKS.md 8.1).
- Replacing the seven public themes or app tokens.

## Decisions

### D1 — Route: `(marketing)` group owning `/`
Create `src/app/(marketing)/layout.tsx` + `src/app/(marketing)/page.tsx`; delete the placeholder `src/app/page.tsx`. The group layout mounts the marketing theme wrapper and the GSAP provider. Rationale: isolates marketing chrome/theme from app and public routes; keeps `/` a clean RSC shell. `/` is added to `createRouteMatcher` public routes in `src/proxy.ts`.
Alternative (keep `src/app/page.tsx`): rejected — a route group gives a dedicated layout for theme + animation context without polluting the global layout.

### D2 — Theme scoping via `.marketing-theme` wrapper class
Define the `--m*` tokens under a `.marketing-theme` selector in `src/styles/globals.css` (static, no per-element inline styles). The group layout adds `className="marketing-theme"`. This mirrors the existing `.public-theme` scoping pattern. Rationale: zero leakage, matches established convention, no runtime style injection.
Alternative (inline style vars like PublicThemeProvider): unnecessary — marketing has exactly one fixed theme, so a static class is simpler.

### D3 — Section components in `src/components/layouts/marketing/`
One component per section: `marketing-nav`, `marketing-hero`, `benefits-section`, `how-it-works-section`, `use-cases-section`, `partners-marquee`, `theme-previews`, `example-preview`, `guest-finder`, `faq-section`, `final-cta`, `marketing-footer`. `page.tsx` composes them. Pure presentational sections stay RSC; only those needing GSAP/Clerk are client components. Rationale: matches `src/components/layouts/*` convention; keeps each section reviewable and the JS island surface minimal.

### D4 — GSAP integration: client provider + `useGSAP`-style hook
Add `gsap` dependency. Create `src/lib/gsap/` with a `GsapProvider` (client) that registers `ScrollTrigger` once and a `useReducedMotion` guard, plus small hooks (`useScrollReveal`, ambient loop helpers) using `gsap.context()` scoped to a ref for automatic cleanup. Animations attach by ref/data-attribute, never by gating content visibility (content renders at final state by default; reveal only animates *from* an offset when motion is allowed). Rationale: `gsap.context()` is the supported React cleanup pattern; ref-scoping avoids global selector collisions; content-visible-by-default keeps the page SSR-safe and accessible.
Alternative (Framer Motion): rejected — user explicitly asked for GSAP, and ScrollTrigger maps cleanly to the design's scroll behaviors.

### D5 — Example block via `PublicWishlistPage` compact + demo fixture
Add `src/config/demo-wishlist.ts` exporting a `PublicWishlistViewModel` fixture (Crema Elegante wedding "María & Tomás", a few gifts incl. available/partial/purchased). The example section imports `PublicWishlistPage` with `mode="compact"`. Rationale: satisfies the brief's single-source-of-truth requirement and avoids a parallel mock that can drift. The design's own hero mini-card stays a bespoke static mock (it's a stylized teaser, not the real component).

### D6 — Logo usage
Use `next/image` (or inline `<img>`/SVG) pointing at `/assets/awishfor-logo.svg` in nav and footer with `alt="A Wish For"`. The footer's dark band keeps the text wordmark per design but nav uses the logo; confirm contrast on light nav background.

### D7 — Fonts
Reuse the existing `next/font` `Lora`/`Inter`. The design also references `JetBrains Mono` (eyebrows) and `Nunito`; add `JetBrains Mono` via `next/font` for eyebrow labels (small, scoped). Nunito is not required (it's the design tool's alt pairing) — skip unless an eyebrow needs it.

## Risks / Trade-offs

- **GSAP bundle weight on the marketing entry** → Import `gsap` + `ScrollTrigger` only in the marketing client islands (not global), so other routes don't pay for it.
- **Hydration/flash with scroll reveals** → Render content visible by default; GSAP sets the "from" offset on mount inside `gsap.context()` after hydration, and is skipped entirely under reduced motion — no FOUC, no hidden-until-JS content.
- **Theme token collision** → All marketing tokens are `--m*`-prefixed under `.marketing-theme`; verified not to overlap app/public token names (`--bg`, `--primary`, etc. stay untouched).
- **Design vs TASKS.md palette drift** → TASKS.md 8.1 listed slightly different greens (`#F1F7EC` bg, `#5E7865` sage). The canvas file is the source of truth; use the canvas values and update TASKS.md to match.
- **Desktop-only comp** → Stacking on mobile is best-effort; explicit mobile comp is a follow-up (non-goal) to avoid scope creep.

## Migration Plan

1. Add `gsap` dependency; add `JetBrains Mono` font registration.
2. Add scoped `.marketing-theme` tokens to `globals.css`.
3. Build section components + `(marketing)` route; delete placeholder `page.tsx`.
4. Add `/` to public routes in `proxy.ts`.
5. Wire GSAP provider/hooks with reduced-motion guard.
6. Add `demo-wishlist.ts`; wire example block.
7. Update `docs/TASKS.md` 8.1.
8. Verify `pnpm check`, `pnpm typecheck`, `pnpm test`, and visual parity.

Rollback: revert the route group and restore the old `page.tsx`; no data/schema changes, so rollback is code-only.

## Open Questions

- Should the FAQ accordion and guest-finder search be functional now or stubbed visually (current plan: visual, behavior deferred to Milestone 8.2)?
- Confirm the logo renders legibly at nav size on the `#EEF9E6` background, or whether a mono/wordmark variant is preferred there.
