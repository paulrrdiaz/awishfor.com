## 1. Calendar event formatting

- [x] 1.1 Create a pure calendar-event utility that normalizes wishlist event details into Google Calendar URLs and iCalendar content using `America/Lima` for timed events.
- [x] 1.2 Implement correct date-only, supplied end-time, one-hour fallback, URL encoding, iCalendar escaping, exclusive all-day end-date, and downloadable filename behavior.
- [x] 1.3 Add focused unit tests for timed, date-only, missing-location, special-character, and missing-end-time calendar events.

## 2. Shared themed calendar control

- [x] 2.1 Build the reusable shared client calendar-save component with a compact fixed trigger and accessible Google Calendar and `.ics` actions.
- [x] 2.2 Ensure the component derives all visual, focus, and state styling from public semantic theme tokens and respects mobile safe-area spacing.
- [x] 2.3 Add component tests for accessible controls, Google navigation, iCalendar download, token-based styling, and mobile-safe eligibility behavior.

## 3. Personalized RSVP integration

- [x] 3.1 Integrate the shared control into the confirmed personalized RSVP experience, supplying title, event metadata, and the personalized invite URL.
- [x] 3.2 Gate the control to confirmed primary guests with an event date and verify it disappears after a changed RSVP becomes declined.
- [x] 3.3 Extend RSVP/personalized route tests for the calendar-save visibility states and payload integration.

## 4. Verification

- [x] 4.1 Run `pnpm check` and address calendar-save-related findings.
- [x] 4.2 Run focused and full `pnpm test` suites and address calendar-save-related failures.
- [x] 4.3 Run `pnpm typecheck` and address calendar-save-related errors.

## 5. Calendar-save refinements

- [x] 5.1 Center the action menu and update its Spanish labels for personal calendar and iPhone export.
- [x] 5.2 Compose the event title as `{title} - {host}` when a host name is available, and prepend the welcome message to the invitation URL in event details.
- [x] 5.3 Add portable iCalendar display reminders one week, one day, and three hours before the event; document Google Calendar template reminder limits.
- [x] 5.4 Extend focused tests and rerun quality checks.

## 6. Calendar-save placement and compatibility copy

- [x] 6.1 Position the fixed calendar trigger in the bottom-right safe area and align its action menu into the viewport.
- [x] 6.2 Replace iPhone-specific copy with a helpful, multi-calendar `.ics` compatibility label and update focused tests.
- [x] 6.3 Dismiss the calendar action menu when the guest interacts outside the control and add a focused test.
