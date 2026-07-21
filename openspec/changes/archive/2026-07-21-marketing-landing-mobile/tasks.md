## 1. Prerequisite

- [x] 1.1 Confirm `marketing-landing-desktop` has landed (occasion-picker section exists, shadcn/Tailwind fidelity pass done) before starting — this change extends that base.
- [x] 1.2 Pull the canvas's "Marketing / landing · móvil · 390px" frame visually (via `claude_design` MCP `render_preview` + browser screenshot, not just text) to confirm exact column counts and spacing for the open questions in this change's design.md.

## 2. Mobile nav

- [x] 2.1 Build a mobile nav variant in `marketing-nav.tsx`: logo, condensed "Crear" CTA, "≡" trigger, visible below `md`.
- [x] 2.2 Wire the trigger to a shadcn `Sheet` drawer containing the full link set (Cómo funciona, Ocasiones, Iniciar sesión/Dashboard via Clerk `<SignedIn>/<SignedOut>`, Crear mi wishlist), dismissible via close control / outside click / Escape.
- [x] 2.3 Keep the existing full inline nav at `md:`+ unchanged.

## 3. Hero mobile treatment

- [x] 3.1 Add the shorter mobile headline/body copy to `marketing-hero.tsx`, server-rendered via responsive `hidden`/visible pairing (no client viewport check), switching to the desktop copy at `lg:`.
- [x] 3.2 Stack the hero to a single column below `lg`, scale hero type down from the fixed desktop pixel sizes to a mobile-appropriate base with an `lg:` override.
- [x] 3.3 Confirm the stat strip (+10 mil / 4.9★ / 100%) and the hero card carousel remain legible and don't overflow at 390px.

## 4. Occasion picker, benefits, how-it-works mobile treatment

- [x] 4.1 Add mobile copy/CTA variants to the occasion-picker section ("Crear →" vs desktop "Crear mi lista →") and set its card grid column count per the visual canvas check from task 1.2.
- [x] 4.2 Add shorter mobile headings to `benefits-section.tsx` and `how-it-works-section.tsx` per canvas; collapse card/step grids to single column below `md`/`lg` as appropriate.

## 5. Tiendas aliadas, ejemplo real, temas, guest finder mobile treatment

- [x] 5.1 Add shorter mobile heading to `partners-marquee.tsx`; resolve (via task 1.2) whether the mobile marquee genuinely drops one partner logo or keeps the same list, and implement accordingly.
- [x] 5.2 Confirm `example-preview.tsx` and its embedded compact `PublicWishlistPage` render legibly at 390px; add shorter mobile heading/body per canvas.
- [x] 5.3 Confirm `theme-previews.tsx` swatch grid reflows sensibly at 390px (the full shared-config list, per the `marketing-landing-desktop` fix — not a hardcoded mobile subset).
- [x] 5.4 Add shorter mobile heading/placeholder copy to `guest-finder.tsx`.

## 6. FAQ, final CTA, footer mobile treatment

- [x] 6.1 Confirm the shadcn `Accordion`-based FAQ (from `marketing-landing-desktop`) is already touch-friendly at 390px; adjust spacing if not.
- [x] 6.2 Add the mobile final-CTA copy variant (single 🎁 emoji, shorter headline/body) to `final-cta.tsx`.
- [x] 6.3 Rebuild `marketing-footer.tsx`'s mobile layout: single-column flat link list (Cómo funciona, Temas, Ejemplos, FAQ, Términos, Privacidad) below `md`, existing 3-column grid at `md:`+; drop the `awishfor.com` domain mention from the mobile copyright line.

## 7. Touch targets and animation gating

- [x] 7.1 Audit every interactive element (buttons, links, nav items, accordion triggers, nav drawer trigger/items, carousel dots) below `md` and ensure a minimum 44×44px hit area, padding out visually-smaller targets as needed.
- [x] 7.2 In `use-marketing-animations.ts`, gate mesh-gradient drift and floating blob/emoji loop registration behind a `md`-and-above viewport check, independent of `prefers-reduced-motion`; leave scroll-reveal, shimmer, and count-up ungated (still subject to `prefers-reduced-motion` as already implemented).

## 8. Responsive CSS

- [x] 8.1 Add `@media`/responsive rules to `marketing.css` only for values Tailwind's responsive utilities can't express; prefer `sm:`/`md:`/`lg:` Tailwind classes on components for everything else, following the mobile-first-base/desktop-override convention from this change's design.md. (No raw `@media` rules were needed — every mobile treatment was expressible with Tailwind responsive utilities.)

## 9. Validation

- [x] 9.1 Run `pnpm check`, `pnpm test`, and `pnpm typecheck`; fix any failures.
- [x] 9.2 Note as a session-end reminder: manually verify the landing page at 390px and at the desktop breakpoint in a browser (nav drawer open/close/focus-trap/Escape, hero, occasion picker, all sections' mobile copy, footer collapse, touch target sizing, animation gating, reduced-motion) — skip automated attempt per workflow rules. (Confirmed desktop still renders correctly with no console/hydration errors; the Chrome tool's `resize_window` did not actually shrink the page's CSS viewport in this environment, so true 390px-viewport verification remains a manual follow-up for the user — see summary.)
