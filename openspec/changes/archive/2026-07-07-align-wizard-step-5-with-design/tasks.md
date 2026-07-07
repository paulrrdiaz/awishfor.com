## 1. Design Source Review

- [x] 1.1 Import the Claude Design project through the `claude_design` MCP (`https://api.anthropic.com/v1/design/mcp`, auth via `/design-login`) and open `A Wish For.dc.html`; if the MCP is unavailable, stop before coding and report the blocker.
- [x] 1.2 Extract the step 5 desktop and mobile frame details needed for implementation: dimensions, pane order, spacing, typography, colors/tokens, border radii, shadows, copy hierarchy, button hierarchy, preview frame treatment, auth gate treatment, blocked-readiness state, ready state, conflict state, and success/share state.

## 2. Publish Step Implementation

- [x] 2.1 Refactor `src/components/features/wizard/publish-step.tsx` into smaller presentational sections as needed while keeping publish/readiness/auth/conflict logic unchanged.
- [x] 2.2 Align the pre-publish draft layout with the imported step 5 design on desktop and mobile, including final preview placement, readiness panel, final actions, full-page preview affordance, and primary publish CTA.
- [x] 2.3 Align the blocked-readiness and publish-ready visual states with the imported design while preserving the existing readiness rules and Spanish copy requirements.
- [x] 2.4 Align the signed-out auth gate and conflict-resolution modal treatment with the imported design while preserving existing auth/conflict behavior.
- [x] 2.5 Align the post-publish success/share state with the imported design while preserving public URL display, copy-link, WhatsApp, QR download, public-list, and dashboard actions.
- [x] 2.6 Verify the embedded final preview still renders in preview mode with guest purchase actions disabled and no purchase mutations reachable.

## 3. Stories and Tests

- [x] 3.1 Add or extend Storybook coverage for publish step states: blocked draft, ready signed-in draft, signed-out/auth gate, conflict, and published success/share.
- [x] 3.2 Update `src/components/features/wizard/publish-step.test.tsx` only where refactoring affects behavior coverage, keeping readiness, auth gate, success/share, and non-mutating preview assertions intact.

## 4. Validation

- [x] 4.1 Compare local desktop and mobile renderings against the imported Claude Design step 5 frames and adjust until layout, spacing, typography, and state treatments match.
- [x] 4.2 Run `pnpm check`, `pnpm test`, and `pnpm typecheck`; fix regressions or report any remaining validation failures explicitly.
