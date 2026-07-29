## 1. Shared occasion data source

- [x] 1.1 Create `src/components/layouts/marketing/hero-occasions.ts` with the `HeroOccasion` type from design D3: `id`, `label`, `photo: { desktop, mobile }`, `scrim: "light" | "medium" | "heavy"`, `rail`, `card`.
- [x] 1.2 Populate `HERO_OCCASIONS` with the four occasions, wedding first, migrating the existing `EXAMPLES` data from `hero-card-carousel.tsx` into the `card` field of each entry.
- [x] 1.3 Fill each occasion's `rail` field with the spec content: wedding uses “María & Tomás”, 68 days, 16 gifts, “Copas de cristal” / “Vajilla 12 pzs” / “Set de mantelería”, `awishfor.com/w/maria-y-tomas`, “Ver esta wishlist →”. Write matching three-gift rail content for the other three occasions.
- [x] 1.4 Set each occasion's `photo.desktop` to a landscape Unsplash crop and `photo.mobile` to a tighter portrait crop of the same photograph, keeping each value a single replaceable string. Wedding `photo.desktop` keeps the current canvas photograph `photo-1519741497674-611481863552`.
- [x] 1.5 Check each candidate photograph's luminance behind the headline area and assign its `scrim` value accordingly; document the reasoning in a short comment beside each entry.
- [x] 1.6 Point `hero-card-carousel.tsx` at `HERO_OCCASIONS` and delete its local `EXAMPLES` constant, leaving its Embla autoplay, looping, and dot behavior unchanged.

## 2. Hero scrim and image stack

- [x] 2.1 Convert the three hero overlay gradients in `h2b-hero.tsx` to read their opacity stops from a scrim CSS custom property, preserving the exported `96deg` horizontal, `180deg` vertical, and 112px header gradient structure.
- [x] 2.2 Define the `light` / `medium` / `heavy` scrim values and wire the active occasion's value onto the hero element.
- [x] 2.3 Replace the single hero `<Image>` with a stack of four absolutely positioned layers, one per occasion, index 0 visible and the rest at `opacity: 0` from the server-rendered HTML.
- [x] 2.4 Set loading strategy per design D6: index 0 `priority`, indices 1–3 `loading="lazy"` plus `fetchPriority="low"`, and remove `unoptimized` from the hero images.
- [x] 2.5 Use each occasion's `photo.mobile` below `lg` and `photo.desktop` at `lg` and above, with `sizes` set so mobile requests mobile-width images.

## 3. Rotation driver and motion

- [x] 3.1 Add a `HeroRotatorDriver` client component that owns the active index and sets `data-active` on the matching image layer and rail variant, and nothing else.
- [x] 3.2 Register a `data-hero-rotator` timeline in `src/lib/gsap/use-marketing-animations.ts`: 5.5s hold, 1.6s crossfade with `power2.inOut`, looping across the four slides.
- [x] 3.3 Add the Ken Burns layer to the same timeline — `scale` 1.00 → 1.06 plus a small translate drift across each slide's on-screen life, with direction alternating between consecutive slides.
- [x] 3.4 Confirm the timeline animates only `transform` and `opacity`.
- [x] 3.5 Delay rotation start until after the window `load` event so it cannot compete with the first slide's fetch.
- [x] 3.6 Pause and resume the timeline on `document.visibilitychange`, and pause it via ScrollTrigger when the hero leaves the viewport.
- [x] 3.7 Return early from the rotator setup under `prefers-reduced-motion: reduce`, leaving slide 0 visible and static.
- [x] 3.8 Update the `useMarketingAnimations` doc comment to document the `data-hero-rotator` attribute.

## 4. Rotating proof rail

- [x] 4.1 Rewrite `hero-example-rail.tsx` to render one variant per occasion from `HERO_OCCASIONS`, all server-rendered, index 0 marked active.
- [x] 4.2 Bring the rail up to its spec content: three gift summaries, the `awishfor.com/w/maria-y-tomas` URL line, and the “Ver esta wishlist →” action pointing at `#ejemplo`.
- [x] 4.3 Apply the 54px bottom overlap of the photograph specified by the design canvas.
- [x] 4.4 Toggle `inert` and `aria-hidden="true"` on inactive variants alongside `data-active`, so exactly one rail is announced and exactly one link is focusable.
- [x] 4.5 Crossfade the rail variants on the same timeline interval as the photograph crossfade, driven by the single rotation clock.

## 5. Unify the first fold

- [x] 5.1 Make `h2b-hero.tsx` responsive: remove `hidden lg:block`, scale the H2b geometry down for small viewports, and keep the 1240px desktop composition intact at `lg` and above.
- [x] 5.2 Add the trust line “Gratis · sin comisiones · +10 mil listas creadas” below the CTA row at every viewport.
- [x] 5.3 Port the shorter mobile hero copy from `marketing-hero.tsx` using the existing `lg:hidden` / `lg:block` server-rendered pairing.
- [x] 5.4 Simplify `marketing-first-fold.tsx` to nav plus the single responsive hero, dropping the viewport split.
- [x] 5.5 Move `HeroCardCarousel` into `occasion-picker-section.tsx` below the four occasion cards.
- [x] 5.6 Delete `src/components/layouts/marketing/marketing-hero.tsx`.
- [x] 5.7 Confirm no remaining references to `MarketingHero` anywhere in `src/`.

## 6. Remove dead animation and CSS

- [x] 6.1 Remove the `data-mesh`, `data-bob`, `data-pulse`, `data-spin`, and `data-shimmer` loops from `use-marketing-animations.ts`.
- [x] 6.2 Verify `data-float`, `data-float-rev`, and `data-float-3` loops remain, since `final-cta.tsx` and `guest-finder.tsx` still use them.
- [x] 6.3 Remove the `m-mesh`, `m-dot-grid`, and `m-shimmer` rules from `src/styles/marketing.css`.
- [x] 6.4 Verify `m-blob` remains, since `final-cta.tsx` still uses it.
- [x] 6.5 Grep for each removed attribute and class name to confirm zero remaining references.

## 7. Verification

- [x] 7.1 Confirm the rendered HTML contains all four occasions' rail copy and the hero copy without hydration, and that no carousel, tablist, or live-region semantics appear on the hero.
- [x] 7.2 Confirm with JavaScript disabled that the hero shows the wedding photograph, correct scrim, full copy, trust line, and wedding rail.
- [x] 7.3 Confirm with `prefers-reduced-motion: reduce` that the photograph does not rotate, crossfade, scale, or drift.
- [x] 7.4 Confirm in a network trace that only the wedding photograph is high priority, the other three are low priority, and hero images are served in an optimized format.
- [x] 7.5 Confirm keyboard tab order through the hero hits exactly one rail link, and that the rotation does not steal or move focus.
- [x] 7.6 Run `pnpm check`, `pnpm test`, and `pnpm typecheck`; fix anything they surface.

## 8. Sync docs and specs

- [x] 8.1 Mark the corresponding milestone items in `docs/TASKS.md` once the work above is complete.
- [x] 8.2 Archive note: `openspec/specs/marketing-landing/spec.md` takes the delta in `specs/marketing-landing/spec.md`, and `hero-occasion-rotation` becomes a new capability spec.
