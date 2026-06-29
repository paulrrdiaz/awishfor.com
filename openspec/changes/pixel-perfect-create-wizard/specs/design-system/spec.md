## ADDED Requirements

### Requirement: Card primitive in the UI layer

The design system SHALL provide a ShadCN `Card` primitive at `src/components/ui/card.tsx` exporting `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, and `CardFooter`, styled with app theme tokens (`bg-card`, `text-card-foreground`, `border-border`, token radius). It SHALL contain no feature state.

#### Scenario: Card renders from tokens

- **WHEN** a `Card` is rendered
- **THEN** it uses `bg-card`/`text-card-foreground`/`border-border` and the design-system radius, with no hardcoded color utilities

#### Scenario: Card has a story

- **WHEN** Storybook is run
- **THEN** a story for the `Card` primitive renders its header/content/footer composition

### Requirement: Shared wizard chrome components

The design system SHALL provide reusable, presentational wizard chrome components in `src/components/shared/`: `WizardLayout` (responsive page frame with stepper, content, and sticky action slots), `WizardStepper` (responsive step indicator with done/active/upcoming states and click-to-jump for completed steps), and `WizardNav` (Back / Save-draft slot / Next action bar built from `Button`). These components SHALL be stateless presentational components that receive state and handlers via props and SHALL NOT access the wizard store or routing directly.

#### Scenario: Components live in shared and are presentational

- **WHEN** `WizardLayout`, `WizardStepper`, and `WizardNav` are inspected
- **THEN** they reside under `src/components/shared/`, render from app theme tokens, and take all data/handlers as props without importing the wizard store or `next/navigation`

#### Scenario: Stepper reflects step state

- **WHEN** `WizardStepper` is given the step list, the current step, and which steps are complete
- **THEN** it renders completed steps as done, the current step as active, upcoming steps as non-interactive, and invokes the provided callback when a completed step is selected

#### Scenario: Wizard chrome components have stories

- **WHEN** Storybook is run
- **THEN** stories exist for `WizardLayout`, `WizardStepper`, and `WizardNav` covering their key states (mobile/desktop, and done/active/upcoming for the stepper)
