## ADDED Requirements

### Requirement: Calendar component is a real Radix-backed primitive

The `Calendar` component at `src/components/ui/calendar.tsx` SHALL be implemented with `react-day-picker` (v9) and `date-fns`, styled with the `new-york` shadcn style already configured in `components.json`, and SHALL NOT be a native `input[type=date]` wrapper.

#### Scenario: Calendar renders a month grid

- **WHEN** `Calendar` is rendered
- **THEN** it displays a navigable month grid of selectable days built by `react-day-picker`, not a native date input

#### Scenario: Project type-checks with the new Calendar

- **WHEN** `pnpm typecheck` is run after `react-day-picker` and `date-fns` are added
- **THEN** it completes with no errors
