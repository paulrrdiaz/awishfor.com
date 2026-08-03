## Why

Eight landing sections below the first fold were built before the design canvas reached its "v2 fotográfica" state and have since drifted from it. Six of them are structurally different from `A Wish For.dc.html` §5 rather than merely mis-styled: the benefits row has no photography, "Cómo funciona" shows four horizontal steps instead of five in a vertical timeline, the example preview is a generic cover-plus-three-cards card instead of the themed wishlist mock, the guest finder and final CTA use flat fills instead of full-bleed photographic bands, the FAQ is a centered accordion instead of a split with a support panel, and the newsletter band does not exist at all.

The first fold was brought to canvas fidelity by the H2b work and the route was made fast by the marketing-performance work. The sections below it are now the weakest part of the page, and the canvas has a fully specified desktop frame for every one of them.

## What Changes

- Rebuild the "¿Qué estás celebrando?", "Todo lo que necesitas, sin complicaciones", "Del primer clic a tu lista publicada", "Así se ve una wishlist publicada", "¿Buscas la lista de alguien?", "Resolvemos tus dudas", "Tu próximo momento especial merece una página hermosa" and "Ideas para tu próximo evento" sections to match the §5 desktop artboard at 1240px.
- Introduce the newsletter band as the top strip of the existing footer, dark `#173E29` above the unchanged light `#EEF9E6` footer body, with a real accessible form whose submission is handled by a stub pending a separate subscription capability.
- Replace the four-step horizontal "Cómo funciona" with the canvas's five-step vertical timeline whose copy mirrors the real creation wizard.
- Rebuild the example preview as the themed wishlist mock the canvas specifies: status topbar, gradient header, staggered three-photo collage, countdown block, availability counts, and a masked scrolling gift grid whose cards carry priority, partial-purchase and purchased states.
- Rewrite `src/config/demo-wishlist.ts` to the canvas's baby-shower example so the marketing preview and the public-wishlist Storybook layouts share a single fixture with richer gift states.
- Widen the marketing preview presentation contract so purchase state, category, store, availability counts, countdown and cover collage can cross it.
- Scope the canvas's `theme-cielo` token values to the marketing preview only, leaving `src/config/public-themes.ts` untouched.
- Add JetBrains Mono as a third subset marketing webfont so section eyebrows use the monospace treatment the canvas and the app design language both specify.
- Localize and optimize the two full-bleed band photographs; keep the remaining section photography on the existing URL-sized lazy pattern.
- Implement the lime CTA glow as a reduced-motion-aware CSS animation, and delete the `data-reveal`, `data-reveal-stagger`, `data-float`, `data-float-rev`, `data-float-3` and `data-glow` attributes that no longer have any driver or stylesheet behind them.
- Reduce the FAQ from six questions to the canvas's five.
- **BREAKING:** Sections below the first fold no longer render distinct shorter mobile copy. A single copy set — the approved desktop strings — renders at every viewport. The hero and its proof rail are unaffected.
- **BREAKING:** "Cómo funciona" no longer renders four steps numbered 01–04. It renders five steps whose titles and bodies come from the §5 frame.
- **BREAKING:** The FAQ no longer includes "¿Cómo comparto mi lista?".

## Capabilities

### Modified Capabilities

- `marketing-landing`: Changes the structure, composition, typography and motion of the eight below-the-fold sections named above, the fixture and presentation contract behind the example preview, and the per-breakpoint copy rule. Section order, the first fold, the nav, "Casos de uso", "Tiendas aliadas", "Temas" and the footer body are unchanged.

## Impact

- Affected code: the eight marketing section components, `marketing-footer.tsx` (band only), `marketing.css`, `src/config/demo-wishlist.ts`, `src/lib/wishlist/public-presentation.ts`, `src/components/layouts/marketing/example-preview.test.tsx`, `not-found.tsx` (dead attribute removal), and two optimized photographs under `public/assets/`.
- `src/components/layouts/public-wishlist/new-layouts.stories.tsx` continues to work unchanged because it spreads and overrides the fixture, but its stories will render a baby shower instead of a wedding.
- No Prisma schema, migration, tRPC contract, Clerk configuration, or environment variable changes. The newsletter form posts to a stub; the persistent capability is deliberately deferred.
- `web-performance-guardrails` is not modified. The added webfont is a third `@font-face` rather than a preload, the two band photographs are below the fold and non-priority, and nothing in the landed guardrails forbids a compositor-only CTA animation. Both a production audit and the fidelity checks are carried as verification evidence.
- Mobile is explicitly out of scope for fidelity. This change guarantees only that every rebuilt section reflows below `lg` without regressing today's readability, tap targets, or layout stability. Matching the canvas's 390px frame is the separate `redesign-marketing-sections-mobile` change, which depends on the DOM contract this change establishes.
- Prices in the example preview render in PEN through the existing formatter, a deliberate departure from the canvas's MXN figures, so the marketing example matches what a visitor actually gets in the wizard.
- Out of scope and recorded as findings: the landing section order, `UseCasesSection`, `PartnersMarquee`, `ThemePreviews`, the footer body, and the product-wide locale inconsistency between the Peru-first draft/currency/store defaults and the "Hecho con cariño en México" footer line.
