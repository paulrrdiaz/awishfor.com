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

The wizard SHALL provide a deliberate mobile-first layout and a distinct desktop layout for the shell and every step, pixel-matching the DesignSync canvas (`A Wish For.dc.html`) frames `Desktop Step 1`–`4`/`4b` (desktop) and `Step 1` (mobile stepper markup). On mobile the shell SHALL present a single full-bleed column with a segmented 5-bar step indicator sticky at the top and a sticky action bar at the bottom. On desktop (`lg` breakpoint and up) the shell SHALL present a centered `max-w-[1200px]` card containing its own logo header, full labeled stepper, two-pane step content, and footer action bar — not a wider version of the mobile full-bleed shell.

#### Scenario: Mobile layout

- **WHEN** the wizard is viewed at a mobile viewport width
- **THEN** content is a single full-width column, the step indicator is a 5-segment bar (`.wbar`/`.wseg`-equivalent: fixed segments, no continuous percentage fill) fixed to the top, the Back/Save/Next controls are a sticky bottom action bar, and interactive targets are at least 44px tall

#### Scenario: Desktop layout

- **WHEN** the wizard is viewed at a desktop viewport width (`lg` and up)
- **THEN** the wizard renders as a centered card (`bg-card`, `border-border`, `rounded-[18px]`) containing an in-card logo header (isotype + "A Wish For" wordmark, left; "Guardar borrador", right), an in-card full stepper with 26px done/active/upcoming nodes and connecting lines, a fixed-height two-pane content area (fixed-width left pane + flex-1 right pane, per-step widths as specified in design.md D7), and an in-card footer nav (outline "← Atrás" + primary "Continuar →")
- **AND** the Design step's right pane renders its live preview on the canvas-specified `#E6EBF0` backdrop, not the app background

#### Scenario: Completed-step navigation preserved across layouts

- **WHEN** a user taps or clicks a completed step in the stepper on either mobile or desktop
- **THEN** the wizard navigates to that step via the `?step=` query param, and upcoming (incomplete) steps remain non-interactive

### Requirement: Desktop wizard header shows the product wordmark

The desktop (`lg` and up) wizard card header SHALL display the `isotype.svg` mark together with the "A Wish For" serif wordmark, matching every `Desktop Step` canvas frame. The mobile wizard chrome SHALL NOT show this wordmark (not present in any mobile canvas frame).

#### Scenario: Desktop header wordmark

- **WHEN** the wizard is viewed at a desktop viewport width (`lg` and up)
- **THEN** the card header's left side shows the isotype mark (26px tall) followed by "A Wish For" in the serif font, and the right side shows the "Guardar borrador" action

#### Scenario: Mobile header has no wordmark

- **WHEN** the wizard is viewed at a mobile viewport width
- **THEN** the sticky mobile chrome does not render the isotype mark or "A Wish For" wordmark
