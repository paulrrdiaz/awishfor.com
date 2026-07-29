## Context

The landing first fold is currently split in two. `MarketingFirstFold` renders `MarketingHero` (mesh gradient, ambient blobs, floating emoji, `HeroCardCarousel`) below `lg`, and `H2bHero` (a single static Unsplash wedding photograph with three gradient overlays) at `lg` and above. `H2bHero` is a pure server component with zero client JavaScript.

All landing motion runs through `useMarketingAnimations` in `src/lib/gsap/use-marketing-animations.ts`: one `gsap.context()` scoped to the page root, animations attached by `data-*` attribute so section markup can stay server-rendered, everything non-structural gated behind `prefers-reduced-motion`.

Three constraints shape this design:

1. **Copy is spec-locked.** `openspec/specs/marketing-landing/spec.md` pins the hero eyebrow, headline, body, CTA destinations, and the geometry of the H2b composition to the Claude Design canvas `A Wish For.dc.html` §14. The rotation must not touch any of that text.
2. **The scrim is hand-tuned for one photograph.** Overlay 1 is `linear-gradient(96deg, rgba(8,26,15,.66) 0%, rgba(8,26,15,.34) 40%, rgba(8,26,15,.02) 70%)`, darkening the left side so white headline text reads over a dark bouquet shot. A bright, high-key baby-shower photograph under the same gradient would make the headline unreadable.
3. **The four occasions already exist in the repo, three times over.** `hero-card-carousel.tsx` `EXAMPLES` has all four events with photographs, names, and gifts. `hero-example-rail.tsx` hardcodes the wedding subset. `occasion-picker-section.tsx` has its own `OCCASIONS` of a different shape.

The proposal also folds in two pre-existing gaps found while reading the code: the spec-required trust line "Gratis · sin comisiones · +10 mil listas creadas" is absent from `h2b-hero.tsx`, and the proof rail diverges from its spec (two gifts instead of three, no wishlist URL, no bottom overlap).

## Goals / Non-Goals

**Goals:**

- Rotate the hero photograph across four occasions with a crossfade and slow Ken Burns drift, with no visitor controls.
- Keep the proof rail's content in lockstep with whichever photograph is showing.
- Serve one responsive hero at every viewport instead of two divergent ones.
- Keep hero copy server-rendered, and keep the no-JavaScript and reduced-motion output visually identical to today's first fold.
- Put photograph URLs behind one constants module so each can be swapped for a local optimized asset by editing a single field.
- Keep exactly one LCP image candidate despite four images being in the DOM.

**Non-Goals:**

- Any visitor-facing control: arrows, dots, swipe, keyboard navigation, pause/play.
- Unsplash API integration, credentials, or runtime image fetching.
- Changing hero eyebrow, headline, body, or CTA destinations.
- Merging `OCCASIONS` from `occasion-picker-section.tsx` into the shared module. It models category chips, not event instances; force-fitting both into one type would produce a union with mostly-optional fields.
- Downloading and self-hosting the photographs. The data shape prepares for it; the swap is a later change.

## Decisions

### D1: GSAP timeline, not Embla

**Chosen:** Drive the crossfade and Ken Burns from `useMarketingAnimations` via a `data-hero-rotator` attribute, consistent with every other animation on the page.

**Rejected — Embla + `embla-carousel-fade`:** `embla-carousel-react` and `embla-carousel-autoplay` are already installed, and `marketing-landing` spec §"interactive UI patterns" nudges toward reusing the shadcn carousel primitive. But Embla is a gesture and scroll-position engine, and this feature has explicitly zero gestures. Using it would mean shipping a drag/pointer/scroll engine for a background crossfade, converting the hero to a client component, adding `embla-carousel-fade` as a new dependency, and fighting the plugin to layer Ken Burns scaling on top of its opacity handling. The spec's carousel guidance is about interactive content carousels — `HeroCardCarousel` is one and stays on Embla; this is not.

**Rejected — pure CSS keyframes:** Zero JavaScript and trivial reduced-motion handling via `@media`, but N-layer staggered `animation-delay` percentages must all be recomputed whenever an occasion is added or removed, and CSS animation cannot pause when the tab is hidden or the hero scrolls out of view.

