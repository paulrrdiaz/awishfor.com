## Why

The marketing landing page at `/` was built against an earlier revision of the Claude Design canvas. The canvas's current desktop frame is explicitly labeled **`A Wish For.dc.html` §5, "Marketing / landing · desktop · light green theme · V2 fotográfica"** — a V2 the shipped implementation predates. A direct text diff between the live components and the canvas's current copy (pulled via the `claude_design` MCP) found real content and structure drift, not just styling: a whole "Elige tu ocasión" section is missing, "Cómo funciona" has the wrong step count and copy, the nav is missing a link, hero copy is truncated, and the FAQ question set differs. Separately, several sections were ported with inline pixel styles and bespoke `m-*` CSS instead of shadcn primitives + Tailwind utilities. Before adding mobile support (tracked separately in `marketing-landing-mobile`), the desktop experience needs to be reconciled with the current canvas and brought onto the project's standard component conventions so the mobile work extends a correct, idiomatic base.

## What Changes

- Add the canvas's "Elige tu ocasión" section (occasion picker: Baby Shower, Boda, Cumpleaños, Nuevo hogar cards, each with its own "Crear mi lista →" CTA to `/create` pre-seeding that event type, plus a "¿Otra ocasión? Crea una wishlist general →" link) immediately after the hero, per the canvas order.
- Fix `how-it-works-section.tsx`: change from 3 steps ("Tres pasos...") to the canvas's 4 steps ("Cuatro pasos. Cero complicaciones."): Elige tu ocasión → Crea y personaliza → Agrega tus regalos → Comparte tu enlace, with the canvas's copy for each.
- Fix the hero body copy in `marketing-hero.tsx` to match the canvas in full, including the closing sentence about guests marking what they buy.
- Add the missing "Ocasiones" nav link in `marketing-nav.tsx` (anchor-scrolls to the new occasion-picker section, matching how "Cómo funciona" already anchor-scrolls).
- Reconcile the FAQ question set in `faq-section.tsx` against the canvas's 5 questions (canvas's 5th is "¿Necesito crear una cuenta?"; live currently shows "¿Cómo comparto mi lista?" instead — confirm with the user before dropping either, since both may be legitimately useful and the canvas may not be exhaustive).
- Decide and document whether the existing `use-cases-section.tsx` (passive 5-pill "Para cada momento que importa", mid-page) stays alongside the new occasion picker or is superseded by it — the canvas V2 only shows the top-of-page actionable picker, not both.
- Decide and document whether `hero-card-carousel.tsx`'s 4-slide auto-playing carousel (a real enhancement over the canvas's single static card) is kept as an intentional improvement or reverted to match the canvas's static single-card teaser.
- Flag the theme-swatch count mismatch (canvas §5 shows 7 swatches; the live "Temas" section shows 12, per the `expand-design-customization` work in progress) as a known, likely-intentional divergence — not something to revert, but call it out so it isn't "fixed" back to 7 by mistake during the fidelity pass.
- Replace bespoke/custom interactive markup with shadcn primitives where the canvas specifies an interactive pattern: `Accordion` for FAQ (currently custom disclosure markup), `Input`/`Button` (or `Command` if the canvas implies typeahead) for the guest finder search.
- Fall back to Tailwind utility classes for presentational-only styling; keep `marketing.css` scoped tokens (`--mbg`, `--mink`, etc.) only for values Tailwind's default theme can't express, not for layout/spacing Tailwind utilities already cover.
- Re-verify remaining sections (benefits, partners marquee, example preview, final CTA, footer) against the canvas for further copy/spacing drift beyond what this text diff already surfaced.
- No route, data, or API changes — this is a content-fidelity and markup-convention pass on the existing desktop route.

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `marketing-landing`: adds an explicit fidelity/implementation-conventions requirement (shadcn-first, Tailwind-fallback, canvas-verified) to the existing desktop landing requirements; no change to section order, theme tokens, or route behavior already specified.

## Impact

- `src/components/layouts/marketing/*.tsx` (all landing section components), plus a new `occasion-picker-section.tsx` (or similar) for the canvas's "Elige tu ocasión" block
- `src/app/(marketing)/page.tsx` — insert the new occasion-picker section after the hero
- `src/styles/marketing.css` (trim to true custom-token/animation-hook styles only)
- `src/app/(marketing)/layout.tsx` (no structural change expected, verify only)
- `src/app/create/page.tsx`, `src/components/features/wizard/event-type-step.tsx`, `src/stores/wishlist-wizard.store.ts` — `/create` currently has no query-param seeding for event type (verified: `event-type-step.tsx` only reads `eventType` from the Zustand store, nothing reads `useSearchParams`). The occasion picker's per-card "Crear mi lista →" CTAs need `/create?type=<event-type>` to pre-select step 1, which requires a small addition to read that param on wizard mount and seed the store.
- No schema or API impact.
