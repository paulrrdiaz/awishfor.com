## Why

The `HeroCinematic` public wishlist layout (and the shared `Countdown` / welcome-message pieces it composes) already exist in code but drift from the Claude Design source (`A Wish For.dc.html`, artboard `01 · HeroCinematic · Crema Elegante · Boda`): wrong subtitle field, missing date in the eyebrow, theme-colored CTAs that can clash with arbitrary user photos, a flat neutral gradient instead of the warm-tinted one, and a countdown/welcome-message treatment that reads as placeholder text instead of the designed boxed-accent-card and italic-quote presentation. Since `Countdown` and the welcome-message block are shared by all 14 layout variants built from the design's "10 layout explorations," fixing them here corrects the same visual gap everywhere, not just in HeroCinematic.

## What Changes

- `hero-cinematic-layout.tsx`: hero height set to the design's fixed `440px` on desktop; gradient overlay swapped to the warm-tinted 3-stop version; eyebrow text includes the formatted event date alongside the event type; subtitle line reads `wishlist.eventLocation` instead of `wishlist.displayName`.
- `hero-ctas.tsx`: add an "on-photo" visual variant (solid white / glass-outline pills) so hero CTAs stay legible over arbitrary cover photography, without changing the default theme-colored variant used by non-photo contexts.
- `countdown.tsx`: boxed accent-card treatment (eyebrow label + large number inside a tinted rounded container), replacing the current plain centered text line. Countdown text/formatting logic (`Faltan N días`, etc.) is unchanged.
- Welcome-message block in `public-wishlist-body.tsx`: italic serif quote styling plus a separate attribution line, replacing the current plain paragraph.
- No changes to `gift-card.tsx` — verified already close to the design and out of scope.
- No changes to the other 9 sibling layout files (`split-image-right`, `arch-split`, `wedding-formal`, `carousel-hero`, etc.) — they inherit the shared-component fixes automatically but are not otherwise touched in this change.

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `public-wishlist-layout`: adds requirements for the HeroCinematic hero's content fields (event date in the eyebrow, `eventLocation` as subtitle) and CTA contrast, and updates the countdown and welcome-message requirements to describe the boxed-accent-card and italic-quote-with-attribution presentation instead of the current plain-text treatment.

## Impact

- Code: `src/components/layouts/public-wishlist/hero-cinematic-layout.tsx`, `src/components/shared/hero-ctas.tsx`, `src/components/shared/countdown.tsx`, `src/components/shared/public-wishlist-body.tsx`.
- No schema, API, or env changes. No changes to `view-models.ts` (the `eventLocation` field already exists and is already populated by the mapper).
- Visual/behavioral only — affects the public `/w/[slug]` page and the dashboard's live preview of it. Affects all 14 layout variants that consume `Countdown` and the shared welcome-message block, not just HeroCinematic.
- Non-goal: this change does not audit or fix the other 9 already-built "layout exploration" components against their own design mocks, and does not address the fact that `openspec/specs/public-wishlist-layout/spec.md` currently documents only the legacy `grid`/`editorial`/`minimal` layouts and is silent on the 14 newer exploration layouts — that documentation gap is pre-existing and out of scope here.