GSAP is already loaded on this page, so the marginal cost is zero.

### D2: All four occasions render server-side; a thin client component only toggles an attribute

`H2bHero` stays a server component and renders all four `<Image>` layers and all four proof-rail variants into the initial HTML. A small client component (`HeroRotatorDriver`) mounts alongside, owns the active index, and does exactly one thing: set `data-active` on the correct slide and rail variant. GSAP animates the pixels; React never re-renders visual content.

**Why:** Hero copy and rail copy stay in the server-rendered HTML, satisfying the spec requirement that H2b hero copy render server-side, and keeping all four occasions' text crawlable. It also gives the fallback for free — with JavaScript disabled, slide 0 is `data-active` from the server and the other three sit at `opacity: 0`, which is the current design exactly.

**Rejected — a client component owning the whole hero with `useState`:** simpler to write, but pushes spec-locked copy out of the server HTML and re-renders the hero four times per loop.

### D3: One `hero-occasions.ts`, three consumers

```
src/components/layouts/marketing/hero-occasions.ts
  HERO_OCCASIONS: readonly HeroOccasion[]   // length 4
        │
        ├──▶ H2bHero            background image stack
        ├──▶ HeroExampleRail    four synchronized rail variants
        └──▶ HeroCardCarousel   existing Embla cards (behavior unchanged)
```

```ts
type HeroOccasion = {
  id: "boda" | "cumpleanos" | "baby-shower" | "nuevo-hogar";
  label: string;
  photo: {
    desktop: string;  // landscape crop
    mobile: string;   // tighter portrait crop
  };
  scrim: "light" | "medium" | "heavy";
  rail: { /* eyebrow, name, meta, gifts, href */ };
  card: { /* countdown, accent colors, gifts — HeroCardCarousel's existing shape */ };
};
```

Occasion order is the array order; `HERO_OCCASIONS[0]` is the wedding, so the first paint matches the current design canvas exactly.

`photo` is split desktop/mobile because the desktop composition is a wide 1240-px-class crop while mobile needs a tighter, taller crop of the same subject. Today both are `images.unsplash.com` URLs differing only in `?w=&h=&fit=crop` parameters; after the future optimization pass both become paths under `public/`. Nothing outside this module reads the URL shape, so that swap touches eight string literals and no component.

### D4: Per-occasion scrim strength

`scrim` is a data field, not a single global gradient. Each occasion declares how much darkening its photograph needs for the white headline to hold contrast — a dark bouquet shot takes `light`, a bright pastel baby-shower shot takes `heavy`. The rotator sets a CSS custom property on the hero from the active occasion's `scrim`, and the existing three overlay gradients read their opacity stops from it, so the overlay structure and the exported H2b look are preserved.

**Why:** the alternative is picking one gradient strong enough for the brightest photograph, which would over-darken the other three and flatten the composition the design canvas specifies. Contrast is the highest-risk part of this change and belongs in reviewable data next to the URL it applies to.

### D5: Motion parameters

- Hold 5.5s per occasion, crossfade 1.6s with `power2.inOut`. Full loop ≈ 28s.
- Ken Burns: `scale` 1.00 → 1.06 across each slide's full on-screen life, with a small translate drift. Direction alternates per slide (zoom in, zoom out, zoom in, zoom out) so the loop does not read as a repeating pulse.
- `transform` and `opacity` only — both compositor-friendly, no layout or paint per frame.
- The timeline pauses on `document.visibilitychange` when the tab is hidden, and via ScrollTrigger when the hero leaves the viewport.
- The rotation starts after the window `load` event rather than on mount, so it never competes with the first slide's LCP fetch.

### D6: Image loading strategy

- Slide 0: `priority`, no `unoptimized`.
- Slides 1–3: `loading="lazy"`, `fetchPriority="low"`.
- `unoptimized` is dropped from the hero images so Next.js serves AVIF/WebP at the width `sizes` requests. The current single hero image sets `unoptimized`, which forfeits format conversion — acceptable for one image, wasteful for four. `HeroCardCarousel` already omits it, so this also removes an inconsistency.

