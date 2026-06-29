## ADDED Requirements

### Requirement: Wizard renders with app theme tokens

The creation wizard shell and all five steps SHALL render exclusively with the app design-system theme tokens (`background`, `foreground`, `card`, `card-foreground`, `muted`, `muted-foreground`, `primary`, `primary-foreground`, `accent`, `accent-foreground`, `border`, `input`, `ring`, `destructive`) via their Tailwind semantic utilities. The wizard SHALL NOT use hardcoded color utilities (`gray-*`, `red-*`, `green-*`, `amber-*`, `bg-white`, `text-white`) for chrome, surfaces, text, borders, or states.

#### Scenario: Wizard chrome uses theme tokens

- **WHEN** the wizard renders any step at `/create`
- **THEN** surfaces use `bg-background`/`bg-card`, text uses `text-foreground`/`text-muted-foreground`, borders use `border-border`, and the active/primary affordances use `bg-primary`/`text-primary-foreground`
- **AND** no element uses a hardcoded `gray-*`, `red-*`, `green-*`, `amber-*`, `bg-white`, or `text-white` utility

#### Scenario: Status colors map to semantic tokens

- **WHEN** the Event Details step shows slug availability or the past-date warning
- **THEN** the available state uses primary/accent tokens with a `ring` affordance, the taken/invalid and past-date states use `text-destructive`, and the checking/hint states use `text-muted-foreground`
- **AND** the exact Spanish strings (`◌ Verificando…`, `✓ Disponible`, `✕ Ya está en uso`, `✕ Solo letras, números y guiones`, and the past-date warning) remain unchanged

### Requirement: Wizard uses ShadCN and shared primitives

The wizard shell and steps SHALL be composed from ShadCN UI primitives (`Button`, `Input`, `Label`, `Field`, `Textarea`, `Badge`, `Separator`, `Progress`, `Card`) and shared design-system components rather than raw `<button>`, `<input>`, or `<textarea>` markup with bespoke classes.

#### Scenario: Form controls are ShadCN primitives

- **WHEN** a user edits fields on the Event Details or Gifts step
- **THEN** the inputs, labels, and buttons are rendered by the ShadCN `Input`/`Label`/`Field`/`Button` components

#### Scenario: Step surfaces use the Card primitive

- **WHEN** the Gifts, Design, or Publish step renders a panel, gift entry, or preview frame
- **THEN** the panel is rendered with the ShadCN `Card` primitive (token-based border/radius/elevation) rather than hand-rolled `rounded-* border bg-white` markup

### Requirement: Responsive mobile-first and desktop wizard layouts

The wizard SHALL provide a deliberate mobile-first layout and a distinct desktop layout for the shell and every step, matching the §4 "Creation wizard — app theme — mobile-first" design. On mobile the shell SHALL present a single column with a compact sticky step indicator at the top and a sticky action bar at the bottom; on desktop (`md`/`lg` breakpoints and up) the shell SHALL present a wider content column with a full horizontal labeled stepper and a right-aligned action bar.

#### Scenario: Mobile layout

- **WHEN** the wizard is viewed at a mobile viewport width
- **THEN** content is a single full-width column, the step indicator is a compact progress/step label fixed to the top, the Back/Save/Next controls are a sticky bottom action bar, and interactive targets are at least 44px tall

#### Scenario: Desktop layout

- **WHEN** the wizard is viewed at a desktop viewport width (`lg` and up)
- **THEN** the content column widens, the stepper shows full step labels with done/active/upcoming states, and the Design step shows its selectors and live preview side by side

#### Scenario: Completed-step navigation preserved across layouts

- **WHEN** a user taps or clicks a completed step in the stepper on either mobile or desktop
- **THEN** the wizard navigates to that step via the `?step=` query param, and upcoming (incomplete) steps remain non-interactive
