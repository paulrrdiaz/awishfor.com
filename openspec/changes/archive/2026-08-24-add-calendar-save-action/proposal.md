## Why

Guests who confirm attendance currently see the event details but must manually recreate the event in their calendar. Providing an immediate, device-appropriate save action reduces that friction and makes a confirmed invitation more useful after the RSVP moment.

## What Changes

- Show a compact fixed calendar-save affordance only to confirmed guests on personalized invite pages when the wishlist has an event date.
- Offer a Google Calendar action and a standards-based `.ics` download for Apple Calendar, Outlook, and other compatible calendar clients.
- Build calendar event details from the wishlist title and host name, event date, optional start/end times, optional location, welcome message, and the personalized invite URL.
- Interpret timed events in the fixed `America/Lima` timezone for this initial release; date-only events remain all-day events.
- Keep the affordance available when a confirmed guest revisits their personalized link, and remove it if their RSVP changes to declined.
- Deliver the control as a shared public component that inherits each layout's active theme tokens rather than defining a separate palette.

## Capabilities

### New Capabilities

- `calendar-save-action`: Generates and exposes platform-appropriate calendar-save actions from a confirmed personalized invitation.

### Modified Capabilities

- `personalized-invite-page`: Extends the confirmed RSVP summary state with calendar-save access under defined event-data and RSVP-status conditions.

## Impact

- Affects the public personalized invite route, its client-side RSVP section, and the shared public component layer.
- Adds a calendar event serialization/link-building utility and focused unit/component tests; no database schema, tRPC API, environment variable, or external calendar API integration is required.
- Public UI must remain theme-aware, mobile-safe (including safe-area spacing), accessible, and aligned with the Claude Design source of truth.
- This release deliberately does not add an owner-configurable timezone, calendar account connection, recurring events, invitations, or RSVP synchronization with external calendars. The portable `.ics` export includes display reminders; per-account Google and email reminders remain outside a no-auth calendar URL.
