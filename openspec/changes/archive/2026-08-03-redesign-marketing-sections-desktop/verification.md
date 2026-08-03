## Redesign marketing sections (desktop) — verification

### Commands

- `pnpm test` — 72 files, 633 tests passed
- `pnpm typecheck` — passed
- `pnpm check` — passed
- `pnpm build` — succeeded; `/` still classifies as `○` (static/prerendered); route list and
  static/dynamic markers are unchanged from the pre-change baseline (confirmed by rebuilding
  `main` via `git stash` and comparing the `Route (app)` tables)
- `pnpm audit:marketing` — see below

### Visual parity at 1240px

Every rebuilt section was visually inspected against the canvas frame at desktop width via a
live production build: occasion picker (four-card grid + single "wishlist general" grid child),
benefits (four photographic cards with overlapping badges), the five-step "Cómo funciona"
timeline (rail, dashed dividers, gradient and dark-glyph thumbnails), the "Ejemplo real" themed
card (topbar, gradient header, staggered collage, countdown, masked scrolling gift grid with
priority/available/partial/purchased states), the guest-finder photographic band (glass input,
lime glow button), the FAQ split with the dark support panel, the final CTA photographic band,
and the footer's new dark newsletter band. All match the encoded canvas values (colors,
radii, spacing, copy) recorded in `design.md`.

**Finding (pre-existing, out of scope):** the footer brand mark at
`src/components/layouts/marketing/marketing-footer.tsx` references
`/assets/awishfor-logo.svg`, which does not exist under `public/assets/` (only `logo.svg` does),
so the brand image 404s and falls back to alt text. This line was already present before this
change and sits in the footer body, which this change declares unchanged — not fixed here.

### Reflow below `lg`

Code-level review (the browser session's viewport could not be resized below its default width
in this environment, so this was verified by inspecting the responsive classes rather than a
live narrow screenshot):

- Two real gaps were found and fixed during this pass: `faq-section.tsx`'s root was a bare
  `flex` (no column fallback), and `example-preview.tsx`'s gift grid was a fixed `grid-cols-3`.
  Both would have compressed illegibly below `lg`. Fixed to `flex-col lg:flex-row` and
  `grid-cols-2 sm:grid-cols-3` respectively (matching the pattern already used by
  `occasion-picker-section.tsx` / `benefits-section.tsx` and the pre-existing gift-grid
  breakpoint).
- The example-preview's three-photo collage stays a fixed `grid-cols-3` — it is decorative
  imagery with no text or interactive content, so narrowing it doesn't create a legibility or
  tap-target regression, and matching its mobile composition is explicitly deferred to
  `redesign-marketing-sections-mobile`.
- All touch targets in the rebuilt sections (guest-finder's `Buscar`, the newsletter's
  `Unirme`, FAQ's support-panel CTA, social icons) use the existing `44px`-minimum sizing
  already established by `m-btn` / `h-11 w-11` conventions.

### Performance audit

`pnpm audit:marketing` was run against this change **and** against the unmodified `main`
baseline (via `git stash`) for comparison, since the script gates on the whole route rather than
just the sections this change touches.

| Profile (this change) | Performance | LCP | CLS | TBT | JS | Fonts | Transfer |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Mobile median | 100 | 536 ms | 0.000 | 0 ms | 146.6 KiB | 85.1 KiB | 272.7 KiB |
| Desktop | 100 | — | — | — | — | — | — |

Both the `main` baseline and this change's build pass the Lighthouse performance score (100)
and the JS/CSS/transfer figures this change is responsible for (well within the 220 KiB JS,
100 KiB font-preload, and 800 KiB transfer budgets). The font-preload count stays at **2**
(Inter, Lora) — JetBrains Mono is a third `@font-face` with `font-display: optional` and no
`<link rel=preload>`, as required.

**Both runs fail the same budget check for the same pre-existing, out-of-scope reason:** the
`hero-occasion-rotation` feature's ambient rotation timer (`hero-rotator-driver.tsx`) starts
after page load without requiring visitor interaction, and after ~6.5s swaps in a full-size,
unoptimized occasion photograph (`loading="eager"`) from `public/assets/hero/` — several of
which are multi-megabyte originals (e.g. `zhouxing-lu-wz52C93GD78-unsplash.jpg` at 913.7 KiB,
`photo-1503266980949-bd30d04d0b7a.jpeg` at 910.7 KiB). Depending on which occasion the
rotation's randomized selection lands on, this trips either the "high-priority content images"
or the "total transfer" budget. This reproduces identically on `main` before any of this
change's edits, so it is not a regression introduced here — it belongs to the
`hero-occasion-rotation` capability (first fold / nav, explicitly out of scope for this change)
and is recorded here as a finding for a follow-up fix (either re-encode the swapped occasion
photos or gate the ambient timer behind the "visitor activity" condition its own landed spec
already requires).

The two new band photographs added by this change
(`guest-finder-band.jpg` 174 KiB / `-mobile.jpg` 17 KiB, `final-cta-band.jpg` 122 KiB /
`-mobile.jpg` 23 KiB) are lazy, non-priority, and did not appear as high-priority or preloaded
in either audit run.

### Image asset scope note

Task 3.1 called for removing the unused multi-megabyte hero originals after re-encoding. Both
source originals (`photo-1492725764893-90b379c2b6e7.jpeg`, `photo-1519741497674-611481863552.jpeg`)
are still actively referenced by the out-of-scope `hero-occasion-rotation` feature (the ambient
rotation background for "baby-shower" and the card thumbnail for "boda" in
`hero-card-carousel.tsx`), so they were kept in place and new, distinctly-named optimized files
were added instead for the guest-finder and final-CTA bands.

### Section order / unaffected areas

Confirmed via `git diff --stat`: only the eight rebuilt section components, the footer's band
(not its body), `marketing.css`, `demo-wishlist.ts`, `public-presentation.ts`,
`example-preview.test.tsx`, and `not-found.tsx` changed, plus the three dead-attribute-only
diffs in `theme-previews.tsx` / `use-cases-section.tsx` / `partners-marquee.tsx`. `page.tsx`,
`marketing-nav.tsx`, the first fold, and the footer body are untouched. Section order was not
reordered.

### Deferred / accepted departures (recorded per proposal.md)

- **Mobile fidelity is deferred** to `redesign-marketing-sections-mobile`. This change
  guarantees only a safe reflow below `lg` (see above), not canvas parity at 390px.
- **Currency departure:** the example preview renders gift prices in **PEN** via
  `formatMoney`, not the canvas's MXN figures, because the creation wizard and store catalogue
  are PEN/Peru-first. Recorded in `demo-wishlist.ts` and `design.md`.
