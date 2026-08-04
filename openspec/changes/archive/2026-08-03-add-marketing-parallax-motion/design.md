## Context

The marketing landing at `/` is statically prerendered and currently scores 100 on the production mobile Lighthouse audit (LCP 863 ms, CLS 0, TBT 13 ms, JavaScript 171.5 KiB, route CSS 27.0 KiB, initial transfer 235.4 KiB). That profile is the result of `2026-07-31-optimize-marketing-performance`, which removed a full GSAP `ScrollTrigger` motion layer (`src/lib/gsap/use-marketing-animations.ts`) introduced in `b723093`.

The removal was fortified in three places, all of which this change must reckon with:

1. `openspec/specs/marketing-landing/spec.md` — **Decorative animation gating on small viewports** declares the lime CTA glow "the only permitted non-hero marketing animation" and forbids any "scroll-reveal timeline".
2. `src/styles/marketing.css:115` — the comment `lime CTA glow: the only permitted ambient marketing animation`.
3. `src/components/layouts/marketing/motion-hooks.test.tsx` — a regression test that fails if `data-reveal|data-float|data-glow` reappears in any marketing component.

Four sections are in scope, all below the fold:

| Section | File | Server/Client | `content-visibility` wrapper |
| --- | --- | --- | --- |
| `¿Qué estás celebrando?` | `occasion-picker-section.tsx:49` | server | none |
| `Del primer clic a tu lista publicada` | `how-it-works-section.tsx:55` | server | `auto`, intrinsic 700px |
| `Así se ve una wishlist publicada` | `example-preview.tsx:48` | server | `auto`, intrinsic 900px |
| `¿Buscas la lista de alguien?` | `guest-finder.tsx:32` | client (form) | `auto`, intrinsic 400px |

Governing constraints come from `openspec/specs/web-performance-guardrails/spec.md`: JavaScript ≤ 220 KiB, route CSS ≤ 40 KiB, LCP ≤ 2,500 ms, CLS ≤ 0.1, TBT ≤ 200 ms, median Performance ≥ 95 with no run below 90, measured under a 4× CPU slowdown mobile profile.

## Goals / Non-Goals

**Goals:**

- Restore a sense of depth and progression to the four narrative sections.
- Add **zero** bytes of JavaScript.
- Keep `occasion-picker-section.tsx`, `how-it-works-section.tsx`, and `example-preview.tsx` as server components.
- Degrade to exactly today's static page on unsupported browsers and under reduced motion.
- Hold every existing performance budget, with CLS staying at 0.

**Non-Goals:**

- Adding `motion` / `motion.dev` or any new animation runtime.
- Expanding GSAP beyond its current hero-and-header allowance.
- Any motion above the fold (hero, nav, first fold).
- Ambient or idle motion — nothing animates while the visitor is stationary.
- Canvas or particle effects.

## Decisions

### Decision 1: CSS scroll-driven animations over a JavaScript animation runtime

Use native `animation-timeline: view()` rather than the `useScroll` + `useTransform` + `useSpring` pattern from the referenced `motion.dev` React parallax example.

| | Motion (`motion.dev`) | GSAP `ScrollTrigger` | **CSS `view()`** |
| --- | --- | --- | --- |
| JS added (gz) | ~15–34 KiB | ~34 KiB (core + plugin) | **0** |
| Execution thread | main | main | **compositor** |
| Server components affected | 3 → client | 3 → client | **none** |
| RSC payload | grows (demo wishlist data serialized) | grows | **unchanged** |
| Spec status | needs amendment + budget renegotiation | hero/header only | **already permitted** |

The decisive factor is not bundle size but component boundaries. `useScroll` requires `"use client"`, which would convert `example-preview.tsx` — the heaviest presentational section, rendering demo wishlist gifts, prices, and collage URLs — into a client component, serializing all of that into the RSC payload and adding hydration cost for purely decorative movement.

The existing spec already anticipates this route: *"other marketing motion is optional and SHALL use CSS or small browser APIs rather than broad animation-runtime expansion"* (`marketing-landing/spec.md:298`). The CSS approach ships under that clause; a runtime would require amending it.

**Alternatives rejected:**

