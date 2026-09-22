## Context

The invitation domain already stores RSVP state plus `openedAt`, `viewCount`, and `lastViewedAt`. The owner-facing invite mapper conditionally exposes view analytics, the Invitados page already receives a wishlist overview alongside invite rows, and `src/lib/wishlist/share.ts` already generates invitation/reminder/thanks WhatsApp copy. Mobile pending cards currently navigate to a guest-specific share view, while desktop cards only copy the personalized URL.

Event date, time, location, and RSVP deadline are optional wishlist fields. Event dates and RSVP deadlines represent calendar days stored at UTC midnight; existing date and RSVP utilities deliberately preserve that stored calendar day. The app's timed-event convention is `America/Lima`.

See `proposal.md` for motivation and the three capability deltas for required behavior.

## Goals / Non-Goals

**Goals:**

- Produce one deterministic follow-up recommendation and friendly message for the same invite/event state on desktop and mobile.
- Keep the state engine and copy generation pure and exhaustively testable at date/view boundaries.
- Persist only enough owner-only metadata to distinguish a newly eligible stage from one already copied.
- Preserve current personalized-link analytics and existing standalone sharing behavior.

**Non-Goals:**

- WhatsApp API integration, delivery/read receipts, scheduled or bulk messaging, background jobs, push/email notifications, or message history.
- Treating a clipboard copy as proof that a message was sent.
- Editing templates in the dashboard or adding per-invite custom copy.
- Reworking RSVP rules, event/calendar storage, or view attribution.

## Decisions

### 1. Model follow-up as a pure projection

Add a domain module such as `src/lib/dashboard/invite-follow-up.ts` with pure functions that accept a serializable input and an explicit `now`:

```ts
type InviteFollowUpKind =
	| "invitation"
	| "rsvp_reminder"
	| "event_14_day"
	| "event_7_day"
	| "event_1_day";

type InviteFollowUp = {
	kind: InviteFollowUpKind;
	label: string;
	message: string;
	viewRecency: "never" | "recent" | "intermediate" | "stale";
	emphasis: "recommended" | "normal" | "deemphasized";
};
```

The module will expose separate derivation and formatting functions so state-matrix tests do not depend on prose. `now` is injected rather than read inside helpers, allowing exact boundary tests and one consistent render per request.

State precedence is:

```text
past or same-day event ───────────────────────────────▶ none
declined ─────────────────────────────────────────────▶ none
pending + never viewed ───────────────────────────────▶ invitation
pending + viewed ─────────────────────────────────────▶ RSVP reminder
confirmed + event in 8..14 calendar days ─────────────▶ 14-day heads-up
confirmed + event in 2..7 calendar days ──────────────▶ 7-day reminder
confirmed + event in 1 calendar day ──────────────────▶ tomorrow reminder
confirmed + no/remote event date ─────────────────────▶ none
```

View recency and prior copy metadata affect emphasis, not eligibility. `lastViewedAt` within 48 hours is recent; more than 14 days is stale. If the stored last follow-up kind equals the currently derived kind, that stage is marked copied and de-emphasized. A later stage has a different kind and becomes recommended again.

Event-day comparison will use the stored ISO date portion and the current calendar date in `America/Lima`, not millisecond differences from UTC midnight. RSVP-deadline openness will reuse the existing RSVP-window rules. Once the deadline is closed, pending copy asks for a direct reply because the personalized RSVP form may no longer accept a submission.

**Alternatives considered:**

- Derive state separately in each component: rejected because desktop/mobile labels and boundary behavior would drift.
- Base reminders only on `lastViewedAt`: rejected because RSVP status and event proximity determine the user's actual goal.
- Hide/disable an action after a recent view: rejected because a view is advisory and may not represent the intended guest.

### 2. Store only the latest successful copy and its semantic stage

Add this enum and fields to `Invite`:

```prisma
enum InviteFollowUpKind {
  invitation
  rsvp_reminder
  event_14_day
  event_7_day
  event_1_day
}

model Invite {
  // existing fields
  lastFollowUpKind     InviteFollowUpKind?
  lastFollowUpCopiedAt DateTime?
}
```

The migration will add a database check constraint requiring both values to be null or both non-null. Existing invites backfill naturally as `(null, null)`. No copy count or history table is needed because the product only needs to know whether the current semantic stage was already copied.

**Alternatives considered:**

- A `FollowUpCopy` history table: rejected because audit history, analytics, and delivery reporting are out of scope.
- One timestamp without a kind: rejected because a 14-day copy must not suppress a newly eligible 7-day reminder.
- Browser-local storage: rejected because state must follow the owner across devices and browsers.

