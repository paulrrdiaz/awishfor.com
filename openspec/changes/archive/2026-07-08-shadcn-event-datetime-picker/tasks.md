## 1. Dependencies

- [x] 1.1 `pnpm add react-day-picker date-fns` and confirm both land in `package.json` dependencies

## 2. Calendar primitive

- [x] 2.1 Rewrite `src/components/ui/calendar.tsx` using the shadcn Radix `Calendar` recipe (react-day-picker v9), styled to match `new-york`/existing token classes (compare against `popover.tsx`/`button.tsx` conventions)
- [x] 2.2 Remove the native `input[type=date]` fallback implementation and its stale comment

## 3. DateTimePicker component

- [x] 3.1 Create `src/components/ui/date-time-picker.tsx` exporting `DateTimePicker`, composing `Popover` + `PopoverTrigger` (`Button`) + `PopoverContent` (`Calendar` + time `Input`)
- [x] 3.2 Props: `date: Date | null`, `time: string | null`, `onDateChange(date: Date | null)`, `onTimeChange(time: string | null)`, `placeholder?: string`, `disabled?: boolean`
- [x] 3.3 Format the trigger label with `date-fns` `format(...)` + `date-fns/locale/es` when a date is set; show `placeholder` otherwise
- [x] 3.4 Wire a clear action (e.g. an "x"/"Borrar" affordance) that resets both `date` and `time` to `null`
- [x] 3.5 Normalize time input to `HH:mm` before calling `onTimeChange`

## 4. Creation wizard integration

- [x] 4.1 In `src/components/features/wizard/details-step.tsx`, replace the two `Field`s for `eventDate`/`eventTime` with one `Field` using `DateTimePicker`, label "Fecha y hora del evento (opcional)"
- [x] 4.2 Convert `draft.eventDate` (string) to/from `Date` when passing into `DateTimePicker`, keeping `setField("eventDate", ...)` / `setField("eventTime", ...)` calls and the stored string shapes unchanged
- [x] 4.3 Confirm `isPastDate` logic still reads `draft.eventDate` correctly and the exact warning copy still renders unchanged

## 5. Dashboard settings integration

- [x] 5.1 In `src/components/features/dashboard/settings/wishlist-settings-form.tsx`, replace the two date/time `Field`s with one using `DateTimePicker`, same label as the wizard
- [x] 5.2 Convert local `eventDate`/`eventTime` state to/from `Date` at the `DateTimePicker` boundary, keeping the `wishlist.updateSettings` payload shape (`eventDate`, `eventTime`) unchanged

## 6. Validation

- [x] 6.1 Run `pnpm typecheck`
- [x] 6.2 Run `pnpm test`
- [x] 6.3 Run `pnpm check`
- [x] 6.4 Note as a session-end reminder: manually verify in browser — open both forms, pick a date/time, clear the field, and confirm the past-date warning still fires in the wizard (skip attempting this during apply per workflow rules)

## 7. Spec sync

- [x] 7.1 After implementation and passing validation, mark corresponding items in `docs/TASKS.md` (e.g. near the existing "Add event date picker with Shadcn Calendar + Popover" line) to reflect the real Radix-based implementation
