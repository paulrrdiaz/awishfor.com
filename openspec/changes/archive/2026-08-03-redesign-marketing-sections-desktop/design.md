# Design

## Source of truth

`A Wish For.dc.html` §5, frame **"Marketing / landing · desktop · light green theme · v2 fotográfica"** (canvas lines 289–433, 1240px artboard, 44px horizontal padding). Values below are taken verbatim from that frame.

The mobile frame **"Marketing / landing · móvil · 390px"** (canvas lines 437–553) exists and is a genuinely parallel design, not a reflow. It is deliberately deferred to `redesign-marketing-sections-mobile`.

## Decisions

### Two changes split by viewport, desktop first

The two artboards disagree structurally in four of the eight sections, so the mobile pass cannot be styling-only — it will reopen markup for the occasion mosaic and the FAQ stack. Splitting by viewport is still preferred over splitting by section because it keeps each change reviewable against one artboard.

To stop the split from causing two rebuilds, this change owns **the DOM contract for both frames**: markup is authored so the mobile frame can be reached by breakpoint rules plus those two known exceptions. All shared foundation — fixture, tokens, font, images, motion cleanup — lands here.

This change is independently shippable. Below `lg` it guarantees a safe reflow only: no regression against today's readability, 44×44 tap targets, or layout stability. It does not claim canvas fidelity below `lg`.

**Alternatives rejected.** Landing both together doubles the review surface and delivers nothing until complete. Mobile-first would put the shared foundation in the mobile change and leave the fully specified desktop frame wrong for longer.

### Breakpoint at `lg` (1024px); tablet follows desktop

Matches the repository's existing convention and the landed spec's use of `lg` for hero copy. The 768–1023 band has no artboard; inventing an intermediate tier would mean authoring a design with no source of truth. Desktop layouts are permitted to compress into that band.

### Single copy set — the desktop strings

The canvas's mobile frame shortens roughly twelve strings and rewrites three headings outright ("Cinco pasos", "Una wishlist publicada", "Tu momento especial merece una página hermosa"). The existing implementation delivers these with paired `lg:hidden` / `hidden lg:block` nodes, which ships both strings in the HTML, exposes hidden duplicates to assistive technology, and duplicates headings for crawlers.

One copy set removes that. The cost is accepted: at 390px the shorter rhythm the designer intended is lost to wrapping.

This **reverses a landed requirement** (`marketing-landing` → "Section content adapts per breakpoint"), which is why the change is marked BREAKING. The hero and proof rail are excluded — their per-breakpoint copy is required by the H2b work and stays.

The sole exception is structural, not textual: the mobile occasion mosaic genuinely omits subtitles and CTA pills from its four small tiles. Those cards remain whole links, so nothing loses function.

### `theme-cielo` is scoped to marketing, not reconciled with `public-themes.ts`

The canvas's `theme-cielo` and the app's `cielo-suave` preset are different palettes:

| token | canvas `theme-cielo` | app `cielo-suave` |
| --- | --- | --- |
| background | `#EEF5FB` | `#f3f8ff` |
| primary | `#8FBEE0` | `#4d8fcf` |
| accent | `#F1EEE7` (warm ivory) | `#fff3d6` (gold) |
| border | `#DCE7F2` | `#c9dff2` |
| muted foreground | `#6C7C95` | `#607a93` |
| placeholder tint | `#DCEAF6` | none |

The preview's header gradient and countdown block read straight off `--accent`, so ivory-versus-gold is plainly visible. Reconciling the preset would change every published wishlist on `cielo-suave` — the default theme — and leave the other eleven presets inconsistent with the canvas. Scoping the canvas values to the preview block instead gives fidelity with no blast radius.

Accepted cost: the section claims to be built "con los mismos componentes públicos" while its palette is marketing-local. The structure and contracts are shared; only the six token values are not.

### One fixture, rewritten to the canvas's baby shower

`DEMO_WISHLIST` currently describes a wedding and is consumed by both the marketing preview and `new-layouts.stories.tsx`. The stories file spreads and overrides it (`{...DEMO_WISHLIST, layoutId, coverImageUrls}`), so it is indifferent to the event type.

Rewriting the single fixture to "Esperando a Mateo" therefore satisfies the canvas without introducing a second near-duplicate dataset to drift. The eight gifts with mixed priority, partial and purchased states also give the layout stories better coverage than the current three available gifts.

Prices stay in **PEN**. The canvas shows MXN figures, but `save-draft.ts` and `draft-to-preview.ts` hardcode PEN and the store catalogue is Peru-first, so MXN in the flagship example would advertise a currency the wizard does not produce. Rendering goes through the existing `money.ts` formatter.

### The preview presentation contract widens

`toMarketingWishlistPreview` currently narrows to title, display name, cover and three gifts, documented as *"No layout registry or purchase state crosses this boundary."* The canvas's card requires exactly that purchase state — `★ Infaltable`, `2 de 4`, `✓ Comprado` with strikethrough, and an "8 disponibles · 7 comprados" summary — plus category, store, countdown and a cover collage.

The boundary widens to carry those **as data for static presentation**. Its real intent is preserved and restated: no layout registry, no purchase flow, no modal code, and no client-side gift behaviour crosses it. Displaying a status badge is not the same as importing the purchase flow.

### JetBrains Mono as a third subset webfont

Every section eyebrow in both canvas frames is `'JetBrains Mono'` (`11px`/`.16em` desktop, `10px`/`.14em` mobile), as are the footer column labels. The current `.m-eyebrow` uses `inherit`, so every eyebrow on the page is off-spec.