- **`motion.dev`** — new dependency duplicating an installed one, forces three server→client conversions.
- **GSAP `ScrollTrigger`** — already installed, but same main-thread and client-boundary costs, and the spec confines it to hero and header.
- **`particles.js` / `tsParticles`** — perpetual `requestAnimationFrame` canvas repaint; violates the ban on continuous paint loops, unmaintained, and hostile to mobile battery under a 4× CPU profile.
- **Manual `IntersectionObserver` + `transform`** — the pattern already used by `h2b-nav-controller.tsx`. Viable and dependency-free, but re-implements on the main thread what the browser can run on the compositor.

### Decision 2: A shared utility layer, parameterized by CSS custom properties

Define one keyframe pair and a small set of classes in `src/styles/marketing.css`, scoped under `.marketing-theme`, with per-element distance supplied by custom properties:

```css
@keyframes m-parallax {
  from { transform: translate3d(0, var(--m-par-from), 0); }
  to   { transform: translate3d(0, var(--m-par-to), 0); }
}

@supports (animation-timeline: view()) {
  @media (prefers-reduced-motion: no-preference) {
    .marketing-theme .m-parallax {
      animation: m-parallax linear both;
      animation-timeline: view();
      animation-range: cover 0% cover 100%;
      will-change: transform;
    }
  }
}
```

Sections set `--m-par-from` / `--m-par-to` via Tailwind arbitrary properties, keeping per-section tuning in the markup while the mechanism stays in one place.

Rationale: the `@supports` + `@media` nesting means the default cascade — what every unsupported or reduced-motion client sees — is the current static page. Motion is strictly additive, so there is no fallback to author and no regression surface.

`will-change: transform` is applied only inside the supported branch, so no compositor layer is promoted on clients that will never animate.

**Alternative rejected:** per-section bespoke keyframes. More CSS, more drift risk, and no tuning benefit over custom properties.

### Decision 3: Per-section treatments

- **`guest-finder.tsx`** — background band parallax. The `<picture>` is already `absolute inset-0 object-cover` inside a section with `overflow-hidden`, beneath a gradient scrim. Translate roughly ±8% with `scale(1.12)` so no edge is ever revealed. Because this section is already a client component, the final implementation targets its existing stable image `src` from the supported CSS branch and overrides the section to `overflow: clip`; adding the utility class to its JSX increased the audited client bundle by 0.1 KiB. This keeps the component byte-identical to baseline and preserves the zero-JavaScript goal. Highest payoff, lowest risk; **implement first** as the reference treatment.
- **`example-preview.tsx`** — differential parallax on the three collage images (`:84`, `:92`, `:100`). Outer images at a larger amplitude than the center (approximately ±6% vs ±3%) so the group separates in depth. Requires confirming a clipping ancestor exists; add `overflow-clip` if not.
- **`occasion-picker-section.tsx`** — deliberately restrained. Lead photograph only, small amplitude; mosaic tiles stay static because simultaneous motion across a dense grid reads as noise. This section has no `content-visibility` wrapper and sits directly below the fold, so it is the closest to the LCP-sensitive region.
- **`how-it-works-section.tsx`** — predominantly text and step cards, so this is a staggered rise (opacity + small `translateY`), not parallax, using per-step `animation-range` offsets. Uses `both` fill so cards settle at their natural position and never linger mid-animation.

Amplitudes above are starting values to be tuned visually against the design canvas, not fixed contract.

### Decision 4: Spike the `content-visibility` interaction before section work

Three targets sit inside `content-visibility: auto` wrappers with **estimated** `contain-intrinsic-size` values (700px / 900px / 400px) in `src/app/(marketing)/page.tsx:26-52`. A `view()` timeline resolves `animation-range` against element geometry; when a section is skipped, it is size-contained and its real geometry is unknown.

Expectation is that these compose — `content-visibility: auto` un-skips as the section nears the viewport, which is the same moment the view timeline becomes relevant — but the estimate-versus-actual gap could make ranges resolve against the placeholder size and fire at the wrong scroll offset.

This is resolved by a spike on the real page **before** any section is styled, because the outcome changes the approach. If ranges misresolve, the ordered fallbacks are: (a) tighten `contain-intrinsic-size` estimates to measured values, (b) drop the wrapper on affected sections and re-audit whether `content-visibility` still pays for itself, (c) scope parallax to the unwrapped `occasion-picker-section` plus `guest-finder` only.

