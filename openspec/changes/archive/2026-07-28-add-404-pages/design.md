## Context

The app has no `not-found.tsx` at any segment. Ten `notFound()` call sites and every unmatched URL currently render the Next.js framework default.

```
notFound() call sites (10)                    caught by
──────────────────────────────────────────────────────────────────
w/[slug]/page.tsx:56                    ─┐
w/[slug]/[guestSlug]/page.tsx:45,54     ─┴→ app/w/[slug]/not-found.tsx

(protected)/dashboard/wishlists/[id]/
  layout.tsx:14 · page.tsx:19
  settings:16 · gifts:28 · guests:23    ─┬→ dashboard/wishlists/not-found.tsx
  design:16 · categories:17             ─┘

unmatched URL (/foo, /w/a/b/c)           ─→ app/not-found.tsx
```

Three constraints shape the design:

1. **Root `not-found.tsx` renders inside `app/layout.tsx` only.** It does not inherit `(marketing)/layout.tsx` or `(protected)/layout.tsx`, so the marketing 404 must establish its own theme wrapper and shell.
2. **`src/styles/marketing.css:1-8` documents a GSAP-only motion convention** — "Motion is driven by GSAP, NOT CSS keyframes… Content renders at its final state by default so the page is fully visible without JS." A `grep` for `@keyframes` across both stylesheets returns zero hits; the repo has no CSS animation anywhere.
3. **The design canvas (§11) ships pure CSS keyframes.** Porting it verbatim would contradict (2).

Design source: `A Wish For.dc.html` §11, plus `screenshots/404-check.png`. Existing GSAP infrastructure lives in `src/lib/gsap/` (five hooks) with a data-attribute dispatch pattern established by `useMarketingAnimations`.

## Goals / Non-Goals

**Goals:**

- Three branded not-found boundaries covering all ten `notFound()` call sites plus unmatched URLs.
- One shared illustration component, themeable per surface.
- Motion that honors the repo's single-system convention without leaving reduced-motion users with a broken composition.
- Guest finder behavior shared between the landing page and the public 404 with zero regression risk to the shipped landing.

**Non-Goals:**

- The archived wishlist state (`w/[slug]/page.tsx:59-73`).
- Unmatched paths under `/dashboard` resolving to a dashboard-themed page.
- Metadata or `<title>` control on the marketing and dashboard boundaries.

## Decisions

### 1. GSAP for the loop, not CSS keyframes

**Decision:** Port §11's four keyframes to a new `src/lib/gsap/use-escaped-gift-motion.ts` following the existing data-attribute pattern.

**Why:** The repo has one motion system and says so in writing. The 404 loop is GSAP's weakest case — permanent, above-the-fold, no scroll trigger, no interaction — so this costs a client boundary that CSS would not have needed. But a second motion system is a durable tax on every future contributor, while the client boundary is a one-time cost on a leaf component that renders no data.

**Alternatives considered:**

- *Port the CSS keyframes and amend the convention.* Zero JS, works with scripting disabled, and matches the canvas byte-for-byte. Rejected: splitting motion across two systems for one page makes "how do I animate something here" ambiguous forever.
- *Ship static art, no loop.* §11 names *"animación en bucle"* in its own title; the escaping gift is the concept.

### 2. The illustration owns its own `gsap.context()`

**Decision:** `GiftEscapedArt` is a `"use client"` leaf holding its own ref and calling `useEscapedGiftMotion(ref)`. All three not-found pages remain server components and render `<GiftEscapedArt />` directly.

**Why:** The marketing 404 already needs `MarketingShell` for `data-mesh`, `data-glow`, and `data-reveal` — all three exist and §11 uses all three (`btn-glow` on the desktop CTA, `.mgrad` on the panel). A separate motion wrapper would mean nesting two contexts just to draw one box, and a wrapper that every page must remember to add is a wrapper someone will forget. Contexts scope to disjoint subtrees, so nesting `GiftEscapedArt` inside `MarketingShell` is safe.

**Alternatives considered:**

- *Separate `EscapedGiftMotion` shell per page.* Mirrors `MarketingShell` literally, keeps the art as pure RSC markup. Rejected: two wrappers per page, easy to omit one.
- *Fold the attributes into `useMarketingAnimations`.* One hook total, but drags marquee/shimmer/mesh logic into public and app-themed pages that will never use it.

### 3. Particles rest visible, not hidden

**Decision:** Confetti and sparkle elements render at staggered vertical offsets at full opacity; GSAP animates *from* that resting position.

**Why:** §11's `confFall` keyframe starts at `opacity: 0`. Mirroring that resting state under GSAP means confetti is invisible whenever motion does not run — a bare box between two 4s for reduced-motion users. Resting visible satisfies `marketing.css`'s stated "final state by default" rule and degrades to a composed static scene.

### 4. Illustration includes the numerals; confetti config is a module constant

