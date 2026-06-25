## Why

This repo already uses OpenSpec, but the workflow guidance is too thin to keep proposal, implementation, and archive behavior consistent across sessions. We need explicit repo-level instructions so OpenSpec artifacts always use the same context, validation gates, and communication style.

## What Changes

- Add shared OpenSpec project context and artifact rules in `openspec/config.yaml`.
- Require proposal work to review relevant `docs/` files, prefer CodeGraph for structural repo questions, and use `/grill-me` only when ambiguity remains after repo and docs review.
- Require apply work to read OpenSpec artifacts plus relevant `docs/` context, prefer CodeGraph for structural repo analysis, and always run `pnpm check`, `pnpm test`, and `pnpm typecheck` before closing the session.
- Require archive work to warn on incomplete tasks, confirm with the user, then mark remaining tasks complete before archiving.
- Document `/caveman` as the default response style for `opsx:propose`, `opsx:apply`, and `opsx:archive`.

## Capabilities

### New Capabilities
- `openspec-workflow-guidance`: Standardize repo-level OpenSpec behavior for proposal, apply, and archive flows.

### Modified Capabilities

## Impact

- `openspec/config.yaml`
- `CLAUDE.md`
- `.cursor/rules/codegraph.mdc`
- OpenSpec artifact generation quality and consistency
- Apply/archive operating procedure for future changes
