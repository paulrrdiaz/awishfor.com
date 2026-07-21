## Context

The landing page has zero mobile treatment today: `src/styles/marketing.css` has no `@media` rules, `marketing-nav.tsx` has no responsive classes, and `marketing-hero.tsx` uses fixed pixel type. The Claude Design canvas's mobile frame (`A Wish For.dc.html` §5, "Marketing / landing · móvil · 390px"), pulled via the `claude_design` MCP, shows this isn't meant to be a naive shrink of the desktop layout — every section has distinct, shorter mobile copy, the nav collapses to a hamburger, and the footer collapses from a 3-column grid to a flat link list. This mirrors the design brief's stated mobile-first principle and matches how the rest of the product (public wishlist page, wizard) already treats 390px as the primary target and desktop as the enhancement.

This change is sequenced after `marketing-landing-desktop`, which adds the "Elige tu ocasión" section and moves the codebase onto shadcn/Tailwind conventions — this change extends that base to small viewports rather than reworking the pre-fidelity-pass implementation.

## Goals / Non-Goals

**Goals:**
- Every section gets a real 390px-first mobile treatment sourced from the canvas mobile frame: layout (stacking, single-column grids) and copy (shorter headings/body where the canvas specifies them).
- Mobile nav uses a shadcn `Sheet` drawer triggered by a hamburger, with a condensed "Crear" CTA always visible.
- Footer collapses to the canvas's single flat link list on mobile, expanding to the existing 3-column grid at `md:`+.
- All interactive elements meet the 44px touch-target minimum.
- No desktop regression — every change is additive via responsive (`sm:`/`md:`/`lg:`) Tailwind variants layered on top of a mobile-first base, not a parallel mobile-only code path.

**Non-Goals:**
- No tablet-specific (`md:`-only) design pass beyond whatever Tailwind's existing breakpoint scale naturally produces between the 390px mobile base and the current desktop layout — the canvas only specifies 390px and desktop, not an intermediate tablet frame.
- No changes to the occasion-picker's wizard-seeding behavior (owned by `marketing-landing-desktop`) beyond making its layout responsive.
- No performance/animation rework beyond conditionally simplifying the existing GSAP effects for small viewports; no new animation library or technique.

## Decisions

**Mobile-first base classes, desktop as the override — not the reverse.** Tailwind's mobile-first convention (unprefixed = base, `sm:`/`md:`/`lg:` = larger) matches both Tailwind's own defaults and the project's stated "mobile is the real product" principle. Concretely: components currently written desktop-first with fixed pixel values (e.g. `text-[62px]`) get a smaller unprefixed base size plus an `lg:text-[62px]` (or similar) override, rather than adding a `max-md:` shrink on top of the desktop value. Rejected: `max-width` media-query overrides layered on the existing desktop-first markup — works but fights Tailwind's own convention and is harder to reason about alongside the rest of the (mobile-first) app.

**Per-section mobile copy is data, not a runtime device check.** The canvas's shorter mobile headings/body text (e.g. "Todo lo que necesitas" vs. "Todo lo que necesitas, sin complicaciones") are implemented as two strings rendered with Tailwind's responsive `hidden`/visible utilities (a `<span className="lg:hidden">short</span>` / `<span className="hidden lg:inline">long</span>` pair, or a single string with a `<br className="hidden sm:block" />`-style approach where the difference is just a dropped clause) — not a client-side viewport check. This keeps the page server-rendered and avoids layout shift/hydration flicker. Rejected: `useMediaQuery` + conditional render — client-only, causes a flash of the wrong copy before hydration, unnecessary JS for static text.

**Sheet for the mobile nav drawer.** The canvas shows a "≡" trigger opening a full link menu; shadcn's `Sheet` (already used elsewhere per the design brief's component inventory, §12: "Shadcn/Base for: ... Dialog/Sheet...") is the direct primitive for this pattern — same underlying overlay/focus-trap behavior as the `Dialog` already in use for purchase modals, just slide-in. Rejected: a custom dropdown/accordion nav — reinvents focus trapping and outside-click handling `Sheet` already provides.

**GSAP animation gating by viewport, not full disable.** The design brief's mobile-first notes emphasize touch responsiveness and performance on the actual target device, but the animations are already fully gated behind `prefers-reduced-motion`; adding a second full disable for "mobile" would remove motion for phone users who have motion enabled, which isn't what was asked. Instead, only the heavier/more decorative loops (ambient blob drift, floating emoji) get simplified or skipped below a viewport threshold inside `use-marketing-animations.ts`, while scroll-reveals, the shimmer sweep, and count-up stay everywhere. Rejected: disable all GSAP motion under a viewport breakpoint — contradicts `prefers-reduced-motion` already being the correct signal for "no motion," conflates screen size with the user's actual motion preference.

## Risks / Trade-offs

- [Maintaining two copy strings per section (mobile short / desktop long) doubles the content surface to keep in sync] → Keep both strings colocated in the same component file, directly next to each other, so future copy edits are visually forced to consider both.
- [Sheet-based nav drawer introduces a new client component boundary in what's otherwise a server-rendered nav] → Scope the client boundary to just the drawer trigger/content, keep the rest of `marketing-nav.tsx` server-rendered (it already is, for the Clerk `auth()` call).
- [Viewport-gating GSAP effects inside `use-marketing-animations.ts` adds branching to already-nontrivial animation setup code] → Gate at the effect-registration level (skip creating the tween/ScrollTrigger for viewport-gated effects) rather than creating-then-pausing, to avoid wasted work and keep the file's existing structure legible.
- [`max-md:`/`lg:`-style breakpoint choices for card grids (e.g. does the occasion picker go 1-col or 2-col at 390–767px) aren't fully specified by the text-only canvas extraction used to draft this change] → Confirm exact column counts against the canvas's visual mobile frame (via `render_preview` + browser screenshot, or the `claude.ai/design` editor) during apply, not guessed from text alone.

## Open Questions

- Exact column count for the occasion-picker cards, benefit cards, and use-case pills between 390px and the `lg:` desktop breakpoint — resolve visually against the canvas during apply.
- Does the tiendas-aliadas marquee mobile frame genuinely drop one partner logo (7 vs. desktop's 8), or is that an artifact of how the mock's marquee track was captured as text? Resolve visually; default to keeping the same partner list at every breakpoint unless the canvas visual clearly shows an intentional mobile-specific subset.
