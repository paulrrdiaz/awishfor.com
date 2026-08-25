## Context

See `proposal.md` for motivation and the delta specs for behavioral requirements. The personalized public route already passes event date, start/end times, location, title, guest RSVP state, and the personalized URL context to `RsvpSection`. Event dates are stored as calendar days, while times are stored as `HH:mm`; the data model has no event-timezone field. Public pages intentionally use a narrowed provider stack, and shared public components must inherit tokens from the `.public-theme` wrapper.

## Goals / Non-Goals

**Goals:**

- Provide an immediately usable calendar action after confirmation without storing guest calendar data or requiring a calendar account connection.
- Support the practical mobile split: a first-party Google Calendar URL and portable iCalendar download.
- Keep calendar formatting deterministic with `America/Lima` for timed events and preserve date-only events as all-day.
- Make the fixed control reusable across public layouts and theme-token-only.

**Non-Goals:**

- Owner-selectable timezones, calendar synchronization, calendar-event updates after download, reminders, recurrence, attendees, or external API credentials.
- Rendering the control on the plain public wishlist route or for a non-confirmed RSVP.
- Changing stored wishlist fields, tRPC procedures, database schema, or environment configuration.

## Decisions

### Shared client control plus pure calendar-event utility

Create a reusable shared client component, `CalendarSaveControl`, in the public shared component layer. It accepts a normalized event payload (title plus host, date, optional start/end time, location, welcome message, personalized URL) and provides a compact fixed bottom-right trigger labelled `Guardar en mi calendario` that exposes Google Calendar and a compatibility-labelled `.ics` download for Apple Calendar, Outlook, and other calendar apps.

Keep calendar data construction in a pure utility under `src/lib/calendar/` rather than placing serialization in the component. The utility produces the Google Calendar URL and iCalendar text from one normalized event model, including RFC-safe text escaping, CRLF line endings, an exclusive end date for all-day events, and a stable `.ics` filename. The client component creates the download from an in-memory Blob; no new route handler is needed because event details are already public on the personalized page.

Use the existing `RsvpSection` as the integration point. It renders the shared control only from the server-refreshed, confirmed guest state and only when an event date exists. The control is independent of the layout tree, so every layout gets the same behavior without modifying individual layout components.

Alternatives considered:

- A per-layout implementation: rejected because it duplicates behavior and makes theme parity fragile.
- `.ics` only: rejected because Google Calendar imports on Android are inconsistent and often require more steps.
- Google Calendar only: rejected because it excludes Apple Calendar, Outlook, and other iCalendar clients.
- A server-generated download endpoint: rejected because no sensitive or server-only data is required; a pure client download avoids caching and routing complexity.

### Time interpretation and incomplete times

For a date with a start time, calendar values use `America/Lima` and retain the supplied end time when present. When no end time is supplied, the calendar utility SHALL create a one-hour end time so that the Google Calendar template has a complete, editable event duration. When no start time is supplied, it creates an all-day event on the selected calendar date. The one-hour fallback is a compatibility default, not a new stored event fact.

The iCalendar payload uses timezone-aware values for timed events and `VALUE=DATE` values for all-day events. It adds `DISPLAY` `VALARM` entries one week, one day, and three hours before start. Google Calendar URLs use encoded title, location, welcome message plus personalized URL as event details, event dates, and `ctz=America/Lima` for timed events. Google Calendar template links do not provide a supported reminder override; configuring email reminders would require an authenticated Calendar API integration and is deliberately excluded.

Alternatives considered:

- Treat input time as the viewer's local timezone: rejected because the guest could save a different hour outside Peru.
- Add a timezone field now: deferred; it changes the event settings product model and requires an owner choice that is outside this focused change.
- Omit the end time entirely: rejected because the Google Calendar template requires a bounded range for predictable results.

### Theme-safe fixed interaction

The component uses public semantic theme tokens (for surface, foreground, border, accent, muted states, and focus ring) through existing Tailwind semantic utilities. It does not contain literal palette values. The fixed trigger is bottom-right, placed above `env(safe-area-inset-bottom)` and inset from `env(safe-area-inset-right)`, and opens a small, accessible choice surface leftward into the viewport. It must not cover critical page controls; on small viewports it uses safe-area-aware spacing and an unobtrusive height.

The trigger and choices have accessible names, keyboard operation, visible token-derived focus state, and a dismissible/collapsible action surface. Activating Google Calendar navigates to the generated URL; activating the iCalendar option downloads the generated file.

## Risks / Trade-offs

- [Android calendar clients differ in `.ics` handoff behavior] → Provide the Google Calendar URL as the primary Android-friendly choice while retaining `.ics` portability.
- [An unspecified event end time is represented as one hour] → Preserve a supplied end time; make the resulting calendar event editable and document this fallback in tests.
- [Static `America/Lima` can be wrong for an event held elsewhere] → Scope it explicitly to this release and isolate timezone selection in the calendar utility for a future configurable field.
- [Fixed UI can overlap browser/device controls] → Use safe-area spacing, viewport-constrained sizing, and mobile visual verification.
- [Calendar text may include commas, semicolons, line breaks, or non-ASCII characters] → Centralize standards-compliant escaping and serialization with focused tests.

## Migration Plan

1. Deploy the shared component and client-side utility with no migration or backfill.
2. Confirm personalized pages with complete, partial, and date-only event metadata across desktop and mobile browsers.
3. If a regression is found, remove the conditional component integration; no persisted data, API, or migration rollback is required.

## Validation

- Unit-test Google URLs and `.ics` content for timed, timed-with-end, date-only, location-free, and escaped-text events.
- Unit-test one-hour fallback, exclusive all-day end date, and `America/Lima` timezone output.
- Component-test eligibility, both user actions, accessible labels, and token-only class usage.
- Test RSVP refresh/state changes so confirmation adds the control and a later decline removes it.
- Run Biome, Vitest, and TypeScript checks; visually inspect at least two public themes and a mobile safe-area viewport.
