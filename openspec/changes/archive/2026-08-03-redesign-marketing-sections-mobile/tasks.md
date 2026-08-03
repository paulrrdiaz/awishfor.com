## 0. Prerequisite

- [x] 0.1 Confirm `redesign-marketing-sections-desktop` is applied and its section markup is the contract being styled against
- [x] 0.2 Capture 390px baseline screenshots of all eight sections in their reflowed state for before/after evidence

## 1. Shared mobile scale

- [x] 1.1 Apply the mobile section padding `44px 22px` below `lg` across the eight rebuilt sections, keeping desktop `76px 44px` at `lg` and above
- [x] 1.2 Apply the mobile eyebrow treatment below `lg`: `10px` size and `.14em` letter-spacing against desktop's `11px`/`.16em`
- [x] 1.3 Apply the mobile heading scale below `lg` per the canvas frame, without introducing alternate copy strings

## 2. Occasion picker mosaic

- [x] 2.1 Reorder the cards so the promoted lead card is first in the DOM, and confirm the desktop four-across order still reads correctly at `lg`
- [x] 2.2 Apply the mosaic grid below `lg`: full-width lead card at 172px above a two-column grid of 130px tiles, gap 12, radius 16
- [x] 2.3 Hide the subtitle and inline call to action on the four smaller tiles below `lg` while preserving each tile's accessible name
- [x] 2.4 Style the "wishlist general" grid child as the dark `#173E29` tile with its glyph and `#D7F09E` label below `lg`, reverting to the centered text link at `lg`
- [x] 2.5 Verify every tile still routes to `/create` with its event type pre-selected

## 3. FAQ stacking

- [x] 3.1 Transition the split container from `flex` at `lg` to stacked full-width blocks below it, with the support panel following the question list
- [x] 3.2 Apply the mobile question row padding, type scale and affordance size
- [x] 3.3 Apply the mobile support panel padding and full-width call to action
- [x] 3.4 Confirm all five questions render at both viewports with none hidden by a visibility utility

## 4. Example preview

- [x] 4.1 Hide the status topbar below `lg`
- [x] 4.2 Apply the mobile collage proportions and heights with the mobile gap and padding
- [x] 4.3 Apply the mobile countdown block scale and hide the availability summary row below `lg`
- [x] 4.4 Apply the mobile scroll region maximum height and switch the gift grid to two columns below `lg`
- [x] 4.5 Apply the mobile gift-card scale and confirm every purchase state remains distinguishable at that size

## 5. Bands, forms and timeline

- [x] 5.1 Apply the mobile band geometry and overlay treatment to the guest list-finder and final call to action
- [x] 5.2 Stack the guest list-finder form below `lg` with the mobile input radius, no backdrop blur, and a full-width submit
- [x] 5.3 Confirm the reserved message slot still prevents band height change at the mobile composition
- [x] 5.4 Stack the newsletter band below `lg` with the full-width pill form
- [x] 5.5 Apply the mobile timeline composition to "Cómo funciona" per the canvas frame, keeping the five-step structure and its copy
- [x] 5.6 Apply the mobile benefits grid and card scale, keeping the photographic header and overlapping badge treatment

## 6. Verification

- [x] 6.1 Run `pnpm check`, `pnpm test`, and `pnpm typecheck`
- [x] 6.2 Capture side-by-side comparisons of all eight sections at 390px against the §5 mobile frame and record them as verification evidence
- [x] 6.3 Re-verify the 1240px comparisons to confirm no desktop regression
- [x] 6.4 Confirm every interactive element still meets the 44×44 touch target below `md`
- [x] 6.5 Confirm no copy string differs between the two compositions and no breakpoint-duplicated copy node was introduced
- [x] 6.6 Run `pnpm audit:marketing` and confirm the mobile budgets still hold
- [x] 6.7 Confirm reduced-motion behaviour is unchanged and no ambient motion was reintroduced

See `verification.md` for evidence, the corrected FAQ scope (the canvas has no split/support-panel FAQ at either breakpoint — sections 3.1/3.3 were no-ops beyond a breakpoint threshold fix), and the environment limitation on live 390px screenshots.