**Decision:** `GiftEscapedArt` renders the full `4 · caja · 4` unit plus the particle field. Particle definitions live in a module-level constant array.

**Why:** The canvas treats this as one absolutely-positioned unit (`width:560px;height:270px`) identical across all three surfaces; splitting it would push positioning math into every page. Keeping particle timing in a constant rather than randomizing avoids an SSR/client hydration mismatch — GSAP reads each node's duration and delay from `data-*`.

Sizing is a responsive rule inside the component (the canvas scales 108→152px public, 112→176px marketing across breakpoints, which is one rule, not two sizes). A `size` prop exists only for the dashboard's smaller variant.

### 5. Dashboard boundary sits at `wishlists/`, not `wishlists/[id]/`

**Decision:** `src/app/(protected)/dashboard/wishlists/not-found.tsx`.

**Why:** `[id]/layout.tsx:14` throws `notFound()` itself, and that same layout renders `WishlistDetailNav` using the wishlist it just failed to load. A boundary at `[id]/not-found.tsx` would sit *inside* the layout that threw. Placing it one segment up covers all eight call sites including the layout, and still renders within `(protected)/layout.tsx` so `AppSidebar` survives.

**Alternatives considered:**

- *No dashboard boundary.* Owners with a bad wishlist id would get the green marketing 404 offering "Ver un ejemplo", with no sidebar — the most jarring context jump in the product.
- *`global-not-found.tsx`.* Supported in Next 16.2.9 (`next-app-loader/index.js:97`) and would additionally unlock a metadata export, but it bypasses the root layout entirely, requiring `<html>`, both stylesheets, and both font variables to be re-declared in a file that must track `layout.tsx` forever.

### 6. Share the finder as a hook, not a component

**Decision:** Extract the zod schema, `extractWishlistSlug` call, `router.push`, and not-recognized error state into `src/lib/wishlist/use-guest-finder.ts`. `guest-finder.tsx` keeps its exact JSX and consumes the hook; a new `guest-finder-field.tsx` renders public-themed markup over the same hook.

**Why:** `guest-finder.tsx` hardcodes marketing tokens throughout — `border-[var(--mline)]`, `text-[var(--mink)]`, `focus-visible:border-[var(--mrose)]`, and `className="m-btn m-btn-pri"`. Every one is defined only under `.marketing-theme` (`marketing.css:10-24`), so inside `PublicThemeProvider` the `.m-btn` rules never match and the `var(--m*)` lookups resolve to nothing. Reuse therefore requires a token-swap layer regardless. What must not drift is behavior, not markup — and a hook shares exactly that while leaving the shipped landing's JSX untouched.

**Alternatives considered:**

- *`GuestFinderForm` with a `tone` prop.* One markup source, no JSX duplication. Rejected: routes every landing-page finder pixel through a new abstraction, requiring a visual re-check of shipped UI for no behavioral gain.
- *Duplicate the form.* Validation rules and slug-extraction would silently diverge.

### 7. Accept generic metadata

**Decision:** No metadata mechanism for the marketing and dashboard boundaries.

**Why:** `not-found.tsx` carries no metadata export — the existence of `global-not-found.tsx` as a distinct file type is the evidence. The public 404 is already correct: `w/[slug]/page.tsx:34` ends its title ternary with `"Lista no encontrada"` and returns `robots: { index: false }`, a branch written for exactly this case. The residual gap is a generic `<title>` on two surfaces, while the HTTP 404 status — what crawlers key on — is set by Next regardless.

## Risks / Trade-offs

- **Reduced-motion and no-JS visitors see a still illustration** → Decision 3 makes the resting state a composed scene rather than a bare box; the heading, message, and all CTAs are plain markup and never depend on JS.
- **`generateMetadata` may not survive a page throwing `notFound()`** → the public 404's title and `noindex` depend on it. Verified explicitly as a task rather than assumed; if it does not hold, the public 404 degrades to the same generic title already accepted for the other two surfaces.
- **Segment boundaries could fail to catch layout-thrown `notFound()`** → mitigated by Decision 5's placement, and verified against `[id]/layout.tsx` specifically as a task.
- **Refactoring `guest-finder.tsx` touches shipped landing UI** → the hook extraction changes no JSX and no class names; the landing finder is exercised as a verification task.
- **Three compositions repeat chrome and copy structure** → accepted. Chrome, type scale, theme source, and CTAs genuinely differ per surface; the shared part is the illustration, which is extracted. A premature shared shell would be designed around two cases before the third exists.

## Migration Plan

Additive. No schema, env, or API changes. All new files except `guest-finder.tsx`, whose change is internal.

Rollback is a revert: the ten `notFound()` call sites return to the framework default 404, which is their current behavior.

## Open Questions

None. All decisions were resolved before drafting; the two items carrying genuine uncertainty (`generateMetadata` survival, layout-thrown boundary placement) are framework behaviors written up as explicit verification tasks rather than assumptions.
