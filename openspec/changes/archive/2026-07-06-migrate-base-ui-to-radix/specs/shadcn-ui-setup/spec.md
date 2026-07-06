## ADDED Requirements

### Requirement: Radix UI is the headless primitive engine
The system SHALL use Radix UI (`@radix-ui/react-*` packages, plus `vaul` for the drawer) as the headless primitive engine behind all shadcn components in `src/components/ui/`. The `@base-ui/react` dependency SHALL NOT be present.

#### Scenario: No Base UI imports remain
- **WHEN** `src/components/ui/` is searched for `@base-ui/react` imports
- **THEN** zero matches are found

#### Scenario: Base UI dependency is removed
- **WHEN** `package.json` dependencies are inspected
- **THEN** `@base-ui/react` is absent and the required `@radix-ui/react-*` packages (and `vaul`) are present

#### Scenario: Project type-checks after migration
- **WHEN** `pnpm typecheck` is run after the migration
- **THEN** it completes with no errors

### Requirement: Polymorphic composition uses the asChild contract
Components that previously accepted Base UI's `render` prop SHALL expose Radix's `asChild` boolean prop backed by `@radix-ui/react-slot`, so a single child element receives the component's props and behavior.

#### Scenario: Button renders as a Link via asChild
- **WHEN** `<Button asChild><Link href="/create">New</Link></Button>` is rendered
- **THEN** the output is a single anchor element carrying the button's classes and `data-slot="button"`

#### Scenario: No render-prop usage remains
- **WHEN** `src/` is searched for `render={` passed to `ui/` components
- **THEN** zero matches are found and the equivalent `asChild` usage is present instead

### Requirement: components.json targets a Radix-compatible style
The `components.json` `style` field SHALL be set to a Radix-compatible registry style so that `pnpm dlx shadcn@latest add <component>` produces drop-in components.

#### Scenario: Style is Radix-compatible
- **WHEN** `components.json` is inspected
- **THEN** `style` is a Radix-compatible value (e.g., `new-york`) and not `base-nova`
