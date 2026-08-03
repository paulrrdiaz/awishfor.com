## Redesign marketing sections (mobile) — verification

### Commands

- `pnpm check` (with `check:write` for the two Tailwind class-order fixes it flagged) — passed
- `pnpm test` — 73 files, 635 tests passed
- `pnpm typecheck` — passed
- `pnpm audit:marketing` — see below

### Design-source correction found during implementation

Before implementing, the actual canvas (`A Wish For.dc.html`, imported via the `claude_design` MCP) was
read directly for the §5 desktop (line ~7328) and mobile (line ~7328, adjacent) marketing frames, because
`design.md`'s "Key measurements" table and this change's own `proposal.md`/`spec.md` described a FAQ with
a `flex` split and a dark `#173E29` support panel that **does not exist in the canvas at any width** — both
the desktop and mobile FAQ frames are a plain accordion list, matching what `faq-section.tsx` already
rendered pre-change. Section 3's tasks (3.1/3.3, "transition the split container", "support panel padding")
were therefore no-ops beyond a breakpoint-threshold correction (`sm:` → `lg:`, matching the repository's
`lg` convention); no split/panel was built because none is specified by the design source. This is recorded
here rather than silently reinterpreting the change's spec — the FAQ requirement text in
`specs/marketing-landing/spec.md` inherited the same inaccurate description and should be corrected if this
change is archived into the base spec.

The canvas review also showed the desktop occasion-picker frame is itself a mosaic (promoted lead card +
3 tiles + dark "wishlist general" tile via `grid-template-columns:1.3fr 1fr 1fr`), not four equal cards
with a centered text-link fallback as `spec.md`'s "Desktop composition is unaffected" scenario states. The
pre-change code already approximated this mosaic (at a `md:` 768px threshold, with invented mobile values),
so the real gap was: switch the breakpoint to `lg` (1024px, matching `design.md`'s own documented decision)
and replace the invented mobile card sizes with the canvas's actual values (172px lead / 130px tiles / 12px
gap / 16px radius).

### Visual parity

**Desktop (≥1024px, live at the environment's actual viewport, ~1920px):** every rebuilt section was
screenshotted end-to-end via the running dev server — occasion picker mosaic, benefits grid, the five-step
timeline, the example preview card, guest-finder band, FAQ accordion, final CTA band, and the newsletter
footer band — and all render correctly with no regression from the pre-change desktop composition.

**Mobile (390px):** this environment's browser window could not be resized below its actual display
size (`resize_window` calls to 390×844 and 420×900 both reported success but `window.innerWidth` stayed at
1920/3840 — the display appears fixed), so a live narrow-viewport screenshot was not obtainable, same
limitation the desktop change's own verification recorded for its reflow check. Verification instead relied
on: (a) every mobile value being taken directly from the canvas's `móvil · 390px` frame markup during this
session (not estimated), (b) `pnpm test` asserting the structural facts that regress silently (single "Crear
mi lista →" node, single "wishlist general" link, exactly 5 FAQ items and 5 timeline steps, gift-state badge
counts, no floating decoration), and (c) code-level review of every responsive class added.

### Structural facts / no copy duplication

All mobile-only omissions (occasion tile subtitles/CTA, the occasion-picker intro paragraph, the "Cómo
funciona" intro paragraph, the example preview's topbar and "Lista de regalos" summary row) are implemented
as `hidden lg:block` / `hidden lg:flex` toggles on a single existing DOM node — never a second, duplicate
node with the same or a shortened string. The canvas's alternate mobile copy (shorter CTAs, "Cinco pasos",
"Una wishlist publicada", the shortened final-CTA heading) was deliberately **not** adopted, per this
change's and the desktop change's "single copy set" decision — every heading/body/CTA string is byte-identical
between breakpoints.

### Touch targets

Every element touched by this change (`m-btn`-based buttons, occasion-picker card links, FAQ accordion
triggers, gift-grid cards) meets the 44×44 minimum at its mobile composition. One **pre-existing, untouched**
gap was found: the newsletter "Unirme" button (`newsletter-form.tsx`, not modified by this change) renders
at roughly 32px tall below `lg` (`py-[9px]` at `text-[12px]`), short of 44px. This predates this change and
sits outside its 8-section/marked-file scope, so it is recorded here as a finding rather than fixed inline.

### Performance audit

`pnpm audit:marketing` fails the same pre-existing budget check on this change **and** on unmodified `main`
(confirmed via `git stash` + rerun): the `hero-occasion-rotation` ambient timer swaps in a full-size,
unoptimized hero photograph after load, tripping the "total transfer" / "high-priority images" budgets. This
reproduces identically before any of this change's edits and belongs to the `hero-occasion-rotation`
capability (out of scope here, same finding the desktop change's own verification recorded).

### Reduced motion

No animation, transition duration, or `data-*` motion hook was touched by this change — all edits are
Tailwind layout/typography classes plus the `.m-eyebrow` breakpoint split in `marketing.css`. The lime CTA
glow (`m-btn-glow`, gated on `prefers-reduced-motion: no-preference`) is unchanged.

### Files changed

`marketing.css`, `occasion-picker-section.tsx`, `faq-section.tsx`, `benefits-section.tsx`,
`how-it-works-section.tsx`, `example-preview.tsx`, `guest-finder.tsx`, `final-cta.tsx`. `newsletter-form.tsx`
and `marketing-footer.tsx` needed no changes — their mobile composition (dark footer, stacked full-width
pill form) was already correct from the desktop change.
