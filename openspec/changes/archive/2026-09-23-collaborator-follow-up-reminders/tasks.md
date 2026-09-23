## 1. Follow-up derivation logic

- [x] 1.1 In `src/lib/dashboard/invite-follow-up.ts`, change `InviteFollowUpInput` to replace `lastViewedAt: string | null | undefined` with `viewRecency: ViewRecency`.
- [x] 1.2 Update `followUpKindFor` to use `input.viewRecency !== "never" ? "rsvp_reminder" : "invitation"` instead of the `lastViewedAt` truthiness check.
- [x] 1.3 Update `deriveInviteFollowUp` to read `input.viewRecency` directly instead of calling `classifyViewRecency(input.lastViewedAt, input.now)`.
- [x] 1.4 Update `src/lib/dashboard/invite-follow-up.test.ts` call sites that build `InviteFollowUpInput` to pass `viewRecency` (computed via `classifyViewRecency` in the test setup) instead of `lastViewedAt`.

## 2. Server: view model and authorization

- [x] 2.1 In `src/server/mappers/dashboard-invite.mapper.ts`, compute `viewRecency: classifyViewRecency(invite.lastViewedAt, new Date())` and include it unconditionally on the returned view model (not inside the `includeAnalytics` block).
- [x] 2.2 In the same mapper, move `lastFollowUpKind` out of the `includeAnalytics` block so it is always present; leave `lastFollowUpCopiedAt` inside the `includeAnalytics` block (owner-only), and leave `viewCount`/`lastViewedAt` inside it unchanged.
- [x] 2.3 In `src/server/mappers/view-models.ts`, update `DashboardInviteViewModel`: add `viewRecency: ViewRecency` (always present) and change `lastFollowUpKind` from optional/analytics-gated to always-present (`lastFollowUpKind: InviteFollowUpKind | null`); keep `viewCount?`, `lastViewedAt?`, `lastFollowUpCopiedAt?` as-is.
- [x] 2.4 In `src/server/services/invite.service.ts`, change `recordFollowUpCopy` to authorize via `getOwnedInvite` instead of `getOwnerInvite`.
- [x] 2.5 Update `src/server/mappers/dashboard-invite.mapper.test.ts` for the new unconditional `viewRecency`/`lastFollowUpKind` fields.
- [x] 2.6 Update `src/server/services/invite.service.test.ts`'s `recordFollowUpCopy` tests: keep/add a case for a collaborator succeeding, and a case for a caller with no wishlist access being rejected (replace the old owner-only-rejects-collaborator expectation).
- [x] 2.7 Update `src/server/api/routers/invite.test.ts`'s `inviteRouter.recordFollowUpCopy` tests: split the current "rejects collaborator and cross-wishlist copy attempts" test into a "collaborator succeeds" case (assert `invite.update` is called) and a "caller without wishlist access is rejected" case (keep `NOT_FOUND` assertion, keep the cross-wishlist case as-is).

## 3. Guests dashboard UI

- [x] 3.1 In `src/app/(protected)/dashboard/wishlists/[id]/guests/page.tsx`, remove the `wishlist.isOwner ? deriveInviteFollowUp(...) : null` conditional so `followUp` is computed for every eligible invite regardless of owner/collaborator, reading `invite.viewRecency` instead of `invite.lastViewedAt`.
- [x] 3.2 In `src/components/features/dashboard/guests/guest-row.tsx`, change the follow-up block's gate from `{isOwner && followUp && (...)}` to `{followUp && (...)}`. Leave the `hasViewAnalytics` raw view-count block and the `isOwner &&`-gated RSVP-controls blocks unchanged.
- [x] 3.3 Check `src/components/layouts/dashboard/mobile/mobile-guest-rsvp-card.tsx` and any other mobile guest card usage for an `isOwner`-gated follow-up control path; if the follow-up control is only reachable through `guest-row.tsx` already, no separate change is needed there - confirm and note the outcome. **Outcome: confirmed — `mobile-guest-rsvp-card.tsx` only renders RSVP recording UI, no follow-up control; the follow-up block lives solely in `guest-row.tsx`, already fixed in 3.2. No change needed.**
- [x] 3.4 Update `src/app/(protected)/dashboard/wishlists/[id]/guests/page.test.tsx` to cover a collaborator receiving `followUp` data (not just the owner).
- [x] 3.5 Update `src/components/features/dashboard/guests/guest-row.test.tsx` to cover the follow-up control rendering for `isOwner={false}` when `followUp` is present, alongside existing owner coverage.
- [x] 3.6 Update `src/components/features/dashboard/guests/contextual-follow-up-copy-control.test.tsx` if it asserts owner-only behavior at the component level. **Outcome: confirmed — this component has no owner/collaborator concept at all (no `isOwner` prop, no gating); no change needed.**

## 4. Spec sync and validation

- [x] 4.1 Run `openspec validate --change collaborator-follow-up-reminders --strict` and fix any reported issues. **Result: valid.**
- [x] 4.2 Run `pnpm check`, `pnpm test`, and `pnpm typecheck`; report and fix any failures before closing the session. **Result: `pnpm check` clean (1 file auto-formatted); `pnpm typecheck` clean; `pnpm test` 1543/1544 passing — the 1 failure (`rsvp-section.test.tsx` timezone-dependent date-display test) is pre-existing on `main`, confirmed unrelated via `git stash`.**
- [x] 4.3 Update `docs/TASKS.md` milestone entries that reference the contextual-invite-reminders/guest-invite-management owner-only scope, marking the corresponding item(s) complete or updating the description to reflect collaborator access.
