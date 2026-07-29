## Context

The root landing page currently renders `MarketingNav` and `MarketingHero` as separate siblings. The nav is a static light-green row reused by the marketing 404, while the hero is a responsive green mesh with decorative loops and a `HeroCardCarousel`. All landing animation is registered from the single `MarketingShell` client island through data attributes in `useMarketingAnimations`.

The exported Claude Design source now defines the selected desktop first fold at `A Wish For.dc.html` line 1731 as **H2b · Filete de luz**. Its production-relevant source is complete: a 1240px artboard, a 640px photographic hero, the exact image URL and filter, two contrast gradients, an over-photo header with a white divider, exact copy and spacing, an overlapping proof rail, and a compact mint scrolled-header state. `support.js` is only the generated Claude Design runtime and must not be ported. The exported `uploads/isotype.svg` is already represented by `public/assets/isotype.svg`; H2b does not use the square `logo.svg` as its header lockup.

Constraints:

- Preserve the existing `/` route, Clerk-aware navigation, CTA destinations, mobile drawer, shorter mobile copy, touch targets, and all sections below the first fold.
- Preserve the default `MarketingNav` presentation used by `src/app/not-found.tsx`.
- Keep server-rendered content visible without animation JavaScript and keep `prefers-reduced-motion` authoritative.
- Prefer Tailwind utilities, including arbitrary values and data-state variants, over new bespoke CSS.

## Goals / Non-Goals

**Goals:**

- Match the exported H2b desktop frame for composition, copy, image treatment, type, spacing, and the proof rail.
- Give the desktop header distinct top-of-hero and compact scrolled states without adding another broad client boundary.
- Keep the existing mobile first fold and navigation behavior below `lg`.
- Remove only animation code made unreachable by the desktop replacement while retaining hooks used elsewhere or by mobile.
- Verify visual parity at the source artboard width and the supplied reference viewport.

**Non-Goals:**

- Redesigning any section after the H2b proof rail.
- Replacing the full `ExamplePreview` or changing public-wishlist components/data.
- Changing auth, routes, APIs, schema, dependencies, environment variables, or analytics.
- Reusing Claude Design’s generated runtime or showing its annotation label.

## Decisions

### Compose the root first fold explicitly and keep `MarketingNav` reusable

Add a small server component such as `MarketingFirstFold` that composes `MarketingNav variant="h2b"`, the desktop/mobile hero branches, and the proof rail. The root page replaces its separate nav/hero siblings with this component. `MarketingNav` keeps a default variant for the marketing 404 and gains an H2b variant only for `/`.

This avoids turning the 404 nav into an overlay and makes the first-fold ownership explicit. Rejected: globally restyle `MarketingNav`; it would break the 404. Rejected: duplicate the entire auth-aware nav inside `MarketingHero`; it would create two sources for Clerk-aware link behavior.

### Apply H2b at `lg` and preserve the shipped mobile branch

Render the H2b composition at `lg` and above. Keep the current mobile hero/nav structure below `lg`, including its short copy, drawer, touch targets, and carousel. `HeroCardCarousel` therefore remains a mobile consumer instead of being deleted.

The H2b export is a 1240px desktop frame and does not define a replacement mobile frame. Rejected: force the photographic composition onto every viewport; that would overwrite an already-specified 390px experience with an unsupported guess.

### Reproduce the source image directly and deterministically

Use `next/image` with `fill`, `priority`, `unoptimized`, an empty decorative alt, and the exact exported Unsplash URL:

`https://images.unsplash.com/photo-1519741497674-611481863552?w=1280&h=560&fit=crop&auto=format`

Apply `object-cover` plus `brightness(1.2) saturate(1.06) contrast(.95)`. `images.unsplash.com` is already allowed by `next.config.ts`; no config or asset migration is required. `unoptimized` prevents a second Next.js recompression from shifting the visual reference.

Layer the exact source gradients over the photo:

- Horizontal protection: `linear-gradient(96deg, rgba(8,26,15,.66) 0%, rgba(8,26,15,.34) 40%, rgba(8,26,15,.02) 70%)`
- Vertical protection: `linear-gradient(180deg, rgba(8,26,15,.26) 0%, rgba(8,26,15,0) 30%, rgba(8,26,15,.36) 100%)`
- Header-only top veil: `linear-gradient(180deg, rgba(8,26,15,.46), rgba(8,26,15,0))`

Rejected: substitute a local uploaded photo; none of the exported uploads is the H2b hero source. Rejected: approximate with the current demo wedding image; its subject and focal point differ visibly.

### Use an isotype-plus-text lockup in H2b

Compose `/assets/isotype.svg` at 28px with a visible 19px Lora “A Wish For” wordmark. The source H2b does not use `uploads/logo.svg`, and the repository’s `/assets/logo.svg` is a square decorative brand artwork rather than the horizontal white lockup implied by its current nav sizing.

