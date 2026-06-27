## Purpose

Define the Storybook setup for shared design-system components, including framework choice, token loading, public-theme previews, and story coverage.

## Requirements

### Requirement: Storybook for shared components

The system SHALL provide a current stable Storybook instance using the recommended `@storybook/nextjs-vite` framework, runnable via `pnpm storybook` and buildable via `pnpm build-storybook`, that renders the components under `src/components/shared/`.

#### Scenario: Storybook boots with shared stories

- **WHEN** a developer runs `pnpm storybook`
- **THEN** Storybook starts and renders the stories for `src/components/shared/` components

### Requirement: Stories load design tokens

The system SHALL import `src/styles/globals.css` in the Storybook preview so that Tailwind v4 design tokens are available to all stories.

#### Scenario: Tokens available in stories

- **WHEN** a shared component story renders
- **THEN** it resolves the same Tailwind v4 semantic utilities and tokens as the running app

### Requirement: Public-theme toolbar

The system SHALL expose a Storybook toolbar control configured through `globalTypes` and `initialGlobals` in `.storybook/preview` that previews shared components under each public theme via `data-theme`, covering all seven presets.

#### Scenario: Switching theme in the toolbar

- **WHEN** a developer selects a different theme in the Storybook toolbar
- **THEN** the previewed story re-renders under that theme's scoped variables

### Requirement: Colocated stories with variant coverage

The system SHALL colocate a `*.stories.tsx` file with each shared component and SHALL cover its key variants and states, including `GiftCard` available/partial/purchased/hidden, and SHALL enable a11y and docs addons.

#### Scenario: GiftCard story shows all states

- **WHEN** the `GiftCard` story is opened
- **THEN** it presents available, partial, purchased, and hidden variants

#### Scenario: Accessibility checks run

- **WHEN** a shared component story is viewed
- **THEN** the a11y addon reports accessibility findings for that component