### 3. Clipboard first, owner mutation second

The client action will:

1. Call `navigator.clipboard.writeText(message)`.
2. On success, immediately show the copied state and invoke an owner-scoped `invite.recordFollowUpCopy` mutation with wishlist id, invite id, and the derived kind.
3. On clipboard failure, show retryable copy feedback and do not call the mutation.
4. On persistence failure after a successful clipboard write, keep the truthful `Mensaje copiado` result but warn that the dashboard could not save the reminder state; the next page load may recommend it again.

The mutation validates the enum, resolves the invite through the existing owner-scoped access path, and updates only the two follow-up fields. It does not accept or store the generated message. Client state updates the card immediately; successful mutation invalidates the invite list for durable reconciliation.

The API cannot make a browser clipboard write and a database update atomic. Clipboard-first ordering is chosen because recording an unsatisfied copy would be more misleading than occasionally failing to persist a copy that did occur.

**Alternatives considered:**

- Persist before copying: rejected because a denied clipboard permission would be recorded as a copy.
- Infer copies from WhatsApp link clicks: rejected because the requested flow is manual paste and a click still would not prove send/delivery.

### 4. Extend the owner invite projection, not public guest data

`DashboardInviteViewModel` gains optional owner fields `lastFollowUpKind` and `lastFollowUpCopiedAt`. The mapper emits them only through its owner-data branch, alongside `viewCount` and `lastViewedAt`; collaborator payloads omit the properties. Public invitation view models remain unchanged.

The server-rendered Invitados page already loads wishlist overview and invites together. It will pass the overview's existing event date/time/location/deadline data into one page-level follow-up context and derive per-invite projections before rendering, avoiding an extra query or endpoint. The event-proximity indicator is calculated once from the same context.

**Alternatives considered:**

- Return fully rendered messages from a new endpoint: rejected because all inputs are already present and deterministic local derivation is simpler.
- Add follow-up metadata to public invite resolution: rejected as an unnecessary privacy leak.

### 5. Use one responsive card action and retain existing share routes

Create a reusable client control under `src/components/features/dashboard/guests/` that owns clipboard feedback and the record-copy mutation. `GuestRow` renders the same derived control for desktop and mobile. The current mobile `Recordar` navigation is replaced by direct copy so the host does not leave the guest list. Existing general sharing and guest-query share URLs remain valid for backwards compatibility, but are no longer the primary row action.

At page level, an event-proximity banner shows the future countdown inside 14 days, `mañana`, `hoy`, or that the event has passed. At card level, the existing view line becomes a human-readable view/recommendation line; the full countdown is not duplicated on every card. The personalized-URL copy remains a separate secondary action.

Visual implementation must reuse existing button, badge, card, and toast patterns and be checked against the repository's Claude Design source when apply work begins.

### 6. Keep templates structured and privacy-safe

Message builders will compose structured fragments from guest name, follow-up stage, event type, event date, optional time/location, and personalized URL. Optional fragments are joined only when present; templates will not interpolate empty placeholders. Date/time formatting reuses established wishlist formatting utilities.

No template may mention `opened`, `viewed`, a view count, a last-view time, tracking, or the stored copy state. Those signals only choose UI emphasis and message purpose.

## Risks / Trade-offs

- **[A page view may come from someone other than the intended guest]** → Treat view state as guidance only; never disable copy and never expose tracking in guest-facing text.
- **[Copy does not prove paste or delivery]** → Label persisted state `copied`, never `sent`, and avoid delivery claims throughout UI and API names.
- **[Clipboard succeeds but metadata persistence fails]** → Preserve truthful copy success, show a secondary persistence warning, and allow a later repeat.
- **[Calendar-day boundaries shift under local timezone parsing]** → Compare preserved calendar-date parts and add tests under `America/Lima` plus a west-of-UTC environment.
- **[Repeated actions can crowd guest cards]** → Present only one contextual follow-up, retain URL copy as secondary, and de-emphasize recent/already-copied states.
- **[Optional event details create awkward prose]** → Compose message fragments and test every missing-detail combination rather than maintaining placeholder-heavy strings.

## Migration Plan

1. Add the nullable enum-backed follow-up fields and paired-null database constraint in a forward-only Prisma migration; regenerate the client.
2. Deploy mapper/API support before or with the UI. Existing rows remain valid with null metadata, and older clients ignore the new optional fields.
3. Deploy the pure state/message helpers and responsive controls, retaining the existing share route as a fallback.
4. Rollback UI/API code safely while leaving nullable columns in place. A later cleanup migration may remove them only after all deployed code no longer references them.

