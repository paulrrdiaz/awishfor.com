## Why

`openspec/specs/marketing-landing/spec.md` and its shipped implementation cover only the desktop experience. `src/styles/marketing.css` has zero `@media` rules, `marketing-nav.tsx` has no responsive prefixes at all (it will overflow under ~640px, no hamburger/menu), and the hero uses fixed pixel type (`text-[62px]`) with no small-screen scale-down. The Claude Design canvas has a dedicated frame — `A Wish For.dc.html` §5, "**Marketing / landing · móvil · 390px**" — pulled directly via the `claude_design` MCP, and it isn't just a responsive reflow of the desktop copy: it's a distinct, shorter mobile content pass (condensed headings, shorter body copy, a collapsed single-column footer, a hamburger nav) matching the project's stated "mobile is the real product, 390px first" principle. The landing page — the top of the funnel — currently has none of this.

## What Changes

Sourced directly from the canvas's mobile frame content (captured via `claude_design` MCP), section by section:

- **Nav**: replace the flat flex row with a condensed mobile nav — logo, a short "Crear" CTA, and a "≡" hamburger opening a shadcn `Sheet` drawer with the full link set (Cómo funciona, Ocasiones, Iniciar sesión/Dashboard, Crear mi wishlist). Full inline nav stays at `md:`+.
- **Hero**: shorter mobile headline ("Crea una wishlist hermosa para tus momentos.") and shorter body copy than desktop's (no "con temas hermosos" / trailing sentence — the canvas mobile copy is intentionally more compact, not a truncation bug). Stack to one column, scale type down from the fixed 62px desktop size, keep the stat strip but let it wrap/scroll if needed at 390px.
- **Occasion picker** (new section, added by `marketing-landing-desktop`): mobile CTA copy is shorter ("Crear →" instead of "Crear mi lista →"); cards likely stack to a single column or 2-column grid at this width — confirm exact grid via canvas.
- **Benefits, how-it-works, tiendas aliadas, ejemplo real, temas, guest finder, FAQ**: each has shorter mobile headings/body copy per the canvas (e.g. "Todo lo que necesitas" instead of "Todo lo que necesitas, sin complicaciones"; "Cuatro pasos" instead of "Cuatro pasos. Cero complicaciones."). Cards/grids collapse to single column.
- **Final CTA**: single emoji (🎁) instead of the desktop's three, shorter headline/body.
- **Footer**: collapses from the desktop's 3-column link grid (Producto / Ocasiones / Legal) to a single flat link list (Cómo funciona, Temas, Ejemplos, FAQ, Términos, Privacidad), copyright line drops the `awishfor.com` domain mention.
- Ensure all touch targets meet the project's 44px minimum (buttons, chips, nav links, accordion triggers, hamburger toggle).
- Gate/simplify GSAP ambient animations (mesh drift, floating blobs/emoji, marquee) for small viewports where it helps performance, while keeping the existing `prefers-reduced-motion` fallback intact — do not regress desktop motion.
- Use shadcn primitives first (`Sheet` for the nav drawer; `Accordion`/`Carousel` already established by the desktop pass) and Tailwind responsive utilities as the fallback for layout/spacing — no new bespoke CSS beyond the existing scoped `marketing.css` tokens.
- No route, data, or API changes — this extends the existing `/` route's presentation to small viewports, with section-specific mobile copy where the canvas specifies it.

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `marketing-landing`: adds mobile/responsive requirements (nav drawer behavior, per-section mobile copy and breakpoint behavior, touch-target minimums, mobile animation gating, collapsed footer) to the existing landing spec, which today only specifies desktop behavior.

## Impact

- `src/components/layouts/marketing/*.tsx` (all landing section components — mobile copy variants + responsive classes, primarily `marketing-nav.tsx`, `marketing-hero.tsx`, `marketing-footer.tsx`, and the new `occasion-picker-section.tsx` from `marketing-landing-desktop`)
- `src/styles/marketing.css` (add `@media`/responsive scoped rules)
- `src/lib/gsap/use-marketing-animations.ts` (viewport-conditional animation gating, if needed)
- No schema, env, or API impact.
- Depends on `marketing-landing-desktop` landing first — it adds the occasion-picker section and the shadcn/Tailwind conventions this change extends to small viewports, so applying mobile work against the old implementation would mean redoing it.
