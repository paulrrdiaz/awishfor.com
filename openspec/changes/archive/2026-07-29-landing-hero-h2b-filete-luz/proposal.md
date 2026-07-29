## Why

The shipped landing page still uses the earlier green mesh, separate navigation bar, and rotating wishlist-card hero, while the authoritative Claude Design export now selects the photographic **H2b · Filete de luz** first fold. Replacing the first fold closes the most visible design gap on the public acquisition route and gives the brand the clearer editorial hierarchy, named lockup, and real-wishlist proof shown in the approved design.

## What Changes

- Replace the desktop landing navigation and hero with the H2b photographic composition: navigation over the image, a thin light divider, protected contrast gradients, bottom-left copy, and the exact approved CTA hierarchy.
- Change the desktop brand treatment from the current standalone image to the exported isotype plus the Lora “A Wish For” wordmark.
- Add the overlapping “Ejemplo real” teaser rail with María & Tomás metadata, three gift summaries, public URL, and a link to the existing full example section.
- Add the H2b scrolled-navigation state: the transparent photo overlay becomes a compact mint bar while preserving auth-aware navigation and the primary CTA.
- Remove the desktop mesh, floating emoji, stats card, and rotating hero carousel from the first fold; preserve the existing occasion picker and every subsequent landing section.
- Preserve the existing mobile navigation drawer, mobile copy treatment, touch targets, reduced-motion behavior, and all route/auth semantics.
- Verify the result at the exported 1240px desktop artboard and the supplied 1302×739 reference viewport, including image crop, typography, gradients, spacing, and overlap.

### Non-goals

- Redesigning the landing sections below the first fold.
- Replacing the downstream full “Ejemplo real” preview or changing `PublicWishlistPage`.
- Changing the creation flow, authentication behavior, database schema, APIs, analytics, or environment variables.
- Porting Claude Design’s `support.js`; it is export-renderer infrastructure, not application behavior.
- Shipping the H2b canvas annotation label as part of the website.

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `marketing-landing`: updates the desktop first-fold visual and interaction contract to H2b, including its brand lockup, photographic hero, proof rail, animation set, responsive boundary, and scrolled navigation state.

## Impact

- `src/app/(marketing)/page.tsx`: first-fold composition if navigation moves inside a shared hero shell.
- `src/components/layouts/marketing/marketing-nav.tsx`: H2b overlay and scrolled variants while retaining Clerk-aware links and the mobile drawer.
- `src/components/layouts/marketing/marketing-hero.tsx`: photographic desktop hero and exact H2b content.
- `src/components/layouts/marketing/hero-card-carousel.tsx`: retained for the existing mobile first fold but no longer rendered at desktop widths.
- `src/styles/marketing.css`: H2b-specific gradients/tokens only where Tailwind utilities cannot express the behavior cleanly; obsolete first-fold mesh helpers may be removed if unused.
- `src/lib/gsap/use-marketing-animations.ts`: retire obsolete hero loops and add H2b entrance/header-state motion with the existing reduced-motion fallback.
- Existing `/assets/isotype.svg` plus the already-allowed exact Unsplash photo source; no new asset or image-host configuration is expected.
- No schema, API, route, environment-variable, or dependency impact.
