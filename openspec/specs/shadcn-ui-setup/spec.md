# shadcn-ui-setup Specification

## Purpose
TBD - created by archiving change upgrade-packages-add-shadcn-lefthook. Update Purpose after archive.
## Requirements
### Requirement: shadcn CLI initializes successfully
The system SHALL have shadcn/ui initialized via `pnpm dlx shadcn@latest init`, producing a `components.json` at the project root and injecting CSS variable tokens into `src/styles/globals.css`.

#### Scenario: Init produces components.json
- **WHEN** `pnpm dlx shadcn@latest init` is run in the project root
- **THEN** a `components.json` file is created at the root with `style`, `rsc`, `tsx`, `tailwind`, `aliases`, and `iconLibrary` fields set

#### Scenario: CSS variables are present in globals.css
- **WHEN** `globals.css` is inspected after init
- **THEN** it contains at least a `:root` block with shadcn color tokens (e.g., `--background`, `--foreground`, `--primary`)

### Requirement: Component import path alias is configured
The system SHALL configure the `@/components` path alias so that shadcn components can be imported as `@/components/ui/<component>` throughout the app.

#### Scenario: Alias resolves correctly
- **WHEN** `tsconfig.json` paths are inspected
- **THEN** `@/*` resolves to `./src/*`, covering `@/components/ui/`

### Requirement: shadcn component install works after setup
The system SHALL support installing individual components via `pnpm dlx shadcn@latest add <component>` without errors after initialization.

#### Scenario: Button component installs successfully
- **WHEN** `pnpm dlx shadcn@latest add button` is run after init
- **THEN** `src/components/ui/button.tsx` is created and importable with no TypeScript errors

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

### Requirement: Calendar component is a real Radix-backed primitive

The `Calendar` component at `src/components/ui/calendar.tsx` SHALL be implemented with `react-day-picker` (v9) and `date-fns`, styled with the `new-york` shadcn style already configured in `components.json`, and SHALL NOT be a native `input[type=date]` wrapper.

#### Scenario: Calendar renders a month grid

- **WHEN** `Calendar` is rendered
- **THEN** it displays a navigable month grid of selectable days built by `react-day-picker`, not a native date input

#### Scenario: Project type-checks with the new Calendar

- **WHEN** `pnpm typecheck` is run after `react-day-picker` and `date-fns` are added
- **THEN** it completes with no errors

