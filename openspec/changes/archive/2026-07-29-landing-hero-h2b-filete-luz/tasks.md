## 1. First-Fold Composition

- [x] 1.1 Add an H2b-only `MarketingNav` variant and a root first-fold composition that preserves the default marketing 404 nav and existing mobile drawer behavior.
- [x] 1.2 Implement the `lg`+ 640px photographic hero with the exact exported Unsplash source, unoptimized image rendering, H2b filters/gradients, geometry, copy, and CTA destinations.
- [x] 1.3 Compose the desktop isotype-plus-Lora wordmark lockup and the three-link filete header while preserving signed-out/signed-in account text in the initial state.
- [x] 1.4 Add the overlapping `HeroExampleRail` with the exact María & Tomás metadata, three gift summaries, displayed URL, and `#ejemplo` action without changing the downstream `ExamplePreview`.

## 2. Header State and Motion

- [x] 2.1 Add first-fold/header data hooks and Tailwind data-state styles for the transparent top state and compact mint scrolled state, including the source’s compact sizing and account-text omission.
- [x] 2.2 Extend `useMarketingAnimations` with a cleaned-up ScrollTrigger controller that switches H2b header state in both scroll directions and cleans up with the existing GSAP context.
- [x] 2.3 Refactor reduced-motion handling so the structural header state still switches instantly while decorative and entrance tweens remain disabled.
- [x] 2.4 Remove or update obsolete desktop-first-fold animation hooks, comments, and CSS without removing selectors still consumed by the retained mobile hero or later landing sections.

## 3. Responsive and Accessibility Fidelity

- [x] 3.1 Preserve the current sub-`lg` hero, short mobile copy, carousel, drawer, 44px touch targets, and overflow behavior while keeping H2b markup desktop-only.
- [x] 3.2 Verify accessible brand naming, decorative image alt behavior, keyboard-focus visibility, anchor destinations, and Clerk-aware initial navigation for signed-out and signed-in states.
- [x] 3.3 Verify the default `MarketingNav` used by the marketing 404 retains its current non-H2b presentation and behavior.

## 4. Validation and Visual Parity

- [x] 4.1 Run `pnpm check`, `pnpm test`, and `pnpm typecheck`; resolve failures caused by this change and report any unrelated pre-existing failures.
- [x] 4.2 Use browser automation against the local app to capture the H2b top state at the 1240px source artboard and 1302×739 reference viewport, compare image crop/gradients/type/spacing/proof overlap, and iterate until they match within browser-rendering tolerance.
- [x] 4.3 Capture the compact scrolled header, 390px mobile first fold, and reduced-motion state to confirm the breakpoint, scroll behavior, and accessibility fallbacks did not regress.
- [x] 4.4 Mark completed tasks in this file and synchronize any corresponding unchecked H2b/marketing milestone item in `docs/TASKS.md`; if no matching unchecked milestone exists, record that explicitly in the apply handoff.
