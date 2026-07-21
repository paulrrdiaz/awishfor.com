## 1. Canvas reference

- [x] 1.1 Pull the current "Marketing / landing · desktop · V2 fotográfica" frame content from `A Wish For.dc.html` §5 via the `claude_design` MCP (already captured in this change's proposal/design — re-pull only if apply happens much later and the canvas may have moved further) for exact copy/spacing reference.

## 2. Occasion picker section (new)

- [x] 2.1 Add `type` query-param seeding to the wizard: read `?type=` on `/create` and call the existing event-type setter in `src/stores/wishlist-wizard.store.ts` before step 1 renders (in `event-type-step.tsx` or `WizardProvider`).
- [x] 2.2 Build a new `occasion-picker-section.tsx` under `src/components/layouts/marketing/`: eyebrow "Para cada celebración" (or canvas's exact eyebrow), heading "¿Qué estás celebrando?", body copy, four cards (Baby Shower, Boda, Cumpleaños, Nuevo hogar) each linking to `/create?type=<event-type>` with a "Crear mi lista →" CTA, and a "¿Otra ocasión? Crea una wishlist general →" link to plain `/create`. — Used canvas's exact eyebrow "Elige tu ocasión" (pulled live via `claude_design` MCP); no real photos (repo convention avoids external stock-photo deps), used per-occasion theme-color gradients + emoji instead.
- [x] 2.3 Insert the new section into `src/app/(marketing)/page.tsx` immediately after `<MarketingHero />`.
- [x] 2.4 Apply the existing GSAP reveal `data-*` hooks to the new section, matching sibling sections' pattern.

## 3. Nav and hero fixes

- [x] 3.1 Add an "Ocasiones" link to `marketing-nav.tsx` that anchor-scrolls to the new occasion-picker section (mirroring how "Cómo funciona" already anchor-scrolls to `#como-funciona`).
- [x] 3.2 Fix the hero body copy in `marketing-hero.tsx` to match the canvas in full: "...personaliza tu página con temas hermosos y compártela con tus invitados por enlace, WhatsApp o QR. Ellos marcan lo que compran para no repetir."

## 4. How-it-works fix

- [x] 4.1 Update `how-it-works-section.tsx`: heading "Cuatro pasos. Cero complicaciones.", 4 steps (01 Elige tu ocasión, 02 Crea y personaliza, 03 Agrega tus regalos, 04 Comparte tu enlace) with the canvas's body copy for each; adjust the grid from 3 to 4 columns and the connecting line accordingly.

## 5. FAQ and guest finder — content + shadcn primitives

- [x] 5.1 Confirm with the user whether to add "¿Necesito crear una cuenta?" as a 6th FAQ question or replace "¿Cómo comparto mi lista?" with it; apply the decision to `faq-section.tsx`. — User chose to add as 6th question.
- [x] 5.2 Resolve the guest-finder canvas pattern (typeahead vs. simple filter) via `claude_design` MCP. — Canvas confirms a plain input + "Buscar" button, no typeahead. Aligned body copy to canvas wording ("Encuentra su wishlist por nombre o por enlace.").
- [x] 5.3 Rebuild `faq-section.tsx` on shadcn `Accordion`, preserving existing GSAP `data-*` reveal hooks. — Already implemented in a prior session; verified against canvas.
- [x] 5.4 Rebuild `guest-finder.tsx` on shadcn `Input`/`Button` (or `Command` per 5.2), preserving existing GSAP `data-*` reveal hooks. — Already implemented in a prior session (plain Input/Button, matches canvas); verified against canvas.

## 6. Theme swatches correctness

- [x] 6.1 Confirm `theme-previews.tsx` renders from the full `src/config/public-themes.ts` list (not a hardcoded 7-entry array) so it stays correct as the shared config grows; fix if it's hardcoded. — Was a hardcoded 12-entry array (also had a stale "Cielo Rosa" label vs. config's "Cielo Suave Rosa"); now maps `getAllThemes()` directly.

## 7. Remaining sections audit

- [x] 7.1 Compare `benefits-section.tsx`, `partners-marquee.tsx`, `example-preview.tsx`, `final-cta.tsx`, `marketing-footer.tsx`, `hero-card-carousel.tsx` against the canvas for further copy/spacing drift; fix what's found, document what's an intentional enhancement (e.g. the carousel itself) rather than reverting it. — Fixed: benefits card 1/3 body copy, card 4 icon color+gradient+body; partners-marquee missing "ripley" store + subtitle copy. `final-cta.tsx` and `marketing-footer.tsx` already match. `example-preview.tsx`'s body copy ("en modo compacto" vs canvas's "con fotos reales") is an intentional deviation — the demo wishlist has no real photos, and canvas's "Ver ejemplo completo →" button has no real destination (no live route backs the demo slug) so it's intentionally omitted rather than added as a dead link — out of this change's no-new-routes scope. `hero-card-carousel.tsx` kept as documented intentional enhancement per design.md.
- [x] 7.3 (follow-up) Add real Unsplash photos across the photographic sections that were still placeholder/gradient: `occasion-picker-section.tsx` (canvas-exact photo IDs, verified live), `hero-card-carousel.tsx` (redesigned each slide with a full photo banner + real gift-thumbnail photos, per user decision to match the canvas's photographic hero), and `demo-wishlist.ts` (cover photo + 3 gift photos for the "Un ejemplo real" section). Added `images.unsplash.com` to `next.config.ts` remote patterns. All photo IDs were downloaded and visually verified (via Read) before use — two canvas-transcribed IDs turned out to be mistranscribed (resolved to a welding photo and a vase photo instead of crystal glasses/dinnerware) and were caught and replaced this way.
- [x] 7.2 Convert inline `style={{ ... }}` values across all landing components to Tailwind utility classes where a direct Tailwind equivalent exists; leave only values `marketing.css`'s scoped tokens or GSAP selectors require. — Converted all static, non-data-driven inline styles in `marketing-hero.tsx`, `final-cta.tsx`, `how-it-works-section.tsx` (connecting line), and `example-preview.tsx` to Tailwind arbitrary-value utilities. Added `.m-mesh`/`.m-dot-grid`/`.m-cta-bg` to `marketing.css` for the two recurring multi-stop gradient backgrounds tied to `[data-mesh]`. Remaining `style={{ ... }}` usages are all genuinely data-driven per-item values from arrays/config (benefits card colors, how-it-works step colors, hero-card-carousel example colors, theme-previews swatch gradients, occasion-picker/use-cases card gradients) — Tailwind can't express these since class names must be static at build time, so they correctly stay as inline styles.

## 8. CSS cleanup

- [x] 8.1 Grep `use-marketing-animations.ts` for every class/selector it targets; confirm which `marketing.css` rules are load-bearing for GSAP vs. purely presentational. — GSAP exclusively targets `[data-*]` attribute selectors (`data-reveal`, `data-float(-rev|-3)`, `data-bob`, `data-shimmer`, `data-marquee`, `data-mesh`, `data-pulse`, `data-spin`, `data-glow`); it never selects by class. No class rename/removal risk on that front — `marketing.css` classes only need to stay in sync with markup usage.
- [x] 8.2 Trim `marketing.css` to scoped theme tokens, shimmer gradient, and GSAP-target rules only; remove rules now redundant with Tailwind classes applied in task 7.2. — Verified every class in the file (`m-serif`, `m-eyebrow`, `m-btn*`, `m-card`, `card-lift`, `m-shimmer`, `m-blob`, `m-marquee-*`, `m-ph*`, `m-badge*`, plus the new `m-mesh`/`m-dot-grid`/`m-cta-bg`) is still referenced in a marketing component — nothing redundant to remove.

## 9. Validation

- [x] 9.1 Run `pnpm check`, `pnpm test`, and `pnpm typecheck`; fix any failures. — `pnpm check:write` fixed formatting in 3 files; `pnpm check` clean; `pnpm typecheck` clean; `pnpm test` 547/547 passed.
- [x] 9.2 Note as a session-end reminder: manually verify the desktop landing page in a browser against the canvas (nav, hero, occasion picker, how-it-works, FAQ accordion, guest finder, animations, reduced-motion) — skip automated attempt per workflow rules. — Reminder logged below; not performed this session per workflow rules.
