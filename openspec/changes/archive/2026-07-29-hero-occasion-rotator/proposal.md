## Why

The landing first fold shows a single static wedding photograph, so a visitor planning a baby shower, birthday, or housewarming sees a page that looks like it is for weddings only. The product serves four occasions; the hero should say so within the first few seconds without asking the visitor to click anything.

Two structural problems make this worse. Desktop and mobile currently render two entirely different first folds (`H2bHero` photograph vs. `MarketingHero` mesh gradient), doubling maintenance and giving mobile visitors a weaker impression. And the same four occasions are hardcoded in three separate places, so any occasion change today means editing three files.

## What Changes

- The hero photograph becomes a **self-running rotation across four occasions** — wedding, birthday, baby shower, housewarming — crossfading with a slow Ken Burns drift. No visitor controls: no arrows, dots, swipe, or pause button.
- The "Ejemplo real" proof rail **rotates in sync** with the photograph, so the wedding photo shows María & Tomás and the baby-shower photo shows Esperando a Mateo. Background and proof never disagree.
- **BREAKING (internal)**: `MarketingHero` (the mobile mesh-gradient hero) is deleted. `H2bHero` becomes responsive and serves every viewport, so mobile gets the photographic hero, rotation, and synced rail.
- `HeroCardCarousel` moves out of the deleted mobile hero and is folded into `OccasionPickerSection`, keeping the wishlist-card product demo on the page without adding a new section to the locked section order.
- A single `hero-occasions.ts` constants module becomes the source of truth for the four occasions: photograph URLs, per-occasion scrim strength, and proof-rail content. Photograph URLs stay on `images.unsplash.com` for now and are structured so each can later be swapped for a locally hosted, optimized asset by editing one field.
- The hero gains the trust line "Gratis · sin comisiones · +10 mil listas creadas", which the current spec already requires but the implementation never rendered. The mobile three-column stats card collapses into it.
- Hero images stop using `unoptimized` so Next.js serves AVIF/WebP at the right width. Only the first slide is `priority`; the rest load at low priority after the first paint, keeping LCP on a single image despite four being present.
- GSAP loops left with no remaining markup after the mobile hero is deleted (`data-mesh`, `data-bob`, `data-pulse`, `data-spin`, `data-shimmer`) are removed, along with the now-unused `m-mesh`, `m-dot-grid`, and `m-shimmer` CSS. `data-float`/`-rev`/`-3` and `m-blob` stay, since `final-cta` and `guest-finder` still use them.
- Under `prefers-reduced-motion` or with JavaScript unavailable, the hero renders the first occasion as a static image — visually identical to today's first fold.

### Non-goals

- No visitor-facing carousel controls of any kind. The rotation is ambient, not an interactive component.
- No Unsplash API integration, API key, or runtime image fetching. Photograph URLs stay hardcoded.
- No change to hero headline, eyebrow, body copy, or CTA destinations — those stay exactly as the design canvas specifies.
- No change to `OCCASIONS` in `occasion-picker-section.tsx`; it is a different data shape (category chips, not event instances) and is deliberately not merged into `hero-occasions.ts`.
- No change to `ExamplePreview`, `MarketingNav`, or any section below the first fold beyond hosting `HeroCardCarousel`.

## Capabilities

### New Capabilities

- `hero-occasion-rotation`: The self-running four-occasion hero rotation — photograph crossfade, Ken Burns motion, synchronized proof rail, the shared occasion data source, reduced-motion and no-JavaScript fallbacks, and the image loading strategy that keeps a single LCP candidate.

### Modified Capabilities

- `marketing-landing`: The first fold stops being desktop-only and stops being a single static photograph. Requirements change for the H2b hero (rotating photograph set, responsive across all viewports, trust line now rendered), the proof rail (rotating content), the mobile first fold (mesh hero removed, `HeroCardCarousel` relocated), the registered GSAP animation set, and the design-fidelity requirement that pinned the fold to one exported photograph.

## Impact

**Code**

- New: `src/components/layouts/marketing/hero-occasions.ts`, plus a small client rotation driver component.
- Rewritten: `src/components/layouts/marketing/h2b-hero.tsx` (responsive, image stack, trust line), `src/components/layouts/marketing/hero-example-rail.tsx` (four synchronized variants).
- Deleted: `src/components/layouts/marketing/marketing-hero.tsx`.
- Modified: `src/components/layouts/marketing/marketing-first-fold.tsx` (drops the viewport split), `src/components/layouts/marketing/occasion-picker-section.tsx` (hosts `HeroCardCarousel`), `src/components/layouts/marketing/hero-card-carousel.tsx` (reads shared occasion data), `src/lib/gsap/use-marketing-animations.ts` (adds the rotator, removes five dead loops), `src/styles/marketing.css` (removes three dead classes).

**Specs**

- `openspec/specs/marketing-landing/spec.md` — H2b hero, proof rail, mobile first fold, GSAP animation registry, design fidelity, and Tailwind-over-inline-style requirements.

**Dependencies, config, data**

- No new npm dependencies. GSAP 3.15 is already installed and already drives this page.
- No environment variables, database schema, or API changes.
- `images.unsplash.com` is already allowed in `next.config.ts` `remotePatterns`; no change needed.

**Accessibility and performance**

- Inactive proof-rail variants must be removed from the accessibility tree and focus order, since four variants render but only one is visible.
- Four hero images now render where one did. Load strategy, per-occasion scrim strength for headline contrast, and pausing the rotation when the tab is hidden or the hero is scrolled out are the main risks this change has to manage.
