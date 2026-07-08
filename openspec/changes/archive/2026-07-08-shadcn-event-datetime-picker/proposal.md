## Why

Event date and time are currently entered with two native `<input type="date">` / `<input type="time">` fields (creation wizard `details-step.tsx` and dashboard `wishlist-settings-form.tsx`). These render the browser's own OS-styled picker (see attached screenshot), which breaks visual consistency with the rest of the app's shadcn/Radix component system and can't be restyled. `src/components/ui/calendar.tsx` is already a documented placeholder ("Base UI does not currently ship a first-class calendar primitive... thin wrapper is the documented Tailwind fallback") left over from before the project's Base UI → Radix UI migration (`shadcn-ui-setup` spec). The creation-wizard spec already asserts "the event date SHALL be chosen with a calendar in a popover," which the current native-input implementation does not satisfy. This change closes that gap using shadcn's Radix date-picker pattern (https://ui.shadcn.com/docs/components/radix/date-picker), combining date and time into a single popover field per user direction.

## What Changes

- Replace the `Calendar` placeholder in `src/components/ui/calendar.tsx` with the real shadcn Radix `Calendar` (react-day-picker v9 + date-fns), matching the `new-york` style already configured in `components.json`.
- Add a reusable `DateTimePicker` component (Popover trigger button showing formatted date + time, `Calendar` for date selection, a time input in the popover footer) following shadcn's "Date Picker with Time" pattern.
- Replace the separate "Fecha del evento" + "Hora del evento" native inputs in the creation wizard's Event Details step (`src/components/features/wizard/details-step.tsx`) with a single "Fecha y hora del evento" field using `DateTimePicker`.
- Replace the equivalent separate date/time inputs in the dashboard settings form (`src/components/features/dashboard/settings/wishlist-settings-form.tsx`) with the same `DateTimePicker`.
- Underlying data model is unchanged: the draft store and `wishlist.updateSettings` mutation still store `eventDate` (date) and `eventTime` (`HH:mm` string) separately; only the presentation merges them into one control.
- Add `react-day-picker` and `date-fns` as dependencies (required by shadcn's Calendar primitive; not currently in `package.json`).
- Preserve the existing past-date warning copy and behavior ("Esta fecha ya pasó...") in the wizard step.
- **BREAKING**: none (internal UI-only change, no public API or schema changes).

## Capabilities

### New Capabilities
- `event-datetime-picker`: shared `DateTimePicker` UI component — combined date+time selection via a Radix Popover + shadcn Calendar + time input, formatted trigger label, clear affordance, and optional/required handling.

### Modified Capabilities
- `creation-wizard`: Event Details step requirement changes from separate date/time inputs to a single combined `DateTimePicker` field; past-date warning behavior must still hold.
- `wishlist-settings`: settings form's event date/time editing requirement changes to use the same combined `DateTimePicker` field.
- `shadcn-ui-setup`: the `Calendar` component requirement changes from "documented Tailwind fallback" (native `input[type=date]` wrapper) to the real Radix-based shadcn `Calendar` (react-day-picker).

## Impact

- Code: `src/components/ui/calendar.tsx` (rewritten), new `src/components/ui/date-time-picker.tsx` (or under `src/components/shared/`), `src/components/features/wizard/details-step.tsx`, `src/components/features/dashboard/settings/wishlist-settings-form.tsx`.
- Dependencies: adds `react-day-picker`, `date-fns` to `package.json`.
- No API, database, or env var changes — `eventDate`/`eventTime` fields and the `wishlist.updateSettings` tRPC procedure are unaffected.
- Visual: both forms gain a restyled date/time control matching the Claude Design system instead of the OS-native picker.
