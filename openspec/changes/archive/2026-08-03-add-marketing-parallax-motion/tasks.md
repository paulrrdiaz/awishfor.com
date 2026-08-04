## 1. Spike: resolve the `content-visibility` unknown

- [x] 1.1 Record the current production baseline by running `pnpm audit:marketing` and saving the mobile median Performance, LCP, CLS, TBT, JavaScript, and CSS figures for later comparison.
- [x] 1.2 Build a throwaway `animation-timeline: view()` rule and apply it to one element inside a `content-visibility: auto` wrapper (`example-preview`, intrinsic 900px) and one outside any wrapper (`occasion-picker-section`), then compare where each animation starts and ends relative to the section entering the viewport.
- [x] 1.3 Decide the path from the spike result and record it in `design.md` under Open Questions: proceed as designed, tighten `contain-intrinsic-size` to measured values, drop wrappers on affected sections, or scope parallax to unwrapped sections only.
- [x] 1.4 Confirm whether `example-preview.tsx`'s collage has a clipping ancestor; note whether `overflow-clip` must be added.
- [x] 1.5 Remove all throwaway spike code before starting section work.

## 2. Parallax utility layer

- [x] 2.1 Add `@keyframes m-parallax` (translate-only, using `--m-par-from` / `--m-par-to`) to `src/styles/marketing.css`.
- [x] 2.2 Add the `.m-parallax` class nested inside `@supports (animation-timeline: view())` and `@media (prefers-reduced-motion: no-preference)`, scoped under `.marketing-theme`, with `animation-timeline: view()`, `animation-range: cover 0% cover 100%`, `both` fill, and `will-change: transform` applied only inside the supported branch.
- [x] 2.3 Add the staggered-rise variant (opacity plus small `translateY`) used by the how-it-works step cards, supporting per-element `animation-range` offsets.
- [x] 2.4 Rewrite the `marketing.css:115` comment so it states that scroll-linked motion is permitted while ambient idle loops remain banned.
- [x] 2.5 Verify the added CSS keeps route CSS within the 40 KiB budget (currently 27.0 KiB).

## 3. Guest finder band (reference treatment)

- [x] 3.1 Apply the parallax treatment and amplitude custom properties to the `<picture>` image in `guest-finder.tsx`, with a slight scale so translation never reveals an edge; use its existing stable `src` selector so the client chunk stays byte-identical.
- [x] 3.2 Confirm the section clips the image at both travel extremes; the supported CSS branch overrides it to `overflow: clip` so the root view timeline can advance without changing client JSX.
- [x] 3.3 Tune amplitude against the design canvas, starting near ±8% translate with ~1.12 scale.

## 4. Example preview collage

- [x] 4.1 Add the clipping ancestor identified in task 1.4, if one is missing.
- [x] 4.2 Apply differential amplitudes to the three collage images (`example-preview.tsx:84`, `:92`, `:100`) so the outer pair travels farther than the center.
- [x] 4.3 Confirm `example-preview.tsx` remains a server component with no `"use client"` directive added.

## 5. Occasion picker and how-it-works

- [x] 5.1 Apply a small-amplitude parallax to the lead photograph in `occasion-picker-section.tsx`, leaving every mosaic tile static.
- [x] 5.2 Apply the staggered rise to the step cards in `how-it-works-section.tsx` using per-step `animation-range` offsets.
- [x] 5.3 Resolve whether the how-it-works section heading also rises, and record the decision in `design.md`.
- [x] 5.4 Confirm both files remain server components.

## 6. Regression guard

- [x] 6.1 Extend `motion-hooks.test.tsx` to assert that every marketing component using a parallax class has a matching rule in `src/styles/marketing.css`.
- [x] 6.2 Confirm the existing orphaned `data-reveal|data-float|data-glow` assertions still pass unchanged.

## 7. Verification

- [x] 7.1 Run `pnpm check`, `pnpm test`, and `pnpm typecheck`.
- [x] 7.2 Run `pnpm audit:marketing` and confirm the JavaScript payload is unchanged from the task 1.1 baseline, CLS is still 0, median Performance is at least 95, LCP is at or below 2,500 ms, and route CSS is at or below 40 KiB.
- [x] 7.3 Write `verification.md` with the before/after audit table and the static-check results.
- [x] 7.4 Mark the corresponding milestone items in `docs/TASKS.md` complete.
- [x] 7.5 Note the manual browser checks for the user at session end rather than attempting them: reduced-motion renders a fully static page; an unsupported-`@supports` run matches today's layout; no motion occurs while scroll is stationary; no edge is revealed at 412×823 and 1350×940.
