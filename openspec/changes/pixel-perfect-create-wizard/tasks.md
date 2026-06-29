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
- [ ] 4.4 Visually verify each step at mobile and desktop widths (sticky stepper + action bar, tap targets, desktop two-column design step)
