## Why

Wishlist hosts can see whether a personalized invitation was viewed, but the guest list does not turn that signal into a useful follow-up. Hosts need a friendly, low-friction way to copy the right WhatsApp-ready message for guests who still owe an RSVP and for confirmed guests who may forget an approaching event.

## What Changes

- Add one contextual follow-up action to each eligible invitation, derived from RSVP status, personalized-link view recency, the RSVP deadline when relevant, and time remaining until the event.
- Give pending guests either a first-touch invitation message or an RSVP reminder, depending on whether their personalized link has ever been viewed.
- Give confirmed guests staged event reminders at 14, 7, and 1 day before the event, with copy that includes the available date, time, location, and personalized link.
- Show an event-level proximity indicator and a per-invite, human-readable last-view/recommendation indicator; a recent view de-emphasizes but never removes the copy action.
- Copy the generated message directly to the clipboard for manual pasting into WhatsApp, with clear success and failure feedback.
- Record successful clipboard copies as follow-up metadata on the invite, including the time and follow-up kind, while accurately describing them as copied rather than sent.
- Keep declined invitations free of reminder actions and stop event reminders after the event has passed.
- Preserve privacy-friendly copy: the generated message never tells the guest that their link views are tracked.
- Non-goals: sending WhatsApp messages, proving delivery, maintaining message history, bulk reminders, scheduling notifications, or adding a custom message editor.

## Capabilities

### New Capabilities

- `contextual-invite-reminders`: Determines the recommended invitation, RSVP, or staged event follow-up; generates friendly clipboard copy; and records successful copy metadata.

### Modified Capabilities

- `guest-invite-management`: Extends each eligible invite row/card with contextual follow-up indicators and a direct message-copy action across desktop and mobile.
- `wishlist-view-models`: Adds owner-only invite follow-up metadata and exposes the event details needed to derive and render contextual reminders without leaking them to collaborators or public consumers.

## Impact

- **Database:** `Invite` gains last-follow-up copy metadata and a constrained follow-up-kind value; a Prisma migration and regenerated client are required.
- **Server/API:** invite read mapping gains owner-only follow-up fields, and an owner-scoped mutation records a successful copy. Reminder-state and message generation remain deterministic domain helpers.
- **Dashboard UI:** the Invitados page, guest cards, and current mobile share/reminder flow are unified around the same state and copy behavior; the page also receives event date/time/location and RSVP deadline context.
- **Tests/specs:** add focused state-matrix, message, mapper, authorization, clipboard, responsive UI, and date-boundary coverage.
- **Environment/config/dependencies:** no new environment variables, external services, or runtime dependencies.
