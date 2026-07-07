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

The design system SHALL provide reusable, presentational wizard chrome components in `src/components/shared/`: `WizardLayout` (responsive page frame — mobile full-bleed sticky bars, desktop a centered card frame per the DesignSync canvas), `WizardStepper` (responsive step indicator: a 5-segment bar on mobile, a full labeled node/connector stepper with done/active/upcoming states and click-to-jump for completed steps on desktop), and `WizardNav` (Back / Save-draft slot / Next action bar built from `Button`, rendered as a sticky bottom bar on mobile and an in-card footer on desktop). These components SHALL be stateless presentational components that receive state and handlers via props and SHALL NOT access the wizard store or routing directly.

#### Scenario: Components live in shared and are presentational

- **WHEN** `WizardLayout`, `WizardStepper`, and `WizardNav` are inspected
- **THEN** they reside under `src/components/shared/`, render from app theme tokens, and take all data/handlers as props without importing the wizard store or `next/navigation`

#### Scenario: Stepper reflects step state

- **WHEN** `WizardStepper` is given the step list, the current step, and which steps are complete
- **THEN** on mobile it renders a 5-segment bar with filled segments up to and including the current step; on desktop it renders completed steps as done (checkmark) nodes, the current step as an active node, upcoming steps as non-interactive nodes, with a lime connector following each done node; and it invokes the provided callback when a completed step is selected on either layout

#### Scenario: Desktop layout is a card frame, not a wider mobile shell

- **WHEN** `WizardLayout` renders at a desktop (`lg` and up) viewport
- **THEN** it renders a centered `max-w-[1200px]` card (`bg-card`, `border-border`, `rounded-[18px]`, `overflow-hidden`) containing its header/stepper/content/footer slots, rather than widening the mobile full-bleed sticky-bar treatment

#### Scenario: Wizard chrome components have stories

- **WHEN** Storybook is run
- **THEN** stories exist for `WizardLayout`, `WizardStepper`, and `WizardNav` covering their key states (mobile segmented bar, desktop card frame, and done/active/upcoming for the stepper)
