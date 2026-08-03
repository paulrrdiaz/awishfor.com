## Why

`redesign-marketing-sections-desktop` brings eight landing sections to canvas fidelity at the 1240px artboard and guarantees only a safe reflow below `lg`. The canvas also contains a fully specified 390px frame — "Marketing / landing · móvil · 390px" — and it is a genuinely parallel design rather than a narrower version of the desktop one. Four of the eight sections have a different composition at 390px, not merely a different width.

Leaving mobile as a reflow means the majority of visitors see none of the hierarchy the designer built for them: the occasion picker loses its promoted lead card and its "wishlist general" tile, the FAQ support panel sits below a full-width question list rather than beside it, and every section keeps desktop's generous padding and type scale in a 390px column.

## What Changes

- Bring the same eight sections to fidelity against the §5 mobile frame below the `lg` breakpoint: reduced section padding (`44px 22px`), the mobile type scale, and the mobile geometry for every grid, card, thumbnail and control.
- Restructure the occasion picker below `lg` into the canvas mosaic: a promoted full-width "Boda" card at 172px above a 2×2 grid of 130px tiles, with the "wishlist general" grid child rendering as the dark `#173E29` tile instead of the desktop text link.
- Scale the FAQ to the canvas mobile type and spacing below `lg`. (Correction found during implementation: the canvas has no two-column split or dark support panel at either breakpoint — the FAQ is a single accordion at both 1240px and 390px — so this section needed only a breakpoint-threshold fix, not a restructure.)
- Apply the mobile composition of the example preview: no status topbar, tighter collage at 82/118/82, no availability summary row, a `240px` scroll region, and a two-column gift grid.
- Apply the mobile treatment to both photographic bands: `220px` minimum height, the mobile overlay angle, a stacked column form, a `14px` radius input without backdrop blur, and full-width submit controls.
- Apply the mobile newsletter band layout: stacked heading, subtitle and full-width pill form.
- Confirm the reduced-motion, touch-target and layout-stability guarantees continue to hold at the mobile composition.

## Capabilities

### Modified Capabilities

- `marketing-landing`: Adds canvas fidelity below the `lg` breakpoint for the eight sections the desktop change rebuilt, and replaces that change's "safe reflow only" allowance with a verified mobile composition. Copy, section order, the first fold, the nav and the footer body are unchanged.

## Impact

- Affected code: the same eight marketing section components plus `marketing.css`. This change is predominantly breakpoint rules and token values rather than new components.
- Two sections require markup changes beyond styling, both anticipated by the desktop change's DOM contract: the occasion picker's mosaic ordering and promoted lead card, and the FAQ's split-to-stack transition.
- No fixture, presentation contract, font, image asset, or motion change. Those all landed with the desktop change.
- No Prisma schema, migration, tRPC contract, Clerk configuration, or environment variable changes.
- `web-performance-guardrails` is not modified. The mobile audit profile is already the primary one the landed budgets are measured against, and this change adds no new resource.
- Copy is unchanged. The single desktop copy set established by the desktop change renders at every viewport; the canvas's shorter mobile strings and its three alternate mobile headings are deliberately not adopted.
- Depends on `redesign-marketing-sections-desktop` being applied first. Its section markup is the contract this change styles against.