Slides 1–3 are technically in-viewport, so `loading="lazy"` alone will not stop the browser from fetching them; `fetchPriority="low"` is what keeps them behind slide 0 in the request queue. Together with starting rotation post-`load`, slide 0 stays the sole LCP candidate.

### D7: Unify on one responsive hero; relocate `HeroCardCarousel`

`MarketingHero` is deleted and `H2bHero` becomes responsive. Verified consequences:

- `data-mesh`, `data-bob`, `data-pulse`, `data-spin`, `data-shimmer` have `marketing-hero.tsx` as their only markup consumer, so their loops in `use-marketing-animations.ts` become dead and are removed. The `marketing-landing` spec already requires that obsolete desktop loops not be registered; they survived only because mobile still used them.
- `m-mesh`, `m-dot-grid`, `m-shimmer` in `src/styles/marketing.css` become dead and are removed.
- `data-float`, `data-float-rev`, `data-float-3`, and `m-blob` are **kept** — `final-cta.tsx` and `guest-finder.tsx` still use them.
- The mobile three-column stats card (`+10 mil` / `4.9 ★` / `100% gratis`) collapses into the spec-required trust line "Gratis · sin comisiones · +10 mil listas creadas", which the hero must render at every viewport.
- Mobile-specific short copy is preserved using the same `lg:hidden` / `lg:block` pairing `marketing-hero.tsx` uses today, since the spec requires distinct mobile copy.
- The "¡Regalo marcado! hace 2 min · María G." toast and the "Wishlists con buena vibra ✨" badge are dropped; the H2b eyebrow supersedes the badge.

`HeroCardCarousel` moves into `OccasionPickerSection`. The landing section order is spec-locked, so adding a new top-level section would be a larger spec delta than folding the cards into the section that is already titled "Elige tu ocasión" and already about the same four occasions.

### D8: Accessibility of the hidden variants

Four proof-rail variants exist in the DOM, each containing a link. Inactive variants get `inert` plus `aria-hidden="true"`, toggled alongside `data-active`, so screen readers announce one rail and the tab order contains one link. The background images are decorative (`alt=""`) and remain so. The rotation is ambient and non-interactive, so it exposes no carousel semantics, no live region, and no announcement on change.

## Risks / Trade-offs

- **A bright photograph makes the white headline unreadable** → D4's per-occasion `scrim` field. Each candidate photograph is checked for left-side luminance against the headline before it lands in `HERO_OCCASIONS`; the ones that need it carry `heavy`.
- **Four hero images regress LCP and mobile data usage** → D6: one `priority` image, three at low fetch priority, `unoptimized` dropped so all four ship as AVIF/WebP, mobile crops sized for mobile via `sizes`, and rotation deferred until after `load`.
- **Continuous 28s transform loop drains battery on mobile** → `transform`/`opacity` only, paused when the tab is hidden and when the hero scrolls out of view, fully disabled under `prefers-reduced-motion`.
- **Deleting `MarketingHero` removes ambient motion that other sections depend on** → verified: only `data-mesh`, `data-bob`, `data-pulse`, `data-spin`, `data-shimmer` and `m-mesh`, `m-dot-grid`, `m-shimmer` become unreferenced. `data-float*` and `m-blob` have other consumers and are left alone.
- **Rotation drifts out of sync between photograph and rail** → one timeline is the single clock. It sets `data-active` on both the image stack and the rail from the same tick; neither has an independent timer.
- **Hotlinked Unsplash URLs break or change** → the reason every URL lives in one module. Slide 0 is also the current, already-verified photograph, so the worst case degrades toward today's hero rather than an empty fold.
- **This departs from the design canvas**, which specifies one exported photograph → an intentional, spec-tracked delta. The composition, geometry, overlays, and copy from `A Wish For.dc.html` §14 are all preserved; only the photograph behind them changes over time, and the first paint is the canvas photograph.
- **Trade-off accepted:** four occasions' rail markup ships to every visitor to keep the hero server-rendered. It is a small amount of static text, and it buys crawlable content plus a free no-JavaScript fallback.
