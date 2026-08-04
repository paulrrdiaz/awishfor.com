## Add marketing parallax motion — verification

### Commands

- `pnpm check` — passed; 419 files checked with no warnings or fixes.
- `pnpm test` — passed; 73 files and 637 tests.
- `pnpm typecheck` — passed.
- `pnpm audit:marketing` — production build succeeded and `/` remains static/prerendered; the change-owned performance gates pass. The command exits non-zero only for the two pre-existing whole-route failures described below.

### View-timeline spike

A throwaway `animation-timeline: view()` rule was measured in Chromium at 412×823 on the occasion lead image outside `content-visibility` and on a collage image inside the example section's `content-visibility: auto` / `contain-intrinsic-size: auto 900px` wrapper.

- The unwrapped and wrapped subjects both advanced from viewport entry through exit after their clipping ancestors used `overflow-clip`.
- The example section measured about 920px against its 900px intrinsic estimate; no wrapper-driven range jump was observed, so the existing wrappers and estimates remain unchanged.
- `overflow-hidden` was the actual incompatibility: it became the nearest scroll container and pinned the child timeline near 50%. `overflow-clip` preserves the crop while allowing the root scroll timeline to drive the animation.
- All throwaway spike classes, attributes, and keyframes were removed before implementation.

### Production audit

| Mobile median | Before | After | Gate | Result |
| --- | ---: | ---: | ---: | --- |
| Performance | 100 | 100 | ≥ 95 | Pass |
| LCP | 1,131 ms | 1,145 ms | ≤ 2,500 ms | Pass |
| CLS | 0.000 | 0.000 | 0 for this change | Pass |
| TBT | 18 ms | 15 ms | ≤ 200 ms | Pass |
| JavaScript | 181.7 KiB | 181.7 KiB | Unchanged and ≤ 220 KiB | Pass |
| Route CSS | 28.7 KiB | 29.1 KiB | ≤ 40 KiB | Pass |

The post-change mobile scores were 100, 100, and 95, so the median is 100 and no run fell below the 90 minimum. Desktop Performance was 94; the guardrail gates on the throttled mobile profile.

The first implementation audit measured 181.8 KiB of JavaScript because adding the new class string directly to the existing client `GuestFinder` component changed its bundle by 0.1 KiB. The final implementation keeps that component's JSX byte-identical and applies its supported, reduced-motion-aware treatment through the existing stable band-image `src` selector. The final client chunk and 181.7 KiB payload match baseline exactly.

`pnpm audit:marketing` still reports the same pre-existing whole-route failures seen in the baseline:

- Total transfer: 1,316.9 KiB before and 1,317.6 KiB after, above the 800 KiB budget.
- High-priority content images: 2 before and after, rather than 1.

Both come from the out-of-scope hero occasion rotation loading a random multi-hundred-kilobyte original after page load. The baseline loaded `siora-photography-_TvsS-0Qef4-unsplash.jpg` (904.9 KiB); the final run loaded `photo-1492725764893-90b379c2b6e7.jpeg` (907.8 KiB). The randomized hero choice accounts for the transfer variation; none of the below-fold parallax media was promoted or added to the initial route payload.

### Structural checks

- `occasion-picker-section.tsx`, `how-it-works-section.tsx`, and `example-preview.tsx` remain server components with no `"use client"` directive.
- The page uses native CSS view timelines only; no dependency, animation runtime, hook, or client boundary was added.
- Five image treatments and five staggered step rows compile to active `view()` timelines in supported Chromium.
- Every animated image path has clipping without an `overflow-hidden` scroll container intercepting its anonymous view timeline.
- The existing orphaned `data-reveal|data-float|data-glow` regression assertions pass unchanged, and the new class/stylesheet contract checks pass.

### Manual checks reserved for session handoff

Per the change tasks, these are intentionally left for manual browser confirmation rather than automated sign-off:

- Reduced motion renders a fully static page.
- Disabling the supported `@supports` branch matches the previous static layout.
- Motion stops completely while scroll position is stationary.
- No translated image edge is revealed at 412×823 or 1350×940.
