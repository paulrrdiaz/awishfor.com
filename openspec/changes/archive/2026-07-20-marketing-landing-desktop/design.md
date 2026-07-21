## Context

The desktop landing page shipped in the archived change `2026-06-27-add-marketing-landing-page` (plus a later `2026-06-28-close-design-gaps` pass) as a fairly literal port of the Claude Design canvas: fixed-pixel Tailwind arbitrary values (`text-[62px]`, `px-11`, etc.), custom `m-*` classes in `src/styles/marketing.css`, and GSAP-driven motion wired through `MarketingShell` (`src/lib/gsap/use-marketing-animations.ts`). It works and is wired end-to-end (nav → footer, GSAP context, `prefers-reduced-motion` handling), but it predates the project's later shadcn-first convention (see `docs/CLAUDE_DESIGN_PROMPT.md` §12, "Where Shadcn vs custom").

A text-level diff (pulled live via the `claude_design` MCP against `A Wish For.dc.html` §5, "Marketing / landing · desktop · light green theme · **V2 fotográfica**") found the canvas has moved past what was implemented: it adds a top-of-page "Elige tu ocasión" CTA picker the live page doesn't have, changed "Cómo funciona" from 3 to 4 steps with different copy, extended the hero body copy, added an "Ocasiones" nav link, and changed one FAQ question. The live "Temas" section also shows 12 swatches against the canvas's 7 — almost certainly from the separate, in-progress `expand-design-customization` change, not a regression, and should not be "corrected" back to 7. Since `marketing-landing-mobile` will extend this same code, this fidelity pass needs to land first.

## Goals / Non-Goals

**Goals:**
- Close the concrete content/structure gaps already identified: add the "Elige tu ocasión" section, fix how-it-works to 4 steps, fix hero copy, add the "Ocasiones" nav link, reconcile the FAQ question set.
- Every remaining landing section verified 1:1 against the canvas desktop frame via `claude_design` MCP (`get_claude_design_prompt` + `read_file`/`render_preview` on `A Wish For.dc.html`) for further drift beyond what's already found.
- FAQ uses shadcn `Accordion`; guest finder uses shadcn `Input`/`Button` (and `Command` only if the canvas shows autocomplete-style results, otherwise a plain filtered list is fine — verify against canvas before adding `Command`).
- `marketing.css` trimmed to values Tailwind's theme genuinely can't express (the marketing palette custom properties, the shimmer gradient, GSAP animation target selectors) — not layout/spacing that has a direct Tailwind utility.
- The 12-theme "Temas" section and the carousel-based hero teaser are explicitly preserved as intentional product state, not reverted to the canvas's older 7-theme/static-card version.

**Non-Goals:**
- No mobile/responsive work — that's `marketing-landing-mobile`, sequenced after this change.
- No copy changes beyond fixing the identified drift and any further drift a full canvas re-verification surfaces.
- No changes to `PublicWishlistPage` itself (the example-preview section only changes its own wrapper markup/imports, not the shared component it mounts).
- No GSAP animation *behavior* changes — only markup/class changes that must not break existing `data-*` animation hooks (`data-float`, `data-reveal`, `data-shimmer`, `data-glow`, `data-pulse`, `data-bob`, `data-spin`, `data-mesh`) that `use-marketing-animations.ts` targets. The new occasion-picker section gets the same reveal treatment as its sibling sections.
- No wizard steps beyond step 1's event-type seeding change; the rest of `/create` is untouched.

## Decisions

**Occasion picker seeds the wizard via a URL param, not a new store/route.** `event-type-step.tsx` currently only reads `eventType` from `useWizardStore`; nothing reads `useSearchParams`. Add a `type` query param (`/create?type=baby_shower`) read once on `WizardProvider` mount (or in `event-type-step.tsx` itself) to call the store's existing event-type setter before first render, so a fresh visitor arriving from the landing page's occasion picker lands on step 1 pre-selected rather than needing to click again. Rejected: a separate seeded route per event type — more routes for no benefit over a query param; rejected: passing state via `sessionStorage` — a URL param is simpler, shareable, and matches how the rest of the app already threads state through the URL (e.g. wishlist slugs).

