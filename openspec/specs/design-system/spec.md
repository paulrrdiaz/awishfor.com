## Purpose

Define the app/public design-system foundation: app tokens, public font pairings, shared presentational components, and variant composition conventions.
## Requirements
### Requirement: App theme tokens align to the brief

The system SHALL define app-theme design tokens in `src/styles/globals.css` that match the Claude Design brief's app palette — warm near-white surface, deep-navy ink, and a lime-chartreuse primary reserved for the single most important action per view — using the existing Tailwind v4 `@theme inline` token mapping.

#### Scenario: App chrome uses the brief app palette

- **WHEN** a dashboard or wizard surface renders
- **THEN** its background, foreground, and primary resolve to the brief's app-theme token values

#### Scenario: Token alignment preserves structure

- **WHEN** app tokens are aligned
- **THEN** existing components render with the same structure and only updated colors/shape, with dark-mode variants remaining coherent

### Requirement: Serif-soft font system

The system SHALL provide a `serif-soft` type system loaded via `next/font` exposing **Lora** as `--font-serif` and **Inter** as `--font-sans`, and SHALL replace the prior `--font-serif: Georgia, serif` token.

#### Scenario: Serif moments render in Lora

- **WHEN** an emotional heading (event name, section title, gift name) renders on a public surface
- **THEN** it uses the Lora-backed `--font-serif`

#### Scenario: Body renders in Inter

- **WHEN** body or UI text renders
- **THEN** it uses the Inter-backed `--font-sans`

### Requirement: Selectable font pairings

The system SHALL provide three font pairings in `src/config/public-fonts.ts` — `serif-soft` (default), `sans-modern`, and `rounded-friendly` — exposed via a wrapper data-attribute so switching the pairing requires no per-element class changes.

#### Scenario: Font pairing switches via wrapper attribute

- **WHEN** a wishlist's `fontPairing` changes
- **THEN** the active font pair changes through the wrapper data-attribute with zero per-element edits

#### Scenario: Unknown pairing falls back to default

- **WHEN** `fontPairing` is null or unknown
- **THEN** the system applies the `serif-soft` default pairing

### Requirement: Shared design-system component layer

The system SHALL host reusable, presentational, theme-driven components under `src/components/shared/` reachable via the `@/components/shared/*` alias, and these components SHALL consume typed/view-model props only with no data-fetching or domain logic.

#### Scenario: Reusable components live in shared

- **WHEN** a presentational component is reused across public layouts and the marketing demo
- **THEN** it resides in `src/components/shared/` and imports cleanly via `@/components/shared/*`

#### Scenario: Stateful components stay in features

- **WHEN** a component owns stateful or domain behavior (modals, forms, dashboard tables, wizard steps)
- **THEN** it remains under `src/components/features/` and is not moved into `shared/`

### Requirement: Variant components use cn and cva

The system SHALL compose class names with `cn()` (clsx + tailwind-merge) and express component variants with `cva`, including `GiftCard` status variants `available | partial | purchased | hidden`.

#### Scenario: GiftCard renders status variants

- **WHEN** a `GiftCard` is given a status of `available`, `partial`, `purchased`, or `hidden`
- **THEN** it renders the corresponding `cva` variant (purchased uses reduced opacity and line-through name)

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