The default/mobile nav and footer retain their established treatments in this change. Rejected: recolor or stretch the square logo asset over the photo; it is the wrong geometry and loses the explicit brand name.

### Treat the overlapping proof rail as a hero teaser, not the full example

Create a presentational `HeroExampleRail` with the source’s static marketing proof data: María & Tomás; wedding, 68 days, 16 gifts; three 44px gift thumbnails; the displayed public URL; and “Ver esta wishlist →”. Both the rail action and the hero secondary CTA link to `#ejemplo`, where the existing real `PublicWishlistPage` compact preview remains unchanged.

This keeps the existing single-source-of-truth requirement for the full preview while allowing the intentionally condensed H2b rail to match its source. Rejected: mount a second `PublicWishlistPage` in the hero; its DOM and height cannot reproduce the rail and would duplicate a heavy preview above the fold. Rejected: link to `/w/maria-y-tomas`; that static marketing slug is not guaranteed to exist.

### Drive the scrolled header from the existing animation island

Mark the first fold and H2b desktop nav with data attributes. Extend `useMarketingAnimations` with one `ScrollTrigger` that toggles a scrolled data state after the top portion of the hero leaves the viewport. Tailwind data-state classes perform the visual switch:

- Top state: over-photo positioning, white lockup/nav/account text, 44px horizontal inset, 22px/18px vertical spacing, and the 1px white divider.
- Scrolled state: fixed or sticky compact mint `#DCEFD0` bar, smaller 24px/16px lockup, compact nav and CTA, and the account text omitted as shown by the export.

The initial auth-aware top state and mobile drawer still expose “Iniciar sesión” or “Dashboard”; the compact scrolled state intentionally prioritizes the three anchors plus creation CTA.

Refactor the reduced-motion early return so the structural header-state controller still runs with an instantaneous state change, while decorative/entrance tweens remain disabled. If JavaScript fails entirely, the header stays in its safe non-fixed top state and scrolls away with the hero rather than remaining transparent over later content.

Rejected: add a second React scroll listener/client component; the existing GSAP context already owns landing scroll behavior and cleanup. Rejected: keep the obsolete desktop mesh/bob/float loops alive against hidden elements; unnecessary selectors and comments would misdescribe the shipped desktop experience.

### Keep exact source geometry in Tailwind utilities

At the 1240px source width, preserve:

- Hero height: 640px.
- Header side inset: 44px; top/bottom padding: 22px/18px.
- Content inset: 78px; bottom padding: 110px.
- Headline: Lora 52px/1.04, weight 600, `-.02em`, maximum 700px.
- Body: 16px/1.62, maximum 480px.
- Proof rail: 44px side inset, `margin-top:-54px`, 16px/22px padding, 18px radius.

Use existing marketing tokens for lime, green ink, muted text, line color, and the follow-on light-green surface. Put only reusable gradients or state selectors in `marketing.css` if Tailwind data/arbitrary variants become illegible.

## Risks / Trade-offs

- [Remote Unsplash availability or content negotiation changes the image] → Use the exact transformed URL with `unoptimized`; capture the accepted visual baseline during apply. Vendor the returned image only if parity or reliability testing proves the remote response unstable.
- [A fixed scrolled nav can jump or cover content] → Keep the top nav out of document flow inside the first fold, reserve the designed header space in the hero, and test the transition around the trigger in both directions.
- [Refactoring the reduced-motion early return accidentally enables other motion] → Separate structural state registration from decorative tween registration and verify with `prefers-reduced-motion: reduce`.
- [Desktop-only duplicate markup can drift from mobile copy/actions] → Keep both branches colocated in the first-fold component and reuse shared CTA href constants where practical.
- [Proof-rail static values diverge from `DEMO_WISHLIST`] → Treat the rail as approved marketing copy; keep the downstream full preview tied to `DEMO_WISHLIST` and document the distinction in the component.
- [Current brand spec names a missing `awishfor-logo.svg`] → Update the capability contract to describe the actual H2b lockup while leaving footer cleanup outside this change.

## Migration Plan

1. Add the H2b variant/first-fold components and render them only on `/`.
2. Add the exact desktop photo layers, copy, lockup, CTAs, and proof rail while preserving the mobile branch.
3. Add the scrolled-state controller and remove only first-fold animation hooks that no longer have any consumer.
4. Validate typecheck, tests, Biome, reduced motion, auth states, mobile navigation, and 404 navigation.
5. Capture desktop screenshots at the 1240px artboard and 1302×739 reference viewport; iterate until the crop and geometry match.

Rollback is a component-level revert to the existing separate `MarketingNav` plus mesh `MarketingHero`; there is no data migration.

## Open Questions

None. The exported H2b source resolves the visual values, and the existing mobile/route contracts resolve the responsive and behavioral boundaries.
