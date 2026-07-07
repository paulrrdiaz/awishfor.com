## Why

Wizard step 5 currently satisfies the functional publish/share flow but does not visually match the authoritative Claude Design file (`A Wish For.dc.html`). This creates a weak final confidence moment: users are deciding whether to publish, so the final preview, auth gate, readiness cues, and success/share state need to be pixel-aligned with the design source.

## What Changes

- Rework `/create?step=publish` presentation to match the imported Claude Design `A Wish For.dc.html` step 5 frames for layout, typography, spacing, surfaces, copy hierarchy, and interaction states.
- Preserve the existing publish behavior: readiness checklist, authentication gate, disabled guest preview actions, full-page owner preview, publish mutation, and post-publish share actions.
- Make desktop step 5 use the designed two-pane wizard card treatment and mobile step 5 use the designed single-column/sticky-action treatment.
- Ensure the final embedded preview, readiness/auth panel, publish CTA, and success/share state use app design-system tokens and shared/ShadCN primitives.
- Add validation artifacts for visual parity: Storybook coverage and browser screenshots against the local app after importing/reviewing the Claude Design file.

## Capabilities

### New Capabilities
(none)

### Modified Capabilities
- `creation-wizard`: Final publish step requirements gain explicit pixel-alignment with the Claude Design `A Wish For.dc.html` step 5 frames across draft, signed-out auth gate, publish-ready, blocked-readiness, and success/share states.

## Impact

- Code: `src/components/features/wizard/publish-step.tsx`, shared wizard chrome/components as needed, publish-step Storybook stories if present or added.
- UI behavior: no API, database, auth, route, or mutation contract changes; this is a visual/interaction parity update for the existing publish step.
- Design dependency: implementation must import/review `A Wish For.dc.html` via the `claude_design` MCP (`https://api.anthropic.com/v1/design/mcp`, auth via `/design-login`) and treat it as authoritative. The MCP is not currently exposed in this session, so the implementation task must verify access before coding.
- Validation: local browser review at mobile and desktop sizes, plus `pnpm check`, `pnpm test`, and `pnpm typecheck`.
