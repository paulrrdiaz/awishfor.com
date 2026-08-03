## 1. Foundation: tokens, fonts, fixture, contract

- [x] 1.1 Add the JetBrains Mono latin subset `woff2` under `public/assets/fonts/` and declare it in `marketing.css` following the existing `@font-face` pattern with `font-display: optional`
- [x] 1.2 Point `.m-eyebrow` at the monospace family with the canvas letter-spacing, size and uppercase transform, and verify no `<link rel=preload>` font count regression
- [x] 1.3 Add marketing-scoped `theme-cielo` token values (`--bg`, `--fg`, `--card`, `--primary`, `--accent`, `--border`, `--muted-fg`, `--ph-tint`, `--radius`) to `marketing.css`, scoped to the example-preview block only
- [x] 1.4 Rewrite `src/config/demo-wishlist.ts` to the canvas baby shower: "Esperando a Mateo", Ana & Diego, event date, venue, `cielo-suave`, three cover collage images, and eight gifts spanning priority, available, partial and purchased states — keeping `currency: "PEN"`
- [x] 1.5 Widen `MarketingWishlistPreviewViewModel` and `toMarketingWishlistPreview` to carry event eyebrow, cover collage, countdown source date, availability counts, and per-gift category, store, price, priority, status and remaining quantity
- [x] 1.6 Rewrite the mapper docstring so it forbids layout registry, purchase flows, modal code and client gift behaviour while permitting purchase state as presentation data
- [x] 1.7 Confirm `new-layouts.stories.tsx` still renders every layout against the rewritten fixture without edits

## 2. Motion cleanup

- [x] 2.1 Implement the lime CTA glow as a `box-shadow` keyframe in `marketing.css`, gated by `prefers-reduced-motion: reduce`
- [x] 2.2 Apply the glow to the primary lime calls to action the canvas shows glowing, and remove the inert `data-glow` attribute in favour of the class
- [x] 2.3 Delete `data-reveal`, `data-reveal-stagger`, `data-float`, `data-float-rev` and `data-float-3` from every marketing section component and from `not-found.tsx`
- [x] 2.4 Add a test asserting no orphaned motion hook attribute remains in marketing markup

## 3. Image assets

- [x] 3.1 Re-encode the guest-finder and final-CTA band photographs from the existing originals in `public/assets/hero/` into optimized responsive assets and remove the unused multi-megabyte originals from the served path — note: `photo-1492725764893-90b379c2b6e7.jpeg` and `photo-1519741497674-611481863552.jpeg` are still actively used by the out-of-scope `hero-occasion-rotation` feature (hero rotator background + carousel card thumbnail), so the originals were kept and new `guest-finder-band(.jpg|-mobile.jpg)` / `final-cta-band(.jpg|-mobile.jpg)` assets were re-encoded instead
- [x] 3.2 Wire both bands to the local assets with explicit geometry, lazy loading, and no priority or preload hint
- [x] 3.3 Verify a cold trace shows neither band photograph requested before its section approaches the viewport, and the hero remains the sole high-priority image — confirmed via `pnpm audit:marketing`; see `verification.md` for the pre-existing, out-of-scope `hero-occasion-rotation` finding that separately affects this budget

## 4. Rebuild the sections at 1240px

- [x] 4.1 `occasion-picker-section.tsx` — keep the four-card grid, and convert the "wishlist general" affordance into a single grid child that renders as the centered text link at `lg`
- [x] 4.2 `benefits-section.tsx` — background to `#F0FAE8`, 108px photographic header per card, overlapping 44px icon badge at `left:14px; bottom:-18px`, body padding `26px 20px 22px`, two-line heading
- [x] 4.3 `how-it-works-section.tsx` — replace the four horizontal steps with the five-step vertical timeline: `max-width:760px`, 2px rail at `left:26px`, dashed row dividers, 52px circles on the canvas colour ramp, 92×72 thumbnails including the gradient and dark-glyph tiles, wizard-aligned copy, background to `#fff`
- [x] 4.4 `example-preview.tsx` — rebuild as the themed card: status topbar, gradient event header, staggered collage at 150/210/150, countdown block, availability summary, masked `max-height:300px` scrolling three-column gift grid with state badges and struck-through purchased gifts, and the "Ver ejemplo completo →" action
- [x] 4.5 `guest-finder.tsx` — full-bleed photographic band with the canvas overlay, white type, glass pill input with `backdrop-filter`, lime submit, and a reserved-height announced message slot legible over photography
- [x] 4.6 `faq-section.tsx` — flex split with the `1.5`/`1` ratio, five questions with the first expanded, `−`/`+` affordance, and the dark `#173E29` support panel with "Contactar soporte"
- [x] 4.7 `final-cta.tsx` — replace the gradient, blobs and floating emoji with the photographic band and its overlay, 52px heading capped at `680px`, canvas padding
- [x] 4.8 `marketing-footer.tsx` — add the dark `#173E29` newsletter band above the unchanged light footer body, with the labelled email field, "Unirme" control, and the `rgba(255,255,255,.12)` divider
- [x] 4.9 Wire the newsletter submit to a stub that returns a friendly acknowledgement without persisting, mutating, or calling a third party
- [x] 4.10 Confirm every rebuilt section reflows legibly below `lg` with 44×44 touch targets and no layout instability, without claiming canvas mobile fidelity — found and fixed two gaps (FAQ split, gift grid); see `verification.md`

## 5. Tests

- [x] 5.1 Rewrite `example-preview.test.tsx` against the new fixture and composition, covering gift-state coverage, static purchase state, and absence of purchase-flow imports
- [x] 5.2 Add assertions for the five-item FAQ set with the first expanded, the five-step timeline, the four benefit cards, and the single "wishlist general" affordance node
- [x] 5.3 Add a test that each rebuilt section's headings and calls to action appear exactly once in the rendered HTML, with no breakpoint-duplicated strings
- [x] 5.4 Add guest-finder tests for the reserved message slot, the announced error, and unchanged band height between valid and invalid submissions
- [x] 5.5 Add a newsletter band test for label association, keyboard operability, and an acknowledgement that does not assert a stored subscription

## 6. Verification

- [x] 6.1 Run `pnpm check`, `pnpm test`, and `pnpm typecheck`
- [x] 6.2 Capture side-by-side comparisons of all eight sections at the 1240px artboard width against the §5 frame and record them as verification evidence
- [x] 6.3 Run `pnpm audit:marketing` and confirm the landed performance budgets still hold with the added font, photography and animation — passes on the budgets this change owns; see `verification.md` for the pre-existing `hero-occasion-rotation` finding
- [x] 6.4 Confirm the route still classifies as static and its first-load chunk graph is unchanged
- [x] 6.5 Confirm section order, the first fold, nav, "Casos de uso", "Tiendas aliadas", "Temas" and the footer body are untouched
- [x] 6.6 Record the deferred mobile fidelity scope and the PEN-versus-canvas currency departure in the change verification notes
