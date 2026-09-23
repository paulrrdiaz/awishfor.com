## Context

See `proposal.md` - Why/What Changes for motivation and scope.

Today the follow-up feature is wired owner-only end to end:
- `invite.service.ts#recordFollowUpCopy` authorizes via `getOwnerInvite` → `assertWishlistAccess({ requireOwner: true })`.
- `invite.ts` router's `list` procedure calls `mapDashboardInvite(invite, { includeAnalytics: isOwner })`; `includeAnalytics` gates `viewCount`, `lastViewedAt`, `lastFollowUpKind`, and `lastFollowUpCopiedAt` together as one bundle, present only for the owner.
- `guests/page.tsx` only calls `deriveInviteFollowUp(...)` when `wishlist.isOwner`, because it needs `invite.lastViewedAt` and `invite.lastFollowUpKind`, which are absent from the mapped invite for collaborators.
- `guest-row.tsx` only renders `ContextualFollowUpCopyControl` when `isOwner && followUp`.

`wishlist-view-models/spec.md` ("Dashboard view models include management-ready derived fields") hard-requires `viewCount` and exact `lastViewedAt` to stay absent from collaborator view models - that boundary is unchanged by this proposal. The blocker is that the same `lastViewedAt` field currently does double duty: it drives both the raw analytics display (owner-only, must stay owner-only) and the follow-up kind/indicator logic (now needs to reach collaborators too).

## Goals / Non-Goals

**Goals:**
- Let a collaborator record follow-up copy metadata (mirrors the existing collaborator-inclusive check already used by `update`/`delete`).
- Let a collaborator see and use the same follow-up recommendation and copy control the owner sees, at desktop and mobile widths.
- Do this without adding `viewCount` or exact `lastViewedAt` to the collaborator-visible view model.

**Non-Goals:**
- Changing `recordOwnerRsvp` / `reopenOwnerRsvp` or any RSVP-management UI - stays owner-only, untouched.
- Changing the owner-only raw view-count/last-viewed-timestamp display block in `guest-row.tsx` (the `Eye` icon indicator) - stays exactly as is.
- Changing `wishlist.overview`'s owner-only analytics (`viewSeries`, conversion rate, etc.) - unrelated to this change.

## Decisions

**1. Split the `lastViewedAt`-derived signal from the raw field.**
Add a coarse `viewRecency` (`"never" | "recent" | "intermediate" | "stale"`, from the already-exported `classifyViewRecency`) computed server-side in `mapDashboardInvite`, from the invite's raw `lastViewedAt`, unconditionally (not gated by `includeAnalytics`). This is the same categorization the owner-facing indicator text already exposes in plain language (see `contextual-invite-reminders` - "View-recency guidance"), so handing it to collaborators reveals nothing beyond what the feature's own copy already says. The raw `lastViewedAt` timestamp and `viewCount` stay exactly where they are today, inside the `includeAnalytics` (owner-only) block.

Alternative considered: flip `includeAnalytics: isOwner` to `includeAnalytics: true` wherever an authorized caller (owner or collaborator) reaches the `list` procedure. Rejected - directly violates the still-standing `wishlist-view-models` requirement that `viewCount`/`lastViewedAt` be absent from collaborator view models, and would also surface the raw "N vistas · last viewed at TIMESTAMP" block in `guest-row.tsx` to collaborators, which is out of scope.

Alternative considered: keep deriving the follow-up entirely server-side inside the `list` procedure (compute `kind`/`message`/`indicator` there instead of in `page.tsx`), so no view-recency signal of any kind crosses into the mapped invite. Rejected as unnecessary extra surgery for this change - it would require the `invite` router to also fetch wishlist event fields it doesn't otherwise need, and the coarse `viewRecency` category is already an intentionally-exposed signal per the spec text above.

