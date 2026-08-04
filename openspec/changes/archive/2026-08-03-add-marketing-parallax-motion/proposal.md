## Why

The marketing landing reads as visually flat below the fold. Every ambient effect was removed in `2026-07-31-optimize-marketing-performance` to recover a 100 mobile Lighthouse score (LCP 3,591 ms → 863 ms, JavaScript 590.6 KiB → 171.5 KiB), and the page has stayed static since. Visitors scrolling past the four narrative sections get no sense of depth or progression at the exact moment the product is explaining itself.

Scroll-linked parallax restores that "fancy" quality without reopening the performance regression: CSS scroll-driven animations run on the compositor, add zero JavaScript, and keep every affected section a server component.

## What Changes

- Add a reusable, route-scoped parallax utility layer to `src/styles/marketing.css` built on `animation-timeline: view()`, gated behind `@supports` and `prefers-reduced-motion: no-preference`.
- Apply scroll-linked motion to four below-the-fold sections:
  - **`¿Qué estás celebrando?`** (`occasion-picker-section.tsx`) — restrained translate on the lead photograph only; mosaic tiles stay static.
  - **`Del primer clic a tu lista publicada`** (`how-it-works-section.tsx`) — staggered rise on step cards via per-step `animation-range` offsets (text treatment, not parallax).
  - **`Así se ve una wishlist publicada`** (`example-preview.tsx`) — differential parallax across the three collage images so the group separates in depth.
  - **`¿Buscas la lista de alguien?`** (`guest-finder.tsx`) — full-bleed photographic band parallax behind the existing gradient scrim.
- Extend the existing orphaned-hook regression test to cover the new parallax class so markup and stylesheet cannot drift apart.
- Record a production Lighthouse audit as verification evidence, per the existing guardrails requirement.

Non-goals:

- No new animation runtime. Motion (`motion.dev`) is explicitly rejected; GSAP stays confined to the hero and header as the current spec already dictates.
- No motion above the fold. The hero, nav, and first fold are untouched so LCP is structurally unaffected.
- No ambient/idle loops. Nothing animates while the visitor is stationary; the ban on continuous paint loops stands.
- No `particles.js` or canvas-based decoration.

## Capabilities

### New Capabilities

None. The behavior belongs to the existing marketing landing capability.

### Modified Capabilities

- `marketing-landing`: two motion requirements currently forbid this behavior outright and must be amended.
  - **`Decorative animation gating on small viewports`** states the CTA glow is "the only permitted non-hero marketing animation" and that no "scroll-reveal timeline runs". This is narrowed to permit scroll-linked, compositor-only section motion while continuing to ban ambient idle loops.
  - **`Targeted hero and header motion with reduced-motion fallback`** gains coverage for the four named sections: which sections may move, the required `@supports` and reduced-motion fallbacks, and the constraint that motion never applies above the fold.

## Impact

**Code**

- `src/styles/marketing.css` — new parallax keyframes and utility classes (~1.5 KiB; route CSS is 27.0 KiB against a 40 KiB budget).
- `src/components/layouts/marketing/occasion-picker-section.tsx`, `how-it-works-section.tsx`, `example-preview.tsx`, `guest-finder.tsx` — class-name additions only. The first three remain **server components**; no `"use client"` boundary moves.
- `src/components/layouts/marketing/motion-hooks.test.tsx` — extend the orphaned-attribute guard to the parallax class.

**Dependencies**

None added or removed. GSAP (`^3.15.0`) remains installed and unused by marketing.

**Performance**

- JavaScript budget unaffected (0 KiB added; 171.5 KiB of 220 KiB used).
- CLS is currently exactly 0; motion is transform/opacity only and must not regress it.
- `content-visibility: auto` wraps three of the four target sections in `src/app/(marketing)/page.tsx` with estimated `contain-intrinsic-size` values. The interaction between those estimates and `view()` range resolution is unverified and is spiked before any section work begins.

**Compatibility**

Browsers without `animation-timeline` support render exactly today's static page via `@supports`. No visual regression risk for unsupported clients.

**Specs, env, schema, API**

No environment variable, database schema, or API changes. No new capability specs.
