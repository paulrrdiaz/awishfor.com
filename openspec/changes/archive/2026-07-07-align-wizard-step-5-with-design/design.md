## Context

The creation wizard already has five functional steps and the final publish step already covers readiness checks, auth gating, draft publishing, full-page preview entry, success sharing, QR download, and local-draft cleanup. The problem is visual and interaction fidelity: `/create?step=publish` does not match the authoritative Claude Design project file (`A Wish For.dc.html`) closely enough for the final pre-publish confidence moment.

Relevant current implementation seams:
- `src/components/features/wizard/publish-step.tsx` owns final preview, readiness checklist, auth prompt trigger, conflict modal, publish mutation, and success/share state.
- `src/components/features/wizard/publish-step.test.tsx` covers behavior.
- `src/components/features/wizard/wizard-states.stories.tsx` has wizard state stories but currently only exposes the publish auth gate, not the full publish step states.
- `src/components/shared/wizard-layout.tsx`, `wizard-stepper.tsx`, and `wizard-nav.tsx` provide shared chrome that must remain presentational.

The Claude Design MCP is not exposed in this session, so apply work must first import the project through `claude_design` and review `A Wish For.dc.html`. If that import is unavailable during implementation, do not approximate; stop and ask to configure/access the MCP.

## Goals / Non-Goals

**Goals:**
- Pixel-align the final publish step with the imported Claude Design step 5 frames across desktop and mobile.
- Preserve existing publish semantics: readiness remains blocking, signed-out publish opens auth gate, preview actions stay disabled, conflict resolution remains available, successful publish keeps the user on step 5 and shows share actions.
- Make the draft, blocked-readiness, publish-ready, signed-out auth gate, conflict, and success/share states visually coherent with the canvas.
- Add Storybook states and browser screenshot checks so step 5 can be reviewed without manually constructing every store/auth state.
- Keep implementation token-based and componentized with ShadCN/shared primitives.

**Non-Goals:**
- No publish API, tRPC router, database schema, Clerk, QR, WhatsApp share, or local draft persistence changes.
- No changes to wizard step ordering, route names, or readiness rules.
- No redesign of steps 1-4 except small shared-chrome adjustments required to keep step 5 consistent.
- No new design system dependency or external visual regression service.

## Decisions

**Use the Claude Design file as the source of exact layout tokens.** Import `A Wish For.dc.html` via the `claude_design` MCP and extract step 5 desktop/mobile dimensions, spacing, typography, colors, border radii, shadows, copy hierarchy, and state-specific composition. This is required because the existing repo docs describe product intent but not enough pixel-level details. Rejected alternative: infer from current steps 1-4 or docs only; that would repeat the mismatch the change is meant to fix.

**Refactor `PublishStep` into state-specific presentational sections without moving domain logic out prematurely.** Keep mutation/readiness/auth logic in `PublishStep`, but split visual sections into local presentational helpers such as preview frame, readiness card, final actions card, and success share panel when that improves parity and testability. Rejected alternative: a broad wizard architecture rewrite; risk is too high for a polish-focused change.

**Make Storybook the review harness for visual states.** Extend `wizard-states.stories.tsx` or add a focused publish-step story file with realistic store fixtures for blocked draft, ready signed-in, signed-out/auth gate, and success/share. Mock network/auth boundaries enough for static review. Rejected alternative: rely only on `/create?step=publish`; it makes edge-state review slow and inconsistent.

**Preserve semantic tokens and primitives even when matching exact colors.** Use app tokens (`bg-card`, `text-foreground`, `border-border`, `bg-primary`, etc.) and existing public preview/theme tokens unless the imported design introduces a step-local canvas backdrop that is already allowed by existing wizard requirements. Rejected alternative: hardcode one-off color utilities throughout `publish-step.tsx`; that conflicts with the current `creation-wizard` and `design-system` specs.

**Validate behavior separately from visuals.** Existing tests should continue covering publish readiness/auth/success behavior; add or update focused tests only if refactoring risks behavioral regression. Visual parity is validated by Storybook/browser screenshots at representative mobile and desktop widths after the design import.

## Risks / Trade-offs

- [Risk] Claude Design MCP remains unavailable during apply. Mitigation: stop before coding and ask for MCP access; do not approximate a pixel-perfect implementation from incomplete context.
- [Risk] Pixel alignment can regress existing publish behavior. Mitigation: keep domain logic unchanged, run existing `publish-step` tests, and manually verify readiness/auth/success flows.
- [Risk] Storybook fixtures may require auth/tRPC mocking. Mitigation: prefer presentational state seams or minimal provider mocks over weakening runtime code.
- [Risk] Shared wizard chrome edits could affect other steps. Mitigation: keep shared changes narrow, review steps 1-4 quickly after modifications, and prefer publish-step-local layout where possible.

## Migration Plan

No data migration or rollout sequencing is required. Ship as a UI-only update behind the existing `/create?step=publish` route. Rollback is reverting the component/story/test changes from this change.

## Open Questions

None for product behavior. Exact pixel values, state layouts, and any copy hierarchy refinements must come from the imported `A Wish For.dc.html` during apply.