It is added as a third `@font-face` following the established self-hosted pattern — subset latin `woff2`, `font-display: optional` — not through `next/font`. The landed guardrail caps **preloaded** font files at three; these are `@font-face` declarations with no `<link rel=preload>`, so the budget is not approached. `authentication` already names "JetBrains Mono eyebrow" as part of the app design language, so this aligns marketing with the rest of the product.

### Mixed image strategy, chosen per role

The route already carries three patterns. This change consolidates to two, split by role:

- **Full-bleed band photographs** (guest finder, final CTA) are localized and optimized like `wedding-hero.jpg`, served from `public/assets/`, lazy and non-priority. Both originals are already present under `public/assets/hero/` as 3.7 MB and 3.8 MB unoptimized files and must be re-encoded before use.
- **Section photography** (benefits headers, timeline thumbnails, collage, gift cards) keeps the existing raw `<img>` plus `?w=&h=&fit=crop&auto=format` pattern established by the current example preview.

Rationale: the two bands are large and design-critical enough to warrant encoding control; the nine small images are not worth the asset-maintenance burden. Localizing everything was rejected on repo-weight and maintenance grounds; routing everything through `next/image` was rejected because it reverses a deliberate choice from the performance work.

### Motion reduces to one effect

`data-glow`, `data-reveal`, `data-reveal-stagger`, `data-float`, `data-float-rev` and `data-float-3` appear across every marketing section and `not-found.tsx` but have **no driver and no stylesheet rule anywhere** — the performance work removed GSAP and the keyframes and left the attributes behind. They are inert markup.

Only the lime CTA glow is reintroduced, as a CSS keyframe on `box-shadow` gated by `prefers-reduced-motion`. The remaining attributes are deleted. The final CTA's decorative blobs and floating emoji are removed outright, since the canvas replaces that whole treatment with a photograph.

Nothing in `web-performance-guardrails` or `marketing-landing` forbids a continuous animation; `hero-occasion-rotation` mandates one. So no guardrail changes.

### Fidelity is enforced by encoded values, not pixel diffs

The repository has Vitest and Storybook but no Playwright, Chromatic or screenshot tooling. Pixel diffing would be flaky against remote photography and `font-display: optional` swap timing, and adding that toolchain is a larger commitment than this change warrants.

Instead: exact values become testable requirements in the spec delta; Vitest asserts the structural facts that regress silently (five FAQ items, five steps, gift-state coverage, absence of dead attributes); and visual parity is confirmed by side-by-side comparison at the 1240px artboard width.

## Key measurements from the canvas

Section padding is `76px 44px` unless noted; every section is separated by `1px solid var(--mline)`.

| Section | Background | Heading | Notes |
| --- | --- | --- | --- |
| ¿Qué estás celebrando? | `#fff` | 40px | 4-col grid, gap 16, cards 300px, radius 20 |
| Todo lo que necesitas | `#F0FAE8` | 40px, two lines | photo header 108px; icon badge 44px, radius 13, `left:14px; bottom:-18px`; body `26px 20px 22px` |
| Del primer clic… | `#fff` | 40px | `max-width:760px`; rail `left:26px; width:2px`; rows `padding:20px 0` with `1px dashed`; circle 52px; thumb 92×72, radius 12 |
| Así se ve… | `#fff` | 38px | card `max-width:820px`, radius 22, shadow `0 24px 64px rgba(30,50,80,.14)`; collage `1fr 1.15fr 1fr` at 150/210/150; gift scroll `max-height:300px` |
| ¿Buscas la lista…? | photo | 34px | `min-height:280px`, padding `70px 44px`, overlay `linear-gradient(150deg,rgba(11,30,20,.72),rgba(11,30,20,.55))`; pill input radius 999, `14px 20px`, `backdrop-filter:blur(4px)` |
| Resolvemos tus dudas | `#fff` + `#173E29` | 36px | flex split `1.5` / `1`; support panel `76px 40px`, title 22px |
| Tu próximo momento… | photo | 52px | padding `110px 44px`, `min-height:280px`, overlay `linear-gradient(180deg,rgba(10,30,20,.55),rgba(10,30,20,.86))`; heading `max-width:680px` |
| Ideas para tu próximo evento | `#173E29` | 19px | band `34px 44px`, `border-bottom:1px solid rgba(255,255,255,.12)`; white pill padding 5, input 200px, button `10px 20px` |

Timeline circle ramp: `#BCE25A`/`#1B3A12` → `#9ECD6E`/`#173E29` → `#7FB069`/`#fff` → `#56A86B`/`#fff` → `#173E29`/`#D7F09E`. Step 3's thumbnail is `linear-gradient(135deg,#EEF5FB,#8FBEE0)`; step 5's is `#173E29` with a 🔗 glyph.

Benefit badge colours in order: `#BCE25A`, `#7FB069`, `#56A86B`, `#F4C84A`.

## Risks

- **This change writes markup that the mobile change reopens** in the occasion picker and the FAQ. Accepted: authoring the DOM against both frames keeps that to two sections instead of eight.
- **Losing shorter mobile copy is a real regression at 390px** until the mobile change lands, and is not recovered by it either — that change adopts the same single copy set. This is a deliberate trade of designer-intended rhythm for a clean content model.
- **Rewriting the shared fixture changes what Storybook renders.** Reviewers expecting a wedding in the layout stories will see a baby shower.
- **The two band photographs must be re-encoded before shipping.** Using the 3.7 MB originals as-is would blow the initial transfer budget the moment either band enters the viewport.
