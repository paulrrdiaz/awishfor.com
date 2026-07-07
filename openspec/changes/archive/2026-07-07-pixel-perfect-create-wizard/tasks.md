## 1. New primitives & shared chrome (additive)

- [x] 1.1 Add ShadCN `Card` primitive at `src/components/ui/card.tsx` (`Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`) using theme tokens
- [x] 1.2 Add `src/components/ui/card.stories.tsx` showing header/content/footer composition
- [x] 1.3 Create `src/components/shared/wizard-layout.tsx` — responsive frame with stepper slot, scrollable content slot, sticky action-bar slot; mobile-first + `lg` desktop layout
- [x] 1.4 Create `src/components/shared/wizard-stepper.tsx` — props-driven responsive step indicator (mobile compact `Progress`/label, desktop full labeled steps, click-to-jump for completed steps)
- [x] 1.5 Create `src/components/shared/wizard-nav.tsx` — Back / Save-draft slot / Next action bar built from `Button`, props for `isFirst`/`isLast`/handlers
- [x] 1.6 Add `.stories.tsx` for `wizard-layout`, `wizard-stepper`, `wizard-nav` covering mobile/desktop and done/active/upcoming states

## 2. Wizard shell refactor

- [x] 2.1 Refactor `wizard-shell.tsx` to compose `WizardLayout` + `WizardStepper` + `WizardNav`, removing the inline stepper (lines ~76–116) and inline nav markup
- [x] 2.2 Keep all routing/nav logic (`navigate`, `goBack`, `goNext`, `?step=` param, completed-step jump) in the shell; pass state/handlers down as props
- [x] 2.3 Re-skin the hydration loading state with theme tokens (replace `text-gray-400`/`Cargando…` styling)

## 3. Re-skin steps to theme tokens + ShadCN

- [x] 3.1 `event-type-step.tsx`: token-based selectable cards (`bg-primary`/`border-primary` selected), responsive grid, ShadCN `Button` for regenerate link
- [x] 3.2 `details-step.tsx`: replace raw inputs with `Field`/`Label`/`Input`; map slug + past-date states to `text-destructive`/`text-primary`/`ring`/`text-muted-foreground` keeping exact Spanish strings and the `✓ Disponible` green-ring affordance
- [x] 3.3 `design-step.tsx`: token-based `SelectorGrid` buttons, wrap live preview in `Card`; keep two-column `lg:grid-cols-[320px_1fr]`, stack preview below on mobile
- [x] 3.4 `gifts-step.tsx`: convert category panel, gift list rows, URL-import placeholder, and add-gift CTA to `Card` + ShadCN controls + tokens (replace gray/red literals)
- [x] 3.5 `publish-step.tsx`: re-skin to tokens + `Card`/`Button`/`Badge`; keep publish/share actions and success copy intact
- [x] 3.6 `save-draft-controls.tsx` and `recovery-prompt.tsx`: re-skin to tokens + ShadCN `Button`

## 4. Verify & validate

- [x] 4.1 Grep wizard files for residual `gray-|red-|green-|amber-|bg-white|text-white`; confirm only token utilities remain
- [x] 4.2 Update only the selectors that changed in `publish-step.test.tsx` and `save-draft-controls.test.tsx`; prefer role/label queries
- [x] 4.3 Run `pnpm check`, `pnpm test`, `pnpm typecheck` — all green
- [x] 4.4 Visually verify each step at mobile and desktop widths (sticky stepper + action bar, tap targets, desktop two-column design step) — superseded by 5.9 below now that DesignSync access is available; close this out via 5.9 instead of a separate pass

## 5. Round 2 — pixel-match desktop against the DesignSync canvas + isotype wordmark (design.md D7/D8)

- [x] 5.1 `wizard-stepper.tsx`: rebuild the mobile (`<lg`) branch as the D8 segmented bar — 5 fixed segments (`h-1 flex-1 rounded-full`, default `bg-border`, filled `bg-primary`) inside a `flex gap-2 border-b border-border bg-card px-4 py-3.5` bar; drop the shadcn `Progress`/"Paso N de 5" caption from the sticky chrome (move any such caption into step content if a step doesn't already render its own "Paso N de 5" eyebrow)
- [x] 5.2 `wizard-stepper.tsx`: rebuild the desktop (`lg:`) branch per D7's stepper spec — 26px circle nodes with upcoming/active/done states (done = `#EAF6EE`/`#2E7D4F` + checkmark, connector after a done node = `#C3E63E`), 56px×2px connectors, centered in a `py-[18px]` bar
- [x] 5.3 `wizard-layout.tsx`: add the `lg:` card-frame branch — `max-w-[1200px]` centered `bg-card border border-border rounded-[18px] overflow-hidden` shell replacing the current wider full-bleed sticky treatment at this breakpoint; mobile (`<lg`) branch unchanged (still full-bleed sticky top/bottom bars)
- [x] 5.4 Add the isotype wordmark to the desktop header slot inside the D7 card chrome — `isotype.svg` (`h-[26px] w-auto`) + "A Wish For" (`font-serif text-lg font-bold`), left-aligned, `Guardar borrador` outline button right-aligned, 58px bar height; reuse the asset path already used in `app-sidebar.tsx:101` (`/assets/isotype.svg`)
- [x] 5.5 `wizard-nav.tsx`: add the in-card footer variant for the `lg:` branch (`flex justify-between` / `justify-end` on step 1, `px-9 py-4 border-t border-border bg-card`, outline "← Atrás" + primary "Continuar →")
- [x] 5.6 Restructure `event-type-step.tsx`, `details-step.tsx`, `design-step.tsx`, `gifts-step.tsx` desktop (`lg:`) JSX into D7's per-step two-pane spec (fixed-width left pane + `flex-1` right pane; step 3's right pane uses the canvas-specified `#E6EBF0` backdrop, not `bg-background`) — keep existing store wiring, mobile JSX, and all Spanish copy/strings untouched
- [x] 5.7 Restructure the gift-edit surface (whichever component backs "edit gift" — inline row expansion or dialog) desktop treatment into D7's `Desktop Step 4b` two-pane spec (380px photo/name/link pane + flex-1 price/qty/category pane + the green "Datos obtenidos de {store}" banner when URL-imported)
- [x] 5.8 Build the extrapolated Step 5 (Publish & Share) desktop pane per D7's table — same card chrome, single centered pane holding final preview + publish checklist + (post-publish) share panel
- [x] 5.9 Run `pnpm check`, `pnpm test`, `pnpm typecheck`; visually verify all 5 steps (+ 4b) at mobile (390px) and desktop (1200px+) directly against the `Desktop Step 1`–`4`/`4b` and mobile `Step 1` canvas frames — this closes out 4.4
- [x] 5.10 Add/update Storybook stories: `wizard-stepper.stories.tsx` (desktop node states + mobile segmented bar), `wizard-layout.stories.tsx` (desktop card-frame variant), `wizard-nav.stories.tsx` (in-card footer variant)