### Decision 5: Extend the orphaned-hook regression test

`motion-hooks.test.tsx` guards against animation attributes surviving without a consumer. The new class-based approach does not trip its current `data-*` pattern, but its intent applies. Extend it to assert that any marketing component using the parallax class has a corresponding rule in `src/styles/marketing.css`, and update the `marketing.css:115` comment, which will no longer be accurate.

### Decision 6: Verification

`web-performance-guardrails/spec.md` requires the production audit for any change touching an animation controller. Run `pnpm audit:marketing` and record results in `verification.md` alongside `pnpm check`, `pnpm test`, and `pnpm typecheck`.

Gates: median Performance ≥ 95 (currently 100), CLS ≤ 0.1 (**currently 0 — must stay 0**, since all motion is transform/opacity and none should touch layout), LCP ≤ 2,500 ms (currently 863 ms), route CSS ≤ 40 KiB (currently 27.0 KiB), JavaScript unchanged at 171.5 KiB.

Manual checks: reduced-motion produces a fully static page; a browser without `animation-timeline` support (or the `@supports` branch disabled) renders today's layout; no motion occurs while scroll position is stationary.

## Risks / Trade-offs

- **`content-visibility: auto` breaks `view()` range resolution** → Spiked before any section work (Decision 4), with three ordered fallbacks. This is the single largest unknown in the change.
- **Parallax translation reveals an edge or gap** → Every parallaxed image is scaled slightly beyond its container and clipped by an `overflow-hidden`/`overflow-clip` ancestor. Verified per section at 412×823 and 1350×940.
- **CLS regresses from 0** → Motion is restricted to `transform` and `opacity`, neither of which triggers layout. Audit gates the result; any layout-affecting property is out of bounds.
- **Motion creeps above the fold and delays LCP** → Chrome records LCP at visible paint, so any hero fade would directly defer it. Enforced as a non-goal and confirmed by the audit's LCP gate.
- **Amplitudes feel gimmicky rather than "fancy"** → Values are tuned visually against the design canvas (`A Wish For.dc.html`), starting deliberately conservative. The `occasion-picker` mosaic is intentionally left static as the guard against over-animating.
- **Reduced-motion or unsupported clients see something broken** → Structurally impossible: motion lives entirely inside `@supports` + `@media (prefers-reduced-motion: no-preference)`, so the default cascade is the current page.
- **`will-change: transform` promotes too many compositor layers** → Applied only within the supported branch and only to the specific animated elements, not to containers or the mosaic grid.
- **Future contributors reintroduce ambient loops under the "parallax is allowed now" reading** → The spec delta narrows rather than removes the ban: scroll-linked motion is permitted, idle/ambient loops remain forbidden. The `marketing.css` comment is rewritten to state this precisely.

## Migration Plan

Purely additive and presentational — no data, API, or schema migration. Sections are styled one at a time, starting with `guest-finder` as the reference treatment, so each can be audited independently.

Rollback: remove the parallax classes from the affected components; the utility layer is inert without them, and the sections return to their current static rendering with no other code path involved.

## Open Questions

- Does `content-visibility: auto` with estimated `contain-intrinsic-size` resolve `view()` ranges correctly? **Resolved:** proceed as designed. A Chromium spike at 412×823 showed both the unwrapped occasion image and the example image inside the `auto 900px` wrapper advancing from viewport entry through exit. The example section measured about 920px, close to its 900px intrinsic estimate, and no wrapper-driven range jump was observed.
- Does `example-preview.tsx`'s collage have a clipping ancestor, or does one need to be added? **Resolved:** it has both per-image and outer-card `overflow-hidden` ancestors. Those ancestors, plus the guest band and occasion lead-image clipping ancestors, must use `overflow-clip`: `overflow-hidden` becomes the nearest scroll container and pins a descendant anonymous `view()` timeline near 50%, while `overflow-clip` preserves clipping without intercepting the root scroll timeline.
- Should the `how-it-works` stagger also apply to the section heading, or step cards only? **Resolved:** step cards only. Keeping the heading static preserves immediate orientation and concentrates the progression treatment on the actual sequence.
- Final amplitude values per section, pending visual review against the design canvas.