**Keep both the occasion picker and the existing use-cases pills, but re-scope the latter.** The canvas V2 only shows the top-of-page actionable picker (4 cards + CTAs), not the existing mid-page passive 5-pill "Para cada momento que importa" section — but the passive section still legitimately answers "what event types does this support" for a visitor who scrolled past the hero without clicking. Keep `use-cases-section.tsx` as-is (it's still accurate, just not in the canvas's current V2 mockup) rather than deleting it; the new occasion picker becomes the primary top-of-funnel CTA, the pills stay as a secondary recap. Flag this choice in the PR description since it's a judgment call, not a literal canvas match. Rejected: delete the pills section to match the canvas exactly — loses a working, harmless section for no user benefit.

**Keep the hero carousel; keep 12 themes.** Both are later, working enhancements beyond what canvas §5 shows (a static single card, 7 themes). Reverting either would be a regression dressed up as "fidelity." Rejected: match canvas exactly — actively worse product state.

**Shadcn Accordion for FAQ over custom disclosure markup.** The repo already has `Accordion` in `src/components/ui/` per the design brief's component inventory (§9, §12: "Shadcn/Base for: ... Tabs, Progress, Toast..."; Accordion is the documented pattern for FAQ). Custom markup duplicates focus/ARIA handling `Accordion` already provides. Rejected: keep custom markup — more code, worse a11y, contradicts the explicit "ShadCN primary, Tailwind fallback" instruction for this work.

**Audit-then-fix, not rewrite.** Read each component against the canvas and change only what's actually wrong (copy drift, missing shadcn primitive, non-Tailwind-expressible inline style) rather than a full rewrite. The existing GSAP wiring and section structure already satisfy the `marketing-landing` spec's section-order and animation requirements — a rewrite risks regressing working motion code for no behavioral gain. Rejected: full rewrite of all components — higher regression risk, no spec requirement demands it.

**Keep `marketing.css` for true custom tokens only.** Tailwind v4's `@theme inline` can't express the marketing-only palette (`--mbg`, `--mink`, etc., scoped to `.marketing-theme` so they don't leak into the app `:root` or public wishlist themes — already a hard requirement in `openspec/specs/marketing-landing/spec.md`). Those stay in CSS. Pure spacing/layout currently duplicated as inline `style={{ ... }}` where a Tailwind arbitrary-value class already exists moves to Tailwind classes. Rejected: move everything to Tailwind including the theme tokens — would either leak scoping or require duplicating the token table as a Tailwind config extension, more churn than value.

## Risks / Trade-offs

- [Canvas re-verification surfaces content drift the team intentionally diverged from] → Flag drift in the PR description rather than silently "fixing" it back to the canvas; confirm with the user before changing copy that looks intentional.
- [Swapping custom FAQ/guest-finder markup for shadcn primitives changes DOM structure GSAP or tests target] → Check `use-marketing-animations.ts` selectors and any existing tests (`*.test.tsx` under this component tree, if present) before/after the swap; update `data-*` hooks on the new markup rather than removing them.
- [Trimming `marketing.css` accidentally removes a rule GSAP still targets via class selector rather than `data-*` attribute] → Grep `use-marketing-animations.ts` for class-based selectors before deleting any `m-*` rule.

## Open Questions

- Does the canvas's guest-finder frame show autocomplete/typeahead results (→ shadcn `Command`) or a simple submit-and-filter list (→ plain `Input` + `Button`)? Resolve via `claude_design` MCP during apply.
- FAQ question set: canvas's 5th question is "¿Necesito crear una cuenta?"; live currently asks "¿Cómo comparto mi lista?" instead. Both are legitimate visitor questions. Default: keep both by expanding to 6 questions, unless the user prefers a straight swap to match the canvas's 5 — confirm during apply rather than guessing.
