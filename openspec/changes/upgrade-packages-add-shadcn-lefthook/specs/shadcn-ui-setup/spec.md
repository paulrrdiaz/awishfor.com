## ADDED Requirements

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