**2. Move `lastFollowUpKind` out of the `includeAnalytics` bundle; leave `lastFollowUpCopiedAt` in it.**
`lastFollowUpKind` is needed unconditionally by `deriveInviteFollowUp`'s de-emphasis check (`sameStageCopied`) for both owner and collaborator, so it moves to always-present on `DashboardInviteViewModel`. `lastFollowUpCopiedAt` (the exact copy timestamp) is not read by any client-side logic - `page.tsx`/`guest-row.tsx` only need the derived `kind`/`label`/`message`/`indicator`/`emphasis` - so it stays inside `includeAnalytics`, unexposed to collaborators, minimizing what crosses the wire.

**3. `recordFollowUpCopy` authorizes with `getOwnedInvite` instead of `getOwnerInvite`.**
`getOwnedInvite` already exists and is exactly `assertWishlistAccess` without `requireOwner: true` - the same check `update`/`delete` use. No new authorization primitive needed; this is a one-line swap in `src/server/services/invite.service.ts`.

**4. `invite-follow-up.ts`'s `InviteFollowUpInput` takes `viewRecency: ViewRecency` instead of `lastViewedAt: string | null | undefined`.**
`followUpKindFor`'s `input.lastViewedAt ? "rsvp_reminder" : "invitation"` becomes `input.viewRecency !== "never" ? "rsvp_reminder" : "invitation"` (equivalent: "never" is the only category meaning not viewed). `deriveInviteFollowUp` uses `input.viewRecency` directly instead of calling `classifyViewRecency(input.lastViewedAt, input.now)` - the classification now happens once, server-side in the mapper, off the raw value. `classifyViewRecency` and `ViewRecency` stay exported from `invite-follow-up.ts` for the mapper to import; `now` stays on the input type (still needed for event-date/RSVP-deadline math elsewhere in the module).

**5. UI gates: replace `isOwner &&` with presence of `followUp` for the reminder block; leave every other `isOwner` gate untouched.**
`page.tsx` drops the `wishlist.isOwner ? deriveInviteFollowUp(...) : null` conditional and computes it whenever the invite is eligible (access to the page already implies owner-or-collaborator access, enforced upstream by `wishlist.overview`/`invite.list`). `guest-row.tsx`'s `{isOwner && followUp && (...)}` becomes `{followUp && (...)}`. The raw view-count/last-viewed block (`hasViewAnalytics`) and the RSVP-controls blocks keep their existing `isOwner`/field-presence gates unchanged.

## Risks / Trade-offs

- **[Risk]** A collaborator can now infer roughly when a guest last viewed their link (via the indicator text: "Vio los detalles recientemente" / "No se registró ninguna vista" / etc.), where before they saw nothing. → **Mitigation**: this is the explicit intent of the change (collaborators need this to know which reminder to send) and matches what the owner-facing copy already states in words; the exact count and timestamp remain owner-only.
- **[Risk]** `mapDashboardInvite` picking up a `Date.now()`-style call for recency classification introduces a second "now" alongside `page.tsx`'s own `now = new Date()`, which could disagree by milliseconds right at a 48h/14d boundary. → **Mitigation**: boundaries are day/48h-granularity: a few milliseconds of skew cannot flip the bucket in practice; no clock injection needed.
- **[Risk]** Existing tests assert the owner-only behavior at both the router (`invite.test.ts`) and service (`invite.service.test.ts`) layers, plus `page.test.tsx`/`guest-row.test.tsx` assert the `isOwner` gate. → **Mitigation**: tasks.md enumerates each test file to update; the "collaborator is rejected" cases become "collaborator succeeds" cases (a still-required "caller with no wishlist access is rejected" case stays, using a `wishlistFindFirst` mock that returns `null`).

## Migration Plan

No data migration - existing `Invite.lastFollowUpKind`/`lastFollowUpCopiedAt` columns are reused as-is. Deploy is a single code change; no rollout sequencing needed since access broadens on read/write together in the same deploy. Rollback is reverting the commit.
