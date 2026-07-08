## Context

Both the creation wizard (`details-step.tsx`) and dashboard settings form (`wishlist-settings-form.tsx`) currently render OS-native `<input type="date">` / `<input type="time">` fields for the wishlist's `eventDate` and `eventTime`. These render the browser's own popup calendar (see screenshot), inconsistent with the rest of the app's shadcn/Radix-driven UI.

`src/components/ui/calendar.tsx` already exists but is a documented stub:

```tsx
// Base UI does not currently ship a first-class calendar primitive in this project,
// so this thin wrapper is the documented Tailwind fallback for date selection.
function Calendar(props: CalendarProps) {
	return <Input data-slot="calendar" type="date" {...props} />;
}
```

That comment predates the project's Base UI → Radix UI migration (`shadcn-ui-setup` spec: "Radix UI is the headless primitive engine... The `@base-ui/react` dependency SHALL NOT be present"). The migration never came back to replace this fallback. `Popover` (`@radix-ui/react-popover`) is already installed and used elsewhere (`Select`, dropdowns), so the missing piece is only `react-day-picker` + `date-fns`, which shadcn's Radix `Calendar` recipe requires (https://ui.shadcn.com/docs/components/radix/date-picker).

Both `draft.eventDate`/`draft.eventTime` (wizard store) and the settings form's local `eventDate`/`eventTime` state stay as two separate values end-to-end (draft store shape, `wishlist.updateSettings` input, Prisma columns) — this change only touches presentation.

## Goals / Non-Goals

**Goals:**
- Replace the native date/time inputs in both forms with one shadcn/Radix-based `DateTimePicker` control per the user's chosen direction (single combined field, not two separate pickers).
- Implement the real shadcn `Calendar` (react-day-picker-backed), replacing the native-input stub.
- Preserve all existing data contracts: `eventDate` (date-only) and `eventTime` (`HH:mm` string) remain distinct fields in the draft store, the tRPC `updateSettings` input, and Prisma schema — no migration needed.
- Preserve the exact past-date warning copy/behavior in the wizard.
- Keep both fields optional, matching current behavior (user can leave date/time empty).

**Non-Goals:**
- No change to `Wishlist.eventDate` / `Wishlist.eventTime` Prisma columns or the `wishlist.updateSettings` tRPC contract.
- No timezone handling changes — time continues to be stored/displayed as an unzoned `HH:mm` string, date as a calendar date.
- No date *range* picker — this is single-date selection only.
- No redesign of the wizard's other fields (title, slug, location, dress code) beyond the date/time field.

## Decisions

**1. One shared `DateTimePicker`, not two separate components.**
Per the user's explicit choice, date and time collapse into a single field ("Fecha y hora del evento") with one trigger button. Internally the component still manages two values (`date: Date | null`, `time: string | null`) and calls back separately so the parent forms don't need to change their `eventDate`/`eventTime` state shape — only how they render the field.
- Alternative considered: two separate pickers (Calendar+Popover for date, a small time-only popover for time) — rejected per user direction, and it doesn't reduce visual inconsistency as much since two controls remain.

**2. `Calendar` is the real shadcn Radix recipe (react-day-picker + date-fns), placed at `src/components/ui/calendar.tsx` (same path, replacing the stub).**
This matches `components.json`'s `new-york` style and keeps the import path (`@/components/ui/calendar`) stable for anything already referencing it (currently nothing outside the stub itself, per repo search).
- Alternative considered: keep the stub and only build the popover/time UI around the native `input[type=date]` — rejected, defeats the purpose (still shows the OS picker inside the popover).

**3. `DateTimePicker` lives at `src/components/ui/date-time-picker.tsx`.**
It's a generic, reusable, presentational primitive (Popover + Calendar + time `Input`, no domain logic, no data fetching) — fits the `ui/` layer, not `shared/` (which is for public/marketing-facing presentational pieces) or `features/` (domain/stateful). It takes `date: Date | null`, `time: string | null`, `onDateChange`, `onTimeChange` (or a single combined `onChange`), and `placeholder` props; the two call sites keep owning state and pass it in, same pattern as today's controlled `Input` usage.

**4. Time input inside the popover stays a plain `<input type="time">` (via the existing `Input` component), not a custom time-scroller.**
shadcn's Radix date-picker docs pair `Calendar` with a plain time `Input` in the popover footer for the "with time" variant — no separate Radix time primitive exists. Reusing `Input type="time"` keeps behavior/accessibility (native time picker, keyboard entry) while the outer trigger button is what actually gets restyled away from the native chrome.

**5. Trigger button formats the label with `date-fns` (`format(date, "d 'de' MMMM 'de' yyyy, HH:mm", { locale: es })`).**
Consistent with the rest of the app's Spanish UI copy. `date-fns/locale/es` is bundled with `date-fns`, no extra dependency.

**6. `eventDate`/`eventTime` remain separate props/state; the picker is purely a UI composition layer.**
Both call sites already store date and time as independent strings (`draft.eventDate: string | null`, `draft.eventTime: string | null` in the wizard; equivalent local state in settings). Keeping that contract avoids touching `wizard-provider.ts`, the Zod schemas in `wishlist.ts`, or the Prisma schema — this is scoped as a pure UI/component swap.

## Risks / Trade-offs

- **[Risk]** `react-day-picker` v9's API differs from v8 (function-based modifiers, `mode` typing) — copying shadcn's docs snippet verbatim without checking the installed version could produce type errors. → **Mitigation**: pin/install via `pnpm add react-day-picker date-fns` at latest, and follow the v9-specific shadcn Radix recipe (the URL given targets the current `react-day-picker` v9 docs).
- **[Risk]** Combining date+time into one trigger button changes the tab order / number of focusable controls (was 2 inputs, becomes 1 button + inputs inside a popover) — could affect any existing keyboard-navigation assumptions or tests. → **Mitigation**: manually verify keyboard flow (open popover with Enter/Space, tab into Calendar and time input, Esc closes) before closing out; check for existing Vitest coverage of these two forms.
- **[Risk]** `isPastDate` check in `details-step.tsx` currently derives from `draft.eventDate` string directly — unaffected by the swap since the picker still writes the same string shape, but must be re-verified since the picker internally works with `Date` objects and needs to serialize back to the `YYYY-MM-DD` string the draft store expects.
- **[Trade-off]** A single combined field is a bigger visual/copy change ("Fecha y hora del evento" replacing two labeled fields) — slightly larger diff and Spanish copy update in two places, accepted per explicit user direction over the lower-risk two-picker alternative.

## Migration Plan

1. `pnpm add react-day-picker date-fns`.
2. Rewrite `src/components/ui/calendar.tsx` with the shadcn Radix `Calendar` recipe.
3. Add `src/components/ui/date-time-picker.tsx` (`DateTimePicker`) composing `Popover` + `Calendar` + `Input type="time"`.
4. Swap `details-step.tsx`'s two `Field`s (date, time) for one `Field` using `DateTimePicker`, updating the label to "Fecha y hora del evento" and wiring `draft.eventDate`/`draft.eventTime` in/out.
5. Swap `wishlist-settings-form.tsx`'s two date/time `Field`s the same way.
6. Run `pnpm typecheck`, `pnpm test`, `pnpm check`.
7. Manually verify both forms in the browser: pick date/time, clear, past-date warning still fires in the wizard, settings form still saves via `wishlist.updateSettings`.

No data migration, no rollback complexity beyond reverting the component/form diffs — no schema or API changes are involved.

## Open Questions

- None blocking; exact Spanish label wording ("Fecha y hora del evento" vs. keeping two labels stacked in one `Field`) can be finalized during implementation.
