## ADDED Requirements

### Requirement: Canvas-required ShadCN primitives are available

The system SHALL provide the additional ShadCN/Base UI primitives the Claude Design canvas relies on, generated into `src/components/ui/` via the shadcn CLI on the configured Base UI registry: `Select`, `Tabs`, `Progress`, a Sonner `Toaster`, `Popover`, `Calendar`, `ToggleGroup`, `Drawer`, `Checkbox`, `Switch`, and `Textarea`. Where the registry lacks a direct primitive, the system SHALL provide the closest primitive or a thin documented Tailwind wrapper.

#### Scenario: Primitive imports resolve

- **WHEN** a component imports any of the canvas-required primitives from `@/components/ui/*`
- **THEN** the primitive exists, typechecks, and inherits the existing token mapping and `cn()`/`cva` conventions

#### Scenario: Missing-registry fallback is documented

- **WHEN** the Base UI registry has no direct equivalent for a required primitive (e.g. drawer/calendar)
- **THEN** the closest primitive or a thin Tailwind wrapper is provided and noted as the documented substitute
